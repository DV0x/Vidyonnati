import { v } from "convex/values"
import { query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"

// Public, unauthenticated. Powers the homepage spotlight section.
//
// ─────────────────────────────────────────────────────────────────────────────
// READ THIS BEFORE ADDING A FIELD
//
// This is the only public read over `applications` and `spotlightApplications`,
// and those tables also hold bank account numbers, IFSC codes, phone numbers,
// dates of birth and Aadhaar document references. The Supabase route was safe
// only because it hand-picked columns in .select(). Convex has no such
// narrowing — ctx.db.query() hands back whole documents — so the projection
// below IS the security boundary.
//
// Return exactly the fields in FeaturedStudent, which mirrors the `Student`
// interface in app/components/StudentCard.tsx. Never spread a document into
// the result, and never add a field here without deciding it is public.
// ─────────────────────────────────────────────────────────────────────────────

type FeaturedStudent = {
  id: string
  name: string
  image: string | null
  field: string
  location: string
  dream: string
  background: string
  achievement: string | null
  annualNeed: number
  gender: string
  source: "scholarship" | "spotlight"
}

// Featured students are hand-curated and change a few times a year, so the
// realistic set is single digits. This ceiling exists to keep the read bounded
// per the Convex guidelines, not because the number is expected to be reached.
// It also caps `total` — acceptable because the UI renders it as "N+".
const MAX_FEATURED = 100

function spotlightAchievement(app: Doc<"spotlightApplications">): string | null {
  // competitiveExams is a typed array in Convex; the Supabase version had to
  // cast it out of a Json column and guard the shape by hand.
  const first = app.competitiveExams?.[0]
  if (first?.exam && first.score) return `${first.exam}: ${first.score}`
  if (app.percentage > 0) return `Scored ${app.percentage}%`
  return null
}

function scholarshipAchievement(app: Doc<"applications">): string | null {
  if (app.sscPercentage > 0) return `SSC: ${app.sscPercentage}%`
  const firstYear = app.firstYearPercentage
  if (firstYear && firstYear > 0) return `1st Year: ${firstYear}%`
  return null
}

async function photoUrl(
  ctx: QueryCtx,
  storageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (!storageId) return null
  return await ctx.storage.getUrl(storageId)
}

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ students: FeaturedStudent[]; total: number }> => {
    // Both index ranges are equality-bounded on the featured flag, so these
    // read only featured rows rather than scanning the tables.
    const spotlightApps = await ctx.db
      .query("spotlightApplications")
      .withIndex("by_isFeatured_and_featuredOrder", (q) => q.eq("isFeatured", true))
      .take(MAX_FEATURED)

    const scholarshipApps = await ctx.db
      .query("applications")
      .withIndex("by_spotlightEnabled_and_spotlightOrder", (q) =>
        q.eq("spotlightEnabled", true),
      )
      .take(MAX_FEATURED)

    const spotlightRows = await Promise.all(
      spotlightApps.map(async (app) => {
        const doc = await ctx.db
          .query("spotlightDocuments")
          .withIndex("by_spotlightApplicationId_and_documentType", (q) =>
            q.eq("spotlightApplicationId", app._id).eq("documentType", "photo"),
          )
          .first()

        const student: FeaturedStudent = {
          id: app._id,
          name: app.fullName,
          image: await photoUrl(ctx, doc?.storageId),
          field: app.courseStream || "Student",
          location: app.district || "",
          dream: app.dreamsGoals || "",
          background: app.backgroundStory || "",
          achievement: spotlightAchievement(app),
          annualNeed: app.annualFinancialNeed || 0,
          gender: app.gender || "male",
          source: "spotlight",
        }
        return { student, order: app.featuredOrder }
      }),
    )

    const scholarshipRows = await Promise.all(
      scholarshipApps.map(async (app) => {
        const doc = await ctx.db
          .query("applicationDocuments")
          .withIndex("by_applicationId_and_documentType", (q) =>
            q.eq("applicationId", app._id).eq("documentType", "student_photo"),
          )
          .first()

        const student: FeaturedStudent = {
          id: app._id,
          name: app.fullName,
          image: await photoUrl(ctx, doc?.storageId),
          field: app.courseStudying || app.courseJoined || "Student",
          location: app.district || "",
          dream: app.goalsDreams || "",
          background: app.spotlightStory || "",
          achievement: scholarshipAchievement(app),
          annualNeed: app.spotlightAnnualNeed || 0,
          gender: app.gender || "male",
          source: "scholarship",
        }
        return { student, order: app.spotlightOrder }
      }),
    )

    // Sorted in JS rather than relying on index order for two reasons: the two
    // sets have to be interleaved into one ranking, and unset order values must
    // sort last. A Convex index sorts undefined first, and the Supabase query
    // asked for nullsFirst: false — so index order alone would invert this.
    const ranked = [...spotlightRows, ...scholarshipRows].sort((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0
      if (a.order === undefined) return 1
      if (b.order === undefined) return -1
      return a.order - b.order
    })

    const limit = args.limit && args.limit > 0 ? args.limit : ranked.length

    return {
      students: ranked.slice(0, limit).map((r) => r.student),
      total: ranked.length,
    }
  },
})
