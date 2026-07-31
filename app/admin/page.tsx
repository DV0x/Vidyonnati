import type { Metadata } from "next"
import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexToken } from "@/lib/convexToken"
import AdminOverviewContent from "./AdminOverviewContent"

// One preloadQuery. This page used to make two fetches — stats and recent
// activity — which the rendering plan calls out specifically: multiple preloads
// on a page are not consistency-guaranteed with each other, so admin.overview
// returns both from a single read.

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const preloaded = await preloadQuery(
    api.admin.overview,
    {},
    { token: await convexToken() },
  )

  return <AdminOverviewContent preloaded={preloaded} />
}
