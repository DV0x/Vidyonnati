"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "motion/react"
import { GraduationCap, IndianRupee, TrendingUp, Building2 } from "lucide-react"

interface StatItem {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  prefix?: string
  description: string
}

const stats: StatItem[] = [
  {
    icon: GraduationCap,
    value: 45,
    suffix: "+",
    label: "Students Benefited",
    description: "Meritorious scholars supported",
  },
  {
    icon: TrendingUp,
    value: 927,
    suffix: "+",
    label: "Screening Appearances",
    description: "Students tested across mandals",
  },
  {
    icon: Building2,
    value: 24,
    suffix: "",
    label: "High Schools",
    description: "Govt & aided schools in AP",
  },
  {
    icon: IndianRupee,
    value: 3,
    suffix: "",
    label: "Mandals Covered",
    description: "Bapatla District, Andhra Pradesh",
  },
]

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  isInView
}: {
  value: number
  prefix?: string
  suffix: string
  isInView: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
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
      {prefix}{count}{suffix}
    </span>
  )
}

export default function ImpactStatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      {/* Light flowing background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/40 to-orange-50/60" />

      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Numbers That <span className="text-primary">Speak</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Every number represents a life transformed through education
          </p>
        </motion.div>

        {/* Stats - Floating Card */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100/80 p-8 md:p-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-50/50 via-transparent to-primary/5" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Divider line (not on first item) */}
                {index > 0 && (
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-orange-200 to-transparent" />
                )}

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Value - Large and Bold */}
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 tracking-tight">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    isInView={isInView}
                  />
                </p>

                {/* Label */}
                <p className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-500">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA - Subtle */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            Join our community of donors making this possible
          </p>
          <a
            href="/donate"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            Contribute to Our Mission
          </a>
        </motion.div>
      </div>
    </section>
  )
}
