# Phase 2 Handoff

Pick-up doc for the Supabase → Convex migration. Architecture and the full phase
plan live in `CONVEX_MIGRATION_PLAN.md`; this file is **current state, what is
proven, what is broken, and what to do next**.

**As of:** 2026-07-31, end of session 2
**Phases done:** 0 (setup), 0.5 (hardening), 1 (schema + auth), **2a + 2b**
**Next:** Phase 3 — write paths. Every read is on Convex; every write is still a
401 against a dead API route.

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

Current data in the dev deployment:

| Table | Rows |
|---|---|
| `students` | 1 — `alphasapien17@gmail.com`, Google, both keys bound |
| `admins` | 1 — `hello@vidyonnatifoundation.org`, `super_admin`, **IDs unbound** |
| everything else | empty |

The admin row is intentionally unbound: admins are **pre-authorized by email**
and bind their `clerkUserId` / `tokenIdentifier` on first authenticated write
(`lookupAdmin` → `requireAdminForWrite` in `convex/lib/auth.ts`). Nobody has
signed in as that address yet.

---

## What is broken right now (expected)

**Reads are fixed. Writes are not.**

Every GET is now a Convex query — `app/dashboard/**` and `app/admin/**` no
longer reference `app/api/**` at all. What remains is six `PATCH` calls against
routes that still authenticate via `supabase.auth.getUser()` and therefore still
return 401:

| Screen | Write |
|---|---|
| `/admin/scholarship-applications/[id]` | status + reviewer notes |
| `/admin/spotlight-applications/[id]` | status, notes, featured |
| `/admin/donations` | status edit dialog |
| `/admin/help-interests` | status edit dialog |
| `/admin/spotlight` | feature toggle, reorder |

Plus the two wizards, `/donate` and `HelpInterestDialog`, which POST.

Each site is commented `STILL SUPABASE, STILL 401`. This is the Phase 3
boundary, not a regression — Phase 2 was reads by design.

One consequence worth knowing: the optimistic updates and manual refetches that
used to follow these writes have been **removed**, not ported. The lists are
live Convex subscriptions now, so a Phase 3 mutation pushes the new value on its
own; a client-side guess would just race it.

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

**Still Supabase-backed:** all of `app/api/**`, `lib/supabase/server.ts`,
`lib/supabase/admin.ts`, `types/database.ts`.

### Two deliberate temporary things

1. **`toLegacyStudent()` in `AuthContext.tsx`** maps the Convex camelCase doc to
   the Supabase snake_case `Student` shape, so the six components reading
   `student.full_name` etc. needed no edits. Typed as `Student` so the compiler
   proves the shim is complete. **Delete in Phase 3.**
2. **The `email`/`fullName` fallback** passed into `ensureStudentProfile` is now
   dead code (the token carries both), kept as insurance if token config drifts.

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

### Phase 3 owes the counters — do not skip this

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

## Open decisions / not yet done

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

## Housekeeping from session 1

- Background tasks left running: `npx convex logs` (`b4mblpe0e`) and the Next dev
  server on port 3000 (`b05ussqfs`). Both safe to kill.
- **Nothing has been committed.** The entire migration is uncommitted working
  tree. Worth a commit before Phase 2 so there's a rollback point.
- An empty stray Convex project `vidyonnati` exists under the old `agency5027`
  team (created in error). Dashboard-only deletion; harmless.
- `.gitignore` now covers `.history/`, `.playwright-mcp/`, `agent/`.
- `agent/` is a redundant third copy of the agent skills written by
  `npx convex ai-files install`; Claude Code reads `.claude/skills/`.
