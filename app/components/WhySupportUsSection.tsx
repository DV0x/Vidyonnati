"use client"

import { motion } from "motion/react"
import {
  Heart,
  Building2,
  Receipt,
  Eye,
  TrendingUp,
  Users,
  FileCheck,
  Award,
  Handshake,
  BarChart3,
  BadgeCheck,
  ArrowRight,
} from "lucide-react"

interface Benefit {
  icon: React.ElementType
  title: string
  description: string
}

const individualBenefits: Benefit[] = [
  {
    icon: Receipt,
    title: "80G Tax Benefits",
    description: "Get 50% tax deduction on your donations under Section 80G of Income Tax Act.",
  },
  {
    icon: Eye,
    title: "Complete Transparency",
    description: "Track exactly how your donation is used with detailed student progress reports.",
  },
  {
    icon: Heart,
    title: "Direct Student Connection",
    description: "Choose specific students to support and follow their educational journey.",
  },
  {
    icon: TrendingUp,
    title: "Measurable Impact",
    description: "See the real difference you make with annual impact reports and success stories.",
  },
]

const corporateBenefits: Benefit[] = [
  {
    icon: FileCheck,
    title: "CSR Compliance",
    description: "Eligible CSR spend under Schedule VII. We handle all documentation and reporting.",
  },
  {
    icon: Award,
    title: "Brand Association",
    description: "Associate your brand with education empowerment and social impact initiatives.",
  },
  {
    icon: Handshake,
    title: "Talent Pipeline",
    description: "First access to scholarship recipients for internships and placements.",
  },
  {
    icon: BarChart3,
    title: "Custom Programs",
    description: "Design scholarship programs aligned with your CSR goals and industry needs.",
  },
]

function BenefitCard({ benefit, index }: { benefit: Benefit; index: number }) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-xl p-5 shadow-md shadow-gray-100 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <benefit.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PartnerCard({
  type,
  icon: Icon,
  title,
  subtitle,
  benefits,
  ctaText,
  ctaHref,
  featured = false,
}: {
  type: string
  icon: React.ElementType
  title: string
  subtitle: string
  benefits: Benefit[]
  ctaText: string
  ctaHref: string
  featured?: boolean
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className={`rounded-2xl p-6 md:p-8 h-full ${
        featured
          ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-xl shadow-primary/25"
          : "bg-white border border-gray-200 shadow-lg"
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            featured ? "bg-white/20" : "bg-primary/10"
          }`}>
            <Icon className={`w-6 h-6 ${featured ? "text-white" : "text-primary"}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${featured ? "text-white/80" : "text-gray-500"}`}>
              {type}
            </p>
            <h3 className={`text-xl font-bold ${featured ? "text-white" : "text-gray-900"}`}>
              {title}
            </h3>
          </div>
        </div>

        <p className={`mb-6 ${featured ? "text-white/90" : "text-gray-600"}`}>
          {subtitle}
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                featured ? "bg-white/20" : "bg-primary/10"
              }`}>
                <BadgeCheck className={`w-3 h-3 ${featured ? "text-white" : "text-primary"}`} />
              </div>
              <div>
                <p className={`font-medium text-sm ${featured ? "text-white" : "text-gray-900"}`}>
                  {benefit.title}
                </p>
                <p className={`text-xs ${featured ? "text-white/70" : "text-gray-500"}`}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={ctaHref}
          className={`inline-flex items-center justify-center w-full gap-2 font-semibold px-6 py-3 rounded-full transition-all duration-300 group ${
            featured
              ? "bg-white text-primary hover:bg-gray-100"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  )
}

export default function WhySupportUsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

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
            Partner With Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why <span className="text-primary">Support</span> Vidyonnati?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Whether you're an individual donor or a corporate partner, your contribution
            creates lasting impact with complete transparency.
          </p>
        </motion.div>

        {/* Two Partner Types */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <PartnerCard
            type="For Individuals"
            icon={Heart}
            title="Personal Giving"
            subtitle="Make a direct impact on a student's life with tax benefits and complete transparency."
            benefits={individualBenefits}
            ctaText="Start Giving"
            ctaHref="/donate"
            featured={true}
          />

          <PartnerCard
            type="For Corporates"
            icon={Building2}
            title="CSR Partnership"
            subtitle="Fulfill CSR obligations while building a talent pipeline for your organization."
            benefits={corporateBenefits}
            ctaText="Partner With Us"
            ctaHref="/contact"
          />
        </div>

        {/* Trust indicators */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">80G Certified</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">12A Registered</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">CSR-1 Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Audited Financials</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
