"use client"

import { motion } from "motion/react"
import { ApplicationWizard } from "./components/ApplicationWizard"

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/40 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-orange-300/30 to-rose-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/20 via-purple-200/20 to-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-t from-amber-200/30 to-orange-200/20 rounded-full blur-3xl" />
      </div>

      {/* Compact Header + Form */}
      <div className="relative px-4 pt-6 pb-8 sm:pt-8 sm:pb-12">
        <div className="max-w-xl mx-auto">
          {/* Inline header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Apply for Scholarship
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete the form below to submit your application
            </p>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ApplicationWizard />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
