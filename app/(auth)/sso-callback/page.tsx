"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

// Intermediate landing point for OAuth (Google) sign-in and sign-up.
// Replaces the Supabase /callback route, which exchanged an auth code for a
// session by hand — Clerk's component handles the whole exchange and then
// redirects on its own.
//
// Referenced as `redirectCallbackUrl: "/sso-callback"` in the login and
// register pages. Renaming this route means updating both.
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/40">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-gray-500">Completing sign-in…</p>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
