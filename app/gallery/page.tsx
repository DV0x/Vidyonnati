"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"

type Category = "all" | "ceremonies" | "screening" | "students"

interface GalleryImage {
  src: string
  alt: string
  category: Category[]
  year: string
}

const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/ceremony-2025-cheque.jpg",
    alt: "Scholarship cheque presentation ceremony 2025 - Rs. 3 Lakhs for 30 meritorious SSC students",
    category: ["ceremonies"],
    year: "2025",
  },
  {
    src: "/images/gallery/ceremony-2025-girl-award.jpg",
    alt: "Student receiving scholarship award at 2025 ceremony",
    category: ["ceremonies", "students"],
    year: "2025",
  },
  {
    src: "/images/gallery/ceremony-2025-certificate.jpg",
    alt: "Student with parents receiving certificate at 2025 ceremony",
    category: ["ceremonies", "students"],
    year: "2025",
  },
  {
    src: "/images/gallery/ceremony-2025-parents.jpg",
    alt: "Student and mother receiving certificate from dignitaries",
    category: ["ceremonies", "students"],
    year: "2025",
  },
  {
    src: "/images/gallery/ceremony-2025-felicitation.jpg",
    alt: "Felicitation of guests at 2025 scholarship ceremony",
    category: ["ceremonies"],
    year: "2025",
  },
  {
    src: "/images/gallery/screening-test-classroom.jpg",
    alt: "Students appearing for screening test in classroom",
    category: ["screening"],
    year: "2025",
  },
  {
    src: "/images/gallery/screening-test-wide.jpg",
    alt: "Screening test in progress at Government High School",
    category: ["screening"],
    year: "2025",
  },
  {
    src: "/images/gallery/ceremony-2024-banner.jpg",
    alt: "Vidyonnati Foundation 2024 scholarship ceremony with banner and cheque",
    category: ["ceremonies"],
    year: "2024",
  },
  {
    src: "/images/gallery/ceremony-2024-distribution.jpg",
    alt: "Certificate distribution at 2024 ceremony",
    category: ["ceremonies"],
    year: "2024",
  },
  {
    src: "/images/gallery/ceremony-2024-student.jpg",
    alt: "Student receiving certificate at 2024 outdoor ceremony",
    category: ["ceremonies", "students"],
    year: "2024",
  },
  {
    src: "/images/gallery/students-certificates-school.jpg",
    alt: "Students and teachers with certificates at school",
    category: ["students"],
    year: "2025",
  },
  {
    src: "/images/gallery/students-staff-group.jpg",
    alt: "Students and staff group photo at Vidyonnati Foundation event",
    category: ["students"],
    year: "2025",
  },
  {
    src: "/images/gallery/students-school-group.jpg",
    alt: "Students and volunteers at school campus",
    category: ["students"],
    year: "2025",
  },
  {
    src: "/images/gallery/screening-test-outdoor.jpg",
    alt: "Students writing screening test in outdoor area",
    category: ["screening"],
    year: "2026",
  },
  {
    src: "/images/gallery/certificate-stage-outdoor.jpg",
    alt: "Certificate distribution at outdoor stage with Vidyonnati Foundation banner",
    category: ["ceremonies"],
    year: "2026",
  },
  {
    src: "/images/gallery/pangulur-zphs-group.jpg",
    alt: "Students attended screening test at Pangulur ZPHS, February 2023",
    category: ["screening", "students"],
    year: "2023",
  },
  {
    src: "/images/gallery/scholars-certificates-2023.jpg",
    alt: "Selected scholars with certificates at 2023 ceremony",
    category: ["ceremonies", "students"],
    year: "2023",
  },
  {
    src: "/images/gallery/cheque-ceremony-2022.jpg",
    alt: "Cheque presentation for Rs. 3 Lakhs to 15 meritorious students, 2022",
    category: ["ceremonies"],
    year: "2022",
  },
]

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Photos" },
  { value: "ceremonies", label: "Ceremonies" },
  { value: "screening", label: "Screening Tests" },
  { value: "students", label: "Students" },
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    activeCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category.includes(activeCategory))

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filtered.length)
    }
  }
  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filtered.length) % filtered.length
      )
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50/80 via-orange-50/40 to-white overflow-hidden pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Camera className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Photo Gallery
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-primary">Journey</span> in Pictures
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Moments from scholarship ceremonies, screening tests, and student
              interactions across Andhra Pradesh.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1.5 flex-wrap justify-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat.value
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((image, index) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                    <div className="p-3 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                        {image.year}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-gray-400 text-sm mt-8">
            {filtered.length} photos
          </p>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-4 text-white/80 hover:text-white z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-4 text-white/80 hover:text-white z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <motion.div
              key={lightboxIndex}
              className="relative w-[90vw] h-[80vh] max-w-5xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
              <p className="absolute bottom-0 left-0 right-0 text-center text-white/70 text-sm py-3 bg-gradient-to-t from-black/50 to-transparent">
                {filtered[lightboxIndex].alt}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
