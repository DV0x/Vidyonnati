# Supabase → Convex Migration Plan

Migrating Vidyonnati Foundation from Supabase (Postgres + Auth + Storage) to Convex + Clerk.

**Status:** Phase 0 (backend) and Phase 0.5 complete. Phase 1 blocked on Clerk setup.
**Date:** 2026-07-31

| Phase | Status |
|---|---|
| 0 — Convex setup | ✅ Done |
| 0.5 — Hardening | ✅ Done |
| 1 — Schema + auth | ✅ Done — see caveats below |
| 2–6 | Not started |

**Phase 1 complete.** Clerk is the identity provider; `AuthContext` reads Clerk + Convex; `/login`, `/register`, and `/sso-callback` use Clerk custom flows. Deleted: `lib/supabase/proxy.ts`, `lib/supabase/client.ts`, `app/(auth)/callback/route.ts`.

**Expected breakage until Phase 2:** the 22 API routes still authenticate via `supabase.auth.getUser()` reading Supabase cookies that no longer exist, so every one now returns 401. Dashboards will render but show no data. This is the documented broken window — it closes as Phase 2 replaces those routes with Convex queries.

**Still outstanding from Phase 1:**
- Clerk `user.created` webhook → Convex HTTP action. Not built; the lazy `getOrCreateStudent` safety net covers it, so this is an optimization rather than a blocker.
- Admin seeding — no `admins` rows exist, so `isAdmin` is false for everyone and `/admin` is unreachable. Needs a Clerk user to exist first (the row keys off `clerkUserId`).
- **End-to-end signup has not been tested.** Everything below is verified by inspection, not by an actual session.

### Clerk configuration state (both instances)

| Item | Dev (`close-garfish-21`) | Production (`clerk.vidyonnatifoundation.org`) |
|---|---|---|
| Instance reachable | ✅ | ✅ DNS + TLS verified |
| `convex` JWT template | ✅ created via Backend API | ✅ created via Backend API |
| Google OAuth | ✅ Clerk shared credentials | ✅ custom credentials (reused the Supabase Google client) |
| Convex `CLERK_JWT_ISSUER_DOMAIN` | ✅ dev issuer | ❌ no production Convex deployment yet |

### Do NOT create a `convex` JWT template

An earlier version of this plan said to create one. **That was wrong** and cost several debugging rounds. Recorded so nobody repeats it.

The Clerk **Convex integration** (`dashboard.clerk.com/apps/setup/convex`, enabled **per instance** — dev and production separately) adds `aud: "convex"` to Clerk's *default session token*. No JWT template is involved. `ConvexProviderWithClerk` branches on exactly this:

```js
if (sessionClaims?.aud === "convex") getToken({...})              // integration path — correct
else                                 getToken({ template: "convex", ...})  // legacy fallback
```

Hand-creating a template forces the legacy branch, and a hand-made template contains only the claims you specify — so it silently drops `email`. Both templates were deleted once the integration was enabled.

### Clerk's session token has no email or name

Verified by logging a real `UserIdentity`:

```json
{"tokenIdentifier":"https://<issuer>|user_xxx","issuer":"https://<issuer>",
 "subject":"user_xxx","sid":"sess_xxx","sts":"active","v":2}
```

Six claims. The token rides in a cookie with a 4KB ceiling, so Clerk keeps it minimal. `identity.email` and `identity.name` are **undefined** with the default setup.

`getOrCreateStudent` therefore accepts an optional `{ email, fullName }` fallback that the client reads from Clerk's `useUser()`. Identity itself (`subject`, `tokenIdentifier`) always comes from the token and is never client-supplied, so this doesn't weaken authorization — the fallback is profile data only.

**Session token customized — done on both instances.** `{ "email": "{{user.primary_email_address}}", "name": "{{user.full_name}}" }` added via Clerk → Sessions. Verified by logging a real identity:

```json
{"tokenIdentifier":"https://<issuer>|user_xxx","issuer":"...","subject":"user_xxx",
 "name":"invictus D","email":"alphasapien17@gmail.com","sid":"...","sts":"active","v":2}
```

`identity.email` now wins the `??`, so the address is attested by Clerk rather than asserted by the browser — which matters because the foundation emails applicants about decisions. The client fallback is retained deliberately: it costs nothing and keeps signup working if the token config ever drifts.

**Deploy-order note.** A transient `ArgumentValidationError: Object contains extra field 'email'` appeared during dev when Next hot-reloaded the client before Convex finished deploying the matching validator. Convex validates arguments strictly, so **deploy Convex functions before the frontend** in production, or clients will briefly call validators that don't accept their arguments yet.

**Debugging note:** `ConvexProviderWithClerk` swallows token-fetch failures (`catch { return null }`), and `AuthContext` catches mutation errors to `console.error`. Auth failures are therefore silent in both directions — `npx convex logs` is the tool that actually shows what happened.

Google OAuth note: the production connection reuses the existing Google Cloud OAuth client from Supabase, with Clerk's redirect URI added alongside the Supabase one. That preserves the already-verified consent screen. `prompt: select_account` from the Supabase code maps to Clerk's **Always show account selector prompt** toggle.

**Deployment:** `dev:unique-dodo-576` — team `vidyonnati-fondation`, project `vidyonnati-foundation`.
12 tables, 27 indexes, 2 search indexes deployed. Note Convex appends `_creationTime` to every
index, so `by_status` is really `(status, _creationTime)` — free chronological ordering within each
status bucket, which is exactly what the admin review queues need.

---

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | **Clerk** | Convex's own docs mark Convex Auth as beta with *experimental* Next.js support. This is a production site holding Aadhaar and bank data — beta auth is not appropriate. Clerk has the most mature Convex + Next.js App Router integration, and `clerkMiddleware()` supports the Next 16 `proxy.ts` filename. |
| Data migration | **None** | No production data to preserve. Build the Convex schema fresh. This removes the entire export/transform/import workstream and the password-hash problem. |
| API layer | **Delete** | Client components call Convex directly. Removes ~3,000 lines across 22 routes; dashboards become realtime for free. |
| Rendering | **Server-first, three tiers** | Public pages server-rendered for SEO; dashboards get server-rendered first paint *plus* live reactivity via `preloadQuery`. See below. |
| Hardening | **Phase 0.5, before data work** | Type checking, lint, error boundaries, server-side validation, rate limiting. Done first so the type checker is live during the port. |

Because there is no data to migrate, this is a **rewrite of the data layer, not a migration of data**. No cutover window, no dual-write period, no backfill.

---

## Why this codebase is well-shaped for Convex

All 72 `.tsx` files are `"use client"`. Every read and write already goes through `fetch('/api/...')`, so the migration is largely a **substitution at known call sites**.

Two other structural advantages:

- The API routes **already** do explicit `is_admin()` authorization checks in 13 places. Moving from RLS to in-function authorization is a pattern that already exists in this codebase, not a new one.
- The wizards already map snake_case DB fields to camelCase form fields by hand. Adopting Convex's camelCase convention **deletes that mapping layer** rather than adding one.

---

## Rendering Architecture (amended)

### The clarification that drives this

In Convex, `useQuery` is **not** browser-to-database access. It is an RPC to a server-side function: the client sends a function name plus arguments, and the server decides what runs, what is authorized, and what fields are returned. The client cannot construct a query.

This is categorically different from the current Supabase browser client, which issues `SELECT` statements directly from the browser with RLS as the only guard. **That model disappears with the migration regardless of rendering strategy.** Rendering is therefore a UX/SEO decision, not a security one.

### Why not make everything a Server Component

Pure RSC would discard Convex's reactivity — the main reason to adopt it. An admin would stop seeing new applications appear live.

`preloadQuery` avoids the tradeoff: it runs the query on the server during render and passes an opaque payload to a client component, where `usePreloadedQuery` picks it up and *retains reactivity after the initial page load*. Server-rendered first paint **and** a live subscription.

### Three tiers

| Tier | Pages | Method | Why |
|------|-------|--------|-----|
| **Public / static** | `/`, `/students`, `/spotlight`, `/about`, `/gallery`, `/media`, `/donate` | Server Component + `fetchQuery` with a revalidate window | Real content in the HTML for SEO. Featured students change a few times a year — they should be cached, not live. |
| **Authenticated / live** | `/dashboard/*`, `/admin/*` | Server Component `preloadQuery` → client `usePreloadedQuery` | Server-rendered first paint, live thereafter. Review queues genuinely benefit from realtime. |
| **Interactive / client** | `/apply`, `/spotlight/apply`, `/login`, `/register` | Client components + `useMutation` | 6- and 9-step wizards with RHF state, conditional fields, localStorage drafts, and file uploads. Irreducibly client-side — correct, not a compromise. |

Roughly 7 pages become fully server-rendered, ~13 get server-rendered first paint with live updates, 2 stay client.

### Two caveats

- **Do not use `preloadQuery` for public pages.** It sets `cache: 'no-store'`, which disables static rendering and would make the marketing pages fully dynamic. Use `fetchQuery` with caching/ISR instead.
- **One `preloadQuery` per page.** Multiple calls are not guaranteed consistent with each other. `/admin` currently makes two fetches (stats + activity log) — merge into a single query during the port.

### Do not use Server Actions

Wrapping a Convex mutation in a Next.js Server Action adds a hop in front of a function that already runs on the server with auth enforced. `useMutation` from a client component is simpler and more correct. Reserve `fetchMutation` for cases needing server-only secrets.

### SEO work unlocked

All 23 pages currently inherit only the root layout's metadata, because `export const metadata` is unavailable in client components. Once the public pages are Server Components:

- Per-page `metadata` exports (`/students`, `/spotlight`, `/about`, `/gallery`, `/media`)
- `app/sitemap.ts` and `app/robots.ts` — neither exists today
- Featured-student content present in the initial HTML

The root-layout metadata is already well-tuned (80G/CSR keywords, `en_IN`, OG images). The architecture is what has been undercutting it.

---

## Target Architecture

```
proxy.ts → clerkMiddleware() → route protection
  │
  ▼
Next.js server
  │
  ├── Public pages (RSC) ──── fetchQuery + revalidate ──┐
  │     └── real HTML, per-page metadata, sitemap       │
  │                                                     │
  ├── Dashboards (RSC shell) ─ preloadQuery ────────────┤
  │     └── passes Preloaded → client component         │
  │           └── usePreloadedQuery ── live socket ─────┤
  │                                                     ▼
  └── Wizards (client) ─────── useMutation ──────> Convex functions
                                                    ├── arg validators (v.*)
                                                    ├── Zod domain rules
                                                    ├── authorization helpers
                                                    ├── rate limiter
                                                    ├── schema + indexes
                                                    └── file storage

ClerkProvider > ConvexProviderWithClerk > AuthProvider (shape preserved)
<a href> for private documents ──> Convex HTTP action (token-authorized)
```

**Deleted entirely:** `app/api/**` (22 routes), `lib/supabase/**` (4 clients), `types/database.ts` (871 lines, replaced by generated `convex/_generated/dataModel`), `@supabase/ssr`, `@supabase/supabase-js`.

---

## Convex Schema

Naming moves to camelCase (Convex convention, and it matches the form field names already used in the wizards). `_id` and `_creationTime` are built in, so `id` and `created_at` columns disappear.

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const applicationStatus = v.union(
  v.literal("pending"), v.literal("under_review"),
  v.literal("approved"), v.literal("rejected"), v.literal("needs_info"),
)

export default defineSchema({
  students: defineTable({
    tokenIdentifier: v.optional(v.string()),  // canonical auth key; see Identity Keying
    clerkUserId: v.string(),                  // webhook join key
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    address: v.optional(v.string()),
    village: v.optional(v.string()),
    mandal: v.optional(v.string()),
    district: v.optional(v.string()),
    pincode: v.optional(v.string()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  admins: defineTable({
    tokenIdentifier: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("super_admin")),
    createdBy: v.optional(v.id("admins")),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  applications: defineTable({
    applicationId: v.string(),           // VF-00000000
    studentId: v.id("students"),
    previousApplicationId: v.optional(v.id("applications")),
    applicationType: v.union(v.literal("first-year"), v.literal("second-year")),
    academicYear: v.string(),
    status: applicationStatus,

    // Personal
    fullName: v.string(), email: v.string(), phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    village: v.string(), mandal: v.string(), district: v.string(),
    pincode: v.string(), address: v.string(),

    // Family
    motherName: v.string(), fatherName: v.string(),
    guardianName: v.optional(v.string()),
    guardianRelationship: v.optional(v.string()),
    guardianDetails: v.optional(v.string()),
    motherOccupation: v.optional(v.string()),
    motherMobile: v.optional(v.string()),
    fatherOccupation: v.optional(v.string()),
    fatherMobile: v.optional(v.string()),
    familyAdultsCount: v.optional(v.number()),
    familyChildrenCount: v.optional(v.number()),
    annualFamilyIncome: v.optional(v.string()),

    // Education
    highSchoolStudied: v.string(),
    sscTotalMarks: v.number(), sscMaxMarks: v.number(), sscPercentage: v.number(),
    collegeAddress: v.string(), groupSubjects: v.string(),
    collegeAdmitted: v.optional(v.string()),
    courseJoined: v.optional(v.string()),
    dateOfAdmission: v.optional(v.string()),
    currentCollege: v.optional(v.string()),
    courseStudying: v.optional(v.string()),
    firstYearTotalMarks: v.optional(v.number()),
    firstYearMaxMarks: v.optional(v.number()),
    firstYearPercentage: v.optional(v.number()),

    // Bank
    bankAccountNumber: v.string(), bankNameBranch: v.string(), ifscCode: v.string(),

    // Essays (2nd year)
    studyActivities: v.optional(v.string()),
    goalsDreams: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),

    // Admin review
    reviewedBy: v.optional(v.id("admins")),
    reviewedAt: v.optional(v.number()),
    reviewerNotes: v.optional(v.string()),

    // Spotlight
    spotlightEnabled: v.optional(v.boolean()),
    spotlightEnabledAt: v.optional(v.number()),
    spotlightStory: v.optional(v.string()),
    spotlightOrder: v.optional(v.number()),
    spotlightAnnualNeed: v.optional(v.number()),
    isSpotlightEligible: v.optional(v.boolean()),

    searchText: v.string(),               // see "Search" below
  })
    .index("by_studentId", ["studentId"])
    .index("by_status", ["status"])
    .index("by_applicationId", ["applicationId"])
    .index("by_spotlightEnabled_and_spotlightOrder", ["spotlightEnabled", "spotlightOrder"])
    .index("by_studentId_and_applicationType_and_academicYear", ["studentId", "applicationType", "academicYear"])
    .searchIndex("search_all", { searchField: "searchText", filterFields: ["status", "applicationType"] }),

  applicationDocuments: defineTable({
    applicationId: v.id("applications"),
    documentType: v.union(
      v.literal("student_photo"), v.literal("ssc_marksheet"),
      v.literal("aadhar_student"), v.literal("aadhar_parent"),
      v.literal("bonafide_certificate"), v.literal("bank_passbook"),
      v.literal("first_year_marksheet"), v.literal("mango_plant_photo"),
    ),
    storageId: v.id("_storage"),
    fileName: v.string(), fileSize: v.number(), mimeType: v.string(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_applicationId_and_documentType", ["applicationId", "documentType"]),

  spotlightApplications: defineTable({
    spotlightId: v.string(),              // VS-00000000
    studentId: v.id("students"),
    status: applicationStatus,

    fullName: v.string(), email: v.string(), phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    village: v.string(), mandal: v.string(), district: v.string(),
    state: v.string(), pincode: v.string(),

    collegeName: v.string(), courseStream: v.string(),
    totalMarks: v.number(), maxMarks: v.number(), percentage: v.number(),
    yearOfCompletion: v.number(),
    currentStatus: v.union(
      v.literal("studying"), v.literal("seeking_admission"),
      v.literal("working"), v.literal("other"),
    ),

    // Was JSON in Postgres — native documents in Convex
    competitiveExams: v.optional(v.array(v.object({
      exam: v.string(),
      score: v.optional(v.string()),
      rank: v.optional(v.number()),
      percentile: v.optional(v.number()),
    }))),
    circumstances: v.optional(v.array(v.string())),
    circumstancesOther: v.optional(v.string()),

    parentStatus: v.union(
      v.literal("both_alive"), v.literal("single_parent_father"),
      v.literal("single_parent_mother"), v.literal("orphan"),
    ),
    motherName: v.optional(v.string()), motherOccupation: v.optional(v.string()),
    motherHealth: v.optional(v.string()),
    fatherName: v.optional(v.string()), fatherOccupation: v.optional(v.string()),
    fatherHealth: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianRelationship: v.optional(v.string()),
    guardianDetails: v.optional(v.string()),
    siblingsCount: v.optional(v.number()),
    annualFamilyIncome: v.optional(v.string()),

    backgroundStory: v.string(), dreamsGoals: v.string(),
    howHelpChangesLife: v.string(), annualFinancialNeed: v.number(),

    reviewedBy: v.optional(v.id("admins")),
    reviewedAt: v.optional(v.number()),
    reviewerNotes: v.optional(v.string()),

    isFeatured: v.optional(v.boolean()),
    featuredAt: v.optional(v.number()),
    featuredOrder: v.optional(v.number()),

    searchText: v.string(),
  })
    .index("by_studentId", ["studentId"])
    .index("by_status", ["status"])
    .index("by_spotlightId", ["spotlightId"])
    .index("by_isFeatured_and_featuredOrder", ["isFeatured", "featuredOrder"])
    .searchIndex("search_all", { searchField: "searchText", filterFields: ["status"] }),

  spotlightDocuments: defineTable({
    spotlightApplicationId: v.id("spotlightApplications"),
    documentType: v.union(
      v.literal("photo"), v.literal("marksheet"), v.literal("aadhar"),
      v.literal("income_certificate"), v.literal("other"),
    ),
    storageId: v.id("_storage"),
    fileName: v.string(), fileSize: v.number(), mimeType: v.string(),
  })
    .index("by_spotlightApplicationId", ["spotlightApplicationId"])
    .index("by_spotlightApplicationId_and_documentType", ["spotlightApplicationId", "documentType"]),

  donations: defineTable({
    donationId: v.string(),               // DON-00000000
    donorName: v.string(), donorEmail: v.string(), donorPhone: v.string(),
    amount: v.number(), currency: v.string(),
    status: v.union(
      v.literal("pending"), v.literal("confirmed"), v.literal("completed"),
      v.literal("failed"), v.literal("refunded"),
    ),
    paymentMethod: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    confirmedBy: v.optional(v.id("admins")),
    confirmedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_donationId", ["donationId"]),

  helpInterests: defineTable({
    name: v.string(), email: v.string(), phone: v.string(),
    helpType: v.union(
      v.literal("donate"), v.literal("volunteer"),
      v.literal("corporate"), v.literal("other"),
    ),
    message: v.optional(v.string()),
    studentId: v.optional(v.id("students")),
    studentName: v.optional(v.string()),
    status: v.union(
      v.literal("new"), v.literal("contacted"),
      v.literal("converted"), v.literal("closed"),
    ),
    followedUpBy: v.optional(v.id("admins")),
    followedUpAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_status", ["status"]),

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

  // Phase F infrastructure — carried over, still unused
  emailTemplates: defineTable({ /* ... */ }).index("by_name", ["name"]),
  emailLogs: defineTable({ /* ... */ }).index("by_status", ["status"]),
})
```

### Schema notes

- **`students.id === auth.users.id` invariant is gone.** In Convex the Clerk identity is a token string, not a document ID. Every table now references `v.id("students")` and identity resolves through the `by_tokenIdentifier` index. This is the single most pervasive change in the port.
- **JSON columns become native.** `competitive_exams` and `circumstances` were `Json` blobs cast through `Record<string, unknown>` in `app/api/featured-students/route.ts`. They are now typed arrays — the casts and the `deriveSpotlightAchievement` guard-rail code get simpler.
- **Timestamps become `v.number()`** (epoch ms), not ISO strings. `created_at`/`updated_at` are replaced by `_creationTime` and explicit `updatedAt` where mutation code needs it.
- **Index names follow the guideline convention** — every index field appears in its name (`by_studentId_and_applicationType_and_academicYear`). Index fields must also be *queried* in declaration order; querying by a different order needs a separate index.
- **The two array fields are deliberate.** The guidelines warn against unbounded arrays inside documents (1MB doc limit, full rewrite on every update). `competitiveExams` (realistically 1–5 entries) and `circumstances` (a fixed 10-option checkbox list) are both bounded and small, so they stay inline rather than becoming child tables. Revisit only if either grows unbounded.

---

## Auth Migration (Clerk)

> Grounded against the installed Convex agent skills (`.agents/skills/convex-setup-auth/`) and `convex/_generated/ai/guidelines.md`. Three rules below corrected an earlier draft of this plan.

### Identity keying — `tokenIdentifier`, not `subject`

The Convex guidelines are explicit and override recalled patterns:

> *"`tokenIdentifier` is guaranteed and is the canonical stable identifier for the authenticated identity. For any auth-linked database lookup or ownership check, prefer `identity.tokenIdentifier` over `identity.subject`. Do NOT use `identity.subject` alone as a global identity key."*

This creates one wrinkle. A Clerk `user.created` **webhook payload carries the Clerk user ID (`data.id`), not a `tokenIdentifier`** — the latter only exists on a validated JWT. So the schema stores both:

| Field | Written by | Used for |
|---|---|---|
| `clerkUserId` | Webhook on signup | Joining the webhook payload to the row |
| `tokenIdentifier` | Lazy fill on first authenticated request | All auth lookups and ownership checks |

`tokenIdentifier` is `v.optional()` because it is null in the window between signup and first authenticated request. Every auth helper looks up by `by_tokenIdentifier`, falls back to `by_clerkUserId` on miss, and backfills `tokenIdentifier` when it does.

Also non-negotiable, from the same guidelines: **never accept a user ID as a function argument for authorization.** Always derive identity server-side from `ctx.auth.getUserIdentity()`.

### `convex/auth.config.ts` is mandatory

> *"ALWAYS create this file when using authentication. Without it, `ctx.auth.getUserIdentity()` will always return `null`."*

```ts
// convex/auth.config.ts
export default {
  providers: [{ domain: process.env.CLERK_JWT_ISSUER_DOMAIN, applicationID: "convex" }],
}
```

`domain` is the Clerk Frontend API URL — Convex fetches `{domain}/.well-known/openid-configuration` to find the JWKS endpoint. `applicationID` is checked against the JWT `aud` claim. Note `CLERK_JWT_ISSUER_DOMAIN` and `CLERK_FRONTEND_API_URL` are **the same value** under two names; the skill reference calls this out as a common confusion.

After changing this file, re-run the Convex dev/deploy flow so the backend picks it up.

### `createRouteMatcher` is deprecated — migrate during Phase 2

`@clerk/nextjs` v7.6.3 emits at runtime:

> *"`createRouteMatcher` is deprecated and will be removed in the next major release. Use resource-based auth checks instead... Middleware-based auth checks rely on path matching, which can diverge from how Next.js routes requests and leave protected resources reachable."*

The current `proxy.ts` uses it and works. Clerk's objection is real but **does not describe this architecture's security boundary**: authorization lives in the Convex function bodies (`requireStudent` / `requireAdmin`), which run regardless of what middleware did. The middleware redirect is a *UX affordance* — send a logged-out visitor to `/login` instead of a broken page — not the thing standing between a user and someone else's bank details.

That said, it will be removed, and the migration lands naturally in Phase 2: once `/dashboard/*` and `/admin/*` become Server Components using `preloadQuery`, the auth check belongs in the page/layout that reads the data, which is exactly the resource-based pattern Clerk is pointing at. Do it then rather than twice.

Migration guide: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher

### Gate on `useConvexAuth()`, not Clerk state

The Clerk reference is explicit: *"Prefer `useConvexAuth()` over raw Clerk auth state when deciding whether Convex-authenticated UI can render."*

This matters for the `AuthContext` rewrite. Clerk can report signed-in **before** Convex has validated the token — gating on Clerk's `isLoaded` alone would fire queries that arrive unauthenticated. `AuthContext.isLoading` must derive from `useConvexAuth()`. Convex's `<Authenticated>` / `<Unauthenticated>` / `<AuthLoading>` components wrap this correctly.

Corollary from the skill: *"Do not stop at 'Clerk login works.' The important check is that Convex also sees the session."*

### Files touched

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap in `ClerkProvider` > `ConvexProviderWithClerk` |
| `app/context/AuthContext.tsx` | **Internals replaced, public interface preserved** |
| `app/(auth)/login/page.tsx` | `signInWithPassword`/`signInWithOAuth` → Clerk `useSignIn` (keep custom UI) |
| `app/(auth)/register/page.tsx` | `signUp` → Clerk `useSignUp` |
| `app/(auth)/callback/route.ts` | **Delete** — Clerk handles OAuth callback |
| `proxy.ts` | `updateSession` → `clerkMiddleware()` with the same protected-route matcher |
| `lib/supabase/proxy.ts` | **Delete** |

### Preserve the `useAuth()` contract

72 client components consume `useAuth()`. Keep the interface identical so they don't churn:

```ts
interface AuthContextType {
  user: ...          // Clerk user instead of Supabase User
  student: Student | null
  isAdmin: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  refreshStudent: () => Promise<void>   // becomes a no-op; useQuery is reactive
}
```

Internally this collapses to `useConvexAuth()` plus a **single** Convex query:

```ts
// convex/users.ts
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const admin = await ctx.db.query("admins")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    if (admin) return { isAdmin: true, admin, student: null }
    const student = await ctx.db.query("students")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    return { isAdmin: false, admin: null, student }
  },
})
```

Queries cannot write, so the `tokenIdentifier` backfill described above lives in the shared `requireStudent`/`requireAdmin` mutation helpers, not here. `me` reads only.

This deletes a lot of complexity from the current `AuthContext.tsx`:
- The `initializedRef` dance distinguishing boot from post-idle `SIGNED_IN` (lines 99–171) — gone. Convex subscriptions handle reconnection.
- The manual `sb-*` cookie-clearing fallback in `signOut` (lines 88–96) — gone.
- The separate `is_admin()` RPC + `students` fetch round-trips — collapse into one reactive query.

Also fixes the documented bug in `ADMIN_DASHBOARD_PLAN.md:556` where clicking a document download link triggered a token refresh that blanked the dashboard. Convex query subscriptions don't churn `isLoading` on token refresh.

### Student profile creation (replacing `handle_new_user`)

Postgres had an `AFTER INSERT ON auth.users` trigger. Convex has no DB triggers. Use **both** of:

1. **Clerk webhook → Convex HTTP action** (`user.created`) → insert `students` row. The happy path.
2. **Lazy get-or-create** in the first authenticated mutation. The safety net.

Layer 2 is not redundant — it permanently fixes the class of bug recorded in `error.md`, where a user with no `students` row caused a 406 on the profile fetch and a 500 on spotlight submit (`PGRST116: The result contains 0 rows`). With get-or-create that state is unreachable.

### Admin seeding

Admins were seeded by hand-written SQL against `auth.users` (`BACKEND_PLAN.md:923-940`). Replace with an internal Convex mutation callable from the dashboard, keyed by Clerk email.

---

## Authorization: 26 RLS policies → in-function checks

Convex has no row-level security. Every policy becomes an explicit check in the function body. Shared helpers:

```ts
// convex/lib/auth.ts
export async function requireStudent(ctx)  // → Student, else throw
export async function requireAdmin(ctx)    // → Admin, else throw
export async function requireOwnApplication(ctx, appId)
```

**Highest-risk area:** the three routes currently using the service-role client, which bypass RLS entirely today and rely on route logic alone:

- `app/api/donations/route.ts` — public donation creation
- `app/api/help-interest/route.ts` — public interest submission
- `app/api/featured-students/route.ts` — public featured list

These become **public** Convex functions (no auth check by design). Each needs a deliberate review of exactly which fields it exposes — `featured-students` in particular reads from tables that also hold bank details and Aadhaar document references. The current implementation hand-picks columns in its `.select()`; the Convex version must hand-pick just as carefully, because `ctx.db.get()` returns the **whole document**. This is the easiest place in the whole migration to accidentally leak PII.

---

## File Storage

### The problem

Today: `createSignedUrl(path, 3600)` — 1-hour expiry, authorization checked per request.

Convex `storage.getUrl()` returns a **permanent, unguessable URL with no expiry and no auth check**. Per Convex docs: *"anyone with the URL can access the file without another app-level authorization check, and the only way to revoke a file URL is by deleting the file."*

These buckets hold Aadhaar cards, bank passbooks, and marksheets. A leaked URL (browser history, screenshot, forwarded email) grants permanent access with no revocation short of deleting the file.

### Recommended split

**Public photos** — featured-student photos shown on the homepage and `/students`. Use `storage.getUrl()` directly. These are already effectively public: the current code issues 1-year signed URLs and renders them on an unauthenticated page. No regression.

**Private documents** — everything else. Serve through a Convex HTTP action that validates a short-lived token:

```
query docs.getDownloadTokens(applicationId)   → authorizes caller, mints ~15min HMAC tokens
<a href="{convexSite}/documents?token=...">   → HTTP action verifies token, streams ctx.storage.get()
```

The token is needed because `<img src>` and `<a download>` cannot send an `Authorization` header, so a plain authenticated HTTP action does not work for browser-initiated file loads.

~60 lines of code. Worth it for Aadhaar data.

> **Open decision.** The lower-effort alternative is to use `storage.getUrl()` for everything, returning URLs only from queries that authorize the caller. That is the common Convex pattern and is what most apps do — but it accepts permanent capability URLs for PII. Flagging explicitly rather than deciding silently.

### Upload flow

Current: client → multipart POST to `/api/upload` → route validates → Supabase Storage → insert metadata row.

Convex: `generateUploadUrl()` mutation (authorizes + returns URL) → client POSTs the file directly → `saveDocument` mutation records `storageId` + metadata. Validation (10MB, MIME allowlist) moves into the mutations. Note `app/api/upload/route.ts:66` currently has a wrong error message — says "5MB limit" while enforcing 10MB. Fix during the port.

---

## The Four Postgres Features With No Direct Equivalent

### 1. Counts — `app/api/admin/stats/route.ts`

Five `count: 'exact', head: true` queries. Convex has no count operator.

> **Corrected.** An earlier draft of this plan proposed indexed `.collect()` then `.length`, reasoning that the data volume is small. The Convex guidelines forbid it outright: *"Never use `.collect().length` to count rows."* The objection is not about current scale — it is that an unbounded scan silently becomes a production problem as the table grows, and there is no failure signal until it does.

**Approach:** `@convex-dev/aggregate` (O(log n) reads, kept current in the same mutation as every source-table write). A denormalized counter document is the lighter alternative the guidelines also sanction, but with five distinct counts across four tables — some filtered by status, one by `isFeatured` — hand-maintaining counters means five write-path invariants to keep correct. The component is less code and fewer ways to drift.

**Related rule with wider reach:** *"If the user does not explicitly tell you to return all results, ALWAYS return a bounded collection — use `.take()` or paginate instead of `.collect()`."* This applies well beyond the stats query. Every list query written in Phases 2–3 must be bounded by default; `.collect()` needs a specific justification each time it appears.

### 2. Search — admin list routes

Current: `.or('full_name.ilike.%q%,email.ilike.%q%,application_id.ilike.%q%')`. Convex search indexes cover one field.

**Approach:** denormalized `searchText` field (in the schema above) concatenating name + email + application ID, with a single `searchIndex` and `filterFields` for status/type. Maintained in the create/update mutations. One index, same behaviour, no OR-merge logic.

### 3. Pagination — admin lists

Current: `.range(from, to)` with a numbered "page N of M" UI. Convex is cursor-based.

**Approach:** switch admin lists to `usePaginatedQuery` + load-more. For a review queue this is better UX than numbered pages anyway. Keeping numbered pages would require collecting the full set to compute `totalPages`, which defeats pagination.

### 4. Triggers

| Postgres trigger | Convex replacement |
|---|---|
| `handle_new_user()` | Clerk webhook + lazy get-or-create |
| `set_application_id()` / `set_donation_id()` / `set_spotlight_id()` | Generate inside the create mutation |
| `update_updated_at()` | Set `updatedAt` explicitly in mutations |

**Nice property:** the ID generators looped on collision (`generate_application_id` in `BACKEND_PLAN.md:382`). Convex mutations are serializable transactions, so check-index-then-insert is genuinely race-free — no advisory locks, no retry loop needed.

---

## Function Inventory (22 routes → Convex functions)

| Current route | Convex |
|---|---|
| `GET /api/featured-students` | `query featured.list` (public) |
| `POST /api/donations` | `mutation donations.create` (public) |
| `GET/POST /api/help-interest` | `mutation helpInterests.create` (public) |
| `POST/GET /api/upload` | `mutation documents.generateUploadUrl` + `documents.save` + `query documents.forApplication` |
| `POST/GET /api/upload/spotlight` | same, spotlight variants |
| `GET/PATCH /api/student/profile` | `query users.me` + `mutation students.updateProfile` |
| `GET/POST /api/student/applications` | `query applications.myApplications` + `mutation applications.create` |
| `GET/PATCH /api/student/applications/[id]` | `query applications.myApplication` + `mutation applications.resubmit` |
| `GET/POST /api/student/spotlight` | `query spotlight.mine` + `mutation spotlight.create` |
| `GET/PATCH /api/student/spotlight/[id]` | `query spotlight.mineById` + `mutation spotlight.resubmit` |
| `GET /api/admin/info` | folded into `query users.me` |
| `GET /api/admin/stats` | `query admin.stats` |
| `GET /api/admin/activity-log` | `query admin.activityLog` (paginated) |
| `GET /api/admin/scholarship-applications` | `query admin.applications` (search/filter/paginate) |
| `GET/PATCH /api/admin/scholarship-applications/[id]` | `query admin.application` + `mutation admin.updateApplicationStatus` |
| `GET /api/admin/spotlight-applications` | `query admin.spotlightApplications` |
| `GET/PATCH /api/admin/spotlight-applications/[id]` | `query admin.spotlightApplication` + `mutation admin.updateSpotlightStatus` |
| `GET/PUT /api/admin/spotlight` | `query admin.featured` + `mutation admin.reorderFeatured` |
| `GET /api/admin/donations` | `query admin.donations` |
| `GET/PATCH /api/admin/donations/[id]` | `mutation admin.updateDonation` |
| `GET /api/admin/help-interests` | `query admin.helpInterests` |
| `GET/PATCH /api/admin/help-interests/[id]` | `mutation admin.updateHelpInterest` |

Activity logging (currently duplicated inline in five `[id]` routes) becomes one shared `logActivity` helper called from the admin mutations.

---

## Execution Phases

**Phase 0 — Setup.** Per `.agents/skills/convex-setup-auth/references/clerk.md`:

1. `npx convex dev` — creates the deployment (interactive login required)
2. Clerk account + application, Google OAuth enabled
3. **Activate the Convex integration** at `dashboard.clerk.com/apps/setup/convex` — this is where the Clerk Frontend API URL comes from, and skipping it produces "no auth provider matched the token"
4. Copy the publishable + secret keys from the Clerk API keys page (a *different* page from the one above)
5. `convex/auth.config.ts` with the issuer domain
6. `ConvexProviderWithClerk` + `ClerkProvider` in `app/layout.tsx`
7. `clerkMiddleware()` in `proxy.ts`

App still runs on Supabase for data. *Nothing breaks.*

Decide up front whether this is **local-only or production-ready** — dev and production Clerk instances have different keys and different issuer domains, and the skill flags assuming otherwise as a common failure. Gotcha worth remembering: after activating the Convex integration, fully sign out and back in before testing, or a stale Clerk session keeps presenting a token Convex rejects.

**Phase 0.5 — Hardening.** ✅ **Complete.**

| Fix | Outcome |
|---|---|
| `typescript.ignoreBuildErrors` off | Removed from `next.config.js`. **`tsc --noEmit` reported 0 errors** — the flag was hiding nothing. The risk was real in principle but there was no accumulated debt. |
| Real ESLint config | `eslint.config.mjs` added (ESLint 9 flat config). `eslint-config-next` v16 exports flat arrays directly, so no `FlatCompat` shim needed. Was 77 problems → **0 errors, 67 warnings, exit 0.** |
| `app/error.tsx` | Added. Tells students their wizard progress is preserved (the wizards autosave to localStorage), shows `error.digest`, offers `reset()`. |
| `app/not-found.tsx` | Added, with `robots: { index: false }` and links to key destinations. |
| `app/global-error.tsx` | Added — catches root-layout failures where `error.tsx` cannot help. Inline-styled and dependency-free because Next replaces the whole document and `globals.css` does not apply. Relevant now: `AuthProvider` lives in the root layout and is about to be rewritten for Clerk. |
| Renamed `my-v0-project` | → `vidyonnati-foundation`. |
| Gitignore | `.history/`, `.playwright-mcp/`, `agent/`. |

**Lint decisions made, not papered over.** Two rules were downgraded to `warn` with reasoning recorded inline in `eslint.config.mjs`:

- `react-hooks/set-state-in-effect` — 24 instances, but ~13 are the `useEffect` + `fetch` + `setState` pattern in `app/admin/*` and `app/dashboard/*` that `useQuery`/`usePreloadedQuery` deletes outright. Fixing them now is throwaway work, and leaving 24 errors means `npm run lint` fails on day one, which trains everyone to ignore it. **Restore to `error` after Phase 2**, then fix the genuine remainder (`AnimatedInput`, `AnimatedTextarea`, `HeroSlider`, `MainNavigation` — UI state, not data fetching).
- `@typescript-eslint/no-explicit-any` — 2 instances, both pragmatic. `student.gender as any` narrows a nullable DB string to the form union and resolves itself once Convex supplies a typed union in Phase 3; `trigger(fields as any)` is react-hook-form dynamic-field friction with no clean typing.

`components/ui/**` is scoped to warnings — vendored shadcn, regenerated by `npx shadcn add`, so local patches are lost on re-add.

**7 unescaped entities were genuinely fixed**, using typographic characters (`’`, `“ ”`) rather than HTML entities — a real copy improvement, not lint silence.

Deferred deliberately: no test suite yet (real gap, separate project), and the duplicated wizard step components stay as-is (5 near-identical files across the two wizards — refactoring mid-migration compounds risk).

**Verification:** `tsc --noEmit` clean · `eslint .` exit 0 · `npm run build` exit 0, "Compiled successfully".

**Phase 1 — Schema + auth cutover.** Write `convex/schema.ts`. Swap `AuthContext` internals, login, register. Delete `(auth)/callback/route.ts` and `lib/supabase/proxy.ts`. Clerk webhook + get-or-create. Seed admins. *Auth is now Clerk; data still Supabase via API routes.* This is the one phase with a hard boundary — the API routes authenticate via Supabase cookies that no longer exist, so Phases 2–3 must follow promptly.

**Phase 2 — Read paths + rendering conversion.** Queries and authorization helpers, then convert pages per the three-tier table above:

- *Public → RSC.* Convert `/`, `/students`, `/spotlight`, `/about`, `/gallery`, `/media` to Server Components with `fetchQuery`. Drop `"use client"`, push interactive leaves (dialogs, carousels, filters) into child client components. Add per-page `metadata`, `app/sitemap.ts`, `app/robots.ts`.
- *Dashboards → server shell + live client.* `preloadQuery` in the page, `usePreloadedQuery` in the client component. Merge `/admin`'s two fetches into one query.

The public-page conversion is the largest single chunk of work in the migration and the piece with no Supabase equivalent — budget for it accordingly.

**Phase 3 — Write paths.** Mutations: application create/resubmit, spotlight create/resubmit, profile update, donations, help interests, admin status changes + activity log, featured reordering.

Two things land here that the current API routes lack:

- **Domain validation server-side.** The 22 Zod schemas in `lib/schemas/` are currently browser-only; every API route hand-rolls a truthiness loop instead (`app/api/student/applications/route.ts:71`), so `pincode: "abc"` and a malformed IFSC both pass. Convex `v.*` validators enforce *shape* at the boundary, but not domain rules — reuse the Zod schemas inside the mutations for the rest.
- **Rate limiting.** `@convex-dev/rate-limiter` on `donations.create` and `helpInterests.create`. Both are public, unauthenticated writes with no throttle today.

**Phase 4 — File storage.** Upload URL flow, document save, private-document HTTP action + tokens, public photo URLs. Rework `FileUpload.tsx` and both `DocumentsStep.tsx` components.

**Phase 5 — Teardown.** Delete `app/api/**`, `lib/supabase/**`, `types/database.ts`. Remove `@supabase/ssr` + `@supabase/supabase-js`. Drop the Supabase image host from `next.config.js`. Remove Supabase env vars and the Supabase `.mcp.json` server entry. Final `tsc` + `eslint` pass with the Phase 0.5 settings already in force.

**Phase 6 — Bonus (was Phase F, never started).** Resend emails via the Convex Resend component + scheduled functions, wired to status-change mutations. Materially easier on Convex than it would have been on Supabase — this is the payoff for the `emailTemplates`/`emailLogs` tables that have been sitting unused.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| PII leak via permanent file URLs | **High** | Token-authorized HTTP action for private docs (see Open Decision above) |
| Public functions over-exposing fields | **High** | `ctx.db.get()` returns whole documents. Explicitly project fields in every public query; review `featured.list` closely — it reads from tables that also hold bank details |
| `typescript.ignoreBuildErrors: true` | **High** | Moved to Phase 0.5. Types are the primary safety net when swapping a data layer |
| Unvalidated writes | **High** | Zod schemas are browser-only today. Reuse them inside mutations in Phase 3 |
| Phase 1 leaves a broken window | Medium | Auth cuts to Clerk while API routes still expect Supabase cookies. Keep Phases 1–3 tight, or stub route auth temporarily |
| `students.id === userId` assumption | Medium | Pervasive. Grep for `user.id` used as a student ID before porting each function |
| RSC conversion breaks interactive leaves | Medium | Dropping `"use client"` from a public page breaks any hook usage inside it. Convert leaf-first: extract interactive children *before* converting the parent |
| Multiple `preloadQuery` per page | Medium | Not consistency-guaranteed with each other. One per page; merge `/admin`'s two fetches |
| Admin pagination UI change | Low | Numbered pages → load-more. Cosmetic, needs sign-off |

---

## Effort Estimate

| Phase | Scope |
|---|---|
| 0 — Setup | Small |
| 0.5 — Hardening | Small (but unblocks everything after) |
| 1 — Schema + auth | Medium |
| 2 — Read paths + RSC conversion | **Largest** (~20 pages, 6 converted to Server Components) |
| 3 — Write paths + validation | Large (2 wizards + 6 admin mutations + Zod reuse + rate limiting) |
| 4 — File storage | Medium |
| 5 — Teardown | Small |
| 6 — Emails | Medium (net-new feature) |

Net line count should **drop** — ~3,000 lines of API routes and 871 lines of generated types are removed, replaced by a smaller volume of Convex functions plus generated types.
