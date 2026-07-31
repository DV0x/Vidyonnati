# Phase 2 Handoff

Pick-up doc for the Supabase → Convex migration. Architecture and the full phase
plan live in `CONVEX_MIGRATION_PLAN.md`; this file is **current state, what is
proven, what is broken, and what to do next**.

**As of:** 2026-07-31, end of session 3
**Phases done:** 0 (setup), 0.5 (hardening), 1 (schema + auth), 2a + 2b, **3**
**Next:** Phase 4 — private document serving, then production cutover.

Every read *and* every write is on Convex, and **Supabase has been deleted from
the codebase** — all 22 API routes, both client wrappers, the generated row
types, and the two npm packages. The build emits no `/api` routes.

---

## Read this first

`CLAUDE.md` lists the standing rules for this repo: **invoke the `convex` skill
for backend work and the `clerk` skill for auth work**, and verify against
installed types or real runtime values rather than inferring. Every bug in
session 1 came from inferring. The gotchas list there is not decoration — each
entry cost real debugging time.

---

## Environment map

| Thing | Value |
|---|---|
| Convex team / project | `vidyonnati-fondation` / `vidyonnati-foundation` |
| Convex **dev** deployment | `dev:unique-dodo-576` → `https://unique-dodo-576.convex.cloud` |
| Convex **prod** deployment | **does not exist yet** |
| Convex env var (dev) | `CLERK_JWT_ISSUER_DOMAIN=https://close-garfish-21.clerk.accounts.dev` |
| Clerk **dev** instance | `close-garfish-21.clerk.accounts.dev` |
| Clerk **prod** instance | `clerk.vidyonnatifoundation.org` (DNS + TLS verified) |
| Vercel project | `vidyonnati`, custom domain `vidyonnatifoundation.org`, deploys via GitHub integration (repo is **not** linked locally — no `.vercel/`) |
| DNS | Namecheap (`dns1/dns2.registrar-servers.com`) |
| Mail | Zoho (`zoho.in`) — unaffected by Clerk's `clkmail` records |

`.env.local` (gitignored) holds: Convex deployment vars, Clerk **`pk_test`/`sk_test`**
(dev instance — production keys are deliberately *not* here; Clerk rejects
`_live_` keys on localhost), plus the still-live Supabase and Resend vars.

**Convex CLI auth is machine-global** (`~/.convex/config.json`) and currently
points at `vidyonnati-fondation`. The `agency5027` account is no longer reachable
from this machine. To use both, invite `agency5027` into the
`vidyonnati-fondation` team rather than re-running `convex login --force`.

### Clerk configuration — both instances

| Item | Dev | Prod |
|---|---|---|
| Convex integration (adds `aud: "convex"`) | ✅ | ✅ |
| Session token customization (`email`, `name`) | ✅ | ✅ |
| Google OAuth | ✅ Clerk shared credentials | ✅ custom credentials |
| `convex` JWT template | ✅ **deleted — must not exist** | ✅ **deleted** |

Production Google reuses the Google Cloud OAuth client originally made for
Supabase (client `391398186976-…`), with Clerk's redirect URI
(`https://clerk.vidyonnatifoundation.org/v1/oauth_callback`) added alongside the
Supabase one, and a second client secret added (Google supports multiple —
rotating without downtime). The Supabase redirect URI is still present
deliberately; delete it only after production Clerk sign-in is proven.

> ⚠️ **Deadline:** Google warned that OAuth client `391398186976-…` is deleted if
> unused by **2026-08-15**. Dev Google runs on Clerk's *shared* credentials and
> does **not** count as use. Only a **production** Google sign-in does. Losing
> the client means losing the verified consent screen.

---

## What is actually proven

Verified end to end with a real session, not by inspection:

- Google → Clerk → signed JWT (`aud`, `email`, `name`) → Convex
  `getUserIdentity()` → `students` row written with both identity keys.
- `proxy.ts` route protection: `/dashboard` → `307 → /login?redirect=%2Fdashboard`.
- `tsc --noEmit` 0 errors · `eslint .` exit 0 · `npm run build` exit 0.

Phase 3 additionally proved, against the live deployment:

- **Authorization.** Anonymous → `Not authenticated`; authenticated non-admin →
  `Forbidden`; a real student who does not own a record → `Application not
  found`, with the record verified unmodified afterwards.
- **The allowlist.** A student passing `status` is rejected by the validator
  before the handler runs.
- **Counter arithmetic** across `pending → needs_info → under_review`, both
  halves each hop, no bump on an unchanged status, rollback on a rejected call.
- **Counter repair** rebuilding a counter deleted out from under it.
- **Uploads** end to end: real PNG through a Convex upload URL, with `fileSize`
  and `mimeType` taken from `_storage` rather than the client; a `text/plain`
  upload rejected on its real content type.
- **Orphan sweep** deleting an unreferenced file while leaving a referenced one.
- **Reorder atomicity**: a batch containing one bad id wrote nothing at all.

Admins are **pre-authorized by email** and bind their `clerkUserId` /
`tokenIdentifier` on first authenticated write (`lookupAdmin` →
`requireAdminForWrite` in `convex/lib/auth.ts`). Nobody has signed in as that
address yet.

### Dev deployment contents after Phase 3

Phase 3 verification left test rows in the **dev** deployment. They are kept
rather than cleaned out, because they are the only data that makes the admin
screens render anything — worth having when clicking through the new write paths.

| Table | Rows |
|---|---|
| `students` | 2 — the real Google account, plus `someoneelse@example.com` created to test cross-student ownership |
| `admins` | 1 — `hello@vidyonnatifoundation.org`, `super_admin` |
| `applications` | 1 — `VF-18985531`, `under_review`, featured |
| `applicationDocuments` | 1 — a 67-byte test PNG |
| `spotlightApplications` | 1 — `VS-13813177`, `pending`, featured |
| `donations` | 1 — `DON-73131490`, `confirmed` |
| `helpInterests` | 1 |
| `adminActivityLog` | 8 |
| `counters` | 8 keys, all matching their tables exactly |

Two things to know before signing in as the admin:

- The `admins` row is currently bound to the **fake** test identity
  `user_testadmin`. This self-heals and needs no action: `lookupAdmin` falls
  through to the email match, so reads work immediately, and the first real
  authenticated write rebinds both id fields via `requireAdminForWrite`.
- To start clean instead, clear the six data tables and re-run
  `maintenance:recomputeCounters` — it will zero every counter to match.

---

## What is broken right now

Nothing known. `tsc --noEmit` 0 errors · `eslint .` 0 errors, **56 warnings**
(one below the post-2b baseline of 57) · `npm run build` succeeds, 30 pages —
down from 46 because the 22 API routes are gone.

The `STILL SUPABASE, STILL 401` markers are gone; every one of those call sites
is a Convex mutation now.

---

## Code state

Phase 1 files are below; the Phase 2a query files are listed in the 2a section.

**Added**
```
convex/schema.ts              12 tables, 32 indexes, 4 search indexes (after 2a)
convex/auth.config.ts         reads CLERK_JWT_ISSUER_DOMAIN (a Convex env var)
convex/lib/auth.ts            requireStudent/requireAdmin (+ForWrite), getOrCreateStudent
convex/users.ts               me, ensureStudentProfile, updateProfile
app/ConvexClientProvider.tsx  ConvexProviderWithClerk bridge
app/(auth)/sso-callback/      OAuth landing (replaces Supabase /callback)
app/error.tsx · not-found.tsx · global-error.tsx
eslint.config.mjs             ESLint 9 flat config
```

**Rewritten:** `proxy.ts` (clerkMiddleware), `app/layout.tsx` (provider chain),
`app/context/AuthContext.tsx` (Clerk + Convex, **public interface unchanged**),
`/login`, `/register` (Clerk custom flows, original UI preserved).

**Deleted:** `lib/supabase/client.ts`, `lib/supabase/proxy.ts`,
`app/(auth)/callback/route.ts`.

**Added in Phase 3**
```
convex/lib/ids.ts             VF-/VS-/DON- generators (replace the PG functions)
convex/documents.ts           upload URL + attach, for both wizards
convex/donations.ts           public donation intake
convex/helpInterests.ts       public "I want to help" intake
convex/maintenance.ts         counter repair + orphaned-file sweep
lib/convexError.ts            message/payload extraction from ConvexError
lib/formCoercion.ts           form-value → mutation-argument narrowing
```

**Deleted in Phase 3 — Supabase is gone from the codebase**
```
app/api/**            22 route files
lib/supabase/server.ts · lib/supabase/admin.ts
types/database.ts     the generated Postgres row types
```
plus the `@supabase/ssr` and `@supabase/supabase-js` packages.

This was not only tidying. `/api/donations` and `/api/help-interest` were
**unauthenticated routes holding the service-role key** — unreachable from the
app once the mutations landed, but still routable over HTTP in a deployment, and
a donation POSTed to one would have been written to Supabase where nothing reads
it any more.

The build now emits **no `/api` routes at all**. What remains of Supabase in the
source is comments explaining what the migration replaced and why, which is worth
keeping. `.env.local` still holds the Supabase URL and keys; they are inert with
no client to use them, and are left until the Supabase project is decommissioned
so a rollback is still possible.

### One deliberate temporary thing

The **`email`/`fullName` fallback** passed into `ensureStudentProfile` is dead
code (the token carries both), kept as insurance if token config drifts.

`toLegacyStudent()` is **gone** — Phase 3 removed it, as planned, and updated the
six components to read the Convex document directly. `AuthContext` now hands back
`Doc<"students">` unmapped. That is what freed the app from `types/database.ts`.

---

## Phase 2 — the work (complete)

### 2a. Convex queries + authorization helpers — ✅ **done**

14 read paths ported. Every function body does its own auth via
`requireStudent` / `requireAdmin` — Convex has no RLS. Every list is bounded by
`.take()` or `paginate()`; no bare `.collect()` anywhere.

| File | Queries |
|---|---|
| `convex/featured.ts` | `list` (public) |
| `convex/applications.ts` | `myApplication`, `existingForYear` |
| `convex/spotlight.ts` | `mineById` |
| `convex/dashboard.ts` | `summary` — both student lists in one read |
| `convex/lib/studentData.ts` | shared list + document reads |
| `convex/admin.ts` | `stats`, `overview`, `applications`, `application`, `spotlightApplications`, `spotlightApplication`, `featured`, `donations`, `helpInterests`, `activityLog`, `admins` |
| `convex/lib/counters.ts` | `counterKeys`, `readCounter`, `bumpCounter` |
| `convex/lib/search.ts` | `searchText` builders, one per searchable table |

**`featured.list` is the PII boundary.** It is the only public read over
`applications` / `spotlightApplications`, which also hold bank account numbers,
IFSC codes and Aadhaar document references. `ctx.db.query()` returns whole
documents, so the explicit projection in that file is the entire protection.
Its `FeaturedStudent` type mirrors `Student` in `app/components/StudentCard.tsx`
— 10 fields, nothing else. Never spread a document into that result.

**Documents return metadata, no URLs.** `storageId` / `fileName` / `mimeType`
only. Minting a `ctx.storage.getUrl()` would silently settle the Phase 4 open
decision in favour of permanent, unrevocable capability URLs over Aadhaar cards
and bank passbooks. Left open on purpose.

**Schema gaps closed** (free now, a backfill migration later — tables are empty):

- `donations` and `helpInterests` had no `searchText` and no search index, yet
  both admin routes search. Added, plus `filterFields`.
- `spotlightApplications.search_all` gained `isFeatured` as a filter field; the
  admin list combines search with the featured toggle.
- New indexes: `applications.by_applicationType`, `helpInterests.by_helpType`,
  `adminActivityLog.by_actionType`, `spotlightApplications.by_isFeatured`.
  Each backs a filter combination that would otherwise have been a full scan.

**Counts use a `counters` table, not `@convex-dev/aggregate`** — a change from
what `CONVEX_MIGRATION_PLAN.md` specifies. The component turned out to need five
separately-mounted instances (one per table+dimension) plus `convex-helpers`
Triggers to avoid drift. One keyed table with a `bumpCounter` helper does the
same job; Convex mutations are serializable transactions, so read-modify-write
on a counter row is race-free. See the Phase 3 obligation below.

**Verified against the live deployment,** not by inspection: every index and
search branch was executed with `npx convex run --identity`, `featured:list`
returns `{students: [], total: 0}` unauthenticated, and the admin guards reject
an anonymous caller at `requireAdmin`.

### Phase 3 owed the counters — ✅ **discharged**

> Kept for the rule it states, which still binds every future write path. The
> Phase 3 section below records how it was satisfied and what was tested.

`convex/lib/counters.ts` has no way to maintain itself. Every mutation that
writes a counted table must call `bumpCounter` **in the same mutation as the
write**, so the two commit or roll back together:

```
insert  → bumpCounter(ctx, key(newStatus), +1)
delete  → bumpCounter(ctx, key(oldStatus), -1)
status  → bumpCounter(ctx, key(oldStatus), -1) AND key(newStatus), +1
```

The status transition is the one that gets done half-right: incrementing the new
bucket while forgetting to decrement the old inflates the dashboard forever.
Build keys through `counterKeys`, never by hand — a typo creates a second
counter nothing reads and leaves the real one stale.

Also still owed: a **recompute/repair mutation** that rebuilds each counter from
its source table. Denormalized counts drift eventually, and without a resync path
the only fix is manual arithmetic. Not written in 2a because doing it correctly
needs batching across transactions (`.take(n)` a page, schedule the next), and an
unbatched version breaks on exactly the table size that motivates it.

Phase 3 also owns `searchText`: `convex/lib/search.ts` has a builder per table,
and every create/update must recompute it or the admin lists go stale.

### 2b. Rendering conversion — ✅ **done**

**The plan's premise for the public tier was wrong, and checking beat assuming.**
It claimed `"use client"` pages ship "empty shells" and budgeted this as the
largest chunk of the migration. The build output says otherwise: every public
page already prerendered 40–150KB of real HTML, because Next server-renders
client components too. The actual defect was narrower — all 23 routes emitted
the root layout's `<title>` verbatim, since `export const metadata` cannot live
in a client module.

So each public route is now a thin Server Component shell exporting metadata
around its existing client content (`AboutContent`, `GalleryContent`, …). No
`fetchQuery` anywhere on the public tier, because **no public page reads data** —
`StudentSpotlightSection` is commented out of the homepage and `/students` is a
placeholder, so `featured.list` currently has no consumer. Titles are distinct
per page; `/students` is `noindex` while it stays a placeholder.

Added `app/sitemap.ts`, `app/robots.ts`, and `lib/site.ts`. That last one exists
because the first sitemap build published `http://localhost:3000` URLs: the
origin came from `NEXT_PUBLIC_APP_URL`, which is localhost in `.env.local`.
Sitemap entries, the robots `Sitemap:` line and `metadataBase` are absolute and
only ever read against production, so the canonical origin is a constant now.

**Authenticated tier** — `preloadQuery` in a Server Component shell,
`usePreloadedQuery` in the client child: server-rendered first paint *and* a
live subscription.

| Page | Query |
|---|---|
| `/dashboard`, `/dashboard/applications` | `dashboard.summary` |
| `/dashboard/applications/[id]` | `applications.myApplication` |
| `/dashboard/spotlight/[id]` | `spotlight.mineById` |
| `/dashboard/profile` | reads via AuthContext; writes `users.updateProfile` |
| `/admin` | `admin.overview` (stats + activity, merged) |
| `/admin/*` lists | `usePaginatedQuery` |
| `/admin/*/[id]` | `admin.application` / `admin.spotlightApplication` |

`lib/convexToken.ts` supplies the Clerk token for server-side calls. It calls
`getToken()` with **no template argument** and explains why at length — this is
the trap CLAUDE.md records.

Detail queries return `null` rather than throwing when a record is missing or
belongs to someone else, so the shell renders a real 404 via `notFound()`
instead of an error boundary. Missing and not-yours still collapse into one
answer, so neither can be used to probe which ids exist.

**Admin lists are load-more, not numbered pages.** Convex has no count operator
and a total means reading every matching row, which is what pagination exists to
avoid. The "Refresh" buttons went with them: a manual refresh against a live
subscription is misleading UI.

Three things the type checker caught that the old code did not:

- `siblings_count !== null` — always true under Convex, where optional fields
  are absent rather than null, and it would have called `.toString()` on
  `undefined`.
- `usePaginatedQuery`'s `isLoading` is true for **load-more as well as** the
  first page, so gating the skeleton on it would blank the whole table every
  time a reviewer clicked "Load more". Gated on `LoadingFirstPage` instead.
- Every stale snake_case field reference, across 289 of them.

**Documents render no download links and no photos.** Serving those files is
Phase 4, where the open decision between permanent `storage.getUrl()` capability
URLs and a token-authorized HTTP action gets made — they are Aadhaar cards and
bank passbooks. A dead button would be worse than none. `/admin/spotlight`'s
photo column has a second problem: the Supabase table had a `photo_url` column
with no Convex equivalent, so the photo has to come from `spotlightDocuments`.

Lint went from 69 warnings to **57** — below the pre-2b baseline, because the
conversion deleted the `useEffect` + `fetch` + `setState` pattern rather than
porting it. 12 `react-hooks/set-state-in-effect` warnings remain, which is the
genuine remainder the plan predicted (`AnimatedInput`, `AnimatedTextarea`,
`HeroSlider`, `MainNavigation` and similar UI state). Restoring that rule to
`"error"` is now a much smaller job.

### Not done in 2b: the `createRouteMatcher` migration

`proxy.ts` still uses it, and it is still deprecated in `@clerk/nextjs` v7.6.3.
Deliberately left alone. Clerk's objection is that path matching can diverge
from routing and leave protected resources reachable — which does not describe
this architecture: every dashboard and admin page now reads through a Convex
query that calls `requireStudent` or `requireAdmin`, so the resource-based check
Clerk is pointing at is already in place. The middleware redirect is a UX
affordance on top of it.

Migrating it properly means moving the `/login?redirect=` behaviour into the
dashboard and admin layouts, which is a change to the login flow rather than to
rendering. Worth doing; worth doing on its own, with the flow tested.

### After Phase 2

Restore `react-hooks/set-state-in-effect` to `"error"` in `eslint.config.mjs`
(downgraded to `warn` because ~13 of 24 instances are the `useEffect`+`fetch`+
`setState` pattern Phase 2 deletes), then fix the genuine remainder:
`AnimatedInput`, `AnimatedTextarea`, `HeroSlider`, `MainNavigation`.

Also migrate off `createRouteMatcher` — deprecated in `@clerk/nextjs` v7.6.3.
Phase 2 is the natural moment: once dashboards are Server Components, the auth
check belongs in the page that reads the data, which is the resource-based
pattern Clerk now recommends.

---

## Phase 3 — write paths (complete)

Everything below was exercised against the dev deployment with
`npx convex run --identity`, not checked by reading it.

### What was built

| File | Functions |
|---|---|
| `convex/admin.ts` (appended) | `updateApplication`, `updateSpotlightApplication`, `updateDonation`, `updateHelpInterest`, `setFeatured`, `reorderFeatured` |
| `convex/applications.ts` (appended) | `create`, `update` |
| `convex/spotlight.ts` (appended) | `create`, `update` |
| `convex/documents.ts` | `generateUploadUrl`, `attachApplicationDocument`, `attachSpotlightDocument` |
| `convex/donations.ts` | `create` (public) |
| `convex/helpInterests.ts` | `create` (public) |
| `convex/maintenance.ts` | `recomputeCounters`, `sweepOrphanedFiles`, `deleteCounterKey` |
| `convex/lib/ids.ts` | `generateApplicationId` / `SpotlightId` / `DonationId` |

Admin mutations live in `admin.ts` beside the reads on purpose. Counters drift
when a write path is added without noticing there is a counter behind it, and
having `readCounter` visible in the same file makes that hard to miss.

### The validators replaced a denylist with an allowlist

The Supabase student-update routes took the whole request body and stripped
protected keys by name — `delete body.status; delete body.reviewed_by; …`. That
is only as complete as the last person to remember it; adding a sensitive column
without adding a matching `delete` silently made it student-writable.

Convex rejects any argument not in the validator, so `status`, `reviewedBy`,
`reviewerNotes`, `isFeatured` and the rest are unreachable by construction.
Verified: submitting `status: "approved"` as a student returns
`ArgumentValidationError: Object contains extra field 'status'`.

### Counters — the obligation from 2a, discharged

Every counted write bumps in the same mutation as the write. Verified by
walking one application through `pending → needs_info → under_review` and
confirming both halves fired at each hop, that re-saving an unchanged status
bumps nothing, and that a rejected mutation rolls its bump back.

At the end of the session every counter matched its table exactly.

`maintenance.recomputeCounters` is the repair path 2a deferred. It chains one
table at a time through `ctx.scheduler`, carrying the running tally in the
scheduler arguments rather than a scratch table, and bounds each page by
**bytes** as well as rows (`maximumBytesRead`) because applications carry
free-text essays and vary by an order of magnitude in size. Tested by deleting a
live counter and confirming the run rebuilt it.

It is deliberately **not** a snapshot: batches are separate transactions, so a
row that changes status mid-run can be counted under its old value. Run it when
the queue is quiet; running it again converges.

### Two things found by testing that reading would not have caught

**1. `storage.delete()` before `throw` does not delete.** A mutation is a
transaction, so the throw rolls the delete back with everything else. The first
version of `documents.ts` cleaned up rejected uploads that way and the file was
still in `_storage` afterwards.

**2. Fixing that naively would have been worse than the leak.** The `storageId`
is a client argument and `_storage` records no uploader, so a delete that *did*
survive would let any authenticated student destroy another student's file:
attach it to an application they own, fail validation on purpose, gone. For
Aadhaar cards that is a much worse outcome than wasted bytes.

So the attach mutations never delete a client-supplied `storageId`. Orphans are
collected by `maintenance.sweepOrphanedFiles`, which decides from our own data —
an object goes only if no document row references it **and** it is older than 24h
(a fresh upload is indistinguishable from an abandoned one by reachability alone,
because the attach that will claim it has not run yet). The one delete that
remains is of a superseded id read out of our own row, which is not
client-supplied. Tested both directions: recent orphans survive, unreferenced old
ones go, referenced files are never touched.

### Uploads validate against storage, not against the client

Convex hands the browser an upload URL and the bytes go straight to storage, so
no function sees them first. The attach mutations therefore read
`ctx.db.system.get("_storage", id)` and enforce type and size against what Convex
actually received; the client's claimed `fileSize`/`mimeType` are not used at
all, and the stored row records the authoritative values. A `text/plain` upload
claiming to be an image is rejected on the real content type.

(The old route's size check also disagreed with its own error message — 10MB
constant, "5MB limit" text. The constant was kept; the message was fixed.)

### One schema fix

`helpInterests.studentId` was `v.optional(v.id("students"))`, but
`HelpInterestDialog` populates it from `featured.list`, whose `id` is an
`applications` / `spotlightApplications` document id. Postgres accepted the
mismatch because the column was an unconstrained uuid; Convex validates strictly
and would have rejected **every card-originated submission**. Renamed to
`featuredEntityId` and typed `v.optional(v.string())`, with the same reasoning as
`adminActivityLog.entityId` — it spans two tables, so it cannot be a `v.id()` of
either. Free to change now; the table is empty.

### Also folded in

- `StudentSpotlightSection` was the last thing in the app calling an `/api`
  route. Phase 2a built `featured.list` for it, but the conversion was skipped
  because the section is commented out of the homepage. Done now.
- `toLegacyStudent()` removed and all six consumers moved to camelCase, which is
  what freed the app from `types/database.ts`.
- Lint ends at **56 warnings, 0 errors** — one below the post-2b baseline of 57.
  Getting there mattered: the naive conversion *added* four
  `set-state-in-effect` warnings, because each wizard's edit-mode effect wrote
  `isLoadingEdit`, `editDbId`, `existingDocuments` and `applicationType` back
  into state on every resolve. All four are pure functions of the query result,
  so they are derived now and the effect only drives `reset()`, which
  react-hook-form genuinely owns.

---

## Open decisions / not yet done

- **Rate limiting on the two public mutations.** `donations.create` and
  `helpInterests.create` are unauthenticated by design — donors and enquirers
  have no account — so anyone can call them. This is not a regression: the
  Supabase routes had the identical exposure via the service-role key, and
  nothing here moves money (payment is an offline wire transfer an admin
  confirms by hand). The cost of abuse is junk rows in the queue and an inflated
  pending counter. The fix is `@convex-dev/rate-limiter` keyed on the submitted
  email — the Convex guidelines specifically call for the component over a
  hand-rolled window counter, which loses quota under concurrency. Not installed
  here because adding a component mid-migration is its own change with its own
  deploy, and burying it inside a port would hide it.
- **Clerk `user.created` webhook → Convex HTTP action.** Not built. The lazy
  `getOrCreateStudent` safety net covers it, so this is an optimization.
- **Private document serving.** Convex `storage.getUrl()` returns permanent,
  unrevocable URLs. These buckets hold Aadhaar cards and bank passbooks. Plan
  recommends a token-authorized HTTP action for private docs and plain
  `getUrl()` for public photos. **Decision still open** — see the plan's File
  Storage section. Phase 4.
- **Production Convex deployment** does not exist; when created it starts empty
  and needs the `hello@vidyonnatifoundation.org` admin row seeded again, plus
  `CLERK_JWT_ISSUER_DOMAIN` set to the **production** issuer.
- **Vercel env vars** not set: `pk_live`/`sk_live`, prod `NEXT_PUBLIC_CONVEX_URL`,
  `CONVEX_DEPLOY_KEY`.
- **No test suite.** Real gap for a system holding bank details; deliberately
  out of scope during the migration.

---

## Housekeeping

- **The migration is committed.** Branch `convex-migration`, 4 commits ahead of
  `main`, working tree clean:

  | Commit | Covers |
  |---|---|
  | `b9559dc` | Phase 1 — auth + backend foundation |
  | `678c17c` | Phase 2a — read paths |
  | `e9c5699` | Phase 2b part 1 — public pages + student dashboard |
  | `98c845b` | Phase 2b part 2 — admin pages |

  Each phase is its own commit, so any of them is a rollback point. Nothing has
  been merged to `main` yet.

  Phase 3 is `HEAD` — write paths plus the removal of the Supabase surface.
- Session 1 left `npx convex logs` and a Next dev server on port 3000 running as
  background tasks. Those task IDs died with that session; if either process is
  still alive it is orphaned and safe to kill.
- An empty stray Convex project `vidyonnati` exists under the old `agency5027`
  team (created in error). Dashboard-only deletion; harmless.
- `.gitignore` now covers `.history/`, `.playwright-mcp/`, `agent/`.
- `agent/` is a redundant third copy of the agent skills written by
  `npx convex ai-files install`; Claude Code reads `.claude/skills/`.
