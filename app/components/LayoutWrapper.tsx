"use client"

import { usePathname } from "next/navigation"
import TopNavigation from "./TopNavigation"
import MainNavigation from "./MainNavigation"
import Footer from "./Footer"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Hide main site navigation on dashboard and admin routes
  const isDashboard = pathname?.startsWith('/dashboard')
  const isAdmin = pathname?.startsWith('/admin')

  if (isDashboard || isAdmin) {
    // Dashboard and Admin have their own layouts, just render children
    return <>{children}</>
  }

  return (
    <>
      {/* Top bar - scrolls away */}
      <TopNavigation />
      {/* Main nav - sticky */}
      <MainNavigation />
      <main>{children}</main>
      <Footer />
    </>
  )
}
