"use client"

import { useFormContext } from "react-hook-form"
import { useEffect } from "react"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { currentStatusOptions, currentStatusLabels } from "@/lib/schemas/spotlight"
import { Calculator } from "lucide-react"

export function EducationStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const currentStatus = watch("currentStatus")
  const totalMarks = watch("totalMarks")
  const maxMarks = watch("maxMarks")

  // Auto-calculate percentage
  useEffect(() => {
    if (totalMarks && maxMarks && maxMarks > 0) {
      const percentage = (totalMarks / maxMarks) * 100
      setValue("percentage", Math.round(percentage * 100) / 100, { shouldValidate: true })
    }
  }, [totalMarks, maxMarks, setValue])

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      {/* College/Institution */}
      <div>
        <AnimatedInput
          label="College/Institution Name"
          {...register("collegeName")}
          value={watch("collegeName") || ""}
          onChange={(e) =>
            setValue("collegeName", e.target.value, { shouldValidate: true })
          }
        />
        {errors.collegeName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.collegeName.message as string}
          </p>
        )}
      </div>

      {/* Course/Stream */}
      <div>
        <AnimatedInput
          label="Course/Stream (e.g., B.Tech CSE, Intermediate MPC)"
          {...register("courseStream")}
          value={watch("courseStream") || ""}
          onChange={(e) =>
            setValue("courseStream", e.target.value, { shouldValidate: true })
          }
        />
        {errors.courseStream && (
          <p className="text-red-500 text-xs mt-1">
            {errors.courseStream.message as string}
          </p>
        )}
      </div>

      {/* Year of Completion & Current Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Select
              value={watch("yearOfCompletion")?.toString()}
              onValueChange={(value) =>
                setValue("yearOfCompletion", parseInt(value), { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => currentYear - 5 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label
              className={`absolute left-3 pointer-events-none transition-all ${
                watch("yearOfCompletion")
                  ? "top-2 text-xs text-gray-500"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              Year of Completion
            </label>
          </div>
          {errors.yearOfCompletion && (
            <p className="text-red-500 text-xs mt-1">
              {errors.yearOfCompletion.message as string}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <Select
              value={currentStatus}
              onValueChange={(value) =>
                setValue("currentStatus", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {currentStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {currentStatusLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label
              className={`absolute left-3 pointer-events-none transition-all ${
                currentStatus
                  ? "top-2 text-xs text-gray-500"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              Current Status
            </label>
          </div>
          {errors.currentStatus && (
            <p className="text-red-500 text-xs mt-1">
              {errors.currentStatus.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Marks Section */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">Academic Marks</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <AnimatedInput
              type="number"
              label="Total Marks"
              {...register("totalMarks", { valueAsNumber: true })}
              value={watch("totalMarks") || ""}
              onChange={(e) =>
                setValue("totalMarks", e.target.value ? Number(e.target.value) : undefined, {
                  shouldValidate: true,
                })
              }
            />
            {errors.totalMarks && (
              <p className="text-red-500 text-xs mt-1">
                {errors.totalMarks.message as string}
              </p>
            )}
          </div>

          <div>
            <AnimatedInput
              type="number"
              label="Max Marks"
              {...register("maxMarks", { valueAsNumber: true })}
              value={watch("maxMarks") || ""}
              onChange={(e) =>
                setValue("maxMarks", e.target.value ? Number(e.target.value) : undefined, {
                  shouldValidate: true,
                })
              }
            />
            {errors.maxMarks && (
              <p className="text-red-500 text-xs mt-1">
                {errors.maxMarks.message as string}
              </p>
            )}
          </div>

          <div>
            <AnimatedInput
              type="number"
              label="Percentage"
              step="0.01"
              {...register("percentage", { valueAsNumber: true })}
              value={watch("percentage") || ""}
              onChange={(e) =>
                setValue("percentage", e.target.value ? Number(e.target.value) : undefined, {
                  shouldValidate: true,
                })
              }
              readOnly
              className="bg-gray-50"
            />
            {errors.percentage && (
              <p className="text-red-500 text-xs mt-1">
                {errors.percentage.message as string}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-purple-600 mt-2">
          Enter your most recent academic marks (10th, 12th, or latest semester)
        </p>
      </div>
    </div>
  )
}
