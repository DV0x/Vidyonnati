"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedTextarea } from "@/app/components/AnimatedTextarea"
import { type ApplicationType } from "@/lib/schemas/application"

interface StatementStepProps {
  applicationType: ApplicationType
}

export function StatementStep({ applicationType }: StatementStepProps) {
  const { setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"

  return (
    <div className="space-y-5">
      {/* First Year: Why need scholarship */}
      {isFirstYear ? (
        <div>
          <AnimatedTextarea
            label="Why do you need this scholarship?"
            maxLength={1000}
            value={watch("whyNeedScholarship")}
            onChange={(e) => setValue("whyNeedScholarship", e.target.value, { shouldValidate: true })}
            className="min-h-[120px]"
          />
          {errors.whyNeedScholarship && (
            <p className="text-red-500 text-xs mt-1">{errors.whyNeedScholarship.message as string}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Min 100 characters</p>
        </div>
      ) : (
        <div>
          <AnimatedTextarea
            label="Your progress this year"
            maxLength={1000}
            value={watch("progressReport")}
            onChange={(e) => setValue("progressReport", e.target.value, { shouldValidate: true })}
            className="min-h-[120px]"
          />
          {errors.progressReport && (
            <p className="text-red-500 text-xs mt-1">{errors.progressReport.message as string}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Min 100 characters</p>
        </div>
      )}

      {/* Educational Goals - Both */}
      <div>
        <AnimatedTextarea
          label={isFirstYear ? "Your educational goals" : "Updated educational goals"}
          maxLength={500}
          value={watch("educationalGoals")}
          onChange={(e) => setValue("educationalGoals", e.target.value, { shouldValidate: true })}
          className="min-h-[100px]"
        />
        {errors.educationalGoals && (
          <p className="text-red-500 text-xs mt-1">{errors.educationalGoals.message as string}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Min 50 characters</p>
      </div>

      {/* First Year: Career Aspirations */}
      {isFirstYear && (
        <div>
          <AnimatedTextarea
            label="Career aspirations"
            maxLength={500}
            value={watch("careerAspirations")}
            onChange={(e) => setValue("careerAspirations", e.target.value, { shouldValidate: true })}
            className="min-h-[100px]"
          />
          {errors.careerAspirations && (
            <p className="text-red-500 text-xs mt-1">{errors.careerAspirations.message as string}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Min 50 characters</p>
        </div>
      )}

      {/* Second Year: Challenges (Optional) */}
      {!isFirstYear && (
        <div>
          <AnimatedTextarea
            label="Challenges faced (optional)"
            maxLength={500}
            value={watch("challengesFaced")}
            onChange={(e) => setValue("challengesFaced", e.target.value, { shouldValidate: true })}
            className="min-h-[80px]"
          />
          {errors.challengesFaced && (
            <p className="text-red-500 text-xs mt-1">{errors.challengesFaced.message as string}</p>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-primary/5 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Tips</p>
        <ul className="space-y-1 text-xs">
          <li>• Be honest and specific</li>
          <li>• Mention specific goals and timelines</li>
          <li>• Proofread before submitting</li>
        </ul>
      </div>
    </div>
  )
}
