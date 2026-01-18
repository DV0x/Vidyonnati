"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Trophy, Info } from "lucide-react"

export function CompetitiveExamsStep() {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "competitiveExams",
  })

  const addExam = () => {
    append({ exam: "", score: "", rank: undefined, percentile: undefined })
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Optional Section</p>
            <p className="text-xs text-blue-600 mt-1">
              If you have appeared for any competitive exams (JEE, NEET, EAMCET, etc.),
              add them here. This helps showcase your academic potential.
            </p>
          </div>
        </div>
      </div>

      {/* Exam List */}
      {fields.length > 0 ? (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-xl p-4 relative"
            >
              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Exam #{index + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exam Name */}
                <div className="sm:col-span-2">
                  <AnimatedInput
                    label="Exam Name (e.g., JEE Main, EAMCET)"
                    {...register(`competitiveExams.${index}.exam`)}
                    value={watch(`competitiveExams.${index}.exam`) || ""}
                    onChange={(e) =>
                      setValue(`competitiveExams.${index}.exam`, e.target.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {(errors.competitiveExams as Record<number, { exam?: { message?: string } }>)?.[index]?.exam && (
                    <p className="text-red-500 text-xs mt-1">
                      {(errors.competitiveExams as Record<number, { exam?: { message?: string } }>)[index]?.exam?.message}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div>
                  <AnimatedInput
                    label="Score/Marks (Optional)"
                    {...register(`competitiveExams.${index}.score`)}
                    value={watch(`competitiveExams.${index}.score`) || ""}
                    onChange={(e) =>
                      setValue(`competitiveExams.${index}.score`, e.target.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>

                {/* Rank */}
                <div>
                  <AnimatedInput
                    type="number"
                    label="Rank (Optional)"
                    {...register(`competitiveExams.${index}.rank`, {
                      valueAsNumber: true,
                    })}
                    value={watch(`competitiveExams.${index}.rank`) || ""}
                    onChange={(e) =>
                      setValue(
                        `competitiveExams.${index}.rank`,
                        e.target.value ? Number(e.target.value) : undefined,
                        { shouldValidate: true }
                      )
                    }
                  />
                </div>

                {/* Percentile */}
                <div>
                  <AnimatedInput
                    type="number"
                    label="Percentile (Optional)"
                    step="0.01"
                    {...register(`competitiveExams.${index}.percentile`, {
                      valueAsNumber: true,
                    })}
                    value={watch(`competitiveExams.${index}.percentile`) || ""}
                    onChange={(e) =>
                      setValue(
                        `competitiveExams.${index}.percentile`,
                        e.target.value ? Number(e.target.value) : undefined,
                        { shouldValidate: true }
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No competitive exams added yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Click the button below to add your exam details
          </p>
        </div>
      )}

      {/* Add Exam Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addExam}
        className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 rounded-xl py-6"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Competitive Exam
      </Button>

      {/* Skip Info */}
      <p className="text-xs text-gray-500 text-center">
        You can skip this step if you haven&apos;t appeared for any competitive exams
      </p>
    </div>
  )
}
