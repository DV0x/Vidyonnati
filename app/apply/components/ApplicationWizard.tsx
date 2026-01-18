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
  RotateCcw,
  AlertCircle
} from "lucide-react"
import { StepProgress } from "./StepProgress"
import {
  type ApplicationType,
  getStepFields,
} from "@/lib/schemas/application"
import { useAuth } from "@/app/context/AuthContext"
import type { DocumentType } from "@/types/database"

import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { FamilyBackgroundStep } from "./steps/FamilyBackgroundStep"
import { EducationStep } from "./steps/EducationStep"
import { BankDetailsStep } from "./steps/BankDetailsStep"
import { DocumentsStep } from "./steps/DocumentsStep"
import { ReviewStep } from "./steps/ReviewStep"

// Step configurations - same for both types, content differs within components
const STEPS = [
  { title: "Personal Information", shortTitle: "Personal" },
  { title: "Family Details", shortTitle: "Family" },
  { title: "Education Details", shortTitle: "Education" },
  { title: "Bank Details", shortTitle: "Bank" },
  { title: "Documents", shortTitle: "Documents" }, // 2nd year: Essays & Documents
  { title: "Review & Submit", shortTitle: "Review" },
]

const STORAGE_KEY_PREFIX = "vidyonnati_application_draft_"
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000

export function ApplicationWizard() {
  const router = useRouter()
  const { user, student, isLoading: authLoading } = useAuth()
  const [applicationType, setApplicationType] = useState<ApplicationType>("first-year")
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      // Personal Info (common)
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      village: "",
      mandal: "",
      district: "",
      pincode: "",
      address: "",
      gender: undefined, // 2nd year only

      // Family (1st year: simple)
      motherName: "",
      fatherName: "",
      guardianName: "",
      guardianRelationship: "",

      // Family (2nd year: detailed)
      motherOccupation: "",
      motherMobile: "",
      fatherOccupation: "",
      fatherMobile: "",
      guardianDetails: "",
      familyAdultsCount: undefined,
      familyChildrenCount: undefined,
      annualFamilyIncome: "",

      // Education (common)
      highSchoolStudied: "",
      sscTotalMarks: undefined,
      sscMaxMarks: undefined,
      sscPercentage: undefined,
      collegeAddress: "",
      groupSubjects: "",

      // Education (1st year specific)
      collegeAdmitted: "",
      courseJoined: "",
      dateOfAdmission: "",

      // Education (2nd year specific)
      currentCollege: "",
      courseStudying: "",
      firstYearTotalMarks: undefined,
      firstYearMaxMarks: undefined,
      firstYearPercentage: undefined,

      // Bank Details
      bankAccountNumber: "",
      bankNameBranch: "",
      ifscCode: "",

      // Documents (1st year)
      sscMarksheet: null,
      aadharStudent: null,
      aadharParent: null,
      bonafideCertificate: null,
      bankPassbook: null,

      // Documents (2nd year)
      firstYearMarksheet: null,
      mangoPlantPhoto: null,

      // Essays (2nd year only)
      studyActivities: "",
      goalsDreams: "",
      additionalInfo: "",
    },
  })

  const { trigger, getValues, reset, setValue } = methods

  // Pre-fill form with student profile data
  useEffect(() => {
    if (student) {
      if (student.full_name) setValue('fullName', student.full_name)
      if (student.email) setValue('email', student.email)
      if (student.phone) setValue('phone', student.phone)
      if (student.date_of_birth) setValue('dateOfBirth', student.date_of_birth)
      if (student.gender) setValue('gender', student.gender as any)
      if (student.village) setValue('village', student.village)
      if (student.mandal) setValue('mandal', student.mandal)
      if (student.district) setValue('district', student.district)
      if (student.pincode) setValue('pincode', student.pincode)
      if (student.address) setValue('address', student.address)
    }
  }, [student, setValue])

  // Load draft from localStorage
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

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    setIsSaving(true)
    const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
    const data = getValues()

    // Exclude file objects from saving
    const {
      sscMarksheet,
      aadharStudent,
      aadharParent,
      bonafideCertificate,
      bankPassbook,
      firstYearMarksheet,
      mangoPlantPhoto,
      ...dataToSave
    } = data

    localStorage.setItem(storageKey, JSON.stringify({
      data: dataToSave,
      timestamp: Date.now(),
      step: currentStep,
    }))

    setTimeout(() => setIsSaving(false), 500)
  }, [applicationType, currentStep, getValues])

  // Auto-save on step change
  useEffect(() => {
    if (currentStep > 0) {
      saveDraft()
    }
  }, [currentStep, saveDraft])

  // Handle application type change
  const handleTypeChange = (type: ApplicationType) => {
    if (type !== applicationType) {
      saveDraft()
      setApplicationType(type)
      setCurrentStep(0)
    }
  }

  // Get required fields for the current step (excluding optional fields for validation)
  const getRequiredFieldsForStep = (step: number): string[] => {
    const allFields = getStepFields(step, applicationType)

    // Filter out optional fields for validation
    const optionalFields = [
      'guardianName', 'guardianRelationship', 'guardianDetails',
      'additionalInfo', 'mangoPlantPhoto'
    ]

    return allFields.filter(field => !optionalFields.includes(field))
  }

  const handleNext = async () => {
    const fields = getRequiredFieldsForStep(currentStep)
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

  // Helper to get current academic year (e.g., "2024-2025")
  const getCurrentAcademicYear = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    // Academic year starts in June
    if (month >= 6) {
      return `${year}-${year + 1}`
    }
    return `${year - 1}-${year}`
  }

  // Upload a single document
  const uploadDocument = async (
    applicationId: string,
    file: File,
    documentType: DocumentType
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('applicationId', applicationId)
    formData.append('documentType', documentType)

    const response = await fetch('/api/upload', {
      method: 'POST',
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

      // Prepare application data
      const applicationData = {
        application_type: applicationType,
        academic_year: getCurrentAcademicYear(),

        // Personal info
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        gender: data.gender || null,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        pincode: data.pincode,
        address: data.address,

        // Family info
        mother_name: data.motherName,
        father_name: data.fatherName,
        guardian_name: data.guardianName || null,
        guardian_relationship: data.guardianRelationship || null,
        mother_occupation: data.motherOccupation || null,
        mother_mobile: data.motherMobile || null,
        father_occupation: data.fatherOccupation || null,
        father_mobile: data.fatherMobile || null,
        guardian_details: data.guardianDetails || null,
        family_adults_count: data.familyAdultsCount || null,
        family_children_count: data.familyChildrenCount || null,
        annual_family_income: data.annualFamilyIncome || null,

        // Education info
        high_school_studied: data.highSchoolStudied,
        ssc_total_marks: data.sscTotalMarks,
        ssc_max_marks: data.sscMaxMarks,
        ssc_percentage: data.sscPercentage,
        college_address: data.collegeAddress,
        group_subjects: data.groupSubjects,

        // 1st year specific
        college_admitted: data.collegeAdmitted || null,
        course_joined: data.courseJoined || null,
        date_of_admission: data.dateOfAdmission || null,

        // 2nd year specific
        current_college: data.currentCollege || null,
        course_studying: data.courseStudying || null,
        first_year_total_marks: data.firstYearTotalMarks || null,
        first_year_max_marks: data.firstYearMaxMarks || null,
        first_year_percentage: data.firstYearPercentage || null,

        // Bank details
        bank_account_number: data.bankAccountNumber,
        bank_name_branch: data.bankNameBranch,
        ifsc_code: data.ifscCode,

        // Essays (2nd year)
        study_activities: data.studyActivities || null,
        goals_dreams: data.goalsDreams || null,
        additional_info: data.additionalInfo || null,
      }

      // Submit application
      const response = await fetch('/api/student/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit application')
      }

      const application = await response.json()
      setApplicationId(application.application_id)

      // Upload documents
      const documentUploads: Promise<unknown>[] = []

      // Common documents
      if (data.sscMarksheet) {
        documentUploads.push(uploadDocument(application.id, data.sscMarksheet as File, 'ssc_marksheet'))
      }
      if (data.aadharStudent) {
        documentUploads.push(uploadDocument(application.id, data.aadharStudent as File, 'aadhar_student'))
      }
      if (data.aadharParent) {
        documentUploads.push(uploadDocument(application.id, data.aadharParent as File, 'aadhar_parent'))
      }
      if (data.bonafideCertificate) {
        documentUploads.push(uploadDocument(application.id, data.bonafideCertificate as File, 'bonafide_certificate'))
      }
      if (data.bankPassbook) {
        documentUploads.push(uploadDocument(application.id, data.bankPassbook as File, 'bank_passbook'))
      }

      // 2nd year specific documents
      if (applicationType === 'second-year') {
        if (data.firstYearMarksheet) {
          documentUploads.push(uploadDocument(application.id, data.firstYearMarksheet as File, 'first_year_marksheet'))
        }
        if (data.mangoPlantPhoto) {
          documentUploads.push(uploadDocument(application.id, data.mangoPlantPhoto as File, 'mango_plant_photo'))
        }
      }

      // Wait for all uploads
      await Promise.all(documentUploads)

      // Clear draft from localStorage
      const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
      localStorage.removeItem(storageKey)

      setIsSubmitted(true)
    } catch (error) {
      console.error('Application submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
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
          You need to be logged in to submit a scholarship application.
        </p>
        <Button
          onClick={() => router.push('/login?redirect=/apply')}
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
        >
          Login to Continue
        </Button>
      </div>
    )
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
              Thank you for applying. We&apos;ll review your application and get back to you within 7-10 business days.
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
              {applicationId || 'Processing...'}
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
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
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
          onStepClick={goToStep}
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
                {currentStep === 0 && <PersonalInfoStep applicationType={applicationType} />}
                {currentStep === 1 && <FamilyBackgroundStep applicationType={applicationType} />}
                {currentStep === 2 && <EducationStep applicationType={applicationType} />}
                {currentStep === 3 && <BankDetailsStep />}
                {currentStep === 4 && <DocumentsStep applicationType={applicationType} />}
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
