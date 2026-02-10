# Debug Session: Login Button Not Appearing After Signout

**Date:** 2026-02-10
**Status:** RESOLVED
**Commit:** `46f26c7` — Fix login button not appearing after signout on landing page
**Files Changed:** `app/context/AuthContext.tsx`, `app/dashboard/layout.tsx`

---

## The Bug

After logging in and signing out, the Login button on the landing page navigation bar was not appearing. The issue persisted even after multiple browser refreshes. The dashboard and all other authenticated pages worked correctly.

---

## Investigation

### How auth renders on the landing page

The `MainNavigation` component conditionally renders the auth section:

```tsx
{!isLoading && (
  user ? <UserDropdown /> : <LoginButton />
)}
```

When `isLoading` is `true`, **nothing renders** in the auth area — no login button, no user dropdown. The rest of the navbar (Home, About Us, etc.) renders normally.

### How auth renders on the dashboard (worked fine)

The dashboard layout handles all states with fallback skeleton UI:

```tsx
if (!user && isLoading) return <DashboardSkeleton />
if (!isLoading && !user) return <DashboardSkeleton />
// otherwise render dashboard
```

This meant the dashboard never appeared "broken" regardless of auth state — it always had visible UI.

### Root cause 1: `isLoading` stuck at `true`

In the `INITIAL_SESSION` handler inside `AuthContext`, `setIsLoading(false)` was placed **after** an `await fetchUserData()` call with no try/catch wrapper:

```typescript
if (event === 'INITIAL_SESSION') {
  setUser(session?.user ?? null)
  if (session?.user) {
    await fetchUserData(session.user.id)  // if this throws...
  }
  setIsLoading(false)  // ...this never runs
}
```

While the inner functions (`checkIsAdmin`, `fetchStudent`) had individual try/catch blocks, `fetchUserData` itself did not. Any unhandled error propagating from Supabase internals (e.g., a race condition between token refresh and the `SIGNED_OUT` event during `supabase.rpc('is_admin')`) would skip `setIsLoading(false)`, permanently hiding the auth section on the landing page.

### Root cause 2: `signOut` not reliably clearing cookies

Deep-dive into `@supabase/auth-js` GoTrue client source revealed that `_signOut()` has multiple early-return paths where `_removeSession()` (which clears cookies) is never called:

1. **`_useSession` returns a session error** (e.g., expired token that can't refresh) → returns early, skipping `_removeSession()`
2. **API call fails with non-401/403/404 error** (e.g., 500, network error) → returns early, skipping `_removeSession()`

The original `signOut` function in AuthContext ignored the error:

```typescript
const signOut = async () => {
  await supabase.auth.signOut({ scope: 'global' })  // error ignored
  setUser(null)  // state cleared, but cookies may remain
}
```

When cookies survived signout, on page refresh `INITIAL_SESSION` would fire with a stale session from the cookies, setting `user` to a truthy value and feeding back into root cause 1 when subsequent API calls hit revoked tokens.

### Root cause 3: Dashboard signout missing `router.refresh()`

The dashboard's `handleSignOut` did not call `router.refresh()` after `router.push('/')`, so the proxy middleware never ran to clean up any remaining stale cookies server-side. The `MainNavigation` handler already had `router.refresh()` but the dashboard handler did not.

---

## Fixes Applied

### 1. Wrapped `fetchUserData` in try/finally (AuthContext.tsx)

```typescript
// INITIAL_SESSION handler
try {
  if (session?.user) {
    await fetchUserData(session.user.id)
  }
} catch (err) {
  console.error('Failed to fetch user data on init:', err)
} finally {
  setIsLoading(false)       // ALWAYS runs
  initializedRef.current = true
}
```

Applied the same pattern to the `SIGNED_IN` handler. For the background refresh branch (post-init `SIGNED_IN`), switched from `await` to fire-and-forget with `.catch()` since it doesn't gate `isLoading`.

### 2. Made signOut resilient to errors (AuthContext.tsx)

```typescript
const signOut = async () => {
  // Clear state FIRST for immediate UI update
  setUser(null)
  setSession(null)
  setStudent(null)
  setIsAdmin(false)

  const { error } = await supabase.auth.signOut({ scope: 'global' })
  if (error) {
    // Force-clear all Supabase auth cookies manually
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; path=/; max-age=0`
      }
    })
  }
}
```

Two key changes:
- **State cleared before the API call** — UI updates immediately, no waiting for the network
- **Manual cookie cleanup on error** — if `signOut()` fails to clear cookies internally, we force-delete all `sb-*` cookies so stale tokens can't resurrect the session

### 3. Added `router.refresh()` to dashboard signout (dashboard/layout.tsx)

```typescript
const handleSignOut = async () => {
  await signOut()
  router.push('/')
  router.refresh()  // triggers proxy to clean up cookies server-side
}
```

Now matches the `MainNavigation` handler behavior.

---

## Key Takeaway

The landing page's `{!isLoading && (...)}` guard is an all-or-nothing gate. If `isLoading` gets stuck at `true` for any reason, the entire auth UI disappears silently — and unlike the dashboard (which shows skeleton fallbacks), there is zero visual indication that something went wrong. Always use `try/finally` when `setIsLoading(false)` must run after async work, and never trust `supabase.auth.signOut()` to succeed — handle the error path with manual cookie cleanup.
