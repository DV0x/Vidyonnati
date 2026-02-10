"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function EmpoweringSection() {
  return (
    <section className="py-16 bg-parallax bg-cover bg-fixed bg-center relative">
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Empowering <span className="text-primary">Rural Andhra Pradesh's</span> Future Leaders
              </motion.h2>
              <motion.div
                className="w-20 h-1 bg-primary mx-auto"
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              ></motion.div>
            </div>
            <motion.p
              className="text-gray-200 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Across rural Andhra Pradesh, talented students in Government High Schools dream of higher education
              but face financial barriers. Through our Mandal-level screening tests, we identify and support these bright minds.
            </motion.p>
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <Button className="cta-button text-lg px-8 py-3 bg-primary hover:bg-primary/90 transition-colors duration-300">
                Donate Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

