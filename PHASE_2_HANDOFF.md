# Phase 2 Handoff

Pick-up doc for the Supabase → Convex migration. Architecture and the full phase
plan live in `CONVEX_MIGRATION_PLAN.md`; this file is **current state, what is
proven, what is broken, and what to do next**.

**As of:** 2026-07-31, end of session 2
**Phases done:** 0 (setup), 0.5 (hardening), 1 (schema + auth), **2a (read paths)**
**Next:** Phase 2b — RSC conversion (wire the pages to the queries below)

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

**All 22 API routes return 401.** They authenticate via
`supabase.auth.getUser()` reading Supabase cookies that no longer exist. Every
dashboard and admin page renders its shell and shows no data.

Phase 2a wrote the Convex queries that replace those routes, but **nothing calls
them yet** — no page has been converted. So the broken window is still open, and
it closes in 2b, not 2a. Not a regression to chase.

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

## Phase 2 — the work

Largest phase. Two distinct halves; do them in this order.

### 2a. Convex queries + authorization helpers — ✅ **done**

14 read paths ported. Every function body does its own auth via
`requireStudent` / `requireAdmin` — Convex has no RLS. Every list is bounded by
`.take()` or `paginate()`; no bare `.collect()` anywhere.

| File | Queries |
|---|---|
| `convex/featured.ts` | `list` (public) |
| `convex/applications.ts` | `myApplications`, `myApplication`, `existingForYear` |
| `convex/spotlight.ts` | `mine`, `mineById` |
| `convex/admin.ts` | `stats`, `applications`, `application`, `spotlightApplications`, `spotlightApplication`, `featured`, `donations`, `helpInterests`, `activityLog`, `admins` |
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

### 2b. Rendering conversion (three tiers)

| Tier | Pages | Method |
|---|---|---|
| Public | `/`, `/students`, `/spotlight`, `/about`, `/gallery`, `/media`, `/donate` | Server Component + `fetchQuery` + revalidate |
| Authenticated | `/dashboard/*`, `/admin/*` | `preloadQuery` → `usePreloadedQuery` (server first paint **and** live) |
| Interactive | `/apply`, `/spotlight/apply`, `/login`, `/register` | stay client + `useMutation` |

- **Do not** use `preloadQuery` on public pages — it sets `cache: 'no-store'`
  and kills static rendering. Use `fetchQuery`.
- **One `preloadQuery` per page** — multiple are not consistency-guaranteed.
  `/admin` currently makes two fetches; merge into one query.
- **Convert leaf-first.** Dropping `"use client"` from a page breaks any hook
  inside it — extract interactive children (dialogs, carousels, filters) first.
- **Admin lists return a cursor page, not `{total, page, totalPages}`.** The four
  admin list screens currently render numbered pagination off a `count: 'exact'`
  total. Convex is cursor-based and computing a total means reading every
  matching row, which defeats the pagination — so these become
  `usePaginatedQuery` + load-more. Behaviour change, flagged Low risk in the plan
  but it does need sign-off.
- **`/admin` still makes two fetches** (stats + activity). `admin.stats` and
  `admin.activityLog` are deliberately separate queries — activity is paginated
  and stats is not. Merging them for the one-`preloadQuery` rule means a thin
  wrapper query, not a change to either.
- Add per-page `metadata`, `app/sitemap.ts`, `app/robots.ts`. None exist; all 23
  pages currently inherit only the root layout's tags because `export const
  metadata` is unavailable in client components. The build confirms the cost —
  `/`, `/students`, `/spotlight` show as `○ (Static)` but are empty shells.

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
