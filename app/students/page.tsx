"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { GraduationCap, ArrowRight, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentCard, { type Student } from "@/app/components/StudentCard"
import HelpInterestDialog from "@/app/components/HelpInterestDialog"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch('/api/featured-students')
        if (response.ok) {
          const data = await response.json()
          setStudents(data.students || [])
        }
      } catch (error) {
        console.error('Error fetching featured students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const handleExpressInterest = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/30 to-white relative overflow-hidden min-h-screen">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Screened & Verified Students
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-primary">Students</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Each student is personally verified by our team. Connect with us to learn
              more about their journey and how you can make a difference.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-gray-500">Loading students...</p>
            </div>
          )}

          {/* Students Grid */}
          {!loading && students.length > 0 && (
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

          {/* Empty State */}
          {!loading && students.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Featured Students Yet</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                We&apos;re currently reviewing student applications. Check back soon or apply to be featured in our spotlight program.
              </p>
              <Link href="/spotlight/apply">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-semibold group">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Apply for Spotlight
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          )}
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
