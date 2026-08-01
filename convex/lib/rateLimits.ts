import { ConvexError } from "convex/values"
import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter"
import { components } from "../_generated/api"
import type { MutationCtx } from "../_generated/server"

// Rate limits for the two public, unauthenticated intake mutations —
// donations.create and helpInterests.create.
//
// Those two are callable by anyone by design: donors and enquirers are never
// asked to create an account, so there is no identity to check and nothing to
// authorize against. The exposure is not new — the Supabase routes they replaced
// had the same one, via the service-role key on a route with no auth check — but
// the migration is the moment to close it.
//
// Nothing here moves money. Payment is an offline wire transfer that an admin
// confirms by hand, so the cost of abuse is junk rows in the admin queue and an
// inflated pending counter, not financial loss. That is what these limits are
// sized against: keep the queue usable and make a flood visible, not repel a
// determined attacker.
//
// The component, rather than a hand-rolled window counter: the Convex guidelines
// call for it specifically, because a counter row read-modify-written by hand
// admits races under concurrency and loses quota when a mutation fails.

// ─────────────────────────────────────────────────────────────────────────────
// A MALFORMED SUBMISSION COSTS NO QUOTA — AND WILL LOOK LIKE A BROKEN LIMITER
//
// Two separate mechanisms, worth keeping straight because only one of them is
// about the component:
//
// 1. ORDERING. Both handlers validate before calling in here, so a payload with
//    a bad email or a zero amount throws and never reaches the limiter at all.
//    That is deliberate — a donor should not burn their own allowance on a typo
//    — and it is what makes the limits invisible to honest users.
//
// 2. ROLLBACK. A component's writes join the calling mutation's transaction, so
//    if anything AFTER the consumption throws, the token comes back with it.
//    That is what makes "consume a token, then insert the row" atomic: a token
//    is never spent on a row that does not exist.
//
// The practical consequence of (1): a script POSTing garbage can hammer these
// mutations forever without ever being limited, because nothing it sends is
// ever written either. If you test with invalid input you will conclude the
// limiter is not wired. Test with payloads that would actually succeed.
// ─────────────────────────────────────────────────────────────────────────────

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Per-email. The primary limit, and the one a real person can trip: five an
  // hour absorbs a double-click, a "did that go through?" retry and a genuine
  // second donation, and stops a script pointed at one address.
  //
  // Token bucket rather than fixed window so the allowance refills smoothly.
  // Under a fixed window, a donor who submitted at 10:59 gets nothing until the
  // window rolls; here they wait twelve minutes for one token.
  donationByEmail: { kind: "token bucket", rate: 5, period: HOUR, capacity: 5 },
  helpInterestByEmail: { kind: "token bucket", rate: 5, period: HOUR, capacity: 5 },

  // Global backstop. The per-email limit is keyed on a value the caller supplies
  // and can therefore change for free, so on its own it bounds nothing: cycling
  // addresses gets unlimited rows at five apiece.
  //
  // ── The trade this makes, stated plainly ──
  // A global limit can be burned by an attacker, and while it is burned real
  // donors are turned away. That is a worse failure than junk rows. So it is
  // sized as an emergency ceiling, not a traffic limiter: this foundation sees
  // single-digit submissions a day, and 100 in a burst is a number no honest
  // week has ever produced. Normal traffic will never come near it, an attacker
  // is capped at 300 rows an hour instead of unbounded, and the flood is slow
  // enough that a human notices and can respond.
  //
  // If a campaign ever does drive real bursts, raise these — they are the two
  // numbers in this file most likely to need tuning, and nothing else depends
  // on them.
  //
  // Left unsharded on purpose. Sharding raises write throughput on a limit that
  // every submission touches, at the cost of making it approximate. At this
  // volume the contention does not exist and the exactness is worth more.
  donationsGlobal: { kind: "token bucket", rate: 300, period: HOUR, capacity: 100 },
  helpInterestsGlobal: { kind: "token bucket", rate: 300, period: HOUR, capacity: 100 },
})

// Which pair of limits each public surface consumes, and the noun to use when
// telling the submitter they have been limited.
const INTAKE_LIMITS = {
  donation: {
    perEmail: "donationByEmail",
    global: "donationsGlobal",
    perEmailMessage: "You have submitted several donations from this email address recently.",
  },
  helpInterest: {
    perEmail: "helpInterestByEmail",
    global: "helpInterestsGlobal",
    perEmailMessage: "You have submitted several enquiries from this email address recently.",
  },
} as const

export type IntakeSurface = keyof typeof INTAKE_LIMITS

// `retryAfter` is milliseconds until a token is available. Rounded up and
// coarse on purpose — "about 12 minutes" is what a donor can act on, and an
// exact millisecond count in a form error reads as a bug.
function formatRetryAfter(ms: number): string {
  const minutes = Math.ceil(ms / MINUTE)
  if (minutes <= 1) return "a minute"
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.ceil(minutes / 60)
  return hours === 1 ? "an hour" : `${hours} hours`
}

// Structured payload, matching the convention lib/convexError.ts documents: a
// `message` for the form to display and a `code` for any caller that needs to
// branch. `convexErrorMessage` already reads `message` out of an object payload,
// so both public forms surface this without a client-side change.
function rateLimitedError(message: string, retryAfter: number): ConvexError<{
  code: "RATE_LIMITED"
  message: string
  retryAfter: number
}> {
  return new ConvexError({
    code: "RATE_LIMITED" as const,
    message: `${message} Please try again in about ${formatRetryAfter(retryAfter)}.`,
    retryAfter,
  })
}

/**
 * Consume one token from a public intake surface's per-email and global limits.
 * Throws a `RATE_LIMITED` ConvexError if either is exhausted.
 *
 * Call it AFTER the handler's own validation, so the key is the normalized
 * email rather than whatever the client sent, and BEFORE the insert. Ordering
 * against the insert does not affect atomicity — the transaction covers both
 * either way — but reading the guard before the write is how every other
 * mutation in this codebase is arranged.
 */
export async function enforceIntakeRateLimit(
  ctx: MutationCtx,
  surface: IntakeSurface,
  email: string,
): Promise<void> {
  const limits = INTAKE_LIMITS[surface]

  // Lowercased so Donor@example.com and donor@example.com share a bucket.
  // Without this, case alone would hand out a fresh allowance.
  const key = email.trim().toLowerCase()

  const perEmail = await rateLimiter.limit(ctx, limits.perEmail, { key })
  if (!perEmail.ok) {
    throw rateLimitedError(limits.perEmailMessage, perEmail.retryAfter)
  }

  // Checked second so an ordinary submitter sees the specific message about
  // their own address rather than the vaguer global one. A token taken from the
  // per-email bucket above is refunded by the rollback if this throws.
  const global = await rateLimiter.limit(ctx, limits.global)
  if (!global.ok) {
    throw rateLimitedError(
      "We are receiving an unusually high number of submissions right now.",
      global.retryAfter,
    )
  }
}
