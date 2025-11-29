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
}

const stats: StatItem[] = [
  {
    icon: GraduationCap,
    value: 250,
    suffix: "+",
    label: "Students Supported",
  },
  {
    icon: IndianRupee,
    value: 50,
    suffix: "L+",
    prefix: "₹",
    label: "Scholarships Awarded",
  },
  {
    icon: TrendingUp,
    value: 95,
    suffix: "%",
    label: "Success Rate",
  },
  {
    icon: Building2,
    value: 15,
    suffix: "+",
    label: "Partner Institutions",
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

    const duration = 2000 // 2 seconds
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
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/80 relative overflow-hidden">
      {/* Background pattern - orange tinted dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 87 33 / 0.4) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative orange blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-orange-100/70 max-w-2xl mx-auto">
            Every number represents a life transformed through education.
            Join us in making these numbers grow.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-orange-500/5 backdrop-blur-sm border border-orange-200/10 rounded-2xl p-6 md:p-8 text-center hover:bg-orange-500/10 transition-all duration-300 hover:border-primary/40 group-hover:scale-105">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>

                {/* Value */}
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    isInView={isInView}
                  />
                </p>

                {/* Label */}
                <p className="text-sm md:text-base text-orange-100/60">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-orange-100/70 mb-4">
            Be part of this growing impact
          </p>
          <a
            href="/donate"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
          >
            Start Your Contribution
          </a>
        </motion.div>
      </div>
    </section>
  )
}
