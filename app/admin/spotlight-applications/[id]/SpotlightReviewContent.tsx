"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePreloadedQuery, useMutation, type Preloaded } from 'convex/react'
import { convexErrorMessage } from '@/lib/convexError'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Users,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Target,
  Heart,
  Star,
  Award,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react'

type SpotlightReview = NonNullable<
  FunctionReturnType<typeof api.admin.spotlightApplication>
>
type SpotlightDocumentRow = SpotlightReview['documents'][number]
type SpotlightStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'needs_info'

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Eye,
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  needs_info: {
    label: 'Needs Info',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
  },
}

const circumstanceLabels: Record<string, string> = {
  single_parent: 'Single parent household',
  orphan: 'Orphan',
  parent_disability: 'Parent with disability',
  parent_chronic_illness: 'Parent with chronic illness',
  family_debt: 'Family in debt',
  natural_disaster: 'Natural disaster affected',
  first_generation: 'First generation college student',
  below_poverty_line: 'Below poverty line (BPL)',
  no_stable_income: 'No stable income source',
  other: 'Other',
}

const documentTypeLabels: Record<string, string> = {
  photo: 'Profile Photo',
  marksheet: 'Marksheet',
  aadhar: 'Aadhar Card',
  income_certificate: 'Income Certificate',
  other: 'Other Document',
}

export default function SpotlightReviewContent({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.admin.spotlightApplication>
}) {
  // Resolved on the server, which already 404'd a missing record.
  const application = usePreloadedQuery(preloaded)!
  const applicationId = application._id
  const documents = application.documents
  const [isSaving, setIsSaving] = useState(false)

  const [status, setStatus] = useState<SpotlightStatus>(application.status)
  const [reviewerNotes, setReviewerNotes] = useState(application.reviewerNotes || '')
  const [isFeatured, setIsFeatured] = useState(application.isFeatured || false)

  const updateSpotlightApplication = useMutation(
    api.admin.updateSpotlightApplication,
  )

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateSpotlightApplication({
        id: applicationId,
        status,
        reviewerNotes,
        isFeatured,
      })
      // No local merge: the preloaded query is a live subscription and pushes
      // the new values here on its own.
      toast.success('Application updated successfully')
    } catch (error) {
      toast.error(convexErrorMessage(error, 'Failed to update application'))
    } finally {
      setIsSaving(false)
    }
  }


  const statusInfo = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  // Parse competitive exams
  const competitiveExams = (application.competitiveExams as Array<{
    exam: string
    score?: string
    rank?: number
    percentile?: number
  }>) || []

  // Parse circumstances
  const circumstances = (application.circumstances as string[]) || []

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/admin/spotlight-applications">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {application.spotlightId}
            </h1>
            <Badge className={statusInfo.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {application.isFeatured && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <p className="mt-1 text-gray-600">
            Submitted on{' '}
            {new Date(application._creationTime!).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </motion.div>

      {/* Admin Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>
              Update the application status and add notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as SpotlightStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="needs_info">Needs Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Featured on Homepage</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <span className="text-sm text-gray-600">
                    {isFeatured ? 'Student will appear on homepage' : 'Not featured'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reviewer Notes</Label>
              <Textarea
                placeholder="Add notes about this application..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Photo and Basic Info Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Profile photo intentionally not rendered. The Supabase table had a
            photo_url column; in Convex the photo is a row in spotlightDocuments
            and needs a storage URL, which is Phase 4. */}


        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Full Name" value={application.fullName} />
              <InfoRow label="Date of Birth" value={formatDate(application.dateOfBirth)} icon={Calendar} />
              <InfoRow label="Gender" value={capitalizeFirst(application.gender)} />
              <InfoRow label="Phone" value={application.phone} icon={Phone} />
              <InfoRow label="Email" value={application.email} icon={Mail} className="sm:col-span-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Address & Education Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Village/Town" value={application.village} />
                <InfoRow label="Mandal" value={application.mandal} />
                <InfoRow label="District" value={application.district} />
                <InfoRow label="State" value={application.state} />
                <InfoRow label="Pincode" value={application.pincode} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="College/School" value={application.collegeName} className="sm:col-span-2" />
                <InfoRow label="Course/Stream" value={application.courseStream} />
                <InfoRow label="Year of Completion" value={application.yearOfCompletion?.toString()} />
                <InfoRow
                  label="Marks"
                  value={`${application.totalMarks} / ${application.maxMarks} (${application.percentage}%)`}
                />
                <InfoRow label="Current Status" value={formatCurrentStatus(application.currentStatus)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Competitive Exams */}
      {competitiveExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Competitive Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {competitiveExams.map((exam, index) => (
                  <div key={index} className="rounded-lg border p-3 bg-gray-50">
                    <p className="font-medium text-gray-900">{exam.exam}</p>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      {exam.score && <p>Score: {exam.score}</p>}
                      {exam.rank && <p>Rank: {exam.rank}</p>}
                      {exam.percentile && <p>Percentile: {exam.percentile}%</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Family Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="Parent Status" value={formatParentStatus(application.parentStatus)} />
              {application.fatherName && (
                <>
                  <InfoRow label="Father's Name" value={application.fatherName} />
                  <InfoRow label="Father's Occupation" value={application.fatherOccupation} />
                  <InfoRow label="Father's Health" value={capitalizeFirst(application.fatherHealth)} />
                </>
              )}
              {application.motherName && (
                <>
                  <InfoRow label="Mother's Name" value={application.motherName} />
                  <InfoRow label="Mother's Occupation" value={application.motherOccupation} />
                  <InfoRow label="Mother's Health" value={capitalizeFirst(application.motherHealth)} />
                </>
              )}
              {application.guardianName && (
                <>
                  <InfoRow label="Guardian's Name" value={application.guardianName} />
                  <InfoRow label="Guardian's Relationship" value={application.guardianRelationship} />
                </>
              )}
              <InfoRow label="Number of Siblings" value={application.siblingsCount?.toString()} />
              <InfoRow label="Annual Family Income" value={formatIncome(application.annualFamilyIncome)} icon={IndianRupee} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Circumstances */}
      {(circumstances.length > 0 || application.circumstancesOther) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {circumstances.map((circumstance) => (
                  <Badge key={circumstance} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {circumstanceLabels[circumstance] || circumstance}
                  </Badge>
                ))}
              </div>
              {application.circumstancesOther && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Other Details:</p>
                  <p className="mt-1 text-gray-700">{application.circumstancesOther}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Story & Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Story & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Background Story</p>
              <p className="text-gray-700 whitespace-pre-wrap">{application.backgroundStory}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Dreams & Goals</p>
              <p className="text-gray-700 whitespace-pre-wrap">{application.dreamsGoals}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">How Will Help Change Your Life</p>
              <p className="text-gray-700 whitespace-pre-wrap">{application.howHelpChangesLife}</p>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">Annual Financial Need:</span>
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(application.annualFinancialNeed)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <DocumentRow key={doc._id} document={doc} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon: Icon,
  className = '',
}: {
  label: string
  value: string | null | undefined
  icon?: React.ElementType
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-gray-900">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {value || '-'}
      </p>
    </div>
  )
}

function DocumentRow({ document }: { document: SpotlightDocumentRow }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {documentTypeLabels[document.documentType] || document.documentType}
          </p>
          <p className="text-xs text-gray-500 truncate">{document.fileName}</p>
        </div>
      </div>
      {/* No download link until Phase 4; see the scholarship review page. */}
      <span className="text-xs text-gray-400 shrink-0">
        {Math.round(document.fileSize / 1024)} KB
      </span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}

// Helper functions
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return '-'
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function formatParentStatus(status: string | null | undefined): string {
  if (!status) return '-'
  const labels: Record<string, string> = {
    both_alive: 'Both Parents Alive',
    single_parent_father: 'Single Parent (Father)',
    single_parent_mother: 'Single Parent (Mother)',
    orphan: 'Orphan',
  }
  return labels[status] || status
}

function formatCurrentStatus(status: string | null | undefined): string {
  if (!status) return '-'
  const labels: Record<string, string> = {
    studying: 'Currently Studying',
    seeking_admission: 'Seeking Admission',
    working: 'Working',
    other: 'Other',
  }
  return labels[status] || status
}

function formatIncome(income: string | null | undefined): string {
  if (!income) return '-'
  const labels: Record<string, string> = {
    'below-1-lakh': 'Below 1 Lakh',
    '1-2-lakhs': '1-2 Lakhs',
    '2-3-lakhs': '2-3 Lakhs',
    '3-5-lakhs': '3-5 Lakhs',
    'above-5-lakhs': 'Above 5 Lakhs',
  }
  return labels[income] || income
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
