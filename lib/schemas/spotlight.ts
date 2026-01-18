import { z } from "zod"

// ============================================
// Constants & Options
// ============================================

export const genderOptions = ["male", "female"] as const

export const parentStatusOptions = [
  "both_alive",
  "single_parent_father",
  "single_parent_mother",
  "orphan",
] as const

export const parentStatusLabels: Record<(typeof parentStatusOptions)[number], string> = {
  both_alive: "Both Parents Alive",
  single_parent_father: "Single Parent (Father Only)",
  single_parent_mother: "Single Parent (Mother Only)",
  orphan: "Orphan (No Parents)",
}

export const currentStatusOptions = [
  "studying",
  "seeking_admission",
  "working",
  "other",
] as const

export const currentStatusLabels: Record<(typeof currentStatusOptions)[number], string> = {
  studying: "Currently Studying",
  seeking_admission: "Seeking Admission",
  working: "Working",
  other: "Other",
}

export const incomeBrackets = [
  "below-1-lakh",
  "1-2-lakhs",
  "2-3-lakhs",
  "3-5-lakhs",
  "above-5-lakhs",
] as const

export const incomeBracketLabels: Record<(typeof incomeBrackets)[number], string> = {
  "below-1-lakh": "Below 1 Lakh",
  "1-2-lakhs": "1-2 Lakhs",
  "2-3-lakhs": "2-3 Lakhs",
  "3-5-lakhs": "3-5 Lakhs",
  "above-5-lakhs": "Above 5 Lakhs",
}

export const circumstanceOptions = [
  "single_parent",
  "orphan",
  "parent_disability",
  "parent_chronic_illness",
  "family_debt",
  "natural_disaster",
  "first_generation",
  "below_poverty_line",
  "no_stable_income",
  "other",
] as const

export const circumstanceLabels: Record<(typeof circumstanceOptions)[number], string> = {
  single_parent: "Single Parent Household",
  orphan: "Orphan",
  parent_disability: "Parent with Disability",
  parent_chronic_illness: "Parent with Chronic Illness",
  family_debt: "Family Facing Debt",
  natural_disaster: "Affected by Natural Disaster",
  first_generation: "First Generation College Student",
  below_poverty_line: "Below Poverty Line",
  no_stable_income: "No Stable Family Income",
  other: "Other",
}

// ============================================
// Step 1: Personal Information Schema
// ============================================
export const spotlightPersonalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  photo: z.any().refine((file) => file instanceof File, "Photo is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 15 && age <= 35
    }, "You must be between 15 and 35 years old"),
  gender: z.enum(genderOptions, {
    required_error: "Please select gender",
  }),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Please enter a valid email address"),
  village: z
    .string()
    .min(2, "Village/Town is required")
    .max(100, "Village/Town name is too long"),
  mandal: z
    .string()
    .min(2, "Mandal is required")
    .max(100, "Mandal name is too long"),
  district: z
    .string()
    .min(2, "District is required")
    .max(100, "District name is too long"),
  state: z
    .string()
    .min(2, "State is required")
    .max(100, "State name is too long"),
  pincode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
})

// ============================================
// Step 2: Education Schema
// ============================================
export const spotlightEducationSchema = z.object({
  collegeName: z
    .string()
    .min(3, "College/Institution name is required")
    .max(200, "Name is too long"),
  courseStream: z
    .string()
    .min(2, "Course/Stream is required")
    .max(100, "Course name is too long"),
  yearOfCompletion: z
    .number({ required_error: "Year of completion is required" })
    .min(2015, "Year must be 2015 or later")
    .max(new Date().getFullYear() + 5, "Year cannot be too far in future"),
  totalMarks: z
    .number({ required_error: "Total marks is required" })
    .min(0, "Marks cannot be negative")
    .max(2000, "Maximum marks exceeded"),
  maxMarks: z
    .number({ required_error: "Maximum marks is required" })
    .min(100, "Minimum 100")
    .max(2000, "Maximum 2000"),
  percentage: z
    .number({ required_error: "Percentage is required" })
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
  currentStatus: z.enum(currentStatusOptions, {
    required_error: "Please select current status",
  }),
})

// ============================================
// Step 3: Competitive Exams Schema
// ============================================
export const competitiveExamSchema = z.object({
  exam: z.string().min(1, "Exam name is required"),
  score: z.string().optional(),
  rank: z.number().optional(),
  percentile: z.number().min(0).max(100).optional(),
})

export const spotlightCompetitiveExamsSchema = z.object({
  competitiveExams: z.array(competitiveExamSchema).optional(),
})

// ============================================
// Step 4: Family Background Schema (with conditional validation)
// ============================================
export const spotlightFamilySchema = z
  .object({
    parentStatus: z.enum(parentStatusOptions, {
      required_error: "Please select parent status",
    }),
    // Mother fields (conditional)
    motherName: z.string().max(100, "Name is too long").optional(),
    motherOccupation: z.string().max(100, "Occupation is too long").optional(),
    motherHealth: z.string().max(200, "Health details too long").optional(),
    // Father fields (conditional)
    fatherName: z.string().max(100, "Name is too long").optional(),
    fatherOccupation: z.string().max(100, "Occupation is too long").optional(),
    fatherHealth: z.string().max(200, "Health details too long").optional(),
    // Guardian fields (for orphans or when no parents)
    guardianName: z.string().max(100, "Name is too long").optional(),
    guardianRelationship: z.string().max(50, "Relationship is too long").optional(),
    guardianDetails: z.string().max(200, "Details too long").optional(),
    // Siblings
    siblingsCount: z
      .number()
      .min(0, "Cannot be negative")
      .max(15, "Maximum 15 siblings")
      .optional(),
    // Income
    annualFamilyIncome: z.enum(incomeBrackets).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate mother fields when mother is alive
    if (data.parentStatus === "both_alive" || data.parentStatus === "single_parent_mother") {
      if (!data.motherName || data.motherName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mother's name is required",
          path: ["motherName"],
        })
      }
    }

    // Validate father fields when father is alive
    if (data.parentStatus === "both_alive" || data.parentStatus === "single_parent_father") {
      if (!data.fatherName || data.fatherName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Father's name is required",
          path: ["fatherName"],
        })
      }
    }

    // Validate guardian fields for orphans
    if (data.parentStatus === "orphan") {
      if (!data.guardianName || data.guardianName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guardian name is required",
          path: ["guardianName"],
        })
      }
      if (!data.guardianRelationship || data.guardianRelationship.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guardian relationship is required",
          path: ["guardianRelationship"],
        })
      }
    }
  })

// ============================================
// Step 5: Circumstances Schema
// ============================================
export const spotlightCircumstancesSchema = z.object({
  circumstances: z.array(z.enum(circumstanceOptions)).min(1, "Please select at least one circumstance"),
  circumstancesOther: z.string().max(500, "Maximum 500 characters").optional(),
})

// ============================================
// Step 6: Story & Goals Schema
// ============================================
export const spotlightStorySchema = z.object({
  backgroundStory: z
    .string()
    .min(100, "Please write at least 100 characters about your background")
    .max(2000, "Maximum 2000 characters allowed"),
  dreamsGoals: z
    .string()
    .min(100, "Please write at least 100 characters about your dreams and goals")
    .max(2000, "Maximum 2000 characters allowed"),
  howHelpChangesLife: z
    .string()
    .min(50, "Please write at least 50 characters")
    .max(1000, "Maximum 1000 characters allowed"),
  annualFinancialNeed: z
    .number({ required_error: "Annual financial need is required" })
    .min(10000, "Minimum 10,000")
    .max(500000, "Maximum 5,00,000"),
})

// ============================================
// Step 7: Documents Schema
// ============================================
export const spotlightDocumentsSchema = z.object({
  marksheet: z.any().refine((file) => file instanceof File, "Marksheet is required"),
  aadhar: z.any().refine((file) => file instanceof File, "Aadhar card is required"),
  incomeCertificate: z.any().optional(),
  otherDocuments: z.array(z.any()).optional(),
})

// ============================================
// Step Fields Mapping for Validation
// ============================================
export const spotlightStepFields: Record<number, string[]> = {
  0: ["fullName", "photo", "dateOfBirth", "gender", "phone", "email", "village", "mandal", "district", "state", "pincode"],
  1: ["collegeName", "courseStream", "yearOfCompletion", "totalMarks", "maxMarks", "percentage", "currentStatus"],
  2: ["competitiveExams"],
  3: ["parentStatus", "motherName", "motherOccupation", "motherHealth", "fatherName", "fatherOccupation", "fatherHealth", "guardianName", "guardianRelationship", "guardianDetails", "siblingsCount", "annualFamilyIncome"],
  4: ["circumstances", "circumstancesOther"],
  5: ["backgroundStory", "dreamsGoals", "howHelpChangesLife", "annualFinancialNeed"],
  6: ["marksheet", "aadhar", "incomeCertificate", "otherDocuments"],
  7: [], // Review step - no validation
}

export function getSpotlightStepFields(step: number): string[] {
  return spotlightStepFields[step] || []
}

// ============================================
// Combined Types
// ============================================
export type SpotlightPersonalInfo = z.infer<typeof spotlightPersonalInfoSchema>
export type SpotlightEducation = z.infer<typeof spotlightEducationSchema>
export type CompetitiveExam = z.infer<typeof competitiveExamSchema>
export type SpotlightFamily = z.infer<typeof spotlightFamilySchema>
export type SpotlightCircumstances = z.infer<typeof spotlightCircumstancesSchema>
export type SpotlightStory = z.infer<typeof spotlightStorySchema>
export type SpotlightDocuments = z.infer<typeof spotlightDocumentsSchema>
