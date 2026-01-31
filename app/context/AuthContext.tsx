"use client"

import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Student } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  student: Student | null
  isAdmin: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  refreshStudent: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])
  const initializedRef = useRef(false)

  // Check if user is admin
  const checkIsAdmin = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) {
        console.error('Admin check failed:', error.message)
        return false
      }
      return !!data
    } catch {
      return false
    }
  }

  // Fetch student profile (only for non-admin users)
  const fetchStudent = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setStudent(data)
      }
    } catch (err) {
      console.error('Failed to fetch student profile:', err)
    }
  }

  // Fetch user data based on role
  const fetchUserData = async (userId: string) => {
    const adminStatus = await checkIsAdmin()
    setIsAdmin(adminStatus)

    if (!adminStatus) {
      await fetchStudent(userId)
    }
  }

  const refreshStudent = async () => {
    if (user && !isAdmin) {
      await fetchStudent(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    setUser(null)
    setSession(null)
    setStudent(null)
    setIsAdmin(false)
  }

  useEffect(() => {
    // onAuthStateChange is the single source of truth.
    // INITIAL_SESSION fires synchronously on subscribe with the current
    // session from cookies (which the proxy already refreshed server-side).
    // No separate getUser()/getSession() call needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          // First event on subscribe — session comes from cookies.
          // The proxy already validated/refreshed the token server-side,
          // so this session is trustworthy.
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchUserData(session.user.id)
          }

          setIsLoading(false)
          initializedRef.current = true
        } else if (event === 'SIGNED_IN') {
          setSession(session)
          setUser(session?.user ?? null)

          if (!initializedRef.current) {
            // First sign-in during app startup (some Supabase versions
            // fire SIGNED_IN after INITIAL_SESSION for existing sessions).
            initializedRef.current = true
            setIsLoading(true)
            if (session?.user) {
              await fetchUserData(session.user.id)
            }
            setIsLoading(false)
          } else {
            // Post-init SIGNED_IN: session recovery after idle / tab
            // reactivation. Silently refresh user data in the background
            // without showing a loading spinner.
            if (session?.user) {
              await fetchUserData(session.user.id)
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Silent token refresh — update session/user, no data re-fetch
          setSession(session)
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          // Explicit sign-out or token refresh failure
          setUser(null)
          setSession(null)
          setStudent(null)
          setIsAdmin(false)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        student,
        isAdmin,
        isLoading,
        signOut,
        refreshStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
