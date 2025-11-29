"use client"

import { useFormContext } from "react-hook-form"
import { ClipboardCheck, Edit2, User, GraduationCap, Users, FileText, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type ApplicationType, indianStates } from "@/lib/schemas/application"

interface ReviewStepProps {
  applicationType: ApplicationType
  onEdit: (step: number) => void
}

export function ReviewStep({ applicationType, onEdit }: ReviewStepProps) {
  const { watch } = useFormContext()
  const data = watch()

  const isFirstYear = applicationType === "first-year"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Review Your Application</h2>
          <p className="text-sm text-gray-500">
            Please review all the information before submitting
          </p>
        </div>
      </div>

      {/* Application Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
        {isFirstYear ? "1st Year Application" : "2nd Year Renewal Application"}
      </div>

      {/* Personal Information */}
      <ReviewSection
        icon={<User className="w-4 h-4" />}
        title="Personal Information"
        onEdit={() => onEdit(0)}
      >
        <ReviewGrid>
          <ReviewItem label="Full Name" value={data.fullName} />
          <ReviewItem label="Email" value={data.email} />
          <ReviewItem label="Phone" value={data.phone} />
          <ReviewItem label="Date of Birth" value={data.dateOfBirth} />
          <ReviewItem label="Address" value={data.address} fullWidth />
          <ReviewItem label="City" value={data.city} />
          <ReviewItem label="State" value={data.state} />
          <ReviewItem label="PIN Code" value={data.pincode} />
        </ReviewGrid>
      </ReviewSection>

      {/* Education Details */}
      <ReviewSection
        icon={<GraduationCap className="w-4 h-4" />}
        title="Education Details"
        onEdit={() => onEdit(1)}
      >
        <ReviewGrid>
          <ReviewItem label="Institution" value={data.currentInstitution} fullWidth />
          <ReviewItem label="Institution Type" value={data.institutionType?.replace("-", " ")} />
          <ReviewItem label="Class/Year" value={data.classOrYear} />
          <ReviewItem label="Field of Study" value={data.fieldOfStudy} />
          <ReviewItem label="Board/University" value={data.boardOrUniversity} />
          {isFirstYear ? (
            <>
              <ReviewItem label="10th Marks" value={data.previousMarksPercentage} />
              <ReviewItem label="Marks Type" value={data.previousMarksType} />
            </>
          ) : (
            <>
              <ReviewItem label="Current Year Marks" value={data.currentYearMarks} />
              <ReviewItem label="Marks Type" value={data.currentMarksType} />
              {data.previousScholarshipId && (
                <ReviewItem label="Previous Scholarship ID" value={data.previousScholarshipId} />
              )}
            </>
          )}
        </ReviewGrid>
      </ReviewSection>

      {/* Family Background */}
      <ReviewSection
        icon={<Users className="w-4 h-4" />}
        title="Family Background"
        onEdit={() => onEdit(2)}
      >
        <ReviewGrid>
          {(!isFirstYear && data.familyDetailsUnchanged) ? (
            <div className="col-span-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              Family details unchanged from previous year
            </div>
          ) : (
            <>
              <ReviewItem label="Guardian Name" value={data.guardianName} />
              <ReviewItem label="Relationship" value={data.guardianRelation} />
              <ReviewItem label="Guardian Phone" value={data.guardianPhone} />
              <ReviewItem label="Occupation" value={data.guardianOccupation} />
              <ReviewItem label="No. of Dependents" value={data.numberOfDependents?.toString()} />
              <ReviewItem label="Income Source" value={data.incomeSource} />
            </>
          )}
          <ReviewItem label="Annual Family Income" value={formatIncome(data.annualFamilyIncome)} />
        </ReviewGrid>
      </ReviewSection>

      {/* Documents */}
      <ReviewSection
        icon={<FileText className="w-4 h-4" />}
        title="Uploaded Documents"
        onEdit={() => onEdit(3)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isFirstYear ? (
            <>
              <DocumentBadge label="Photo" uploaded={!!data.photo} />
              <DocumentBadge label="ID Proof" uploaded={!!data.idProof} />
              <DocumentBadge label="Income Cert." uploaded={!!data.incomeCertificate} />
              <DocumentBadge label="10th Marks" uploaded={!!data.tenthMarksheet} />
            </>
          ) : (
            <>
              <DocumentBadge label="Photo" uploaded={!!data.photo} optional />
              <DocumentBadge label="Income Cert." uploaded={!!data.incomeCertificate} />
              <DocumentBadge label="Current Marks" uploaded={!!data.currentYearMarksheet} />
            </>
          )}
        </div>
      </ReviewSection>

      {/* Statement */}
      <ReviewSection
        icon={<PenLine className="w-4 h-4" />}
        title={isFirstYear ? "Statement of Purpose" : "Progress Report"}
        onEdit={() => onEdit(4)}
      >
        <div className="space-y-4">
          {isFirstYear ? (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Why do you need this scholarship?</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.whyNeedScholarship || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Educational Goals</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.educationalGoals || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Career Aspirations</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.careerAspirations || "-"}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Progress Report</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.progressReport || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Educational Goals</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.educationalGoals || "-"}</p>
              </div>
              {data.challengesFaced && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Challenges Faced</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.challengesFaced}</p>
                </div>
              )}
            </>
          )}
        </div>
      </ReviewSection>

      {/* Declaration */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <h4 className="font-medium text-orange-900 mb-2">Declaration</h4>
        <p className="text-sm text-orange-800">
          By submitting this application, I declare that all the information provided is true and correct
          to the best of my knowledge. I understand that providing false information may lead to
          disqualification from the scholarship program.
        </p>
      </div>
    </div>
  )
}

// Helper Components
function ReviewSection({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/80 hover:bg-primary/5"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function ReviewGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

function ReviewItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string
  value?: string
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 capitalize">{value || "-"}</p>
    </div>
  )
}

function DocumentBadge({
  label,
  uploaded,
  optional = false,
}: {
  label: string
  uploaded: boolean
  optional?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        uploaded
          ? "bg-green-50 text-green-700 border border-green-200"
          : optional
          ? "bg-gray-50 text-gray-500 border border-gray-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          uploaded ? "bg-green-500" : optional ? "bg-gray-400" : "bg-red-500"
        }`}
      />
      {label}
    </div>
  )
}

function formatIncome(value?: string): string {
  const labels: Record<string, string> = {
    "below-1-lakh": "Below ₹1,00,000",
    "1-2-lakh": "₹1,00,000 - ₹2,00,000",
    "2-3-lakh": "₹2,00,000 - ₹3,00,000",
    "3-5-lakh": "₹3,00,000 - ₹5,00,000",
    "above-5-lakh": "Above ₹5,00,000",
  }
  return labels[value || ""] || value || "-"
}
