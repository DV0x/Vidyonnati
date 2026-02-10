"use client"

import Image from "next/image"
import { motion } from "motion/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Eye,
  Target,
  Shield,
  Award,
  FileCheck,
  Users,
  ClipboardCheck,
  BookOpen,
  Rocket,
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
  ArrowRight,
  ExternalLink,
  Building2,
} from "lucide-react"

const trustees = [
  {
    name: "Mr. Dhulipalla Veeranarayana",
    role: "Chairman & Director",
    qualifications: "M.Sc.(Ag.), CAIIIB, DIM, PGDRD",
    description:
      "Retd. Executive from Syndicate Bank, ex-Director RUDSETI, ex-RO Debt Recovery Tribunal. Presently engaged in farming and social service.",
    location: "Ongole, Andhra Pradesh",
    image: "/images/trustees/veeranarayana.jpg",
  },
  {
    name: "Mr. Bodempudi Jayasankar",
    role: "Director",
    qualifications: "PET",
    description:
      "Physical Education Teacher at SVK High School, Gangavaram. Actively involved in student development and education outreach.",
    location: "Gangavaram, Andhra Pradesh",
    image: "/images/trustees/jayasankar.jpg",
  },
  {
    name: "Dr. Dhulipalla Sharmila Priyanka",
    role: "Chief Patron",
    qualifications: "MBBS, MD",
    description:
      "Medical professional and patron of the foundation, supporting the cause of education for underprivileged students.",
    location: "Andhra Pradesh",
    image: "/images/trustees/priyanka.jpg",
  },
]

const approvals = [
  {
    title: "Company Registration",
    detail: "CIN: U80903AP2023NPL123763",
    subtitle: "Incorporated under Companies Act, 2013 — Section 8(1)",
  },
  {
    title: "80G Certification",
    detail: "Tax Exemption for Donors",
    subtitle: "Order dated 07/03/2024 — Ministry of Finance, Income Tax Dept.",
  },
  {
    title: "12AB Registration",
    detail: "Income Tax Exemption",
    subtitle: "Order dated 01/03/2024 — Ministry of Finance, Income Tax Dept.",
  },
  {
    title: "PAN & TAN",
    detail: "PAN: AAJCV1798C | TAN: VPNV08753D",
    subtitle: "Government of India tax identification",
  },
]

const usefulLinks = [
  {
    name: "Vidyalakshmi Portal",
    description: "Government of India portal for education loans and scholarships",
    url: "https://www.vidyalakshmi.co.in",
  },
  {
    name: "National Scholarships Portal",
    description: "One-stop solution for scholarship schemes by Govt. of India",
    url: "https://scholarships.gov.in",
  },
  {
    name: "Vidyasaarathi",
    description: "Protean eGov Technologies (formerly NSDL) scholarship platform",
    url: "https://www.vidyasaarathi.co.in",
  },
  {
    name: "Sri Sathya Sai Institute of Higher Learning",
    description: "Free undergraduate course admissions",
    url: "https://www.sssihl.edu.in",
  },
]

const processSteps = [
  {
    icon: ClipboardCheck,
    title: "Screening Test",
    description:
      "Students studying 10th class in Government and Aided High Schools appear for a screening test conducted at Mandal Headquarters every year.",
  },
  {
    icon: Users,
    title: "Merit Selection",
    description:
      "15 meritorious and deserving students are selected per year from across 3 mandals in Bapatla District, Andhra Pradesh.",
  },
  {
    icon: BookOpen,
    title: "Scholarship Award",
    description:
      "Selected students receive scholarship funding to continue their Intermediate or equivalent course for 2 years.",
  },
  {
    icon: Rocket,
    title: "Guidance & Growth",
    description:
      "We advise students and guide them in securing admission for undergraduate courses with continued financial and mentorship support.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50/80 via-orange-50/40 to-white overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Promoting <span className="text-primary">Education</span> for
              Rural India
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Vidyonnati Foundation is incorporated under Section 8(1) of the
              Companies Act, 2013 on 3rd January, 2023 as an NGO with the
              objective to promote education and extend financial help to
              deserving students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Detail */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Education for students from low-income families, especially
                those hailing from rural areas, is a dream that often becomes a
                financial burden — resulting in dropouts without continuing their
                education. To promote education of graduating students from
                Government High Schools of Andhra Pradesh, India, the momentum
                has commenced through Vidyonnati Foundation.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our scholarship program is designed to help meritorious students
                selected through a screening test at Mandal/Tahsil level,
                studying 10th class in Government and Aided High Schools of
                rural areas, to continue their higher education. The Foundation
                also helps in identifying economically backward meritorious
                students, guides them in securing admission to further education,
                and provides scholarships through the charity of philanthropic
                individuals and companies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100/80"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Empowering youth through financial aid and guidance to achieve
                their professional aspirations.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100/80"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To build a sustainable and progressive society by facilitating
                deserving students through education, employment, and taking
                social responsibility in nation building.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section id="how-we-work" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We <span className="text-primary">Work</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A transparent, merit-based process to identify and support
              deserving students from rural Andhra Pradesh.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-gray-500 text-sm mt-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            This selection process can be extended to other Mandals in the state
            of Andhra Pradesh depending on availability of donations from
            individuals and companies. High School Heads, Teachers, volunteers,
            and media participate to enhance the programme.
          </motion.p>
        </div>
      </section>

      {/* Progress Stats */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Our Progress
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Impact in the First <span className="text-primary">3 Years</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: "927", label: "Students Appeared", sub: "For screening tests across mandals" },
              { value: "45", label: "Students Benefited", sub: "Awarded scholarships year over year" },
              { value: "24", label: "High Schools Involved", sub: "Govt. & aided schools in Bapatla District" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100/80 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="font-semibold text-gray-900 mb-1">
                  {stat.label}
                </p>
                <p className="text-sm text-gray-500">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trustees */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-primary">Trustees</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {trustees.map((trustee, index) => (
              <motion.div
                key={trustee.name}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 mx-auto ring-4 ring-primary/10">
                  <Image
                    src={trustee.image}
                    alt={trustee.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {trustee.name}
                  </h3>
                  <p className="text-primary font-semibold text-sm mb-1">
                    {trustee.role}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {trustee.qualifications}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {trustee.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    {trustee.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approvals & Certifications */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Compliance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Approvals &{" "}
              <span className="text-primary">Certifications</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {approvals.map((item, index) => (
              <motion.div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-primary text-sm font-medium">
                    {item.detail}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Useful Links for Students */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Resources
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Useful Links for{" "}
              <span className="text-primary">Students</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore these government and institutional portals for additional
              scholarship and education opportunities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {usefulLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group flex items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {link.name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-gray-500 text-sm">{link.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Address */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100/80"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Us
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600 text-sm">
                        D.No 6-218, New No 33-055-972, Grd Floor,
                        <br />
                        4th Lane, Srinagar Colony, Kurnool Rd,
                        <br />
                        Ongole, Prakasam, Andhra Pradesh — 523002
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a
                        href="tel:+919440045144"
                        className="text-gray-600 text-sm hover:text-primary transition-colors"
                      >
                        +91 9440-045-144
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <p className="text-gray-600 text-sm">
                        vidyonnatifoundation.org
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Donate CTA */}
              <motion.div
                className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-8 shadow-xl text-white flex flex-col justify-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Heart className="w-10 h-10 text-white/80 mb-4" />
                <h2 className="text-2xl font-bold mb-3">Appeal for Donation</h2>
                <p className="text-white/90 leading-relaxed mb-6">
                  The scope of our work is ever increasing. Philanthropists can
                  help the Foundation reach more High Schools and students to
                  continue their education. Choose to support deserving students
                  from the area of your choice in Andhra Pradesh.
                </p>
                <Link href="/donate">
                  <Button className="bg-white text-primary hover:bg-gray-100 font-semibold rounded-full px-8 py-3 w-full md:w-auto group">
                    Donate Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
