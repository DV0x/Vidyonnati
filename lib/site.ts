// The canonical public origin of the site.
//
// Deliberately a constant rather than process.env.NEXT_PUBLIC_APP_URL. That
// variable is http://localhost:3000 in .env.local, and everything that consumes
// an origin here — sitemap <loc> entries, the robots.txt Sitemap: line,
// metadataBase for Open Graph image URLs — is absolute and is only ever read
// against production. Deriving them from the env var means a local build, or a
// Vercel environment where the variable is set for a different purpose, silently
// publishes localhost URLs to crawlers and social scrapers. There is nothing to
// configure: this site has exactly one canonical origin.
//
// Preview deployments intentionally report the production origin too. Preview
// sitemaps should not be indexed under their own hostname.
export const SITE_URL = "https://vidyonnatifoundation.org"
