"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { Shield, Award, Heart } from "lucide-react"

const trustBadges = [
  {
    icon: Shield,
    title: "80G Certified",
    description: "Tax benefits for donors",
  },
  {
    icon: Award,
    title: "Section 8 Company",
    description: "Under Companies Act 2013",
  },
  {
    icon: Heart,
    title: "Since 2023",
    description: "3 years of impact",
  },
]

export default function WelcomeSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50/40 via-orange-50/20 to-white relative overflow-hidden">
      {/* Warm background decoration */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Content Side */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Tag */}
            <motion.span
              className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              About Us
            </motion.span>

            {/* Title */}
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Empowering Dreams Through{" "}
              <span className="text-primary">Education</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-gray-600 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Vidyonnati Foundation is incorporated under Section 8(1) of the Companies Act, 2013
              as an NGO with the mission to promote education and extend financial help to deserving
              students. For students from low-income families in rural areas, higher education is
              often a dream that becomes a financial burden, leading to dropouts. We work to change that.
            </motion.p>

            {/* Vision & Mission */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-r from-orange-50 to-orange-50/30 rounded-2xl p-5 border-l-4 border-primary">
                <p className="text-sm font-semibold text-primary mb-1">Our Vision</p>
                <p className="text-gray-700 leading-relaxed">
                  Empowering youth through financial aid and guidance to achieve their professional aspirations.
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-50/30 rounded-2xl p-5 border-l-4 border-primary/60">
                <p className="text-sm font-semibold text-primary mb-1">Our Mission</p>
                <p className="text-gray-700 leading-relaxed">
                  To build a sustainable and progressive society by facilitating deserving students
                  through education, employment, and social responsibility in nation building.
                </p>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              {trustBadges.map((badge, index) => (
                <div
                  key={badge.title}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <badge.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                    <p className="text-gray-500 text-xs">{badge.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-orange-200/20 rounded-3xl blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-orange-200/40 rounded-full blur-xl" />

            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50">
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students studying together"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Overlay stats card */}
              <motion.div
                className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-primary">45+</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-primary">24</p>
                    <p className="text-xs text-gray-500">Schools</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-gray-500">Mandals</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-2 -right-2 bg-primary text-white rounded-xl px-4 py-2 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-medium">Est.</p>
              <p className="text-lg font-bold">Jan 2023</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
