"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
  Star,
  IndianRupee,
  HandHeart,
  History,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Scholarship Applications', href: '/admin/scholarship-applications', icon: FileText },
  { name: 'Spotlight Applications', href: '/admin/spotlight-applications', icon: Sparkles },
  { name: 'Spotlight Management', href: '/admin/spotlight', icon: Star },
  { name: 'Donations', href: '/admin/donations', icon: IndianRupee },
  { name: 'Help Interests', href: '/admin/help-interests', icon: HandHeart },
  { name: 'Activity Log', href: '/admin/activity-log', icon: History },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use isAdmin from AuthContext - single source of truth
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ name: string | null; role: string | null } | null>(null)

  // Fetch additional admin info (name, role) once we know user is admin
  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const res = await fetch('/api/admin/info')
        if (res.ok) {
          const admin = await res.json()
          setAdminInfo(admin)
        }
      } catch {
        // Silently fail - fallback to email display
      }
    }

    if (!authLoading && isAdmin) {
      fetchAdminInfo()
    }
  }, [isAdmin, authLoading])

  // Handle redirects
  useEffect(() => {
    if (authLoading) return // Wait for auth to load

    if (!user) {
      router.push('/login?redirect=/admin')
    } else if (!isAdmin) {
      router.push('/')
    }
  }, [user, authLoading, isAdmin, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Only show skeleton on initial load, not during auth state changes
  // This prevents the page from going blank when auth refreshes
  if (!user && authLoading) {
    return <AdminSkeleton />
  }

  // Redirect if definitely not authorized (after loading completes)
  if (!authLoading && (!user || !isAdmin)) {
    return <AdminSkeleton />
  }

  const displayName = adminInfo?.name || user?.email?.split('@')[0] || 'Admin'
  const displayRole = adminInfo?.role === 'super_admin' ? 'Super Admin' : 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Admin Panel</span>
          </Link>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-4 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Back to Main Site */}
          <div className="mt-6 px-3">
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Link href="/">
                Back to Main Site
              </Link>
            </Button>
          </div>

          {/* User section */}
          <div className="mt-auto border-t border-slate-700 pt-4">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-400 truncate">{displayRole}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col bg-slate-900">
          <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
            <Skeleton className="h-8 w-8 rounded-lg bg-slate-700" />
            <Skeleton className="h-5 w-24 bg-slate-700" />
          </div>
          <nav className="flex flex-1 flex-col px-4 py-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-slate-700" />
              ))}
            </div>
          </nav>
        </div>
      </div>
      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
