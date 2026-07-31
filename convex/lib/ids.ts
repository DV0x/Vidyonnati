import { ConvexError } from "convex/values"
import type { MutationCtx } from "../_generated/server"

// Human-readable identifiers: VF-00000000, VS-00000000, DON-00000000.
//
// These replace three Postgres functions (generate_application_id and friends,
// BACKEND_PLAN.md:382). Each was:
//
//   new_id := 'VF-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
//
// wrapped in a loop that regenerated on collision. The shape is preserved
// deliberately — random rather than sequential, because a sequential public ID
// leaks the total volume of applications to anyone holding one.
//
// The loop is still needed, but for a narrower reason than in Postgres. Convex
// mutations are serializable transactions, so two concurrent inserts cannot both
// observe "free" and then both write the same id — one of them is retried by OCC
// and re-reads. What the loop actually handles is the ordinary case of drawing a
// number that some *committed* row already holds. That is not a race, just a
// birthday collision, and it needs a redraw either way.

const ID_SPACE = 100_000_000 // 8 digits, matching LPAD(..., 8, '0')

// Ten draws against a 100M space. Even at 100k rows the chance of one collision
// is ~0.1%, so ten consecutive collisions is not a scenario that occurs — if
// this throws, the table has grown far past what an 8-digit id can carry, and
// widening the id is the fix. Silently falling back to a timestamp (which the
// old API routes did on RPC failure: `DON-${Date.now()}`) is not, because it
// emits a 13-digit id in a format nothing else validates and skips the
// uniqueness check entirely.
const MAX_ATTEMPTS = 10

function draw(prefix: string): string {
  return `${prefix}-${String(Math.floor(Math.random() * ID_SPACE)).padStart(8, "0")}`
}

export async function generateApplicationId(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = draw("VF")
    const taken = await ctx.db
      .query("applications")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", candidate))
      .unique()
    if (!taken) return candidate
  }
  throw new ConvexError(
    "Could not allocate a unique application id after 10 attempts",
  )
}

export async function generateSpotlightId(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = draw("VS")
    const taken = await ctx.db
      .query("spotlightApplications")
      .withIndex("by_spotlightId", (q) => q.eq("spotlightId", candidate))
      .unique()
    if (!taken) return candidate
  }
  throw new ConvexError(
    "Could not allocate a unique spotlight id after 10 attempts",
  )
}

export async function generateDonationId(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = draw("DON")
    const taken = await ctx.db
      .query("donations")
      .withIndex("by_donationId", (q) => q.eq("donationId", candidate))
      .unique()
    if (!taken) return candidate
  }
  throw new ConvexError(
    "Could not allocate a unique donation id after 10 attempts",
  )
}
