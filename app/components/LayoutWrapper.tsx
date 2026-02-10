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

  return (
    <>
      {/* Keep nav always mounted so it stays subscribed to auth context.
          Hiding with CSS instead of unmounting avoids a stale-context issue
          where the auth section appears empty after client-side navigation
          from dashboard back to the landing page. */}
      <div className={hideChrome ? 'hidden' : ''}>
        <TopNavigation />
        <MainNavigation />
      </div>
      {hideChrome ? children : <main>{children}</main>}
      {!hideChrome && <Footer />}
    </>
  )
}
