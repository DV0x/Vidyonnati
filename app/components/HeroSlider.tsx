"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import AutoPlay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Heart, GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

export default function HeroSlider() {
  const slides = useMemo(
    () => [
      {
        tag: "For Donors",
        title: "Transform a",
        titleHighlight: "Student's Future",
        description: "Support meritorious students from Government High Schools in rural Andhra Pradesh to continue their higher education.",
        image: "/images/hero/ceremony-donors.jpg",
        primaryCta: { text: "Donate Now", href: "/donate", icon: Heart },
        secondaryCta: { text: "See Impact", href: "/about" },
      },
      {
        tag: "For Students",
        title: "Your Education,",
        titleHighlight: "Our Mission",
        description: "Studying in a Government or Aided High School in AP? Apply for our scholarship through the Mandal-level screening test.",
        image: "/images/hero/screening-test.jpg",
        primaryCta: { text: "Apply Now", href: "/apply", icon: GraduationCap },
        secondaryCta: { text: "Eligibility", href: "/about" },
      },
      {
        tag: "Transparency",
        title: "Every Rupee",
        titleHighlight: "Reaches Students",
        description: "80G certified and 12AB registered — your donations are tax-deductible with complete transparency and accountability.",
        image: "/images/hero/cheque-presentation.jpg",
        primaryCta: { text: "Fund a Student", href: "/donate", icon: Heart },
        secondaryCta: { text: "Our Process", href: "/about" },
      },
      {
        tag: "Our Impact",
        title: "45+ Students",
        titleHighlight: "Empowered",
        description: "From 24 Government High Schools across 3 mandals in Bapatla District — building futures through education scholarships.",
        image: "/images/hero/certificate-distribution.jpg",
        primaryCta: { text: "Join Us", href: "/donate", icon: Heart },
        secondaryCta: { text: "Learn More", href: "/about" },
      },
    ],
    [],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: 30,
      startIndex: 0,
    },
    [
      AutoPlay({
        delay: 7000,
        stopOnInteraction: false,
        playOnInit: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
      }),
    ],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  useEffect(() => {
    if (emblaApi) {
      setScrollSnaps(emblaApi.scrollSnapList())
      emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()))
      emblaApi.on("reInit", () => setScrollSnaps(emblaApi.scrollSnapList()))
    }
  }, [emblaApi])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
      if (e.key === "ArrowRight") emblaApi?.scrollNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [emblaApi])

  return (
    <section className="relative bg-gradient-to-br from-orange-50/80 via-orange-50/40 to-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-orange-100/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="container mx-auto px-4 h-full">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px] md:min-h-[650px] lg:min-h-[700px] py-12 lg:py-0">

                    {/* Content Side */}
                    <div className="order-2 lg:order-1 z-10">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.div
                            key={`content-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                          >
                            {/* Tag */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1, duration: 0.5 }}
                            >
                              <span className="inline-block bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                                {slide.tag}
                              </span>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2, duration: 0.6 }}
                            >
                              {slide.title}
                              <br />
                              <span className="text-primary">{slide.titleHighlight}</span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                              className="text-lg text-gray-600 max-w-lg leading-relaxed"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              {slide.description}
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                              className="flex flex-wrap gap-4 pt-2"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              <Link href={slide.primaryCta.href}>
                                <Button
                                  size="lg"
                                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 group"
                                >
                                  {slide.primaryCta.icon && <slide.primaryCta.icon className="w-5 h-5 mr-2" />}
                                  {slide.primaryCta.text}
                                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                              <Link href={slide.secondaryCta.href}>
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base backdrop-blur-sm"
                                >
                                  {slide.secondaryCta.text}
                                </Button>
                              </Link>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Image Side */}
                    <div className="order-1 lg:order-2 relative">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.div
                            key={`image-${index}`}
                            className="relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6 }}
                          >
                            {/* Decorative elements behind image */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-orange-200/30 rounded-3xl blur-2xl" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

                            {/* Main image container */}
                            <div className="relative aspect-[4/3] lg:aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50">
                              <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index <= 1}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={90}
                              />
                            </div>

                            {/* Floating stat card - bottom left */}
                            <motion.div
                              className="absolute -bottom-4 -left-4 lg:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                  <GraduationCap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">45+</p>
                                  <p className="text-sm text-gray-500">Students Helped</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Floating stat card - top right */}
                            <motion.div
                              className="absolute -top-3 -right-3 lg:-right-4 bg-primary rounded-xl p-3 shadow-xl"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                            >
                              <p className="text-xl font-bold text-white">95%</p>
                              <p className="text-xs text-white/80">Success Rate</p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrow controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
