# Debug Session: Auth Section Not Rendering on Landing Page Navigation

**Date:** 2026-02-10
**Status:** RESOLVED
**Commits:**
- `fb98ba2` — LayoutWrapper: keep nav always mounted (reverted)
- `21cf427` — Add debug logging (temporary)
- `1b4dae7` — Switch auth section to CSS-based visibility
- `3a98bef` — Remove router.refresh() from landing page signout

**Files Changed:** `app/components/MainNavigation.tsx`, `app/components/LayoutWrapper.tsx`, `app/context/AuthContext.tsx`

---

## The Bug

After logging in and navigating from the dashboard back to the landing page (by clicking the logo), the auth section in the navbar (profile name dropdown or Login button) did not appear. The rest of the navbar (logo, Home, About Us, etc.) rendered normally. A manual browser refresh sometimes fixed it, but the behavior was intermittent.

A secondary issue: after signing out from the landing page navbar, the Login button also failed to appear.

---

## Investigation

### Attempt 1: LayoutWrapper conditional rendering (fb98ba2)

**Theory:** `LayoutWrapper` completely unmounts `MainNavigation` on `/dashboard` routes and remounts it fresh when navigating to `/`. The freshly mounted component might not pick up auth context values correctly during the Next.js navigation transition.

```tsx
// LayoutWrapper.tsx — original code
if (isDashboard || isAdmin) {
  return <>{children}</>          // MainNavigation NOT in the tree
}
return (
  <>
    <TopNavigation />
    <MainNavigation />            // Only exists on non-dashboard routes
    <main>{children}</main>
    <Footer />
  </>
)
```

**Fix attempted:** Wrapped `TopNavigation` and `MainNavigation` in a `<div>` that uses Tailwind's `hidden` class on dashboard routes, keeping them always mounted.

**Result:** Partially worked — the issue still occurred intermittently. The `<div>` wrapper also introduced layout concerns (extra DOM nesting around sticky nav). This approach was **reverted**.

### Attempt 2: Debug logging (21cf427)

Added temporary `console.log` statements to:
- `AuthProvider` — track mount/unmount and auth state change events
- `MainNavigation` — track what `isLoading`, `user`, and `student` values the component sees

### Key findings from production logs

**Log on page load:**
```
MainNavigation render: isLoading=true, hasUser=false, userName=none
AuthProvider MOUNTED (count: 1)
onAuthStateChange: event=SIGNED_IN, hasSession=true, hasUser=true, initializedRef=false
MainNavigation render: isLoading=true, hasUser=true, userName=chakra5027
```

**Log after auth fully resolved:**
```
MainNavigation render: isLoading=false, hasUser=true, userName=Chakra D
```
*Yet the auth section was still not visible on screen.*

**Log when it eventually appeared (after a background token refresh):**
```
onAuthStateChange: event=SIGNED_IN, hasSession=true, hasUser=true, initializedRef=true
MainNavigation render: isLoading=false, hasUser=true, userName=Chakra D
MainNavigation render: isLoading=false, hasUser=true, userName=Chakra D
```

### What the logs revealed

1. **AuthProvider does NOT remount** during navigation (count stayed at 1).
2. **`INITIAL_SESSION` never fired** — Supabase fired `SIGNED_IN` instead (a known behavior in some Supabase versions for existing sessions from cookies).
3. **The auth state was correct** (`isLoading=false, hasUser=true`) but the auth section was not visible in the DOM.
4. **The auth section only appeared after a later re-render** triggered by a background `SIGNED_IN` event (token refresh).

---

## Root Cause

### React hydration/rendering issue with conditional mounting

The original auth section used conditional rendering to hide during loading:

```tsx
{!isLoading && (
  <>
    {user ? <DropdownMenu>...</DropdownMenu> : <Link href="/login">...</Link>}
  </>
)}
```

This pattern (`{condition && <Component/>}`) requires React to **insert new DOM nodes** when the condition changes from `false` to `true`. The server renders nothing (isLoading=true), the client eventually resolves auth and needs to insert the dropdown/login button.

In this Next.js 16 App Router setup, React intermittently **failed to commit the DOM insertion** after the server-rendered empty slot. The virtual DOM was correct (state showed `isLoading=false, hasUser=true`), but the actual DOM wasn't updated until a subsequent re-render from a different event (like a background token refresh) forced React to reconcile again.

### router.refresh() re-introducing hydration mismatch

The signout handler called `router.refresh()` after clearing auth state:

```tsx
const handleSignOut = async () => {
  await signOut()       // clears state: user=null, isLoading=false
  router.push("/")
  router.refresh()      // triggers server re-render
}
```

`router.refresh()` causes Next.js to re-fetch the RSC payload from the server. The server renders `MainNavigation` with initial state (`isLoading=true`) → auth section hidden. The client then needs to reconcile this with its current state (`isLoading=false, user=null`) → auth section should be visible (Login button). This reconciliation hit the same intermittent DOM update failure, causing the Login button to not appear after signout.

---

## Fixes Applied

### 1. Switched from conditional rendering to CSS-based visibility (1b4dae7)

**Before:**
```tsx
{!isLoading && (
  <>{user ? <DropdownMenu>...</DropdownMenu> : <Link>Login</Link>}</>
)}
```

**After:**
```tsx
const showAuth = !isLoading || !!user

<div className={showAuth ? '' : 'hidden'}>
  {user ? <DropdownMenu>...</DropdownMenu> : <Link>Login</Link>}
</div>
```

Two changes:
- **Always-present DOM:** The auth section is always in the DOM. Visibility is toggled via Tailwind's `hidden` class (`display: none`) instead of mounting/unmounting React elements. React only needs to update a CSS class (reliable) instead of inserting new DOM nodes (intermittently failing).
- **Relaxed guard:** `showAuth = !isLoading || !!user` — shows the auth section as soon as the `user` is available, even while `fetchUserData` (admin check + student profile) is still loading. The display name falls back to `user.email.split("@")[0]` until the student profile loads. The only case where the section is hidden: `isLoading=true AND user=null` (initial state before any auth event resolves), which prevents a flash of the Login button for logged-in users.

Applied to both the desktop and mobile auth sections in `MainNavigation`.

### 2. Removed router.refresh() from landing page signout (3a98bef)

```tsx
const handleSignOut = async () => {
  await signOut()
  router.push("/")
  // router.refresh() removed — it triggered a server re-render that
  // re-introduced the hydration mismatch, hiding the Login button
}
```

`router.refresh()` was originally added (in the previous debug session) as a defensive measure to ensure the proxy middleware cleans up cookies server-side. However, `signOut()` already handles cookie cleanup:
1. `supabase.auth.signOut({ scope: 'global' })` clears cookies internally
2. If that fails, manual `sb-*` cookie deletion runs as a fallback

The dashboard's `handleSignOut` retains `router.refresh()` since it navigates from `/dashboard` to `/` (a cross-layout navigation where the server refresh helps ensure clean state).

### 3. Reverted LayoutWrapper div wrapper

The `LayoutWrapper` was restored to its original conditional rendering pattern (two separate return paths). The `<div>` wrapper added in the first attempt was unnecessary once the real cause (DOM insertion failure, not context subscription) was identified, and it introduced extra DOM nesting around the sticky nav.

---

## Key Takeaway

**Don't use `{condition && <Component/>}` for auth-dependent UI in Next.js App Router** when the condition depends on client-side state that differs from the server-rendered initial value. The server renders "nothing" and the client needs to insert new DOM nodes — a transition that can intermittently fail during React's hydration reconciliation.

Instead, **always render the container in the DOM** and toggle visibility with CSS classes. This reduces the DOM update to a simple class attribute change, which React handles reliably even during hydration reconciliation.

Also: avoid `router.refresh()` after state changes that affect the UI, unless absolutely necessary. It causes a server re-render with initial state, re-introducing hydration mismatches that the client must reconcile.

---

## Supabase Auth Behavior Note

During this investigation, we observed that `INITIAL_SESSION` did not fire from `onAuthStateChange` — instead, `SIGNED_IN` fired directly with `initializedRef=false`. The existing code already handled this case via the `if (!initializedRef.current)` branch in the `SIGNED_IN` handler. This is a known Supabase behavior where some versions skip `INITIAL_SESSION` for existing sessions loaded from cookies.
