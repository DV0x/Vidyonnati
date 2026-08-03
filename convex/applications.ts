import { v, ConvexError } from "convex/values"
import { query, mutation } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import {
  requireStudent,
  requireStudentForWrite,
  getOrCreateStudent,
  getIdentity,
  lookupStudent,
} from "./lib/auth"
import { applicationDocuments } from "./lib/studentData"
import { bumpCounter, counterKeys } from "./lib/counters"
import { applicationSearchText } from "./lib/search"
import { generateApplicationId } from "./lib/ids"
import { gender, incomeRange } from "./schema"

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
//
// Null rather than a throw for "no identity" and "no student row", matching
// dashboard.summary. This runs on the wizard's first render, which can beat
// AuthContext's ensureStudentProfile on a fresh account; a student with no
// profile has no application, so null is the truthful answer for that window.
// A throw would surface as an error boundary over the form instead — strictly
// worse than the unguarded form this replaces.
export const existingForYear = query({
  args: {
    applicationType: v.union(v.literal("first-year"), v.literal("second-year")),
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx)
    if (!identity) return null

    const student = await lookupStudent(ctx, identity)
    if (!student) return null

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

// ---------------------------------------------------------------------------
// Writes (Phase 3)
// ---------------------------------------------------------------------------
//
// The argument validators below ARE the field allowlist. This is the one place
// where the Convex port is meaningfully safer than the Supabase route rather
// than merely equivalent: that route took the whole request body and stripped
// protected keys by name —
//
//   delete body.status; delete body.reviewed_by; delete body.reviewer_notes; ...
//
// which is a denylist, and a denylist is only as complete as the last person to
// remember it. Adding a sensitive column without adding a matching `delete` line
// silently made it student-writable. Here an argument that is not declared is
// rejected before the handler runs, so `status`, `reviewedBy`, `reviewerNotes`,
// `spotlightEnabled` and the rest are unreachable by construction.

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
  pincode: v.string(),
  address: v.string(),

  // Family
  motherName: v.string(),
  fatherName: v.string(),
  guardianName: v.optional(v.string()),
  guardianRelationship: v.optional(v.string()),
  guardianDetails: v.optional(v.string()),
  motherOccupation: v.optional(v.string()),
  motherMobile: v.optional(v.string()),
  fatherOccupation: v.optional(v.string()),
  fatherMobile: v.optional(v.string()),
  familyAdultsCount: v.optional(v.number()),
  familyChildrenCount: v.optional(v.number()),
  annualFamilyIncome: v.optional(incomeRange),

  // Education — shared
  highSchoolStudied: v.string(),
  sscTotalMarks: v.number(),
  sscMaxMarks: v.number(),
  sscPercentage: v.number(),
  collegeAddress: v.string(),
  groupSubjects: v.string(),

  // Education — first-year only
  collegeAdmitted: v.optional(v.string()),
  courseJoined: v.optional(v.string()),
  dateOfAdmission: v.optional(v.string()),

  // Education — second-year only
  currentCollege: v.optional(v.string()),
  courseStudying: v.optional(v.string()),
  firstYearTotalMarks: v.optional(v.number()),
  firstYearMaxMarks: v.optional(v.number()),
  firstYearPercentage: v.optional(v.number()),

  // Bank
  bankAccountNumber: v.string(),
  bankNameBranch: v.string(),
  ifscCode: v.string(),

  // Essays (second-year)
  studyActivities: v.optional(v.string()),
  goalsDreams: v.optional(v.string()),
  additionalInfo: v.optional(v.string()),
})

const applicationType = v.union(
  v.literal("first-year"),
  v.literal("second-year"),
)

export const create = mutation({
  args: {
    ...studentEditableFields.fields,
    applicationType,
    academicYear: v.string(),
  },
  handler: async (ctx, args) => {
    // get-or-create, not require: a student can reach the wizard before the
    // Clerk webhook has landed, and "profile not found" on submit would lose a
    // completed form. Same reasoning as users.updateProfile.
    const student = await getOrCreateStudent(ctx)

    const { applicationType: type, academicYear, ...fields } = args

    // One application per (student, type, year) — an exact hit on the three-
    // field index, so this is a point read rather than a scan.
    const duplicate = await ctx.db
      .query("applications")
      .withIndex("by_studentId_and_applicationType_and_academicYear", (q) =>
        q
          .eq("studentId", student._id)
          .eq("applicationType", type)
          .eq("academicYear", academicYear),
      )
      .unique()

    if (duplicate) {
      // The wizard shows the existing id so the student can navigate to it
      // rather than being told "no" with nowhere to go. ConvexError carries a
      // structured payload, which is why this is an object and not a string.
      throw new ConvexError({
        code: "DUPLICATE_APPLICATION",
        message: `You already have a ${type} application for ${academicYear}`,
        existingApplicationId: duplicate.applicationId,
      })
    }

    // A renewal links back to the approved first-year application it renews.
    // The index prefix (studentId, applicationType) bounds this to the
    // student's own first-year rows — a handful at most — so filtering status
    // after the index scan is fine here.
    let previousApplicationId: Id<"applications"> | undefined
    if (type === "second-year") {
      const previous = await ctx.db
        .query("applications")
        .withIndex("by_studentId_and_applicationType_and_academicYear", (q) =>
          q.eq("studentId", student._id).eq("applicationType", "first-year"),
        )
        .filter((q) => q.eq(q.field("status"), "approved"))
        .order("desc")
        .first()
      previousApplicationId = previous?._id
    }

    const applicationId = await generateApplicationId(ctx)

    const id = await ctx.db.insert("applications", {
      ...fields,
      applicationId,
      studentId: student._id,
      previousApplicationId,
      applicationType: type,
      academicYear,
      status: "pending",
      searchText: applicationSearchText({
        fullName: fields.fullName,
        email: fields.email,
        applicationId,
      }),
      updatedAt: Date.now(),
    })

    await bumpCounter(ctx, counterKeys.applicationsByStatus("pending"), 1)

    // Carry the freshest personal details onto the profile, as the Supabase
    // route did. Only the fields the profile actually has — the application
    // holds far more than the student record does.
    await ctx.db.patch("students", student._id, {
      fullName: fields.fullName,
      phone: fields.phone,
      dateOfBirth: fields.dateOfBirth,
      gender: fields.gender,
      village: fields.village,
      mandal: fields.mandal,
      district: fields.district,
      pincode: fields.pincode,
      address: fields.address,
      updatedAt: Date.now(),
    })

    // The acknowledgement. Scheduled rather than awaited inline: a mutation
    // cannot call out to Resend, and scheduling from inside the transaction
    // means the email is sent only if this insert actually commits.
    //
    // Addressed to the application's own email rather than the account's. They
    // are the same string today, but this one travels with the row being
    // written and is editable on a needs_info resubmit, so a typo is
    // self-correcting.
    await ctx.scheduler.runAfter(0, internal.email.sendApplicationEmail, {
      kind: "application_received",
      to: fields.email,
      recipientName: fields.fullName,
      applicationId,
      applicationDocId: id,
      applicationType: type,
      academicYear,
    })

    return { id, applicationId }
  },
})

export const update = mutation({
  args: {
    id: v.id("applications"),
    ...studentEditableFields.fields,
  },
  handler: async (ctx, args) => {
    const student = await requireStudentForWrite(ctx)

    const { id, ...fields } = args

    const existing = await ctx.db.get("applications", id)
    // Ownership and existence collapse into one message, so this cannot be used
    // to discover which ids exist. Unlike the read paths this throws rather
    // than returning null: a write to something you do not own is an error, not
    // a 404 to render.
    if (!existing || existing.studentId !== student._id) {
      throw new ConvexError("Application not found")
    }

    // A student may only edit while the reviewer has asked them to. Any other
    // status — pending, under_review, approved, rejected — is closed to edits.
    if (existing.status !== "needs_info") {
      throw new ConvexError(
        "This application can no longer be edited. Contact us if you need to make a change.",
      )
    }

    await ctx.db.patch("applications", id, {
      ...fields,
      // Answering the reviewer's question puts it back in the queue. Forced
      // server-side; `status` is deliberately not an argument.
      status: "under_review",
      // fullName and email are both editable here and both feed searchText, so
      // it has to be rebuilt or the admin list keeps matching the old name.
      searchText: applicationSearchText({
        fullName: fields.fullName,
        email: fields.email,
        applicationId: existing.applicationId,
      }),
      updatedAt: Date.now(),
    })

    // needs_info was verified above, so this transition is unconditional.
    await bumpCounter(ctx, counterKeys.applicationsByStatus("needs_info"), -1)
    await bumpCounter(ctx, counterKeys.applicationsByStatus("under_review"), 1)

    // Closes the loop on the one action the applicant takes under uncertainty.
    // Deliberately not routed through the admin status-change path: this
    // transition is the student's own resubmit, which applications.update flips
    // server-side and attributes to nobody, so it needs its own wording.
    await ctx.scheduler.runAfter(0, internal.email.sendApplicationEmail, {
      kind: "resubmission_received",
      to: fields.email,
      recipientName: fields.fullName,
      applicationId: existing.applicationId,
      applicationDocId: id,
      applicationType: existing.applicationType,
      academicYear: existing.academicYear,
    })

    return { id, applicationId: existing.applicationId }
  },
})
