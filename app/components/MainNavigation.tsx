"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Heart, GraduationCap, User, LogOut, LayoutDashboard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/app/context/AuthContext"

export default function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, student, isLoading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  // Handle scroll detection for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
  }, [pathname])

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
    <nav
      className={`nav-sticky bg-white py-3 ${
        isScrolled ? "nav-scrolled" : "shadow-sm"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-primary">Vidyonnati</span>
            <span className="text-gray-700 hidden sm:inline"> Foundation</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsMenuOpen(!isMenuOpen)
          }}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className={`nav-link font-medium ${isActive("/") ? "text-primary" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`nav-link font-medium ${isActive("/about") ? "text-primary" : ""}`}
          >
            About Us
          </Link>
          <Link
            href="/students"
            className={`nav-link font-medium ${isActive("/students") ? "text-primary" : ""}`}
          >
            Our Scholars
          </Link>

          {/* CTAs and Auth */}
          <div className="flex items-center gap-3 ml-4">
            <Link href="/apply">
              <Button
                variant="outline"
                className="cta-secondary flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Apply Now
              </Button>
            </Link>
            <Link href="/donate">
              <Button className="cta-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Donate
              </Button>
            </Link>

            {/* Auth Section */}
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 ml-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="hidden xl:inline text-sm font-medium">
                          {student?.full_name || user.email?.split("@")[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" className="flex items-center gap-2 ml-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-40 mobile-menu-enter">
            <div className="flex flex-col h-full">
              <div className="flex flex-col p-6 space-y-2">
                <Link
                  href="/"
                  className={`nav-link text-lg py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors ${
                    isActive("/") ? "text-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`nav-link text-lg py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors ${
                    isActive("/about") ? "text-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/students"
                  className={`nav-link text-lg py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors ${
                    isActive("/students") ? "text-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Our Scholars
                </Link>

                {/* Mobile CTAs */}
                <div className="pt-6 space-y-3 border-t mt-4">
                  <Link href="/apply" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full cta-secondary flex items-center justify-center gap-2 py-6 text-base"
                    >
                      <GraduationCap className="w-5 h-5" />
                      Apply for Scholarship
                    </Button>
                  </Link>
                  <Link href="/donate" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full cta-primary flex items-center justify-center gap-2 py-6 text-base">
                      <Heart className="w-5 h-5" />
                      Donate Now
                    </Button>
                  </Link>
                </div>

                {/* Mobile Auth Section */}
                {!isLoading && (
                  <div className="pt-6 space-y-3 border-t mt-4">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {student?.full_name || "Student"}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Link href="/dashboard" className="block" onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 py-5"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleSignOut()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center justify-center gap-2 py-5 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 py-5"
                          >
                            <LogIn className="w-5 h-5" />
                            Login
                          </Button>
                        </Link>
                        <Link href="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full flex items-center justify-center gap-2 py-5 bg-primary">
                            <User className="w-5 h-5" />
                            Create Account
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile footer info */}
              <div className="mt-auto p-6 bg-gray-50 border-t">
                <p className="text-sm text-gray-600 text-center">
                  Empowering students through education since 2023
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
