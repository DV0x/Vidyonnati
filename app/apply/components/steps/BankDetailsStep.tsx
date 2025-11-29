"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { Landmark, CreditCard, Building2 } from "lucide-react"

export function BankDetailsStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Landmark className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Bank Account Details</p>
            <p className="text-xs text-blue-600 mt-1">
              Please provide your bank account details for scholarship disbursement.
              Ensure the account is in your name (the student&apos;s name).
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Number */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Account Number</span>
        </div>
        <AnimatedInput
          type="text"
          label="Bank Account Number"
          maxLength={18}
          {...register("bankAccountNumber")}
          value={watch("bankAccountNumber") || ""}
          onChange={(e) => setValue("bankAccountNumber", e.target.value.replace(/\D/g, ""), { shouldValidate: true })}
        />
        {errors.bankAccountNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber.message as string}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">9-18 digit account number</p>
      </div>

      {/* Bank Name & Branch */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Bank Details</span>
        </div>
        <AnimatedInput
          type="text"
          label="Bank Name & Branch"
          placeholder="e.g., State Bank of India, Ongole Branch"
          {...register("bankNameBranch")}
          value={watch("bankNameBranch") || ""}
          onChange={(e) => setValue("bankNameBranch", e.target.value, { shouldValidate: true })}
        />
        {errors.bankNameBranch && (
          <p className="text-red-500 text-xs mt-1">{errors.bankNameBranch.message as string}</p>
        )}
      </div>

      {/* IFSC Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            type="text"
            label="IFSC Code"
            maxLength={11}
            {...register("ifscCode")}
            value={watch("ifscCode") || ""}
            onChange={(e) => setValue("ifscCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""), { shouldValidate: true })}
          />
          {errors.ifscCode && (
            <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message as string}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">e.g., SBIN0001234</p>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> Please ensure all bank details are accurate.
          You will need to upload the first page of your bank passbook as a supporting document.
        </p>
      </div>
    </div>
  )
}
