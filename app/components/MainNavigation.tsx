"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMenuOpen && !target.closest("nav")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-white shadow-lg py-2 relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">
            <span className="text-[#FF5721]">Vidyonnati</span> Foundation
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          onClick={(e) => {
            e.stopPropagation()
            setIsMenuOpen(!isMenuOpen)
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-12">
          <Link href="/" className={`nav-link ${isActive("/") ? "text-primary" : ""}`}>
            Home
          </Link>
          <Link href="/about" className={`nav-link ${isActive("/about") ? "text-primary" : ""}`}>
            About Us
          </Link>
          <Link href="/donate" passHref>
            <Button className={`cta-button ${isActive("/donate") ? "bg-primary/80" : ""}`}>Donate to Educate</Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-40">
            <div className="flex flex-col h-full">
              <div className="flex flex-col space-y-4 p-4">
                <Link
                  href="/"
                  className={`nav-link text-lg ${isActive("/") ? "text-primary" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`nav-link text-lg ${isActive("/about") ? "text-primary" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link href="/donate" passHref>
                  <Button
                    className={`cta-button w-full justify-center text-lg ${isActive("/donate") ? "bg-primary/80" : ""}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Donate to Educate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

