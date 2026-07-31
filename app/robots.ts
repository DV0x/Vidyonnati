import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated and transactional surfaces. These are already protected
      // server-side — authorization lives in the Convex function bodies — so
      // this is about keeping them out of search results, not about access
      // control. robots.txt is a request, never a security boundary.
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/apply",
        "/spotlight/apply",
        "/login",
        "/register",
        "/sso-callback",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
