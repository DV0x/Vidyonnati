"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  RotateCcw
} from "lucide-react"
import { StepProgress } from "./StepProgress"
import {
  type ApplicationType,
  personalInfoSchema,
  firstYearEducationSchema,
  secondYearEducationSchema,
  familyBackgroundSchema,
  secondYearFamilyBackgroundSchema,
  firstYearDocumentsSchema,
  secondYearDocumentsSchema,
  firstYearStatementSchema,
  secondYearStatementSchema,
} from "@/lib/schemas/application"

import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { EducationStep } from "./steps/EducationStep"
import { FamilyBackgroundStep } from "./steps/FamilyBackgroundStep"
import { DocumentsStep } from "./steps/DocumentsStep"
import { StatementStep } from "./steps/StatementStep"
import { ReviewStep } from "./steps/ReviewStep"

const STEPS = [
  { title: "Personal Information", shortTitle: "Personal" },
  { title: "Education Details", shortTitle: "Education" },
  { title: "Family Background", shortTitle: "Family" },
  { title: "Documents", shortTitle: "Documents" },
  { title: "Statement of Purpose", shortTitle: "Statement" },
  { title: "Review & Submit", shortTitle: "Review" },
]

const STORAGE_KEY_PREFIX = "vidyonnati_application_draft_"
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000

function getStepSchema(step: number, applicationType: ApplicationType) {
  const isFirstYear = applicationType === "first-year"

  switch (step) {
    case 0:
      return personalInfoSchema
    case 1:
      return isFirstYear ? firstYearEducationSchema : secondYearEducationSchema
    case 2:
      return isFirstYear ? familyBackgroundSchema : secondYearFamilyBackgroundSchema
    case 3:
      return isFirstYear ? firstYearDocumentsSchema : secondYearDocumentsSchema
    case 4:
      return isFirstYear ? firstYearStatementSchema : secondYearStatementSchema
    case 5:
      return z.object({})
    default:
      return z.object({})
  }
}

export function ApplicationWizard() {
  const [applicationType, setApplicationType] = useState<ApplicationType>("first-year")
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      dateOfBirth: "",
      currentInstitution: "",
      institutionType: undefined,
      classOrYear: "",
      fieldOfStudy: "",
      boardOrUniversity: "",
      previousMarksPercentage: "",
      previousMarksType: undefined,
      currentYearMarks: "",
      currentMarksType: undefined,
      previousScholarshipId: "",
      guardianName: "",
      guardianRelation: undefined,
      guardianPhone: "",
      guardianOccupation: "",
      annualFamilyIncome: "",
      numberOfDependents: undefined,
      incomeSource: "",
      familyDetailsUnchanged: false,
      photo: null,
      idProof: null,
      incomeCertificate: null,
      tenthMarksheet: null,
      currentYearMarksheet: null,
      whyNeedScholarship: "",
      educationalGoals: "",
      careerAspirations: "",
      progressReport: "",
      challengesFaced: "",
    },
  })

  const { trigger, getValues, reset, formState: { errors } } = methods

  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
    const savedDraft = localStorage.getItem(storageKey)

    if (savedDraft) {
      try {
        const { data, timestamp, step } = JSON.parse(savedDraft)

        if (Date.now() - timestamp < STORAGE_EXPIRY) {
          reset(data)
          setCurrentStep(step)
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch (e) {
        console.error("Failed to restore draft:", e)
      }
    }
  }, [applicationType, reset])

  const saveDraft = useCallback(() => {
    setIsSaving(true)
    const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
    const data = getValues()

    const {
      photo,
      idProof,
      incomeCertificate,
      tenthMarksheet,
      currentYearMarksheet,
      ...dataToSave
    } = data

    localStorage.setItem(storageKey, JSON.stringify({
      data: dataToSave,
      timestamp: Date.now(),
      step: currentStep,
    }))

    setTimeout(() => setIsSaving(false), 500)
  }, [applicationType, currentStep, getValues])

  useEffect(() => {
    if (currentStep > 0) {
      saveDraft()
    }
  }, [currentStep, saveDraft])

  const handleTypeChange = (type: ApplicationType) => {
    if (type !== applicationType) {
      saveDraft()
      setApplicationType(type)
      setCurrentStep(0)
    }
  }

  const getFieldsForStep = (step: number): string[] => {
    const isFirstYear = applicationType === "first-year"

    switch (step) {
      case 0:
        return ["fullName", "email", "phone", "address", "city", "state", "pincode", "dateOfBirth"]
      case 1:
        return isFirstYear
          ? ["currentInstitution", "institutionType", "classOrYear", "fieldOfStudy", "boardOrUniversity", "previousMarksPercentage", "previousMarksType"]
          : ["currentInstitution", "institutionType", "classOrYear", "fieldOfStudy", "boardOrUniversity", "currentYearMarks", "currentMarksType"]
      case 2:
        return isFirstYear
          ? ["guardianName", "guardianRelation", "guardianPhone", "guardianOccupation", "annualFamilyIncome", "numberOfDependents", "incomeSource"]
          : ["annualFamilyIncome"]
      case 3:
        return isFirstYear
          ? ["photo", "idProof", "incomeCertificate", "tenthMarksheet"]
          : ["incomeCertificate", "currentYearMarksheet"]
      case 4:
        return isFirstYear
          ? ["whyNeedScholarship", "educationalGoals", "careerAspirations"]
          : ["progressReport", "educationalGoals"]
      case 5:
        return []
      default:
        return []
    }
  }

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep)
    const isValid = await trigger(fields as any)

    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
    localStorage.removeItem(storageKey)

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  // Success state
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-gray-200/50 p-8 sm:p-12 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-green-100/50 to-transparent rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl rotate-6" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Thank you for applying. We'll review your application and get back to you within 7-10 business days.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 max-w-xs mx-auto mb-8 border border-gray-100"
          >
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Your Application ID</p>
            <p className="font-mono text-xl font-bold text-gray-900">
              VF-{Date.now().toString().slice(-8)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Save this for your records</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* Application Type Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange("first-year")}
            className={`relative flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              applicationType === "first-year"
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {applicationType === "first-year" && (
              <motion.div
                layoutId="activeType"
                className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-lg shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              New
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("second-year")}
            className={`relative flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              applicationType === "second-year"
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {applicationType === "second-year" && (
              <motion.div
                layoutId="activeType"
                className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-lg shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Renewal
            </span>
          </button>
        </div>

        {/* Progress */}
        <StepProgress
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
        />

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${applicationType}-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 0 && <PersonalInfoStep />}
                {currentStep === 1 && <EducationStep applicationType={applicationType} />}
                {currentStep === 2 && <FamilyBackgroundStep applicationType={applicationType} />}
                {currentStep === 3 && <DocumentsStep applicationType={applicationType} />}
                {currentStep === 4 && <StatementStep applicationType={applicationType} />}
                {currentStep === 5 && (
                  <ReviewStep
                    applicationType={applicationType}
                    onEdit={goToStep}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex-1 flex justify-end items-center gap-3">
            {/* Save indicator */}
            {isSaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving
              </span>
            )}

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 rounded-xl px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl px-5 shadow-md shadow-green-500/20 transition-all hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit
                </>
              )}
            </Button>
          )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
