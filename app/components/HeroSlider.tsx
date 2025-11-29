"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import AutoPlay from "embla-carousel-autoplay"
import type React from "react" // Added import for React

const DotButton = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
      selected ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
    }`}
    onClick={onClick}
  />
)

export default function HeroSlider() {
  const slides = useMemo(
    () => [
      {
        title: "OUR TIME IS NOW",
        subtitle: "OUR RIGHTS, OUR FUTURE",
        description: "International Day of the Girl Child",
        date: "11 October",
        image: "/placeholder.svg?height=600&width=1200",
        cta: "READ MORE",
      },
      {
        title: "EMPOWER THROUGH EDUCATION",
        subtitle: "BUILDING TOMORROW'S LEADERS",
        description: "Quality Education For All",
        date: "Join Our Mission",
        image: "/placeholder.svg?height=600&width=1200",
        cta: "SUPPORT US",
      },
      {
        title: "TRANSFORM LIVES",
        subtitle: "THROUGH KNOWLEDGE",
        description: "Supporting Underprivileged Students",
        date: "Make A Difference",
        image: "/placeholder.svg?height=600&width=1200",
        cta: "DONATE NOW",
      },
      {
        title: "BRIGHT FUTURES",
        subtitle: "START WITH EDUCATION",
        description: "Creating Opportunities",
        date: "Be The Change",
        image: "/placeholder.svg?height=600&width=1200",
        cta: "GET INVOLVED",
      },
    ],
    [],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: 50,
      startIndex: 0,
      watchDrag: false,
      inViewThreshold: 0.7, // Preload images when they're 70% in view
    },
    [
      AutoPlay({
        delay: 6000,
        stopOnInteraction: false,
        playOnInit: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
      }),
    ],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  const onImageError = useCallback(
    (image: string) => (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.error("Image failed to load:", image)
      const imgElement = e.target as HTMLImageElement
      imgElement.src = "/placeholder.svg?height=600&width=1200"
    },
    [],
  )

  useEffect(() => {
    if (emblaApi) {
      setScrollSnaps(emblaApi.scrollSnapList())
      emblaApi.on("select", onSelect)
      emblaApi.on("reInit", onInit)
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect)
        emblaApi.off("reInit", onInit)
      }
    }
  }, [emblaApi, onInit, onSelect])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        emblaApi?.scrollPrev()
      } else if (e.key === "ArrowRight") {
        emblaApi?.scrollNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              <div className="relative h-[600px] w-full">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={`${slide.title} - ${slide.description}`}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    index === selectedIndex ? "opacity-100" : "opacity-80"
                  }`}
                  priority={index <= 1} // Load first two slides with high priority
                  loading={index <= 1 ? "eager" : "lazy"}
                  sizes="100vw"
                  quality={75} // Slightly reduce quality for faster loading
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRsdHSIeHx8hIyEjJSUgICUlJyYrLSsmJyctMDM1NzA4ODovLzQ/OTo4Ojc3ODj/2wBDARUXFx4aHh0dHDgnICc4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  onError={onImageError(slide.image)}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="relative z-10 max-w-xl">
                    <div className="bg-primary/75 px-6 py-4">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{slide.title}</h2>
                      <p className="text-white text-sm sm:text-base lg:text-lg">{slide.subtitle}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-lg">
                        {slide.description}
                      </h3>
                      <p className="text-white text-base sm:text-xl drop-shadow-lg">{slide.date}</p>
                      <Button className="cta-button mt-2 sm:mt-4" size="lg">
                        {slide.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-2 sm:gap-3">
          {scrollSnaps.map((_, index) => (
            <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
          ))}
        </div>
      </div>
    </div>
  )
}

