"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  ClipboardCheck,
  Edit2,
  User,
  GraduationCap,
  Trophy,
  Users,
  HeartHandshake,
  PenLine,
  FileText,
  IndianRupee,
} from "lucide-react"
import {
  parentStatusLabels,
  currentStatusLabels,
  circumstanceLabels,
  incomeBracketLabels,
  incomeBrackets,
} from "@/lib/schemas/spotlight"

interface ReviewStepProps {
  onEdit: (step: number) => void
}

export function ReviewStep({ onEdit }: ReviewStepProps) {
  const { watch } = useFormContext()
  const data = watch()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <ClipboardCheck className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Review Your Application
          </h2>
          <p className="text-sm text-gray-500">
            Please review all the information before submitting
          </p>
        </div>
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
          <ReviewItem label="Gender" value={data.gender} />
          <ReviewItem label="Village/Town" value={data.village} />
          <ReviewItem label="Mandal" value={data.mandal} />
          <ReviewItem label="District" value={data.district} />
          <ReviewItem label="State" value={data.state} />
          <ReviewItem label="PIN Code" value={data.pincode} />
        </ReviewGrid>
        {data.photo && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Photo</p>
            <DocumentBadge label="Photo Uploaded" uploaded={true} />
          </div>
        )}
      </ReviewSection>

      {/* Education */}
      <ReviewSection
        icon={<GraduationCap className="w-4 h-4" />}
        title="Education Details"
        onEdit={() => onEdit(1)}
      >
        <ReviewGrid>
          <ReviewItem label="College/Institution" value={data.collegeName} fullWidth />
          <ReviewItem label="Course/Stream" value={data.courseStream} />
          <ReviewItem label="Year of Completion" value={data.yearOfCompletion?.toString()} />
          <ReviewItem
            label="Marks"
            value={`${data.totalMarks || "-"}/${data.maxMarks || "-"}`}
          />
          <ReviewItem
            label="Percentage"
            value={data.percentage ? `${data.percentage}%` : "-"}
          />
          <ReviewItem
            label="Current Status"
            value={
              data.currentStatus
                ? currentStatusLabels[data.currentStatus as keyof typeof currentStatusLabels]
                : "-"
            }
          />
        </ReviewGrid>
      </ReviewSection>

      {/* Competitive Exams */}
      <ReviewSection
        icon={<Trophy className="w-4 h-4" />}
        title="Competitive Exams"
        onEdit={() => onEdit(2)}
      >
        {data.competitiveExams && data.competitiveExams.length > 0 ? (
          <div className="space-y-3">
            {data.competitiveExams.map((exam: {
              exam: string
              score?: string
              rank?: number
              percentile?: number
            }, index: number) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100"
              >
                <p className="font-medium text-gray-900 text-sm">{exam.exam}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-600">
                  {exam.score && <span>Score: {exam.score}</span>}
                  {exam.rank && <span>Rank: {exam.rank}</span>}
                  {exam.percentile && <span>Percentile: {exam.percentile}%</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No competitive exams added</p>
        )}
      </ReviewSection>

      {/* Family Background */}
      <ReviewSection
        icon={<Users className="w-4 h-4" />}
        title="Family Background"
        onEdit={() => onEdit(3)}
      >
        <ReviewGrid>
          <ReviewItem
            label="Parent Status"
            value={
              data.parentStatus
                ? parentStatusLabels[data.parentStatus as keyof typeof parentStatusLabels]
                : "-"
            }
            fullWidth
          />
          {data.motherName && <ReviewItem label="Mother's Name" value={data.motherName} />}
          {data.motherOccupation && (
            <ReviewItem label="Mother's Occupation" value={data.motherOccupation} />
          )}
          {data.fatherName && <ReviewItem label="Father's Name" value={data.fatherName} />}
          {data.fatherOccupation && (
            <ReviewItem label="Father's Occupation" value={data.fatherOccupation} />
          )}
          {data.guardianName && (
            <ReviewItem label="Guardian's Name" value={data.guardianName} />
          )}
          {data.guardianRelationship && (
            <ReviewItem label="Guardian Relationship" value={data.guardianRelationship} />
          )}
          {data.siblingsCount !== undefined && (
            <ReviewItem label="Siblings" value={data.siblingsCount.toString()} />
          )}
          {data.annualFamilyIncome && (
            <ReviewItem
              label="Annual Family Income"
              value={incomeBracketLabels[data.annualFamilyIncome as typeof incomeBrackets[number]]}
            />
          )}
        </ReviewGrid>
      </ReviewSection>

      {/* Circumstances */}
      <ReviewSection
        icon={<HeartHandshake className="w-4 h-4" />}
        title="Circumstances"
        onEdit={() => onEdit(4)}
      >
        {data.circumstances && data.circumstances.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.circumstances.map((c: string) => (
              <span
                key={c}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
              >
                {circumstanceLabels[c as keyof typeof circumstanceLabels]}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No circumstances selected</p>
        )}
        {data.circumstancesOther && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Other Details</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {data.circumstancesOther}
            </p>
          </div>
        )}
      </ReviewSection>

      {/* Story & Goals */}
      <ReviewSection
        icon={<PenLine className="w-4 h-4" />}
        title="Story & Goals"
        onEdit={() => onEdit(5)}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Background Story</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {data.backgroundStory || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Dreams & Goals</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {data.dreamsGoals || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              How Help Changes Life
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {data.howHelpChangesLife || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
            <IndianRupee className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Annual Financial Need:{" "}
              {data.annualFinancialNeed
                ? `₹${data.annualFinancialNeed.toLocaleString("en-IN")}`
                : "-"}
            </span>
          </div>
        </div>
      </ReviewSection>

      {/* Documents */}
      <ReviewSection
        icon={<FileText className="w-4 h-4" />}
        title="Uploaded Documents"
        onEdit={() => onEdit(6)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DocumentBadge label="Photo" uploaded={!!data.photo} />
          <DocumentBadge label="Marksheet" uploaded={!!data.marksheet} />
          <DocumentBadge label="Aadhar" uploaded={!!data.aadhar} />
          <DocumentBadge
            label="Income Cert."
            uploaded={!!data.incomeCertificate}
            optional
          />
        </div>
      </ReviewSection>

      {/* Declaration */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h4 className="font-medium text-purple-900 mb-2">Declaration</h4>
        <p className="text-sm text-purple-800">
          By submitting this application, I declare that all the information provided
          is true and correct to the best of my knowledge. I understand that providing
          false information may lead to disqualification from the Spotlight program.
          I consent to my story and photo being displayed on the Vidyonnati website
          to connect with potential donors.
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
          <span className="text-purple-600">{icon}</span>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
