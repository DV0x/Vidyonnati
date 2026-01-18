"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedTextarea } from "@/app/components/AnimatedTextarea"
import { circumstanceOptions, circumstanceLabels } from "@/lib/schemas/spotlight"
import { Checkbox } from "@/components/ui/checkbox"
import { HeartHandshake, AlertCircle } from "lucide-react"

export function CircumstancesStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const circumstances = watch("circumstances") || []
  const showOtherField = circumstances.includes("other")

  const handleCircumstanceToggle = (option: string) => {
    const current = circumstances as string[]
    if (current.includes(option)) {
      setValue(
        "circumstances",
        current.filter((c) => c !== option),
        { shouldValidate: true }
      )
    } else {
      setValue("circumstances", [...current, option], { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <HeartHandshake className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-purple-800">
            Tell Us About Your Circumstances
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Select all that apply to help donors understand your situation better.
            This information helps us connect you with the right support.
          </p>
        </div>
      </div>

      {/* Circumstances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {circumstanceOptions.map((option) => (
          <div
            key={option}
            className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              circumstances.includes(option)
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
            }`}
            onClick={() => handleCircumstanceToggle(option)}
          >
            <Checkbox
              checked={circumstances.includes(option)}
              onCheckedChange={() => handleCircumstanceToggle(option)}
              className="mt-0.5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-medium ${
                  circumstances.includes(option)
                    ? "text-purple-800"
                    : "text-gray-700"
                }`}
              >
                {circumstanceLabels[option]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {errors.circumstances && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errors.circumstances.message as string}</span>
        </div>
      )}

      {/* Other Text Field */}
      {showOtherField && (
        <div>
          <AnimatedTextarea
            label="Please describe your other circumstances"
            maxLength={500}
            value={watch("circumstancesOther") || ""}
            onChange={(e) =>
              setValue("circumstancesOther", e.target.value, { shouldValidate: true })
            }
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
        </div>
      )}

      {/* Summary */}
      {circumstances.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Selected Circumstances</p>
          <div className="flex flex-wrap gap-2">
            {circumstances.map((c: string) => (
              <span
                key={c}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
              >
                {circumstanceLabels[c as keyof typeof circumstanceLabels]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
