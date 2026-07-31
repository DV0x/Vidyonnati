"use client"

import { createContext, useContext, useEffect, useMemo } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useConvexAuth, useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import type { Student } from "@/types/database"

// Identity now comes from Clerk, profile data from Convex.
//
// The public interface is unchanged from the Supabase version so the 12
// consuming components need no edits. What went away internally:
//   - the initializedRef dance separating boot from post-idle SIGNED_IN
//   - manual sb-* cookie clearing on failed sign-out
//   - three round-trips (is_admin RPC, students fetch, /api/admin/info)
//     collapsed into one reactive query
//
// It also fixes the bug in ADMIN_DASHBOARD_PLAN.md:556 where clicking a
// document download triggered a token refresh that blanked the dashboard:
// Convex subscriptions don't churn isLoading on refresh.

interface AuthUser {
  id: string
  email: string | null
  /**
   * OAuth provider used to sign in ("google"), or null for email/password.
   * Replaces Supabase's `user.app_metadata.provider`.
   */
  provider: string | null
}

interface AuthContextType {
  user: AuthUser | null
  student: Student | null
  isAdmin: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  refreshStudent: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// TEMPORARY ADAPTER — remove in Phase 3.
//
// Convex documents are camelCase; six components still read the Supabase
// snake_case Student shape (ApplicationWizard, SpotlightWizard, profile page,
// MainNavigation, dashboard layout + page). Three of those are rewritten in
// Phase 3 anyway, so mapping here beats churning ~40 field references now.
// Typing the return as `Student` makes the compiler prove the shim is complete.
function toLegacyStudent(doc: Doc<"students">): Student {
  return {
    id: doc._id,
    email: doc.email,
    full_name: doc.fullName ?? null,
    phone: doc.phone ?? null,
    date_of_birth: doc.dateOfBirth ?? null,
    gender: doc.gender ?? null,
    address: doc.address ?? null,
    village: doc.village ?? null,
    mandal: doc.mandal ?? null,
    district: doc.district ?? null,
    pincode: doc.pincode ?? null,
    created_at: new Date(doc._creationTime).toISOString(),
    updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Gate on useConvexAuth, NOT Clerk's isLoaded: Clerk can report signed-in
  // before Convex has validated the token, and querying in that window sends
  // unauthenticated requests.
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()

  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip")
  const ensureStudentProfile = useMutation(api.users.ensureStudentProfile)

  // Safety net for the Clerk webhook: if an authenticated non-admin has no
  // student row yet, create it. Idempotent server-side. This is what makes the
  // error.md failure (406 on profile, 500 on spotlight submit, caused by a
  // missing row) structurally unreachable rather than merely unlikely.
  useEffect(() => {
    if (!isAuthenticated || me === undefined || me === null) return
    if (me.isAdmin || me.student) return
    if (!clerkUser) return
    // Clerk's session token carries no email/name claim, so pass them through
    // from useUser(). The server prefers token claims when present.
    ensureStudentProfile({
      email: clerkUser.primaryEmailAddress?.emailAddress,
      fullName: clerkUser.fullName ?? undefined,
    }).catch((err) =>
      console.error("Failed to ensure student profile:", err),
    )
  }, [isAuthenticated, me, clerkUser, ensureStudentProfile])

  const value = useMemo<AuthContextType>(() => {
    const user: AuthUser | null = clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
          provider: clerkUser.externalAccounts?.[0]?.provider ?? null,
        }
      : null

    return {
      user,
      student: me?.student ? toLegacyStudent(me.student) : null,
      isAdmin: me?.isAdmin ?? false,
      // Still loading while Convex validates the token, or while the profile
      // query is in flight for an authenticated user (undefined = not yet
      // resolved; null = resolved to "no user").
      isLoading: convexAuthLoading || (isAuthenticated && me === undefined),
      signOut: async () => {
        await clerk.signOut()
      },
      // Kept for interface compatibility. Convex queries are reactive, so
      // there is nothing to manually refetch — profile edits propagate on
      // their own. Safe to delete once no caller references it.
      refreshStudent: async () => {},
    }
  }, [clerkUser, me, convexAuthLoading, isAuthenticated, clerk])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
