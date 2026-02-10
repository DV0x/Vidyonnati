"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Newspaper, ArrowRight } from "lucide-react"

const previewPress = [
  {
    src: "/images/press/prajashakti-screening-2026.jpg",
    publication: "Prajashakti",
    date: "Jan 2026",
  },
  {
    src: "/images/press/news-bicycles-2025.jpg",
    publication: "Telugu Daily",
    date: "Sep 2025",
  },
  {
    src: "/images/press/surya-meritorious-2025.jpg",
    publication: "Surya",
    date: "Jan 2025",
  },
  {
    src: "/images/press/prajashakti-cash-awards-2024.jpg",
    publication: "Prajashakti",
    date: "Jul 2024",
  },
  {
    src: "/images/press/vaartha-scholarship-2024.jpg",
    publication: "Vaartha",
    date: "Jul 2024",
  },
  {
    src: "/images/press/prajashakti-scholarship-list-2024.jpg",
    publication: "Prajashakti",
    date: "Mar 2024",
  },
  {
    src: "/images/press/prajashakti-ceremony-2023.jpg",
    publication: "Prajashakti",
    date: "Jul 2023",
  },
  {
    src: "/images/press/surya-inviting-students-2023.jpg",
    publication: "Surya",
    date: "Feb 2023",
  },
]

export default function MediaPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/60 via-orange-50/40 to-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Newspaper className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            In the Media
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Press <span className="text-primary">Coverage</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our work featured in leading Telugu newspapers — Prajashakti, Surya,
            Vaartha, and more.
          </p>
        </motion.div>

        {/* 2 rows x 4 cols grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {previewPress.map((item, index) => (
            <motion.div
              key={item.src}
              className="relative rounded-xl overflow-hidden shadow-md border border-gray-100 group bg-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={item.src}
                  alt={`${item.publication} - ${item.date}`}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  {item.publication}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link
            href="/media"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 group"
          >
            View All Press Coverage
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
