import { z } from "zod"

// Application type
export const applicationTypes = ["first-year", "second-year"] as const
export type ApplicationType = (typeof applicationTypes)[number]

// Gender options
export const genderOptions = ["male", "female"] as const

// Income bracket options
export const incomeBrackets = [
  "below-1-lakh",
  "1-2-lakhs",
  "2-3-lakhs",
  "3-5-lakhs",
  "above-5-lakhs",
] as const

export const incomeBracketLabels: Record<typeof incomeBrackets[number], string> = {
  "below-1-lakh": "Below 1 Lakh",
  "1-2-lakhs": "1-2 Lakhs",
  "2-3-lakhs": "2-3 Lakhs",
  "3-5-lakhs": "3-5 Lakhs",
  "above-5-lakhs": "Above 5 Lakhs",
}

// ============================================
// Step 1: Personal Information Schema
// ============================================

// Base personal info (common to both application types)
const basePersonalInfoSchema = z.object({
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
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 15 && age <= 35
    }, "You must be between 15 and 35 years old"),
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
  pincode: z
    .string()
    .regex(/^\d{6}$/, "PIN code must be 6 digits"),
  address: z
    .string()
    .min(5, "Please enter your street/door number details")
    .max(500, "Address is too long"),
})

// First year personal info (no gender field)
export const firstYearPersonalInfoSchema = basePersonalInfoSchema

// Second year personal info (includes gender)
export const secondYearPersonalInfoSchema = basePersonalInfoSchema.extend({
  gender: z.enum(genderOptions, {
    required_error: "Please select gender",
  }),
})

// Export base for backward compatibility
export const personalInfoSchema = basePersonalInfoSchema

// ============================================
// Step 2: Family Details Schema
// ============================================

// First year: Simple - just parent names and optional guardian
export const firstYearFamilySchema = z.object({
  motherName: z
    .string()
    .min(2, "Mother's name is required")
    .max(100, "Name is too long"),
  fatherName: z
    .string()
    .min(2, "Father's name is required")
    .max(100, "Name is too long"),
  guardianName: z
    .string()
    .max(100, "Name is too long")
    .optional(),
  guardianRelationship: z
    .string()
    .max(50, "Relationship is too long")
    .optional(),
})

// Second year: Full details - parent names with occupation & mobile, family count, income
export const secondYearFamilySchema = z.object({
  motherName: z
    .string()
    .min(2, "Mother's name is required")
    .max(100, "Name is too long"),
  motherOccupation: z
    .string()
    .min(2, "Mother's occupation is required")
    .max(100, "Occupation is too long"),
  motherMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  fatherName: z
    .string()
    .min(2, "Father's name is required")
    .max(100, "Name is too long"),
  fatherOccupation: z
    .string()
    .min(2, "Father's occupation is required")
    .max(100, "Occupation is too long"),
  fatherMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  guardianDetails: z
    .string()
    .max(200, "Guardian details is too long")
    .optional(),
  familyAdultsCount: z
    .number({ required_error: "Number of adults is required" })
    .min(1, "Must have at least 1 adult")
    .max(20, "Maximum 20 adults"),
  familyChildrenCount: z
    .number({ required_error: "Number of children is required" })
    .min(0, "Cannot be negative")
    .max(15, "Maximum 15 children"),
  annualFamilyIncome: z.enum(incomeBrackets, {
    required_error: "Please select annual family income",
  }),
})

// Backward compatibility - keep old name
export const familyBackgroundSchema = firstYearFamilySchema
export const secondYearFamilyBackgroundSchema = secondYearFamilySchema

// ============================================
// Step 3: Education Schema
// ============================================

// First year: High school + SSC marks + College admission details
export const firstYearEducationSchema = z.object({
  highSchoolStudied: z
    .string()
    .min(3, "High school name is required")
    .max(200, "School name is too long"),
  sscTotalMarks: z
    .number({ required_error: "SSC total marks is required" })
    .min(0, "Marks cannot be negative")
    .max(700, "Maximum marks exceeded"),
  sscMaxMarks: z
    .number({ required_error: "SSC maximum marks is required" })
    .min(100, "Minimum 100")
    .max(700, "Maximum 700"),
  sscPercentage: z
    .number({ required_error: "SSC percentage is required" })
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
  collegeAdmitted: z
    .string()
    .min(3, "College/Institution name is required")
    .max(200, "Name is too long"),
  collegeAddress: z
    .string()
    .min(10, "College address is required")
    .max(500, "Address is too long"),
  courseJoined: z
    .string()
    .min(2, "Course name is required")
    .max(100, "Course name is too long"),
  groupSubjects: z
    .string()
    .min(2, "Group/Subjects are required")
    .max(200, "Too long"),
  dateOfAdmission: z
    .string()
    .min(1, "Date of admission is required"),
})

// Second year: All of above + 1st year marks
export const secondYearEducationSchema = z.object({
  highSchoolStudied: z
    .string()
    .min(3, "High school name is required")
    .max(200, "School name is too long"),
  sscTotalMarks: z
    .number({ required_error: "SSC total marks is required" })
    .min(0, "Marks cannot be negative")
    .max(700, "Maximum marks exceeded"),
  sscMaxMarks: z
    .number({ required_error: "SSC maximum marks is required" })
    .min(100, "Minimum 100")
    .max(700, "Maximum 700"),
  sscPercentage: z
    .number({ required_error: "SSC percentage is required" })
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
  currentCollege: z
    .string()
    .min(3, "College/Institution name is required")
    .max(200, "Name is too long"),
  collegeAddress: z
    .string()
    .min(10, "College address is required")
    .max(500, "Address is too long"),
  courseStudying: z
    .string()
    .min(2, "Course name is required")
    .max(100, "Course name is too long"),
  groupSubjects: z
    .string()
    .min(2, "Group/Subjects are required")
    .max(200, "Too long"),
  firstYearTotalMarks: z
    .number({ required_error: "1st year total marks is required" })
    .min(0, "Marks cannot be negative")
    .max(1200, "Maximum marks exceeded"),
  firstYearMaxMarks: z
    .number({ required_error: "1st year maximum marks is required" })
    .min(100, "Minimum 100")
    .max(1200, "Maximum 1200"),
  firstYearPercentage: z
    .number({ required_error: "1st year percentage is required" })
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
})

// ============================================
// Step 4: Bank Details Schema (NEW)
// ============================================
export const bankDetailsSchema = z.object({
  bankAccountNumber: z
    .string()
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number cannot exceed 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  bankNameBranch: z
    .string()
    .min(5, "Bank name and branch is required")
    .max(200, "Bank name and branch is too long"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code (e.g., SBIN0001234)"),
})

// ============================================
// Step 5: Documents Schema
// ============================================

// First year documents
export const firstYearDocumentsSchema = z.object({
  sscMarksheet: z.any().refine((file) => file instanceof File, "SSC marks sheet is required"),
  aadharStudent: z.any().refine((file) => file instanceof File, "Student Aadhar is required"),
  aadharParent: z.any().refine((file) => file instanceof File, "Parent/Guardian Aadhar is required"),
  bonafideCertificate: z.any().refine((file) => file instanceof File, "Bonafide certificate is required"),
  bankPassbook: z.any().refine((file) => file instanceof File, "Bank passbook first page is required"),
})

// Second year documents
export const secondYearDocumentsSchema = z.object({
  aadharStudent: z.any().refine((file) => file instanceof File, "Student Aadhar is required"),
  aadharParent: z.any().refine((file) => file instanceof File, "Parent/Guardian Aadhar is required"),
  bankPassbook: z.any().refine((file) => file instanceof File, "Bank passbook first page is required"),
  bonafideCertificate: z.any().refine((file) => file instanceof File, "Bonafide/Study certificate is required"),
  firstYearMarksheet: z.any().refine((file) => file instanceof File, "1st year marks sheet is required"),
  mangoPlantPhoto: z.any().optional(), // Optional
})

// ============================================
// Step 5 (2nd year only): Statement/Essays Schema
// ============================================
export const secondYearStatementSchema = z.object({
  studyActivities: z
    .string()
    .min(50, "Please write at least 50 characters about your study and activities")
    .max(1000, "Maximum 1000 characters allowed"),
  goalsDreams: z
    .string()
    .min(50, "Please write at least 50 characters about your goals and dreams")
    .max(1000, "Maximum 1000 characters allowed"),
  additionalInfo: z
    .string()
    .max(500, "Maximum 500 characters allowed")
    .optional(),
})

// ============================================
// Combined Schemas
// ============================================
export const firstYearApplicationSchema = z.object({
  applicationType: z.literal("first-year"),
  personalInfo: firstYearPersonalInfoSchema,
  family: firstYearFamilySchema,
  education: firstYearEducationSchema,
  bankDetails: bankDetailsSchema,
  documents: firstYearDocumentsSchema,
})

export const secondYearApplicationSchema = z.object({
  applicationType: z.literal("second-year"),
  personalInfo: secondYearPersonalInfoSchema,
  family: secondYearFamilySchema,
  education: secondYearEducationSchema,
  bankDetails: bankDetailsSchema,
  documents: secondYearDocumentsSchema,
  statement: secondYearStatementSchema,
})

// ============================================
// Types
// ============================================
export type FirstYearPersonalInfo = z.infer<typeof firstYearPersonalInfoSchema>
export type SecondYearPersonalInfo = z.infer<typeof secondYearPersonalInfoSchema>
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type FirstYearFamily = z.infer<typeof firstYearFamilySchema>
export type SecondYearFamily = z.infer<typeof secondYearFamilySchema>
export type FirstYearEducation = z.infer<typeof firstYearEducationSchema>
export type SecondYearEducation = z.infer<typeof secondYearEducationSchema>
export type BankDetails = z.infer<typeof bankDetailsSchema>
export type FirstYearDocuments = z.infer<typeof firstYearDocumentsSchema>
export type SecondYearDocuments = z.infer<typeof secondYearDocumentsSchema>
export type SecondYearStatement = z.infer<typeof secondYearStatementSchema>
export type FirstYearApplication = z.infer<typeof firstYearApplicationSchema>
export type SecondYearApplication = z.infer<typeof secondYearApplicationSchema>

// Backward compatibility aliases
export type FamilyBackground = FirstYearFamily
export type SecondYearFamilyBackground = SecondYearFamily

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

// ============================================
// Helper function to get schema by step and type
// ============================================
export function getStepSchema(step: number, applicationType: ApplicationType) {
  if (applicationType === "first-year") {
    switch (step) {
      case 0: return firstYearPersonalInfoSchema
      case 1: return firstYearFamilySchema
      case 2: return firstYearEducationSchema
      case 3: return bankDetailsSchema
      case 4: return firstYearDocumentsSchema
      case 5: return z.object({}) // Review step - no validation
      default: return z.object({})
    }
  } else {
    switch (step) {
      case 0: return secondYearPersonalInfoSchema
      case 1: return secondYearFamilySchema
      case 2: return secondYearEducationSchema
      case 3: return bankDetailsSchema
      case 4: return secondYearDocumentsSchema.merge(secondYearStatementSchema)
      case 5: return z.object({}) // Review step - no validation
      default: return z.object({})
    }
  }
}

// ============================================
// Step field names for validation
// ============================================
export const firstYearStepFields: Record<number, string[]> = {
  0: ['fullName', 'email', 'phone', 'dateOfBirth', 'village', 'mandal', 'district', 'pincode', 'address'],
  1: ['motherName', 'fatherName', 'guardianName', 'guardianRelationship'],
  2: ['highSchoolStudied', 'sscTotalMarks', 'sscMaxMarks', 'sscPercentage', 'collegeAdmitted', 'collegeAddress', 'courseJoined', 'groupSubjects', 'dateOfAdmission'],
  3: ['bankAccountNumber', 'bankNameBranch', 'ifscCode'],
  4: ['sscMarksheet', 'aadharStudent', 'aadharParent', 'bonafideCertificate', 'bankPassbook'],
  5: [], // Review step
}

export const secondYearStepFields: Record<number, string[]> = {
  0: ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'village', 'mandal', 'district', 'pincode', 'address'],
  1: ['motherName', 'motherOccupation', 'motherMobile', 'fatherName', 'fatherOccupation', 'fatherMobile', 'guardianDetails', 'familyAdultsCount', 'familyChildrenCount', 'annualFamilyIncome'],
  2: ['highSchoolStudied', 'sscTotalMarks', 'sscMaxMarks', 'sscPercentage', 'currentCollege', 'collegeAddress', 'courseStudying', 'groupSubjects', 'firstYearTotalMarks', 'firstYearMaxMarks', 'firstYearPercentage'],
  3: ['bankAccountNumber', 'bankNameBranch', 'ifscCode'],
  4: ['aadharStudent', 'aadharParent', 'bankPassbook', 'bonafideCertificate', 'firstYearMarksheet', 'mangoPlantPhoto', 'studyActivities', 'goalsDreams', 'additionalInfo'],
  5: [], // Review step
}

export function getStepFields(step: number, applicationType: ApplicationType): string[] {
  if (applicationType === "first-year") {
    return firstYearStepFields[step] || []
  }
  return secondYearStepFields[step] || []
}
