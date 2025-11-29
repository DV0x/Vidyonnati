"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { GraduationCap, ArrowRight, MapPin, BookOpen, Award, BadgeCheck, X, Send, Phone, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Student {
  id: string
  name: string
  image: string
  field: string
  year: string
  location: string
  dream: string
  background: string
  achievement: string
  annualNeed: number
  gender: "male" | "female"
}

const students: Student[] = [
  {
    id: "1",
    name: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Computer Science",
    year: "2nd Year B.Tech",
    location: "Warangal, Telangana",
    dream: "Build healthcare tech solutions for rural India",
    background: "First in her family to attend college.",
    achievement: "Scored 94% in Intermediate",
    annualNeed: 85000,
    gender: "female",
  },
  {
    id: "2",
    name: "Arjun Reddy",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Medicine",
    year: "1st Year MBBS",
    location: "Vizag, Andhra Pradesh",
    dream: "Become a doctor and serve his village community",
    background: "Lost his father at 15. Raised by his mother.",
    achievement: "NEET Score: 580/720",
    annualNeed: 120000,
    gender: "male",
  },
  {
    id: "3",
    name: "Lakshmi Devi",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    field: "Mechanical Engineering",
    year: "3rd Year B.Tech",
    location: "Karimnagar, Telangana",
    dream: "Design sustainable energy solutions for India",
    background: "From a farming family hit by crop failures.",
    achievement: "College topper, 9.2 CGPA",
    annualNeed: 75000,
    gender: "female",
  },
]

function InterestModal({
  student,
  isOpen,
  onClose
}: {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}) {
  const [formState, setFormState] = useState({ name: "", email: "", phone: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission - replace with actual form handling
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  const resetAndClose = () => {
    setFormState({ name: "", email: "", phone: "" })
    setIsSubmitted(false)
    onClose()
  }

  if (!student) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-500 p-5 text-white relative">
              <button
                onClick={resetAndClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-orange-100 text-sm mb-1">Express interest to support</p>
              <h3 className="text-xl font-bold">{student.name}</h3>
              <p className="text-orange-100 text-sm">{student.field} • {student.year}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              {!isSubmitted ? (
                <>
                  <p className="text-gray-600 text-sm mb-5">
                    Share your details and our team will connect with you to discuss how you can support {student.name.split(' ')[0]}'s education journey.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-semibold mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Interest
                        </span>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <motion.div
                  className="text-center py-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-gray-600 text-sm">
                    We've received your interest in supporting {student.name.split(' ')[0]}.
                    Our team will reach out within 24-48 hours.
                  </p>
                  <Button
                    onClick={resetAndClose}
                    variant="outline"
                    className="mt-6 rounded-full"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StudentCard({
  student,
  index,
  onExpressInterest
}: {
  student: Student
  index: number
  onExpressInterest: (student: Student) => void
}) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={student.image}
            alt={student.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Verified badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          </div>

          {/* Name & details overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {student.field}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {student.location}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Year badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              <BookOpen className="w-3 h-3" />
              {student.year}
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
              <Award className="w-3 h-3" />
              {student.achievement}
            </span>
          </div>

          {/* Dream */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {student.gender === "male" ? "His Dream" : "Her Dream"}
            </p>
            <p className="text-gray-800 font-medium text-sm leading-relaxed">
              "{student.dream}"
            </p>
          </div>

          {/* Background */}
          <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
            {student.background}
          </p>

          {/* Funding need */}
          <div className="bg-orange-50/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Annual Support Needed</span>
              <span className="text-lg font-bold text-primary">₹{student.annualNeed.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => onExpressInterest(student)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-semibold group/btn"
          >
            I Want to Help
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function StudentSpotlightSection() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExpressInterest = (student: Student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

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

          {/* Students Grid */}
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
              25+ verified students seeking support
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interest Modal */}
      <InterestModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
