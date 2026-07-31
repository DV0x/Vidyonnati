import { v } from "convex/values"
import { ConvexError } from "convex/values"
import { query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import { requireStudent } from "./lib/auth"

// Student-facing reads over their own scholarship applications.
//
// Every handler derives identity server-side via requireStudent and compares
// against the row's studentId. Convex has no row-level security, so this
// comparison is the whole of the ownership guarantee — there is no second
// layer behind it. NEVER take a studentId as an argument.
//
// No field projection here, unlike featured.ts: a student reading their own
// application is entitled to all of it, including their own bank details. The
// Supabase route did select('*') for the same reason.

// A student has at most a first-year and a second-year application per academic
// year. This bound exists to satisfy the guidelines' "never return an unbounded
// collection" rule; it is not expected to bind in practice.
const MAX_PER_STUDENT = 50

// Eight document types are defined in the schema, and a resubmission can add
// replacements rather than overwriting, so allow some headroom.
const MAX_DOCUMENTS = 32

// Document rows carry a storageId but no URL.
//
// Minting URLs is deliberately deferred to Phase 4, where the open decision in
// CONVEX_MIGRATION_PLAN.md gets made. These tables reference Aadhaar cards and
// bank passbooks, and ctx.storage.getUrl() returns a permanent, unrevocable
// URL — handing one out here would silently settle that decision in favour of
// permanent capability URLs. Returning metadata keeps the choice open.
async function documentsFor(ctx: QueryCtx, applicationId: Id<"applications">) {
  const docs = await ctx.db
    .query("applicationDocuments")
    .withIndex("by_applicationId", (q) => q.eq("applicationId", applicationId))
    .take(MAX_DOCUMENTS)

  return docs.map((doc) => ({
    _id: doc._id,
    _creationTime: doc._creationTime,
    documentType: doc.documentType,
    storageId: doc.storageId,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
  }))
}

export const myApplications = query({
  args: {},
  handler: async (ctx) => {
    const student = await requireStudent(ctx)

    // by_studentId is (studentId, _creationTime), so descending order gives
    // newest-first for free — matching the route's order('created_at', desc).
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_studentId", (q) => q.eq("studentId", student._id))
      .order("desc")
      .take(MAX_PER_STUDENT)

    return await Promise.all(
      applications.map(async (app) => ({
        ...app,
        documents: await documentsFor(ctx, app._id),
      })),
    )
  },
})

export const myApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx)

    const application = await ctx.db.get("applications", args.applicationId)

    // One error for "does not exist" and "belongs to someone else". Telling
    // them apart would let a caller probe which application IDs are real.
    if (!application || application.studentId !== student._id) {
      throw new ConvexError("Application not found")
    }

    return {
      ...application,
      documents: await documentsFor(ctx, application._id),
    }
  },
})

// Used by the apply wizard to decide between "start a new application" and
// "you already applied for this year". Returns the existing row's identifiers
// only — the wizard needs to link to it, not read it.
export const existingForYear = query({
  args: {
    applicationType: v.union(v.literal("first-year"), v.literal("second-year")),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx)

    const existing: Doc<"applications"> | null = await ctx.db
      .query("applications")
      .withIndex("by_studentId_and_applicationType_and_academicYear", (q) =>
        q
          .eq("studentId", student._id)
          .eq("applicationType", args.applicationType)
          .eq("academicYear", args.academicYear),
      )
      .unique()

    if (!existing) return null
    return {
      _id: existing._id,
      applicationId: existing.applicationId,
      status: existing.status,
    }
  },
})
