"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Quote, GraduationCap, Heart } from "lucide-react"
import Image from "next/image"

type TestimonialType = "students" | "donors"

interface Testimonial {
  id: number
  name: string
  role: string
  location: string
  content: string
  image: string
  highlight?: string
}

const studentTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "B.Tech Computer Science",
    location: "NIT Warangal",
    content:
      "Coming from a small village where girls rarely pursued higher education, Vidyonnati gave me wings. Today I'm interning at a top tech company, and my younger sister is inspired to follow the same path.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "Now at Google",
  },
  {
    id: 2,
    name: "Rahul Patel",
    role: "MBBS Final Year",
    location: "Gandhi Medical College",
    content:
      "My father is a farmer who couldn't afford my medical education. Vidyonnati not only funded my studies but connected me with doctor mentors who guide me. I'll return to serve my village after graduation.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "First doctor in village",
  },
  {
    id: 3,
    name: "Lakshmi Devi",
    role: "M.Tech Mechanical",
    location: "IIT Hyderabad",
    content:
      "Breaking stereotypes in engineering wasn't easy. The foundation believed in me when others doubted. Their support goes beyond money – the mentorship and confidence they gave me changed everything.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "Research published",
  },
]

const donorTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "IT Professional",
    location: "Bangalore",
    content:
      "I sponsor two students through Vidyonnati. The transparency is remarkable – I receive regular updates, photos, and even handwritten letters from the students. It's not charity; it's building relationships.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "2 students sponsored",
  },
  {
    id: 2,
    name: "Sunita Reddy",
    role: "Business Owner",
    location: "Hyderabad",
    content:
      "As someone who struggled for education myself, supporting Vidyonnati feels personal. Their 80G certification makes it tax-efficient, but honestly, seeing a student succeed is worth more than any deduction.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "5 years of giving",
  },
  {
    id: 3,
    name: "Vikram Singh",
    role: "Corporate CSR Head",
    location: "TechCorp India",
    content:
      "Our company partners with Vidyonnati for CSR. What sets them apart is the measurable impact – we know exactly which students we're supporting and track their progress. It's CSR done right.",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    highlight: "₹10L+ contributed",
  },
]

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
        {/* Quote icon */}
        <Quote className="w-10 h-10 text-primary/20 mb-4" />

        {/* Content */}
        <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            {testimonial.highlight && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {testimonial.highlight}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
            <p className="text-sm text-primary">{testimonial.role}</p>
            <p className="text-xs text-gray-500">{testimonial.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialSection() {
  const [activeTab, setActiveTab] = useState<TestimonialType>("students")

  const testimonials = activeTab === "students" ? studentTestimonials : donorTestimonials

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 via-stone-50/80 to-orange-50/30 relative overflow-hidden">
      {/* Warm neutral decoration */}
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Voices of <span className="text-primary">Impact</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Real stories from students whose lives were transformed and donors
            who made it possible.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex bg-gray-100 rounded-full p-1.5">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === "students"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Stories
            </button>
            <button
              onClick={() => setActiveTab("donors")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === "donors"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Heart className="w-4 h-4" />
              Donor Experiences
            </button>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            {activeTab === "students"
              ? "Want to create more success stories?"
              : "Join our community of changemakers"}
          </p>
          <a
            href={activeTab === "students" ? "/donate" : "/donate"}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
          >
            {activeTab === "students" ? "Support a Student" : "Start Your Journey"}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
