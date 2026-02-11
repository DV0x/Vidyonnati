"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { GraduationCap, ArrowRight, Trophy, MapPin } from "lucide-react"

const toppers = [
  { name: "Maram Eswar Reddy", school: "ZPHS, Chakrayapalem", mandal: "Addanki", year: 2026 },
  { name: "Katta Naga Chaitanya", school: "Boys ZPHS, Inkollu", mandal: "Inkollu", year: 2026 },
  { name: "K. Vamsi Krishna", school: "ZPHS, Chandaluru", mandal: "J. Panguluru", year: 2026 },
  { name: "Amara Sriram Sai Surya Teja", school: "ZP HS, Thimmayapalem", mandal: "Addanki", year: 2025 },
  { name: "P. Lakshmi Prasanna", school: "ZP HS, Pavuluru", mandal: "Inkollu", year: 2025 },
  { name: "Bhavanam Divya", school: "ZPHS, Budawada", mandal: "J. Panguluru", year: 2025 },
  { name: "S. Sai Charishma", school: "SPG Girls HS, Addanki", mandal: "Addanki", year: 2024 },
  { name: "Bommisetty Gowthami", school: "ARZP HS, Duddukur", mandal: "Inkollu", year: 2024 },
  { name: "Shaik Gouse Basha", school: "ZP HS, Budawada", mandal: "J. Panguluru", year: 2024 },
  { name: "Yerraguntla Praneeth", school: "ZP HS, Thimmayapalem", mandal: "Addanki", year: 2023 },
  { name: "Sk. Sana", school: "ZP HS, Inkollu", mandal: "Inkollu", year: 2023 },
  { name: "P. Sai Charan", school: "ZP HS, Chandaluru", mandal: "J. Panguluru", year: 2023 },
]

export default function ScholarsPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-50/60 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <GraduationCap className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Our Scholars
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Merit <span className="text-primary">Scholarship</span> Awardees
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Recognizing meritorious students from Government High Schools
            across Prakasam and Bapatla Districts since 2023.
          </p>
        </motion.div>

        {/* Topper Cards — grouped by year */}
        <div className="space-y-10">
          {[2026, 2025, 2024, 2023].map((year, rowIndex) => {
            const yearToppers = toppers.filter((t) => t.year === year)
            return (
              <div key={year}>
                <motion.p
                  className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-5 text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: rowIndex * 0.08 }}
                  viewport={{ once: true }}
                >
                  {year} Batch — Mandal Toppers
                </motion.p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                  {yearToppers.map((topper, index) => (
                    <motion.div
                      key={topper.name}
                      className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 text-center hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: rowIndex * 0.08 + index * 0.06 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Trophy className="w-7 h-7 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{topper.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{topper.school}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-primary">{topper.mandal}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            href="/scholars"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 group text-base"
          >
            View All 64 Scholars
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
