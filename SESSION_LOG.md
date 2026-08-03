# Session log

A chronological record of what each working session did, decided, and learned.

**This is history, not state.** It is never the place to look up how the system
is configured today — that is `PHASE_4_HANDOFF.md`, which is the single source of
current state and is updated in place. Two documents both claiming to describe
the present is exactly the failure this project has already hit twice (session 3
found a four-commit-stale line; session 5 found the commit table trailing HEAD).
Entries here are append-only and are correct as of their own date, nothing more.

Sessions 1–4 predate this file. Their record is the handoff plus `git log`.

---

## Session 6 — 2026-08-03

**The site is in real use.** Four `students` rows on production, including
complete applications with real names, addresses, dates of birth and phone
numbers. Production now holds genuine personal data — no more test wipes without
checking what is real first, and the credential rotations below stopped being
housekeeping.

### Fixed: admins landed on an empty student dashboard

Reported as "I log in as `hello@vidyonnatifoundation.org` and see the student
dashboard." **Auth was never wrong.** Three things combined:

1. `app/(auth)/login/page.tsx:16` redirects everyone to `/dashboard` —
   `searchParams.get("redirect") || "/dashboard"`, no `isAdmin` branch.
2. Admins have no `students` row by design; `AuthContext` skips
   `ensureStudentProfile` for them.
3. `dashboard.summary` returns `{ student: null, applications: [], … }` for a
   caller with no student row rather than throwing — so the page rendered a
   working, empty student dashboard.

`me.isAdmin` was true throughout and the `admins` row was correctly bound. It
survived session 5's testing only because `/admin` was always reached by typing
the URL, never by the default post-login path.

**Fixed in the dashboard layout, not the login redirect** (`f2b1432`). The login
page covers exactly one entry path; the layout also catches bookmarks, a stale
`?redirect=/dashboard`, and direct navigation. Uses `router.replace` so the back
button does not bounce, plus a render guard on `isAdmin` so the student
dashboard does not flash for a frame while the redirect is in flight. No loop:
the admin layout sends non-admins to `/`, not `/dashboard`, and both read
`isAdmin` from the same context.

Deployed to production; site verified healthy afterwards.

### Still open — and now urgent

**Rotate the Clerk `sk_live_` key and the Convex deploy key.** Both were pasted
into a chat transcript in session 5. That was untidy when production was empty;
with real applicants in the system the Clerk key now grants read access to their
personal records.

---

## Session 5 — 2026-08-01

**Went in with:** the migration complete but unmerged on `convex-migration`, one
open decision (rate limiting), and a Google OAuth client due for deletion on
2026-08-15 unless a *production* sign-in exercised it.

**Came out with:** the migration live in production, verified end to end against
real infrastructure, and the deadline discharged.

### What shipped

| | |
|---|---|
| Rate limiting | `@convex-dev/rate-limiter` on `donations.create` / `helpInterests.create` — per-email 5/hour, global backstop 300/hour |
| Production Convex | `amicable-narwhal-186` created, env vars set, functions deployed |
| Production admin | `hello@vidyonnatifoundation.org` seeded, then bound on first admin write |
| Vercel | five Production variables + build command pinned in `vercel.json` |
| Merge | `convex-migration` → `main`, `--no-ff` (`9a42650`), one revert point |
| Deploy | live, build Ready in 1m |

Commits: `66a6929` `af36b22` `f2607bc` `5e046b9` `5f46e9e` `9a42650` `7136fc8`
`b78daf6` `c29605a` `35335f1` `4d77bb8`

### Decisions worth remembering

**Rate limits are sized as an emergency ceiling, not a traffic limiter.** The
per-email limit is the one a real person can trip. The global backstop exists
only because the email key is caller-supplied and therefore free to change — but
a global limit can be burned by an attacker, and while burned it turns real
donors away. 300/hour is a number no honest week has produced here. Those two
numbers are the most likely in the codebase to need tuning.

**The deploy key is scoped to `deployment:deploy` alone.** "Select all" would
have handed a key living in Vercel's environment the ability to rewrite
production rows, change `CLERK_JWT_ISSUER_DOMAIN`, and invoke internal functions
directly — bypassing every guard in `convex/lib/auth.ts`. The narrow scope was
then proven sufficient by a real production build.

**The build command lives in `vercel.json`, not dashboard settings** — so it is
reviewable, version-controlled, and could not take effect before the merge.

**`hello@` stayed the admin address** rather than repointing the row to a
personal account. Access is gated on control of that mailbox.

### What was learned the hard way

**A rate limit behind validation cannot be tripped by bad input.** Both handlers
validate before calling the limiter, so malformed payloads never reach it. This
is separate from the component's transactional rollback, and conflating the two
produces a wrong mental model of why a token was or was not spent. Testing with
invalid input makes the limiter look unwired.

**A wrong diagnosis, corrected by observation.** The preview-build failure was
attributed to `ConvexClientProvider` constructing its client at module scope with
no `NEXT_PUBLIC_CONVEX_URL`. The actual log showed it exiting in 0.7s at
`convex deploy` for a missing `CONVEX_DEPLOY_KEY`, before the build ever ran. The
build command *was* the proximate cause. Reasoned from source instead of watching
it fail — the exact habit `CLAUDE.md` warns about, repeated.

**A missing `students` row for an admin is proof of success, not failure.**
`AuthContext` short-circuits on `me.isAdmin || me.student`, so
`ensureStudentProfile` never runs for an admin. No row appearing means
`isAdmin` resolved true.

**Admin binding needs a *write*.** `requireAdminForWrite` binds `clerkUserId`
and `tokenIdentifier`; `requireAdmin` on every read path does not. Browsing
`/admin` binds nothing. The email fallback works indefinitely regardless, so
binding is an optimization.

**There is no admin password, and never was.** The `admins` row authorizes;
Clerk authenticates. The Clerk Backend API confirmed zero users existed for the
address before sign-up.

**`maintenance:recomputeCounters` needs an admin identity**, so running it via
`npx convex run --identity` would rebind the seeded admin row to a throwaway
identity.

**A student row cannot be deleted out from under a live session** — it is
recreated within seconds by the lazy safety net.

### Verified against production, not inferred

A real application submitted, moved to `needs_info` by the admin, resubmitted by
the student, and a donation placed — `npx convex logs --prod` tailing throughout,
zero errors.

Counter arithmetic came out exact: `pending 0`, `needs_info 0`,
`under_review 1` — both halves firing at every hop. Six documents attached with
mime types read from `_storage` rather than the client. The private document
route returned 401 unauthenticated, 204 with CORS from the real origin, and 403
from an unlisted one.

The single activity-log entry against two status transitions is correct — the
second was the student's resubmit, which `applications.update` flips server-side
and rightly attributes to nobody.

### Cleanup

Test data wiped, including **the six storage objects**, not just their rows —
`maintenance.sweepOrphanedFiles` spares anything under 24h, so waiting would have
left Aadhaar cards and bank passbooks in production storage, unreferenced and
unreachable by any query. Verified 0 files remaining.

### Left open

- **Rotate two credentials** pasted into a chat transcript this session: the
  Clerk `sk_live_` key and the Convex deploy key. Both do issue-new-then-revoke
  with no downtime.
- **Delete the stale Supabase redirect URI** from Google OAuth client
  `391398186976-…`, kept until production Clerk sign-in was proven. It now is.
- **Preview deployments fail.** Needs a preview deploy key *and* Preview-scoped
  Convex/Clerk vars, in that order.
- Pre-existing and unchanged: no test suite, the `createRouteMatcher`
  migration, 53 lint warnings, the Clerk `user.created` webhook.
