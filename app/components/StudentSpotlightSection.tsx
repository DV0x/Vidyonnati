"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GraduationCap, ArrowRight, MapPin, BookOpen, Award, BadgeCheck, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { helpInterestSchema, type HelpInterest, helpTypes } from "@/lib/schemas/application"

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

const helpTypeLabels: Record<string, string> = {
  donate: "I want to donate",
  volunteer: "I want to volunteer",
  corporate: "Corporate partnership",
  other: "Other",
}

function HelpInterestDialog({
  student,
  open,
  onOpenChange
}: {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<HelpInterest>({
    resolver: zodResolver(helpInterestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      helpType: undefined,
      message: "",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (data: HelpInterest) => {
    try {
      const response = await fetch('/api/help-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          help_type: data.helpType,
          message: data.message || null,
          student_id: student?.id,
          student_name: student?.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Help interest submission error:', error)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    }
  }

  const handleClose = () => {
    form.reset()
    setIsSubmitted(false)
    onOpenChange(false)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Custom Header with Gradient */}
        <div className="bg-gradient-to-r from-primary to-orange-500 p-5 text-white">
          <DialogHeader className="space-y-1">
            <DialogDescription className="text-orange-100 text-sm">
              Express interest to support
            </DialogDescription>
            <DialogTitle className="text-xl font-bold text-white">
              {student.name}
            </DialogTitle>
            <p className="text-orange-100 text-sm">{student.field} • {student.year}</p>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isSubmitted ? (
            <>
              <p className="text-gray-600 text-sm mb-5">
                Share your details and our team will connect with you to discuss how you can support {student.name.split(' ')[0]}'s education journey.
              </p>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
                <div>
                  <AnimatedInput
                    type="text"
                    label="Your Name"
                    value={form.watch("name")}
                    onChange={(e) => form.setValue("name", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <AnimatedInput
                    type="email"
                    label="Email Address"
                    value={form.watch("email")}
                    onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <AnimatedInput
                    type="tel"
                    label="Phone Number"
                    value={form.watch("phone")}
                    onChange={(e) => form.setValue("phone", e.target.value, { shouldValidate: true })}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Help Type Dropdown */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">How would you like to help?</Label>
                  <Select
                    onValueChange={(value) => form.setValue("helpType", value as any, { shouldValidate: true })}
                    value={form.watch("helpType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {helpTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.helpType && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.helpType.message}</p>
                  )}
                </div>

                {form.formState.errors.root && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 donate-button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
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
                onClick={handleClose}
                variant="outline"
                className="mt-6 rounded-full"
              >
                Close
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
      <HelpInterestDialog
        student={selectedStudent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
