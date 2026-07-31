import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { preloadQuery, preloadedQueryResult } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { convexToken } from "@/lib/convexToken"
import SpotlightReviewContent from "./SpotlightReviewContent"

export const metadata: Metadata = {
  title: "Review Spotlight Application",
  robots: { index: false, follow: false },
}

export default async function SpotlightReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const preloaded = await preloadQuery(
    api.admin.spotlightApplication,
    { spotlightApplicationId: id as Id<"spotlightApplications"> },
    { token: await convexToken() },
  )

  if (preloadedQueryResult(preloaded) === null) notFound()

  return <SpotlightReviewContent preloaded={preloaded} />
}
