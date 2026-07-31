import { v, ConvexError } from "convex/values"
import { mutation, internalMutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import { internal } from "./_generated/api"
import { requireAdminForWrite } from "./lib/auth"
import { counterKeys, setCounter } from "./lib/counters"

// Counter repair — the obligation lib/counters.ts records and defers.
//
// Denormalized counts drift. A mutation that throws between two bumps, a row
// hand-edited in the Convex dashboard, a write path added without its counter:
// each leaves the stat tiles quietly wrong, and without this there is no way
// back except arithmetic by hand.
//
// ── Why it is batched ──────────────────────────────────────────────────────
//
// A Convex mutation is one transaction with hard limits on documents and bytes
// read. Recounting means reading every row of four tables, which is exactly the
// shape of work that outgrows a single transaction — and it outgrows it at the
// size where recounting matters, so an unbatched version would work in testing
// and fail in production. Each batch reads one page, adds to a running tally,
// and schedules the next batch in a fresh transaction.
//
// The tally rides along in the scheduler arguments rather than in a scratch
// table. It is at most six numbers per table, far under the scheduled-argument
// budget, and it means a run leaves nothing behind to clean up if it dies.
//
// Page size is bounded by BYTES as well as rows. Scholarship applications carry
// free-text essays, so document sizes vary by an order of magnitude and a fixed
// row count would be sized for either the small case (slow) or the large case
// (over the limit). maximumBytesRead makes the page end early when it is full,
// and continueCursor resumes exactly where it stopped.
//
// ── What it does NOT guarantee ─────────────────────────────────────────────
//
// This is not a snapshot. Batches are separate transactions, so a row whose
// status changes after its page was read is tallied under the status it had at
// read time, and the live bumpCounter for that change applies to the pre-repair
// value that the final write then overwrites. The window is one run, the error
// is at most a few counts, and running it again converges.
//
// The honest summary: run it when the admin queue is quiet, and treat the
// result as correct-as-of rather than exact. Making it truly atomic would mean
// reading whole tables in one transaction, which is the thing that cannot be
// done.

const MAX_ROWS_PER_BATCH = 500

// Two of the eight-megabyte read budget, leaving room for the counter writes,
// the scheduler call, and the usual margin for documents at the large end.
const MAX_BYTES_PER_BATCH = 2 * 1024 * 1024

const REVIEW_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "needs_info",
] as const

const DONATION_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "failed",
  "refunded",
] as const

const HELP_STATUSES = ["new", "contacted", "converted", "closed"] as const

// Processed in this order, one table per chain segment.
const TABLES = [
  "applications",
  "spotlightApplications",
  "donations",
  "helpInterests",
] as const

type TableName = (typeof TABLES)[number]

const tableValidator = v.union(
  v.literal("applications"),
  v.literal("spotlightApplications"),
  v.literal("donations"),
  v.literal("helpInterests"),
)

// Every key a given table owns, including the ones that will come back zero.
// Enumerating them is the point: a bucket that dropped to zero still has a stale
// row to correct, and a tally alone would never mention it.
function keysFor(table: TableName): string[] {
  switch (table) {
    case "applications":
      return REVIEW_STATUSES.map(counterKeys.applicationsByStatus)
    case "spotlightApplications":
      return [
        ...REVIEW_STATUSES.map(counterKeys.spotlightByStatus),
        counterKeys.spotlightFeatured(),
      ]
    case "donations":
      return DONATION_STATUSES.map(counterKeys.donationsByStatus)
    case "helpInterests":
      return HELP_STATUSES.map(counterKeys.helpInterestsByStatus)
  }
}

async function tallyPage(
  ctx: MutationCtx,
  table: TableName,
  cursor: string | null,
  tallies: Record<string, number>,
): Promise<{ isDone: boolean; continueCursor: string }> {
  const add = (key: string) => {
    tallies[key] = (tallies[key] ?? 0) + 1
  }

  const opts = {
    numItems: MAX_ROWS_PER_BATCH,
    cursor,
    maximumBytesRead: MAX_BYTES_PER_BATCH,
  }

  // The switch is per-table rather than generic because each table counts a
  // different thing, and spotlightApplications counts two.
  switch (table) {
    case "applications": {
      const page = await ctx.db.query("applications").paginate(opts)
      for (const row of page.page) add(counterKeys.applicationsByStatus(row.status))
      return page
    }
    case "spotlightApplications": {
      const page = await ctx.db.query("spotlightApplications").paginate(opts)
      for (const row of page.page) {
        add(counterKeys.spotlightByStatus(row.status))
        if (row.isFeatured === true) add(counterKeys.spotlightFeatured())
      }
      return page
    }
    case "donations": {
      const page = await ctx.db.query("donations").paginate(opts)
      for (const row of page.page) add(counterKeys.donationsByStatus(row.status))
      return page
    }
    case "helpInterests": {
      const page = await ctx.db.query("helpInterests").paginate(opts)
      for (const row of page.page) add(counterKeys.helpInterestsByStatus(row.status))
      return page
    }
  }
}

// One segment of the chain: tally a page, then either continue this table or
// commit its totals and move to the next.
export const recomputeBatch = internalMutation({
  args: {
    table: tableValidator,
    cursor: v.union(v.string(), v.null()),
    tallies: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const tallies = { ...args.tallies }
    const { isDone, continueCursor } = await tallyPage(
      ctx,
      args.table,
      args.cursor,
      tallies,
    )

    if (!isDone) {
      await ctx.scheduler.runAfter(0, internal.maintenance.recomputeBatch, {
        table: args.table,
        cursor: continueCursor,
        tallies,
      })
      return null
    }

    // Table fully scanned — write its totals, zeros included.
    for (const key of keysFor(args.table)) {
      await setCounter(ctx, key, tallies[key] ?? 0)
    }

    const next = TABLES[TABLES.indexOf(args.table) + 1]
    if (next) {
      await ctx.scheduler.runAfter(0, internal.maintenance.recomputeBatch, {
        table: next,
        cursor: null,
        // Tallies do not carry across tables: each table's keys are disjoint and
        // its totals were just committed.
        tallies: {},
      })
    }

    return null
  },
})

// Operator entry point. Returns as soon as the chain is scheduled rather than
// waiting for it — the whole reason for the chain is that the work does not fit
// in this transaction, so it cannot be awaited from inside one.
//
// Any admin may run it. It only ever moves a counter toward what the tables
// actually say, so the blast radius of a mistaken run is a brief flicker in the
// stat tiles, and gating it behind super_admin would mean the person looking at
// a wrong dashboard often cannot fix it.
export const recomputeCounters = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdminForWrite(ctx)

    await ctx.scheduler.runAfter(0, internal.maintenance.recomputeBatch, {
      table: TABLES[0],
      cursor: null,
      tallies: {},
    })

    await ctx.db.insert("adminActivityLog", {
      adminId: admin._id,
      actionType: "counter_recompute",
      entityType: "counters",
      entityId: "all",
      oldValue: null,
      newValue: null,
    })

    return { started: true }
  },
})

// ---------------------------------------------------------------------------
// Orphaned file sweep
// ---------------------------------------------------------------------------
//
// Counterpart to the deliberate non-deletion in documents.ts. An upload that is
// never attached — the student closed the tab, or the file failed type/size
// validation — leaves bytes in `_storage` that no row references. The attach
// mutation cannot clean those up itself: it is handed a storageId by the client
// and `_storage` records no uploader, so a delete there would let any student
// destroy another student's file by naming its id. Read the block comment on
// validateStoredFile before changing any of this.
//
// So collection happens here instead, where the decision is made from our own
// data rather than from an argument: an object is deleted only if NO document
// row in either table points at it, and only once it is old enough that it
// cannot be an upload still on its way to an attach.
//
// The age threshold is the whole safety margin. An object uploaded seconds ago
// is indistinguishable from an abandoned one by reachability alone, because the
// attach that will reference it has not run yet. Twenty-four hours is far
// beyond any legitimate gap between the two calls.
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000

const MAX_FILES_PER_SWEEP_BATCH = 200

export const sweepOrphanedFilesBatch = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    olderThan: v.number(),
    deleted: v.number(),
  },
  handler: async (ctx, args) => {
    // The system table is paginated like any other, so the sweep is bounded per
    // transaction and resumes on a cursor.
    const page = await ctx.db.system.query("_storage").paginate({
      numItems: MAX_FILES_PER_SWEEP_BATCH,
      cursor: args.cursor,
    })

    let deleted = args.deleted

    for (const file of page.page) {
      // olderThan is passed in from the scheduling mutation rather than read
      // from the clock here, so every batch in a run uses one consistent
      // cutoff instead of drifting later as the run proceeds.
      if (file._creationTime >= args.olderThan) continue

      const referencedByApplication = await ctx.db
        .query("applicationDocuments")
        .withIndex("by_storageId", (q) => q.eq("storageId", file._id))
        .first()
      if (referencedByApplication) continue

      const referencedBySpotlight = await ctx.db
        .query("spotlightDocuments")
        .withIndex("by_storageId", (q) => q.eq("storageId", file._id))
        .first()
      if (referencedBySpotlight) continue

      // Unreferenced and old enough. This id came from our own scan of
      // `_storage`, not from a caller, which is what makes deleting it safe.
      await ctx.storage.delete(file._id)
      deleted++
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.maintenance.sweepOrphanedFilesBatch,
        { cursor: page.continueCursor, olderThan: args.olderThan, deleted },
      )
    }

    return { deleted }
  },
})

export const sweepOrphanedFiles = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdminForWrite(ctx)

    const olderThan = Date.now() - ORPHAN_MIN_AGE_MS

    await ctx.scheduler.runAfter(
      0,
      internal.maintenance.sweepOrphanedFilesBatch,
      { cursor: null, olderThan, deleted: 0 },
    )

    await ctx.db.insert("adminActivityLog", {
      adminId: admin._id,
      actionType: "orphan_file_sweep",
      entityType: "storage",
      entityId: "all",
      oldValue: null,
      newValue: { olderThan },
    })

    return { started: true }
  },
})

// Escape hatch for the case the chain cannot cover: a counter key that no table
// owns any more, left behind by a renamed or removed bucket. keysFor only knows
// about live keys, so nothing else will ever zero one of these.
export const deleteCounterKey = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    await requireAdminForWrite(ctx)

    const row = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique()

    if (!row) throw new ConvexError(`No counter with key ${args.key}`)

    await ctx.db.delete("counters", row._id)
    return null
  },
})
