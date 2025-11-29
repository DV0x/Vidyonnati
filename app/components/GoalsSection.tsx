"use client"

import { GraduationCap, Star, Rocket, Lightbulb } from "lucide-react"
import { motion } from "motion/react"

export default function GoalsSection() {
  const goals = [
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      text: "Supporting meritorious students from government schools",
    },
    {
      icon: Star,
      title: "Talent Discovery",
      text: "Identifying and nurturing rural talent through rigorous screening",
    },
    {
      icon: Rocket,
      title: "Career Development",
      text: "Providing comprehensive career guidance and mentorship",
    },
    {
      icon: Lightbulb,
      title: "Leadership Building",
      text: "Building future entrepreneurs and industry leaders",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our Goals
            </motion.h2>
            <motion.div
              className="w-20 h-1 bg-primary mx-auto mb-6"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            ></motion.div>
            <motion.p
              className="text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              We're committed to creating lasting impact through these key initiatives
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {goals.map((goal, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 
                          transform hover:-translate-y-2 border border-gray-100 hover:border-primary"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <goal.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {goal.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">{goal.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

