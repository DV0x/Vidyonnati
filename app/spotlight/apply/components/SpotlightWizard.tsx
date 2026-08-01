"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  useForm,
  FormProvider,
  type Resolver,
  type FieldValues,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  getSpotlightStepFields,
  fileFieldToDocumentType,
  flatSpotlightSchema,
} from "@/lib/schemas/spotlight"
import {
  asIncomeBracket,
  requiredNumber,
  requiredOption,
} from "@/lib/formCoercion"
import {
  currentStatusOptions,
  parentStatusOptions,
} from "@/lib/schemas/spotlight"
import { useAuth } from "@/app/context/AuthContext"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id, Doc } from "@/convex/_generated/dataModel"
import { convexErrorMessage, convexErrorData } from "@/lib/convexError"
// Derived from the Convex schema — see the note in ApplicationWizard.
type SpotlightDocumentType = Doc<"spotlightDocuments">["documentType"]

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

interface SpotlightWizardProps {
  editApplicationId?: string
}

// Field mapping: DB snake_case → form camelCase
// Convex documents are camelCase and every form field matches its document
// field name, so the old snake_case→camelCase table is now just a field list.
const EDITABLE_FORM_FIELDS = [
  'fullName', 'dateOfBirth', 'gender', 'phone', 'email',
  'village', 'mandal', 'district', 'state', 'pincode',
  'collegeName', 'courseStream', 'yearOfCompletion', 'totalMarks', 'maxMarks',
  'percentage', 'currentStatus', 'competitiveExams',
  'parentStatus', 'motherName', 'motherOccupation', 'motherHealth',
  'fatherName', 'fatherOccupation', 'fatherHealth',
  'guardianName', 'guardianRelationship', 'guardianDetails',
  'siblingsCount', 'annualFamilyIncome',
  'circumstances', 'circumstancesOther',
  'backgroundStory', 'dreamsGoals', 'howHelpChangesLife', 'annualFinancialNeed',
] as const

export function SpotlightWizard({ editApplicationId }: SpotlightWizardProps) {
  const router = useRouter()
  const { user, student, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [spotlightId, setSpotlightId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditMode = !!editApplicationId

  // See the equivalent block in ApplicationWizard: the ref keeps the resolver's
  // identity stable while still letting it see current exemptions.
  const validationRef = useRef<{ exemptFileFields: string[] }>({
    exemptFileFields: [],
  })

  const resolver = useCallback<Resolver<FieldValues>>(
    async (values, context, options) =>
      zodResolver(flatSpotlightSchema(validationRef.current.exemptFileFields))(
        values,
        context,
        options,
      ),
    [],
  )

  const methods = useForm({
    mode: "onChange",
    resolver,
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

  const createSpotlight = useMutation(api.spotlight.create)
  const updateSpotlight = useMutation(api.spotlight.update)
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const attachSpotlightDocument = useMutation(api.documents.attachSpotlightDocument)

  // Existing application, in edit mode. See the matching note in
  // ApplicationWizard: "skip" when not editing, undefined while loading, null
  // when missing or not yours (deliberately indistinguishable).
  const editApplication = useQuery(
    api.spotlight.mineById,
    editApplicationId
      ? { spotlightApplicationId: editApplicationId as Id<'spotlightApplications'> }
      : 'skip',
  )

  // Derived rather than stored — see the matching note in ApplicationWizard.
  const isLoadingEdit = isEditMode && editApplication === undefined
  const editDbId = editApplication?._id ?? null
  const editLoadFailed = isEditMode && editApplication === null
  const existingDocuments = useMemo(
    () =>
      editApplication?.documents.map((d) => ({
        document_type: d.documentType,
        file_name: d.fileName,
        // Carried so the badge can offer a download through the authorized
        // route; the row id is what convex/http.ts takes.
        id: d._id,
      })) ?? [],
    [editApplication],
  )

  // File fields the server already holds — see ApplicationWizard.
  const exemptFileFields = useMemo(
    () =>
      isEditMode
        ? Object.entries(fileFieldToDocumentType)
            .filter(([, documentType]) =>
              existingDocuments.some((doc) => doc.document_type === documentType),
            )
            .map(([field]) => field)
        : [],
    [isEditMode, existingDocuments],
  )

  // In an effect, not during render — see the note in ApplicationWizard.
  useEffect(() => {
    validationRef.current = { exemptFileFields }
  }, [exemptFileFields])

  useEffect(() => {
    if (!editApplication) return

    const formData: Record<string, unknown> = {}
    for (const field of EDITABLE_FORM_FIELDS) {
      const value = (editApplication as unknown as Record<string, unknown>)[field]
      if (value !== undefined && value !== null) formData[field] = value
    }

    reset((prev) => ({ ...prev, ...formData }))
  }, [editApplication, reset])

  // Pre-fill form with student profile data (skip in edit mode)
  useEffect(() => {
    if (isEditMode) return
    if (student) {
      if (student.fullName) setValue("fullName", student.fullName)
      if (student.email) setValue("email", student.email)
      if (student.phone) setValue("phone", student.phone)
      if (student.dateOfBirth) setValue("dateOfBirth", student.dateOfBirth)
      if (student.gender && (student.gender === "male" || student.gender === "female")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue("gender", student.gender as any)
      }
      if (student.village) setValue("village", student.village)
      if (student.mandal) setValue("mandal", student.mandal)
      if (student.district) setValue("district", student.district)
      if (student.pincode) setValue("pincode", student.pincode)
    }
  }, [student, setValue, isEditMode])

  // Load draft from localStorage (skip in edit mode)
  useEffect(() => {
    if (isEditMode) return
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
  }, [reset, methods, isEditMode])

  // Save draft to localStorage (skip in edit mode)
  const saveDraft = useCallback(() => {
    if (isEditMode) return
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
  }, [currentStep, getValues, isEditMode])

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

    // A document already on the server satisfies its field — see the matching
    // block in ApplicationWizard. Without it the photo on step 0 blocks the
    // resubmit before the student reaches anything else, including the "your
    // photo is already on file" note on the documents step.
    return allFields.filter(
      (field) =>
        !optionalFields.includes(field) && !exemptFileFields.includes(field),
    )
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

  // Upload a document. Three steps rather than one POST — see the matching
  // note in ApplicationWizard. Type and size are enforced in the attach step
  // from Convex's own record of the stored file, not from anything sent here.
  const uploadDocument = async (
    applicationId: Id<'spotlightApplications'>,
    file: File,
    documentType: SpotlightDocumentType,
  ) => {
    const uploadUrl = await generateUploadUrl()

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })

    if (!result.ok) {
      throw new Error(`Failed to upload ${documentType}`)
    }

    const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }

    return attachSpotlightDocument({
      spotlightApplicationId: applicationId,
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

      // Check for required files before submission (skip in edit mode if existing docs cover them)
      if (!isEditMode) {
        if (!data.photo) {
          throw new Error("Photo is required. Please go back to the Documents step and upload your photo.")
        }
        if (!data.marksheet) {
          throw new Error("Marksheet is required. Please go back to the Documents step and upload your marksheet.")
        }
        if (!data.aadhar) {
          throw new Error("Aadhar card is required. Please go back to the Documents step and upload your Aadhar.")
        }
      } else {
        // In edit mode, only require files if they don't already exist
        const hasExistingPhoto = existingDocuments.some(d => d.document_type === 'photo')
        const hasExistingMarksheet = existingDocuments.some(d => d.document_type === 'marksheet')
        const hasExistingAadhar = existingDocuments.some(d => d.document_type === 'aadhar')

        if (!data.photo && !hasExistingPhoto) {
          throw new Error("Photo is required. Please go back and upload your photo.")
        }
        if (!data.marksheet && !hasExistingMarksheet) {
          throw new Error("Marksheet is required. Please go back and upload your marksheet.")
        }
        if (!data.aadhar && !hasExistingAadhar) {
          throw new Error("Aadhar card is required. Please go back and upload your Aadhar.")
        }
      }

      // Field names match the mutation arguments exactly now. Empty optionals
      // become undefined rather than null — Convex optionals are absent or
      // present, and its validators reject null as a distinct value.
      const applicationData = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender || undefined,
        phone: data.phone,
        email: data.email,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        state: data.state,
        pincode: data.pincode,

        // Education
        collegeName: data.collegeName,
        courseStream: data.courseStream,
        yearOfCompletion: requiredNumber(data.yearOfCompletion, "Year of completion"),
        totalMarks: requiredNumber(data.totalMarks, "Total marks"),
        maxMarks: requiredNumber(data.maxMarks, "Maximum marks"),
        percentage: requiredNumber(data.percentage, "Percentage"),
        currentStatus: requiredOption(
          data.currentStatus,
          currentStatusOptions,
          "Current status",
        ),

        // Competitive Exams
        competitiveExams:
          data.competitiveExams.length > 0 ? data.competitiveExams : undefined,

        // Family Background
        parentStatus: requiredOption(
          data.parentStatus,
          parentStatusOptions,
          "Parent status",
        ),
        motherName: data.motherName || undefined,
        motherOccupation: data.motherOccupation || undefined,
        motherHealth: data.motherHealth || undefined,
        fatherName: data.fatherName || undefined,
        fatherOccupation: data.fatherOccupation || undefined,
        fatherHealth: data.fatherHealth || undefined,
        guardianName: data.guardianName || undefined,
        guardianRelationship: data.guardianRelationship || undefined,
        guardianDetails: data.guardianDetails || undefined,
        siblingsCount: data.siblingsCount || undefined,
        annualFamilyIncome: asIncomeBracket(data.annualFamilyIncome),

        // Circumstances
        circumstances: data.circumstances,
        circumstancesOther: data.circumstancesOther || undefined,

        // Story & Goals
        backgroundStory: data.backgroundStory,
        dreamsGoals: data.dreamsGoals,
        howHelpChangesLife: data.howHelpChangesLife,
        annualFinancialNeed: requiredNumber(
          data.annualFinancialNeed,
          "Annual financial need",
        ),
      }

      let appId: Id<'spotlightApplications'>
      let applicationSpotlightId: string

      if (isEditMode && editDbId) {
        const result = await updateSpotlight({ id: editDbId, ...applicationData })
        appId = result.id
        applicationSpotlightId = result.spotlightId
      } else {
        try {
          const result = await createSpotlight(applicationData)
          appId = result.id
          applicationSpotlightId = result.spotlightId
        } catch (error) {
          // A student who already has an application in flight still gets their
          // uploads attached to it rather than losing them — the same recovery
          // the old 409-then-refetch branch performed, minus the round trip,
          // because both ids ride along on the error.
          const info = convexErrorData(error) as
            | { code?: string; existingApplicationId?: string; existingId?: string }
            | null
          if (info?.code === "DUPLICATE_SPOTLIGHT" && info.existingId && info.existingApplicationId) {
            appId = info.existingId as Id<'spotlightApplications'>
            applicationSpotlightId = info.existingApplicationId
          } else {
            throw error
          }
        }
      }

      setSpotlightId(applicationSpotlightId)

      // Upload documents (only new files where user selected them)
      const documentUploads: Promise<unknown>[] = []

      // Photo
      if (data.photo) {
        documentUploads.push(
          uploadDocument(appId, data.photo as File, "photo")
        )
      }

      // Marksheet
      if (data.marksheet) {
        documentUploads.push(
          uploadDocument(appId, data.marksheet as File, "marksheet")
        )
      }

      // Aadhar
      if (data.aadhar) {
        documentUploads.push(
          uploadDocument(appId, data.aadhar as File, "aadhar")
        )
      }

      // Income Certificate (optional)
      if (data.incomeCertificate) {
        documentUploads.push(
          uploadDocument(
            appId,
            data.incomeCertificate as File,
            "income_certificate"
          )
        )
      }

      // Wait for all uploads
      await Promise.all(documentUploads)

      // Clear draft from localStorage (only for new applications)
      if (!isEditMode) {
        localStorage.removeItem(STORAGE_KEY)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Spotlight submission error:", error)
      setSubmitError(
        convexErrorMessage(error, "Something went wrong. Please try again."),
      )
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
              {isEditMode ? "Application Resubmitted!" : "Application Submitted!"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              {isEditMode
                ? "Your updated application has been resubmitted for review."
                : "Thank you for applying for the Spotlight program. Our team will review your application and get back to you soon."}
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
            {isEditMode && editDbId ? (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Link href={`/dashboard/spotlight/${editDbId}`}>
                  View Application
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
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
                {currentStep === 0 && (
                  <PersonalInfoStep existingDocuments={existingDocuments} />
                )}
                {currentStep === 1 && <EducationStep />}
                {currentStep === 2 && <CompetitiveExamsStep />}
                {currentStep === 3 && <FamilyBackgroundStep />}
                {currentStep === 4 && <CircumstancesStep />}
                {currentStep === 5 && <StoryGoalsStep />}
                {currentStep === 6 && (
                  <DocumentsStep
                    editMode={isEditMode}
                    existingDocuments={existingDocuments}
                  />
                )}
                {currentStep === 7 && <ReviewStep onEdit={goToStep} />}
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
