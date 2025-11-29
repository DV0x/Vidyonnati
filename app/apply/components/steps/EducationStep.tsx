"use client"

import { useFormContext } from "react-hook-form"
import { useEffect } from "react"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { AnimatedTextarea } from "@/app/components/AnimatedTextarea"
import { type ApplicationType } from "@/lib/schemas/application"
import { School, GraduationCap, Calculator } from "lucide-react"

interface EducationStepProps {
  applicationType: ApplicationType
}

export function EducationStep({ applicationType }: EducationStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  const isFirstYear = applicationType === "first-year"
  const isSecondYear = applicationType === "second-year"

  // Watch marks for auto-calculation
  const sscTotalMarks = watch("sscTotalMarks")
  const sscMaxMarks = watch("sscMaxMarks")
  const firstYearTotalMarks = watch("firstYearTotalMarks")
  const firstYearMaxMarks = watch("firstYearMaxMarks")

  // Auto-calculate SSC percentage
  useEffect(() => {
    if (sscTotalMarks && sscMaxMarks && sscMaxMarks > 0) {
      const percentage = ((sscTotalMarks / sscMaxMarks) * 100).toFixed(2)
      setValue("sscPercentage", parseFloat(percentage), { shouldValidate: true })
    }
  }, [sscTotalMarks, sscMaxMarks, setValue])

  // Auto-calculate 1st Year percentage (for 2nd year applicants)
  useEffect(() => {
    if (isSecondYear && firstYearTotalMarks && firstYearMaxMarks && firstYearMaxMarks > 0) {
      const percentage = ((firstYearTotalMarks / firstYearMaxMarks) * 100).toFixed(2)
      setValue("firstYearPercentage", parseFloat(percentage), { shouldValidate: true })
    }
  }, [firstYearTotalMarks, firstYearMaxMarks, isSecondYear, setValue])

  return (
    <div className="space-y-6">
      {/* Previous School Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <School className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-700">Previous School (SSC/10th)</h3>
        </div>

        {/* High School Name */}
        <div>
          <AnimatedInput
            label="High School Studied"
            placeholder="e.g., Sri Prakasam Government Girls High School"
            {...register("highSchoolStudied")}
            value={watch("highSchoolStudied") || ""}
            onChange={(e) => setValue("highSchoolStudied", e.target.value, { shouldValidate: true })}
          />
          {errors.highSchoolStudied && (
            <p className="text-red-500 text-xs mt-1">{errors.highSchoolStudied.message as string}</p>
          )}
        </div>

        {/* SSC Marks Section */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">SSC Marks (10th Class)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <AnimatedInput
                type="number"
                label="Total Marks Secured"
                placeholder="e.g., 593"
                value={watch("sscTotalMarks") ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseInt(e.target.value)
                  setValue("sscTotalMarks", Number.isNaN(val) ? undefined : val, { shouldValidate: true })
                }}
              />
              {errors.sscTotalMarks && (
                <p className="text-red-500 text-xs mt-1">{errors.sscTotalMarks.message as string}</p>
              )}
            </div>
            <div>
              <AnimatedInput
                type="number"
                label="Maximum Marks"
                placeholder="e.g., 600"
                value={watch("sscMaxMarks") ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseInt(e.target.value)
                  setValue("sscMaxMarks", Number.isNaN(val) ? undefined : val, { shouldValidate: true })
                }}
              />
              {errors.sscMaxMarks && (
                <p className="text-red-500 text-xs mt-1">{errors.sscMaxMarks.message as string}</p>
              )}
            </div>
            <div>
              <AnimatedInput
                type="number"
                label="Percentage"
                step="0.01"
                readOnly
                className="bg-green-50"
                value={watch("sscPercentage") ?? ""}
              />
              {errors.sscPercentage && (
                <p className="text-red-500 text-xs mt-1">{errors.sscPercentage.message as string}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Auto-calculated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current College Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <GraduationCap className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-medium text-gray-700">
            {isFirstYear ? "College/Institution Admitted" : "Current College/Institution"}
          </h3>
        </div>

        {/* College Name */}
        <div>
          <AnimatedInput
            label={isFirstYear ? "College/Institution Name" : "Current College/Institution Name"}
            placeholder="e.g., Bhashyam IIT Academy"
            {...register(isFirstYear ? "collegeAdmitted" : "currentCollege")}
            value={watch(isFirstYear ? "collegeAdmitted" : "currentCollege") || ""}
            onChange={(e) => setValue(
              isFirstYear ? "collegeAdmitted" : "currentCollege",
              e.target.value,
              { shouldValidate: true }
            )}
          />
          {(isFirstYear ? errors.collegeAdmitted : errors.currentCollege) && (
            <p className="text-red-500 text-xs mt-1">
              {((isFirstYear ? errors.collegeAdmitted : errors.currentCollege)?.message as string)}
            </p>
          )}
        </div>

        {/* College Address */}
        <div>
          <AnimatedTextarea
            label="College Address"
            placeholder="Full address of the college/institution"
            {...register("collegeAddress")}
            value={watch("collegeAddress") || ""}
            onChange={(e) => setValue("collegeAddress", e.target.value, { shouldValidate: true })}
          />
          {errors.collegeAddress && (
            <p className="text-red-500 text-xs mt-1">{errors.collegeAddress.message as string}</p>
          )}
        </div>

        {/* Course & Group - Side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <AnimatedInput
              label={isFirstYear ? "Course Joined" : "Course Studying"}
              placeholder="e.g., Inter, B.Tech"
              {...register(isFirstYear ? "courseJoined" : "courseStudying")}
              value={watch(isFirstYear ? "courseJoined" : "courseStudying") || ""}
              onChange={(e) => setValue(
                isFirstYear ? "courseJoined" : "courseStudying",
                e.target.value,
                { shouldValidate: true }
              )}
            />
            {(isFirstYear ? errors.courseJoined : errors.courseStudying) && (
              <p className="text-red-500 text-xs mt-1">
                {((isFirstYear ? errors.courseJoined : errors.courseStudying)?.message as string)}
              </p>
            )}
          </div>
          <div>
            <AnimatedInput
              label="Group/Subjects"
              placeholder="e.g., MPC - Maths, Physics, Chemistry"
              {...register("groupSubjects")}
              value={watch("groupSubjects") || ""}
              onChange={(e) => setValue("groupSubjects", e.target.value, { shouldValidate: true })}
            />
            {errors.groupSubjects && (
              <p className="text-red-500 text-xs mt-1">{errors.groupSubjects.message as string}</p>
            )}
          </div>
        </div>

        {/* Date of Admission (First Year Only) */}
        {isFirstYear && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <input
                  type="date"
                  className="peer w-full h-[52px] px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                  {...register("dateOfAdmission")}
                />
                <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none">
                  Date of Admission
                </label>
              </div>
              {errors.dateOfAdmission && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfAdmission.message as string}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 1st Year Marks Section (Second Year Only) */}
      {isSecondYear && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-700">1st Year Performance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <AnimatedInput
                  type="number"
                  label="Total Marks Secured"
                  placeholder="e.g., 451"
                  value={watch("firstYearTotalMarks") ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : parseInt(e.target.value)
                    setValue("firstYearTotalMarks", Number.isNaN(val) ? undefined : val, { shouldValidate: true })
                  }}
                />
                {errors.firstYearTotalMarks && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstYearTotalMarks.message as string}</p>
                )}
              </div>
              <div>
                <AnimatedInput
                  type="number"
                  label="Maximum Marks"
                  placeholder="e.g., 470"
                  value={watch("firstYearMaxMarks") ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : parseInt(e.target.value)
                    setValue("firstYearMaxMarks", Number.isNaN(val) ? undefined : val, { shouldValidate: true })
                  }}
                />
                {errors.firstYearMaxMarks && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstYearMaxMarks.message as string}</p>
                )}
              </div>
              <div>
                <AnimatedInput
                  type="number"
                  label="Percentage"
                  step="0.01"
                  readOnly
                  className="bg-green-50"
                  value={watch("firstYearPercentage") ?? ""}
                />
                {errors.firstYearPercentage && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstYearPercentage.message as string}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Auto-calculated</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
