import { v } from "convex/values"
import { ConvexError } from "convex/values"
import { query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { requireStudent } from "./lib/auth"

// Student-facing reads over their own spotlight applications.
//
// Same contract as applications.ts: identity is derived server-side via
// requireStudent and compared against the row's studentId, and that comparison
// is the entire ownership guarantee. No studentId is ever accepted as an
// argument, and no projection is applied — the student owns this data.
//
// Documents return metadata without URLs; see the note in applications.ts.

const MAX_PER_STUDENT = 50
const MAX_DOCUMENTS = 32

async function documentsFor(
  ctx: QueryCtx,
  spotlightApplicationId: Id<"spotlightApplications">,
) {
  const docs = await ctx.db
    .query("spotlightDocuments")
    .withIndex("by_spotlightApplicationId", (q) =>
      q.eq("spotlightApplicationId", spotlightApplicationId),
    )
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

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const student = await requireStudent(ctx)

    const applications = await ctx.db
      .query("spotlightApplications")
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

export const mineById = query({
  args: { spotlightApplicationId: v.id("spotlightApplications") },
  handler: async (ctx, args) => {
    const student = await requireStudent(ctx)

    const application = await ctx.db.get(
      "spotlightApplications",
      args.spotlightApplicationId,
    )

    // Missing and not-yours collapse into one message so a caller cannot use
    // the difference to discover which IDs exist.
    if (!application || application.studentId !== student._id) {
      throw new ConvexError("Spotlight application not found")
    }

    return {
      ...application,
      documents: await documentsFor(ctx, application._id),
    }
  },
})
