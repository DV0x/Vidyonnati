import { v, ConvexError } from "convex/values"
import { query, mutation } from "./_generated/server"
import { requireStudent, requireStudentForWrite, getOrCreateStudent } from "./lib/auth"
import { spotlightDocuments } from "./lib/studentData"
import { bumpCounter, counterKeys } from "./lib/counters"
import { spotlightSearchText } from "./lib/search"
import { generateSpotlightId } from "./lib/ids"
import { gender, incomeRange, currentStatus, parentStatus, competitiveExam } from "./schema"
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

// ---------------------------------------------------------------------------
// Writes (Phase 3)
// ---------------------------------------------------------------------------
//
// Same allowlist-by-validator contract as applications.ts — see the long note
// there. `status`, `reviewedBy`, `reviewerNotes`, `isFeatured`, `featuredAt`
// and `featuredOrder` are absent from the argument list, so a student cannot
// reach them however the request is shaped. The Supabase route deleted those
// same six keys from the body by hand.

const studentEditableFields = v.object({
  // Personal
  fullName: v.string(),
  email: v.string(),
  phone: v.string(),
  dateOfBirth: v.string(),
  gender: v.optional(gender),
  village: v.string(),
  mandal: v.string(),
  district: v.string(),
  // Optional on the wire, defaulted below — the form only offers one state.
  state: v.optional(v.string()),
  pincode: v.string(),

  // Education
  collegeName: v.string(),
  courseStream: v.string(),
  totalMarks: v.number(),
  maxMarks: v.number(),
  percentage: v.number(),
  yearOfCompletion: v.number(),
  currentStatus,
  competitiveExams: v.optional(v.array(competitiveExam)),
  circumstances: v.optional(v.array(v.string())),
  circumstancesOther: v.optional(v.string()),

  // Family
  parentStatus,
  motherName: v.optional(v.string()),
  motherOccupation: v.optional(v.string()),
  motherHealth: v.optional(v.string()),
  fatherName: v.optional(v.string()),
  fatherOccupation: v.optional(v.string()),
  fatherHealth: v.optional(v.string()),
  guardianName: v.optional(v.string()),
  guardianRelationship: v.optional(v.string()),
  guardianDetails: v.optional(v.string()),
  siblingsCount: v.optional(v.number()),
  annualFamilyIncome: v.optional(incomeRange),

  // Story
  backgroundStory: v.string(),
  dreamsGoals: v.string(),
  howHelpChangesLife: v.string(),
  annualFinancialNeed: v.number(),
})

const DEFAULT_STATE = "Andhra Pradesh"

// A student may have only one spotlight application in flight. Rejected and
// approved ones do not block a new attempt; pending and under_review do.
const ACTIVE_STATUSES = ["pending", "under_review"] as const

export const create = mutation({
  args: studentEditableFields.fields,
  handler: async (ctx, args) => {
    const student = await getOrCreateStudent(ctx)

    // Bounded by the student's own rows via the index, so this reads a handful
    // of documents rather than scanning the table.
    const active = await ctx.db
      .query("spotlightApplications")
      .withIndex("by_studentId", (q) => q.eq("studentId", student._id))
      .filter((q) =>
        q.or(
          ...ACTIVE_STATUSES.map((s) => q.eq(q.field("status"), s)),
        ),
      )
      .first()

    if (active) {
      // Both identifiers, because the wizard needs each for a different thing:
      // the human-readable one to show the student, and the document id so a
      // resubmit can still attach its uploads to the application they already
      // have instead of losing them. The Supabase version recovered the same
      // way — it caught the 409 and re-fetched the row — and both ids belong to
      // the caller's own application, so neither leaks anything.
      throw new ConvexError({
        code: "DUPLICATE_SPOTLIGHT",
        message: "You already have an active spotlight application",
        existingApplicationId: active.spotlightId,
        existingId: active._id,
      })
    }

    const spotlightId = await generateSpotlightId(ctx)

    const id = await ctx.db.insert("spotlightApplications", {
      ...args,
      state: args.state || DEFAULT_STATE,
      spotlightId,
      studentId: student._id,
      status: "pending",
      searchText: spotlightSearchText({
        fullName: args.fullName,
        email: args.email,
        spotlightId,
      }),
      updatedAt: Date.now(),
    })

    await bumpCounter(ctx, counterKeys.spotlightByStatus("pending"), 1)

    return { id, spotlightId }
  },
})

export const update = mutation({
  args: {
    id: v.id("spotlightApplications"),
    ...studentEditableFields.fields,
  },
  handler: async (ctx, args) => {
    const student = await requireStudentForWrite(ctx)

    const { id, ...fields } = args

    const existing = await ctx.db.get("spotlightApplications", id)
    if (!existing || existing.studentId !== student._id) {
      throw new ConvexError("Spotlight application not found")
    }

    // Wider than the scholarship rule: a spotlight application is editable
    // while still pending as well as when the reviewer asked for more. The
    // Supabase route allowed exactly this pair.
    if (existing.status !== "pending" && existing.status !== "needs_info") {
      throw new ConvexError(
        "This application can no longer be edited. Contact us if you need to make a change.",
      )
    }

    // Only a needs_info row moves; editing a still-pending row leaves it
    // pending. That asymmetry is why the counter bump here is conditional,
    // where the scholarship one is not.
    const movesToUnderReview = existing.status === "needs_info"

    await ctx.db.patch("spotlightApplications", id, {
      ...fields,
      state: fields.state || existing.state || DEFAULT_STATE,
      ...(movesToUnderReview ? { status: "under_review" as const } : {}),
      searchText: spotlightSearchText({
        fullName: fields.fullName,
        email: fields.email,
        spotlightId: existing.spotlightId,
      }),
      updatedAt: Date.now(),
    })

    if (movesToUnderReview) {
      await bumpCounter(ctx, counterKeys.spotlightByStatus("needs_info"), -1)
      await bumpCounter(ctx, counterKeys.spotlightByStatus("under_review"), 1)
    }

    return { id, spotlightId: existing.spotlightId }
  },
})
