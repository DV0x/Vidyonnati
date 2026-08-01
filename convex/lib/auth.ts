import { ConvexError } from "convex/values"
import type { UserIdentity } from "convex/server"
import type { QueryCtx, MutationCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"

// Shared identity + authorization helpers.
//
// Convex has no row-level security, so every check that used to be a Postgres
// RLS policy lives here and is called explicitly from each function body.
//
// Identity keying: `tokenIdentifier` is the canonical key. `clerkUserId` exists
// only because a Clerk `user.created` webhook carries `data.id` and cannot know
// the tokenIdentifier (that exists only on a validated JWT). So lookups try
// tokenIdentifier first, fall back to clerkUserId, and backfill in write paths.
//
// NEVER accept a user id as a function argument for authorization. Identity is
// always derived server-side from ctx.auth.getUserIdentity().

type AnyCtx = QueryCtx | MutationCtx

export async function getIdentity(ctx: AnyCtx): Promise<UserIdentity | null> {
  return await ctx.auth.getUserIdentity()
}

export async function requireIdentity(ctx: AnyCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new ConvexError("Not authenticated")
  return identity
}

// -- lookups (read-only; safe in queries and mutations) ---------------------

export async function lookupStudent(
  ctx: AnyCtx,
  identity: UserIdentity,
): Promise<Doc<"students"> | null> {
  const byToken = await ctx.db
    .query("students")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique()
  if (byToken) return byToken

  // Webhook-created row whose tokenIdentifier has not been backfilled yet.
  return await ctx.db
    .query("students")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique()
}

export async function lookupAdmin(
  ctx: AnyCtx,
  identity: UserIdentity,
): Promise<Doc<"admins"> | null> {
  const byToken = await ctx.db
    .query("admins")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique()
  if (byToken) return byToken

  const byClerkUser = await ctx.db
    .query("admins")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique()
  if (byClerkUser) return byClerkUser

  // Pre-authorized admin: the row was seeded by email before this person had a
  // Clerk account, so neither ID is bound yet. requireAdminForWrite binds them
  // on the first authenticated write.
  //
  // Safe because identity.email comes from the signed session token and Clerk
  // requires email verification at sign-up — so matching here means the caller
  // demonstrably controls that mailbox. Granting admin to whoever controls
  // hello@vidyonnatifoundation.org is precisely the intent.
  if (identity.email) {
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique()
  }

  return null
}

// -- query-side guards (cannot write, so no backfill) ----------------------

export async function requireStudent(ctx: QueryCtx): Promise<Doc<"students">> {
  const identity = await requireIdentity(ctx)
  const student = await lookupStudent(ctx, identity)
  if (!student) throw new ConvexError("Student profile not found")
  return student
}

export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"admins">> {
  const identity = await requireIdentity(ctx)
  const admin = await lookupAdmin(ctx, identity)
  if (!admin) throw new ConvexError("Forbidden")
  return admin
}

// -- mutation-side guards (backfill tokenIdentifier on the way through) ----

export async function requireStudentForWrite(
  ctx: MutationCtx,
): Promise<Doc<"students">> {
  const identity = await requireIdentity(ctx)
  const student = await lookupStudent(ctx, identity)
  if (!student) throw new ConvexError("Student profile not found")
  if (student.tokenIdentifier !== identity.tokenIdentifier) {
    await ctx.db.patch(student._id, { tokenIdentifier: identity.tokenIdentifier })
  }
  return student
}

export async function requireAdminForWrite(
  ctx: MutationCtx,
): Promise<Doc<"admins">> {
  const identity = await requireIdentity(ctx)
  const admin = await lookupAdmin(ctx, identity)
  if (!admin) throw new ConvexError("Forbidden")

  // Bind a pre-authorized (email-seeded) row to its Clerk account, and keep
  // tokenIdentifier current. After this the faster index paths match first.
  const patch: Partial<Doc<"admins">> = {}
  if (admin.tokenIdentifier !== identity.tokenIdentifier) {
    patch.tokenIdentifier = identity.tokenIdentifier
  }
  if (admin.clerkUserId !== identity.subject) {
    patch.clerkUserId = identity.subject
  }
  if (Object.keys(patch).length > 0) await ctx.db.patch(admin._id, patch)

  return admin
}

// -- lazy get-or-create ----------------------------------------------------
//
// Safety net for the Clerk webhook. The old Postgres `handle_new_user` trigger
// could silently not fire, which produced the bug recorded in error.md: a user
// with no students row got a 406 on the profile fetch and a 500 on spotlight
// submit (PGRST116, "The result contains 0 rows"). With get-or-create that
// state is unreachable — call this at the top of any mutation a brand-new user
// can reach before the webhook has landed.

export async function getOrCreateStudent(
  ctx: MutationCtx,
  fallback?: { email?: string; fullName?: string },
): Promise<Doc<"students">> {
  const identity = await requireIdentity(ctx)

  const existing = await lookupStudent(ctx, identity)
  if (existing) {
    if (existing.tokenIdentifier !== identity.tokenIdentifier) {
      await ctx.db.patch(existing._id, {
        tokenIdentifier: identity.tokenIdentifier,
      })
    }
    return existing
  }

  // Clerk's default session token carries only sub / sid / iss / aud / sts / v
  // — verified by logging a real identity. It has no `email` or `name`, because
  // the token rides in a cookie with a 4KB ceiling.
  //
  // Prefer the token's claims when present: those are signed by Clerk and
  // therefore trustworthy. Fall back to values the client read from Clerk's
  // useUser(). The fallback is only ever profile data — identity itself comes
  // from identity.subject / identity.tokenIdentifier and is never client-supplied.
  //
  // Adding `email` via Clerk's session-token customization makes the first
  // branch win and the fallback dead code, which is the stronger setup.
  const email = identity.email ?? fallback?.email
  const fullName = identity.name ?? fallback?.fullName

  if (!email) {
    throw new ConvexError(
      "Cannot create a student profile: no email in the auth token or request",
    )
  }

  const id = await ctx.db.insert("students", {
    tokenIdentifier: identity.tokenIdentifier,
    clerkUserId: identity.subject,
    email,
    fullName: fullName || undefined,
  })

  const created = await ctx.db.get(id)
  if (!created) throw new ConvexError("Failed to create student profile")
  return created
}
