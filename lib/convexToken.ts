import { auth } from "@clerk/nextjs/server"

// The Clerk session token to hand to Convex from a Server Component, for
// preloadQuery / fetchQuery / fetchMutation.
//
// ─────────────────────────────────────────────────────────────────────────────
// getToken() takes NO template argument. Do not add one.
//
// The Clerk Convex integration (dashboard.clerk.com/apps/setup/convex, enabled
// per instance) adds `aud: "convex"` to Clerk's DEFAULT session token. There is
// no JWT template involved, and creating one named "convex" actively breaks
// things: ConvexProviderWithClerk branches on `sessionClaims?.aud === "convex"`,
// so a hand-made template forces the legacy path, and a hand-made template
// carries only the claims it declares — silently dropping the `email` and
// `name` claims added via session-token customization.
//
// This cost several debugging rounds once already. See CLAUDE.md.
// ─────────────────────────────────────────────────────────────────────────────
//
// Returns undefined rather than null when signed out, because that is what
// convex/nextjs's `token?: string` option expects. An undefined token produces
// an unauthenticated query, which the queries handle by returning null — the
// signed-out visitor gets redirected by proxy.ts rather than seeing a crash.
export async function convexToken(): Promise<string | undefined> {
  const { getToken } = await auth()
  return (await getToken()) ?? undefined
}
