"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GraduationCap, Award, MapPin, Calendar, Users, Trophy, Star, Heart, IndianRupee } from "lucide-react"

interface Student {
  name: string
  village: string | null
  school: string
  mandal: string
  rank: number
  specialAward?: string
}

interface NeedBasedStudent {
  name: string
  location: string
  assistance: string
  amount: string
}

interface YearData {
  year: number
  testDate: string
  scholarshipPeriod: string
  students: Student[]
  totalStudents: number
  totalDisbursed: string
  note: string
  needBased?: NeedBasedStudent[]
}

const scholarsData: YearData[] = [
  {
    year: 2026,
    testDate: "04-01-2026",
    scholarshipPeriod: "2026–28",
    totalStudents: 19,
    totalDisbursed: "Rs. 3,50,000",
    note: "Merit Scholarship of Rs. 10,000 per year for 2 years (16 students: Rs. 3,20,000). Special consolation and merit awards (3 students: Rs. 30,000) by Sri Talluri Baburao, Sri Dhulipalla Ravikanth Babu, and Sri Pentyala Gangadhar.",
    students: [
      { name: "Maram Eswar Reddy", village: "Addanki", school: "ZPHS, Chakrayapalem", mandal: "Addanki", rank: 1 },
      { name: "D. Jhansi Naga Venkata Sai Sri", village: "Addanki", school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 2 },
      { name: "Mogilipalepu Venkata Manikanta Avinash", village: "Addanki", school: "ZPHS, Thimmayapalem", mandal: "Addanki", rank: 3 },
      { name: "R. Jessitha", village: "Medarametla", school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 3 },
      { name: "Kapuluri Nikhil", village: "Addanki", school: "SPG Boys HS, Addanki", mandal: "Addanki", rank: 3 },
      { name: "Udayagiri Gowri Priya", village: "Addanki", school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 6, specialAward: "Consolation Award — Sri Talluri Baburao (Rs. 10,000)" },
      { name: "Katta Naga Chaitanya", village: "Inkollu", school: "Boys ZPHS, Inkollu", mandal: "Inkollu", rank: 1 },
      { name: "Inaganti Prasanna", village: "Gollapalem", school: "NR & VSR HS, Inkollu", mandal: "Inkollu", rank: 2 },
      { name: "G. Vyshnavi", village: "Pavuluru", school: "ZPHS, Pavuluru", mandal: "Inkollu", rank: 3 },
      { name: "Palathoti Madhuri", village: "Duddukuru", school: "ARZP HS, Duddukuru", mandal: "Inkollu", rank: 3 },
      { name: "K. Jaya Sri", village: "Gangavaram", school: "SVK HS, Gangavaram", mandal: "Inkollu", rank: 3 },
      { name: "K. Shakthi Charan Teja", village: "Thatiparthivari Palem", school: "SVK HS, Gangavaram", mandal: "Inkollu", rank: 7, specialAward: "Special Merit Award — Sri Dhulipalla Ravikanth Babu, Best Student of SVK HS (Rs. 20,000)" },
      { name: "K. Vamsi Krishna", village: "J. Panguluru", school: "ZPHS, Chandaluru", mandal: "J. Panguluru", rank: 1 },
      { name: "Uppumaguluri Venkata Geetha Charan", village: "Inkollu", school: "ZPHS, Chandaluru", mandal: "J. Panguluru", rank: 2 },
      { name: "Ch. Sri Rishik Maruthi", village: "Chandaluru", school: "ZPHS, Chandaluru", mandal: "J. Panguluru", rank: 2 },
      { name: "Gade Harsha Vardhan Reddy", village: "Budawada", school: "ZPHS, Budawada", mandal: "J. Panguluru", rank: 4 },
      { name: "Sonti Mahalakshmi", village: "Kondamuru", school: "ZPHS, J. Panguluru", mandal: "J. Panguluru", rank: 5 },
      { name: "K. John Babu", village: "Bollapalli", school: "SRJRY ZPHS, Kondamanjuluru", mandal: "J. Panguluru", rank: 6, specialAward: "Consolation Award — Sri Pentyala Gangadhar (Rs. 10,000)" },
      { name: "Bellamkonda Akhil Santosh", village: "Muppavaram", school: "ZPHS, J. Panguluru", mandal: "J. Panguluru", rank: 6, specialAward: "Consolation Award — Sri Pentyala Gangadhar (Rs. 10,000)" },
    ],
  },
  {
    year: 2025,
    testDate: "05-01-2025",
    scholarshipPeriod: "2025–27",
    totalStudents: 17,
    totalDisbursed: "Rs. 3,20,000",
    note: "15 merit scholars plus 2 need-based scholarships. Scholarship credited in July 2025 and July 2026 respectively.",
    needBased: [
      { name: "Nagarikanti Siva Chaitanya s/o Sivaiah", location: "Ongole", assistance: "Financial assistance for education", amount: "Rs. 12,000" },
      { name: "Peruvuri Nandhini d/o Sambaiah", location: "Ongole", assistance: "Financial assistance for education", amount: "Rs. 8,000" },
    ],
    students: [
      { name: "Amara Sriram Sai Surya Teja", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 1 },
      { name: "M. V. S. Sri Hashini", village: null, school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 1 },
      { name: "Bhupathi Tejaswanth", village: null, school: "ZP HS, Sankavarappadu", mandal: "Addanki", rank: 3 },
      { name: "N. Lakshmi Yamini", village: null, school: "ZP HS, Bommanampadu", mandal: "Addanki", rank: 4 },
      { name: "K. V. S. Sai Durga", village: null, school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 5 },
      { name: "P. Lakshmi Prasanna", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 1 },
      { name: "P. Naga Pranadeep", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 2 },
      { name: "D. Nagapadmaja", village: null, school: "SVK HS, Gangavaram", mandal: "Inkollu", rank: 2 },
      { name: "D. Aswani", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 4 },
      { name: "P. Sufia", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 5 },
      { name: "Bhavanam Divya", village: null, school: "ZPHS, Budawada", mandal: "J. Panguluru", rank: 1 },
      { name: "Katta Harika", village: null, school: "ZPHS, Chandaluru", mandal: "J. Panguluru", rank: 2 },
      { name: "Murukuri Sirivalli", village: null, school: "ZPHS, Budawada", mandal: "J. Panguluru", rank: 3 },
      { name: "Challa Gayathri", village: null, school: "ZPHS, Chandaluru", mandal: "J. Panguluru", rank: 3 },
      { name: "G. M. K. Sai Ram", village: null, school: "ZPHS, Budawada", mandal: "J. Panguluru", rank: 5 },
    ],
  },
  {
    year: 2024,
    testDate: "11-02-2024",
    scholarshipPeriod: "2024–26",
    totalStudents: 15,
    totalDisbursed: "Rs. 3,00,000",
    note: "Scholarship credited in July 2024 and July 2025 for 1st and 2nd year respectively.",
    students: [
      { name: "S. Sai Charishma", village: null, school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 1 },
      { name: "Satuluri Venkata Pardha Sai", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 2 },
      { name: "Gogulamudi Sriram", village: null, school: "ZP HS, Chakrayapalem", mandal: "Addanki", rank: 3 },
      { name: "Payyavula Aravind Babu", village: null, school: "ZP HS, Dhenuvakonda", mandal: "Addanki", rank: 3 },
      { name: "Y. Sravanti", village: null, school: "SPG Girls HS, Addanki", mandal: "Addanki", rank: 5 },
      { name: "Bommisetty Gowthami", village: null, school: "ARZP HS, Duddukur", mandal: "Inkollu", rank: 1 },
      { name: "Ravu Prabhath Kumar", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 2 },
      { name: "Padarthi Pranitha", village: null, school: "ARZP HS, Duddukur", mandal: "Inkollu", rank: 3 },
      { name: "Atmakuri Chaitanya V. S. V. N. Hanuma", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 3 },
      { name: "M. Prazwal", village: null, school: "SVK HS, Gangavaram", mandal: "Inkollu", rank: 5 },
      { name: "Shaik Gouse Basha", village: null, school: "ZP HS, Budawada", mandal: "J. Panguluru", rank: 1 },
      { name: "Naga Pranathi P.", village: null, school: "ZP HS, J. Panguluru", mandal: "J. Panguluru", rank: 1 },
      { name: "Baddigam Rupasri", village: null, school: "ZP HS, Chandaluru", mandal: "J. Panguluru", rank: 3 },
      { name: "Bhavanam Sivani", village: null, school: "ZP HS, Budawada", mandal: "J. Panguluru", rank: 4 },
      { name: "Gottipati Chandrika", village: null, school: "ZP HS, Chandaluru", mandal: "J. Panguluru", rank: 5 },
    ],
  },
  {
    year: 2023,
    testDate: "05-02-2023",
    scholarshipPeriod: "2023–25",
    totalStudents: 18,
    totalDisbursed: "Rs. 3,40,000",
    note: "Inaugural batch — 15 merit scholars plus 3 need-based scholarships including high school tuition fee reimbursement.",
    needBased: [
      { name: "Dhulipalla Sai Ramoji Karthikeya", location: "Kasyapuram, J. Panguluru Mandal, Prakasam Dist.", assistance: "Financial assistance for school study", amount: "Rs. 28,000" },
      { name: "Pilli Suneel Kumar", location: "Potharlanka, Kolluru Mandal, Guntur Dist.", assistance: "Tuition fee and Laptop on admission to IIT, Varanasi", amount: "Rs. 35,000" },
      { name: "Likhita d/o Subhashini Somaiah", location: "Pamidipadu, Korisapadu Mandal, Prakasam Dist.", assistance: "Financial assistance for education", amount: "Rs. 5,000" },
    ],
    students: [
      { name: "Yerraguntla Praneeth", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 1 },
      { name: "Chinthalapudi Ramakeerthana", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 2 },
      { name: "T. V. N. Ashok", village: null, school: "Sri Prakasam Govt. Boys HS, Addanki", mandal: "Addanki", rank: 3 },
      { name: "Arudhra Lakshmi Prasanna", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 3 },
      { name: "Sanaga Venkata Joshna", village: null, school: "ZP HS, Thimmayapalem", mandal: "Addanki", rank: 3 },
      { name: "Sk. Sana", village: null, school: "ZP HS, Inkollu", mandal: "Inkollu", rank: 1 },
      { name: "Sk. Ayesha", village: null, school: "ARZP HS, Duddukur", mandal: "Inkollu", rank: 2 },
      { name: "Thatiparthi Deepthi", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 2 },
      { name: "Ganji Poojitha Ankamma", village: null, school: "ZP HS, Pavuluru", mandal: "Inkollu", rank: 2 },
      { name: "P. Sailaja", village: null, school: "SVK HS, Gangavaram", mandal: "Inkollu", rank: 5 },
      { name: "P. Sai Charan", village: null, school: "ZP HS, Chandaluru", mandal: "J. Panguluru", rank: 1 },
      { name: "T. Dhanusha Reddy", village: null, school: "ZP HS, Budawada", mandal: "J. Panguluru", rank: 2 },
      { name: "R. Manaswini", village: null, school: "ZP HS, Budawada", mandal: "J. Panguluru", rank: 3 },
      { name: "G. Srujana", village: null, school: "ZP HS, Chandaluru", mandal: "J. Panguluru", rank: 3 },
      { name: "Nayudu Manasa", village: null, school: "PSNCC HS, Muppavaram", mandal: "J. Panguluru", rank: 5 },
    ],
  },
]

const mandals = ["Addanki", "Inkollu", "J. Panguluru"]

function MandalTable({ students, mandal, yearHasVillages }: { students: Student[]; mandal: string; yearHasVillages: boolean }) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-lg font-bold text-gray-900">{mandal} Mandal</h3>
        <span className="text-sm text-gray-500">({students.length} students)</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-primary/5 to-orange-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 w-16">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
              {yearHasVillages && (
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Village</th>
              )}
              <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden sm:table-cell">School</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr
                key={`${student.name}-${idx}`}
                className={`border-b border-gray-100 last:border-0 ${
                  student.specialAward ? "bg-orange-50/50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } hover:bg-primary/5 transition-colors`}
              >
                <td className="py-3 px-4">
                  {student.rank <= 3 && !student.specialAward ? (
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      student.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      student.rank === 2 ? "bg-gray-200 text-gray-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {student.rank}
                    </span>
                  ) : (
                    <span className="text-gray-600 pl-2">{student.rank}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  {student.specialAward && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-primary font-medium">{student.specialAward}</span>
                    </div>
                  )}
                  {/* Show school on mobile */}
                  <div className="text-xs text-gray-500 sm:hidden mt-0.5">{student.school}</div>
                </td>
                {yearHasVillages && (
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{student.village || "—"}</td>
                )}
                <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{student.school}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default function ScholarsPage() {
  const [activeYear, setActiveYear] = useState(2026)

  const yearData = scholarsData.find((d) => d.year === activeYear)!
  const yearHasVillages = yearData.students.some((s) => s.village !== null)

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
              <GraduationCap className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Our Scholars
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Merit <span className="text-primary">Scholarship</span> Awardees
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meritorious students selected through annual screening tests from
              Government High Schools across Prakasam and Bapatla Districts, Andhra Pradesh.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-12 py-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-gray-900 font-bold text-lg">4</span>
              <span className="text-gray-600 text-sm">Years</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-gray-900 font-bold text-lg">69</span>
              <span className="text-gray-600 text-sm">Students Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="text-gray-900 font-bold text-lg">Rs. 13.1 Lakhs</span>
              <span className="text-gray-600 text-sm">Disbursed</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-gray-900 font-bold text-lg">3</span>
              <span className="text-gray-600 text-sm">Mandals</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Year Tabs + Tables */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Year Tab Selector */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="inline-flex bg-gray-100 rounded-full p-1.5 flex-wrap justify-center gap-1">
              {scholarsData.map((d) => (
                <button
                  key={d.year}
                  onClick={() => setActiveYear(d.year)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeYear === d.year
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {d.year}
                  <span className="ml-1.5 text-xs opacity-75">({d.totalStudents})</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Year Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Test Date: {yearData.testDate}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  +2 Study: {yearData.scholarshipPeriod}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {yearData.totalStudents} students
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <IndianRupee className="w-4 h-4" />
                  {yearData.totalDisbursed}
                </span>
              </div>

              {/* Mandal Tables */}
              {mandals.map((mandal) => {
                const students = yearData.students.filter((s) => s.mandal === mandal)
                if (students.length === 0) return null
                return (
                  <MandalTable
                    key={`${activeYear}-${mandal}`}
                    students={students}
                    mandal={mandal}
                    yearHasVillages={yearHasVillages}
                  />
                )
              })}

              {/* Need-Based Scholarships */}
              {yearData.needBased && yearData.needBased.length > 0 && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h3 className="text-lg font-bold text-gray-900">Need-Based Scholarships</h3>
                    <span className="text-sm text-gray-500">({yearData.needBased.length} students)</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-rose-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden sm:table-cell">Location</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Assistance Provided</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearData.needBased.map((student, idx) => (
                          <tr
                            key={student.name}
                            className={`border-b border-rose-100 last:border-0 ${
                              idx % 2 === 0 ? "bg-white" : "bg-rose-50/30"
                            } hover:bg-rose-50/50 transition-colors`}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500 sm:hidden mt-0.5">{student.location}</div>
                              <div className="text-xs text-gray-500 md:hidden mt-0.5">{student.assistance}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{student.location}</td>
                            <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{student.assistance}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">{student.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Year Note */}
              <div className="mt-6 p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>{yearData.note}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Memorial Dedication */}
      <section className="py-10 bg-gradient-to-br from-gray-50 to-orange-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-gray-500 mb-2">All scholarships awarded in loving memory of</p>
            <p className="text-gray-700 font-medium">
              Late Sri Dhulipalla Venkateswarlu, Jagarlamudivari Palem
            </p>
            <p className="text-gray-500 text-sm">Ex Sarpanch, Muppavaram</p>
            <p className="text-gray-700 font-medium mt-2">
              Late Sri Bodempudi Ramamurthy
            </p>
            <p className="text-gray-500 text-sm">Retd. Head Master, Gangavaram (I) Village</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
