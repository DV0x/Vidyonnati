"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import StudentCard, { type Student } from "./StudentCard"
import HelpInterestDialog from "./HelpInterestDialog"

const FALLBACK_STUDENTS: Student[] = [
  {
    id: "fallback-1",
    name: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Computer Science",
    location: "Warangal, Telangana",
    dream: "Build healthcare tech solutions for rural India",
    background: "First in her family to attend college.",
    achievement: "Scored 94% in Intermediate",
    annualNeed: 85000,
    gender: "female",
  },
  {
    id: "fallback-2",
    name: "Arjun Reddy",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Medicine",
    location: "Vizag, Andhra Pradesh",
    dream: "Become a doctor and serve his village community",
    background: "Lost his father at 15. Raised by his mother.",
    achievement: "NEET Score: 580/720",
    annualNeed: 120000,
    gender: "male",
  },
  {
    id: "fallback-3",
    name: "Lakshmi Devi",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Mechanical Engineering",
    location: "Karimnagar, Telangana",
    dream: "Design sustainable energy solutions for India",
    background: "From a farming family hit by crop failures.",
    achievement: "College topper, 9.2 CGPA",
    annualNeed: 75000,
    gender: "female",
  },
]

function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}

export default function StudentSpotlightSection() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Phase 2a built featured.list for this component, but the conversion was
  // left undone because the section is currently commented out of the homepage
  // — so it was the last thing in the app still calling an /api route.
  //
  // The useEffect + fetch + setState it replaces is also the pattern the
  // react-hooks/set-state-in-effect rule flags, so this removes one more of the
  // warnings blocking that rule's return to "error".
  const featured = useQuery(api.featured.list, { limit: 3 })

  const loading = featured === undefined
  // The hard-coded FALLBACK_STUDENTS stand in whenever there is nothing real to
  // show, which is the current state: no application has been featured yet.
  const students =
    featured && featured.students.length > 0 ? featured.students : FALLBACK_STUDENTS
  const totalCount = featured?.total ?? null

  const handleExpressInterest = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const countText = totalCount && totalCount > 0
    ? `${totalCount}+ verified students seeking support`
    : "Verified students seeking support"

  return (
    <>
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-50 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/30 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Screened & Verified Students
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Dreams Waiting for <span className="text-primary">Your Support</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Each student is personally verified by our team. Connect with us to learn
              more about their journey and how you can make a difference.
            </p>
          </motion.div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <StudentCardSkeleton />
              <StudentCardSkeleton />
              <StudentCardSkeleton />
            </div>
          )}

          {/* Students Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {students.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index}
                  onExpressInterest={handleExpressInterest}
                />
              ))}
            </div>
          )}

          {/* View All CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/students">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 font-semibold group"
              >
                View All Students
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              {countText}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interest Modal */}
      <HelpInterestDialog
        student={selectedStudent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
