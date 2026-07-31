import type { Metadata } from "next"
import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexToken } from "@/lib/convexToken"
import ApplicationsContent from "./ApplicationsContent"

// Same single query as /dashboard: this screen lists scholarship and spotlight
// applications together, and one preloadQuery per page is the rule.

export const metadata: Metadata = {
  title: "My Applications",
  robots: { index: false, follow: false },
}

export default async function ApplicationsPage() {
  const preloaded = await preloadQuery(
    api.dashboard.summary,
    {},
    { token: await convexToken() },
  )

  return <ApplicationsContent preloaded={preloaded} />
}
