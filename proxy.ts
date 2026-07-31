import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Replaces the Supabase updateSession() proxy. Clerk manages its own session
// cookies, so there is no token-refresh step to perform here — this file is now
// purely route protection.
//
// Route semantics carried over unchanged from the Supabase version:
//   - unauthenticated hit on a protected route  → /login?redirect=<pathname>
//   - authenticated hit on /login or /register  → the ?redirect target, else /dashboard

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/apply(.*)",
  "/spotlight/apply(.*)",
])

const isAuthRoute = createRouteMatcher(["/login", "/register"])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  if (isAuthRoute(request) && userId) {
    const target = request.nextUrl.searchParams.get("redirect") || "/dashboard"
    const url = request.nextUrl.clone()
    url.pathname = target
    url.searchParams.delete("redirect")
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute(request) && !userId) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
}
