"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { GraduationCap, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentsPage() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/30 to-white relative overflow-hidden min-h-screen">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Coming Soon State */}
        <motion.div
          className="text-center py-16 md:py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative inline-block mb-8">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-3xl flex items-center justify-center"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users className="w-12 h-12 text-primary" />
            </motion.div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Student Spotlights Are On the Way
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto mb-4 leading-relaxed">
            We&apos;re working with our scholars to share their inspiring stories,
            academic journeys, and the dreams that drive them forward.
          </p>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Each profile is personally verified by our team to ensure authenticity and trust.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/donate">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 font-semibold group">
                Support a Scholar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/spotlight">
              <Button variant="outline" className="rounded-full px-8 py-3 font-semibold border-2">
                <GraduationCap className="w-4 h-4 mr-2" />
                About Spotlight Program
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
