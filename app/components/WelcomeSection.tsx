"use client"

import Image from "next/image"
import { motion } from "motion/react"

export default function WelcomeSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <motion.h2
                className="text-4xl md:text-5xl font-bold"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Welcome To <span className="text-primary">Vidyonnati</span> Foundation
              </motion.h2>
              <motion.div
                className="w-20 h-1 bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              ></motion.div>
            </div>
            <motion.p
              className="text-gray-700 text-lg leading-relaxed font-light"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              We are dedicated to empowering meritorious students from economically
              disadvantaged backgrounds to pursue higher education. Our mission is to brighten lives by providing
              essential financial scholarships, enabling deserving students, particularly those from rural areas, to
              continue their academic journey and achieve their full potential.
            </motion.p>
          </motion.div>
          <motion.div
            className="relative h-[400px] w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Student studying"
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

