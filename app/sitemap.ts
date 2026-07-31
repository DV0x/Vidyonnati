import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// Public routes only. /dashboard/*, /admin/*, /login and /register are
// authenticated or transactional and are excluded here as well as disallowed in
// robots.ts. /students is omitted while it is a placeholder — its own metadata
// carries robots.index: false, and listing a noindex URL in a sitemap sends
// search engines contradictory signals.
const routes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/about", changeFrequency: "yearly", priority: 0.8 },
  { path: "/scholars", changeFrequency: "monthly", priority: 0.8 },
  { path: "/spotlight", changeFrequency: "monthly", priority: 0.7 },
  { path: "/donate", changeFrequency: "yearly", priority: 0.9 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.6 },
  { path: "/media", changeFrequency: "monthly", priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  // Build time rather than request time: these are static pages, and a
  // lastModified that moves on every crawl teaches crawlers to ignore it.
  const lastModified = new Date()

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
