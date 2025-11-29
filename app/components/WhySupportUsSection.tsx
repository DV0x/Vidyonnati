"use client"

import { DollarSign, FileText, Users, ArrowRight, BookOpen, GraduationCap, Lightbulb, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

interface FloatingShapeProps {
  shape: React.ReactNode
  className: string
  animationProps: object
  delay?: number
}

const FloatingShape = ({ shape, className, animationProps, delay = 0 }: FloatingShapeProps) => (
  <motion.div
    className={`absolute backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, ...animationProps }}
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "easeInOut",
      delay,
    }}
  >
    {shape}
  </motion.div>
)

export default function WhySupportUsSection() {
  const benefits = [
    { icon: DollarSign, text: "100% of donations directly support student education" },
    { icon: FileText, text: "Tax exemption under Section 80G" },
    { icon: FileText, text: "Audited financial statements" },
    { icon: Users, text: "Transparent selection process" },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        <FloatingShape
          shape={<BookOpen className="w-24 h-24 text-primary/20" />}
          className="top-1/4 left-1/20"
          animationProps={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          delay={0}
        />
        <FloatingShape
          shape={<GraduationCap className="w-32 h-32 text-primary/20" />}
          className="top-1/6 right-1/8"
          animationProps={{ x: [0, 30, 0], y: [0, -20, 0] }}
          delay={1}
        />
        <FloatingShape
          shape={<Lightbulb className="w-28 h-28 text-secondary/20" />}
          className="bottom-1/4 left-1/10"
          animationProps={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          delay={0.5}
        />
        <FloatingShape
          shape={<PenTool className="w-24 h-24 text-secondary/20" />}
          className="top-3/4 right-1/10"
          animationProps={{ x: [0, -25, 0], rotate: [0, 15, 0] }}
          delay={1.5}
        />
      </div>

      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary text-white p-8 rounded-2xl shadow-xl relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Support Us</h2>
                <p className="text-lg mb-8">
                  Your contribution enables meritorious students from rural India to pursue quality education and build
                  successful careers. We welcome support from individuals, organizations, and corporate partners who
                  share our vision of empowering rural talent.
                </p>
                <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 rounded-full transition-colors duration-300 group">
                  Donate Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="lg:w-1/2 space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Transforming Lives Through Education</h3>
                <p className="text-gray-600">
                  Our unwavering commitment to transparency and impact drives every action we take.
                </p>
              </div>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-800 font-medium group-hover:text-primary transition-colors duration-300">
                    {benefit.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

