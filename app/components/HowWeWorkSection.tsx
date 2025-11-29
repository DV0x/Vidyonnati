"use client"

import { Search, Lightbulb, Users, Compass } from "lucide-react"
import { motion } from "motion/react"

export default function HowWeWorkSection() {
  const steps = [
    {
      icon: Search,
      title: "Talent Discovery",
      description:
        "We conduct thorough screening tests in government schools to identify exceptional students with high potential.",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Lightbulb,
      title: "Holistic Support",
      description:
        "Beyond financial aid, we provide career guidance, skill development, and entrepreneurship training.",
      color: "from-green-400 to-green-600",
    },
    {
      icon: Users,
      title: "Corporate Connections",
      description:
        "We connect promising students with industry leaders and entrepreneurs who can mentor and support their journey.",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Compass,
      title: "Continuous Guidance",
      description:
        "Our support extends throughout their academic journey, ensuring they stay on track to achieve their dreams.",
      color: "from-red-400 to-red-600",
    },
  ]

  return (
    <section className="py-20 bg-[#FEE350] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Our Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">How We Work</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </motion.div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2 hidden lg:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div
                    className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 h-full flex flex-col justify-between shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                  >
                    <div>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <step.icon className="w-8 h-8 text-gray-800" />
                      </div>
                      <h3 className="text-xl font-semibold text-white text-center mb-4">{step.title}</h3>
                      <p className="text-white text-center text-sm">{step.description}</p>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <span className="text-white font-bold text-3xl">{index + 1}</span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 bg-primary rounded-full transform -translate-y-1/2 z-10">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

