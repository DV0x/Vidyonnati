"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { usePreloadedQuery, type Preloaded } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export default function SpotlightDetailContent({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.spotlight.mineById>
}) {
  // Resolved on the server, which 404s when the record is missing or belongs to
  // someone else — so this is non-null on first paint and stays live after.
  const application = usePreloadedQuery(preloaded)!

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
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              {application.spotlightId}
            </h1>
            <p className="text-gray-600">Spotlight Application</p>
          </div>

          <div className="flex items-center gap-3">
            {application.isFeatured && (
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
                    {new Date(application._creationTime!).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {application.reviewerNotes && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs font-medium text-orange-800 mb-1">
                  Reviewer Notes
                </p>
                <p className="text-sm text-orange-700">{application.reviewerNotes}</p>
                {application.status === "needs_info" && (
                  <Button
                    asChild
                    size="sm"
                    className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Link href={`/spotlight/apply?edit=${application._id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit &amp; Resubmit
                    </Link>
                  </Button>
                )}
              </div>
            )}
            {application.status === "needs_info" && !application.reviewerNotes && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700 mb-3">
                  Additional information is needed for your application.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Link href={`/spotlight/apply?edit=${application._id}`}>
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
              <InfoItem label="Full Name" value={application.fullName} />
              <InfoItem label="Date of Birth" value={application.dateOfBirth} />
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
                value={application.collegeName}
                fullWidth
              />
              <InfoItem label="Course/Stream" value={application.courseStream} />
              <InfoItem
                label="Year of Completion"
                value={application.yearOfCompletion.toString()}
              />
              <InfoItem
                label="Marks"
                value={`${application.totalMarks}/${application.maxMarks} (${application.percentage}%)`}
              />
              <InfoItem
                label="Current Status"
                value={
                  currentStatusLabels[
                    application.currentStatus as keyof typeof currentStatusLabels
                  ] || application.currentStatus
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Competitive Exams */}
      {application.competitiveExams &&
        (application.competitiveExams as unknown[]).length > 0 && (
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
                    application.competitiveExams as {
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
                    application.parentStatus as keyof typeof parentStatusLabels
                  ] || application.parentStatus
                }
                fullWidth
              />
              {application.motherName && (
                <InfoItem label="Mother's Name" value={application.motherName} />
              )}
              {application.motherOccupation && (
                <InfoItem
                  label="Mother's Occupation"
                  value={application.motherOccupation}
                />
              )}
              {application.fatherName && (
                <InfoItem label="Father's Name" value={application.fatherName} />
              )}
              {application.fatherOccupation && (
                <InfoItem
                  label="Father's Occupation"
                  value={application.fatherOccupation}
                />
              )}
              {application.guardianName && (
                <InfoItem label="Guardian's Name" value={application.guardianName} />
              )}
              {application.guardianRelationship && (
                <InfoItem
                  label="Guardian Relationship"
                  value={application.guardianRelationship}
                />
              )}
              {application.siblingsCount !== undefined && (
                <InfoItem
                  label="Number of Siblings"
                  value={application.siblingsCount.toString()}
                />
              )}
              {application.annualFamilyIncome && (
                <InfoItem
                  label="Annual Family Income"
                  value={
                    incomeBracketLabels[
                      application.annualFamilyIncome as (typeof incomeBrackets)[number]
                    ] || application.annualFamilyIncome
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
            {application.circumstancesOther && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Additional Details
                </p>
                <p className="text-sm text-gray-700">
                  {application.circumstancesOther}
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
                {application.backgroundStory}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Dreams & Goals</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.dreamsGoals}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                How Help Changes Life
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.howHelpChangesLife}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 p-4 rounded-lg border border-green-200">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-800">
                  Annual Financial Need
                </p>
                <p className="text-lg font-bold text-green-900">
                  {application.annualFinancialNeed.toLocaleString("en-IN")}
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
            {application.documents &&
            application.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {doc.documentType.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {/* Download lands in Phase 4 with the private-document
                        decision; see the note in the scholarship detail page. */}
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
