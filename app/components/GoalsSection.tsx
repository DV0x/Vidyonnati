"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "motion/react"
import { GraduationCap, IndianRupee, Building2, Users, Target } from "lucide-react"

interface Goal {
  icon: React.ElementType
  title: string
  description: string
  current: number
  target: number
  unit: string
  prefix?: string
}

const goals: Goal[] = [
  {
    icon: GraduationCap,
    title: "Students Supported",
    description: "Meritorious scholars from Govt. High Schools",
    current: 45,
    target: 100,
    unit: "students",
  },
  {
    icon: Building2,
    title: "High Schools Reached",
    description: "Government & aided schools across AP",
    current: 24,
    target: 50,
    unit: "schools",
  },
  {
    icon: Users,
    title: "Mandals Covered",
    description: "Addanki, J. Panguluru & Inkollu — targeting all 56 mandals of erstwhile Prakasam District",
    current: 3,
    target: 56,
    unit: "mandals",
  },
  {
    icon: IndianRupee,
    title: "Screening Test Reach",
    description: "Students appearing for annual selection test",
    current: 927,
    target: 2000,
    unit: "students tested",
  },
]

function CircularProgress({
  current,
  target,
  isInView,
}: {
  current: number
  target: number
  isInView: boolean
}) {
  const percentage = Math.min((current / target) * 100, 100)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-24 h-24">
      {/* Background circle */}
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-100"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isInView ? strokeDashoffset : circumference }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
      </div>
    </div>
  )
}

function AnimatedNumber({
  value,
  prefix = "",
  isInView,
}: {
  value: number
  prefix?: string
  isInView: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, isInView])

  return (
    <span>
      {prefix}{count.toLocaleString("en-IN")}
    </span>
  )
}

function GoalCard({ goal, index }: { goal: Goal; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="flex flex-col items-center text-center">
          {/* Circular Progress */}
          <div className="mb-4">
            <CircularProgress current={goal.current} target={goal.target} isInView={isInView} />
          </div>

          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <goal.icon className="w-6 h-6 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{goal.title}</h3>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-4">{goal.description}</p>

          {/* Progress stats */}
          <div className="w-full bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-500">Current</p>
                <p className="text-xl font-bold text-primary">
                  <AnimatedNumber value={goal.current} prefix={goal.prefix} isInView={isInView} />
                </p>
              </div>
              <div className="text-gray-300">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-gray-500">Target</p>
                <p className="text-xl font-bold text-gray-900">
                  {goal.prefix}{goal.target.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{goal.unit}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function GoalsSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Clean subtle decoration */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-gray-50/80 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-50/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

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
            Our Mission
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Goals We're <span className="text-primary">Working Towards</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Transparent progress tracking on our journey to transform education
            access for underprivileged students across India.
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {goals.map((goal, index) => (
            <GoalCard key={goal.title} goal={goal} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            Help us reach these milestones faster
          </p>
          <a
            href="/donate"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
          >
            Contribute to Our Mission
          </a>
        </motion.div>
      </div>
    </section>
  )
}
