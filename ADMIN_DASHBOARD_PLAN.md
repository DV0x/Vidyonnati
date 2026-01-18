# Admin Dashboard & Student-Donor Platform Plan

## Overview

Build an admin dashboard to manage the scholarship platform AND a new spotlight application system that connects students with donors.

**Two ways students appear in spotlight:**
1. **Scholarship applicants** - Admin selects approved applicants to feature
2. **Spotlight-only applicants** - Students apply directly via new form (may not want scholarship)

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Admin Auth | Same login page as students, role check in admin layout |
| Email From | `Vidyonnati Foundation <dvn@vidyonnati.org>` (configurable) |
| Email Reply | Recipients can reply directly to founder's email |
| Photo Upload | Add to scholarship application (both 1st & 2nd year) |

---

## What We're Building

| Component | Description |
|-----------|-------------|
| **Admin Dashboard** | Full management of scholarship apps, spotlight apps, donations, help interests |
| **Spotlight Application** | New form for students to apply for visibility |
| **Homepage Integration** | Replace hardcoded students with real data |
| **Email System** | Templates, composer, status emails (editable), history |
| **Photo Upload** | Add student photo to scholarship application |

---

## Admin Dashboard Features

### A. Dashboard Overview (`/admin`)

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome, Admin                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    12    │  │    5     │  │    8     │  │    3     │        │
│  │ Pending  │  │ New Help │  │ Pending  │  │ Featured │        │
│  │ Scholar  │  │ Interests│  │ Spotlight│  │ Students │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  Recent Activity                                                 │
│  ├─ Application VF-12345678 approved by admin@...               │
│  ├─ New donation DON-87654321 received (₹10,000)                │
│  └─ New spotlight application SP-11111111 submitted             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### B. Scholarship Applications (`/admin/scholarship-applications`)

| Feature | Description |
|---------|-------------|
| View All | List all scholarship applications |
| Search | Search by name, application ID, email |
| Filter | By status, type (1st/2nd year), date range |
| Bulk Actions | Select multiple → Approve/Reject/Enable Spotlight |
| **Review Page** | |
| View Details | All personal, family, education, bank info |
| View Documents | Download/preview uploaded files |
| View Photo | See student's profile photo |
| Change Status | Dropdown: pending → under_review → approved/rejected/needs_info |
| Add Notes | Reviewer notes (visible to student) |
| **Spotlight Controls** | |
| Toggle Spotlight | Enable/disable student in homepage spotlight |
| Edit Spotlight Story | Customize the story shown |
| Set Annual Need | Amount shown on spotlight card |

### C. Spotlight Applications (`/admin/spotlight-applications`)

| Feature | Description |
|---------|-------------|
| View All | List all spotlight-only applications |
| Search/Filter | By name, status, circumstances |
| Review Page | View full application details |
| View Photo | See uploaded profile photo |
| View Exams | See competitive exam scores |
| View Circumstances | See family situation checkboxes |
| Change Status | pending → under_review → approved/rejected |
| Feature Student | Toggle "featured" to show on homepage |

### D. Spotlight Management (`/admin/spotlight`)

| Feature | Description |
|---------|-------------|
| Featured Students | List of all currently featured students |
| Drag to Reorder | Change display order on homepage |
| Toggle On/Off | Quick enable/disable from spotlight |
| Mix Sources | Shows both scholarship + spotlight-only students |

### E. Donations (`/admin/donations`)

| Feature | Description |
|---------|-------------|
| View All | List all donation records |
| Filter | By status, date, amount range |
| Confirm Donation | Mark wire transfer as received |
| Add Reference | Enter transaction/reference number |
| Update Status | pending → confirmed → completed |

### F. Help Interests (`/admin/help-interests`)

| Feature | Description |
|---------|-------------|
| View All | List all "I Want to Help" submissions |
| Filter | By type (donate/volunteer/corporate), status |
| See Student Link | Which student they want to help |
| Update Status | new → contacted → converted/closed |
| Add Notes | Follow-up notes |

### G. Activity Log (`/admin/activity-log`)

| Feature | Description |
|---------|-------------|
| View All Actions | Every admin action recorded |
| Filter by Admin | See actions by specific admin |
| Filter by Type | Status changes, notes added, etc. |
| Before/After | See what changed |

### H. Email System (`/admin/emails`)

#### Email Templates
| Template | Trigger |
|----------|---------|
| Application Received | Auto on submission |
| Application Under Review | Admin changes status |
| Application Approved | Admin changes status |
| Application Rejected | Admin changes status |
| Application Needs Info | Admin changes status |
| Spotlight Approved | Admin approves spotlight |
| Donation Received | Auto on submission |
| Donation Confirmed | Admin confirms |

#### Email Composer (On Status Change)
```
┌─────────────────────────────────────────────────────────────────┐
│  Send Status Update Email                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  To: priya.sharma@email.com (Priya Sharma)                      │
│  Subject: [Congratulations! Your Scholarship is Approved ]      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Dear Priya,                                              │   │
│  │                                                          │   │
│  │ We are delighted to inform you that your scholarship     │   │
│  │ application (VF-12345678) has been APPROVED!             │   │
│  │                                                          │   │
│  │ [Admin can edit this message before sending]             │   │
│  │                                                          │   │
│  │ Best wishes,                                             │   │
│  │ Vidyonnati Foundation Team                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ☑ Send email to student                                        │
│  ☐ CC: admin@vidyonnati.org                                     │
│                                                                  │
│  [Preview] [Update Status & Send Email]                         │
│  [Update Status Only (No Email)]                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Custom Email Composer
- Send to individual or multiple students
- Use templates or start from blank
- Variables: `{{name}}`, `{{application_id}}`, `{{status}}`

#### Email History
- Track all sent emails
- See delivery status (sent/failed)

---

## Spotlight Application Form (NEW)

Students who finished intermediate/polytechnic can apply directly for spotlight visibility.

**Requires login**: Yes (student must create account)

### Step 1: Personal Information
| Field | Required |
|-------|----------|
| Full Name | ✅ |
| **Photo** | ✅ (Profile photo for spotlight card) |
| Date of Birth | ✅ |
| Gender | ✅ |
| Phone | ✅ |
| Email | ✅ |
| Village/Town, Mandal, District, State, PIN | ✅ |

### Step 2: Education Details
| Field | Required |
|-------|----------|
| Intermediate/Polytechnic Name | ✅ |
| Course/Stream (MPC, BiPC, CEC, etc.) | ✅ |
| Year of Completion | ✅ |
| Total Marks / Max Marks / Percentage | ✅ |
| Current Status (Studying/Seeking admission/Working) | ✅ |

### Step 3: Competitive Exams (Optional - Multiple)
| Exam | Score/Rank | Percentile |
|------|------------|------------|
| NEET | | |
| JEE Main | | |
| JEE Advanced | | |
| EAMCET (TS/AP) | | |
| POLYCET | | |
| CLAT | | |
| CA Foundation | | |
| NDA | | |
| Other (free text) | | |

### Step 4: Family Background
| Field | Required |
|-------|----------|
| **Parent Status** | ✅ |
| - Both parents alive | |
| - Single parent (Father) | |
| - Single parent (Mother) | |
| - Orphan | |
| Father's Name, Occupation, Health | Conditional |
| Mother's Name, Occupation, Health | Conditional |
| Guardian Details | If orphan |
| Number of Siblings | ✅ |
| Annual Family Income | ✅ |

### Step 5: Circumstances (Checkboxes - Multiple Select)
- ☐ Single parent household
- ☐ Orphan
- ☐ Parent with disability
- ☐ Parent with chronic illness
- ☐ Family in debt
- ☐ Natural disaster affected
- ☐ First generation college student
- ☐ Below poverty line (BPL)
- ☐ No stable income source
- ☐ Other (free text)

### Step 6: Story & Goals
| Field | Required | Limits |
|-------|----------|--------|
| Background Story | ✅ | 100-1000 chars |
| Dreams & Goals | ✅ | 100-1000 chars |
| How Will Help Change Your Life | ✅ | 100-500 chars |
| Annual Financial Need (₹) | ✅ | Number |

### Step 7: Documents
| Document | Required |
|----------|----------|
| Profile Photo | ✅ |
| Intermediate/Polytechnic Marksheet | ✅ |
| Student Aadhar | ✅ |
| Income Certificate | Optional |
| Supporting Documents | Optional |

---

## Database Changes

### New Table: `admins`
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',  -- 'admin' | 'super_admin' (for future)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS: Only admins can view admin list
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Use is_admin() function to avoid recursive RLS policy
CREATE POLICY "Admins can view admin list"
  ON admins FOR SELECT
  USING (is_admin());

CREATE POLICY "Super admins can insert admins"
  ON admins FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete admins"
  ON admins FOR DELETE
  USING (is_super_admin());
```

### Helper Function: `is_super_admin()`
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Update `is_admin()` Function
```sql
-- Ensure function checks admins table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### New Table: `spotlight_applications`
```sql
CREATE TABLE spotlight_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotlight_id TEXT UNIQUE NOT NULL,  -- SP-12345678
  student_id UUID NOT NULL REFERENCES students(id),
  status TEXT NOT NULL DEFAULT 'pending',

  -- Personal
  full_name, photo_url, date_of_birth, gender, phone,
  village, mandal, district, state, pincode,

  -- Education
  college_name, course_stream, year_of_completion,
  total_marks, max_marks, percentage, current_status,

  -- Competitive Exams (JSONB array)
  competitive_exams JSONB DEFAULT '[]',

  -- Family
  parent_status, father_name, father_occupation, father_health,
  mother_name, mother_occupation, mother_health,
  guardian_details, siblings_count, annual_family_income,

  -- Circumstances
  circumstances JSONB DEFAULT '[]',
  circumstances_other TEXT,

  -- Story
  background_story, dreams_goals, how_help_changes_life,
  annual_financial_need INTEGER,

  -- Admin
  reviewer_notes, reviewed_by, reviewed_at, featured_at,

  -- Timestamps
  created_at, updated_at
);
```

### New Table: `spotlight_documents`
```sql
CREATE TABLE spotlight_documents (
  id UUID PRIMARY KEY,
  spotlight_application_id UUID REFERENCES spotlight_applications(id),
  document_type TEXT,  -- photo, marksheet, aadhar, income_cert, other
  storage_path, file_name, file_size, mime_type,
  uploaded_at
);
```

### New Table: `email_templates`
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,  -- 'application_approved', etc.
  subject TEXT,
  body TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  updated_by, updated_at, created_at
);
```

### New Table: `email_logs`
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  template_name, recipient_email, recipient_name,
  subject, body, status, error_message,
  sent_by, sent_at
);
```

### Modify `applications` Table
```sql
ALTER TABLE applications ADD COLUMN is_spotlight_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN spotlight_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN spotlight_story TEXT;
ALTER TABLE applications ADD COLUMN spotlight_annual_need INTEGER;
```

### Add Photo to Scholarship Application
```sql
-- Add 'student_photo' to document_type constraint
```

---

## File Structure

```
/app/admin/
├── layout.tsx                    (admin nav, auth check)
├── page.tsx                      (dashboard overview)
├── scholarship-applications/
│   ├── page.tsx                 (list all)
│   └── [id]/page.tsx            (review + spotlight toggle)
├── spotlight-applications/
│   ├── page.tsx                 (list all)
│   └── [id]/page.tsx            (review)
├── spotlight/
│   └── page.tsx                 (manage featured students)
├── donations/
│   └── page.tsx                 (manage donations)
├── help-interests/
│   └── page.tsx                 (manage help interests)
├── emails/
│   ├── page.tsx                (templates list)
│   ├── templates/[name]/page.tsx (edit template)
│   ├── compose/page.tsx         (custom email)
│   └── history/page.tsx         (sent emails)
└── activity-log/
    └── page.tsx                 (view admin actions)

/app/spotlight/
├── page.tsx                     (info page + apply button)
└── apply/
    ├── page.tsx                 (wizard wrapper)
    └── components/
        ├── SpotlightWizard.tsx
        └── steps/
            ├── PersonalInfoStep.tsx
            ├── EducationStep.tsx
            ├── CompetitiveExamsStep.tsx
            ├── FamilyBackgroundStep.tsx
            ├── CircumstancesStep.tsx
            ├── StoryGoalsStep.tsx
            ├── DocumentsStep.tsx
            └── ReviewStep.tsx

/app/api/
├── admin/
│   ├── scholarship-applications/[id]/route.ts
│   ├── spotlight-applications/[id]/route.ts
│   ├── spotlight/route.ts
│   ├── donations/[id]/route.ts
│   ├── help-interests/[id]/route.ts
│   ├── emails/route.ts
│   └── stats/route.ts
├── spotlight/
│   ├── route.ts
│   └── [id]/route.ts
└── public/
    └── featured-students/route.ts
```

---

## Implementation Phases

### Phase A: Database & Infrastructure ✅ COMPLETE (2026-01-18)
1. ✅ Create `admins` table
2. ✅ Update `is_admin()` function
3. ✅ Add RLS policies for `admins` table
4. ✅ Seed initial admin user(s) - alphasapien17@gmail.com (super_admin)
5. ✅ Create `spotlight_applications` table
6. ✅ Create `spotlight_documents` table
7. ✅ Create `email_templates` table (8 templates seeded)
8. ✅ Create `email_logs` table
9. ✅ Add spotlight fields to `applications` table
10. ✅ Add `student_photo` document type
11. ✅ Add RLS policies for new tables
12. ✅ Create storage bucket for spotlight photos
13. ✅ Update TypeScript types (`types/database.ts`)

### Phase B: Admin Dashboard - Core ✅ COMPLETE & TESTED (2026-01-18)
1. ✅ Admin layout with auth check + navigation (`/app/admin/layout.tsx`)
2. ✅ Dashboard overview page with stats (`/app/admin/page.tsx`)
3. ✅ Scholarship applications list + review page
   - `/app/admin/scholarship-applications/page.tsx` (search, filter, pagination)
   - `/app/admin/scholarship-applications/[id]/page.tsx` (review + status change)
4. ✅ API routes with activity logging
   - `/app/api/admin/stats/route.ts` - Dashboard statistics
   - `/app/api/admin/scholarship-applications/route.ts` - List with search/filter
   - `/app/api/admin/scholarship-applications/[id]/route.ts` - GET/PATCH with activity log
5. ✅ Bug fixes: Sign out blank page, Google auto-login issue

**Bugs Found & Fixed During Testing (2026-01-18):**
| Bug | File | Fix |
|-----|------|-----|
| Public header/footer showing on admin pages | `app/components/LayoutWrapper.tsx` | Added `isAdmin` check to exclude `/admin` routes |
| 500 error on admins table (recursive RLS) | Database RLS policy | Changed policy to use `is_admin()` function instead of direct query |
| 406 error on students table for admin users | `app/context/AuthContext.tsx` | Added `isAdmin` state, skip student fetch for admins |

**All Tests Passed:**
- ✅ Admin login and dashboard access
- ✅ Dashboard stats load correctly
- ✅ Scholarship applications list with search/filter/pagination
- ✅ Application detail view with all sections
- ✅ Status change and save with activity logging
- ✅ No network errors (all API calls return 200)

### Phase C: Admin Dashboard - Complete ✅ COMPLETE (2026-01-18)
1. ✅ Spotlight applications list + review page
   - `/app/admin/spotlight-applications/page.tsx` (search, filter by status/featured, pagination)
   - `/app/admin/spotlight-applications/[id]/page.tsx` (review + status change + featured toggle)
   - `/app/api/admin/spotlight-applications/route.ts` - List with search/filter
   - `/app/api/admin/spotlight-applications/[id]/route.ts` - GET/PATCH with activity log
2. ✅ Spotlight management page (toggle featured, reorder)
   - `/app/admin/spotlight/page.tsx` (manage all featured students from both sources)
   - `/app/api/admin/spotlight/route.ts` - GET featured students, PATCH for reorder/toggle
3. ✅ Donations management page
   - `/app/admin/donations/page.tsx` (search, filter by status, edit dialog)
   - `/app/api/admin/donations/route.ts` - List with search/filter
   - `/app/api/admin/donations/[id]/route.ts` - GET/PATCH with activity log
4. ✅ Help interests management page
   - `/app/admin/help-interests/page.tsx` (search, filter by status/type, edit dialog)
   - `/app/api/admin/help-interests/route.ts` - List with search/filter
   - `/app/api/admin/help-interests/[id]/route.ts` - GET/PATCH with activity log
5. ✅ Activity log viewer
   - `/app/admin/activity-log/page.tsx` (filter by action type, entity type, admin)
   - `/app/api/admin/activity-log/route.ts` - List with filters, admin enrichment

### Phase D: Spotlight Application Form
1. Spotlight info/landing page (`/spotlight`)
2. Multi-step spotlight application wizard
3. Photo upload with preview
4. Competitive exams dynamic form
5. Circumstances checkboxes
6. API routes for submission

### Phase E: Homepage Integration
1. Update StudentSpotlightSection to fetch real data
2. Public API for featured students
3. Dynamic student count
4. Connect help interest to real student IDs

### Phase F: Email System
1. Resend email service setup
2. Email templates management
3. Status change emails (editable before sending)
4. Custom email composer
5. Email history page

---

## Testing Checklist

**Phase A - Admin Authentication ✅ Complete:**
- [x] `admins` table created with RLS policies
- [x] `is_admin()` function returns true for admins
- [x] `is_admin()` function returns false for regular users
- [x] Admin can log in via normal `/login` page
- [x] Non-admin users redirected away from `/admin/*`

**Phase B - Admin Dashboard Core ✅ Complete & Tested (2026-01-18):**
- [x] Admin can log in and see dashboard at `/admin`
- [x] Dashboard shows correct stats (pending apps, help interests, donations, featured)
- [x] Recent activity log displays correctly
- [x] Non-admin users redirected to home page
- [x] Can view all scholarship applications at `/admin/scholarship-applications`
- [x] Search works (by name, email, application ID)
- [x] Status filter works (Pending, Under Review, Approved, Rejected, Needs Info)
- [x] Type filter works (1st Year, 2nd Year)
- [x] Pagination works correctly
- [x] Can click application to view details
- [x] Can change application status via dropdown
- [x] Can add/edit reviewer notes
- [x] Save button updates application and shows toast
- [x] Activity log entry created on status change
- [x] No network errors (500/406 fixed)

**Phase C - Admin Dashboard Complete (Pending Testing):**
- [ ] Spotlight Applications page loads at `/admin/spotlight-applications`
- [ ] Can search spotlight applications by name, email, spotlight ID
- [ ] Can filter by status (Pending, Under Review, Approved, Rejected)
- [ ] Can filter by featured status
- [ ] Can view spotlight application details at `/admin/spotlight-applications/[id]`
- [ ] Can change spotlight application status
- [ ] Can toggle "Featured on Homepage" switch
- [ ] Spotlight Management page loads at `/admin/spotlight`
- [ ] Shows all featured students from both scholarship + spotlight sources
- [ ] Can reorder featured students with up/down arrows
- [ ] Can toggle featured status on/off
- [ ] Donations page loads at `/admin/donations`
- [ ] Can search donations by name, email, donation ID
- [ ] Can filter by status
- [ ] Can edit donation (status, transaction reference, notes) via dialog
- [ ] Help Interests page loads at `/admin/help-interests`
- [ ] Can search by name, email, student name
- [ ] Can filter by status and help type
- [ ] Can edit help interest (status, notes) via dialog
- [ ] Activity Log page loads at `/admin/activity-log`
- [ ] Can filter by action type, entity type, admin
- [ ] Shows all admin actions with before/after values
- [ ] All pages have working pagination

**Spotlight Application:**
- [ ] Student can register/login
- [ ] Student can fill spotlight application form
- [ ] Photo upload works
- [ ] Competitive exams can be added/removed
- [ ] Circumstances checkboxes save correctly
- [ ] Application submits successfully
- [ ] Student sees application status in dashboard

**Email System:**
- [ ] Templates can be edited
- [ ] Email composer appears on status change
- [ ] Admin can edit email before sending
- [ ] Custom emails can be sent
- [ ] Email history shows sent emails

**Homepage Integration:**
- [ ] Spotlight section shows real students
- [ ] "I Want to Help" links to real student IDs
- [ ] Student count is dynamic

---

## Admin Setup Instructions

### How to Add an Admin

1. **User registers normally** via `/register` or Google OAuth
2. **Find their user ID** in Supabase Dashboard:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'admin@vidyonnati.org';
   ```
3. **Add to admins table**:
   ```sql
   INSERT INTO admins (id, email, name)
   VALUES ('user-uuid-here', 'admin@vidyonnati.org', 'Admin Name');
   ```

### Initial Admin Seeding (One-time setup)

```sql
-- Option 1: Add specific users as admins
INSERT INTO admins (id, email, name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE email IN (
  'founder@vidyonnati.org',
  'admin@vidyonnati.org'
);

-- Option 2: Add all @vidyonnati.org domain users as admins
INSERT INTO admins (id, email, name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE email LIKE '%@vidyonnati.org';
```

### Remove an Admin

```sql
DELETE FROM admins WHERE email = 'former-admin@example.com';
```

---

## Summary

**Total scope:**
- ~40-45 new files
- 5 new database tables (`admins`, `spotlight_applications`, `spotlight_documents`, `email_templates`, `email_logs`)
- 5+ new columns on `applications` table
- 1 updated function (`is_admin()`)
