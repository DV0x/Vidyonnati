import "./globals.css"
import "./styles/grid-pattern.css"
import { Overpass } from "next/font/google"
import TopNavigation from "./components/TopNavigation"
import MainNavigation from "./components/MainNavigation"
import Footer from "./components/Footer"
import { DonorProvider } from "./context/DonorContext"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"

const overpass = Overpass({ subsets: ["latin"] })

export const metadata = {
  title: "Vidyonnati Foundation | Scholarships for Underprivileged Students",
  description: "Empowering meritorious students from economically disadvantaged backgrounds to pursue higher education through scholarships and mentorship.",
  generator: 'v0.app'
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
            {/* Top bar - scrolls away */}
            <TopNavigation />
            {/* Main nav - sticky */}
            <MainNavigation />
            <main>{children}</main>
            <Footer />
          </DonorProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

