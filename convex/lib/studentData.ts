import type { QueryCtx } from "../_generated/server"
import type { Id } from "../_generated/dataModel"

// Shared reads over a student's own applications.
//
// These live here rather than in applications.ts / spotlight.ts because both
// /dashboard and /dashboard/applications need BOTH lists, and the rendering
// plan allows only one preloadQuery per page (multiple preloads are not
// consistency-guaranteed with each other). So the pages call a single merged
// query, dashboard.summary, which composes these two.
//
// Callers are responsible for authorization. Every one of these takes a
// studentId that the caller has already derived from requireStudent — never
// from a function argument.

// A student has at most a first-year and a second-year application per academic
// year; spotlight is one per student in practice. Bounded per the guidelines'
// "never return an unbounded collection" rule rather than because it binds.
const MAX_PER_STUDENT = 50

// Eight document types are defined for scholarship applications, and a
// resubmission can add replacements rather than overwriting, so allow headroom.
const MAX_DOCUMENTS = 32

// Document rows carry a storageId but no URL.
//
// Minting URLs is deferred to Phase 4, where the open decision in
// CONVEX_MIGRATION_PLAN.md gets made. These tables reference Aadhaar cards and
// bank passbooks, and ctx.storage.getUrl() returns a permanent, unrevocable URL
// — handing one out here would silently settle that decision in favour of
// permanent capability URLs.
type DocumentSummary = {
  _id: string
  _creationTime: number
  documentType: string
  storageId: Id<"_storage">
  fileName: string
  fileSize: number
  mimeType: string
}

function toSummary(doc: {
  _id: string
  _creationTime: number
  documentType: string
  storageId: Id<"_storage">
  fileName: string
  fileSize: number
  mimeType: string
}): DocumentSummary {
  return {
    _id: doc._id,
    _creationTime: doc._creationTime,
    documentType: doc.documentType,
    storageId: doc.storageId,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
  }
}

export async function applicationDocuments(
  ctx: QueryCtx,
  applicationId: Id<"applications">,
): Promise<DocumentSummary[]> {
  const docs = await ctx.db
    .query("applicationDocuments")
    .withIndex("by_applicationId", (q) => q.eq("applicationId", applicationId))
    .take(MAX_DOCUMENTS)
  return docs.map(toSummary)
}

export async function spotlightDocuments(
  ctx: QueryCtx,
  spotlightApplicationId: Id<"spotlightApplications">,
): Promise<DocumentSummary[]> {
  const docs = await ctx.db
    .query("spotlightDocuments")
    .withIndex("by_spotlightApplicationId", (q) =>
      q.eq("spotlightApplicationId", spotlightApplicationId),
    )
    .take(MAX_DOCUMENTS)
  return docs.map(toSummary)
}

// by_studentId is (studentId, _creationTime), so descending order gives
// newest-first for free — matching the old route's order('created_at', desc).

export async function listApplications(
  ctx: QueryCtx,
  studentId: Id<"students">,
) {
  const applications = await ctx.db
    .query("applications")
    .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
    .order("desc")
    .take(MAX_PER_STUDENT)

  return await Promise.all(
    applications.map(async (app) => ({
      ...app,
      documents: await applicationDocuments(ctx, app._id),
    })),
  )
}

export async function listSpotlightApplications(
  ctx: QueryCtx,
  studentId: Id<"students">,
) {
  const applications = await ctx.db
    .query("spotlightApplications")
    .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
    .order("desc")
    .take(MAX_PER_STUDENT)

  return await Promise.all(
    applications.map(async (app) => ({
      ...app,
      documents: await spotlightDocuments(ctx, app._id),
    })),
  )
}
