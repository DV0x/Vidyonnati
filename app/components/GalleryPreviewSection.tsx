"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Camera, ArrowRight } from "lucide-react"

const previewImages = [
  { src: "/images/gallery/ceremony-2025-cheque.jpg", alt: "Scholarship cheque presentation 2025" },
  { src: "/images/gallery/ceremony-2025-girl-award.jpg", alt: "Student receiving award" },
  { src: "/images/gallery/screening-test-classroom.jpg", alt: "Screening test in classroom" },
  { src: "/images/gallery/students-school-group.jpg", alt: "Students and volunteers at school" },
  { src: "/images/gallery/ceremony-2024-banner.jpg", alt: "2024 scholarship ceremony" },
  { src: "/images/gallery/ceremony-2025-parents.jpg", alt: "Student with parents at ceremony" },
  { src: "/images/gallery/scholars-certificates-2023.jpg", alt: "Scholars with certificates 2023" },
  { src: "/images/gallery/screening-test-outdoor.jpg", alt: "Screening test outdoors" },
]

export default function GalleryPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-50/60 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Camera className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Gallery
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary">Journey</span> in Pictures
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Moments from scholarship ceremonies, screening tests, and student
            interactions across Andhra Pradesh.
          </p>
        </motion.div>

        {/* 2 rows x 4 cols grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {previewImages.map((image, index) => (
            <motion.div
              key={image.src}
              className="relative aspect-[4/3] rounded-xl overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
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
            href="/gallery"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 group"
          >
            View Full Gallery
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
