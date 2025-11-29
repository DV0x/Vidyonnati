"use client"

import { useFormContext } from "react-hook-form"
import { FileUpload } from "@/app/components/FileUpload"
import { type ApplicationType } from "@/lib/schemas/application"
import { Check } from "lucide-react"

interface DocumentsStepProps {
  applicationType: ApplicationType
}

export function DocumentsStep({ applicationType }: DocumentsStepProps) {
  const { setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="text-sm text-gray-500 mb-2">
        Accepted: JPEG, PNG, PDF (Max 5MB each)
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Photo */}
        <div>
          <FileUpload
            label="Passport Photo"
            accept="image/jpeg,image/png"
            maxSize={2}
            required={isFirstYear}
            value={watch("photo")}
            onChange={(file) => setValue("photo", file, { shouldValidate: true })}
            error={errors.photo?.message as string}
            description="White background"
          />
        </div>

        {/* ID Proof - First year only */}
        {isFirstYear && (
          <div>
            <FileUpload
              label="ID Proof"
              accept="image/jpeg,image/png,.pdf"
              maxSize={5}
              required
              value={watch("idProof")}
              onChange={(file) => setValue("idProof", file, { shouldValidate: true })}
              error={errors.idProof?.message as string}
              description="Aadhaar / Voter ID"
            />
          </div>
        )}

        {/* Income Certificate */}
        <div>
          <FileUpload
            label="Income Certificate"
            accept="image/jpeg,image/png,.pdf"
            maxSize={5}
            required
            value={watch("incomeCertificate")}
            onChange={(file) => setValue("incomeCertificate", file, { shouldValidate: true })}
            error={errors.incomeCertificate?.message as string}
            description="From tehsildar"
          />
        </div>

        {/* 10th Marksheet - First year only */}
        {isFirstYear && (
          <div>
            <FileUpload
              label="10th Marksheet"
              accept="image/jpeg,image/png,.pdf"
              maxSize={5}
              required
              value={watch("tenthMarksheet")}
              onChange={(file) => setValue("tenthMarksheet", file, { shouldValidate: true })}
              error={errors.tenthMarksheet?.message as string}
              description="Final marks memo"
            />
          </div>
        )}

        {/* Current Year Marksheet - Second year only */}
        {!isFirstYear && (
          <div>
            <FileUpload
              label="Current Year Marksheet"
              accept="image/jpeg,image/png,.pdf"
              maxSize={5}
              required
              value={watch("currentYearMarksheet")}
              onChange={(file) => setValue("currentYearMarksheet", file, { shouldValidate: true })}
              error={errors.currentYearMarksheet?.message as string}
              description="This year's marks"
            />
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-gray-50 rounded-xl p-4 mt-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          {isFirstYear ? (
            <>
              <CheckItem label="Photo" checked={!!watch("photo")} />
              <CheckItem label="ID Proof" checked={!!watch("idProof")} />
              <CheckItem label="Income Cert" checked={!!watch("incomeCertificate")} />
              <CheckItem label="10th Marks" checked={!!watch("tenthMarksheet")} />
            </>
          ) : (
            <>
              <CheckItem label="Photo" checked={!!watch("photo")} optional />
              <CheckItem label="Income Cert" checked={!!watch("incomeCertificate")} />
              <CheckItem label="Current Marks" checked={!!watch("currentYearMarksheet")} />
            </>
          )}
        </div>
      </div>
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
