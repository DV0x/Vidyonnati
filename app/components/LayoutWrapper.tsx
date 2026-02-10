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
  const hideChrome = isDashboard || isAdmin

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <TopNavigation />
      <MainNavigation />
      <main>{children}</main>
      <Footer />
    </>
  )
}
