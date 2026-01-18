"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { SpotlightStepProgress } from "./SpotlightStepProgress"
import { getSpotlightStepFields } from "@/lib/schemas/spotlight"
import { useAuth } from "@/app/context/AuthContext"
import type { SpotlightDocumentType } from "@/types/database"

import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { EducationStep } from "./steps/EducationStep"
import { CompetitiveExamsStep } from "./steps/CompetitiveExamsStep"
import { FamilyBackgroundStep } from "./steps/FamilyBackgroundStep"
import { CircumstancesStep } from "./steps/CircumstancesStep"
import { StoryGoalsStep } from "./steps/StoryGoalsStep"
import { DocumentsStep } from "./steps/DocumentsStep"
import { ReviewStep } from "./steps/ReviewStep"

const STEPS = [
  { title: "Personal Information", shortTitle: "Personal" },
  { title: "Education Details", shortTitle: "Education" },
  { title: "Competitive Exams", shortTitle: "Exams" },
  { title: "Family Background", shortTitle: "Family" },
  { title: "Circumstances", shortTitle: "Situation" },
  { title: "Story & Goals", shortTitle: "Story" },
  { title: "Documents", shortTitle: "Documents" },
  { title: "Review & Submit", shortTitle: "Review" },
]

const STORAGE_KEY = "vidyonnati_spotlight_draft"
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000

export function SpotlightWizard() {
  const router = useRouter()
  const { user, student, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [spotlightId, setSpotlightId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      // Personal Info
      fullName: "",
      photo: null,
      dateOfBirth: "",
      gender: undefined,
      phone: "",
      email: "",
      village: "",
      mandal: "",
      district: "",
      state: "Andhra Pradesh",
      pincode: "",

      // Education
      collegeName: "",
      courseStream: "",
      yearOfCompletion: undefined,
      totalMarks: undefined,
      maxMarks: undefined,
      percentage: undefined,
      currentStatus: undefined,

      // Competitive Exams
      competitiveExams: [] as { exam: string; score?: string; rank?: number; percentile?: number }[],

      // Family Background
      parentStatus: undefined,
      motherName: "",
      motherOccupation: "",
      motherHealth: "",
      fatherName: "",
      fatherOccupation: "",
      fatherHealth: "",
      guardianName: "",
      guardianRelationship: "",
      guardianDetails: "",
      siblingsCount: undefined,
      annualFamilyIncome: undefined,

      // Circumstances
      circumstances: [] as string[],
      circumstancesOther: "",

      // Story & Goals
      backgroundStory: "",
      dreamsGoals: "",
      howHelpChangesLife: "",
      annualFinancialNeed: undefined,

      // Documents
      marksheet: null,
      aadhar: null,
      incomeCertificate: null,
      otherDocuments: [],
    },
  })

  const { trigger, getValues, reset, setValue } = methods

  // Pre-fill form with student profile data
  useEffect(() => {
    if (student) {
      if (student.full_name) setValue("fullName", student.full_name)
      if (student.email) setValue("email", student.email)
      if (student.phone) setValue("phone", student.phone)
      if (student.date_of_birth) setValue("dateOfBirth", student.date_of_birth)
      if (student.gender && (student.gender === "male" || student.gender === "female")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue("gender", student.gender as any)
      }
      if (student.village) setValue("village", student.village)
      if (student.mandal) setValue("mandal", student.mandal)
      if (student.district) setValue("district", student.district)
      if (student.pincode) setValue("pincode", student.pincode)
    }
  }, [student, setValue])

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)

    if (savedDraft) {
      try {
        const { data, timestamp, step } = JSON.parse(savedDraft)

        if (Date.now() - timestamp < STORAGE_EXPIRY) {
          // Restore data but exclude file fields
          const { photo, marksheet, aadhar, incomeCertificate, otherDocuments, ...restData } = data
          reset({ ...methods.getValues(), ...restData })
          setCurrentStep(step)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {
        console.error("Failed to restore draft:", e)
      }
    }
  }, [reset, methods])

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    setIsSaving(true)
    const data = getValues()

    // Exclude file objects from saving
    const {
      photo,
      marksheet,
      aadhar,
      incomeCertificate,
      otherDocuments,
      ...dataToSave
    } = data

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data: dataToSave,
        timestamp: Date.now(),
        step: currentStep,
      })
    )

    setTimeout(() => setIsSaving(false), 500)
  }, [currentStep, getValues])

  // Auto-save on step change
  useEffect(() => {
    if (currentStep > 0) {
      saveDraft()
    }
  }, [currentStep, saveDraft])

  // Get required fields for the current step
  const getRequiredFieldsForStep = (step: number): string[] => {
    const allFields = getSpotlightStepFields(step)

    // Filter out optional fields for validation
    const optionalFields = [
      "competitiveExams",
      "motherOccupation",
      "motherHealth",
      "fatherOccupation",
      "fatherHealth",
      "guardianDetails",
      "siblingsCount",
      "annualFamilyIncome",
      "circumstancesOther",
      "incomeCertificate",
      "otherDocuments",
    ]

    return allFields.filter((field) => !optionalFields.includes(field))
  }

  const handleNext = async () => {
    const fields = getRequiredFieldsForStep(currentStep)
    const isValid = await trigger(fields as never[])

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

  // Upload a document
  const uploadDocument = async (
    applicationId: string,
    file: File,
    documentType: SpotlightDocumentType
  ) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("applicationId", applicationId)
    formData.append("documentType", documentType)

    const response = await fetch("/api/upload/spotlight", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to upload ${documentType}`)
    }

    return response.json()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const data = getValues()

      // Check for required files before submission
      if (!data.photo) {
        throw new Error("Photo is required. Please go back to the Documents step and upload your photo.")
      }
      if (!data.marksheet) {
        throw new Error("Marksheet is required. Please go back to the Documents step and upload your marksheet.")
      }
      if (!data.aadhar) {
        throw new Error("Aadhar card is required. Please go back to the Documents step and upload your Aadhar.")
      }

      // Prepare application data
      const applicationData = {
        full_name: data.fullName,
        date_of_birth: data.dateOfBirth,
        gender: data.gender || null,
        phone: data.phone,
        email: data.email,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        state: data.state,
        pincode: data.pincode,

        // Education
        college_name: data.collegeName,
        course_stream: data.courseStream,
        year_of_completion: data.yearOfCompletion,
        total_marks: data.totalMarks,
        max_marks: data.maxMarks,
        percentage: data.percentage,
        current_status: data.currentStatus,

        // Competitive Exams
        competitive_exams: data.competitiveExams.length > 0 ? data.competitiveExams : null,

        // Family Background
        parent_status: data.parentStatus,
        mother_name: data.motherName || null,
        mother_occupation: data.motherOccupation || null,
        mother_health: data.motherHealth || null,
        father_name: data.fatherName || null,
        father_occupation: data.fatherOccupation || null,
        father_health: data.fatherHealth || null,
        guardian_name: data.guardianName || null,
        guardian_relationship: data.guardianRelationship || null,
        guardian_details: data.guardianDetails || null,
        siblings_count: data.siblingsCount || null,
        annual_family_income: data.annualFamilyIncome || null,

        // Circumstances
        circumstances: data.circumstances,
        circumstances_other: data.circumstancesOther || null,

        // Story & Goals
        background_story: data.backgroundStory,
        dreams_goals: data.dreamsGoals,
        how_help_changes_life: data.howHelpChangesLife,
        annual_financial_need: data.annualFinancialNeed,
      }

      let applicationId: string
      let applicationSpotlightId: string

      // Submit application (or get existing one)
      const response = await fetch("/api/student/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // If application already exists, fetch it and use for document uploads
        if (response.status === 409 && errorData.existingApplicationId) {
          // Fetch the existing application to get the ID
          const existingResponse = await fetch("/api/student/spotlight")
          if (!existingResponse.ok) {
            throw new Error("Failed to fetch existing application")
          }
          const existingApps = await existingResponse.json()
          const existingApp = existingApps.find(
            (app: { spotlight_id: string }) => app.spotlight_id === errorData.existingApplicationId
          )
          if (!existingApp) {
            throw new Error("Could not find existing application")
          }
          applicationId = existingApp.id
          applicationSpotlightId = existingApp.spotlight_id
        } else {
          throw new Error(errorData.error || "Failed to submit application")
        }
      } else {
        const application = await response.json()
        applicationId = application.id
        applicationSpotlightId = application.spotlight_id
      }

      setSpotlightId(applicationSpotlightId)

      // Upload documents
      const documentUploads: Promise<unknown>[] = []

      // Photo (required)
      if (data.photo) {
        documentUploads.push(
          uploadDocument(applicationId, data.photo as File, "photo")
        )
      }

      // Marksheet (required)
      if (data.marksheet) {
        documentUploads.push(
          uploadDocument(applicationId, data.marksheet as File, "marksheet")
        )
      }

      // Aadhar (required)
      if (data.aadhar) {
        documentUploads.push(
          uploadDocument(applicationId, data.aadhar as File, "aadhar")
        )
      }

      // Income Certificate (optional)
      if (data.incomeCertificate) {
        documentUploads.push(
          uploadDocument(
            applicationId,
            data.incomeCertificate as File,
            "income_certificate"
          )
        )
      }

      // Wait for all uploads
      await Promise.all(documentUploads)

      // Clear draft from localStorage
      localStorage.removeItem(STORAGE_KEY)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Spotlight submission error:", error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
        <p className="text-gray-600 mb-6">
          You need to be logged in to apply for the Spotlight program.
        </p>
        <Button
          onClick={() => router.push("/login?redirect=/spotlight/apply")}
          className="bg-primary hover:bg-primary/90"
        >
          Login to Continue
        </Button>
      </div>
    )
  }

  // Success state
  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-gray-200/50 p-8 sm:p-12 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-orange-100/50 to-transparent rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-orange-500 rounded-2xl rotate-6" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
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
              Thank you for applying for the Spotlight program. Our team will review your
              application and get back to you soon.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 max-w-xs mx-auto mb-8 border border-gray-100"
          >
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Your Application ID
            </p>
            <p className="font-mono text-xl font-bold text-gray-900">
              {spotlightId || "Processing..."}
            </p>
            <p className="text-xs text-gray-500 mt-2">Save this for your records</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              View My Applications
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="px-8 py-6 rounded-xl text-base font-semibold"
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
        {/* Progress */}
        <SpotlightStepProgress
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 0 && <PersonalInfoStep />}
                {currentStep === 1 && <EducationStep />}
                {currentStep === 2 && <CompetitiveExamsStep />}
                {currentStep === 3 && <FamilyBackgroundStep />}
                {currentStep === 4 && <CircumstancesStep />}
                {currentStep === 5 && <StoryGoalsStep />}
                {currentStep === 6 && <DocumentsStep />}
                {currentStep === 7 && <ReviewStep onEdit={goToStep} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Submission Error</p>
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          </div>
        )}

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
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-xl px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
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
