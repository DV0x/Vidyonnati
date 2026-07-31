import { v, ConvexError } from "convex/values"
import { mutation } from "./_generated/server"
import { bumpCounter, counterKeys } from "./lib/counters"
import { donationSearchText } from "./lib/search"
import { generateDonationId } from "./lib/ids"

// Public donation intake — the wire-transfer pledge form on /donate.
//
// ─────────────────────────────────────────────────────────────────────────────
// THIS MUTATION IS UNAUTHENTICATED BY DESIGN, AND THAT MEANS ANYONE CAN CALL IT
//
// Donors are not asked to create an account, so there is no identity to check.
// The Supabase version had exactly the same exposure — it used the service-role
// key from a route with no auth check — so this is a port, not a new hole.
//
// What it means in practice: a script can insert donation rows at will. Nothing
// here moves money (payment is an offline wire transfer that an admin confirms
// by hand), so the damage is junk rows in the admin queue and an inflated
// pending counter, not financial loss.
//
// The real fix is @convex-dev/rate-limiter keyed on donorEmail — the Convex
// guidelines call for it over hand-rolled window counters, which lose quota
// under concurrency. It is deliberately NOT installed here: adding a component
// mid-migration is its own change with its own deploy, and doing it silently
// inside a port would bury it. Tracked in the handoff's open decisions.
// ─────────────────────────────────────────────────────────────────────────────

// Same shape the API route used. Deliberately permissive — it rejects obvious
// typos, not exotic-but-legal addresses, and the confirmation step is a human
// reading the row anyway.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const create = mutation({
  args: {
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // The validators above prove these are strings; they do not prove the
    // strings are non-empty. The API route checked truthiness field by field,
    // and dropping that would let an empty form through.
    if (!args.donorName.trim() || !args.donorEmail.trim() || !args.donorPhone.trim()) {
      throw new ConvexError("Name, email and phone are required")
    }
    if (!EMAIL.test(args.donorEmail)) {
      throw new ConvexError("Invalid email format")
    }
    // Rejects 0, negatives, and NaN — Convex accepts NaN as a v.number(), and
    // `NaN > 0` is false, so this comparison catches it without a special case.
    if (!(args.amount > 0)) {
      throw new ConvexError("Amount must be greater than 0")
    }

    const donationId = await generateDonationId(ctx)
    const donorName = args.donorName.trim()
    const donorEmail = args.donorEmail.trim()

    const id = await ctx.db.insert("donations", {
      donationId,
      donorName,
      donorEmail,
      donorPhone: args.donorPhone.trim(),
      amount: args.amount,
      currency: args.currency || "INR",
      paymentMethod: "wire_transfer",
      status: "pending",
      notes: args.notes || undefined,
      searchText: donationSearchText({ donorName, donorEmail, donationId }),
    })

    // Same transaction as the insert, so the counter and the row commit or roll
    // back together. A bump in a follow-up mutation could survive a rolled-back
    // insert and inflate the dashboard permanently.
    await bumpCounter(ctx, counterKeys.donationsByStatus("pending"), 1)

    return {
      id,
      donationId,
      amount: args.amount,
      currency: args.currency || "INR",
      status: "pending" as const,
    }
  },
})
