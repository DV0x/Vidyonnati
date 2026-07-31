import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Shared unions -------------------------------------------------------------

const reviewStatus = v.union(
  v.literal("pending"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_info"),
)

const gender = v.union(v.literal("male"), v.literal("female"))

// Income is a bucketed range, not a number — matches the form's select options.
const incomeRange = v.union(
  v.literal("below-1-lakh"),
  v.literal("1-2-lakhs"),
  v.literal("2-3-lakhs"),
  v.literal("3-5-lakhs"),
  v.literal("above-5-lakhs"),
)

export default defineSchema({
  // Identity ----------------------------------------------------------------
  //
  // Two keys by necessity, not redundancy:
  //   clerkUserId     — Clerk webhooks carry `data.id`, never a tokenIdentifier
  //                     (that only exists on a validated JWT), so this is the
  //                     only key the signup webhook can write.
  //   tokenIdentifier — the canonical auth key per Convex guidelines. Optional
  //                     because it is unknown between signup and the first
  //                     authenticated request, where it gets backfilled.
  //
  // Auth helpers look up by tokenIdentifier, fall back to clerkUserId, and
  // backfill on miss. Never trust a user id passed as a function argument.

  students: defineTable({
    tokenIdentifier: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(gender),
    address: v.optional(v.string()),
    village: v.optional(v.string()),
    mandal: v.optional(v.string()),
    district: v.optional(v.string()),
    pincode: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  admins: defineTable({
    // Both optional: admins are pre-authorized by email before the person has
    // a Clerk account. Bound on first authenticated write. See lookupAdmin.
    tokenIdentifier: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("super_admin")),
    createdBy: v.optional(v.id("admins")),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Scholarship applications ------------------------------------------------

  applications: defineTable({
    applicationId: v.string(), // human-readable, VF-00000000
    studentId: v.id("students"),
    previousApplicationId: v.optional(v.id("applications")), // renewal self-link
    applicationType: v.union(v.literal("first-year"), v.literal("second-year")),
    academicYear: v.string(),
    status: reviewStatus,

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

    // Admin review
    reviewedBy: v.optional(v.id("admins")),
    reviewedAt: v.optional(v.number()),
    reviewerNotes: v.optional(v.string()),

    // Spotlight promotion (admin-enabled on an approved application)
    spotlightEnabled: v.optional(v.boolean()),
    spotlightEnabledAt: v.optional(v.number()),
    spotlightStory: v.optional(v.string()),
    spotlightOrder: v.optional(v.number()),
    spotlightAnnualNeed: v.optional(v.number()),
    isSpotlightEligible: v.optional(v.boolean()),

    // Denormalized "fullName email applicationId" — Convex search indexes cover
    // one field, and the admin list searches across all three.
    searchText: v.string(),

    updatedAt: v.optional(v.number()),
  })
    .index("by_studentId", ["studentId"])
    .index("by_status", ["status"])
    .index("by_applicationId", ["applicationId"])
    .index("by_spotlightEnabled_and_spotlightOrder", [
      "spotlightEnabled",
      "spotlightOrder",
    ])
    .index("by_studentId_and_applicationType_and_academicYear", [
      "studentId",
      "applicationType",
      "academicYear",
    ])
    .searchIndex("search_all", {
      searchField: "searchText",
      filterFields: ["status", "applicationType"],
    }),

  applicationDocuments: defineTable({
    applicationId: v.id("applications"),
    documentType: v.union(
      v.literal("student_photo"),
      v.literal("ssc_marksheet"),
      v.literal("aadhar_student"),
      v.literal("aadhar_parent"),
      v.literal("bonafide_certificate"),
      v.literal("bank_passbook"),
      v.literal("first_year_marksheet"),
      v.literal("mango_plant_photo"),
    ),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_applicationId_and_documentType", ["applicationId", "documentType"]),

  // Spotlight applications --------------------------------------------------

  spotlightApplications: defineTable({
    spotlightId: v.string(), // human-readable, VS-00000000
    studentId: v.id("students"),
    status: reviewStatus,

    // Personal
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.optional(gender),
    village: v.string(),
    mandal: v.string(),
    district: v.string(),
    state: v.string(),
    pincode: v.string(),

    // Education
    collegeName: v.string(),
    courseStream: v.string(),
    totalMarks: v.number(),
    maxMarks: v.number(),
    percentage: v.number(),
    yearOfCompletion: v.number(),
    currentStatus: v.union(
      v.literal("studying"),
      v.literal("seeking_admission"),
      v.literal("working"),
      v.literal("other"),
    ),

    // Bounded inline arrays: exams are realistically 1-5 entries and
    // circumstances is a fixed checkbox list, so neither risks the 1MB
    // document limit that makes unbounded arrays a problem.
    competitiveExams: v.optional(
      v.array(
        v.object({
          exam: v.string(),
          score: v.optional(v.string()),
          rank: v.optional(v.number()),
          percentile: v.optional(v.number()),
        }),
      ),
    ),
    circumstances: v.optional(v.array(v.string())),
    circumstancesOther: v.optional(v.string()),

    // Family — parent fields are conditional on parentStatus
    parentStatus: v.union(
      v.literal("both_alive"),
      v.literal("single_parent_father"),
      v.literal("single_parent_mother"),
      v.literal("orphan"),
    ),
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

    // Admin review
    reviewedBy: v.optional(v.id("admins")),
    reviewedAt: v.optional(v.number()),
    reviewerNotes: v.optional(v.string()),

    // Featured on the public site
    isFeatured: v.optional(v.boolean()),
    featuredAt: v.optional(v.number()),
    featuredOrder: v.optional(v.number()),

    searchText: v.string(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_studentId", ["studentId"])
    .index("by_status", ["status"])
    .index("by_spotlightId", ["spotlightId"])
    .index("by_isFeatured_and_featuredOrder", ["isFeatured", "featuredOrder"])
    .searchIndex("search_all", {
      searchField: "searchText",
      filterFields: ["status"],
    }),

  spotlightDocuments: defineTable({
    spotlightApplicationId: v.id("spotlightApplications"),
    documentType: v.union(
      v.literal("photo"),
      v.literal("marksheet"),
      v.literal("aadhar"),
      v.literal("income_certificate"),
      v.literal("other"),
    ),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  })
    .index("by_spotlightApplicationId", ["spotlightApplicationId"])
    .index("by_spotlightApplicationId_and_documentType", [
      "spotlightApplicationId",
      "documentType",
    ]),

  // Donations & leads -------------------------------------------------------

  donations: defineTable({
    donationId: v.string(), // human-readable, DON-00000000
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    paymentMethod: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    confirmedBy: v.optional(v.id("admins")),
    confirmedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_donationId", ["donationId"]),

  helpInterests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    helpType: v.union(
      v.literal("donate"),
      v.literal("volunteer"),
      v.literal("corporate"),
      v.literal("other"),
    ),
    message: v.optional(v.string()),
    studentId: v.optional(v.id("students")),
    studentName: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("closed"),
    ),
    followedUpBy: v.optional(v.id("admins")),
    followedUpAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  // Audit trail -------------------------------------------------------------
  //
  // entityId is a plain string because the log spans several tables, so it
  // cannot be a v.id() of any single one.

  adminActivityLog: defineTable({
    adminId: v.id("admins"),
    actionType: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
  })
    .index("by_adminId", ["adminId"])
    .index("by_entityType_and_entityId", ["entityType", "entityId"]),

  // Email — infrastructure for Phase 6, currently unused --------------------

  emailTemplates: defineTable({
    name: v.string(),
    displayName: v.string(),
    subject: v.string(),
    body: v.string(),
    variables: v.optional(v.array(v.string())),
    isEnabled: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("admins")),
    updatedAt: v.optional(v.number()),
  }).index("by_name", ["name"]),

  emailLogs: defineTable({
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    templateName: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    resendId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    sentBy: v.optional(v.id("admins")),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_recipientEmail", ["recipientEmail"]),
})
