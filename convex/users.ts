import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getIdentity, lookupAdmin, lookupStudent, getOrCreateStudent } from "./lib/auth"

// Single source of truth for the client's AuthContext.
//
// Replaces three separate round-trips in the Supabase version: the is_admin()
// RPC, the students profile fetch, and the /api/admin/info call. One reactive
// query now covers all of it — and because Convex subscriptions are live, the
// old refreshStudent() manual refetch becomes unnecessary.
//
// Returns null when unauthenticated rather than throwing, so the client can
// render a logged-out state without treating it as an error.
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx)
    if (!identity) return null

    // Admins are checked first: an admin account has no student profile, and
    // the old code short-circuited the same way.
    const admin = await lookupAdmin(ctx, identity)
    if (admin) {
      return {
        isAdmin: true as const,
        admin: { name: admin.name ?? null, role: admin.role, email: admin.email },
        student: null,
      }
    }

    const student = await lookupStudent(ctx, identity)
    return { isAdmin: false as const, admin: null, student }
  },
})

// Called once after sign-in to guarantee a student profile exists, covering the
// window before the Clerk webhook lands (and the case where it never does).
// Idempotent — safe to call on every session start.
export const ensureStudentProfile = mutation({
  // Clerk's session token has no email/name claim, so the client supplies them
  // from useUser() as a fallback. These are profile data only — identity is
  // always derived server-side from ctx.auth.getUserIdentity(), never from args.
  args: {
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const student = await getOrCreateStudent(ctx, {
      email: args.email,
      fullName: args.fullName,
    })
    return student._id
  },
})

export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    address: v.optional(v.string()),
    village: v.optional(v.string()),
    mandal: v.optional(v.string()),
    district: v.optional(v.string()),
    pincode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // get-or-create rather than require: a user editing their profile before
    // the webhook lands should succeed, not hit "profile not found".
    const student = await getOrCreateStudent(ctx)

    // Only patch keys actually supplied, so omitted fields are left alone
    // rather than being blanked to undefined.
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) patch[key] = value
    }

    await ctx.db.patch(student._id, patch)
    return student._id
  },
})
