import { v } from "convex/values"
import { query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { requireStudent } from "./lib/auth"
import { applicationDocuments } from "./lib/studentData"

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
//
// The list of a student's applications lives in dashboard.summary, not here —
// both dashboard screens need it alongside the spotlight list, and the page
// gets one preloadQuery.

export const myApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx)

    const application = await ctx.db.get("applications", args.applicationId)

    // null — not a throw — for both "does not exist" and "belongs to someone
    // else". Two reasons. It collapses the cases so a caller cannot use the
    // difference to probe which IDs are real, and it lets the Server Component
    // render a real 404 via notFound(); a throw out of preloadQuery surfaces as
    // an error boundary, which is the wrong answer for a missing record.
    if (!application || application.studentId !== student._id) {
      return null
    }

    return {
      ...application,
      documents: await applicationDocuments(ctx, application._id),
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
