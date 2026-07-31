import type { QueryCtx, MutationCtx } from "../_generated/server"

// Denormalized counts for the admin dashboard's stat tiles.
//
// Convex has no count operator. The guidelines rule out `.collect().length`
// outright — not because these tables are large today, but because an unbounded
// scan degrades silently and gives no signal until it is already a problem.
//
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3: THESE DO NOT MAINTAIN THEMSELVES
//
// A counter is only as correct as the last mutation that remembered to bump it.
// Every mutation that writes a counted table must call bumpCounter in the SAME
// mutation as the write, so the two commit or roll back together:
//
//   insert  → bumpCounter(ctx, key(newStatus), +1)
//   delete  → bumpCounter(ctx, key(oldStatus), -1)
//   status  → bumpCounter(ctx, key(oldStatus), -1)
//             bumpCounter(ctx, key(newStatus), +1)      ← both halves, always
//
// The status transition is the easy one to get half-right: incrementing the new
// bucket while forgetting to decrement the old inflates the totals forever.
//
// Convex mutations are serializable transactions, so the read-modify-write below
// is race-free — no advisory lock or atomic-increment operator is needed. That
// is a genuine difference from Postgres, where this pattern would need care.
//
// Still owed (Phase 3): a recompute/repair mutation that rebuilds every counter
// from its source table. Denormalized counts drift eventually — a mutation that
// throws after a partial bump, a hand-edit in the dashboard, a bug — and without
// a resync path the only fix is manual arithmetic. It is deliberately not
// written here because doing it correctly needs batching across transactions
// (read one .take(n) page, schedule the next), and a version that ignores
// transaction limits would break on exactly the table size that motivates it.
// ─────────────────────────────────────────────────────────────────────────────

type ReviewStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_info"

type DonationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "failed"
  | "refunded"

type HelpInterestStatus = "new" | "contacted" | "converted" | "closed"

// Build keys through these, never by hand. A typo in a key string is invisible:
// it creates a second counter that nothing reads and leaves the real one stale.
export const counterKeys = {
  applicationsByStatus: (status: ReviewStatus) =>
    `applications:status:${status}`,
  spotlightByStatus: (status: ReviewStatus) =>
    `spotlightApplications:status:${status}`,
  spotlightFeatured: () => "spotlightApplications:isFeatured:true",
  donationsByStatus: (status: DonationStatus) => `donations:status:${status}`,
  helpInterestsByStatus: (status: HelpInterestStatus) =>
    `helpInterests:status:${status}`,
} as const

export async function readCounter(
  ctx: QueryCtx,
  key: string,
): Promise<number> {
  const row = await ctx.db
    .query("counters")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique()

  // A bucket that has never been incremented has no row. Zero is the honest
  // answer, and it is also correct for a table that is genuinely empty.
  return row?.value ?? 0
}

export async function bumpCounter(
  ctx: MutationCtx,
  key: string,
  delta: number,
): Promise<void> {
  const row = await ctx.db
    .query("counters")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique()

  if (!row) {
    await ctx.db.insert("counters", { key, value: delta })
    return
  }

  // Stored as-is even when it goes negative. A negative count can only mean a
  // decrement without a matching increment, and clamping to zero would hide
  // that bug in the one place it is visible.
  await ctx.db.patch("counters", row._id, { value: row.value + delta })
}
