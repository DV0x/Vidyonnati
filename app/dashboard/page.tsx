import type { Metadata } from "next"
import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexToken } from "@/lib/convexToken"
import DashboardContent from "./DashboardContent"

// Server shell: runs the query during render and hands an opaque payload to the
// client component, which picks it up with usePreloadedQuery and KEEPS the live
// subscription. Server-rendered first paint plus realtime, rather than one or
// the other.
//
// preloadQuery rather than fetchQuery because this page wants reactivity.
// (The reverse holds for the public pages: preloadQuery sets cache: 'no-store'
// and would make them fully dynamic.)
//
// Exactly one preloadQuery here. Multiple preloads on a page are not guaranteed
// consistent with each other, which is why dashboard.summary returns both the
// scholarship and spotlight lists in a single read.

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const preloaded = await preloadQuery(
    api.dashboard.summary,
    {},
    { token: await convexToken() },
  )

  return <DashboardContent preloaded={preloaded} />
}
