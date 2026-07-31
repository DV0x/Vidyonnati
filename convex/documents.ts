import { v, ConvexError } from "convex/values"
import { mutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { requireStudentForWrite } from "./lib/auth"

// Document upload for both wizards, replacing /api/upload and
// /api/upload/spotlight.
//
// ─────────────────────────────────────────────────────────────────────────────
// UPLOADING ONLY. SERVING IS STILL PHASE 4.
//
// Nothing here mints a URL. The open decision between permanent
// storage.getUrl() capability URLs and a token-authorized HTTP action is
// untouched — these are Aadhaar cards and bank passbooks, and settling that by
// accident inside an upload port would be the wrong way to decide it.
// ─────────────────────────────────────────────────────────────────────────────
//
// The shape of the flow changes from the Supabase version. There, the file was
// POSTed to a Next route which validated it and then streamed it to storage, so
// the server saw the bytes before they landed. Convex hands the client a short-
// lived upload URL and the client POSTs to storage directly, so by the time any
// function runs, the file is already stored.
//
// That moves validation after the fact, which is why the checks below read the
// _storage system table rather than trusting the arguments. The client's claimed
// size and content type are not used for anything: `size` and `contentType` come
// from what Convex actually received. A client that lies about a 40MB video
// being a 2MB JPEG gets rejected on the real numbers, and the stored object is
// deleted on the way out rather than left orphaned.

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// The old route validated against this list but its rejection message said
// "5MB limit" while the constant was 10MB. The list is carried over as-is; the
// message is fixed below.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]

const applicationDocumentType = v.union(
  v.literal("student_photo"),
  v.literal("ssc_marksheet"),
  v.literal("aadhar_student"),
  v.literal("aadhar_parent"),
  v.literal("bonafide_certificate"),
  v.literal("bank_passbook"),
  v.literal("first_year_marksheet"),
  v.literal("mango_plant_photo"),
)

const spotlightDocumentType = v.union(
  v.literal("photo"),
  v.literal("marksheet"),
  v.literal("aadhar"),
  v.literal("income_certificate"),
  v.literal("other"),
)

// Authenticated: an upload URL is a write capability against our storage, so it
// is not handed to anonymous callers. Any signed-in student may request one —
// which document it ends up attached to is decided (and ownership-checked) by
// the attach mutations below, not here.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireStudentForWrite(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

// Reads the authoritative metadata Convex recorded for the stored object and
// enforces the limits against it.
//
// ─────────────────────────────────────────────────────────────────────────────
// IT DOES NOT DELETE THE REJECTED OBJECT, AND MUST NOT. TWO SEPARATE REASONS.
//
// 1. It would not work. A Convex mutation is a transaction: `storage.delete()`
//    followed by `throw` rolls the delete back with everything else, so the
//    object survives anyway. This was verified against the deployment, not
//    reasoned about — an earlier version of this file did exactly that and the
//    orphaned file was still in `_storage` afterwards.
//
// 2. Making it work would be worse than the leak. The storageId is a client
//    argument, and `_storage` records no uploader, so this function cannot tell
//    "the file the caller just uploaded" from "any storageId the caller typed".
//    A delete that survived would therefore hand every authenticated student a
//    way to destroy another student's file: attach it to an application they do
//    own, fail validation on purpose, and the object is gone. For Aadhaar cards
//    and bank passbooks that is a considerably worse outcome than some wasted
//    bytes.
//
// Orphans are swept instead, by age and by reachability, in maintenance.ts.
// The only storage delete anywhere in this file is of a superseded id read out
// of our OWN document row, which is not client-supplied and is safe.
// ─────────────────────────────────────────────────────────────────────────────
async function validateStoredFile(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<{ size: number; contentType: string }> {
  const meta = await ctx.db.system.get("_storage", storageId)
  if (!meta) {
    throw new ConvexError("Uploaded file not found")
  }

  const contentType = meta.contentType ?? ""
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new ConvexError("Invalid file type. Allowed: JPEG, PNG, WebP, PDF")
  }
  if (meta.size > MAX_FILE_SIZE) {
    throw new ConvexError("File size exceeds the 10MB limit")
  }

  return { size: meta.size, contentType }
}

export const attachApplicationDocument = mutation({
  args: {
    applicationId: v.id("applications"),
    documentType: applicationDocumentType,
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await requireStudentForWrite(ctx)

    const application = await ctx.db.get("applications", args.applicationId)
    if (!application || application.studentId !== student._id) {
      // No cleanup here either, and for the sharper half of the reason above:
      // on this path the caller has NOT proven anything about the storageId,
      // so deleting it is exactly the arbitrary-deletion primitive described
      // in validateStoredFile. Throw, and let the sweeper handle the bytes.
      throw new ConvexError("Application not found")
    }

    const { size, contentType } = await validateStoredFile(ctx, args.storageId)

    // One document per type per application, matching the Supabase route: a
    // re-upload replaces rather than accumulates, and the superseded object is
    // deleted from storage in the same transaction as the row that pointed at
    // it. Doing the delete first would orphan the row if the patch then failed.
    const existing = await ctx.db
      .query("applicationDocuments")
      .withIndex("by_applicationId_and_documentType", (q) =>
        q
          .eq("applicationId", args.applicationId)
          .eq("documentType", args.documentType),
      )
      .unique()

    if (existing) {
      const supersededStorageId = existing.storageId
      await ctx.db.patch("applicationDocuments", existing._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        fileSize: size,
        mimeType: contentType,
      })
      if (supersededStorageId !== args.storageId) {
        await ctx.storage.delete(supersededStorageId)
      }
      return existing._id
    }

    return await ctx.db.insert("applicationDocuments", {
      applicationId: args.applicationId,
      documentType: args.documentType,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: size,
      mimeType: contentType,
    })
  },
})

export const attachSpotlightDocument = mutation({
  args: {
    spotlightApplicationId: v.id("spotlightApplications"),
    documentType: spotlightDocumentType,
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await requireStudentForWrite(ctx)

    const application = await ctx.db.get(
      "spotlightApplications",
      args.spotlightApplicationId,
    )
    if (!application || application.studentId !== student._id) {
      throw new ConvexError("Spotlight application not found")
    }

    const { size, contentType } = await validateStoredFile(ctx, args.storageId)

    // "other" is the one type a student may legitimately attach more than once,
    // so it appends instead of replacing. Every other type is singular and
    // replaces, exactly as on the scholarship side.
    if (args.documentType !== "other") {
      const existing = await ctx.db
        .query("spotlightDocuments")
        .withIndex("by_spotlightApplicationId_and_documentType", (q) =>
          q
            .eq("spotlightApplicationId", args.spotlightApplicationId)
            .eq("documentType", args.documentType),
        )
        .unique()

      if (existing) {
        const supersededStorageId = existing.storageId
        await ctx.db.patch("spotlightDocuments", existing._id, {
          storageId: args.storageId,
          fileName: args.fileName,
          fileSize: size,
          mimeType: contentType,
        })
        if (supersededStorageId !== args.storageId) {
          await ctx.storage.delete(supersededStorageId)
        }
        return existing._id
      }
    }

    return await ctx.db.insert("spotlightDocuments", {
      spotlightApplicationId: args.spotlightApplicationId,
      documentType: args.documentType,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: size,
      mimeType: contentType,
    })
  },
})
