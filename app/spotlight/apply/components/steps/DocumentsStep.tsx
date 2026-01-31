"use client"

import { useFormContext } from "react-hook-form"
import { FileUpload } from "@/app/components/FileUpload"
import { FileText, Check, Info, CheckCircle2 } from "lucide-react"

interface DocumentsStepProps {
  editMode?: boolean
  existingDocuments?: { document_type: string; file_name: string }[]
}

export function DocumentsStep({ editMode, existingDocuments = [] }: DocumentsStepProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const getExistingDoc = (docType: string) =>
    existingDocuments.find((d) => d.document_type === docType)

  const isDocAvailable = (docType: string, formField: string) =>
    !!watch(formField) || !!getExistingDoc(docType)

  return (
    <div className="space-y-6">
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
                : "Accepted formats: JPEG, PNG, PDF (Max 5MB each)"}
            </p>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Marksheet */}
        <div>
          <FileUpload
            label="Latest Marksheet"
            accept="image/jpeg,image/png,.pdf"
            maxSize={5}
            required={!editMode}
            value={watch("marksheet")}
            onChange={(file) => setValue("marksheet", file, { shouldValidate: true })}
            error={errors.marksheet?.message as string}
            description="10th, 12th, or latest semester"
          />
          <ExistingDocBadge doc={getExistingDoc("marksheet")} />
        </div>

        {/* Aadhar */}
        <div>
          <FileUpload
            label="Aadhar Card"
            accept="image/jpeg,image/png,.pdf"
            maxSize={5}
            required={!editMode}
            value={watch("aadhar")}
            onChange={(file) => setValue("aadhar", file, { shouldValidate: true })}
            error={errors.aadhar?.message as string}
            description="Front and back"
          />
          <ExistingDocBadge doc={getExistingDoc("aadhar")} />
        </div>

        {/* Income Certificate (Optional) */}
        <div className="relative">
          <FileUpload
            label="Income Certificate"
            accept="image/jpeg,image/png,.pdf"
            maxSize={5}
            required={false}
            value={watch("incomeCertificate")}
            onChange={(file) =>
              setValue("incomeCertificate", file, { shouldValidate: true })
            }
            error={errors.incomeCertificate?.message as string}
            description="If available"
          />
          <div className="absolute -top-1 -right-1">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          <ExistingDocBadge doc={getExistingDoc("income_certificate")} />
        </div>
      </div>

      {/* Note about photo */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-purple-800 font-medium">
              {editMode && getExistingDoc("photo")
                ? "Photo Previously Uploaded"
                : "Photo Already Uploaded"}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {editMode && getExistingDoc("photo")
                ? `Your photo (${getExistingDoc("photo")!.file_name}) is already on file. Go back to the first step to replace it.`
                : "Your photo was uploaded in the first step. You can go back to change it if needed."}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Document Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          <CheckItem label="Photo" checked={isDocAvailable("photo", "photo")} />
          <CheckItem label="Marksheet" checked={isDocAvailable("marksheet", "marksheet")} />
          <CheckItem label="Aadhar Card" checked={isDocAvailable("aadhar", "aadhar")} />
          <CheckItem label="Income Certificate" checked={isDocAvailable("income_certificate", "incomeCertificate")} optional />
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

function CheckItem({
  label,
  checked,
  optional,
}: {
  label: string
  checked: boolean
  optional?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          checked ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className={checked ? "text-gray-900" : "text-gray-500"}>
        {label}
        {optional && <span className="text-gray-400 text-xs ml-1">(opt)</span>}
      </span>
    </div>
  )
}
