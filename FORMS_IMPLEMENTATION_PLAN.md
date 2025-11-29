# Vidyonnati Forms Implementation Plan

## Overview

Three form experiences for the website:

| Form | Status | Description |
|------|--------|-------------|
| **Donate** | ✅ Complete | Full-page donation flow |
| **Apply Now** | ✅ Complete | Multi-step wizard with 1st Year / 2nd Year toggle |
| **I Want to Help** | ✅ Complete | Modal using Radix UI Dialog |

---

## Phase 1: Foundation Components ✅ COMPLETE

**Goal:** Create reusable components and validation schemas

### Tasks:
- [x] Create `/lib/schemas/application.ts` - Zod validation schemas
- [x] Create `/app/components/AnimatedTextarea.tsx` - Textarea with floating label
- [x] Create `/app/components/FileUpload.tsx` - Drag-drop file upload

### Files Created:
```
/lib/schemas/application.ts           ✅
/app/components/AnimatedTextarea.tsx  ✅
/app/components/FileUpload.tsx        ✅
```

### Schemas Include:
- `personalInfoSchema` - Name, email, phone, address, DOB
- `firstYearEducationSchema` / `secondYearEducationSchema` - Education details
- `familyBackgroundSchema` / `secondYearFamilyBackgroundSchema` - Family info
- `firstYearDocumentsSchema` / `secondYearDocumentsSchema` - File uploads
- `firstYearStatementSchema` / `secondYearStatementSchema` - Statement/progress
- `helpInterestSchema` - "I Want to Help" modal form

---

## Phase 2: Application Wizard Structure ✅ COMPLETE

**Goal:** Build the multi-step wizard container and navigation

### Tasks:
- [x] Create `/app/apply/page.tsx` - Main page with layout
- [x] Create `/app/apply/components/ApplicationWizard.tsx` - Step management
- [x] Create `/app/apply/components/StepProgress.tsx` - Progress bar
- [x] Implement application type toggle (1st Year / 2nd Year tabs)
- [x] Add localStorage draft saving (24hr expiry)

### Files Created:
```
/app/apply/page.tsx                           ✅
/app/apply/components/ApplicationWizard.tsx   ✅
/app/apply/components/StepProgress.tsx        ✅
```

### Features:
- 1st Year / 2nd Year toggle with Radix Tabs
- Progress bar with percentage and step info
- Auto-save to localStorage
- Animated step transitions

---

## Phase 3: Application Form Steps ✅ COMPLETE

**Goal:** Implement each step of the application wizard

### Tasks:
- [x] Step 1: PersonalInfoStep.tsx
- [x] Step 2: EducationStep.tsx
- [x] Step 3: FamilyBackgroundStep.tsx
- [x] Step 4: DocumentsStep.tsx
- [x] Step 5: StatementStep.tsx
- [x] Step 6: ReviewStep.tsx
- [x] Success/confirmation page with Application ID

### Files Created:
```
/app/apply/components/steps/PersonalInfoStep.tsx       ✅
/app/apply/components/steps/EducationStep.tsx          ✅
/app/apply/components/steps/FamilyBackgroundStep.tsx   ✅
/app/apply/components/steps/DocumentsStep.tsx          ✅
/app/apply/components/steps/StatementStep.tsx          ✅
/app/apply/components/steps/ReviewStep.tsx             ✅
```

### Form Fields by Application Type:

| Step | Field | 1st Year | 2nd Year |
|------|-------|----------|----------|
| **1. Personal** | Name, Email, Phone, Address, DOB | ✓ Required | ✓ Required |
| **2. Education** | Institution, Class, Marks | 10th marks | Current year marks |
| **3. Family** | Guardian info, Income, Dependents | ✓ Required | Optional (income required) |
| **4. Documents** | Photo, ID, Income Cert, Marksheets | Full set (4 docs) | Income cert + current marks |
| **5. Statement** | Why scholarship / Progress report | Why needed + Goals | Progress report + Goals |
| **6. Review** | Summary + Submit | ✓ | ✓ |

---

## Phase 4: "I Want to Help" Modal ✅ COMPLETE

**Goal:** Replace custom modal with Radix UI Dialog, matching donate form style

### Tasks:
- [x] Refactor InterestModal → HelpInterestDialog
- [x] Use Radix UI Dialog component
- [x] Add "How would you like to help?" dropdown
- [x] Integrate react-hook-form + zod validation
- [x] Use AnimatedInput (floating labels) - matches donate form
- [x] Add button hover animations - matches donate form

### File Modified:
```
/app/components/StudentSpotlightSection.tsx   ✅
```

### Form Fields:
| Field | Component | Validation |
|-------|-----------|------------|
| Your Name | AnimatedInput (floating label) | Min 2 chars |
| Email Address | AnimatedInput (floating label) | Valid email format |
| Phone Number | AnimatedInput (floating label) | 10-digit Indian mobile |
| How to Help | Select dropdown | Required selection |

### Dropdown Options:
- I want to donate
- I want to volunteer
- Corporate partnership
- Other

### Styling (Matches Donate Form):
- ✅ AnimatedInput with floating labels
- ✅ Button with `donate-button` class (shimmer effect)
- ✅ Hover animation: `hover:scale-105 hover:shadow-lg`
- ✅ Press feedback: `active:scale-95`
- ✅ Gradient header (primary → orange)
- ✅ Success state with checkmark animation

---

## Phase 5: Polish & Testing

**Goal:** Ensure quality and accessibility

### Tasks:
- [ ] Test all form validations
- [ ] Test mobile responsiveness
- [ ] Test keyboard navigation (accessibility)
- [ ] Add loading states
- [ ] Test localStorage draft save/restore

---

## All Files Created/Modified

```
# New Files (15)
/lib/schemas/application.ts
/app/components/AnimatedTextarea.tsx
/app/components/FileUpload.tsx
/app/apply/page.tsx
/app/apply/components/ApplicationWizard.tsx
/app/apply/components/StepProgress.tsx
/app/apply/components/steps/PersonalInfoStep.tsx
/app/apply/components/steps/EducationStep.tsx
/app/apply/components/steps/FamilyBackgroundStep.tsx
/app/apply/components/steps/DocumentsStep.tsx
/app/apply/components/steps/StatementStep.tsx
/app/apply/components/steps/ReviewStep.tsx

# Modified Files (1)
/app/components/StudentSpotlightSection.tsx
```

---

## Technical Stack

| Library | Purpose |
|---------|---------|
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Connect zod to react-hook-form |
| `motion` | Animations (step transitions, success states) |
| Radix UI | Dialog, Select, Tabs, Checkbox components |
| `lucide-react` | Icons |

---

## Design Tokens

| Token | Value |
|-------|-------|
| Primary Color | `#FF5721` |
| Font | Overpass |
| Border Radius | `rounded-xl` / `rounded-2xl` |
| Shadows | `shadow-lg` / `shadow-2xl` |
| Button Animation | `hover:scale-105 active:scale-95` |

---

## Key Features Implemented

### Apply Now Form:
- ✅ 6-step multi-step wizard
- ✅ 1st Year / 2nd Year application toggle
- ✅ Conditional fields based on application type
- ✅ Progress bar with percentage
- ✅ Auto-save drafts to localStorage (24hr expiry)
- ✅ File upload with drag-drop and preview
- ✅ Review page with edit links
- ✅ Success page with application ID
- ✅ Animated step transitions

### I Want to Help Modal:
- ✅ Radix UI Dialog (accessible)
- ✅ AnimatedInput with floating labels
- ✅ "How would you like to help?" dropdown
- ✅ Zod validation with error messages
- ✅ Button animations (scale, shadow, shimmer)
- ✅ Success state with thank you message
- ✅ Keyboard accessible (focus trap, escape key)

---

## Notes

- **Data Handling:** UI only for now (no backend integration)
- **Files:** Held in React state until submission
- **Draft Saving:** localStorage with 24hr expiry, keyed by application type
- **Accessibility:** WCAG 2.1 compliant, keyboard navigable
- **Mobile:** Responsive design with compact progress indicator
