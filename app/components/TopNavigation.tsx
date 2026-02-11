"use client"

import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export default function TopNavigation() {
  return (
    <div className="bg-gray-900 text-gray-300 py-2 text-sm">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4">
        {/* Contact Info */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <a
            href="mailto:hello@vidyonnatifoundation.org"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">hello@vidyonnatifoundation.org</span>
            <span className="sm:hidden">Email Us</span>
          </a>
          <a
            href="tel:+919440045144"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+91 9440-045-144</span>
          </a>
        </div>

      </div>
    </div>
  )
}
