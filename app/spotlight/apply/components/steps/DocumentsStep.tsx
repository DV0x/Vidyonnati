"use client"

import { useFormContext } from "react-hook-form"
import { FileUpload } from "@/app/components/FileUpload"
import { FileText, Check, Info } from "lucide-react"

export function DocumentsStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Required Documents</p>
            <p className="text-xs text-blue-600 mt-1">
              Accepted formats: JPEG, PNG, PDF (Max 5MB each)
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
            required
            value={watch("marksheet")}
            onChange={(file) => setValue("marksheet", file, { shouldValidate: true })}
            error={errors.marksheet?.message as string}
            description="10th, 12th, or latest semester"
          />
        </div>

        {/* Aadhar */}
        <div>
          <FileUpload
            label="Aadhar Card"
            accept="image/jpeg,image/png,.pdf"
            maxSize={5}
            required
            value={watch("aadhar")}
            onChange={(file) => setValue("aadhar", file, { shouldValidate: true })}
            error={errors.aadhar?.message as string}
            description="Front and back"
          />
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
        </div>
      </div>

      {/* Note about photo */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-purple-800 font-medium">Photo Already Uploaded</p>
            <p className="text-xs text-purple-600 mt-1">
              Your photo was uploaded in the first step. You can go back to change it
              if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Document Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          <CheckItem label="Photo" checked={!!watch("photo")} />
          <CheckItem label="Marksheet" checked={!!watch("marksheet")} />
          <CheckItem label="Aadhar Card" checked={!!watch("aadhar")} />
          <CheckItem label="Income Certificate" checked={!!watch("incomeCertificate")} optional />
        </div>
      </div>
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
