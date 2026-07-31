import { v, ConvexError } from "convex/values"
import { mutation } from "./_generated/server"
import { bumpCounter, counterKeys } from "./lib/counters"
import { helpInterestSearchText } from "./lib/search"

// Public "I want to help" intake — the dialog on a featured student's card and
// the standalone contact form.
//
// Unauthenticated for the same reason as donations.create, with the same
// exposure and the same open rate-limiting decision. See the block comment
// there; it is not repeated here.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    // A union validator, so Convex rejects an unknown help type at the argument
    // boundary before the handler runs. The API route had to check this by hand
    // against a VALID_HELP_TYPES array.
    helpType: v.union(
      v.literal("donate"),
      v.literal("volunteer"),
      v.literal("corporate"),
      v.literal("other"),
    ),
    message: v.optional(v.string()),
    // An `applications` or `spotlightApplications` id — see the schema comment.
    // Accepted as an opaque string and never dereferenced, so a bogus value
    // costs nothing beyond a useless breadcrumb on one lead row.
    featuredEntityId: v.optional(v.string()),
    studentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.email.trim() || !args.phone.trim()) {
      throw new ConvexError("Name, email and phone are required")
    }
    if (!EMAIL.test(args.email)) {
      throw new ConvexError("Invalid email format")
    }

    const name = args.name.trim()
    const email = args.email.trim()
    const studentName = args.studentName || undefined

    const id = await ctx.db.insert("helpInterests", {
      name,
      email,
      phone: args.phone.trim(),
      helpType: args.helpType,
      message: args.message || undefined,
      featuredEntityId: args.featuredEntityId || undefined,
      studentName,
      status: "new",
      searchText: helpInterestSearchText({ name, email, studentName }),
    })

    await bumpCounter(ctx, counterKeys.helpInterestsByStatus("new"), 1)

    return { id }
  },
})
