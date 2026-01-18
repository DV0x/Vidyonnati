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
import {
  parentStatusOptions,
  parentStatusLabels,
  incomeBrackets,
  incomeBracketLabels,
} from "@/lib/schemas/spotlight"
import { Users, Heart, AlertCircle } from "lucide-react"

export function FamilyBackgroundStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const parentStatus = watch("parentStatus")
  const annualFamilyIncome = watch("annualFamilyIncome")

  // Determine which parent fields to show
  const showMotherFields =
    parentStatus === "both_alive" || parentStatus === "single_parent_mother"
  const showFatherFields =
    parentStatus === "both_alive" || parentStatus === "single_parent_father"
  const showGuardianFields = parentStatus === "orphan"

  return (
    <div className="space-y-6">
      {/* Parent Status */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Parent Status</span>
        </div>
        <div className="relative">
          <Select
            value={parentStatus}
            onValueChange={(value) =>
              setValue("parentStatus", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-lg">
              <SelectValue placeholder="Select your family situation" />
            </SelectTrigger>
            <SelectContent>
              {parentStatusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {parentStatusLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.parentStatus && (
          <p className="text-red-500 text-xs mt-1">
            {errors.parentStatus.message as string}
          </p>
        )}
      </div>

      {/* Mother Fields */}
      {showMotherFields && (
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-800">Mother&apos;s Details</span>
          </div>

          <div className="space-y-4">
            <div>
              <AnimatedInput
                label="Mother's Name"
                {...register("motherName")}
                value={watch("motherName") || ""}
                onChange={(e) =>
                  setValue("motherName", e.target.value, { shouldValidate: true })
                }
              />
              {errors.motherName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.motherName.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  label="Occupation (Optional)"
                  {...register("motherOccupation")}
                  value={watch("motherOccupation") || ""}
                  onChange={(e) =>
                    setValue("motherOccupation", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
              <div>
                <AnimatedInput
                  label="Health Condition (Optional)"
                  {...register("motherHealth")}
                  value={watch("motherHealth") || ""}
                  onChange={(e) =>
                    setValue("motherHealth", e.target.value, { shouldValidate: true })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Father Fields */}
      {showFatherFields && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Father&apos;s Details</span>
          </div>

          <div className="space-y-4">
            <div>
              <AnimatedInput
                label="Father's Name"
                {...register("fatherName")}
                value={watch("fatherName") || ""}
                onChange={(e) =>
                  setValue("fatherName", e.target.value, { shouldValidate: true })
                }
              />
              {errors.fatherName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fatherName.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  label="Occupation (Optional)"
                  {...register("fatherOccupation")}
                  value={watch("fatherOccupation") || ""}
                  onChange={(e) =>
                    setValue("fatherOccupation", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
              <div>
                <AnimatedInput
                  label="Health Condition (Optional)"
                  {...register("fatherHealth")}
                  value={watch("fatherHealth") || ""}
                  onChange={(e) =>
                    setValue("fatherHealth", e.target.value, { shouldValidate: true })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Fields (for orphans) */}
      {showGuardianFields && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Guardian Details
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  label="Guardian's Name"
                  {...register("guardianName")}
                  value={watch("guardianName") || ""}
                  onChange={(e) =>
                    setValue("guardianName", e.target.value, { shouldValidate: true })
                  }
                />
                {errors.guardianName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.guardianName.message as string}
                  </p>
                )}
              </div>
              <div>
                <AnimatedInput
                  label="Relationship"
                  {...register("guardianRelationship")}
                  value={watch("guardianRelationship") || ""}
                  onChange={(e) =>
                    setValue("guardianRelationship", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.guardianRelationship && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.guardianRelationship.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <AnimatedInput
                label="Additional Details (Optional)"
                {...register("guardianDetails")}
                value={watch("guardianDetails") || ""}
                onChange={(e) =>
                  setValue("guardianDetails", e.target.value, { shouldValidate: true })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Siblings & Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            type="number"
            label="Number of Siblings (Optional)"
            {...register("siblingsCount", { valueAsNumber: true })}
            value={watch("siblingsCount") || ""}
            onChange={(e) =>
              setValue(
                "siblingsCount",
                e.target.value ? Number(e.target.value) : undefined,
                { shouldValidate: true }
              )
            }
          />
        </div>

        <div>
          <div className="relative">
            <Select
              value={annualFamilyIncome}
              onValueChange={(value) =>
                setValue("annualFamilyIncome", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {incomeBrackets.map((option) => (
                  <SelectItem key={option} value={option}>
                    {incomeBracketLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label
              className={`absolute left-3 pointer-events-none transition-all ${
                annualFamilyIncome
                  ? "top-2 text-xs text-gray-500"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              Annual Family Income (Optional)
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
