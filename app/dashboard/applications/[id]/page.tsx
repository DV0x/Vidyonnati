import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { preloadQuery, preloadedQueryResult } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { convexToken } from "@/lib/convexToken"
import ApplicationDetailContent from "./ApplicationDetailContent"

export const metadata: Metadata = {
  title: "Application",
  robots: { index: false, follow: false },
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The route param is an arbitrary string; Id<"applications"> is a claim about
  // it, not a guarantee. myApplication returns null for a malformed or unknown
  // id just as it does for one belonging to another student, so the cast cannot
  // widen what the caller can see — the ownership check runs server-side either
  // way, and null is the single answer to all three cases.
  const preloaded = await preloadQuery(
    api.applications.myApplication,
    { applicationId: id as Id<"applications"> },
    { token: await convexToken() },
  )

  // Read the resolved value here so a missing record becomes a real 404 rather
  // than a client component rendering an empty state under a 200.
  if (preloadedQueryResult(preloaded) === null) notFound()

  return <ApplicationDetailContent preloaded={preloaded} />
}
