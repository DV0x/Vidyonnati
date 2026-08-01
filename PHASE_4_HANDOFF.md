# Migration Handoff

Pick-up doc for the Supabase → Convex migration. Architecture and the full phase
plan live in `CONVEX_MIGRATION_PLAN.md`; this file is **current state, what is
proven, what is broken, and what to do next**.

There is deliberately only ever **one** of these, updated in place and renamed as
phases land (`PHASE_2_HANDOFF.md` → `PHASE_3_HANDOFF.md` → `PHASE_4_HANDOFF.md`).
Session 3 opened by finding a "nothing has been committed" line in it that was
four commits out of date — so the standing rule is: **correct this file as part
of the work, not after it**, and never fork a second copy that can disagree with
it. Session 4 renamed it and rewrote every section Phase 4 falsified, including
three passages that still described the serving decision as open.

**As of:** 2026-08-01, end of session 5
**Phases done:** 0 (setup), 0.5 (hardening), 1 (schema + auth), 2a + 2b, 3, **4**
**Branch:** `convex-migration` — **every phase committed, working tree clean,
nothing merged to `main`**

The filename still says `PHASE_4` on purpose. Session 5 did not land a phase —
it cleared **rate limiting**, which was the first item on the open-decisions
list and step 1 of the sequenced plan below. Renaming to `PHASE_5` would invent
a phase that does not exist in `CONVEX_MIGRATION_PLAN.md`.

(Deliberately not a commit count. Session 3 found a stale one here, session 4
wrote another that its own doc commit invalidated a second later. The commit
table under Housekeeping is the authority; `git log main..convex-migration` is
the answer.)

Every read *and* every write is on Convex, and **Supabase has been deleted from
the codebase** — all 22 API routes, both client wrappers, the generated row
types, and the two npm packages. The build emits no `/api` routes.

Phase 4 landed in session 4: private documents are served by an authorized HTTP
action, so **an admin can now actually open a marksheet while reviewing** — the
thing that gated any real use of the system. The Phase 4 decision is closed; see
that section below for what was chosen and why.

Session 4 also found, while testing that, that **neither application wizard had
any client-side validation at all** — a student could walk from step 0 to Review
with an empty form and submit it. That is now fixed and has its own section
below. It predates the migration entirely.

Session 5 installed **`@convex-dev/rate-limiter`** on the two public
unauthenticated mutations. That was the last item standing between the branch
and a merge, and it is the project's **first Convex component** — so
`convex/convex.config.ts` now exists, which it never did before. Details in its
own section below.

---

## Next session: start here

### ~~The one thing with a clock on it~~ — CLEARED

**The 2026-08-15 Google OAuth deadline is discharged.** On 2026-08-01 a real
Google sign-in completed on production (`vidyonnatifoundation.org`), which
exercises client `391398186976-…` through the custom production credentials.
The verified consent screen is safe; no re-verification needed.

Kept below for the record, because the reasoning explains why dev testing never
counted and would apply again if the client ever goes idle for another year.

<details>
<summary>Original deadline note</summary>

Google deletes OAuth client `391398186976-…` on 2026-08-15 if it goes unused,
and only a *production* sign-in counts. Dev Google runs on Clerk's **shared**
credentials, so no amount of local testing keeps the client alive.

</details>

Now safe to do, and worth doing: **delete the leftover Supabase redirect URI**
from that Google client. It was kept deliberately until production Clerk sign-in
was proven. It now is.

The chain standing between here and a production Google sign-in:

| # | Step | State |
|---|---|---|
| 1 | Create the **production Convex deployment** | ✅ `amicable-narwhal-186` |
| 2 | Set `CLERK_JWT_ISSUER_DOMAIN` on it to the **production** Clerk issuer (`clerk.vidyonnatifoundation.org`), not the dev one | ✅ set, plus `ALLOWED_WEB_ORIGINS` |
| 3 | Seed the `hello@vidyonnatifoundation.org` admin row there (prod starts empty) | ✅ seeded, **unbound** — see below |
| 4 | Set Vercel env vars | ✅ **all 5 set** (Production scope), build command in `vercel.json` |
| 5 | Deploy — **Convex functions before the frontend**, per CLAUDE.md | ✅ **live** — merged and deployed, see below |
| 6 | Actually sign in with Google on production | ✅ **done 2026-08-01 — deadline cleared** |

### Step 5 landed: the migration is in production

`convex-migration` was pushed to `origin`, merged into `main` with `--no-ff`
(merge commit `9a42650`, so the whole migration is one revert point), and
deployed. Build **Ready in 1m**.

`npx convex deploy` ran inside the Vercel build with the `deployment:deploy`-only
key and succeeded — that least-privilege scoping is now **verified, not
assumed**.

Checked against the live site, not inferred:

| Check | Result |
|---|---|
| `https://vidyonnatifoundation.org` | 200 |
| `/about` `<title>` | `About Us \| Vidyonnati Foundation` — the per-page metadata from Phase 2b, so the Server Component shells are live |
| `/api/donations` | 404 — the Supabase routes are genuinely gone from production |
| `/dashboard` | 307 → `/login?redirect=%2Fdashboard` |

### The first production sign-in, and what it did and did not prove

Signed in via **Google** on 2026-08-01 as `agency5027@gmail.com`. That wrote:

```
students: agency5027@gmail.com
  tokenIdentifier: https://clerk.vidyonnatifoundation.org|user_3HJO7hftlghnEE6VBJd39RsPyof
```

The issuer in that `tokenIdentifier` is the **production** Clerk instance, which
is the proof that matters: prod Clerk mints a token carrying `aud: "convex"`,
Convex validates it against `CLERK_JWT_ISSUER_DOMAIN`, `getUserIdentity()`
resolves, and `getOrCreateStudent` writes. `npx convex logs --prod` was tailing
throughout and recorded no errors.

**It did not grant admin, and could not have.** `lookupAdmin` tries
`tokenIdentifier`, then `clerkUserId`, then email — and `agency5027@gmail.com`
does not match the seeded `hello@vidyonnatifoundation.org`, so `requireAdmin`
throws `Forbidden`. That is the authorization behaving correctly.

The `agency5027@gmail.com` `students` row is harmless and can stay; any signed-in
non-admin gets one from the lazy `getOrCreateStudent`.

### The admin sign-in — working, and the `admins` row is still unbound

`hello@vidyonnatifoundation.org` signed up and verified on 2026-08-01
(`user_3HJP0ql6IGcLrfVjYKQaSCbJfOt`). There was **no Clerk account before that** —
confirmed against the Backend API, which returned 0 users for the address. Worth
knowing because it is the answer to "what is the admin password?": there is none
and never was. The `admins` row carries `email`/`name`/`role` only. It is an
**authorization** record; authentication is entirely Clerk's, and access is
gated on control of the mailbox, exactly as the `lookupAdmin` comment intends.

**The row is still unbound, and that is correct.** Two things caused confusion
here, both worth recording:

1. **Binding needs a *write*.** `requireAdminForWrite` binds `clerkUserId` and
   `tokenIdentifier`; `requireAdmin` (every read path) does not. Browsing
   `/admin` therefore binds nothing. Production has no applications, donations
   or spotlight rows yet, so **there is no admin write available to perform** —
   the row will stay unbound until real data exists to act on. Harmless:
   `lookupAdmin` falls through to the email match indefinitely, so admin works
   fully either way. Binding is an optimization, not a requirement.

2. **No `students` row was created for the admin, and that absence is the
   proof it worked.** `app/context/AuthContext.tsx:69` short-circuits on
   `if (me.isAdmin || me.student) return`, so `ensureStudentProfile` never runs
   for an admin. `users.me` calls `lookupAdmin` first and returns
   `isAdmin: true` on an email match. Since no student row appeared and none
   existed to match, `me.isAdmin` must have been true. Do not read a missing
   students row as a failed admin sign-in — it is the opposite.

**The row bound itself as soon as a real admin write happened** (see the
end-to-end run below). Both `clerkUserId` and `tokenIdentifier` are now set to
the production identity. Point 1 above is therefore observed, not predicted.

## End-to-end on production — the whole system, exercised

Run on 2026-08-01 against the live site: a real scholarship application
submitted as a student, put into `needs_info` by the admin, resubmitted, and a
donation placed. `npx convex logs --prod` tailed throughout and captured
**zero errors**.

| What | Result |
|---|---|
| Application | `VF-97503244`, first-year, ends `under_review` |
| Documents | **6** rows — `student_photo`, `aadhar_student`, `aadhar_parent`, `bank_passbook`, `bonafide_certificate`, `ssc_marksheet` |
| Mime types | `application/pdf` · `image/jpeg` · `image/png`, all read from `_storage`, not from the client |
| `searchText` | `agency agency5027@gmail.com VF-97503244` — built, so admin search finds it |
| Donation | `DON-59655882`, ₹500, `pending`, rate limiter allowed the first submission |
| `adminActivityLog` | one `status_change`, `pending → needs_info`, with `reviewerNotes`, attributed to the `admins` row id |
| `admins` binding | `clerkUserId` + `tokenIdentifier` written by `requireAdminForWrite` |

**Counter arithmetic came out exactly right** — the failure this doc warns about
most, and it did not happen:

```
applications:status:pending      0
applications:status:needs_info   0
applications:status:under_review 1
donations:status:pending         1
```

That traces `pending → needs_info → under_review` with **both halves firing at
every hop**. One application exists; exactly one counter holds 1.

### One thing that looks like a gap and is not

The activity log has **one** entry while the application made **two**
transitions. Correct: the second (`needs_info → under_review`) was the
student's resubmit, and `applications.update` flips that status server-side. It
is not an admin action, so it logs nothing and attributes to nobody.

### The document route on production

The last thing that had only ever run in dev — `ALLOWED_WEB_ORIGINS` is
per-deployment, and production's value had been set but never exercised. Tested
directly against `amicable-narwhal-186.convex.site`:

| Case | Result |
|---|---|
| `GET /documents` unauthenticated | **401** |
| `OPTIONS` preflight from `https://vidyonnatifoundation.org` | **204** + `access-control-allow-origin` for that origin |
| `OPTIONS` from an unlisted origin | **403** — fails closed, as designed |

### Step 3: the prod admin row — seeded, and deliberately unbound

**Nothing in the codebase inserts into `admins`** — dev's row was created by
hand, and so was this one. That is by design: an admin row is a privilege grant
and there is deliberately no function that mints one. Recorded here because the
absence of a seed script looks like an oversight until you know it is not.

Seeded in session 5 with:

```
npx convex import --table admins --prod --format jsonLines --append admins.jsonl
```

```json
{"email": "hello@vidyonnatifoundation.org", "name": "Vidyonnati Foundation", "role": "super_admin"}
```

**The absent fields are the point.** Verified with `npx convex data admins
--prod`: the row has `email`, `name`, `role` and **no `tokenIdentifier` or
`clerkUserId` at all**. `lookupAdmin` therefore falls through to the email
match, and `requireAdminForWrite` binds the real Clerk identity on the first
authenticated write. Dev's row is stuck on the fake `user_testadmin` precisely
because it was seeded *with* one — prod does not repeat that mistake.

So the first person to sign in as `hello@vidyonnatifoundation.org` on production
claims the row. Nobody has yet.

**Cheaper fallback worth checking first:** the goal is only to make Google see
the client used. Clerk's hosted Account Portal on the *production* instance may
be able to complete a Google sign-in without the app being deployed at all,
which would buy time and decouple the deadline from steps 1–5. This has **not**
been verified — check it before assuming the full cutover is the only path.

### Recommended order

Decided in session 4 by the user: **Google is handled last, by shipping to
production.** Step 6 of the chain above *is* a production Google sign-in, so the
deadline is discharged as a side effect of the cutover rather than as separate
work. That leaves 14 days for everything below — workable, with no slack.

**Start at 2.** Phases 0 through 4 are done and committed, and session 5
cleared step 1.

1. ~~**Rate limiting** on `donations.create` / `helpInterests.create`.~~
   **Done in session 5** — `@convex-dev/rate-limiter`, per submitted email with
   a global backstop, verified against the dev deployment. See the rate-limiting
   section below for the limits and the numbers most likely to need tuning.
2. **Merge `convex-migration` → `main`.** Every phase is its own commit, so any
   of them is a rollback point. Nothing blocks this now.
3. **Production cutover** — the six-step chain above. It needs two settings that
   did not exist before Phase 4: `NEXT_PUBLIC_CONVEX_SITE_URL` (Vercel) and
   `ALLOWED_WEB_ORIGINS` (a Convex env var on the **prod** deployment). Both are
   in the env map below. The rate limiter needs **no** configuration there — a
   component's tables are created by the deploy — but its first prod deploy is
   also the first time `convex.config.ts` is pushed to that deployment.
4. **Google sign-in on production**, which clears the 2026-08-15 deadline.

Steps 3 and 4 need a human: the Clerk `pk_live`/`sk_live` come from the
production Clerk dashboard, the Vercel project is **not linked locally** (no
`.vercel/`, and the local CLI is outdated), and only a real browser sign-in
exercises the Google client.

### Before touching anything

Read `CLAUDE.md`. Two of its standing rules keep earning their place: **invoke
the `convex` and `clerk` skills rather than working from recall**, and **verify
against installed types or real runtime values rather than inferring**. Every
bug in session 1 came from inferring, and the gotchas list there is not
decoration — each entry cost real debugging time.

Session 3 is the same story: two bugs that reading could not have caught, both
found by running the thing. A `storage.delete()` that silently rolled back, and
a schema validator that would have rejected every card-originated help-interest
submission. Written up under Phase 3 below.

Session 4 is the sharpest example yet, and the lesson is narrower than "verify":
**check that a thing is connected before reasoning about what it does.** Both
wizards had complete zod schemas and step-field maps and no resolver, so nothing
was validated at all — and the first two diagnoses of that were wrong because
they came from reading the schemas rather than running the form. The user caught
both. Details under "Wizard validation" below.

---

## Environment map

| Thing | Value |
|---|---|
| Convex team / project | `vidyonnati-fondation` / `vidyonnati-foundation` |
| Convex **dev** deployment | `dev:unique-dodo-576` → `https://unique-dodo-576.convex.cloud` |
| Convex **prod** deployment | `amicable-narwhal-186` → `https://amicable-narwhal-186.convex.cloud` — **created in session 5, functions deployed, env vars set, admin row seeded.** Site origin `https://amicable-narwhal-186.convex.site`. Every other table is empty. |
| Convex env vars (prod) | `CLERK_JWT_ISSUER_DOMAIN=https://clerk.vidyonnatifoundation.org` · `ALLOWED_WEB_ORIGINS=https://vidyonnatifoundation.org,https://www.vidyonnatifoundation.org` — both set and verified with `npx convex env list --prod` |
| Convex env vars (dev) | `CLERK_JWT_ISSUER_DOMAIN=https://close-garfish-21.clerk.accounts.dev`. `ALLOWED_WEB_ORIGINS` is **unset**, which is fine in dev — `convex/http.ts` defaults to `http://localhost:3000`. Production must set it explicitly. |
| Convex **site** origin (dev) | `https://unique-dodo-576.convex.site` — where HTTP actions are served, a different host from `.convex.cloud`. In `.env.local` as `NEXT_PUBLIC_CONVEX_SITE_URL`; needed on Vercel too. |
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

Phase 4 additionally proved the **document serve path** with real Clerk JWTs —
anonymous, non-student, non-owner, owner, admin, malformed id, wrong kind, and
both CORS directions. The full table is in the Phase 4 section.

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

Nothing known. `tsc --noEmit` 0 errors · `eslint .` 0 errors, **53 warnings**
(down from 56 after Phase 4) · `npm run build` succeeds — no `/api` routes, down
from 46 pages pre-migration. Session 5's rate limiting added **no** warnings and
no errors; those three numbers are unchanged from the end of session 4.

Session 4 also fixed three defects that predate it. The wizard validation gap has
its own section below; the other two were found while wiring photo rendering and
were invisible until then:

- **`next.config.js` allowlisted the dead Supabase host and not Convex.**
  `/admin/spotlight` and `StudentCard` both render Convex `storage.getUrl()`
  URLs through `next/image`, which throws "hostname is not configured under
  images" at render time. It had never fired because the only featured row has
  no photo and `StudentSpotlightSection` is commented out of the homepage. The
  host is now derived from `NEXT_PUBLIC_CONVEX_URL`, so dev and prod are both
  correct without a wildcard that would let the optimizer be pointed at another
  deployment. `images.unsplash.com` (StudentCard's placeholder portraits) was
  missing too, and the Supabase entry is gone.
- **sonner's `<Toaster />` was never mounted.** The root layout mounts the
  shadcn/`useToast` one; six files import `toast` from `sonner` and every
  `toast.success` / `toast.error` in them — all the admin save confirmations and
  review errors — resolved to nothing at all. Both are mounted now, rather than
  rewriting six files onto one system mid-migration.

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

**Added in session 5**
```
convex/convex.config.ts       component mounts — the project's first
convex/lib/rateLimits.ts      four limits + enforceIntakeRateLimit
```
plus the `@convex-dev/rate-limiter` package.

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
only — and this stayed true through Phase 4. The serve path takes a document
**row id** and authorizes it per request; no query anywhere hands the client a
`storage.getUrl()` string for a private file.

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

**Documents rendered no download links and no photos** at the end of 2b — a
dead button would have been worse than none while the serving decision was open.
**Phase 4 filled all of them in;** see that section.

Lint went from 69 warnings to **57** — below the pre-2b baseline, because the
conversion deleted the `useEffect` + `fetch` + `setState` pattern rather than
porting it. 12 `react-hooks/set-state-in-effect` warnings remain, which is the
genuine remainder the plan predicted (`AnimatedInput`, `AnimatedTextarea`,
`HeroSlider`, `MainNavigation` and similar UI state). Restoring that rule to
`"error"` is now a much smaller job.

### Still outstanding: the `createRouteMatcher` migration

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

---

## Lint debt — where it actually stands

`eslint .` is **0 errors, 53 warnings**, in two piles:

| Count | Rule |
|---|---|
| 35 | `@typescript-eslint/no-unused-vars` |
| 12 | `react-hooks/set-state-in-effect` |
| 6 | one-offs (`no-explicit-any` ×2, `no-img-element`, `incompatible-library`, `purity`, `no-anonymous-default-export`) |

Phase 4 took three off the unused-vars pile (imports it put back to work) and
added **none** to `set-state-in-effect`, which is worth knowing for next time:
`useDocumentObjectUrl` does call `setState` inside an effect, but after an
`await`. The rule targets *synchronous* setState during the effect — the
cascading-render case — so an async resolve does not trip it. The claim that
none of the remaining 12 are data fetching still holds.

`set-state-in-effect` is downgraded to `warn` in `eslint.config.mjs`. It started
at 24, on the theory that the `useEffect`+`fetch`+`setState` pattern would
vanish as the migration replaced it. It did: **12 left, and none of them are
data fetching.** The remainder is UI state, and it is now a small, bounded job:

```
app/components/AnimatedInput.tsx          18
app/components/AnimatedTextarea.tsx       28
app/components/HeroSlider.tsx             82
app/components/MainNavigation.tsx         77
app/dashboard/profile/ProfileContent.tsx  53
app/apply/.../ApplicationWizard.tsx       264, 306   (draft restore, autosave)
app/spotlight/.../SpotlightWizard.tsx     224, 265   (same pair)
components/ui/carousel.tsx                114        (vendored)
components/ui/use-mobile.tsx              14         (vendored)
hooks/use-mobile.ts                       14         (vendored, duplicate)
```

Three of those are vendored shadcn/ui files, and `use-mobile` exists twice —
worth deleting one copy before fixing either. Restoring the rule to `"error"`
means clearing the seven first-party instances.

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

## Phase 4 — private document serving (complete)

### The decision, finally made

Deferred on purpose in 2a, 2b and 3 so that no phase could settle it by
accident. Settled in session 4 as: **private documents are served by an
authorized HTTP action, and `ctx.storage.getUrl()` is never used for them.**

The premise was re-checked against the installed types rather than taken from
the earlier notes, and it holds — `getUrl()` returns a URL with no expiry whose
only invalidation is deleting the object: *"Once a file is deleted, any URLs
previously generated by getUrl will return 404s."* Anyone who ever sees the
string can fetch that Aadhaar card forever, and it leaks through browser
history, server logs, `Referer` headers and forwarded links.

Public spotlight photos **keep** plain `getUrl()` in `featured.ts` and
`admin.ts`. They are published on the homepage by design, so a permanent URL
costs nothing. That split is the whole design.

### What was built

| File | What |
|---|---|
| `convex/http.ts` (new) | `GET /documents?kind=…&id=…` + an `OPTIONS` preflight, CORS scoped to an origin allowlist |
| `convex/documents.ts` (appended) | `authorizeDownload` — an **internalQuery**, unreachable from the internet |
| `hooks/use-document-download.ts` (new) | `useDocumentDownload` (blob download) and `useDocumentObjectUrl` (inline photo) |

The authorization lives in a query because HTTP actions have no `ctx.db`. It
re-derives identity from its own `ctx.auth` and takes nothing about the caller as
an argument. Admin-or-owner is checked with `lookupAdmin` / `lookupStudent`
rather than the `require*` guards, so a non-admin falls through to the ownership
check instead of throwing.

**Not-a-student, no-such-document and not-yours all return the same 404**, so the
route cannot be used to learn which document ids exist. A malformed id is
`normalizeId`'d to a clean 404 rather than an `ArgumentValidationError` surfacing
as a 500.

### Why the client fetches instead of linking

Authorization travels in a header, and neither `<a href>` nor `<img src>` can set
one. So the bytes are fetched with `Authorization: Bearer`, turned into a
`blob:` URL, used, and revoked. Nothing shareable is ever produced — no history
entry, no `Referer`, nothing to forward. `getToken()` is called with **no
template argument**, the trap CLAUDE.md records.

Two consequences worth knowing:

- HTTP actions are served from `*.convex.site`, a **different origin** from the
  `.convex.cloud` host the reactive client uses. That is why CORS exists in
  `http.ts` at all, and why an `Authorization` header forces a preflight — without
  the `OPTIONS` route the GET never leaves the browser.
- `ALLOWED_WEB_ORIGINS` is per-deployment and **fails closed**: an unlisted
  origin gets no CORS headers and the browser discards the response. Dev works
  with no config because the default is `http://localhost:3000`; production must
  set it. Same per-instance trap as the Clerk settings.

### Verified against the live deployment

With **real Clerk JWTs** (minted through the Clerk Backend API, `aud: "convex"`
confirmed), not by inspection:

| Case | Result |
|---|---|
| Anonymous | 401 |
| Authenticated, no student row | 404 |
| Authenticated student, **not the owner** | 404 |
| Owner | 200, exact bytes, `image/png` |
| Admin (via `lookupAdmin`'s email fallback) | 200, exact bytes |
| Malformed id / right id + wrong `kind` | 404 |
| Missing params | 400 |
| Preflight from `localhost:3000` / an unlisted origin | 204 + CORS / 403 |
| GET from `localhost:3000` / an unlisted origin | 200 + CORS / 200 with no CORS |

This also settled the one API question worth being unsure about: **`ctx.auth`
does propagate through `ctx.runQuery` from an HTTP action to an internalQuery.**
`requireIdentity` inside the query does not throw on a real request, so the
identity survives the hop. `npx convex run --identity` is **not** a way to test
this — that flag runs through the public path and cannot call internal functions
at all.

Test scaffolding was cleaned up: the throwaway Clerk user was deleted, the probe
`students` row removed, the temporary mutation deleted, and the seeded admin
row's email restored to `hello@vidyonnatifoundation.org`.

### Surfaces wired

Admin scholarship review, admin spotlight review, student application detail,
student spotlight detail, and **both wizards' edit-mode badges** — a student
replacing a document can now check which one is actually on file first.

`app/components/ExistingDocuments.tsx` holds both wizard-side pieces:
`ExistingDocBadge` (filename + download, for PDFs) and `ExistingPhotoPreview`
(the image itself, for the photo fields). The photo upload lives on the
**Personal** step, not the Documents step — which is what the spotlight
Documents step's "go back to the first step to replace it" note refers to, and
why the preview had to be added there.

The two review photos go through the authorized route, not the public one:
`featured.ts` only ever mints URLs for **featured** entries, and an applicant
under review usually is not featured, so their photo has never been public. That
also closes the `/admin/spotlight` `photo_url` wrinkle the earlier notes flagged
as open — `admin.ts:409` already sources it from `spotlightDocuments`.

## Wizard validation — it never existed (fixed in session 4)

Found by clicking through the resubmit flow, not by reading anything. Worth
recording in full because the *diagnosis* was wrong twice before it was right,
and both wrong turns came from inferring instead of running.

### What was actually broken

Both wizards called `useForm({ mode: "onChange", defaultValues })` with **no
`resolver`**, and no field was registered with validation rules. `zodResolver`
appeared exactly once in the codebase, in `HelpInterestDialog`. So every schema
in `lib/schemas/application.ts` and `lib/schemas/spotlight.ts` was defined and
never executed.

Consequences:

- `trigger(fields)` returned `true` unconditionally, so **every step advanced no
  matter what**. A student could reach Review with an entirely empty form.
- Convex validates types, not completeness — `v.string()` accepts `""` — so a
  near-empty application with zero documents would be created successfully.
- Every `{errors.fullName && <p>…</p>}` block in every step was dead code,
  because `errors` was permanently empty.

### The fix

`flatApplicationSchema()` and `flatSpotlightSchema()` merge the existing
per-step schemas into the flat shape react-hook-form actually holds — the
`firstYearApplicationSchema` / `secondYearApplicationSchema` combinations could
not be used directly because they are **nested** (`personalInfo: {…}`).

The schemas turned out to match the step maps **exactly**, step for step; they
had simply never been connected. The only extra key is `studentPhoto` appearing
in the documents schema as well as personal info, which is harmless.

The resolver reads `applicationType` and the edit-mode exemptions from a ref
written **in an effect**, not during render — `react-hooks/refs` rejects a render
write, and it is genuinely unsafe under concurrent rendering. The resolver only
runs on user interaction, which is always after effects have flushed.

### Edit mode: a document on the server satisfies its field

File fields validate `instanceof File`, and edit mode never populates them
because a stored document is a row, not a File. Left alone, a `needs_info`
resubmit would demand every Aadhaar and bank passbook over again. So
`fileFieldToDocumentType` maps each file field to its `documentType`, and
anything already on the server is `.extend()`ed to optional in the schema *and*
dropped from the `trigger()` field list.

Safe because the submit path has always uploaded only the files the student
re-selected — leaving one out means "keep the one I have", which is the whole
point of a resubmit.

### Verified

Schemas, in isolation: an empty form is rejected with 29 / 41 / 25 issues
(first-year, second-year, spotlight); exempting the six file fields clears
exactly those six and leaves the other 23 issues untouched.

End to end, against the dev deployment: a real `needs_info` resubmit of
`VF-18985531` refused to leave the documents step until five files were
uploaded, **did not** ask for the photo already on file, attached all five to
the correct `documentType` with mime types read from `_storage`, flipped the
status to `under_review` server-side, and moved both counter halves.

### Two wrong diagnoses on the way, both from inferring

1. Read the zod schemas and the step-field maps, concluded edit mode *blocked*
   on required files. It did not — nothing blocked, ever, because the schemas
   were not wired to the form. The first "fix" was therefore inert: correct code
   narrowing a field list handed to a `trigger()` that validated nothing.
2. Audited fields with a regex matching only string literals in
   `register`/`watch`/`setValue`, and reported four fields as never collected.
   They are collected — `EducationStep` names them through a ternary
   (`register(isFirstYear ? "collegeAdmitted" : "currentCollege")`). The form
   was accurate; the audit was not.

Both were caught by the user, not by the checks. The standing rule in CLAUDE.md
earned its place again: verify against runtime values, not against what the
source appears to say.

### Also removed

`app/apply/components/steps/StatementStep.tsx` — 108 orphaned lines. Added and
rendered in `c168728`, dropped from the wizard in `d75b2e3` ("Restructure
application form to match paper forms") but never deleted. Its five essay fields
(`whyNeedScholarship`, `progressReport`, `educationalGoals`,
`careerAspirations`, `challengesFaced`) exist in no schema, no step map and no
Convex table; what survived that restructure became the second-year essays on
the Documents step. The spotlight equivalent, `StoryGoalsStep`, is live and
unaffected.

## Rate limiting — the two public mutations (session 5)

The last open item before the branch could merge. `donations.create` and
`helpInterests.create` take no identity by design — donors and enquirers are
never asked for an account — so before this, anyone could insert rows at will.
Not a regression (the Supabase routes had the same exposure via the
service-role key) but the migration was the moment to close it.

### The project's first Convex component

`convex/convex.config.ts` **did not exist** before this. Creating it and running
codegen is what makes the generated `components` object appear in
`convex/_generated/api` — without both, `components.rateLimiter` is a type
error. Worth knowing before mounting the second component: nothing about the
first one is special, but the file it needs is easy to look for and not find.

| File | What |
|---|---|
| `convex/convex.config.ts` (new) | mounts `@convex-dev/rate-limiter` |
| `convex/lib/rateLimits.ts` (new) | the four limits + `enforceIntakeRateLimit` |
| `convex/donations.ts` · `convex/helpInterests.ts` | one call each, after validation |

No client change was needed. Both forms already route their catch through
`convexErrorMessage`, which reads `message` out of an object payload, so a
`ConvexError({ code: "RATE_LIMITED", message, retryAfter })` surfaces as a toast
on `/donate` and a root form error in `HelpInterestDialog` for free.

### The limits, and which numbers to tune

```
donationByEmail     / helpInterestByEmail     token bucket, 5  per hour, capacity 5
donationsGlobal     / helpInterestsGlobal     token bucket, 300 per hour, capacity 100
```

**Per-email** is the limit a real person can trip, and five an hour absorbs a
double-click, a "did that go through?" retry and a genuine second donation.
Token bucket rather than fixed window so the allowance refills smoothly — under
a fixed window a donor who submitted at 10:59 gets nothing until the window
rolls; here they wait twelve minutes for one token.

**The global backstop exists because the per-email key is caller-supplied.**
An attacker changes the email for free, so per-email alone bounds nothing:
cycling addresses gets unlimited rows at five apiece.

It also carries a real trade, stated in the file: **a global limit can be burned
by an attacker, and while it is burned real donors are turned away** — a worse
outcome than junk rows. So it is sized as an emergency ceiling rather than a
traffic limiter. This foundation sees single-digit submissions a day; 100 in a
burst is a number no honest week has produced. **These two numbers are the ones
most likely to need tuning** if a campaign ever drives real bursts, and nothing
else depends on them.

Left unsharded deliberately. Sharding raises write throughput on a limit every
submission touches, at the cost of making it approximate; at this volume the
contention does not exist and the exactness is worth more.

### The thing that will make it look broken

Two separate mechanisms keep a malformed submission from costing quota, and only
one of them is about the component:

1. **Ordering.** Both handlers validate *before* calling the limiter, so a bad
   email or a zero amount throws and never reaches it. Deliberate — a donor
   should not burn their own allowance on a typo.
2. **Rollback.** A component's writes join the calling mutation's transaction,
   so anything that throws *after* the consumption returns the token with it.
   That is what makes consume-then-insert atomic.

The consequence of (1): **a script POSTing garbage can hammer these forever
without ever being limited**, because nothing it sends is written either. Test
with payloads that would actually succeed, or you will conclude the limiter is
not wired. This was hit for real during verification — a test email padded with
spaces failed the existing format regex (which tests the untrimmed string) and
was rejected at `donations.ts:54`, before the limiter.

### Verified against the live deployment

Run, not inspected — every case through the real mutation:

| Case | Result |
|---|---|
| 5 donations, one email | all accepted |
| 6th, same email | `RATE_LIMITED`, `retryAfter` 703950ms → "about 12 minutes" |
| rows + counter after the rejection | exactly 5 rows, counter 0 → 5 — the rejected call wrote nothing and bumped nothing |
| `RateLimit-Test@Example.COM` after exhausting the lowercase form | blocked — the key is lowercased, so case alone does not buy a fresh allowance |
| a genuinely different email | accepted |
| same six-step sequence on `helpInterests.create` | identical |
| global bucket drained, then a donation from a **fresh** email | blocked, and with the *global* message, not the per-email one |
| ...and a help interest from a fresh email at the same moment | accepted — the two surfaces' globals are independent |
| rows after the global rejection | zero |

"About 12 minutes" is the token-bucket arithmetic checking out: 5 per hour is
one token per 12 minutes.

Test scaffolding (`convex/tmpRateLimitTest.ts`) was deleted and the deletion
deployed; all 12 test rows were removed and both counters recounted back to
their pre-test values (`donations:status:pending` 0, `helpInterests:status:new`
1). The dev deployment contents table above is still accurate.

One note from the cleanup worth keeping: **`maintenance:recomputeCounters`
requires an admin identity**, and running it through `npx convex run --identity`
would have rebound the seeded `hello@vidyonnatifoundation.org` admin row to a
throwaway identity via `requireAdminForWrite`. The two affected counters were
recounted directly instead. Not a bug — just a reason to reach for the repair
job deliberately rather than reflexively.

## Open decisions / not yet done

- ~~Rate limiting on the two public mutations.~~ **Done in session 5 — see the
  rate-limiting section below.** Kept here as a pointer because three phases
  deliberately deferred it and the reasoning for the sizing depends on why.
- **Clerk `user.created` webhook → Convex HTTP action.** Not built. The lazy
  `getOrCreateStudent` safety net covers it, so this is an optimization.
- ~~Private document serving.~~ **Decided and built in session 4 — see the
  Phase 4 section below.** Kept here only as a pointer, because three earlier
  phases deliberately refused to settle it and that history is the reason the
  answer is what it is.
- ~~Production Convex deployment does not exist.~~ **Fully set up in session 5**
  — `amicable-narwhal-186`, functions deployed, both env vars set, admin row
  seeded and unbound. The Convex side of the cutover is done.
- **Vercel env vars** not set: `pk_live`/`sk_live`, prod
  `NEXT_PUBLIC_CONVEX_URL`, prod `NEXT_PUBLIC_CONVEX_SITE_URL`,
  `CONVEX_DEPLOY_KEY`. The full list, with the one that is *not* auto-injected
  called out, is in the Vercel section below.

## Vercel configuration

The repo is now **linked locally** (`vercel link`, project
`alphasapien17-gmailcoms-projects/vidyonnati`), so `vercel env` works from here.
That also appended `VERCEL_OIDC_TOKEN` to `.env.local` and added a redundant
`.env*` line to `.gitignore` — both harmless, neither reverted.

| Variable | Value | State |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://amicable-narwhal-186.convex.cloud` | ✅ set (Production) |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://amicable-narwhal-186.convex.site` | ✅ set (Production) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` (decodes to `clerk.vidyonnatifoundation.org$`) | ✅ set (Production) |
| `CLERK_SECRET_KEY` | `sk_live_…` | ✅ set (Production, sensitive) |
| `CONVEX_DEPLOY_KEY` | `prod:amicable-narwhal-186\|…` | ✅ set (Production, sensitive) |

The app reads only `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
directly; the two Clerk keys are read by `@clerk/nextjs` itself.
**`NEXT_PUBLIC_APP_URL` is not needed** by the new code — it survives only in a
comment in `lib/site.ts`. It is still set on Vercel across all environments
because the *old* Supabase app on `main` reads it; leave it, along with the
three `SUPABASE_*` vars, until that rollback path is retired.

> 🔑 The `sk_live_` key was pasted into a chat transcript during session 5.
> **Rotate it.** Clerk supports multiple secret keys, so a new one can be issued
> and the old revoked without downtime.

### The build command

`vercel.json` (new, committed on this branch) sets:

```json
{ "buildCommand": "npx convex deploy --cmd 'npm run build'" }
```

This mechanically enforces CLAUDE.md's "deploy Convex functions before the
frontend" rule: `convex deploy` pushes functions and only then runs the build,
so a failed push means no frontend ships. In the repo rather than in dashboard
settings so it is reviewable, version-controlled, and — because `main` does not
have the file — it cannot take effect until the merge.

The deploy key is scoped to **`deployment:deploy` only**. Not "Select all": that
would have granted `deployment:data:write` (rewrite any production row),
`deployment:env:write` (change `CLERK_JWT_ISSUER_DOMAIN` and break auth) and
`functions:runInternalMutations` (invoke internal functions directly, bypassing
every guard in `convex/lib/auth.ts`) to a key living in Vercel's environment. If
a build ever fails naming a missing scope, add that one box — do not escalate.

⚠️ `--cmd` injects `NEXT_PUBLIC_CONVEX_URL` automatically (verified via
`npx convex deploy --help`: `--cmd-url-env-var-name`, auto-detected for Next.js)
— but **`NEXT_PUBLIC_CONVEX_SITE_URL` is a variable this project invented in
Phase 4 and nothing injects it.** It is set explicitly above for that reason.

### Preview deployments are broken — and the reason is the build command

**Corrected after observing a real failure.** An earlier revision of this section
claimed previews would fail regardless of the build command, because
`app/ConvexClientProvider.tsx:17` constructs
`new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)` at module scope and
Preview scope has no Convex vars. **That was reasoning, not observation, and the
observation says otherwise.**

Pushing `convex-migration` triggered a preview build (commit `5f46e9e`). Its log:

```
Running "npx convex deploy --cmd 'npm run build'"
✖ Vercel build environment detected but no Convex deployment configuration found.
• CONVEX_DEPLOY_KEY for Convex Cloud deployments
Error: Command "npx convex deploy --cmd 'npm run build'" exited with 1
```

It died in **0.7 seconds**, at `convex deploy`, before `npm run build` ever ran.
So:

- The build command **is** the proximate cause. `CONVEX_DEPLOY_KEY` is
  Production-scoped, and `convex deploy` refuses to run without it.
- The module-scope `ConvexReactClient` theory was never reached. It may still be
  a *second* failure waiting behind the first — the Preview scope genuinely has
  no Convex or Clerk vars (`vercel env ls preview`) — but that is **untested**.

Fixing previews therefore needs the deploy step handled *first*, and then very
likely the env vars too:

1. A Convex **preview** deploy key on Preview scope (configured at project level,
   not per-deployment — the existing key is scoped to `amicable-narwhal-186`), or
   a conditional build command that falls back to plain `npm run build` when
   `CONVEX_DEPLOY_KEY` is absent.
2. Then Preview-scoped `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`
   and the Clerk keys — expect the module-scope constructor to fail next
   otherwise.

Not a cutover step; production is unaffected either way.

**Practical consequence:** opening a pull request will show a failed preview
check until this is fixed. Pushing `main` directly does not build a preview.
- **No test suite.** Real gap for a system holding bank details; deliberately
  out of scope during the migration.

---

## Housekeeping

- **The migration is committed.** Branch `convex-migration`, nothing merged to
  `main`. Every phase is its own commit, so any of them is a rollback point:

  | Commit | Covers |
  |---|---|
  | `b9559dc` | Phase 1 — auth + backend foundation |
  | `678c17c` | Phase 2a — read paths |
  | `e9c5699` | Phase 2b part 1 — public pages + student dashboard |
  | `98c845b` | Phase 2b part 2 — admin pages |
  | `0f8b15d` | Phase 3 — write paths + removal of the Supabase surface |
  | `d218cf9` | Docs — handoff rename + next-session plan |
  | `b5e1377` | Phase 4 — authorized private document serving |
  | `cd67cc0` | next/image host allowlist + sonner Toaster mount |
  | `9a41730` | Wizard validation, edit-mode file exemption, StatementStep removal |
  | `0ba233d` | Docs — handoff + CLAUDE.md for Phase 4 |
  | `cc8f953` | Docs — session 5 pickup section |

  Session 5 appends its own rate-limiting commit below that; `git log
  main..convex-migration` is always the authority, and this table has now been
  caught trailing HEAD twice (session 5 opened by finding `cc8f953` missing from
  it, exactly the failure the header warns about). **Update it in the same
  commit as the work.**

  The two session-4 bug fixes are deliberately separate from the Phase 4 work,
  so `cd67cc0` can be cherry-picked onto `main` ahead of the migration if the
  broken image host or the silent toasts ever need fixing sooner.

  Each phase is its own commit, so any of them is a rollback point. Nothing has
  been merged to `main` yet.
- Session 1 left `npx convex logs` and a Next dev server on port 3000 running as
  background tasks. Those task IDs died with that session; if either process is
  still alive it is orphaned and safe to kill.
- An empty stray Convex project `vidyonnati` exists under the old `agency5027`
  team (created in error). Dashboard-only deletion; harmless.
- `.gitignore` now covers `.history/`, `.playwright-mcp/`, `agent/`.
- `agent/` is a redundant third copy of the agent skills written by
  `npx convex ai-files install`; Claude Code reads `.claude/skills/`.
