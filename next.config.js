/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ukjlfvupcajxnqyoinso.supabase.co",
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
