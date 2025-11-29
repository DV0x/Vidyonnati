import "./globals.css"
import "./styles/grid-pattern.css"
import { Overpass } from "next/font/google"
import TopNavigation from "./components/TopNavigation"
import MainNavigation from "./components/MainNavigation"
import Footer from "./components/Footer"
import { DonorProvider } from "./context/DonorContext"
import type React from "react"

const overpass = Overpass({ subsets: ["latin"] })

export const metadata = {
  title: "Educational Trust for Underprivileged Children",
  description: "Helping underprivileged children pursue higher education",
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
        <DonorProvider>
          <header>
            <TopNavigation />
            <MainNavigation />
          </header>
          {children}
          <Footer />
        </DonorProvider>
      </body>
    </html>
  )
}

