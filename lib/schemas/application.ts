import { z } from "zod"

// Application type
export const applicationTypes = ["first-year", "second-year"] as const
export type ApplicationType = (typeof applicationTypes)[number]

// Indian states for dropdown
export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
] as const

// Institution types
export const institutionTypes = ["school", "junior-college", "degree-college", "university"] as const

// Guardian relations
export const guardianRelations = ["father", "mother", "guardian", "other"] as const

// ============================================
// Step 1: Personal Information Schema
// ============================================
export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  address: z
    .string()
    .min(10, "Please enter your complete address")
    .max(500, "Address is too long"),
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(1, "Please select your state"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "PIN code must be 6 digits"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 15 && age <= 35
    }, "You must be between 15 and 35 years old"),
})

// ============================================
// Step 2: Education Schema (varies by application type)
// ============================================
const baseEducationSchema = z.object({
  currentInstitution: z
    .string()
    .min(3, "Institution name is required")
    .max(200, "Institution name is too long"),
  institutionType: z.enum(institutionTypes, {
    required_error: "Please select institution type",
  }),
  classOrYear: z
    .string()
    .min(1, "Class/Year is required"),
  fieldOfStudy: z
    .string()
    .min(2, "Field of study is required")
    .max(100, "Field of study is too long"),
  boardOrUniversity: z
    .string()
    .min(2, "Board/University name is required")
    .max(200, "Board/University name is too long"),
})

// First year: needs 10th marks
export const firstYearEducationSchema = baseEducationSchema.extend({
  previousMarksPercentage: z
    .string()
    .min(1, "10th class marks/percentage is required"),
  previousMarksType: z.enum(["percentage", "cgpa", "grade"], {
    required_error: "Please select marks type",
  }),
})

// Second year: needs current year marks
export const secondYearEducationSchema = baseEducationSchema.extend({
  currentYearMarks: z
    .string()
    .min(1, "Current year marks are required"),
  currentMarksType: z.enum(["percentage", "cgpa", "grade"], {
    required_error: "Please select marks type",
  }),
  previousScholarshipId: z
    .string()
    .optional(),
})

// ============================================
// Step 3: Family Background Schema
// ============================================
export const familyBackgroundSchema = z.object({
  guardianName: z
    .string()
    .min(2, "Guardian name is required")
    .max(100, "Name is too long"),
  guardianRelation: z.enum(guardianRelations, {
    required_error: "Please select relation",
  }),
  guardianPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  guardianOccupation: z
    .string()
    .min(2, "Occupation is required")
    .max(100, "Occupation is too long"),
  annualFamilyIncome: z
    .string()
    .min(1, "Annual family income is required"),
  numberOfDependents: z
    .number({ required_error: "Number of dependents is required" })
    .min(1, "Must have at least 1 dependent")
    .max(15, "Maximum 15 dependents"),
  incomeSource: z
    .string()
    .min(2, "Income source is required")
    .max(200, "Income source is too long"),
})

// Second year: family background is optional (can skip if unchanged)
export const secondYearFamilyBackgroundSchema = z.object({
  familyDetailsUnchanged: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianRelation: z.enum(guardianRelations).optional(),
  guardianPhone: z.string().optional(),
  guardianOccupation: z.string().optional(),
  annualFamilyIncome: z
    .string()
    .min(1, "Annual family income is required (may have changed)"),
  numberOfDependents: z.number().optional(),
  incomeSource: z.string().optional(),
})

// ============================================
// Step 4: Documents Schema
// ============================================
// Note: File validation will be handled separately in the component
// This schema validates the metadata/state
export const firstYearDocumentsSchema = z.object({
  photo: z.any().refine((file) => file instanceof File, "Photo is required"),
  idProof: z.any().refine((file) => file instanceof File, "ID proof is required"),
  incomeCertificate: z.any().refine((file) => file instanceof File, "Income certificate is required"),
  tenthMarksheet: z.any().refine((file) => file instanceof File, "10th marksheet is required"),
})

export const secondYearDocumentsSchema = z.object({
  photo: z.any().optional(), // Optional - only if updating
  incomeCertificate: z.any().refine((file) => file instanceof File, "Current income certificate is required"),
  currentYearMarksheet: z.any().refine((file) => file instanceof File, "Current year marksheet is required"),
})

// ============================================
// Step 5: Statement Schema
// ============================================
export const firstYearStatementSchema = z.object({
  whyNeedScholarship: z
    .string()
    .min(100, "Please write at least 100 characters explaining why you need this scholarship")
    .max(1000, "Maximum 1000 characters allowed"),
  educationalGoals: z
    .string()
    .min(50, "Please write at least 50 characters about your educational goals")
    .max(500, "Maximum 500 characters allowed"),
  careerAspirations: z
    .string()
    .min(50, "Please write at least 50 characters about your career aspirations")
    .max(500, "Maximum 500 characters allowed"),
})

export const secondYearStatementSchema = z.object({
  progressReport: z
    .string()
    .min(100, "Please write at least 100 characters about your progress this year")
    .max(1000, "Maximum 1000 characters allowed"),
  educationalGoals: z
    .string()
    .min(50, "Please write at least 50 characters about your updated goals")
    .max(500, "Maximum 500 characters allowed"),
  challengesFaced: z
    .string()
    .max(500, "Maximum 500 characters allowed")
    .optional(),
})

// ============================================
// Combined Schemas
// ============================================
export const firstYearApplicationSchema = z.object({
  applicationType: z.literal("first-year"),
  personalInfo: personalInfoSchema,
  education: firstYearEducationSchema,
  familyBackground: familyBackgroundSchema,
  documents: firstYearDocumentsSchema,
  statement: firstYearStatementSchema,
})

export const secondYearApplicationSchema = z.object({
  applicationType: z.literal("second-year"),
  personalInfo: personalInfoSchema,
  education: secondYearEducationSchema,
  familyBackground: secondYearFamilyBackgroundSchema,
  documents: secondYearDocumentsSchema,
  statement: secondYearStatementSchema,
})

// ============================================
// Types
// ============================================
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type FirstYearEducation = z.infer<typeof firstYearEducationSchema>
export type SecondYearEducation = z.infer<typeof secondYearEducationSchema>
export type FamilyBackground = z.infer<typeof familyBackgroundSchema>
export type SecondYearFamilyBackground = z.infer<typeof secondYearFamilyBackgroundSchema>
export type FirstYearDocuments = z.infer<typeof firstYearDocumentsSchema>
export type SecondYearDocuments = z.infer<typeof secondYearDocumentsSchema>
export type FirstYearStatement = z.infer<typeof firstYearStatementSchema>
export type SecondYearStatement = z.infer<typeof secondYearStatementSchema>
export type FirstYearApplication = z.infer<typeof firstYearApplicationSchema>
export type SecondYearApplication = z.infer<typeof secondYearApplicationSchema>

// ============================================
// "I Want to Help" Modal Schema
// ============================================
export const helpTypes = ["donate", "volunteer", "corporate", "other"] as const

export const helpInterestSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required")
    .max(100, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  helpType: z.enum(helpTypes, {
    required_error: "Please select how you would like to help",
  }),
  message: z
    .string()
    .max(500, "Maximum 500 characters allowed")
    .optional(),
})

export type HelpInterest = z.infer<typeof helpInterestSchema>
