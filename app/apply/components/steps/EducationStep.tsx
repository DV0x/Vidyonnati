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
import { type ApplicationType, institutionTypes } from "@/lib/schemas/application"

interface EducationStepProps {
  applicationType: ApplicationType
}

const institutionTypeLabels: Record<string, string> = {
  "school": "School (11th/12th)",
  "junior-college": "Junior College",
  "degree-college": "Degree College",
  "university": "University",
}

export function EducationStep({ applicationType }: EducationStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"
  const institutionType = watch("institutionType")
  const marksType = watch(isFirstYear ? "previousMarksType" : "currentMarksType")

  return (
    <div className="space-y-4">
      {/* Current Institution - Full width */}
      <div>
        <AnimatedInput
          label="Current Institution Name"
          {...register("currentInstitution")}
          value={watch("currentInstitution")}
          onChange={(e) => setValue("currentInstitution", e.target.value, { shouldValidate: true })}
        />
        {errors.currentInstitution && (
          <p className="text-red-500 text-xs mt-1">{errors.currentInstitution.message as string}</p>
        )}
      </div>

      {/* Institution Type & Class - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Select
              value={institutionType}
              onValueChange={(value) => setValue("institutionType", value, { shouldValidate: true })}
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {institutionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {institutionTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className={`absolute left-3 pointer-events-none transition-all ${
              institutionType ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
            }`}>
              Institution Type
            </label>
          </div>
          {errors.institutionType && (
            <p className="text-red-500 text-xs mt-1">{errors.institutionType.message as string}</p>
          )}
        </div>
        <div>
          <AnimatedInput
            label={isFirstYear ? "Class/Year Entering" : "Current Class/Year"}
            placeholder="e.g., 11th, 1st Year B.Tech"
            {...register("classOrYear")}
            value={watch("classOrYear")}
            onChange={(e) => setValue("classOrYear", e.target.value, { shouldValidate: true })}
          />
          {errors.classOrYear && (
            <p className="text-red-500 text-xs mt-1">{errors.classOrYear.message as string}</p>
          )}
        </div>
      </div>

      {/* Field of Study & Board - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            label="Field of Study / Stream"
            placeholder="e.g., Science, Commerce"
            {...register("fieldOfStudy")}
            value={watch("fieldOfStudy")}
            onChange={(e) => setValue("fieldOfStudy", e.target.value, { shouldValidate: true })}
          />
          {errors.fieldOfStudy && (
            <p className="text-red-500 text-xs mt-1">{errors.fieldOfStudy.message as string}</p>
          )}
        </div>
        <div>
          <AnimatedInput
            label="Board / University"
            placeholder="e.g., CBSE, State Board"
            {...register("boardOrUniversity")}
            value={watch("boardOrUniversity")}
            onChange={(e) => setValue("boardOrUniversity", e.target.value, { shouldValidate: true })}
          />
          {errors.boardOrUniversity && (
            <p className="text-red-500 text-xs mt-1">{errors.boardOrUniversity.message as string}</p>
          )}
        </div>
      </div>

      {/* Marks Section */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <p className="text-sm font-medium text-gray-700">
          {isFirstYear ? "10th Class Performance" : "Current Year Performance"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Select
                value={marksType}
                onValueChange={(value) => setValue(
                  isFirstYear ? "previousMarksType" : "currentMarksType",
                  value,
                  { shouldValidate: true }
                )}
              >
                <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg bg-white">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="cgpa">CGPA</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                </SelectContent>
              </Select>
              <label className={`absolute left-3 pointer-events-none transition-all ${
                marksType ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}>
                Marks Type
              </label>
            </div>
            {(isFirstYear ? errors.previousMarksType : errors.currentMarksType) && (
              <p className="text-red-500 text-xs mt-1">
                {((isFirstYear ? errors.previousMarksType : errors.currentMarksType)?.message as string)}
              </p>
            )}
          </div>
          <div>
            <AnimatedInput
              label={isFirstYear ? "Marks / CGPA / Grade" : "Current Year Marks"}
              placeholder={marksType === "percentage" ? "e.g., 85%" : marksType === "cgpa" ? "e.g., 8.5" : "e.g., A+"}
              {...register(isFirstYear ? "previousMarksPercentage" : "currentYearMarks")}
              value={watch(isFirstYear ? "previousMarksPercentage" : "currentYearMarks")}
              onChange={(e) => setValue(
                isFirstYear ? "previousMarksPercentage" : "currentYearMarks",
                e.target.value,
                { shouldValidate: true }
              )}
            />
            {(isFirstYear ? errors.previousMarksPercentage : errors.currentYearMarks) && (
              <p className="text-red-500 text-xs mt-1">
                {((isFirstYear ? errors.previousMarksPercentage : errors.currentYearMarks)?.message as string)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Previous Scholarship ID (Second Year Only) */}
      {!isFirstYear && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <AnimatedInput
              label="Previous Scholarship ID (optional)"
              placeholder="e.g., VF-12345678"
              {...register("previousScholarshipId")}
              value={watch("previousScholarshipId")}
              onChange={(e) => setValue("previousScholarshipId", e.target.value, { shouldValidate: true })}
            />
            <p className="text-xs text-gray-500 mt-1">
              If you received a scholarship from us last year
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
