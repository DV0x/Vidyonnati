"use client"

import Link from 'next/link'
import { motion } from 'motion/react'
import { usePreloadedQuery, type Preloaded } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Users,
  BookOpen,
  Pencil,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDocumentDownload } from '@/hooks/use-document-download'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

type ApplicationDetail = NonNullable<
  FunctionReturnType<typeof api.applications.myApplication>
>
type ApplicationDocumentRow = ApplicationDetail['documents'][number]

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

export default function ApplicationDetailContent({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.applications.myApplication>
}) {
  // The server already resolved this and returned a 404 if it was missing or
  // not this student's, so the value here is non-null on first paint. The
  // subscription stays live, so an admin moving the status to "needs_info"
  // updates the page without a reload.
  const application = usePreloadedQuery(preloaded)!
  const documents = application.documents

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
              {application.applicationId}
            </h1>
            <Badge className={`${status.className} text-sm px-3 py-1`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="mt-2 text-gray-600">
            {application.applicationType === 'first-year'
              ? '1st Year Scholarship Application'
              : '2nd Year Renewal Scholarship Application'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Academic Year: {application.academicYear}
            </span>
            <span>
              Submitted:{' '}
              {new Date(application._creationTime!).toLocaleDateString('en-IN', {
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
            {application.reviewerNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Reviewer Notes:</p>
                <p className="text-sm text-gray-600 mt-1">{application.reviewerNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Needs Info Banner */}
      {application.status === 'needs_info' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.17 }}
        >
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-800 font-semibold">
              Additional Information Required
            </AlertTitle>
            <AlertDescription className="text-orange-700">
              {application.reviewerNotes && (
                <p className="mt-1 mb-3">{application.reviewerNotes}</p>
              )}
              <Button
                asChild
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Link href={`/apply?edit=${application._id}&type=${application.applicationType}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit &amp; Resubmit
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

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
              <InfoRow label="Full Name" value={application.fullName} />
              <InfoRow label="Email" value={application.email} icon={Mail} />
              <InfoRow label="Phone" value={application.phone} icon={Phone} />
              <InfoRow
                label="Date of Birth"
                value={new Date(application.dateOfBirth).toLocaleDateString('en-IN', {
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
              <InfoRow label="Father's Name" value={application.fatherName} />
              {application.fatherOccupation && (
                <InfoRow label="Father's Occupation" value={application.fatherOccupation} />
              )}
              {application.fatherMobile && (
                <InfoRow label="Father's Mobile" value={application.fatherMobile} />
              )}
              <Separator className="my-2" />
              <InfoRow label="Mother's Name" value={application.motherName} />
              {application.motherOccupation && (
                <InfoRow label="Mother's Occupation" value={application.motherOccupation} />
              )}
              {application.motherMobile && (
                <InfoRow label="Mother's Mobile" value={application.motherMobile} />
              )}
              {application.guardianName && (
                <>
                  <Separator className="my-2" />
                  <InfoRow label="Guardian's Name" value={application.guardianName} />
                  {application.guardianRelationship && (
                    <InfoRow label="Relationship" value={application.guardianRelationship} />
                  )}
                </>
              )}
              {application.annualFamilyIncome && (
                <>
                  <Separator className="my-2" />
                  <InfoRow
                    label="Annual Family Income"
                    value={formatIncome(application.annualFamilyIncome)}
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
              <InfoRow label="High School" value={application.highSchoolStudied} />
              <InfoRow
                label="SSC Marks"
                value={`${application.sscTotalMarks} / ${application.sscMaxMarks} (${application.sscPercentage}%)`}
              />
              <InfoRow label="Group/Subjects" value={application.groupSubjects} />
              <Separator className="my-2" />
              {application.applicationType === 'first-year' ? (
                <>
                  {application.collegeAdmitted && (
                    <InfoRow label="College Admitted" value={application.collegeAdmitted} />
                  )}
                  {application.courseJoined && (
                    <InfoRow label="Course Joined" value={application.courseJoined} />
                  )}
                  {application.dateOfAdmission && (
                    <InfoRow
                      label="Date of Admission"
                      value={new Date(application.dateOfAdmission).toLocaleDateString('en-IN')}
                    />
                  )}
                </>
              ) : (
                <>
                  {application.currentCollege && (
                    <InfoRow label="Current College" value={application.currentCollege} />
                  )}
                  {application.courseStudying && (
                    <InfoRow label="Course Studying" value={application.courseStudying} />
                  )}
                  {application.firstYearPercentage && (
                    <InfoRow
                      label="1st Year Marks"
                      value={`${application.firstYearTotalMarks} / ${application.firstYearMaxMarks} (${application.firstYearPercentage}%)`}
                    />
                  )}
                </>
              )}
              <InfoRow label="College Address" value={application.collegeAddress} />
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
              <InfoRow label="Account Number" value={application.bankAccountNumber} />
              <InfoRow label="Bank & Branch" value={application.bankNameBranch} />
              <InfoRow label="IFSC Code" value={application.ifscCode} />
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
                    <DocumentRow key={doc._id} document={doc} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Essays (2nd year only) */}
      {application.applicationType === 'second-year' &&
        (application.studyActivities || application.goalsDreams) && (
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
                {application.studyActivities && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Study Activities & Experiences
                    </h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.studyActivities}
                    </p>
                  </div>
                )}
                {application.goalsDreams && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Goals & Dreams</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.goalsDreams}
                    </p>
                  </div>
                )}
                {application.additionalInfo && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {application.additionalInfo}
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

function DocumentRow({ document }: { document: ApplicationDocumentRow }) {
  const { download, pendingId } = useDocumentDownload()
  const isPending = pendingId === document._id

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {documentTypeLabels[document.documentType] || document.documentType}
          </p>
          <p className="text-xs text-gray-500 truncate">{document.fileName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400">
          {Math.round(document.fileSize / 1024)} KB
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={async () => {
            const failure = await download(
              'application',
              document._id,
              document.fileName,
            )
            if (failure) toast.error(failure)
          }}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download
        </Button>
      </div>
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

