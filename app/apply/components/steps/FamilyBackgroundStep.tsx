"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { type ApplicationType, guardianRelations } from "@/lib/schemas/application"

interface FamilyBackgroundStepProps {
  applicationType: ApplicationType
}

const incomeRanges = [
  { value: "below-1-lakh", label: "Below ₹1,00,000" },
  { value: "1-2-lakh", label: "₹1,00,000 - ₹2,00,000" },
  { value: "2-3-lakh", label: "₹2,00,000 - ₹3,00,000" },
  { value: "3-5-lakh", label: "₹3,00,000 - ₹5,00,000" },
  { value: "above-5-lakh", label: "Above ₹5,00,000" },
]

const relationLabels: Record<string, string> = {
  father: "Father",
  mother: "Mother",
  guardian: "Guardian",
  other: "Other",
}

export function FamilyBackgroundStep({ applicationType }: FamilyBackgroundStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"
  const familyDetailsUnchanged = watch("familyDetailsUnchanged")
  const guardianRelation = watch("guardianRelation")
  const annualFamilyIncome = watch("annualFamilyIncome")

  const showFullForm = isFirstYear || !familyDetailsUnchanged

  return (
    <div className="space-y-4">
      {/* Second Year: Unchanged checkbox */}
      {!isFirstYear && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="familyDetailsUnchanged"
              checked={familyDetailsUnchanged}
              onCheckedChange={(checked) => setValue("familyDetailsUnchanged", checked)}
              className="mt-0.5"
            />
            <div>
              <label htmlFor="familyDetailsUnchanged" className="text-sm font-medium text-blue-900 cursor-pointer">
                My family details are unchanged from last year
              </label>
              <p className="text-xs text-blue-700 mt-1">
                Check this if your guardian and family situation is the same
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Details */}
      {showFullForm && (
        <>
          {/* Guardian Name & Relation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <AnimatedInput
                label="Guardian's Full Name"
                {...register("guardianName")}
                value={watch("guardianName")}
                onChange={(e) => setValue("guardianName", e.target.value, { shouldValidate: true })}
              />
              {errors.guardianName && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianName.message as string}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <Select
                  value={guardianRelation}
                  onValueChange={(value) => setValue("guardianRelation", value, { shouldValidate: true })}
                >
                  <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {guardianRelations.map((relation) => (
                      <SelectItem key={relation} value={relation}>
                        {relationLabels[relation]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className={`absolute left-3 pointer-events-none transition-all ${
                  guardianRelation ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
                }`}>
                  Relationship
                </label>
              </div>
              {errors.guardianRelation && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianRelation.message as string}</p>
              )}
            </div>
          </div>

          {/* Guardian Phone & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <AnimatedInput
                type="tel"
                label="Guardian's Phone Number"
                {...register("guardianPhone")}
                value={watch("guardianPhone")}
                onChange={(e) => setValue("guardianPhone", e.target.value, { shouldValidate: true })}
              />
              {errors.guardianPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianPhone.message as string}</p>
              )}
            </div>
            <div>
              <AnimatedInput
                label="Guardian's Occupation"
                placeholder="e.g., Farmer, Daily Wage Worker"
                {...register("guardianOccupation")}
                value={watch("guardianOccupation")}
                onChange={(e) => setValue("guardianOccupation", e.target.value, { shouldValidate: true })}
              />
              {errors.guardianOccupation && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianOccupation.message as string}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Annual Income - Always shown */}
      <div className="bg-orange-50 rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Annual Family Income
          {!isFirstYear && (
            <span className="text-xs font-normal text-orange-600 ml-2">Required even if unchanged</span>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Select
                value={annualFamilyIncome}
                onValueChange={(value) => setValue("annualFamilyIncome", value, { shouldValidate: true })}
              >
                <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg bg-white">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {incomeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className={`absolute left-3 pointer-events-none transition-all ${
                annualFamilyIncome ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}>
                Income Range
              </label>
            </div>
            {errors.annualFamilyIncome && (
              <p className="text-red-500 text-xs mt-1">{errors.annualFamilyIncome.message as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional fields for first year */}
      {showFullForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <AnimatedInput
              type="number"
              label="Number of Family Dependents"
              min={1}
              max={15}
              {...register("numberOfDependents", { valueAsNumber: true })}
              value={watch("numberOfDependents") || ""}
              onChange={(e) => setValue("numberOfDependents", parseInt(e.target.value) || undefined, { shouldValidate: true })}
            />
            {errors.numberOfDependents && (
              <p className="text-red-500 text-xs mt-1">{errors.numberOfDependents.message as string}</p>
            )}
          </div>
          <div>
            <AnimatedInput
              label="Primary Income Source"
              placeholder="e.g., Agriculture, Small Business"
              {...register("incomeSource")}
              value={watch("incomeSource")}
              onChange={(e) => setValue("incomeSource", e.target.value, { shouldValidate: true })}
            />
            {errors.incomeSource && (
              <p className="text-red-500 text-xs mt-1">{errors.incomeSource.message as string}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
