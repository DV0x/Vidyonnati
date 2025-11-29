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
import { type ApplicationType, incomeBrackets, incomeBracketLabels } from "@/lib/schemas/application"
import { Users, User, Info, IndianRupee } from "lucide-react"

interface FamilyBackgroundStepProps {
  applicationType: ApplicationType
}

export function FamilyBackgroundStep({ applicationType }: FamilyBackgroundStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"
  const isSecondYear = applicationType === "second-year"

  return (
    <div className="space-y-6">
      {/* Mother's Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <User className="w-4 h-4 text-pink-500" />
          <h3 className="text-sm font-medium text-gray-700">Mother&apos;s Details</h3>
        </div>

        {isFirstYear ? (
          /* First Year: Just name */
          <div>
            <AnimatedInput
              label="Mother's Full Name"
              {...register("motherName")}
              value={watch("motherName") || ""}
              onChange={(e) => setValue("motherName", e.target.value, { shouldValidate: true })}
            />
            {errors.motherName && (
              <p className="text-red-500 text-xs mt-1">{errors.motherName.message as string}</p>
            )}
          </div>
        ) : (
          /* Second Year: Name, Occupation, Mobile */
          <>
            <div>
              <AnimatedInput
                label="Mother's Full Name"
                {...register("motherName")}
                value={watch("motherName") || ""}
                onChange={(e) => setValue("motherName", e.target.value, { shouldValidate: true })}
              />
              {errors.motherName && (
                <p className="text-red-500 text-xs mt-1">{errors.motherName.message as string}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  label="Mother's Occupation"
                  placeholder="e.g., Housewife, Teacher"
                  {...register("motherOccupation")}
                  value={watch("motherOccupation") || ""}
                  onChange={(e) => setValue("motherOccupation", e.target.value, { shouldValidate: true })}
                />
                {errors.motherOccupation && (
                  <p className="text-red-500 text-xs mt-1">{errors.motherOccupation.message as string}</p>
                )}
              </div>
              <div>
                <AnimatedInput
                  type="tel"
                  label="Mother's Mobile Number"
                  {...register("motherMobile")}
                  value={watch("motherMobile") || ""}
                  onChange={(e) => setValue("motherMobile", e.target.value, { shouldValidate: true })}
                />
                {errors.motherMobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.motherMobile.message as string}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Father's Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <User className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-700">Father&apos;s Details</h3>
        </div>

        {isFirstYear ? (
          /* First Year: Just name */
          <div>
            <AnimatedInput
              label="Father's Full Name"
              {...register("fatherName")}
              value={watch("fatherName") || ""}
              onChange={(e) => setValue("fatherName", e.target.value, { shouldValidate: true })}
            />
            {errors.fatherName && (
              <p className="text-red-500 text-xs mt-1">{errors.fatherName.message as string}</p>
            )}
          </div>
        ) : (
          /* Second Year: Name, Occupation, Mobile */
          <>
            <div>
              <AnimatedInput
                label="Father's Full Name"
                {...register("fatherName")}
                value={watch("fatherName") || ""}
                onChange={(e) => setValue("fatherName", e.target.value, { shouldValidate: true })}
              />
              {errors.fatherName && (
                <p className="text-red-500 text-xs mt-1">{errors.fatherName.message as string}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  label="Father's Occupation"
                  placeholder="e.g., Farmer, Driver"
                  {...register("fatherOccupation")}
                  value={watch("fatherOccupation") || ""}
                  onChange={(e) => setValue("fatherOccupation", e.target.value, { shouldValidate: true })}
                />
                {errors.fatherOccupation && (
                  <p className="text-red-500 text-xs mt-1">{errors.fatherOccupation.message as string}</p>
                )}
              </div>
              <div>
                <AnimatedInput
                  type="tel"
                  label="Father's Mobile Number"
                  {...register("fatherMobile")}
                  value={watch("fatherMobile") || ""}
                  onChange={(e) => setValue("fatherMobile", e.target.value, { shouldValidate: true })}
                />
                {errors.fatherMobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.fatherMobile.message as string}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Guardian Details (Optional) */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-600">
            Guardian Details <span className="text-xs text-gray-400">(if parents are not alive)</span>
          </p>
        </div>

        {isFirstYear ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <AnimatedInput
                label="Guardian's Name (Optional)"
                {...register("guardianName")}
                value={watch("guardianName") || ""}
                onChange={(e) => setValue("guardianName", e.target.value, { shouldValidate: true })}
              />
              {errors.guardianName && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianName.message as string}</p>
              )}
            </div>
            <div>
              <AnimatedInput
                label="Relationship (Optional)"
                placeholder="e.g., Uncle, Grandfather"
                {...register("guardianRelationship")}
                value={watch("guardianRelationship") || ""}
                onChange={(e) => setValue("guardianRelationship", e.target.value, { shouldValidate: true })}
              />
              {errors.guardianRelationship && (
                <p className="text-red-500 text-xs mt-1">{errors.guardianRelationship.message as string}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <AnimatedInput
              label="Guardian Details (Optional)"
              placeholder="Name, relationship, and contact if applicable"
              {...register("guardianDetails")}
              value={watch("guardianDetails") || ""}
              onChange={(e) => setValue("guardianDetails", e.target.value, { shouldValidate: true })}
            />
            {errors.guardianDetails && (
              <p className="text-red-500 text-xs mt-1">{errors.guardianDetails.message as string}</p>
            )}
          </div>
        )}
      </div>

      {/* Second Year Only: Family Members & Income */}
      {isSecondYear && (
        <>
          {/* Family Members Count */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Users className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-700">Family Members</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  type="number"
                  label="Number of Adults"
                  min={1}
                  max={20}
                  value={watch("familyAdultsCount") ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : parseInt(e.target.value)
                    setValue("familyAdultsCount", Number.isNaN(val) ? undefined : val, { shouldValidate: true })
                  }}
                />
                {errors.familyAdultsCount && (
                  <p className="text-red-500 text-xs mt-1">{errors.familyAdultsCount.message as string}</p>
                )}
              </div>
              <div>
                <AnimatedInput
                  type="number"
                  label="Number of Children"
                  min={0}
                  max={15}
                  value={watch("familyChildrenCount") ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseInt(e.target.value)
                    setValue("familyChildrenCount", Number.isNaN(val) ? 0 : val, { shouldValidate: true })
                  }}
                />
                {errors.familyChildrenCount && (
                  <p className="text-red-500 text-xs mt-1">{errors.familyChildrenCount.message as string}</p>
                )}
              </div>
            </div>
          </div>

          {/* Annual Family Income */}
          <div className="bg-orange-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-orange-600" />
              <p className="text-sm font-medium text-gray-700">
                Annual Family Income (Approx.)
              </p>
            </div>
            <div>
              <div className="relative">
                <Select
                  value={watch("annualFamilyIncome") || ""}
                  onValueChange={(value) => setValue("annualFamilyIncome", value, { shouldValidate: true })}
                >
                  <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg bg-white">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeBrackets.map((bracket) => (
                      <SelectItem key={bracket} value={bracket}>
                        {incomeBracketLabels[bracket]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className={`absolute left-3 pointer-events-none transition-all ${
                  watch("annualFamilyIncome") ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
                }`}>
                  Select Income Range
                </label>
              </div>
              {errors.annualFamilyIncome && (
                <p className="text-red-500 text-xs mt-1">{errors.annualFamilyIncome.message as string}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
