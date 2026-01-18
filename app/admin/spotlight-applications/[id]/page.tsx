"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import type { SpotlightApplication, SpotlightDocument, SpotlightStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Download,
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

interface SpotlightDetailResponse {
  application: SpotlightApplication
  documents: SpotlightDocument[]
}

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

export default function SpotlightApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: applicationId } = use(params)
  const router = useRouter()
  const [application, setApplication] = useState<SpotlightApplication | null>(null)
  const [documents, setDocuments] = useState<SpotlightDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [status, setStatus] = useState<SpotlightStatus>('pending')
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  useEffect(() => {
    async function fetchApplication() {
      setIsLoading(true)
      const res = await fetch(`/api/admin/spotlight-applications/${applicationId}`)
      if (res.ok) {
        const data: SpotlightDetailResponse = await res.json()
        setApplication(data.application)
        setDocuments(data.documents)
        setStatus(data.application.status as SpotlightStatus)
        setReviewerNotes(data.application.reviewer_notes || '')
        setIsFeatured(data.application.is_featured || false)
      } else {
        toast.error('Failed to load application')
        router.push('/admin/spotlight-applications')
      }
      setIsLoading(false)
    }

    fetchApplication()
  }, [applicationId, router])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/spotlight-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewer_notes: reviewerNotes,
          is_featured: isFeatured,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setApplication(data.application)
        toast.success('Application updated successfully')
      } else {
        toast.error('Failed to update application')
      }
    } catch {
      toast.error('An error occurred')
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!application) {
    return null
  }

  const statusInfo = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  // Parse competitive exams
  const competitiveExams = (application.competitive_exams as Array<{
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
              {application.spotlight_id}
            </h1>
            <Badge className={statusInfo.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {application.is_featured && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <p className="mt-1 text-gray-600">
            Submitted on{' '}
            {new Date(application.created_at!).toLocaleDateString('en-IN', {
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
        {/* Photo */}
        {application.photo_url && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto overflow-hidden rounded-lg border">
                <Image
                  src={application.photo_url}
                  alt={application.full_name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}

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
              <InfoRow label="Full Name" value={application.full_name} />
              <InfoRow label="Date of Birth" value={formatDate(application.date_of_birth)} icon={Calendar} />
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
                <InfoRow label="College/School" value={application.college_name} className="sm:col-span-2" />
                <InfoRow label="Course/Stream" value={application.course_stream} />
                <InfoRow label="Year of Completion" value={application.year_of_completion?.toString()} />
                <InfoRow
                  label="Marks"
                  value={`${application.total_marks} / ${application.max_marks} (${application.percentage}%)`}
                />
                <InfoRow label="Current Status" value={formatCurrentStatus(application.current_status)} />
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
              <InfoRow label="Parent Status" value={formatParentStatus(application.parent_status)} />
              {application.father_name && (
                <>
                  <InfoRow label="Father's Name" value={application.father_name} />
                  <InfoRow label="Father's Occupation" value={application.father_occupation} />
                  <InfoRow label="Father's Health" value={capitalizeFirst(application.father_health)} />
                </>
              )}
              {application.mother_name && (
                <>
                  <InfoRow label="Mother's Name" value={application.mother_name} />
                  <InfoRow label="Mother's Occupation" value={application.mother_occupation} />
                  <InfoRow label="Mother's Health" value={capitalizeFirst(application.mother_health)} />
                </>
              )}
              {application.guardian_name && (
                <>
                  <InfoRow label="Guardian's Name" value={application.guardian_name} />
                  <InfoRow label="Guardian's Relationship" value={application.guardian_relationship} />
                </>
              )}
              <InfoRow label="Number of Siblings" value={application.siblings_count?.toString()} />
              <InfoRow label="Annual Family Income" value={formatIncome(application.annual_family_income)} icon={IndianRupee} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Circumstances */}
      {(circumstances.length > 0 || application.circumstances_other) && (
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
              {application.circumstances_other && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Other Details:</p>
                  <p className="mt-1 text-gray-700">{application.circumstances_other}</p>
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
              <p className="text-gray-700 whitespace-pre-wrap">{application.background_story}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Dreams & Goals</p>
              <p className="text-gray-700 whitespace-pre-wrap">{application.dreams_goals}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">How Will Help Change Your Life</p>
              <p className="text-gray-700 whitespace-pre-wrap">{application.how_help_changes_life}</p>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">Annual Financial Need:</span>
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(application.annual_financial_need)}
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
                  <DocumentRow key={doc.id} document={doc} />
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

function DocumentRow({ document }: { document: SpotlightDocument }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from('spotlight-documents')
      .createSignedUrl(document.storage_path, 60)

    if (error || !data?.signedUrl) {
      toast.error('Failed to download document')
    } else {
      window.open(data.signedUrl, '_blank')
    }
    setIsDownloading(false)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {documentTypeLabels[document.document_type] || document.document_type}
          </p>
          <p className="text-xs text-gray-500 truncate">{document.file_name}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <Download className="h-4 w-4" />
      </Button>
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
