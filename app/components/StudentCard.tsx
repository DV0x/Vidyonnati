"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { GraduationCap, ArrowRight, MapPin, BookOpen, Award, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Student {
  id: string
  name: string
  image: string | null
  field: string
  location: string
  dream: string
  background: string
  achievement: string | null
  annualNeed: number
  gender: string
  source?: 'scholarship' | 'spotlight'
}

export default function StudentCard({
  student,
  index,
  onExpressInterest
}: {
  student: Student
  index: number
  onExpressInterest: (student: Student) => void
}) {
  const fallbackImage = student.gender === "female"
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"

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
            src={student.image || fallbackImage}
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
              {student.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {student.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-orange-50 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              <BookOpen className="w-3 h-3" />
              {student.field}
            </span>
            {student.achievement && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                <Award className="w-3 h-3" />
                {student.achievement}
              </span>
            )}
          </div>

          {/* Dream */}
          {student.dream && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {student.gender === "male" ? "His Dream" : "Her Dream"}
              </p>
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                &ldquo;{student.dream}&rdquo;
              </p>
            </div>
          )}

          {/* Background */}
          {student.background && (
            <p className="text-gray-500 text-sm mb-4 min-h-[40px] line-clamp-2">
              {student.background}
            </p>
          )}

          {/* Funding need */}
          {student.annualNeed > 0 && (
            <div className="bg-orange-50/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Annual Support Needed</span>
                <span className="text-lg font-bold text-primary">&#x20B9;{student.annualNeed.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

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
