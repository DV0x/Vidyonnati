"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "motion/react"
import { Play, Pause, Volume2, VolumeX, Quote } from "lucide-react"

interface VideoPlayerProps {
  src: string
  orientation: "landscape" | "portrait"
  name: string
  subtitle: string
}

function VideoPlayer({ src, orientation, name, subtitle }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
      setShowOverlay(false)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!videoRef.current) return
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    },
    [isMuted]
  )

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowOverlay(true)
  }

  const isPortrait = orientation === "portrait"

  return (
    <div>
      <div
        className={`relative rounded-2xl overflow-hidden shadow-xl shadow-gray-200/80 border border-gray-100 cursor-pointer group bg-black ${
          isPortrait ? "max-h-[480px] md:max-h-none" : ""
        }`}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          muted={isMuted}
          playsInline
          preload="metadata"
          onEnded={handleVideoEnd}
          className={`w-full object-contain ${
            isPortrait
              ? "aspect-[9/16] max-h-[480px] md:max-h-[560px]"
              : "aspect-video"
          }`}
        />

        {/* Play Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300">
            <div
              className={`bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform duration-300 ${
                isPortrait
                  ? "w-14 h-14 md:w-16 md:h-16"
                  : "w-16 h-16 md:w-20 md:h-20"
              }`}
            >
              <Play
                className={`text-white ml-0.5 ${
                  isPortrait
                    ? "w-6 h-6 md:w-7 md:h-7"
                    : "w-7 h-7 md:w-9 md:h-9"
                }`}
              />
            </div>
          </div>
        )}

        {/* Hover play/pause (while playing) */}
        {!showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </div>
          </div>
        )}

        {/* Mute/Unmute */}
        {!showOverlay && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200 z-10"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Caption */}
      <div className="mt-3 px-1">
        <h4 className="font-semibold text-gray-900 text-sm md:text-base">
          {name}
        </h4>
        <p className="text-gray-500 text-xs md:text-sm">{subtitle}</p>
      </div>
    </div>
  )
}

export default function TestimonialVideoSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 via-stone-50/80 to-orange-50/30 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-stone-100/60 rounded-full blur-3xl -translate-y-1/3" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-orange-50/40 rounded-full blur-3xl translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Quote className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Voices of <span className="text-primary">Impact</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Hear directly from the students and families whose lives were
            transformed through education.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Row 1: landscape + portrait */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 md:gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <VideoPlayer
                src="/videos/testimonial.mp4"
                orientation="landscape"
                name="Student Testimonial"
                subtitle="Scholarship Beneficiary"
              />
            </motion.div>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              viewport={{ once: true }}
            >
              <VideoPlayer
                src="/videos/testimonial-2.mp4"
                orientation="portrait"
                name="Shaik Sana"
                subtitle="ZPHS Inkollu, Inkollu — Completed Intermediate, now in Graduation"
              />
            </motion.div>
          </div>

          {/* Row 2: two landscape videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <VideoPlayer
                src="/videos/testimonial-srujana.mp4"
                orientation="landscape"
                name="Gottipati Srujana"
                subtitle="Student, ZPHS Chandaluru, Alavalapadu Village"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              viewport={{ once: true }}
            >
              <VideoPlayer
                src="/videos/testimonial-parent-inkollu.mp4"
                orientation="landscape"
                name="Parent of Student Beneficiary"
                subtitle="ZPHS, Inkollu Village"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
