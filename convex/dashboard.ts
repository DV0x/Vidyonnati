import { query } from "./_generated/server"
import { getIdentity, lookupStudent } from "./lib/auth"
import { listApplications, listSpotlightApplications } from "./lib/studentData"

// The single query behind /dashboard and /dashboard/applications.
//
// Both screens need scholarship applications AND spotlight applications, and
// the rendering plan allows one preloadQuery per page — multiple preloads are
// not guaranteed consistent with each other, so a page that preloaded the two
// lists separately could render a total that matches neither. Merging them into
// one query makes that unrepresentable.
//
// Returns null when unauthenticated rather than throwing, so a signed-out
// visitor gets the redirect from proxy.ts instead of a server render crash.
//
// A student with no profile row yet returns empty lists rather than an error.
// AuthContext calls ensureStudentProfile on session start, but that is a
// mutation racing this read on a brand-new account; "no applications" is the
// truthful answer in that window, and the profile lands moments later.
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx)
    if (!identity) return null

    const student = await lookupStudent(ctx, identity)
    if (!student) {
      return { student: null, applications: [], spotlightApplications: [] }
    }

    const [applications, spotlightApplications] = await Promise.all([
      listApplications(ctx, student._id),
      listSpotlightApplications(ctx, student._id),
    ])

    return { student, applications, spotlightApplications }
  },
})
