"use client"

import { useFormContext } from "react-hook-form"
import { FileUpload } from "@/app/components/FileUpload"
import { AnimatedTextarea } from "@/app/components/AnimatedTextarea"
import { type ApplicationType } from "@/lib/schemas/application"
import { Check, FileText, Leaf, PenLine, CheckCircle2 } from "lucide-react"

interface DocumentsStepProps {
  applicationType: ApplicationType
  editMode?: boolean
  existingDocuments?: { document_type: string; file_name: string }[]
}

export function DocumentsStep({ applicationType, editMode, existingDocuments = [] }: DocumentsStepProps) {
  const { setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"
  const isSecondYear = applicationType === "second-year"

  const getExistingDoc = (docType: string) =>
    existingDocuments.find((d) => d.document_type === docType)

  const isDocAvailable = (docType: string, formField: string) =>
    !!watch(formField) || !!getExistingDoc(docType)

  return (
    <div className="space-y-6">
      {/* 2nd Year: Essays Section */}
      {isSecondYear && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <PenLine className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-700">Progress Report &amp; Goals</h3>
          </div>

          {/* Study & Extra-curricular Activities */}
          <div>
            <AnimatedTextarea
              label="How is your study and what are your extra-curricular activities?"
              maxLength={1000}
              value={watch("studyActivities") || ""}
              onChange={(e) => setValue("studyActivities", e.target.value, { shouldValidate: true })}
              className="min-h-[100px]"
            />
            {errors.studyActivities && (
              <p className="text-red-500 text-xs mt-1">{errors.studyActivities.message as string}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Min 50 characters</p>
          </div>

          {/* Goals, Dreams & Plan */}
          <div>
            <AnimatedTextarea
              label="Write about your goal, dream or wish, plan of action to achieve the same"
              maxLength={1000}
              value={watch("goalsDreams") || ""}
              onChange={(e) => setValue("goalsDreams", e.target.value, { shouldValidate: true })}
              className="min-h-[100px]"
            />
            {errors.goalsDreams && (
              <p className="text-red-500 text-xs mt-1">{errors.goalsDreams.message as string}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Min 50 characters</p>
          </div>

          {/* Additional Info (Optional) */}
          <div>
            <AnimatedTextarea
              label="Any information you wish to add and assistance sought for your further study (Optional)"
              maxLength={500}
              value={watch("additionalInfo") || ""}
              onChange={(e) => setValue("additionalInfo", e.target.value, { shouldValidate: true })}
              className="min-h-[80px]"
            />
            {errors.additionalInfo && (
              <p className="text-red-500 text-xs mt-1">{errors.additionalInfo.message as string}</p>
            )}
          </div>
        </div>
      )}
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              {editMode ? "Documents (replace only if needed)" : "Required Documents"}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {editMode
                ? "Previously uploaded documents are shown below. Upload new files only if you need to replace them."
                : "Accepted formats: JPEG, PNG, PDF (Max 5MB each, Photo max 2MB)"}
            </p>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Year Documents */}
        {isFirstYear && (
          <>
            {/* SSC Marksheet */}
            <div>
              <FileUpload
                label="SSC Marks Sheet (10th)"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("sscMarksheet")}
                onChange={(file) => setValue("sscMarksheet", file, { shouldValidate: true })}
                error={errors.sscMarksheet?.message as string}
                description="10th class marks memo"
              />
              <ExistingDocBadge doc={getExistingDoc("ssc_marksheet")} />
            </div>

            {/* Aadhar - Student */}
            <div>
              <FileUpload
                label="Aadhar Card - Student"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("aadharStudent")}
                onChange={(file) => setValue("aadharStudent", file, { shouldValidate: true })}
                error={errors.aadharStudent?.message as string}
                description="Student's Aadhar copy"
              />
              <ExistingDocBadge doc={getExistingDoc("aadhar_student")} />
            </div>

            {/* Aadhar - Parent */}
            <div>
              <FileUpload
                label="Aadhar Card - Parent/Guardian"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("aadharParent")}
                onChange={(file) => setValue("aadharParent", file, { shouldValidate: true })}
                error={errors.aadharParent?.message as string}
                description="Parent's or guardian's Aadhar"
              />
              <ExistingDocBadge doc={getExistingDoc("aadhar_parent")} />
            </div>

            {/* Bonafide Certificate */}
            <div>
              <FileUpload
                label="Proof of Admission (Bonafide)"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("bonafideCertificate")}
                onChange={(file) => setValue("bonafideCertificate", file, { shouldValidate: true })}
                error={errors.bonafideCertificate?.message as string}
                description="Study certificate from college"
              />
              <ExistingDocBadge doc={getExistingDoc("bonafide_certificate")} />
            </div>

            {/* Bank Passbook */}
            <div>
              <FileUpload
                label="Bank Passbook - First Page"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("bankPassbook")}
                onChange={(file) => setValue("bankPassbook", file, { shouldValidate: true })}
                error={errors.bankPassbook?.message as string}
                description="Page showing account details"
              />
              <ExistingDocBadge doc={getExistingDoc("bank_passbook")} />
            </div>
          </>
        )}

        {/* Second Year Documents */}
        {isSecondYear && (
          <>
            {/* Aadhar - Student */}
            <div>
              <FileUpload
                label="Aadhar Card - Student"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("aadharStudent")}
                onChange={(file) => setValue("aadharStudent", file, { shouldValidate: true })}
                error={errors.aadharStudent?.message as string}
                description="Student's Aadhar copy"
              />
              <ExistingDocBadge doc={getExistingDoc("aadhar_student")} />
            </div>

            {/* Aadhar - Parent */}
            <div>
              <FileUpload
                label="Aadhar Card - Parent/Guardian"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("aadharParent")}
                onChange={(file) => setValue("aadharParent", file, { shouldValidate: true })}
                error={errors.aadharParent?.message as string}
                description="Parent's or guardian's Aadhar"
              />
              <ExistingDocBadge doc={getExistingDoc("aadhar_parent")} />
            </div>

            {/* Bank Passbook */}
            <div>
              <FileUpload
                label="Bank Passbook - First Page"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("bankPassbook")}
                onChange={(file) => setValue("bankPassbook", file, { shouldValidate: true })}
                error={errors.bankPassbook?.message as string}
                description="Page showing account details"
              />
              <ExistingDocBadge doc={getExistingDoc("bank_passbook")} />
            </div>

            {/* Bonafide Certificate */}
            <div>
              <FileUpload
                label="Study Certificate (Bonafide)"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("bonafideCertificate")}
                onChange={(file) => setValue("bonafideCertificate", file, { shouldValidate: true })}
                error={errors.bonafideCertificate?.message as string}
                description="Current year study certificate"
              />
              <ExistingDocBadge doc={getExistingDoc("bonafide_certificate")} />
            </div>

            {/* 1st Year Marksheet */}
            <div>
              <FileUpload
                label="1st Year Marks Sheet"
                accept="image/jpeg,image/png,.pdf"
                maxSize={5}
                required={!editMode}
                value={watch("firstYearMarksheet")}
                onChange={(file) => setValue("firstYearMarksheet", file, { shouldValidate: true })}
                error={errors.firstYearMarksheet?.message as string}
                description="Previous year marks memo"
              />
              <ExistingDocBadge doc={getExistingDoc("first_year_marksheet")} />
            </div>

            {/* Mango Plant Photo (Optional) */}
            <div>
              <div className="relative">
                <FileUpload
                  label="Mango Plant Photo"
                  accept="image/jpeg,image/png"
                  maxSize={5}
                  required={false}
                  value={watch("mangoPlantPhoto")}
                  onChange={(file) => setValue("mangoPlantPhoto", file, { shouldValidate: true })}
                  error={errors.mangoPlantPhoto?.message as string}
                  description="Photo with location"
                />
                <div className="absolute -top-1 -right-1">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Optional
                  </span>
                </div>
              </div>
              <ExistingDocBadge doc={getExistingDoc("mango_plant_photo")} />
            </div>
          </>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-gray-50 rounded-xl p-4 mt-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Document Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          {isFirstYear ? (
            <>
              <CheckItem label="Student Photo" checked={isDocAvailable("student_photo", "studentPhoto")} />
              <CheckItem label="SSC Marksheet" checked={isDocAvailable("ssc_marksheet", "sscMarksheet")} />
              <CheckItem label="Student Aadhar" checked={isDocAvailable("aadhar_student", "aadharStudent")} />
              <CheckItem label="Parent Aadhar" checked={isDocAvailable("aadhar_parent", "aadharParent")} />
              <CheckItem label="Bonafide" checked={isDocAvailable("bonafide_certificate", "bonafideCertificate")} />
              <CheckItem label="Bank Passbook" checked={isDocAvailable("bank_passbook", "bankPassbook")} />
            </>
          ) : (
            <>
              <CheckItem label="Student Photo" checked={isDocAvailable("student_photo", "studentPhoto")} />
              <CheckItem label="Student Aadhar" checked={isDocAvailable("aadhar_student", "aadharStudent")} />
              <CheckItem label="Parent Aadhar" checked={isDocAvailable("aadhar_parent", "aadharParent")} />
              <CheckItem label="Bank Passbook" checked={isDocAvailable("bank_passbook", "bankPassbook")} />
              <CheckItem label="Bonafide" checked={isDocAvailable("bonafide_certificate", "bonafideCertificate")} />
              <CheckItem label="1st Year Marks" checked={isDocAvailable("first_year_marksheet", "firstYearMarksheet")} />
              <CheckItem label="Mango Plant" checked={isDocAvailable("mango_plant_photo", "mangoPlantPhoto")} optional />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ExistingDocBadge({ doc }: { doc?: { document_type: string; file_name: string } }) {
  if (!doc) return null
  return (
    <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
      <span className="text-xs text-green-700 truncate">
        Uploaded: {doc.file_name}
      </span>
    </div>
  )
}

function CheckItem({ label, checked, optional }: { label: string; checked: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checked ? "bg-green-500" : "bg-gray-200"}`}>
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className={checked ? "text-gray-900" : "text-gray-500"}>
        {label}
        {optional && <span className="text-gray-400 text-xs ml-1">(opt)</span>}
      </span>
    </div>
  )
}
