# Vidyonnati Foundation - Project Summary

## Overview

Educational scholarship platform connecting donors with meritorious students from economically disadvantaged backgrounds in India.

**Tech Stack**: Next.js 16 | React 19 | TypeScript | Tailwind CSS | Shadcn/ui | React Hook Form + Zod | Framer Motion

---

## Directory Structure

```
/Vidyonnati
├── app/
│   ├── layout.tsx              # Root layout with DonorProvider
│   ├── page.tsx                # Home page
│   ├── globals.css
│   ├── components/             # Home page sections
│   │   ├── TopNavigation.tsx
│   │   ├── MainNavigation.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── ImpactStatsSection.tsx
│   │   ├── StudentSpotlightSection.tsx
│   │   ├── WelcomeSection.tsx
│   │   ├── EmpoweringSection.tsx
│   │   ├── GoalsSection.tsx
│   │   ├── HowWeWorkSection.tsx
│   │   ├── WhySupportUsSection.tsx
│   │   ├── TestimonialSection.tsx
│   │   ├── Footer.tsx
│   │   ├── AnimatedInput.tsx
│   │   ├── AnimatedTextarea.tsx
│   │   ├── FileUpload.tsx
│   │   └── WireTransferForm.tsx
│   │
│   ├── apply/                  # Scholarship application
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── ApplicationWizard.tsx
│   │       ├── StepProgress.tsx
│   │       └── steps/
│   │           ├── PersonalInfoStep.tsx
│   │           ├── FamilyBackgroundStep.tsx
│   │           ├── EducationStep.tsx
│   │           ├── BankDetailsStep.tsx
│   │           ├── DocumentsStep.tsx
│   │           └── ReviewStep.tsx
│   │
│   ├── donate/                 # Donation flow
│   │   ├── page.tsx
│   │   └── wire-transfer/
│   │       └── page.tsx
│   │
│   └── context/
│       └── DonorContext.tsx    # Global donor state
│
├── components/
│   ├── theme-provider.tsx
│   └── ui/                     # Shadcn/ui (60+ components)
│
├── lib/
│   ├── utils.ts
│   └── schemas/
│       └── application.ts      # Zod validation schemas
│
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts
```

---

## Component Flow

### 1. Home Page (`/`)

```
layout.tsx (DonorProvider wrapper)
    └── page.tsx
        ├── TopNavigation      → Scrollable info bar
        ├── MainNavigation     → Sticky nav with responsive menu
        ├── HeroSlider         → 4-slide auto-rotating carousel
        ├── ImpactStatsSection → Key metrics display
        ├── WelcomeSection     → Value proposition
        ├── StudentSpotlightSection → Featured student stories
        ├── EmpoweringSection  → Mission statement
        ├── GoalsSection       → Organization goals
        ├── HowWeWorkSection   → Step-by-step process
        ├── WhySupportUsSection → Reasons to support
        ├── TestimonialSection → Success stories
        └── Footer             → Links & social media
```

### 2. Application Flow (`/apply`)

```
ApplicationWizard (6-step form, type toggle: New/Renewal)
    │
    ├── StepProgress (visual indicator, clickable completed steps)
    │
    └── Steps (conditional by applicant type):
        │
        ├── Step 0: PersonalInfoStep
        │   → Name, email, phone, DOB, village, mandal, district, PIN, address
        │   → 2nd Year adds: Gender
        │
        ├── Step 1: FamilyBackgroundStep
        │   → 1st Year: Mother/Father names, optional guardian
        │   → 2nd Year: + occupation, mobile, family count, income bracket
        │
        ├── Step 2: EducationStep
        │   → High school, SSC marks (total/max/auto-%), college, course
        │   → 2nd Year adds: 1st year marks (total/max/auto-%)
        │
        ├── Step 3: BankDetailsStep
        │   → Account number, bank name/branch, IFSC code
        │
        ├── Step 4: DocumentsStep
        │   → 1st Year: SSC marksheet, student/parent Aadhar, bonafide, passbook
        │   → 2nd Year: + 1st year marksheet, mango plant photo (optional)
        │   → 2nd Year: Essays (study activities, goals/dreams)
        │
        └── Step 5: ReviewStep
            → Summary with edit buttons per section
            → Declaration → Submit → Success with Application ID

Auto-Save: localStorage with 24hr expiry (excludes file uploads)
```

### 3. Donation Flow (`/donate`)

```
DonorContext (global state)
    │
    ├── DonatePage (/donate)
    │   ├── Amount selection ($500-$5000 or custom)
    │   ├── Donor info form (name, email, phone)
    │   └── setDonorInfo() → Context update
    │       └── Navigate to wire-transfer
    │
    └── WireTransferPage (/donate/wire-transfer)
        ├── Reads donorInfo from context
        ├── Displays bank transfer details
        └── WireTransferForm component
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   DonorContext                           │
│         { name, email, phone, amount }                  │
└──────────────┬─────────────────────────┬────────────────┘
               │                         │
        ┌──────▼──────┐          ┌───────▼───────┐
        │ Donate Page │──────────▶ Wire Transfer │
        └─────────────┘          └───────────────┘
               setDonorInfo()          reads context

┌─────────────────────────────────────────────────────────┐
│              Application Wizard                          │
│         useForm() + Zod Schemas                         │
└──────────────┬──────────────────────────────────────────┘
               │
     ┌─────────▼─────────┐
     │  Step Navigation  │
     │  (0 → 1 → ... 5)  │
     └─────────┬─────────┘
               │
     ┌─────────▼─────────┐
     │   localStorage    │◀── auto-save on step change
     │ (draft_application)│
     └─────────┬─────────┘
               │
     ┌─────────▼─────────┐
     │     Submit        │──▶ Generate Application ID
     └───────────────────┘    Clear Draft → Success Screen
```

---

## Validation Schema Summary (`lib/schemas/application.ts`)

| Schema | Fields | Notes |
|--------|--------|-------|
| `firstYearPersonalInfoSchema` | name, email, phone, dob, village, mandal, district, pincode, address | Age: 15-35 |
| `secondYearPersonalInfoSchema` | Above + gender | Male/Female |
| `firstYearFamilySchema` | motherName, fatherName, guardianName?, guardianRelationship? | Simple |
| `secondYearFamilySchema` | Above + occupation, mobile, familyCount, incomeBracket | Detailed |
| `firstYearEducationSchema` | highSchool, sscMarks (total/max/%), college, course, dateOfAdmission | Auto-calc % |
| `secondYearEducationSchema` | Above + 1st year marks (total/max/%) | No admission date |
| `bankDetailsSchema` | accountNumber, bankNameBranch, ifscCode | IFSC regex validated |
| `firstYearDocumentsSchema` | sscMarksheet, aadharStudent, aadharParent, bonafide, passbook | Required files |
| `secondYearDocumentsSchema` | Above + firstYearMarksheet, mangoPlantPhoto? | Photo optional |
| `secondYearStatementSchema` | studyActivities, goalsDreams, additionalInfo? | Min 50 chars |
| `helpInterestSchema` | name, email, helpType, message | Modal form |

---

## Key Patterns

1. **Form Management**: React Hook Form + FormProvider wrapping multi-step wizard
2. **State**: React Context for global donor state; useForm for application
3. **Validation**: Zod schemas with union types for first-year vs second-year
4. **Animations**: Framer Motion for step transitions and page elements
5. **Responsiveness**: Tailwind CSS mobile-first approach
6. **Draft Persistence**: localStorage with 24-hour expiry
7. **File Handling**: Client-side validation before upload

---

## Entry Points

| Route | Purpose |
|-------|---------|
| `/` | Home page with hero and sections |
| `/apply` | 6-step scholarship application wizard |
| `/donate` | Donation amount & donor info |
| `/donate/wire-transfer` | Bank transfer details |

---

## Config Files

- `next.config.js` - Image optimization (Unsplash, Supabase CDN)
- `tsconfig.json` - Path aliases (`@/*` → root)
- `components.json` - Shadcn/ui (New York style)
- `postcss.config.mjs` - Tailwind CSS integration

---

## Changelog

### 2025-11-29: Application Form Restructure

Aligned digital form with paper application forms for both 1st year and 2nd year (renewal) applications.

**Changes:**
- Restructured 6-step wizard: Personal → Family → Education → Bank → Documents → Review
- Added `BankDetailsStep` component (account, bank/branch, IFSC)
- Updated address fields: Village, Mandal, District, PIN Code (replaced city/state)
- 1st year: Simplified - no essays, basic parent names only
- 2nd year: Detailed - parent occupation/mobile, family count, income bracket dropdown, essays
- Auto-calculate percentage from total/max marks
- Income field changed from free text to dropdown (Below 1 Lakh → Above 5 Lakhs)
- Progress bar steps now clickable to navigate back to completed steps
- Fixed NaN issues with number inputs
