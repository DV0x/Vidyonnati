"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { asIncomeBracket, requiredNumber } from "@/lib/formCoercion"
import { useAuth } from "@/app/context/AuthContext"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id, Doc } from "@/convex/_generated/dataModel"
import { convexErrorMessage, convexErrorData } from "@/lib/convexError"
// Derived from the Convex schema rather than the Supabase row types, so the
// wizard and the attach mutation cannot disagree about what a document type is.
type DocumentType = Doc<"applicationDocuments">["documentType"]

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

interface ApplicationWizardProps {
  editApplicationId?: string
  editApplicationType?: ApplicationType
}

// Convex documents are camelCase, and every form field is named identically to
// its document field — so what used to be a snake_case→camelCase mapping table
// is now just the list of fields the edit form repopulates.
const EDITABLE_FORM_FIELDS = [
  'fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'village', 'mandal',
  'district', 'pincode', 'address',
  'motherName', 'fatherName', 'guardianName', 'guardianRelationship',
  'motherOccupation', 'motherMobile', 'fatherOccupation', 'fatherMobile',
  'guardianDetails', 'familyAdultsCount', 'familyChildrenCount',
  'annualFamilyIncome',
  'highSchoolStudied', 'sscTotalMarks', 'sscMaxMarks', 'sscPercentage',
  'collegeAddress', 'groupSubjects',
  'collegeAdmitted', 'courseJoined', 'dateOfAdmission',
  'currentCollege', 'courseStudying', 'firstYearTotalMarks',
  'firstYearMaxMarks', 'firstYearPercentage',
  'bankAccountNumber', 'bankNameBranch', 'ifscCode',
  'studyActivities', 'goalsDreams', 'additionalInfo',
] as const


export function ApplicationWizard({ editApplicationId, editApplicationType }: ApplicationWizardProps) {
  const router = useRouter()
  const { user, student, isLoading: authLoading } = useAuth()
  // The type the user picked. In edit mode the loaded application is the
  // authority instead — see `applicationType` below — so this only drives the
  // new-application flow, where the two-card selector sets it.
  const [selectedType, setSelectedType] = useState<ApplicationType>(
    editApplicationType || "first-year",
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)


  const isEditMode = !!editApplicationId

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

      // Student photo
      studentPhoto: null as File | null,

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

  const createApplication = useMutation(api.applications.create)
  const updateApplication = useMutation(api.applications.update)
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const attachApplicationDocument = useMutation(
    api.documents.attachApplicationDocument,
  )

  // Existing application, in edit mode. A live query rather than a one-shot
  // fetch: "skip" when there is nothing to edit, undefined while loading, and
  // null when the record is missing or belongs to someone else — the query
  // collapses those two cases on purpose so neither can probe for valid ids.
  const editApplication = useQuery(
    api.applications.myApplication,
    editApplicationId
      ? { applicationId: editApplicationId as Id<'applications'> }
      : 'skip',
  )

  // Derived rather than stored. Each of these is a pure function of the query
  // result, and holding them in state meant an effect that wrote four setStates
  // every time the subscription resolved — the cascade
  // react-hooks/set-state-in-effect exists to catch. The form itself still needs
  // an effect below, because react-hook-form owns that state, not React.
  const isLoadingEdit = isEditMode && editApplication === undefined
  const editDbId = editApplication?._id ?? null
  const editLoadFailed = isEditMode && editApplication === null
  const existingDocuments = useMemo(
    () =>
      editApplication?.documents.map((d) => ({
        document_type: d.documentType,
        file_name: d.fileName,
      })) ?? [],
    [editApplication],
  )

  // Derived, so the edit effect no longer has to write it back into state.
  // The loaded application wins in edit mode; the prop is only a hint for the
  // first render, before the query resolves.
  const applicationType: ApplicationType = isEditMode
    ? (editApplication?.applicationType ?? editApplicationType ?? "first-year")
    : selectedType

  useEffect(() => {
    if (!editApplication) return

    const { ...appData } = editApplication

    // Field names match one-for-one now, so this copies rather than translates.
    // Absent optional fields are skipped so they keep the form's own defaults
    // instead of becoming undefined and tripping the controlled-input warning.
    const formData: Record<string, unknown> = {}
    for (const field of EDITABLE_FORM_FIELDS) {
      const value = (appData as Record<string, unknown>)[field]
      if (value !== undefined && value !== null) formData[field] = value
    }

    reset((prev) => ({ ...prev, ...formData }))
  }, [editApplication, reset])

  // Pre-fill form with student profile data (skip in edit mode)
  useEffect(() => {
    if (isEditMode) return
    if (student) {
      if (student.fullName) setValue('fullName', student.fullName)
      if (student.email) setValue('email', student.email)
      if (student.phone) setValue('phone', student.phone)
      if (student.dateOfBirth) setValue('dateOfBirth', student.dateOfBirth)
      if (student.gender) setValue('gender', student.gender as any)
      if (student.village) setValue('village', student.village)
      if (student.mandal) setValue('mandal', student.mandal)
      if (student.district) setValue('district', student.district)
      if (student.pincode) setValue('pincode', student.pincode)
      if (student.address) setValue('address', student.address)
    }
  }, [student, setValue, isEditMode])

  // Load draft from localStorage (skip in edit mode)
  useEffect(() => {
    if (isEditMode) return
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
  }, [applicationType, reset, isEditMode])

  // Save draft to localStorage (skip in edit mode)
  const saveDraft = useCallback(() => {
    if (isEditMode) return
    setIsSaving(true)
    const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
    const data = getValues()

    // Exclude file objects from saving
    const {
      studentPhoto,
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
  }, [applicationType, currentStep, getValues, isEditMode])

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
      setSelectedType(type)
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

  // Upload a single document.
  //
  // Three steps instead of the old one-shot POST, because Convex uploads go
  // straight to storage rather than through a route of ours: ask for a
  // short-lived upload URL, PUT the bytes at it, then record the returned
  // storageId against the application.
  //
  // Type and size are enforced server-side in the attach step, from the
  // metadata Convex recorded — not from anything sent here — so a client that
  // misreports either still gets rejected.
  const uploadDocument = async (
    appId: Id<'applications'>,
    file: File,
    documentType: DocumentType,
  ) => {
    const uploadUrl = await generateUploadUrl()

    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!result.ok) {
      throw new Error(`Failed to upload ${documentType}`)
    }

    const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }

    return attachApplicationDocument({
      applicationId: appId,
      documentType,
      storageId,
      fileName: file.name,
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const data = getValues()

      // Field names now match the mutation's arguments exactly, so this is a
      // direct pass rather than a rename. Empty optionals become undefined, not
      // null: Convex optional fields are absent-or-present, and null is a
      // distinct value its validators reject.
      const applicationData = {
        // Personal info
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender || undefined,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        pincode: data.pincode,
        address: data.address,

        // Family info
        motherName: data.motherName,
        fatherName: data.fatherName,
        guardianName: data.guardianName || undefined,
        guardianRelationship: data.guardianRelationship || undefined,
        motherOccupation: data.motherOccupation || undefined,
        motherMobile: data.motherMobile || undefined,
        fatherOccupation: data.fatherOccupation || undefined,
        fatherMobile: data.fatherMobile || undefined,
        guardianDetails: data.guardianDetails || undefined,
        familyAdultsCount: data.familyAdultsCount || undefined,
        familyChildrenCount: data.familyChildrenCount || undefined,
        annualFamilyIncome: asIncomeBracket(data.annualFamilyIncome),

        // Education info
        highSchoolStudied: data.highSchoolStudied,
        sscTotalMarks: requiredNumber(data.sscTotalMarks, "SSC total marks"),
        sscMaxMarks: requiredNumber(data.sscMaxMarks, "SSC maximum marks"),
        sscPercentage: requiredNumber(data.sscPercentage, "SSC percentage"),
        collegeAddress: data.collegeAddress,
        groupSubjects: data.groupSubjects,

        // 1st year specific
        collegeAdmitted: data.collegeAdmitted || undefined,
        courseJoined: data.courseJoined || undefined,
        dateOfAdmission: data.dateOfAdmission || undefined,

        // 2nd year specific
        currentCollege: data.currentCollege || undefined,
        courseStudying: data.courseStudying || undefined,
        firstYearTotalMarks: data.firstYearTotalMarks || undefined,
        firstYearMaxMarks: data.firstYearMaxMarks || undefined,
        firstYearPercentage: data.firstYearPercentage || undefined,

        // Bank details
        bankAccountNumber: data.bankAccountNumber,
        bankNameBranch: data.bankNameBranch,
        ifscCode: data.ifscCode,

        // Essays (2nd year)
        studyActivities: data.studyActivities || undefined,
        goalsDreams: data.goalsDreams || undefined,
        additionalInfo: data.additionalInfo || undefined,
      }

      const result =
        isEditMode && editDbId
          ? await updateApplication({ id: editDbId, ...applicationData })
          : await createApplication({
              ...applicationData,
              applicationType,
              academicYear: getCurrentAcademicYear(),
            })

      const appId = result.id
      setApplicationId(result.applicationId)

      // Upload documents (only new files where user selected them)
      const documentUploads: Promise<unknown>[] = []

      // Student photo
      if (data.studentPhoto) {
        documentUploads.push(uploadDocument(appId, data.studentPhoto as File, 'student_photo'))
      }

      // Common documents
      if (data.sscMarksheet) {
        documentUploads.push(uploadDocument(appId, data.sscMarksheet as File, 'ssc_marksheet'))
      }
      if (data.aadharStudent) {
        documentUploads.push(uploadDocument(appId, data.aadharStudent as File, 'aadhar_student'))
      }
      if (data.aadharParent) {
        documentUploads.push(uploadDocument(appId, data.aadharParent as File, 'aadhar_parent'))
      }
      if (data.bonafideCertificate) {
        documentUploads.push(uploadDocument(appId, data.bonafideCertificate as File, 'bonafide_certificate'))
      }
      if (data.bankPassbook) {
        documentUploads.push(uploadDocument(appId, data.bankPassbook as File, 'bank_passbook'))
      }

      // 2nd year specific documents
      if (applicationType === 'second-year') {
        if (data.firstYearMarksheet) {
          documentUploads.push(uploadDocument(appId, data.firstYearMarksheet as File, 'first_year_marksheet'))
        }
        if (data.mangoPlantPhoto) {
          documentUploads.push(uploadDocument(appId, data.mangoPlantPhoto as File, 'mango_plant_photo'))
        }
      }

      // Wait for all uploads
      await Promise.all(documentUploads)

      // Clear draft from localStorage (only for new applications)
      if (!isEditMode) {
        const storageKey = `${STORAGE_KEY_PREFIX}${applicationType}`
        localStorage.removeItem(storageKey)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Application submission error:', error)

      // The duplicate guard carries the id of the application the student
      // already has, so the message can name it instead of just refusing.
      const data = convexErrorData(error)
      if (data?.code === 'DUPLICATE_APPLICATION' && data.existingApplicationId) {
        setSubmitError(
          `${data.message} (${data.existingApplicationId}). You can view it from your dashboard.`,
        )
      } else {
        setSubmitError(
          convexErrorMessage(error, 'Something went wrong. Please try again.'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth loading state
  if (authLoading || isLoadingEdit) {
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
              {isEditMode ? "Application Resubmitted!" : "Application Submitted!"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              {isEditMode
                ? "Your updated application has been resubmitted for review."
                : "Thank you for applying. We'll review your application and get back to you within 7-10 business days."}
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
            {isEditMode && editDbId ? (
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Link href={`/dashboard/applications/${editDbId}`}>
                  View Application
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                View My Applications
              </Button>
            )}
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
        {/* Application Type Toggle - hidden in edit mode */}
        {!isEditMode && (
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
        )}

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
                {currentStep === 4 && (
                  <DocumentsStep
                    applicationType={applicationType}
                    editMode={isEditMode}
                    existingDocuments={existingDocuments}
                  />
                )}
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
        {editLoadFailed && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">
                This application could not be loaded for editing. It may have been
                removed, or it belongs to a different account.
              </p>
            </div>
          </div>
        )}

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
                    {isEditMode ? "Resubmitting..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {isEditMode ? "Resubmit" : "Submit"}
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
