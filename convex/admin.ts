import { v, ConvexError } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import type { PaginationOptions } from "convex/server"
import { query, mutation } from "./_generated/server"
import type { QueryCtx, MutationCtx } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import { requireAdmin, requireAdminForWrite } from "./lib/auth"
import { counterKeys, readCounter, bumpCounter } from "./lib/counters"

// Admin-facing reads. Every handler calls requireAdmin first — Convex has no
// row-level security and proxy.ts route matching is only a UX affordance, so
// this call is the actual access control for the whole admin surface.
//
// Lists are paginated rather than offset-based. The Supabase routes used
// .range(from, to) with a "page N of M" UI, which needs a total count; counting
// means reading every matching row, which defeats the pagination. Cursor
// pagination plus load-more is both cheaper and better UX for a review queue.
// The UI change lands in Phase 2b.

const reviewStatus = v.union(
  v.literal("pending"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_info"),
)

const MAX_DOCUMENTS = 32
const MAX_FEATURED = 100

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

// Five indexed point reads against the counters table rather than five counting
// scans — see lib/counters.ts for why, and for what Phase 3 owes these.
//
// /admin does not call this directly; it calls `overview` below, which returns
// these counts alongside recent activity in a single read. This stays exported
// as the standalone counts, for a caller that wants the tiles without the log.
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const [
      pendingApplications,
      pendingSpotlight,
      newHelpInterests,
      pendingDonations,
      featuredStudents,
    ] = await Promise.all([
      readCounter(ctx, counterKeys.applicationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightByStatus("pending")),
      readCounter(ctx, counterKeys.helpInterestsByStatus("new")),
      readCounter(ctx, counterKeys.donationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightFeatured()),
    ])

    return {
      // The tile is a single "needs review" number covering both queues, which
      // is how the Supabase route summed it too.
      pendingApplications: pendingApplications + pendingSpotlight,
      newHelpInterests,
      pendingDonations,
      featuredStudents,
    }
  },
})

// The /admin landing page, in one read.
//
// It used to issue two fetches — stats and the ten most recent activity rows.
// The rendering plan allows one preloadQuery per page because multiple preloads
// are not consistency-guaranteed with each other, so they are merged here.
//
// This wraps `stats` rather than replacing it, and does NOT reuse activityLog:
// that query is paginated, and this needs a fixed, small slice. Folding a
// paginated query into a page that wants ten rows would mean shipping cursor
// machinery for no benefit.
const RECENT_ACTIVITY = 10

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const [
      pendingApplications,
      pendingSpotlight,
      newHelpInterests,
      pendingDonations,
      featuredStudents,
      recent,
    ] = await Promise.all([
      readCounter(ctx, counterKeys.applicationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightByStatus("pending")),
      readCounter(ctx, counterKeys.helpInterestsByStatus("new")),
      readCounter(ctx, counterKeys.donationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightFeatured()),
      ctx.db.query("adminActivityLog").order("desc").take(RECENT_ACTIVITY),
    ])

    const adminCache = new Map<Id<"admins">, { name: string; email: string }>()
    const recentActivity = await Promise.all(
      recent.map(async (entry) => {
        let who = adminCache.get(entry.adminId)
        if (!who) {
          const admin = await ctx.db.get("admins", entry.adminId)
          who = admin
            ? { name: admin.name ?? admin.email, email: admin.email }
            : { name: "Unknown", email: "" }
          adminCache.set(entry.adminId, who)
        }
        return { ...entry, admin: who }
      }),
    )

    return {
      stats: {
        pendingApplications: pendingApplications + pendingSpotlight,
        newHelpInterests,
        pendingDonations,
        featuredStudents,
      },
      recentActivity,
    }
  },
})

// ---------------------------------------------------------------------------
// Scholarship applications
// ---------------------------------------------------------------------------

export const applications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(reviewStatus),
    applicationType: v.optional(
      v.union(v.literal("first-year"), v.literal("second-year")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    // A search index narrows on its declared filterFields, so status and type
    // ride along inside the search rather than being filtered afterwards.
    // Results come back by relevance; a search index cannot also be ordered.
    if (search) {
      return await ctx.db
        .query("applications")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.applicationType) {
            builder = builder.eq("applicationType", args.applicationType)
          }
          return builder
        })
        .paginate(args.paginationOpts)
    }

    // by_status is (status, _creationTime), so descending yields newest-first
    // within the selected status — what the review queue wants.
    if (args.status) {
      const byStatus = ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      // Type is an extra predicate this index cannot express. Filtering after
      // the index scan is the documented fallback; it narrows the page without
      // reducing rows read, which is acceptable at review-queue scale.
      return await (args.applicationType
        ? byStatus.filter((q) =>
            q.eq(q.field("applicationType"), args.applicationType!),
          )
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.applicationType) {
      return await ctx.db
        .query("applications")
        .withIndex("by_applicationType", (q) =>
          q.eq("applicationType", args.applicationType!),
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("applications")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const application = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    // null, not a throw, so the Server Component can render a real 404 via
    // notFound() rather than an error boundary. Same reasoning as the student
    // detail queries.
    const app = await ctx.db.get("applications", args.applicationId)
    if (!app) return null

    const docs = await ctx.db
      .query("applicationDocuments")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", app._id))
      .take(MAX_DOCUMENTS)

    // Metadata without URLs. Admins reviewing Aadhaar cards and bank passbooks
    // are exactly the case the Phase 4 storage decision is about; minting a
    // permanent ctx.storage.getUrl() here would pre-empt it.
    return {
      ...app,
      student: await studentSummary(ctx, app.studentId),
      documents: docs.map((doc) => ({
        _id: doc._id,
        _creationTime: doc._creationTime,
        documentType: doc.documentType,
        storageId: doc.storageId,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      })),
    }
  },
})

// ---------------------------------------------------------------------------
// Spotlight applications
// ---------------------------------------------------------------------------

export const spotlightApplications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(reviewStatus),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("spotlightApplications")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.isFeatured !== undefined) {
            builder = builder.eq("isFeatured", args.isFeatured)
          }
          return builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      const byStatus = ctx.db
        .query("spotlightApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      return await (args.isFeatured !== undefined
        ? byStatus.filter((q) => q.eq(q.field("isFeatured"), args.isFeatured!))
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.isFeatured !== undefined) {
      // by_isFeatured, not by_isFeatured_and_featuredOrder: this list is ranked
      // newest-first like every other filter on this screen, and the _and_
      // variant would rank by display order instead.
      return await ctx.db
        .query("spotlightApplications")
        .withIndex("by_isFeatured", (q) => q.eq("isFeatured", args.isFeatured!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("spotlightApplications")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const spotlightApplication = query({
  args: { spotlightApplicationId: v.id("spotlightApplications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const app = await ctx.db.get(
      "spotlightApplications",
      args.spotlightApplicationId,
    )
    if (!app) return null

    const docs = await ctx.db
      .query("spotlightDocuments")
      .withIndex("by_spotlightApplicationId", (q) =>
        q.eq("spotlightApplicationId", app._id),
      )
      .take(MAX_DOCUMENTS)

    return {
      ...app,
      student: await studentSummary(ctx, app.studentId),
      documents: docs.map((doc) => ({
        _id: doc._id,
        _creationTime: doc._creationTime,
        documentType: doc.documentType,
        storageId: doc.storageId,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      })),
    }
  },
})

// ---------------------------------------------------------------------------
// Featured students (the reorder screen)
// ---------------------------------------------------------------------------

type FeaturedRow = {
  id: string
  displayId: string
  fullName: string
  email: string
  story: string | null
  annualNeed: number | null
  isFeatured: boolean
  featuredAt: number | null
  order: number | null
  status: string
  source: "scholarship" | "spotlight"
  photoUrl: string | null
}

export const featured = query({
  args: {},
  handler: async (ctx): Promise<FeaturedRow[]> => {
    await requireAdmin(ctx)

    const scholarship = await ctx.db
      .query("applications")
      .withIndex("by_spotlightEnabled_and_spotlightOrder", (q) =>
        q.eq("spotlightEnabled", true),
      )
      .take(MAX_FEATURED)

    const spotlight = await ctx.db
      .query("spotlightApplications")
      .withIndex("by_isFeatured_and_featuredOrder", (q) =>
        q.eq("isFeatured", true),
      )
      .take(MAX_FEATURED)

    const scholarshipRows: FeaturedRow[] = scholarship.map((s) => ({
      id: s._id,
      displayId: s.applicationId,
      fullName: s.fullName,
      email: s.email,
      story: s.spotlightStory ?? null,
      annualNeed: s.spotlightAnnualNeed ?? null,
      isFeatured: s.spotlightEnabled ?? false,
      featuredAt: s.spotlightEnabledAt ?? null,
      order: s.spotlightOrder ?? null,
      status: s.status,
      source: "scholarship",
      photoUrl: null,
    }))

    const spotlightRows: FeaturedRow[] = await Promise.all(
      spotlight.map(async (s) => {
        // The Supabase table had a photo_url column; the Convex schema does not
        // carry one, so the photo comes from the documents table like it does
        // in featured.ts. This is a public-facing photo, so a plain storage URL
        // is the agreed treatment.
        const photo = await ctx.db
          .query("spotlightDocuments")
          .withIndex("by_spotlightApplicationId_and_documentType", (q) =>
            q.eq("spotlightApplicationId", s._id).eq("documentType", "photo"),
          )
          .first()

        return {
          id: s._id,
          displayId: s.spotlightId,
          fullName: s.fullName,
          email: s.email,
          story: s.backgroundStory,
          annualNeed: s.annualFinancialNeed,
          isFeatured: s.isFeatured ?? false,
          featuredAt: s.featuredAt ?? null,
          order: s.featuredOrder ?? null,
          status: s.status,
          source: "spotlight" as const,
          photoUrl: photo ? await ctx.storage.getUrl(photo.storageId) : null,
        }
      }),
    )

    // Unset order sorts last, matching the route's nullsFirst: false.
    return [...scholarshipRows, ...spotlightRows].sort((a, b) => {
      if (a.order === null && b.order === null) return 0
      if (a.order === null) return 1
      if (b.order === null) return -1
      return a.order - b.order
    })
  },
})

// ---------------------------------------------------------------------------
// Donations and help interests
// ---------------------------------------------------------------------------

export const donations = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("donations")
        .withSearchIndex("search_all", (q) => {
          const builder = q.search("searchText", search)
          return args.status ? builder.eq("status", args.status) : builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      return await ctx.db
        .query("donations")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("donations")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const helpInterests = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("converted"),
        v.literal("closed"),
      ),
    ),
    helpType: v.optional(
      v.union(
        v.literal("donate"),
        v.literal("volunteer"),
        v.literal("corporate"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("helpInterests")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.helpType) builder = builder.eq("helpType", args.helpType)
          return builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      const byStatus = ctx.db
        .query("helpInterests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      return await (args.helpType
        ? byStatus.filter((q) => q.eq(q.field("helpType"), args.helpType!))
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.helpType) {
      return await ctx.db
        .query("helpInterests")
        .withIndex("by_helpType", (q) => q.eq("helpType", args.helpType!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("helpInterests")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export const activityLog = query({
  args: {
    paginationOpts: paginationOptsValidator,
    actionType: v.optional(v.string()),
    entityType: v.optional(v.string()),
    adminId: v.optional(v.id("admins")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const result = await paginateActivityLog(ctx, args)

    // Enrich just the page, not the whole table. An activity row stores adminId
    // only, and the log viewer shows who did it.
    const adminCache = new Map<Id<"admins">, { name: string; email: string }>()
    const page = await Promise.all(
      result.page.map(async (entry) => {
        let who = adminCache.get(entry.adminId)
        if (!who) {
          const admin = await ctx.db.get("admins", entry.adminId)
          who = admin
            ? { name: admin.name ?? admin.email, email: admin.email }
            : { name: "Unknown", email: "" }
          adminCache.set(entry.adminId, who)
        }
        return { ...entry, admin: who }
      }),
    )

    return { ...result, page }
  },
})

async function paginateActivityLog(
  ctx: QueryCtx,
  args: {
    paginationOpts: PaginationOptions
    actionType?: string
    entityType?: string
    adminId?: Id<"admins">
  },
) {
  // Pick the index by whichever filter is present and most selective: a
  // specific admin narrows harder than an action type, which narrows harder
  // than an entity type. Whatever the index does not cover becomes a chained
  // .filter(), which ANDs and returns the same query type.
  const base = args.adminId
    ? ctx.db
        .query("adminActivityLog")
        .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId!))
    : args.actionType
      ? ctx.db
          .query("adminActivityLog")
          .withIndex("by_actionType", (q) => q.eq("actionType", args.actionType!))
      : args.entityType
        ? // by_entityType_and_entityId, queried on its first field only.
          ctx.db
            .query("adminActivityLog")
            .withIndex("by_entityType_and_entityId", (q) =>
              q.eq("entityType", args.entityType!),
            )
        : ctx.db.query("adminActivityLog")

  let q = base.order("desc")
  if (args.actionType && args.adminId) {
    q = q.filter((f) => f.eq(f.field("actionType"), args.actionType!))
  }
  if (args.entityType && (args.adminId || args.actionType)) {
    q = q.filter((f) => f.eq(f.field("entityType"), args.entityType!))
  }

  return await q.paginate(args.paginationOpts)
}

// Populates the activity log's "filter by admin" dropdown. Split out of
// activityLog because that query is paginated and this list is not — folding a
// full-table read into a paginated query would defeat the pagination.
export const admins = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const rows = await ctx.db.query("admins").take(200)
    return rows.map((a) => ({
      _id: a._id,
      name: a.name ?? null,
      email: a.email,
      role: a.role,
    }))
  },
})

// ---------------------------------------------------------------------------

// The reviewer needs to know whose application this is. Projected rather than
// returned whole: the students row carries address and phone that the review
// screens do not display.
async function studentSummary(ctx: QueryCtx, studentId: Id<"students">) {
  const student: Doc<"students"> | null = await ctx.db.get("students", studentId)
  if (!student) return null
  return {
    _id: student._id,
    email: student.email,
    fullName: student.fullName ?? null,
    phone: student.phone ?? null,
  }
}

// ---------------------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------------------
//
// These are the Phase 3 counterparts to the reads above, kept in the same file
// on purpose. Every one of them maintains a denormalized counter, and the way
// those counters go wrong is that someone adds or edits a write path without
// noticing there is a counter behind it. Reading `readCounter` two hundred
// lines up makes that hard to miss; a separate adminMutations.ts would not.
//
// Three invariants hold across all of them:
//
//   1. requireAdminForWrite, not requireAdmin — the write guards also bind a
//      pre-authorized (email-seeded) admin row to its Clerk ids on first use.
//   2. A status transition bumps BOTH halves, decrementing the bucket the row
//      is leaving as well as incrementing the one it enters.
//   3. searchText is NOT recomputed. It is built from fullName / email / the
//      human-readable id, and nothing here edits those. If a future write path
//      does touch one of them, it must recompute via lib/search.ts or the admin
//      lists go stale — see the note at the bottom of this section.
//
// None of them return the updated document. The lists and detail pages are live
// Convex subscriptions, so the new value arrives on its own; returning it would
// invite exactly the client-side optimistic update Phase 2b deleted.

const donationStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("refunded"),
)

const helpInterestStatus = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("converted"),
  v.literal("closed"),
)

// entityType / actionType are the strings the activity-log UI already switches
// on (app/admin/activity-log/page.tsx and AdminOverviewContent.tsx). They are
// carried over from the Supabase routes verbatim; changing one silently drops
// its rows into the "unknown action" branch of that UI.
async function logActivity(
  ctx: MutationCtx,
  adminId: Id<"admins">,
  actionType: string,
  entityType: string,
  entityId: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> {
  await ctx.db.insert("adminActivityLog", {
    adminId,
    actionType,
    entityType,
    entityId,
    oldValue,
    newValue,
  })
}

// The Supabase scholarship route logged 'status_change' whenever a status was
// *supplied*, even when it matched what was already there — so re-saving a form
// without touching the dropdown produced a status-change entry with identical
// old and new values. The spotlight route got this right by comparing first.
// All four below use the comparing form: a status change is logged when the
// status actually changes.
function reviewAction(changed: boolean): string {
  return changed ? "status_change" : "notes_update"
}

// Which applicant email a status change should send, or null for none.
//
// pending is deliberately absent. The review dropdown does not offer it, and
// moving a row back to pending is an internal correction rather than news the
// applicant needs. Exhaustive over the status union, so adding a review status
// fails to compile here rather than silently sending nothing.
function statusEmailKind(
  status: Doc<"applications">["status"],
): "under_review" | "needs_info" | "approved" | "rejected" | null {
  switch (status) {
    case "under_review":
      return "under_review"
    case "needs_info":
      return "needs_info"
    case "approved":
      return "approved"
    case "rejected":
      return "rejected"
    case "pending":
      return null
  }
}

export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    status: v.optional(reviewStatus),
    reviewerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)

    const current = await ctx.db.get("applications", args.id)
    if (!current) throw new ConvexError("Application not found")

    // needs_info without a note is an unanswerable request. The applicant is
    // told to change something and never told what — true on the dashboard
    // banner before this, and now true in an email that asks them to act.
    //
    // Checked against the status this write RESULTS IN, and against the note it
    // results in, so it also catches clearing the note on a row already sitting
    // in needs_info. Thrown before the patch, so nothing is written and no
    // email is scheduled.
    const nextStatus = args.status ?? current.status
    if (nextStatus === "needs_info") {
      const note = (args.reviewerNotes ?? current.reviewerNotes ?? "").trim()
      if (!note) {
        throw new ConvexError(
          "Add a reviewer note before setting this to Needs Info. The note is emailed to the applicant and is the only thing telling them what to fix.",
        )
      }
    }

    const now = Date.now()
    const patch: Partial<Doc<"applications">> = { updatedAt: now }

    if (args.status !== undefined) {
      patch.status = args.status
      patch.reviewedBy = admin._id
      patch.reviewedAt = now
    }
    if (args.reviewerNotes !== undefined) {
      patch.reviewerNotes = args.reviewerNotes
    }

    await ctx.db.patch("applications", args.id, patch)

    const statusChanged =
      args.status !== undefined && args.status !== current.status
    if (statusChanged) {
      await bumpCounter(
        ctx,
        counterKeys.applicationsByStatus(current.status),
        -1,
      )
      await bumpCounter(ctx, counterKeys.applicationsByStatus(args.status!), 1)
    }

    await logActivity(
      ctx,
      admin._id,
      reviewAction(statusChanged),
      "application",
      args.id,
      { status: current.status, reviewerNotes: current.reviewerNotes },
      {
        status: args.status ?? current.status,
        reviewerNotes: args.reviewerNotes ?? current.reviewerNotes,
      },
    )

    // Notify the applicant, but only when the status actually moved. Saving the
    // same status again, or editing only the reviewer's note, deliberately
    // sends nothing — otherwise correcting a typo in the note would fire a
    // second "we need more information" email at someone already acting on the
    // first one.
    //
    // Scheduled from inside this transaction, so it inherits the write's fate:
    // if the patch above rolls back, no email is sent for a decision that never
    // landed. And because the send happens afterwards in an action, a Resend
    // outage can never fail the status change itself.
    if (statusChanged) {
      const kind = statusEmailKind(args.status!)
      if (kind) {
        await ctx.scheduler.runAfter(0, internal.email.sendApplicationEmail, {
          kind,
          to: current.email,
          recipientName: current.fullName,
          applicationId: current.applicationId,
          applicationDocId: args.id,
          applicationType: current.applicationType,
          academicYear: current.academicYear,
          // The note as it will stand after this write, not as it was before.
          reviewerNotes: args.reviewerNotes ?? current.reviewerNotes,
        })
      }
    }

    return null
  },
})

export const updateSpotlightApplication = mutation({
  args: {
    id: v.id("spotlightApplications"),
    status: v.optional(reviewStatus),
    reviewerNotes: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)

    const current = await ctx.db.get("spotlightApplications", args.id)
    if (!current) throw new ConvexError("Spotlight application not found")

    const now = Date.now()
    const patch: Partial<Doc<"spotlightApplications">> = { updatedAt: now }

    if (args.status !== undefined) {
      patch.status = args.status
      patch.reviewedBy = admin._id
      patch.reviewedAt = now
    }
    if (args.reviewerNotes !== undefined) {
      patch.reviewerNotes = args.reviewerNotes
    }
    if (args.isFeatured !== undefined) {
      patch.isFeatured = args.isFeatured
      // Passing undefined in a patch REMOVES the field, which is the Convex
      // equivalent of the old `featured_at = null` on un-featuring.
      patch.featuredAt = args.isFeatured ? now : undefined
    }

    await ctx.db.patch("spotlightApplications", args.id, patch)

    const statusChanged =
      args.status !== undefined && args.status !== current.status
    if (statusChanged) {
      await bumpCounter(ctx, counterKeys.spotlightByStatus(current.status), -1)
      await bumpCounter(ctx, counterKeys.spotlightByStatus(args.status!), 1)
    }

    // isFeatured is v.optional(v.boolean()), so "not featured" is spelled two
    // ways: absent, or present-and-false. Both normalize to false before the
    // comparison, otherwise un-featuring a row that never had the field set
    // would look like a change and decrement a counter that was never
    // incremented.
    const wasFeatured = current.isFeatured === true
    const nowFeatured = args.isFeatured === true
    const featuredChanged =
      args.isFeatured !== undefined && nowFeatured !== wasFeatured
    if (featuredChanged) {
      await bumpCounter(ctx, counterKeys.spotlightFeatured(), nowFeatured ? 1 : -1)
    }

    // Status wins when both changed: it is the more consequential edit, and the
    // old route resolved the tie the same way.
    const actionType = statusChanged
      ? "status_change"
      : featuredChanged
        ? "featured_change"
        : "notes_update"

    await logActivity(
      ctx,
      admin._id,
      actionType,
      "spotlight_application",
      args.id,
      {
        status: current.status,
        reviewerNotes: current.reviewerNotes,
        isFeatured: wasFeatured,
      },
      {
        status: args.status ?? current.status,
        reviewerNotes: args.reviewerNotes ?? current.reviewerNotes,
        isFeatured: args.isFeatured ?? wasFeatured,
      },
    )

    return null
  },
})

export const updateDonation = mutation({
  args: {
    id: v.id("donations"),
    status: v.optional(donationStatus),
    notes: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)

    const current = await ctx.db.get("donations", args.id)
    if (!current) throw new ConvexError("Donation not found")

    const now = Date.now()
    const patch: Partial<Doc<"donations">> = { updatedAt: now }

    if (args.status !== undefined) {
      patch.status = args.status
      // Money is moved by an offline wire transfer, so "confirmed" records who
      // vouched for it and when. Both terminal-positive states count.
      if (args.status === "confirmed" || args.status === "completed") {
        patch.confirmedBy = admin._id
        patch.confirmedAt = now
      }
    }
    if (args.notes !== undefined) patch.notes = args.notes
    if (args.transactionReference !== undefined) {
      patch.transactionReference = args.transactionReference
    }

    await ctx.db.patch("donations", args.id, patch)

    const statusChanged =
      args.status !== undefined && args.status !== current.status
    if (statusChanged) {
      await bumpCounter(ctx, counterKeys.donationsByStatus(current.status), -1)
      await bumpCounter(ctx, counterKeys.donationsByStatus(args.status!), 1)
    }

    await logActivity(
      ctx,
      admin._id,
      reviewAction(statusChanged),
      "donation",
      args.id,
      {
        status: current.status,
        notes: current.notes,
        transactionReference: current.transactionReference,
      },
      {
        status: args.status ?? current.status,
        notes: args.notes ?? current.notes,
        transactionReference:
          args.transactionReference ?? current.transactionReference,
      },
    )

    return null
  },
})

export const updateHelpInterest = mutation({
  args: {
    id: v.id("helpInterests"),
    status: v.optional(helpInterestStatus),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)

    const current = await ctx.db.get("helpInterests", args.id)
    if (!current) throw new ConvexError("Help interest not found")

    const now = Date.now()
    const patch: Partial<Doc<"helpInterests">> = { updatedAt: now }

    if (args.status !== undefined) {
      patch.status = args.status
      // First move off "new" is the moment someone actually made contact, so
      // that is what gets stamped. Later transitions leave it alone — it
      // records first contact, not last touch.
      if (args.status !== "new" && current.status === "new") {
        patch.followedUpBy = admin._id
        patch.followedUpAt = now
      }
    }
    if (args.notes !== undefined) patch.notes = args.notes

    await ctx.db.patch("helpInterests", args.id, patch)

    const statusChanged =
      args.status !== undefined && args.status !== current.status
    if (statusChanged) {
      await bumpCounter(
        ctx,
        counterKeys.helpInterestsByStatus(current.status),
        -1,
      )
      await bumpCounter(ctx, counterKeys.helpInterestsByStatus(args.status!), 1)
    }

    await logActivity(
      ctx,
      admin._id,
      reviewAction(statusChanged),
      "help_interest",
      args.id,
      { status: current.status, notes: current.notes },
      {
        status: args.status ?? current.status,
        notes: args.notes ?? current.notes,
      },
    )

    return null
  },
})

// ---------------------------------------------------------------------------
// Featured students (/admin/spotlight)
// ---------------------------------------------------------------------------
//
// This screen spans two tables. A featured student is either an approved
// scholarship application with spotlightEnabled, or a spotlight application
// with isFeatured — so the id arriving from the client belongs to one of two
// tables and cannot be typed as a v.id() of either. It is taken as a string and
// converted with ctx.db.normalizeId, which returns null for anything that is
// not a well-formed id of that specific table. That check is what keeps the
// untyped argument from becoming a way to write to an arbitrary document.

const featuredSource = v.union(
  v.literal("scholarship"),
  v.literal("spotlight"),
)

export const setFeatured = mutation({
  args: {
    id: v.string(),
    source: featuredSource,
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)
    const now = Date.now()

    if (args.source === "scholarship") {
      const id = ctx.db.normalizeId("applications", args.id)
      if (!id) throw new ConvexError("Invalid application id")

      const current = await ctx.db.get("applications", id)
      if (!current) throw new ConvexError("Application not found")

      await ctx.db.patch("applications", id, {
        spotlightEnabled: args.featured,
        spotlightEnabledAt: args.featured ? now : undefined,
        updatedAt: now,
      })

      // No counter bump, and that is not an oversight. The dashboard's
      // "featured students" tile reads counterKeys.spotlightFeatured(), which
      // counts spotlightApplications.isFeatured only — the Supabase stats route
      // counted the same single table (app/api/admin/stats/route.ts:46). The
      // scholarship side has no counter to maintain; inventing one here would
      // make the tile disagree with the number it showed before the migration.
      await logActivity(
        ctx,
        admin._id,
        "featured_change",
        "application",
        id,
        { isFeatured: current.spotlightEnabled === true },
        { isFeatured: args.featured },
      )

      return null
    }

    const id = ctx.db.normalizeId("spotlightApplications", args.id)
    if (!id) throw new ConvexError("Invalid spotlight application id")

    const current = await ctx.db.get("spotlightApplications", id)
    if (!current) throw new ConvexError("Spotlight application not found")

    await ctx.db.patch("spotlightApplications", id, {
      isFeatured: args.featured,
      featuredAt: args.featured ? now : undefined,
      updatedAt: now,
    })

    const wasFeatured = current.isFeatured === true
    if (args.featured !== wasFeatured) {
      await bumpCounter(ctx, counterKeys.spotlightFeatured(), args.featured ? 1 : -1)
    }

    await logActivity(
      ctx,
      admin._id,
      "featured_change",
      "spotlight_application",
      id,
      { isFeatured: wasFeatured },
      { isFeatured: args.featured },
    )

    return null
  },
})

// Featured students are hand-curated and realistically single digits; the same
// ceiling the read side uses bounds the write side, so one drag-and-drop cannot
// hand the transaction an arbitrarily long list of writes.
export const reorderFeatured = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        source: featuredSource,
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminForWrite(ctx)

    if (args.items.length > MAX_FEATURED) {
      throw new ConvexError(
        `Cannot reorder more than ${MAX_FEATURED} featured students at once`,
      )
    }

    // Every id is resolved and checked BEFORE the first write. The Supabase
    // version fired its updates with Promise.all and inspected the errors
    // afterwards, which could leave half the list renumbered when one id was
    // bad. Here a bad id throws before anything is written, and even a failure
    // partway through the loop rolls the whole mutation back — reordering is
    // all-or-nothing.
    const resolved = args.items.map((item) => {
      if (item.source === "scholarship") {
        const id = ctx.db.normalizeId("applications", item.id)
        if (!id) throw new ConvexError(`Invalid application id: ${item.id}`)
        return { source: "scholarship" as const, id, order: item.order }
      }
      const id = ctx.db.normalizeId("spotlightApplications", item.id)
      if (!id) throw new ConvexError(`Invalid spotlight application id: ${item.id}`)
      return { source: "spotlight" as const, id, order: item.order }
    })

    for (const item of resolved) {
      if (item.source === "scholarship") {
        await ctx.db.patch("applications", item.id, {
          spotlightOrder: item.order,
        })
      } else {
        await ctx.db.patch("spotlightApplications", item.id, {
          featuredOrder: item.order,
        })
      }
    }

    // Ordering does not change any counted bucket, so no counter work here.
    await logActivity(
      ctx,
      admin._id,
      "spotlight_reorder",
      "spotlight",
      "batch",
      null,
      { reorder: args.items },
    )

    return null
  },
})
