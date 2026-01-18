"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { Application, ApplicationDocument } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Banknote,
  FileText,
  Download,
  Users,
  BookOpen,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string; bgColor: string }> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-500',
  },
  under_review: {
    label: 'Under Review',
    icon: Eye,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-500',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-500',
  },
  needs_info: {
    label: 'Additional Info Required',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-500',
  },
}

const documentTypeLabels: Record<string, string> = {
  ssc_marksheet: 'SSC Marksheet',
  aadhar_student: 'Student Aadhar Card',
  aadhar_parent: 'Parent Aadhar Card',
  bonafide_certificate: 'Bonafide Certificate',
  bank_passbook: 'Bank Passbook',
  first_year_marksheet: 'First Year Marksheet',
  mango_plant_photo: 'Mango Plant Photo',
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [documents, setDocuments] = useState<ApplicationDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applicationId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    async function fetchApplication() {
      if (!user || !applicationId) return

      const supabase = createClient()

      // Fetch application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('student_id', user.id)
        .single()

      if (appError || !appData) {
        setError('Application not found')
        setIsLoading(false)
        return
      }

      setApplication(appData)

      // Fetch documents
      const { data: docsData } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)

      if (docsData) {
        setDocuments(docsData)
      }

      setIsLoading(false)
    }

    fetchApplication()
  }, [user, applicationId])

  if (isLoading) {
    return <ApplicationDetailSkeleton />
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          {error || 'Application not found'}
        </h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/applications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/applications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:items-start gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {application.application_id}
            </h1>
            <Badge className={`${status.className} text-sm px-3 py-1`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="mt-2 text-gray-600">
            {application.application_type === 'first-year'
              ? '1st Year Scholarship Application'
              : '2nd Year Renewal Scholarship Application'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Academic Year: {application.academic_year}
            </span>
            <span>
              Submitted:{' '}
              {new Date(application.created_at!).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline status={application.status} />
            {application.reviewer_notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Reviewer Notes:</p>
                <p className="text-sm text-gray-600 mt-1">{application.reviewer_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Application Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Full Name" value={application.full_name} />
              <InfoRow label="Email" value={application.email} icon={Mail} />
              <InfoRow label="Phone" value={application.phone} icon={Phone} />
              <InfoRow
                label="Date of Birth"
                value={new Date(application.date_of_birth).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <InfoRow label="Gender" value={application.gender === 'male' ? 'Male' : 'Female'} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Address Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Village" value={application.village} />
              <InfoRow label="Mandal" value={application.mandal} />
              <InfoRow label="District" value={application.district} />
              <InfoRow label="Pincode" value={application.pincode} />
              <InfoRow label="Full Address" value={application.address} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Family Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Father's Name" value={application.father_name} />
              {application.father_occupation && (
                <InfoRow label="Father's Occupation" value={application.father_occupation} />
              )}
              {application.father_mobile && (
                <InfoRow label="Father's Mobile" value={application.father_mobile} />
              )}
              <Separator className="my-2" />
              <InfoRow label="Mother's Name" value={application.mother_name} />
              {application.mother_occupation && (
                <InfoRow label="Mother's Occupation" value={application.mother_occupation} />
              )}
              {application.mother_mobile && (
                <InfoRow label="Mother's Mobile" value={application.mother_mobile} />
              )}
              {application.guardian_name && (
                <>
                  <Separator className="my-2" />
                  <InfoRow label="Guardian's Name" value={application.guardian_name} />
                  {application.guardian_relationship && (
                    <InfoRow label="Relationship" value={application.guardian_relationship} />
                  )}
                </>
              )}
              {application.annual_family_income && (
                <>
                  <Separator className="my-2" />
                  <InfoRow
                    label="Annual Family Income"
                    value={formatIncome(application.annual_family_income)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Education Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="High School" value={application.high_school_studied} />
              <InfoRow
                label="SSC Marks"
                value={`${application.ssc_total_marks} / ${application.ssc_max_marks} (${application.ssc_percentage}%)`}
              />
              <InfoRow label="Group/Subjects" value={application.group_subjects} />
              <Separator className="my-2" />
              {application.application_type === 'first-year' ? (
                <>
                  {application.college_admitted && (
                    <InfoRow label="College Admitted" value={application.college_admitted} />
                  )}
                  {application.course_joined && (
                    <InfoRow label="Course Joined" value={application.course_joined} />
                  )}
                  {application.date_of_admission && (
                    <InfoRow
                      label="Date of Admission"
                      value={new Date(application.date_of_admission).toLocaleDateString('en-IN')}
                    />
                  )}
                </>
              ) : (
                <>
                  {application.current_college && (
                    <InfoRow label="Current College" value={application.current_college} />
                  )}
                  {application.course_studying && (
                    <InfoRow label="Course Studying" value={application.course_studying} />
                  )}
                  {application.first_year_percentage && (
                    <InfoRow
                      label="1st Year Marks"
                      value={`${application.first_year_total_marks} / ${application.first_year_max_marks} (${application.first_year_percentage}%)`}
                    />
                  )}
                </>
              )}
              <InfoRow label="College Address" value={application.college_address} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Account Number" value={application.bank_account_number} />
              <InfoRow label="Bank & Branch" value={application.bank_name_branch} />
              <InfoRow label="IFSC Code" value={application.ifsc_code} />
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
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentRow key={doc.id} document={doc} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Essays (2nd year only) */}
      {application.application_type === 'second-year' &&
        (application.study_activities || application.goals_dreams) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Essays</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {application.study_activities && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Study Activities & Experiences
                    </h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.study_activities}
                    </p>
                  </div>
                )}
                {application.goals_dreams && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Goals & Dreams</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.goals_dreams}
                    </p>
                  </div>
                )}
                {application.additional_info && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.additional_info}
                    </p>
                  </div>
                )}
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
}: {
  label: string
  value: string | null | undefined
  icon?: React.ElementType
}) {
  if (!value) return null

  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'submitted', label: 'Submitted', completed: true },
    { key: 'under_review', label: 'Under Review', completed: ['under_review', 'approved', 'rejected', 'needs_info'].includes(status) },
    { key: 'decision', label: 'Decision Made', completed: ['approved', 'rejected'].includes(status) },
  ]

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className="text-xs text-gray-600 mt-2 text-center">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 ${
                steps[index + 1].completed ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function DocumentRow({ document }: { document: ApplicationDocument }) {
  const supabase = createClient()

  const handleDownload = async () => {
    const { data } = await supabase.storage
      .from('application-documents')
      .createSignedUrl(document.storage_path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {documentTypeLabels[document.document_type] || document.document_type}
          </p>
          <p className="text-xs text-gray-500 truncate">{document.file_name}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

function formatIncome(income: string): string {
  const labels: Record<string, string> = {
    'below-1-lakh': 'Below ₹1 Lakh',
    '1-2-lakhs': '₹1-2 Lakhs',
    '2-3-lakhs': '₹2-3 Lakhs',
    '3-5-lakhs': '₹3-5 Lakhs',
    'above-5-lakhs': 'Above ₹5 Lakhs',
  }
  return labels[income] || income
}

function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
