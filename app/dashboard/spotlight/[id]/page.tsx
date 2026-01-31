"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { useAuth } from "@/app/context/AuthContext"
import type { SpotlightApplication, SpotlightDocument } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Star,
  User,
  GraduationCap,
  Trophy,
  Users,
  HeartHandshake,
  PenLine,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Sparkles,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Pencil,
} from "lucide-react"
import {
  parentStatusLabels,
  currentStatusLabels,
  circumstanceLabels,
  incomeBracketLabels,
  incomeBrackets,
} from "@/lib/schemas/spotlight"

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string; description: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Your application is waiting to be reviewed.",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Our team is currently reviewing your application.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
    description: "Congratulations! Your application has been approved.",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
    description: "Unfortunately, your application was not approved.",
  },
  needs_info: {
    label: "Needs Info",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Additional information is needed for your application.",
  },
}

interface SpotlightWithDocuments extends SpotlightApplication {
  spotlight_documents: (SpotlightDocument & { signedUrl?: string })[]
}

export default function SpotlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<SpotlightWithDocuments | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchApplication() {
      if (!user || !id) return

      const response = await fetch(`/api/student/spotlight/${id}`)

      if (response.ok) {
        const data = await response.json()
        setApplication(data)
      }
      setIsLoading(false)
    }

    fetchApplication()
  }, [user, id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Application Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The spotlight application you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              {application.spotlight_id}
            </h1>
            <p className="text-gray-600">Spotlight Application</p>
          </div>

          <div className="flex items-center gap-3">
            {application.is_featured && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge className={status.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  application.status === "approved"
                    ? "bg-green-100"
                    : application.status === "rejected"
                    ? "bg-red-100"
                    : "bg-primary/10"
                }`}
              >
                <StatusIcon
                  className={`w-6 h-6 ${
                    application.status === "approved"
                      ? "text-green-600"
                      : application.status === "rejected"
                      ? "text-red-600"
                      : "text-primary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{status.label}</p>
                <p className="text-sm text-gray-600">{status.description}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Submitted{" "}
                    {new Date(application.created_at!).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {application.reviewer_notes && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs font-medium text-orange-800 mb-1">
                  Reviewer Notes
                </p>
                <p className="text-sm text-orange-700">{application.reviewer_notes}</p>
                {application.status === "needs_info" && (
                  <Button
                    asChild
                    size="sm"
                    className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Link href={`/spotlight/apply?edit=${application.id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit &amp; Resubmit
                    </Link>
                  </Button>
                )}
              </div>
            )}
            {application.status === "needs_info" && !application.reviewer_notes && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700 mb-3">
                  Additional information is needed for your application.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Link href={`/spotlight/apply?edit=${application.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit &amp; Resubmit
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={application.full_name} />
              <InfoItem label="Date of Birth" value={application.date_of_birth} />
              <InfoItem label="Gender" value={application.gender || "-"} />
              <InfoItem
                label="Phone"
                value={application.phone}
                icon={<Phone className="w-3 h-3" />}
              />
              <InfoItem
                label="Email"
                value={application.email}
                icon={<Mail className="w-3 h-3" />}
              />
              <InfoItem
                label="Location"
                value={`${application.village}, ${application.mandal}, ${application.district}`}
                icon={<MapPin className="w-3 h-3" />}
                fullWidth
              />
              <InfoItem label="State" value={application.state} />
              <InfoItem label="PIN Code" value={application.pincode} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
              Education Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="College/Institution"
                value={application.college_name}
                fullWidth
              />
              <InfoItem label="Course/Stream" value={application.course_stream} />
              <InfoItem
                label="Year of Completion"
                value={application.year_of_completion.toString()}
              />
              <InfoItem
                label="Marks"
                value={`${application.total_marks}/${application.max_marks} (${application.percentage}%)`}
              />
              <InfoItem
                label="Current Status"
                value={
                  currentStatusLabels[
                    application.current_status as keyof typeof currentStatusLabels
                  ] || application.current_status
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Competitive Exams */}
      {application.competitive_exams &&
        (application.competitive_exams as unknown[]).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                  Competitive Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(
                    application.competitive_exams as {
                      exam: string
                      score?: string
                      rank?: number
                      percentile?: number
                    }[]
                  ).map((exam, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <p className="font-medium text-gray-900">{exam.exam}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        {exam.score && <span>Score: {exam.score}</span>}
                        {exam.rank && <span>Rank: {exam.rank}</span>}
                        {exam.percentile && <span>Percentile: {exam.percentile}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Family Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Family Background
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="Parent Status"
                value={
                  parentStatusLabels[
                    application.parent_status as keyof typeof parentStatusLabels
                  ] || application.parent_status
                }
                fullWidth
              />
              {application.mother_name && (
                <InfoItem label="Mother's Name" value={application.mother_name} />
              )}
              {application.mother_occupation && (
                <InfoItem
                  label="Mother's Occupation"
                  value={application.mother_occupation}
                />
              )}
              {application.father_name && (
                <InfoItem label="Father's Name" value={application.father_name} />
              )}
              {application.father_occupation && (
                <InfoItem
                  label="Father's Occupation"
                  value={application.father_occupation}
                />
              )}
              {application.guardian_name && (
                <InfoItem label="Guardian's Name" value={application.guardian_name} />
              )}
              {application.guardian_relationship && (
                <InfoItem
                  label="Guardian Relationship"
                  value={application.guardian_relationship}
                />
              )}
              {application.siblings_count !== null && (
                <InfoItem
                  label="Number of Siblings"
                  value={application.siblings_count.toString()}
                />
              )}
              {application.annual_family_income && (
                <InfoItem
                  label="Annual Family Income"
                  value={
                    incomeBracketLabels[
                      application.annual_family_income as (typeof incomeBrackets)[number]
                    ] || application.annual_family_income
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Circumstances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartHandshake className="w-5 h-5 text-primary" />
              Circumstances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(application.circumstances as string[])?.map((c) => (
                <Badge
                  key={c}
                  className="bg-orange-100 text-orange-700 border-orange-200"
                >
                  {circumstanceLabels[c as keyof typeof circumstanceLabels] || c}
                </Badge>
              ))}
            </div>
            {application.circumstances_other && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Additional Details
                </p>
                <p className="text-sm text-gray-700">
                  {application.circumstances_other}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Story & Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenLine className="w-5 h-5 text-primary" />
              Story & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Background Story</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.background_story}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Dreams & Goals</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.dreams_goals}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                How Help Changes Life
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.how_help_changes_life}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 p-4 rounded-lg border border-green-200">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-800">
                  Annual Financial Need
                </p>
                <p className="text-lg font-bold text-green-900">
                  {application.annual_financial_need.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.spotlight_documents &&
            application.spotlight_documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.spotlight_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {doc.document_type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {doc.signedUrl && (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  icon,
  fullWidth = false,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 flex items-center gap-1.5">
        {icon}
        {value || "-"}
      </p>
    </div>
  )
}
