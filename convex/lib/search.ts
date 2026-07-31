// Builders for the denormalized `searchText` field.
//
// A Convex search index covers exactly one field, but every admin list searches
// across three columns (the Supabase version ORed three ILIKEs). So each
// searchable table carries a `searchText` string concatenating those columns,
// with a single `search_all` index over it.
//
// These live here rather than inline in the mutations so the read side and the
// write side cannot drift: whatever a list query searches is whatever the
// create/update mutation wrote. Every mutation that touches one of these tables
// must recompute searchText — it is not derived automatically.
//
// Phase 3 owns the call sites. Phase 2a only reads.

function compose(...parts: Array<string | undefined | null>): string {
  return parts
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(" ")
}

export function applicationSearchText(app: {
  fullName: string
  email: string
  applicationId: string
}): string {
  return compose(app.fullName, app.email, app.applicationId)
}

export function spotlightSearchText(app: {
  fullName: string
  email: string
  spotlightId: string
}): string {
  return compose(app.fullName, app.email, app.spotlightId)
}

export function donationSearchText(donation: {
  donorName: string
  donorEmail: string
  donationId: string
}): string {
  return compose(donation.donorName, donation.donorEmail, donation.donationId)
}

export function helpInterestSearchText(interest: {
  name: string
  email: string
  studentName?: string
}): string {
  return compose(interest.name, interest.email, interest.studentName)
}
