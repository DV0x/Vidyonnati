"use client"

import { createContext, useContext, useEffect, useState } from 'react'
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

  const supabase = createClient()

  // Check if user is admin
  const checkIsAdmin = async (): Promise<boolean> => {
    const { data } = await supabase.rpc('is_admin')
    return !!data
  }

  // Fetch student profile (only for non-admin users)
  const fetchStudent = async (userId: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setStudent(data)
    }
  }

  // Fetch user data based on role
  const fetchUserData = async (userId: string) => {
    const adminStatus = await checkIsAdmin()
    setIsAdmin(adminStatus)

    // Only fetch student profile if user is not an admin
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
    // Use global scope to sign out from all sessions and clear OAuth provider sessions
    await supabase.auth.signOut({ scope: 'global' })
    setUser(null)
    setSession(null)
    setStudent(null)
    setIsAdmin(false)
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserData(session.user.id)
      }

      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only set loading for actual sign-in events, not token refresh
        // Token refresh happens silently in the background and shouldn't disrupt UI
        if (event === 'SIGNED_IN') {
          setIsLoading(true)
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Only fetch user data on sign-in, not on token refresh
          // Token refresh doesn't change user data
          if (event === 'SIGNED_IN') {
            await fetchUserData(session.user.id)
          }
        } else {
          setStudent(null)
          setIsAdmin(false)
        }

        if (event === 'SIGNED_IN') {
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
