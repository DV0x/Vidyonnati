"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LayoutDashboard,
  FileText,
  User,
  PlusCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Applications', href: '/dashboard/applications', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, student, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard')
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return null
  }

  const displayName = student?.full_name || user.email?.split('@')[0] || 'Student'

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
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Vidyonnati</span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-4 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Apply Now Button */}
          <div className="mt-6 px-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
            >
              <Link href="/apply">
                <PlusCircle className="h-4 w-4" />
                Apply Now
              </Link>
            </Button>
          </div>

          {/* User section */}
          <div className="mt-auto border-t border-gray-200 pt-4">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Vidyonnati</span>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <nav className="flex flex-1 flex-col px-4 py-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </nav>
        </div>
      </div>
      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
