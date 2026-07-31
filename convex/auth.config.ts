// Convex validates Clerk-issued JWTs against this config.
//
// MANDATORY: without this file, ctx.auth.getUserIdentity() returns null in every
// query, mutation, and action — silently, with no error. If auth "works" in the
// browser but the backend sees no user, check here first.
//
// CLERK_JWT_ISSUER_DOMAIN is a CONVEX environment variable, not a Next.js one.
// It is read on the Convex deployment, so it must be set with:
//
//   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<frontend-api-url>
//
// Putting it in .env.local does nothing for this file.
//
// The value differs per environment and per Clerk instance:
//   dev  → the development instance's Frontend API (https://<slug>.clerk.accounts.dev)
//   prod → https://clerk.vidyonnatifoundation.org
//
// Convex fetches {domain}/.well-known/openid-configuration to discover the JWKS
// endpoint. applicationID is checked against the JWT's `aud` claim, which
// Clerk's Convex integration sets to "convex".
//
// After changing this file, re-run `npx convex dev` so the backend picks it up.

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
}
