import { v } from "convex/values"
import { ConvexError } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import type { PaginationOptions } from "convex/server"
import { query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import { requireAdmin } from "./lib/auth"
import { counterKeys, readCounter } from "./lib/counters"

// Admin-facing reads. Every handler calls requireAdmin first — Convex has no
// row-level security and proxy.ts route matching is only a UX affordance, so
// this call is the actual access control for the whole admin surface.
//
// Lists are paginated rather than offset-based. The Supabase routes used
// .range(from, to) with a "page N of M" UI, which needs a total count; counting
// means reading every matching row, which defeats the pagination. Cursor
// pagination plus load-more is both cheaper and better UX for a review queue.
// The UI change lands in Phase 2b.

const reviewStatus = v.union(
  v.literal("pending"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_info"),
)

const MAX_DOCUMENTS = 32
const MAX_FEATURED = 100

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

// Five indexed point reads against the counters table rather than five counting
// scans — see lib/counters.ts for why, and for what Phase 3 owes these.
//
// The old route issued two separate fetches for stats and recent activity. They
// are deliberately NOT merged here: /admin should use one preloadQuery, and
// merging is a Phase 2b concern once that page becomes a Server Component. Note
// activity is paginated and this is not, so the merge is a wrapper query, not a
// change to either of these.
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const [
      pendingApplications,
      pendingSpotlight,
      newHelpInterests,
      pendingDonations,
      featuredStudents,
    ] = await Promise.all([
      readCounter(ctx, counterKeys.applicationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightByStatus("pending")),
      readCounter(ctx, counterKeys.helpInterestsByStatus("new")),
      readCounter(ctx, counterKeys.donationsByStatus("pending")),
      readCounter(ctx, counterKeys.spotlightFeatured()),
    ])

    return {
      // The tile is a single "needs review" number covering both queues, which
      // is how the Supabase route summed it too.
      pendingApplications: pendingApplications + pendingSpotlight,
      newHelpInterests,
      pendingDonations,
      featuredStudents,
    }
  },
})

// ---------------------------------------------------------------------------
// Scholarship applications
// ---------------------------------------------------------------------------

export const applications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(reviewStatus),
    applicationType: v.optional(
      v.union(v.literal("first-year"), v.literal("second-year")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    // A search index narrows on its declared filterFields, so status and type
    // ride along inside the search rather than being filtered afterwards.
    // Results come back by relevance; a search index cannot also be ordered.
    if (search) {
      return await ctx.db
        .query("applications")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.applicationType) {
            builder = builder.eq("applicationType", args.applicationType)
          }
          return builder
        })
        .paginate(args.paginationOpts)
    }

    // by_status is (status, _creationTime), so descending yields newest-first
    // within the selected status — what the review queue wants.
    if (args.status) {
      const byStatus = ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      // Type is an extra predicate this index cannot express. Filtering after
      // the index scan is the documented fallback; it narrows the page without
      // reducing rows read, which is acceptable at review-queue scale.
      return await (args.applicationType
        ? byStatus.filter((q) =>
            q.eq(q.field("applicationType"), args.applicationType!),
          )
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.applicationType) {
      return await ctx.db
        .query("applications")
        .withIndex("by_applicationType", (q) =>
          q.eq("applicationType", args.applicationType!),
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("applications")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const application = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const app = await ctx.db.get("applications", args.applicationId)
    if (!app) throw new ConvexError("Application not found")

    const docs = await ctx.db
      .query("applicationDocuments")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", app._id))
      .take(MAX_DOCUMENTS)

    // Metadata without URLs. Admins reviewing Aadhaar cards and bank passbooks
    // are exactly the case the Phase 4 storage decision is about; minting a
    // permanent ctx.storage.getUrl() here would pre-empt it.
    return {
      ...app,
      student: await studentSummary(ctx, app.studentId),
      documents: docs.map((doc) => ({
        _id: doc._id,
        _creationTime: doc._creationTime,
        documentType: doc.documentType,
        storageId: doc.storageId,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      })),
    }
  },
})

// ---------------------------------------------------------------------------
// Spotlight applications
// ---------------------------------------------------------------------------

export const spotlightApplications = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(reviewStatus),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("spotlightApplications")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.isFeatured !== undefined) {
            builder = builder.eq("isFeatured", args.isFeatured)
          }
          return builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      const byStatus = ctx.db
        .query("spotlightApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      return await (args.isFeatured !== undefined
        ? byStatus.filter((q) => q.eq(q.field("isFeatured"), args.isFeatured!))
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.isFeatured !== undefined) {
      // by_isFeatured, not by_isFeatured_and_featuredOrder: this list is ranked
      // newest-first like every other filter on this screen, and the _and_
      // variant would rank by display order instead.
      return await ctx.db
        .query("spotlightApplications")
        .withIndex("by_isFeatured", (q) => q.eq("isFeatured", args.isFeatured!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("spotlightApplications")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const spotlightApplication = query({
  args: { spotlightApplicationId: v.id("spotlightApplications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const app = await ctx.db.get(
      "spotlightApplications",
      args.spotlightApplicationId,
    )
    if (!app) throw new ConvexError("Spotlight application not found")

    const docs = await ctx.db
      .query("spotlightDocuments")
      .withIndex("by_spotlightApplicationId", (q) =>
        q.eq("spotlightApplicationId", app._id),
      )
      .take(MAX_DOCUMENTS)

    return {
      ...app,
      student: await studentSummary(ctx, app.studentId),
      documents: docs.map((doc) => ({
        _id: doc._id,
        _creationTime: doc._creationTime,
        documentType: doc.documentType,
        storageId: doc.storageId,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      })),
    }
  },
})

// ---------------------------------------------------------------------------
// Featured students (the reorder screen)
// ---------------------------------------------------------------------------

type FeaturedRow = {
  id: string
  displayId: string
  fullName: string
  email: string
  story: string | null
  annualNeed: number | null
  isFeatured: boolean
  featuredAt: number | null
  order: number | null
  status: string
  source: "scholarship" | "spotlight"
  photoUrl: string | null
}

export const featured = query({
  args: {},
  handler: async (ctx): Promise<FeaturedRow[]> => {
    await requireAdmin(ctx)

    const scholarship = await ctx.db
      .query("applications")
      .withIndex("by_spotlightEnabled_and_spotlightOrder", (q) =>
        q.eq("spotlightEnabled", true),
      )
      .take(MAX_FEATURED)

    const spotlight = await ctx.db
      .query("spotlightApplications")
      .withIndex("by_isFeatured_and_featuredOrder", (q) =>
        q.eq("isFeatured", true),
      )
      .take(MAX_FEATURED)

    const scholarshipRows: FeaturedRow[] = scholarship.map((s) => ({
      id: s._id,
      displayId: s.applicationId,
      fullName: s.fullName,
      email: s.email,
      story: s.spotlightStory ?? null,
      annualNeed: s.spotlightAnnualNeed ?? null,
      isFeatured: s.spotlightEnabled ?? false,
      featuredAt: s.spotlightEnabledAt ?? null,
      order: s.spotlightOrder ?? null,
      status: s.status,
      source: "scholarship",
      photoUrl: null,
    }))

    const spotlightRows: FeaturedRow[] = await Promise.all(
      spotlight.map(async (s) => {
        // The Supabase table had a photo_url column; the Convex schema does not
        // carry one, so the photo comes from the documents table like it does
        // in featured.ts. This is a public-facing photo, so a plain storage URL
        // is the agreed treatment.
        const photo = await ctx.db
          .query("spotlightDocuments")
          .withIndex("by_spotlightApplicationId_and_documentType", (q) =>
            q.eq("spotlightApplicationId", s._id).eq("documentType", "photo"),
          )
          .first()

        return {
          id: s._id,
          displayId: s.spotlightId,
          fullName: s.fullName,
          email: s.email,
          story: s.backgroundStory,
          annualNeed: s.annualFinancialNeed,
          isFeatured: s.isFeatured ?? false,
          featuredAt: s.featuredAt ?? null,
          order: s.featuredOrder ?? null,
          status: s.status,
          source: "spotlight" as const,
          photoUrl: photo ? await ctx.storage.getUrl(photo.storageId) : null,
        }
      }),
    )

    // Unset order sorts last, matching the route's nullsFirst: false.
    return [...scholarshipRows, ...spotlightRows].sort((a, b) => {
      if (a.order === null && b.order === null) return 0
      if (a.order === null) return 1
      if (b.order === null) return -1
      return a.order - b.order
    })
  },
})

// ---------------------------------------------------------------------------
// Donations and help interests
// ---------------------------------------------------------------------------

export const donations = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("donations")
        .withSearchIndex("search_all", (q) => {
          const builder = q.search("searchText", search)
          return args.status ? builder.eq("status", args.status) : builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      return await ctx.db
        .query("donations")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("donations")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const helpInterests = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("converted"),
        v.literal("closed"),
      ),
    ),
    helpType: v.optional(
      v.union(
        v.literal("donate"),
        v.literal("volunteer"),
        v.literal("corporate"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const search = args.search?.trim()

    if (search) {
      return await ctx.db
        .query("helpInterests")
        .withSearchIndex("search_all", (q) => {
          let builder = q.search("searchText", search)
          if (args.status) builder = builder.eq("status", args.status)
          if (args.helpType) builder = builder.eq("helpType", args.helpType)
          return builder
        })
        .paginate(args.paginationOpts)
    }

    if (args.status) {
      const byStatus = ctx.db
        .query("helpInterests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")

      return await (args.helpType
        ? byStatus.filter((q) => q.eq(q.field("helpType"), args.helpType!))
        : byStatus
      ).paginate(args.paginationOpts)
    }

    if (args.helpType) {
      return await ctx.db
        .query("helpInterests")
        .withIndex("by_helpType", (q) => q.eq("helpType", args.helpType!))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("helpInterests")
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export const activityLog = query({
  args: {
    paginationOpts: paginationOptsValidator,
    actionType: v.optional(v.string()),
    entityType: v.optional(v.string()),
    adminId: v.optional(v.id("admins")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const result = await paginateActivityLog(ctx, args)

    // Enrich just the page, not the whole table. An activity row stores adminId
    // only, and the log viewer shows who did it.
    const adminCache = new Map<Id<"admins">, { name: string; email: string }>()
    const page = await Promise.all(
      result.page.map(async (entry) => {
        let who = adminCache.get(entry.adminId)
        if (!who) {
          const admin = await ctx.db.get("admins", entry.adminId)
          who = admin
            ? { name: admin.name ?? admin.email, email: admin.email }
            : { name: "Unknown", email: "" }
          adminCache.set(entry.adminId, who)
        }
        return { ...entry, admin: who }
      }),
    )

    return { ...result, page }
  },
})

async function paginateActivityLog(
  ctx: QueryCtx,
  args: {
    paginationOpts: PaginationOptions
    actionType?: string
    entityType?: string
    adminId?: Id<"admins">
  },
) {
  // Pick the index by whichever filter is present and most selective: a
  // specific admin narrows harder than an action type, which narrows harder
  // than an entity type. Whatever the index does not cover becomes a chained
  // .filter(), which ANDs and returns the same query type.
  const base = args.adminId
    ? ctx.db
        .query("adminActivityLog")
        .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId!))
    : args.actionType
      ? ctx.db
          .query("adminActivityLog")
          .withIndex("by_actionType", (q) => q.eq("actionType", args.actionType!))
      : args.entityType
        ? // by_entityType_and_entityId, queried on its first field only.
          ctx.db
            .query("adminActivityLog")
            .withIndex("by_entityType_and_entityId", (q) =>
              q.eq("entityType", args.entityType!),
            )
        : ctx.db.query("adminActivityLog")

  let q = base.order("desc")
  if (args.actionType && args.adminId) {
    q = q.filter((f) => f.eq(f.field("actionType"), args.actionType!))
  }
  if (args.entityType && (args.adminId || args.actionType)) {
    q = q.filter((f) => f.eq(f.field("entityType"), args.entityType!))
  }

  return await q.paginate(args.paginationOpts)
}

// Populates the activity log's "filter by admin" dropdown. Split out of
// activityLog because that query is paginated and this list is not — folding a
// full-table read into a paginated query would defeat the pagination.
export const admins = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const rows = await ctx.db.query("admins").take(200)
    return rows.map((a) => ({
      _id: a._id,
      name: a.name ?? null,
      email: a.email,
      role: a.role,
    }))
  },
})

// ---------------------------------------------------------------------------

// The reviewer needs to know whose application this is. Projected rather than
// returned whole: the students row carries address and phone that the review
// screens do not display.
async function studentSummary(ctx: QueryCtx, studentId: Id<"students">) {
  const student: Doc<"students"> | null = await ctx.db.get("students", studentId)
  if (!student) return null
  return {
    _id: student._id,
    email: student.email,
    fullName: student.fullName ?? null,
    phone: student.phone ?? null,
  }
}
