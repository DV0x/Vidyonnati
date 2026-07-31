import { v } from "convex/values"
import { query } from "./_generated/server"
import { requireStudent } from "./lib/auth"
import { spotlightDocuments } from "./lib/studentData"
// Student-facing reads over their own spotlight applications.
//
// Same contract as applications.ts: identity is derived server-side via
// requireStudent and compared against the row's studentId, and that comparison
// is the entire ownership guarantee. No studentId is ever accepted as an
// argument, and no projection is applied — the student owns this data.
//
// The list lives in dashboard.summary; see the note in applications.ts.
export const mineById = query({
  args: { spotlightApplicationId: v.id("spotlightApplications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx)
    const application = await ctx.db.get(
      "spotlightApplications",
      args.spotlightApplicationId,
    )
    // null rather than a throw — see the note in applications.myApplication.
    // Missing and not-yours collapse into one answer, and the Server Component
    // turns it into a real 404 instead of an error boundary.
    if (!application || application.studentId !== student._id) {
      return null
    }
    return {
      ...application,
      documents: await spotlightDocuments(ctx, application._id),
    }
  },
})
