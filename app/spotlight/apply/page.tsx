"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"
import { SpotlightWizard } from "./components/SpotlightWizard"

function SpotlightApplyPageContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit") || undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-orange-50/40 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-orange-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-orange-100/60 rounded-full blur-3xl" />
      </div>

      {/* Header + Form */}
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
              {editId ? "Edit & Resubmit Application" : "Apply for Spotlight"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {editId
                ? "Update your application and resubmit for review"
                : "Tell us your story and get featured on our homepage"}
            </p>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <SpotlightWizard editApplicationId={editId} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SpotlightApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SpotlightApplyPageContent />
    </Suspense>
  )
}
