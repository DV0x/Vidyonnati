import "./globals.css"
import "./styles/grid-pattern.css"
import { Overpass } from "next/font/google"
import LayoutWrapper from "./components/LayoutWrapper"
import { DonorProvider } from "./context/DonorContext"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"
import type { Metadata } from "next"

const overpass = Overpass({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vidyonnatifoundation.org"

export const metadata: Metadata = {
  title: {
    default: "Vidyonnati Foundation | Scholarships for Meritorious Students in AP",
    template: "%s | Vidyonnati Foundation",
  },
  description:
    "Vidyonnati Foundation awards merit scholarships to students from Government High Schools in Prakasam & Bapatla Districts, AP. 69 students supported, Rs. 13.1 Lakhs disbursed since 2023.",
  keywords: [
    "Vidyonnati Foundation",
    "scholarships",
    "Andhra Pradesh",
    "Prakasam District",
    "Bapatla District",
    "merit scholarship",
    "Government High School",
    "education",
    "rural students",
    "Addanki",
    "Inkollu",
    "J Panguluru",
    "80G donation",
    "CSR",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Vidyonnati Foundation — Merit Scholarships for Rural Students in AP",
    description:
      "Supporting 69 meritorious students from Government High Schools across 3 mandals in Andhra Pradesh. Rs. 13.1 Lakhs disbursed since 2023. 80G certified.",
    url: siteUrl,
    siteName: "Vidyonnati Foundation",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Vidyonnati Foundation — Scholarships for Meritorious Students",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidyonnati Foundation — Merit Scholarships for Rural Students",
    description:
      "Supporting 69 meritorious students from Government High Schools in rural AP. Rs. 13.1 Lakhs disbursed. 80G certified donations.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Vidyonnati Foundation — Scholarships for Meritorious Students",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={overpass.className}>
        <AuthProvider>
          <DonorProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </DonorProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

