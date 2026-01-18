"use client"

import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Star,
  Heart,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Eye,
  HandHeart,
  GraduationCap,
  ClipboardCheck,
  Award,
  Sparkles,
} from "lucide-react"

export default function SpotlightPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleApplyClick = () => {
    if (user) {
      router.push("/spotlight/apply")
    } else {
      router.push("/login?redirect=/spotlight/apply")
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50/80 via-orange-50/40 to-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-orange-100/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px] md:min-h-[650px] py-12 lg:py-0">
            {/* Content Side */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Tag */}
              <motion.span
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Star className="w-4 h-4" />
                Student Spotlight Program
              </motion.span>

              {/* Title */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Share Your Story,
                <br />
                <span className="text-primary">Inspire Change</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-lg text-gray-600 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                The Spotlight Program features deserving students on our homepage, connecting
                them directly with donors who can help fund their education and dreams.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={handleApplyClick}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 group"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Apply for Spotlight
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link href="/students">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-6 text-base"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View Featured Students
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Image Side */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-orange-200/30 rounded-3xl blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

              {/* Main image */}
              <div className="relative aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                  alt="Students sharing their stories"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
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
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50+</p>
                    <p className="text-sm text-gray-500">Featured Students</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge - top right */}
              <motion.div
                className="absolute -top-3 -right-3 lg:-right-4 bg-primary rounded-xl p-3 shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className="text-xl font-bold text-white">100%</p>
                <p className="text-xs text-white/80">Verified</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-50 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/30 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

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
              Why Join Spotlight
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Benefits of Getting <span className="text-primary">Featured</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Being part of the Spotlight program opens doors to direct support
              and visibility with our donor community.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <BenefitCard
              icon={Eye}
              title="Get Featured"
              description="Your story will be prominently displayed on our homepage, reaching thousands of potential supporters."
              highlight="Homepage visibility"
              index={0}
            />
            <BenefitCard
              icon={HandHeart}
              title="Direct Support"
              description="Connect directly with donors who are moved by your story and want to help fund your education."
              highlight="Personal connections"
              index={1}
            />
            <BenefitCard
              icon={TrendingUp}
              title="Track Progress"
              description="Share your academic achievements and updates with your supporters as you progress."
              highlight="Ongoing updates"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100/80 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(251 146 60 / 0.15) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-200/50 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

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
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A simple four-step process to get featured and receive support
              for your education journey.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <StepCard
              icon={ClipboardCheck}
              number={1}
              title="Apply"
              description="Fill out the spotlight application with your story, background, and academic details."
              highlight="10 mins"
              index={0}
            />
            <StepCard
              icon={Users}
              number={2}
              title="Review"
              description="Our team reviews your application to verify eligibility and authenticity."
              highlight="3-5 days"
              index={1}
            />
            <StepCard
              icon={Star}
              number={3}
              title="Featured"
              description="Once approved, your profile goes live on our homepage for donors to see."
              highlight="Homepage listing"
              index={2}
            />
            <StepCard
              icon={Heart}
              number={4}
              title="Receive Support"
              description="Donors contribute directly to your education fund based on your story."
              highlight="Direct funding"
              index={3}
            />
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={handleApplyClick}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 group"
            >
              Start Your Application
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-gray-50/80 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-50/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content Side */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Tag */}
              <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full">
                Requirements
              </span>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Who Can <span className="text-primary">Apply?</span>
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed">
                We welcome applications from students who demonstrate both academic merit
                and financial need. Our goal is to highlight stories that inspire and
                connect deserving students with supportive donors.
              </p>

              {/* Eligibility List */}
              <div className="grid gap-4">
                <EligibilityItem text="Currently pursuing or seeking higher education" />
                <EligibilityItem text="Demonstrated financial need for educational support" />
                <EligibilityItem text="Strong academic performance or potential" />
                <EligibilityItem text="Compelling personal story or circumstances" />
                <EligibilityItem text="Registered student on the Vidyonnati platform" />
                <EligibilityItem text="Willingness to share updates on academic progress" />
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button
                  onClick={handleApplyClick}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 group"
                >
                  Check Eligibility & Apply
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
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
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Students in classroom"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Overlay card */}
                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-primary">95%</p>
                      <p className="text-xs text-gray-500">Approval Rate</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-primary">3 Days</p>
                      <p className="text-xs text-gray-500">Avg. Review</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-primary">50+</p>
                      <p className="text-xs text-gray-500">Featured</p>
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
                <p className="text-xs font-medium">Free to</p>
                <p className="text-lg font-bold">Apply</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50/40 via-orange-50/20 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ready to Share <span className="text-primary">Your Story?</span>
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              Take the first step towards getting featured and receiving support
              for your education. Your story could inspire others and change your future.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleApplyClick}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 group"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/students">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-6 text-base"
                >
                  View Featured Students
                </Button>
              </Link>
            </div>

            {/* Trust note */}
            <p className="text-sm text-gray-500 mt-8 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Free to apply • No hidden fees • 100% secure
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
  highlight,
  index,
}: {
  icon: React.ElementType
  title: string
  description: string
  highlight: string
  index: number
}) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{description}</p>

        {/* Highlight badge */}
        <span className="inline-block bg-orange-50 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          {highlight}
        </span>
      </div>
    </motion.div>
  )
}

function StepCard({
  icon: Icon,
  number,
  title,
  description,
  highlight,
  index,
}: {
  icon: React.ElementType
  number: number
  title: string
  description: string
  highlight: string
  index: number
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Connector line */}
      {index < 3 && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
      )}

      <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group h-full">
        {/* Step number */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {number}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{description}</p>

        {/* Highlight badge */}
        <span className="inline-block bg-orange-50 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          {highlight}
        </span>
      </div>
    </motion.div>
  )
}

function EligibilityItem({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <span className="text-gray-700">{text}</span>
    </motion.div>
  )
}
