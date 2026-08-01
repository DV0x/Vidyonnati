import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { preloadQuery, preloadedQueryResult } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { convexToken } from "@/lib/convexToken"
import SpotlightDetailContent from "./SpotlightDetailContent"

export const metadata: Metadata = {
  title: "Spotlight Application",
  robots: { index: false, follow: false },
}

export default async function SpotlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // See the note in the scholarship detail page: the cast is a claim about the
  // route param, not a guarantee, and mineById answers null for a malformed id,
  // an unknown one, and one owned by another student alike.
  const preloaded = await preloadQuery(
    api.spotlight.mineById,
    { spotlightApplicationId: id as Id<"spotlightApplications"> },
    { token: await convexToken() },
  )

  if (preloadedQueryResult(preloaded) === null) notFound()

  return <SpotlightDetailContent preloaded={preloaded} />
}
