"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { AnimatedTextarea } from "@/app/components/AnimatedTextarea"
import { PenLine, Target, Heart, IndianRupee } from "lucide-react"

export function StoryGoalsStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const backgroundStory = watch("backgroundStory") || ""
  const dreamsGoals = watch("dreamsGoals") || ""
  const howHelpChangesLife = watch("howHelpChangesLife") || ""

  return (
    <div className="space-y-6">
      {/* Info Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-start gap-3">
          <PenLine className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-800">Share Your Story</p>
            <p className="text-xs text-purple-600 mt-1">
              This is your opportunity to tell potential donors about yourself.
              Be authentic and share what makes your journey unique.
            </p>
          </div>
        </div>
      </div>

      {/* Background Story */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <label className="text-sm font-medium text-gray-700">
            Your Background Story <span className="text-red-500">*</span>
          </label>
        </div>
        <AnimatedTextarea
          label="Tell us about yourself, your family, and the challenges you've faced..."
          maxLength={2000}
          value={backgroundStory}
          onChange={(e) =>
            setValue("backgroundStory", e.target.value, { shouldValidate: true })
          }
          className="min-h-[150px]"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Min 100 characters</p>
          <p
            className={`text-xs ${
              backgroundStory.length < 100 ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {backgroundStory.length}/2000
          </p>
        </div>
        {errors.backgroundStory && (
          <p className="text-red-500 text-xs mt-1">
            {errors.backgroundStory.message as string}
          </p>
        )}
      </div>

      {/* Dreams & Goals */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-purple-500" />
          <label className="text-sm font-medium text-gray-700">
            Your Dreams & Goals <span className="text-red-500">*</span>
          </label>
        </div>
        <AnimatedTextarea
          label="What are your aspirations? What do you want to achieve through education?"
          maxLength={2000}
          value={dreamsGoals}
          onChange={(e) =>
            setValue("dreamsGoals", e.target.value, { shouldValidate: true })
          }
          className="min-h-[150px]"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Min 100 characters</p>
          <p
            className={`text-xs ${
              dreamsGoals.length < 100 ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {dreamsGoals.length}/2000
          </p>
        </div>
        {errors.dreamsGoals && (
          <p className="text-red-500 text-xs mt-1">
            {errors.dreamsGoals.message as string}
          </p>
        )}
      </div>

      {/* How Help Changes Life */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-red-500" />
          <label className="text-sm font-medium text-gray-700">
            How Will This Help Change Your Life? <span className="text-red-500">*</span>
          </label>
        </div>
        <AnimatedTextarea
          label="Describe how financial support would help you achieve your goals..."
          maxLength={1000}
          value={howHelpChangesLife}
          onChange={(e) =>
            setValue("howHelpChangesLife", e.target.value, { shouldValidate: true })
          }
          className="min-h-[100px]"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Min 50 characters</p>
          <p
            className={`text-xs ${
              howHelpChangesLife.length < 50 ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {howHelpChangesLife.length}/1000
          </p>
        </div>
        {errors.howHelpChangesLife && (
          <p className="text-red-500 text-xs mt-1">
            {errors.howHelpChangesLife.message as string}
          </p>
        )}
      </div>

      {/* Annual Financial Need */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="w-4 h-4 text-green-600" />
          <label className="text-sm font-medium text-gray-700">
            Annual Financial Need <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="max-w-xs">
          <AnimatedInput
            type="number"
            label="Amount in Rupees (e.g., 50000)"
            {...register("annualFinancialNeed", { valueAsNumber: true })}
            value={watch("annualFinancialNeed") || ""}
            onChange={(e) =>
              setValue(
                "annualFinancialNeed",
                e.target.value ? Number(e.target.value) : undefined,
                { shouldValidate: true }
              )
            }
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter the amount you need annually for your education (fees, books,
          accommodation, etc.)
        </p>
        {errors.annualFinancialNeed && (
          <p className="text-red-500 text-xs mt-1">
            {errors.annualFinancialNeed.message as string}
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm font-medium text-blue-800 mb-2">Writing Tips</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>- Be specific about your challenges and achievements</li>
          <li>- Share personal anecdotes that illustrate your determination</li>
          <li>- Explain clearly how education will help you and your family</li>
          <li>- Be honest and authentic in your writing</li>
        </ul>
      </div>
    </div>
  )
}
