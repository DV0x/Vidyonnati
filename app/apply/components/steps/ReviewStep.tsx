"use client"

import { useFormContext } from "react-hook-form"
import { ClipboardCheck, Edit2, User, GraduationCap, Users, FileText, PenLine, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type ApplicationType, incomeBracketLabels, incomeBrackets } from "@/lib/schemas/application"

interface ReviewStepProps {
  applicationType: ApplicationType
  onEdit: (step: number) => void
}

export function ReviewStep({ applicationType, onEdit }: ReviewStepProps) {
  const { watch } = useFormContext()
  const data = watch()

  const isFirstYear = applicationType === "first-year"
  const isSecondYear = applicationType === "second-year"

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
          {isSecondYear && <ReviewItem label="Gender" value={data.gender} />}
          <ReviewItem label="Village/Town" value={data.village} />
          <ReviewItem label="Mandal" value={data.mandal} />
          <ReviewItem label="District" value={data.district} />
          <ReviewItem label="PIN Code" value={data.pincode} />
          <ReviewItem label="Address" value={data.address} fullWidth />
        </ReviewGrid>
      </ReviewSection>

      {/* Family Details */}
      <ReviewSection
        icon={<Users className="w-4 h-4" />}
        title="Family Details"
        onEdit={() => onEdit(1)}
      >
        <ReviewGrid>
          {isFirstYear ? (
            <>
              <ReviewItem label="Mother's Name" value={data.motherName} />
              <ReviewItem label="Father's Name" value={data.fatherName} />
              {data.guardianName && <ReviewItem label="Guardian Name" value={data.guardianName} />}
              {data.guardianRelationship && <ReviewItem label="Guardian Relationship" value={data.guardianRelationship} />}
            </>
          ) : (
            <>
              <ReviewItem label="Mother's Name" value={data.motherName} />
              <ReviewItem label="Mother's Occupation" value={data.motherOccupation} />
              <ReviewItem label="Mother's Mobile" value={data.motherMobile} />
              <ReviewItem label="Father's Name" value={data.fatherName} />
              <ReviewItem label="Father's Occupation" value={data.fatherOccupation} />
              <ReviewItem label="Father's Mobile" value={data.fatherMobile} />
              {data.guardianDetails && <ReviewItem label="Guardian Details" value={data.guardianDetails} fullWidth />}
              <ReviewItem label="Family Adults" value={data.familyAdultsCount?.toString()} />
              <ReviewItem label="Family Children" value={data.familyChildrenCount?.toString()} />
              <ReviewItem label="Annual Family Income" value={data.annualFamilyIncome ? incomeBracketLabels[data.annualFamilyIncome as typeof incomeBrackets[number]] : "-"} />
            </>
          )}
        </ReviewGrid>
      </ReviewSection>

      {/* Education Details */}
      <ReviewSection
        icon={<GraduationCap className="w-4 h-4" />}
        title="Education Details"
        onEdit={() => onEdit(2)}
      >
        <ReviewGrid>
          <ReviewItem label="High School Studied" value={data.highSchoolStudied} fullWidth />
          <ReviewItem label="SSC Marks" value={`${data.sscTotalMarks || '-'}/${data.sscMaxMarks || '-'}`} />
          <ReviewItem label="SSC Percentage" value={data.sscPercentage ? `${data.sscPercentage}%` : '-'} />

          {isFirstYear ? (
            <>
              <ReviewItem label="College Admitted" value={data.collegeAdmitted} fullWidth />
              <ReviewItem label="College Address" value={data.collegeAddress} fullWidth />
              <ReviewItem label="Course Joined" value={data.courseJoined} />
              <ReviewItem label="Group/Subjects" value={data.groupSubjects} />
              <ReviewItem label="Date of Admission" value={data.dateOfAdmission} />
            </>
          ) : (
            <>
              <ReviewItem label="Current College" value={data.currentCollege} fullWidth />
              <ReviewItem label="College Address" value={data.collegeAddress} fullWidth />
              <ReviewItem label="Course Studying" value={data.courseStudying} />
              <ReviewItem label="Group/Subjects" value={data.groupSubjects} />
              <ReviewItem label="1st Year Marks" value={`${data.firstYearTotalMarks || '-'}/${data.firstYearMaxMarks || '-'}`} />
              <ReviewItem label="1st Year Percentage" value={data.firstYearPercentage ? `${data.firstYearPercentage}%` : '-'} />
            </>
          )}
        </ReviewGrid>
      </ReviewSection>

      {/* Bank Details */}
      <ReviewSection
        icon={<Landmark className="w-4 h-4" />}
        title="Bank Details"
        onEdit={() => onEdit(3)}
      >
        <ReviewGrid>
          <ReviewItem label="Account Number" value={data.bankAccountNumber} />
          <ReviewItem label="Bank & Branch" value={data.bankNameBranch} />
          <ReviewItem label="IFSC Code" value={data.ifscCode} />
        </ReviewGrid>
      </ReviewSection>

      {/* Documents */}
      <ReviewSection
        icon={<FileText className="w-4 h-4" />}
        title="Uploaded Documents"
        onEdit={() => onEdit(4)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isFirstYear ? (
            <>
              <DocumentBadge label="SSC Marksheet" uploaded={!!data.sscMarksheet} />
              <DocumentBadge label="Student Aadhar" uploaded={!!data.aadharStudent} />
              <DocumentBadge label="Parent Aadhar" uploaded={!!data.aadharParent} />
              <DocumentBadge label="Bonafide" uploaded={!!data.bonafideCertificate} />
              <DocumentBadge label="Bank Passbook" uploaded={!!data.bankPassbook} />
            </>
          ) : (
            <>
              <DocumentBadge label="Student Aadhar" uploaded={!!data.aadharStudent} />
              <DocumentBadge label="Parent Aadhar" uploaded={!!data.aadharParent} />
              <DocumentBadge label="Bank Passbook" uploaded={!!data.bankPassbook} />
              <DocumentBadge label="Bonafide" uploaded={!!data.bonafideCertificate} />
              <DocumentBadge label="1st Year Marks" uploaded={!!data.firstYearMarksheet} />
              <DocumentBadge label="Mango Plant" uploaded={!!data.mangoPlantPhoto} optional />
            </>
          )}
        </div>
      </ReviewSection>

      {/* Essays (2nd Year Only) */}
      {isSecondYear && (
        <ReviewSection
          icon={<PenLine className="w-4 h-4" />}
          title="Progress Report & Goals"
          onEdit={() => onEdit(4)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Study & Extra-curricular Activities</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.studyActivities || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Goals, Dreams & Plan of Action</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.goalsDreams || "-"}</p>
            </div>
            {data.additionalInfo && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Additional Information</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{data.additionalInfo}</p>
              </div>
            )}
          </div>
        </ReviewSection>
      )}

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
