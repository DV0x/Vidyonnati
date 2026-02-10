"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Newspaper, X, ChevronLeft, ChevronRight } from "lucide-react"

interface PressItem {
  src: string
  publication: string
  date: string
  headline: string
  year: number
}

const pressItems: PressItem[] = [
  {
    src: "/images/press/prajashakti-screening-2026.jpg",
    publication: "Prajashakti",
    date: "January 2026",
    headline: "Vidyonnati Foundation screening test for scholarships",
    year: 2026,
  },
  {
    src: "/images/press/news-bicycles-2025.jpg",
    publication: "Telugu Daily",
    date: "September 2025",
    headline: "Government school students encouraged with bicycles distribution",
    year: 2025,
  },
  {
    src: "/images/press/prajashakti-bicycles-2025.jpg",
    publication: "Prajashakti",
    date: "September 2025",
    headline: "Free bicycles for Government High School students",
    year: 2025,
  },
  {
    src: "/images/press/prajashakti-scholarship-test-2025.jpg",
    publication: "Prajashakti",
    date: "January 2025",
    headline: "Vidyonnati scholarship screening test conducted",
    year: 2025,
  },
  {
    src: "/images/press/surya-meritorious-2025.jpg",
    publication: "Surya Daily",
    date: "January 2025",
    headline: "Rs. 20,000 scholarship for meritorious Intermediate students",
    year: 2025,
  },
  {
    src: "/images/press/andhraprabha-screening-2025.jpg",
    publication: "Andhra Prabha",
    date: "January 2025",
    headline: "Vidyonnati Foundation scholarship screening test",
    year: 2025,
  },
  {
    src: "/images/press/prajashakti-screening-2025.jpg",
    publication: "Prajashakti",
    date: "January 2025",
    headline: "Screening test for students at mandal headquarters",
    year: 2025,
  },
  {
    src: "/images/press/prajashakti-cash-awards-2024.jpg",
    publication: "Prajashakti",
    date: "July 2024",
    headline: "Cash awards presented to meritorious students",
    year: 2024,
  },
  {
    src: "/images/press/vaartha-scholarship-2024.jpg",
    publication: "Vaartha",
    date: "July 2024",
    headline: "Vidyonnati Foundation distributes scholarships to 15 students",
    year: 2024,
  },
  {
    src: "/images/press/prajashakti-scholarship-list-2024.jpg",
    publication: "Prajashakti",
    date: "March 2024",
    headline: "Scholarship merit list released by Vidyonnati Foundation",
    year: 2024,
  },
  {
    src: "/images/press/prajashakti-ceremony-2023.jpg",
    publication: "Prajashakti",
    date: "July 2023",
    headline: "Scholarship ceremony for 10th class meritorious students",
    year: 2023,
  },
  {
    src: "/images/press/prajashakti-scholarship-test-2023.jpg",
    publication: "Prajashakti",
    date: "February 2023",
    headline: "Scholarship screening test for 10th class students",
    year: 2023,
  },
  {
    src: "/images/press/surya-inviting-students-2023.jpg",
    publication: "Surya Daily",
    date: "February 2023",
    headline: "Vidyonnati Foundation scholarship announced for students",
    year: 2023,
  },
]

export default function MediaPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => {
    if (lightboxIndex !== null)
      setLightboxIndex((lightboxIndex + 1) % pressItems.length)
  }
  const goPrev = () => {
    if (lightboxIndex !== null)
      setLightboxIndex(
        (lightboxIndex - 1 + pressItems.length) % pressItems.length
      )
  }

  // Group by year
  const years = [...new Set(pressItems.map((p) => p.year))].sort(
    (a, b) => b - a
  )

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
              <Newspaper className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              In the Media
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Press <span className="text-primary">Coverage</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vidyonnati Foundation&apos;s work featured in leading Telugu
              newspapers including Prajashakti, Surya, Vaartha, and Andhra
              Prabha.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Press Grid by Year */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          {years.map((year) => {
            const yearItems = pressItems.filter((p) => p.year === year)
            return (
              <div key={year} className="mb-12 last:mb-0">
                <motion.h2
                  className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                    {year}
                  </span>
                  <span className="text-gray-400 text-base font-normal">
                    {yearItems.length}{" "}
                    {yearItems.length === 1 ? "article" : "articles"}
                  </span>
                </motion.h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearItems.map((item, index) => {
                    const globalIndex = pressItems.indexOf(item)
                    return (
                      <motion.div
                        key={item.src}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        onClick={() => setLightboxIndex(globalIndex)}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.src}
                            alt={item.headline}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {item.publication}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium text-sm leading-snug">
                            {item.headline}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
              className="relative w-[90vw] h-[85vh] max-w-4xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={pressItems[lightboxIndex].src}
                alt={pressItems[lightboxIndex].headline}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 text-center py-3 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white font-medium text-sm">
                  {pressItems[lightboxIndex].headline}
                </p>
                <p className="text-white/60 text-xs">
                  {pressItems[lightboxIndex].publication} &middot;{" "}
                  {pressItems[lightboxIndex].date}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
