# Debug Session Summary: Dashboard Data Fetching Bug

**Date:** 2026-01-31
**Status:** UNRESOLVED — needs continued debugging

---

## The Bug

Both the **admin dashboard home** (`/admin`) and **student dashboard home** (`/dashboard`) fail to load data. Stats show `-`, activity/applications show skeleton loading state. Data only appears after a hard refresh (Cmd+Shift+R).

**Other admin pages work fine** — e.g., `/admin/scholarship-applications`, `/admin/donations`, `/admin/spotlight-applications` all load data correctly without any refresh.

---

## What Was Discovered

### 1. `proxy.ts` was dead code (FIXED)

The original `proxy.ts` at the project root had valid middleware logic but Next.js never executed it because:
- Next.js 16 requires the file to be named `proxy.ts` (correct) BUT the exported function was named `proxy` (correct for Next.js 16)
- However, the route matcher was too narrow: only covered `/dashboard`, `/apply`, `/login`, `/register` — missing `/admin`, `/spotlight/apply`
- **No `middleware.ts` existed** — and Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`

**Fix applied:** Rewrote `proxy.ts` with proper `updateSession()` utility and catch-all route matcher. Build output now shows `ƒ Proxy (Middleware)` confirming it runs.

### 2. Working pages vs broken pages — different data fetching patterns

**Working pages** (e.g., `app/admin/scholarship-applications/page.tsx`):
```typescript
// Fetches on mount, NO dependency on useAuth()
// API route handles auth server-side
useEffect(() => {
  fetchApplications()  // calls fetch('/api/admin/scholarship-applications')
}, [fetchApplications])
```

**Broken pages** (e.g., `app/admin/page.tsx`, `app/dashboard/page.tsx`):
```typescript
// Gates data fetching behind AuthContext state
useEffect(() => {
  if (authLoading) return  // blocks until context resolves
  if (!user) return        // blocks until user is set
  fetchData()              // timing-dependent
}, [user, authLoading])
```

### 3. AuthContext `INITIAL_SESSION` was not handled

The original AuthContext used `getSession()` for initial check and only handled `SIGNED_IN` in `onAuthStateChange`. Supabase v2 fires `INITIAL_SESSION` as the primary event on subscription — it was silently dropped.

---

## Changes Made (all still in working tree, uncommitted)

### Files Created
- **`proxy.ts`** (project root) — Next.js 16 proxy entry point, exports `proxy()`, catch-all route matcher
- **`lib/supabase/proxy.ts`** — `updateSession()` utility: creates Supabase server client, calls `getUser()` to refresh cookies, handles route protection redirects

### Files Modified
- **`app/context/AuthContext.tsx`** — Multiple iterations:
  1. First: replaced `getSession()` with `getUser()` for initial check, added `TOKEN_REFRESHED`/`SIGNED_OUT` handling
  2. Second: rewrote to use `onAuthStateChange` as single source of truth with `INITIAL_SESSION` handling, removed separate `getUser()` call
  - Current state: handles `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`
  - Uses `useMemo` for stable Supabase client reference
  - Has `initializedRef` to prevent double-processing

- **`app/admin/page.tsx`** — Multiple iterations:
  1. First: added `authLoading` dependency from `useAuth()`
  2. Second: removed AuthContext dependency entirely, fetches on mount with `[]`, gets user directly via `supabase.auth.getUser()`
  - Current state: self-sufficient data fetching, no `useAuth()` for data gating

- **`app/dashboard/page.tsx`** — Same iterations as admin page:
  - Current state: self-sufficient data fetching, no `useAuth()` for data gating

### Files Deleted
- **`proxy.ts`** (the OLD one) — was dead code, replaced by new proxy.ts + lib/supabase/proxy.ts

---

## What Was Tried (in order)

### Attempt 1: Create proper middleware
- Created `middleware.ts` with `updateSession()` and catch-all matcher
- **Result:** Build showed middleware active, but Next.js 16 uses `proxy.ts` not `middleware.ts`

### Attempt 2: Rename to proxy.ts (Next.js 16 convention)
- Renamed `middleware.ts` → `proxy.ts`, `lib/supabase/middleware.ts` → `lib/supabase/proxy.ts`
- Changed export from `middleware()` to `proxy()`
- **Result:** Build passes, proxy recognized. But dashboard still didn't load data.

### Attempt 3: Fix AuthContext — getUser() + event handling
- Replaced `getSession()` with `getUser()` in AuthContext
- Added handling for `TOKEN_REFRESHED` and `SIGNED_OUT` events
- **Result:** Dashboard still didn't load data.

### Attempt 4: Add authLoading dependency to dashboard pages
- Both dashboard pages now depend on `[user, authLoading]`
- Early return when `authLoading` is true, set `isLoading(false)` when user is null
- **Result:** Dashboard still didn't load data.

### Attempt 5: Rewrite AuthContext to use INITIAL_SESSION
- Removed separate `getUser()`/`getSession()` calls
- Used `onAuthStateChange` as single source of truth
- Handle `INITIAL_SESSION` as the primary initialization event
- **Result:** Dashboard still didn't load data.

### Attempt 6: Make dashboard pages self-sufficient
- Removed all `useAuth()` dependencies for data fetching
- Pages now call `supabase.auth.getUser()` directly on mount with `[]` deps
- Same pattern as working pages
- **Result:** Dashboard still didn't load data.

---

## What Has NOT Been Tried

1. **Check browser console for actual errors** — We attempted to use Playwright to access the running app but the dev server kept exiting. Need to check the browser console manually for:
   - Network errors on API calls
   - Supabase auth errors
   - JavaScript exceptions
   - Whether `supabase.auth.getUser()` returns user or error on the client

2. **Add console.log debugging** — Add logging to the dashboard useEffect to trace:
   - Does the effect fire?
   - Does `getUser()` resolve? With what result?
   - Do the Supabase queries return data or errors?
   - Does `setIsLoading(false)` execute?

3. **Check if the issue is Supabase RLS** — If the browser client's token is somehow invalid despite proxy refreshing cookies, RLS would silently block queries. Check the Supabase dashboard logs for auth errors.

4. **Check if `createBrowserClient` reads cookies properly** — The `@supabase/ssr` browser client reads session from cookies. If the proxy sets cookies but the browser client doesn't pick them up (timing, SameSite issues, etc.), all client-side queries would fail.

5. **Test with a simple fetch to API route** — Replace all direct Supabase client calls in the admin page with API route calls (like `/api/admin/stats` which already works). If this fixes it, the issue is with the browser Supabase client's session, not with data fetching logic.

6. **Check cookie values** — In browser DevTools > Application > Cookies, verify Supabase auth cookies exist and are updated after proxy runs.

7. **Network tab inspection** — Check if the dashboard's API/Supabase calls are actually being made, and what responses they get.

8. **React Strict Mode** — In development, React Strict Mode runs effects twice (mount, unmount, mount). This could cause race conditions with async effects. Test with Strict Mode disabled.

---

## Current File States

### `proxy.ts` (project root)
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### `lib/supabase/proxy.ts`
- Creates Supabase server client with cookie get/set handlers
- Calls `supabase.auth.getUser()` to refresh token
- Redirects unauthenticated users from protected routes (`/dashboard`, `/admin`, `/apply`, `/spotlight/apply`)
- Redirects authenticated users away from `/login`, `/register`

### `app/context/AuthContext.tsx`
- Uses `onAuthStateChange` as single source of truth
- Handles: `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`
- No separate `getUser()`/`getSession()` calls
- `useMemo` for stable client, `initializedRef` to prevent double-processing

### `app/admin/page.tsx`
- Self-sufficient: calls `supabase.auth.getUser()` directly on mount
- `[]` dependency array — fetches immediately, no AuthContext gating
- `useAuth()` only used for `user` in welcome display name

### `app/dashboard/page.tsx`
- Same pattern as admin page — self-sufficient data fetching
- `useAuth()` only used for `student` display name

---

## Key Hypothesis for Next Session

The most likely remaining issue is that `supabase.auth.getUser()` on the browser client is failing or returning null even after the proxy refreshed cookies. This would cause:
- The `if (!currentUser) return` guard to exit early
- `isLoading` stays true (in the `finally` block it DOES set false, but data arrays stay empty)

Wait — actually, with the current code's `try/finally`, `isLoading` WILL be set to false. So the page should show "No applications yet" / "No recent activity" (empty states), NOT skeletons. **If the user is still seeing skeletons/`-` values, it means `isLoading` is stuck at `true`, which means the `useEffect` isn't firing at all OR the async function is hanging before the `finally` block.**

**Priority debug step:** Add `console.log('effect fired')` at the top of both dashboard useEffects and `console.log('getUser result:', user, error)` after the getUser call. This will immediately reveal whether the effect fires and what getUser returns.

---

## Package Versions
- `next`: ^16.0.5
- `@supabase/ssr`: ^0.8.0
- `@supabase/supabase-js`: ^2.86.0
- `react`: ^19.2.0
