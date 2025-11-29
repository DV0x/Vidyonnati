"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  Rocket,
  Users,
  Heart,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react"

type PathType = "students" | "donors"

interface Step {
  icon: React.ElementType
  title: string
  description: string
  highlight?: string
}

const studentSteps: Step[] = [
  {
    icon: ClipboardCheck,
    title: "Apply Online",
    description: "Fill out a simple application form with your academic details and financial background.",
    highlight: "5 mins",
  },
  {
    icon: Users,
    title: "Screening & Selection",
    description: "Our team reviews applications and conducts interviews to identify deserving candidates.",
    highlight: "2 weeks",
  },
  {
    icon: Award,
    title: "Receive Scholarship",
    description: "Selected students receive financial support directly for tuition, books, and living expenses.",
    highlight: "Direct transfer",
  },
  {
    icon: Rocket,
    title: "Achieve Success",
    description: "Focus on your studies with our continuous mentorship and guidance throughout your journey.",
    highlight: "Ongoing support",
  },
]

const donorSteps: Step[] = [
  {
    icon: Users,
    title: "Browse Students",
    description: "Explore profiles of verified, screened students from underprivileged backgrounds.",
    highlight: "25+ students",
  },
  {
    icon: Heart,
    title: "Express Interest",
    description: "Choose a student to support and connect with our team to discuss the contribution.",
    highlight: "Any amount",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Receive regular updates on your sponsored student's academic progress and achievements.",
    highlight: "Quarterly updates",
  },
  {
    icon: FileText,
    title: "Get Impact Report",
    description: "Receive detailed reports showing exactly how your contribution transformed a life.",
    highlight: "80G receipts",
  },
]

function StepCard({ step, index, isActive }: { step: Step; index: number; isActive: boolean }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Connector line */}
      {index < 3 && (
        <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
      )}

      <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
        {/* Step number */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {index + 1}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <step.icon className="w-8 h-8 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>

        {/* Highlight badge */}
        {step.highlight && (
          <span className="inline-block bg-orange-50 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {step.highlight}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function HowWeWorkSection() {
  const [activePath, setActivePath] = useState<PathType>("students")

  const steps = activePath === "students" ? studentSteps : donorSteps

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

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
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            A simple, transparent process for both students seeking support
            and donors wanting to make a difference.
          </p>
        </motion.div>

        {/* Path Toggle */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex bg-gray-100 rounded-full p-1.5">
            <button
              onClick={() => setActivePath("students")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activePath === "students"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              For Students
            </button>
            <button
              onClick={() => setActivePath("donors")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activePath === "donors"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Heart className="w-4 h-4" />
              For Donors
            </button>
          </div>
        </motion.div>

        {/* Steps Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePath}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial={{ opacity: 0, x: activePath === "students" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activePath === "students" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} isActive={true} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <a
            href={activePath === "students" ? "/apply" : "/students"}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
          >
            {activePath === "students" ? "Apply for Scholarship" : "Browse Students"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
