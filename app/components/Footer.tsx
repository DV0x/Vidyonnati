"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, GraduationCap, Shield, Award, FileCheck, Heart } from "lucide-react"

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Students", href: "/students" },
  { label: "How We Work", href: "/about#how-we-work" },
  { label: "Contact", href: "/contact" },
]

const supportLinks = [
  { label: "Donate Now", href: "/donate" },
  { label: "Apply for Scholarship", href: "/apply" },
  { label: "Partner With Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
]

const trustBadges = [
  { icon: Shield, label: "80G Certified" },
  { icon: Award, label: "12A Registered" },
  { icon: FileCheck, label: "CSR-1 Compliant" },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Subtle orange gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/30" />

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Organization Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Vidyonnati</h2>
                <p className="text-xs text-gray-400">Foundation</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Promoting education and extending financial help to deserving students
              from Government High Schools in rural Andhra Pradesh since 2023.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-3 py-1.5"
                >
                  <badge.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-gray-300">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <nav className="flex flex-col space-y-2.5">
              {supportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:hello@vidyonnatifoundation.org"
                className="flex items-start gap-3 text-gray-400 hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm">hello@vidyonnatifoundation.org</span>
              </a>
              <a
                href="tel:+919440045144"
                className="flex items-start gap-3 text-gray-400 hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm">+91 9440-045-144</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm">
                  D.No 6-218, 4th Lane, Srinagar Colony,<br />
                  Kurnool Rd, Ongole, Prakasam,<br />
                  Andhra Pradesh, India — 523002
                </span>
              </div>
            </div>

            {/* Legal Info */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">CIN: U80903AP2023NPL123763</p>
              <p className="text-xs text-gray-500 mt-1">Registered under Companies Act, 2013</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Vidyonnati Foundation. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span>for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
