import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { preloadQuery, preloadedQueryResult } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { convexToken } from "@/lib/convexToken"
import ApplicationReviewContent from "./ApplicationReviewContent"

export const metadata: Metadata = {
  title: "Review Application",
  robots: { index: false, follow: false },
}

export default async function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const preloaded = await preloadQuery(
    api.admin.application,
    { applicationId: id as Id<"applications"> },
    { token: await convexToken() },
  )

  if (preloadedQueryResult(preloaded) === null) notFound()

  return <ApplicationReviewContent preloaded={preloaded} />
}
