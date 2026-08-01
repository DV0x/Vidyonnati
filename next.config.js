// Convex serves public spotlight photos from the deployment's own host, and the
// host differs per deployment — so it is derived from the URL the app is already
// configured with rather than hardcoded. Without this entry next/image throws
// "hostname is not configured under images" at render time, which is what
// /admin/spotlight and StudentCard would have done the moment a featured
// applicant had a photo. Derived rather than wildcarded (`**.convex.cloud`) so
// the image optimizer cannot be pointed at somebody else's deployment.
const convexImageHost = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL).hostname
  : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Private documents are NOT here and must not be: they are fetched with an
      // Authorization header and rendered from blob: URLs, which next/image
      // cannot proxy and which need no allowlist entry. See convex/http.ts.
      ...(convexImageHost
        ? [{ protocol: "https", hostname: convexImageHost }]
        : []),
      // StudentCard's placeholder portraits for students with no photo.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Next 16 requires every quality used in the app to be declared here.
    // HeroSlider uses quality={90}; 75 is the framework default.
    qualities: [75, 90],
    formats: ["image/webp"],
  },
}

module.exports = nextConfig
