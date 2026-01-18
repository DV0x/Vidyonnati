# Vidyonnati Backend Implementation Plan

## Project Overview

**Goal:** Implement a complete backend for the Vidyonnati Foundation scholarship platform to store and manage:
- Student accounts and scholarship applications
- Donor information and donations
- Help interest submissions

**Tech Stack:**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | Supabase PostgreSQL | Store all application data |
| Authentication | Supabase Auth | Student/Admin login (Email + Google) |
| File Storage | Supabase Storage | Store documents (Aadhar, marksheets) |
| Email | Resend | Send notifications |
| Frontend | Next.js 16 (existing) | User interface |

**Current Status:**
- [x] Supabase project already created (Vidyonnati-main, ap-southeast-2)
- [x] Database tables created (Phase 1 complete)
- [x] Row Level Security configured (Phase 2 complete)
- [x] Storage bucket created (Phase 3 complete)
- [x] Authentication configured (Phase 4 complete) - Google OAuth + Admin user
- [x] Dependencies installed (Phase 5 complete) - @supabase/supabase-js, @supabase/ssr, resend
- [x] Supabase client libraries created (Phase 6 complete) - client.ts, server.ts, admin.ts, database.ts
- [x] Auth pages created (Phase 7 complete) - login, register, callback, proxy, AuthContext
- [ ] Student dashboard not created (Phase 8 next)
- [ ] API routes not created

**Key Design Decisions:**
- Students create accounts (email/password or Google) to apply
- Renewal applications are automatically linked to previous applications
- Students can log in to check application status and history
- **One application per type per academic year** (prevents duplicates)
- **Student selects academic year** from dropdown when applying (e.g., "2024-2025", "2025-2026")
- No contact form needed (contact info displayed only)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   /login    │  │  /register  │  │       /dashboard        │  │
│  │   /apply    │  │   /donate   │  │  (My Applications)      │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (/api)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  /auth/*    │  │ /student/*  │  │       /admin/*          │  │
│  │  (public)   │  │(protected)  │  │   (admin only)          │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  Database   │  │        Storage          │  │
│  │  (users)    │  │  (tables)   │  │   (documents bucket)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Student Registration & Application

```
1. Student visits /apply
        │
        ▼
2. Not logged in → Redirect to /login
        │
        ▼
3. Student clicks "Register" or "Continue with Google"
        │
        ├── Email: Fill form → Verify email → Login
        │
        └── Google: One-click → Auto-register → Login
        │
        ▼
4. Redirected back to /apply
        │
        ▼
5. Fill 6-step application form (pre-filled from profile)
        │
        ▼
6. Upload documents → Submit
        │
        ▼
7. Receive confirmation email with Application ID
        │
        ▼
8. View status in /dashboard
```

### Flow 2: Renewal Application (2nd Year)

```
1. Returning student logs in
        │
        ▼
2. System detects approved 1st year application
        │
        ▼
3. /apply shows "Apply for Renewal" option
        │
        ▼
4. Form pre-fills from profile + previous application
        │
        ▼
5. New application linked via `previous_application_id`
```

### Flow 3: Donation (No Login Required)

```
1. Donor visits /donate
        │
        ▼
2. Select amount → Fill donor info
        │
        ▼
3. Submit → Creates donation record
        │
        ▼
4. Redirect to /donate/wire-transfer with bank details
        │
        ▼
5. Admin receives email notification
```

### Flow 4: Help Interest - "I Want to Help" (No Login Required)

```
1. User browsing home page sees Student Spotlight section
        │
        ▼
2. User clicks "I Want to Help" button on a student card
        │
        ▼
3. Modal opens with form:
   ┌────────────────────────────────┐
   │  I Want to Help [Student Name] │
   ├────────────────────────────────┤
   │  Name: [_______________]       │
   │  Email: [______________]       │
   │  Phone: [______________]       │
   │  How would you like to help?   │
   │  [Donate ▼]                    │
   │    - Donate                    │
   │    - Volunteer                 │
   │    - Corporate Partnership     │
   │    - Other                     │
   │  Message (optional):           │
   │  [____________________]        │
   │                                │
   │  [Submit]                      │
   └────────────────────────────────┘
        │
        ▼
4. User fills form and clicks Submit
        │
        ▼
5. POST /api/help-interest
   {
     name, email, phone,
     helpType: "donate" | "volunteer" | "corporate" | "other",
     message,
     studentId,      // ID of student they want to help
     studentName     // Name of student
   }
        │
        ▼
6. Data saved to `help_interests` table
        │
        ▼
7. Admin receives email notification:
   "New Help Interest: [helpType] for [studentName]"
        │
        ▼
8. Modal shows success message → Closes
```

**Data Stored in `help_interests` Table:**

| Field | Value |
|-------|-------|
| name | User's name |
| email | User's email |
| phone | User's phone |
| help_type | donate / volunteer / corporate / other |
| message | Optional message |
| student_id | ID of student (from spotlight) |
| student_name | Name of student |
| status | "new" (default) |
| created_at | Timestamp |

**Admin Follow-up Workflow:**
```
1. Admin sees new entry in dashboard (status: "new")
        │
        ▼
2. Admin contacts the person
        │
        ▼
3. Admin updates status to "contacted"
        │
        ▼
4. If person donates/volunteers → status: "converted"
   If person not interested → status: "closed"
```

---

## Phase 1: Database Setup

### Step 1.1: Create `students` Table

This table stores student profile data linked to Supabase Auth.

```sql
-- Run in Supabase SQL Editor

CREATE TABLE students (
  -- Primary key = same as auth.users.id
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info (from auth or registration)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Profile fields (filled during first application)
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  village TEXT,
  mandal TEXT,
  district TEXT,
  pincode TEXT,
  address TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_students_email ON students(email);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Step 1.2: Create `applications` Table

```sql
CREATE TABLE applications (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable ID (auto-generated)
  application_id TEXT UNIQUE NOT NULL,

  -- Link to student
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Link to previous application (for renewals)
  previous_application_id UUID REFERENCES applications(id),

  -- Application metadata
  application_type TEXT NOT NULL CHECK (application_type IN ('first-year', 'second-year')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_info')),
  academic_year TEXT NOT NULL,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  village TEXT NOT NULL,
  mandal TEXT NOT NULL,
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  address TEXT NOT NULL,

  -- Family Information (1st year: basic)
  mother_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  guardian_name TEXT,
  guardian_relationship TEXT,

  -- Family Information (2nd year: detailed)
  mother_occupation TEXT,
  mother_mobile TEXT,
  father_occupation TEXT,
  father_mobile TEXT,
  guardian_details TEXT,
  family_adults_count INTEGER,
  family_children_count INTEGER,
  annual_family_income TEXT CHECK (annual_family_income IN (
    'below-1-lakh', '1-2-lakhs', '2-3-lakhs', '3-5-lakhs', 'above-5-lakhs'
  )),

  -- Education Information
  high_school_studied TEXT NOT NULL,
  ssc_total_marks INTEGER NOT NULL,
  ssc_max_marks INTEGER NOT NULL,
  ssc_percentage NUMERIC(5,2) NOT NULL,
  college_address TEXT NOT NULL,
  group_subjects TEXT NOT NULL,

  -- 1st year specific
  college_admitted TEXT,
  course_joined TEXT,
  date_of_admission DATE,

  -- 2nd year specific
  current_college TEXT,
  course_studying TEXT,
  first_year_total_marks INTEGER,
  first_year_max_marks INTEGER,
  first_year_percentage NUMERIC(5,2),

  -- Bank Details
  bank_account_number TEXT NOT NULL,
  bank_name_branch TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,

  -- Essays (2nd year only)
  study_activities TEXT,
  goals_dreams TEXT,
  additional_info TEXT,

  -- Admin fields
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(application_type);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER trigger_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Step 1.3: Create Application ID Generator

```sql
-- Function to generate human-readable application ID
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate ID like VF-12345678
    new_id := 'VF-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');

    -- Check if it exists
    SELECT COUNT(*) INTO exists_count FROM applications WHERE application_id = new_id;

    -- Exit loop if unique
    EXIT WHEN exists_count = 0;
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application_id
CREATE OR REPLACE FUNCTION set_application_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_id IS NULL THEN
    NEW.application_id := generate_application_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_id
BEFORE INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION set_application_id();
```

### Step 1.4: Create `application_documents` Table

```sql
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to application
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Document info
  document_type TEXT NOT NULL CHECK (document_type IN (
    'ssc_marksheet',
    'aadhar_student',
    'aadhar_parent',
    'bonafide_certificate',
    'bank_passbook',
    'first_year_marksheet',
    'mango_plant_photo'
  )),

  -- Storage reference
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- Timestamp
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each application can only have one of each document type
  UNIQUE(application_id, document_type)
);

CREATE INDEX idx_documents_application_id ON application_documents(application_id);
```

### Step 1.5: Create `donations` Table

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable ID
  donation_id TEXT UNIQUE NOT NULL,

  -- Donor info (no auth required)
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,

  -- Donation details
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'wire_transfer',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'failed', 'refunded')),

  -- Wire transfer details (filled by admin after confirmation)
  transaction_reference TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate donation ID
CREATE OR REPLACE FUNCTION generate_donation_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    new_id := 'DON-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    SELECT COUNT(*) INTO exists_count FROM donations WHERE donation_id = new_id;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_donation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donation_id IS NULL THEN
    NEW.donation_id := generate_donation_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_donation_id
BEFORE INSERT ON donations
FOR EACH ROW EXECUTE FUNCTION set_donation_id();

CREATE TRIGGER trigger_donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
```

### Step 1.6: Create `help_interests` Table

```sql
CREATE TABLE help_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Interest details
  help_type TEXT NOT NULL CHECK (help_type IN ('donate', 'volunteer', 'corporate', 'other')),
  message TEXT,

  -- If expressing interest for specific student
  student_id TEXT,
  student_name TEXT,

  -- Follow-up tracking
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  followed_up_at TIMESTAMPTZ,
  followed_up_by UUID REFERENCES auth.users(id),
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_interests_status ON help_interests(status);
CREATE INDEX idx_help_interests_created_at ON help_interests(created_at DESC);
```

### Step 1.7: Create `admin_activity_log` Table

```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),

  -- What was done
  action_type TEXT NOT NULL,  -- 'status_change', 'note_added', 'document_viewed'
  entity_type TEXT NOT NULL,  -- 'application', 'donation', 'help_interest'
  entity_id UUID NOT NULL,

  -- Change details
  old_value JSONB,
  new_value JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_admin ON admin_activity_log(admin_user_id);
CREATE INDEX idx_activity_log_created_at ON admin_activity_log(created_at DESC);
```

### Step 1.8: Create Auto-Create Student on Signup Trigger

```sql
-- Automatically create a student record when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create student record if role is 'student' or not set
  IF (NEW.raw_user_meta_data->>'role' IS NULL OR NEW.raw_user_meta_data->>'role' = 'student') THEN
    INSERT INTO students (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Phase 2: Row Level Security (RLS)

### Step 2.1: Enable RLS on All Tables

```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
```

### Step 2.2: Helper Function for Admin Check

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role' = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2.3: Students Table Policies

```sql
-- Students can read their own record
CREATE POLICY "Students can view own profile"
ON students FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Students can update their own record
CREATE POLICY "Students can update own profile"
ON students FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Admins can view all students
CREATE POLICY "Admins can view all students"
ON students FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any student
CREATE POLICY "Admins can update students"
ON students FOR UPDATE
TO authenticated
USING (is_admin());
```

### Step 2.4: Applications Table Policies

```sql
-- Students can create applications for themselves
CREATE POLICY "Students can create own applications"
ON applications FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can view their own applications
CREATE POLICY "Students can view own applications"
ON applications FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON applications FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any application
CREATE POLICY "Admins can update applications"
ON applications FOR UPDATE
TO authenticated
USING (is_admin());
```

### Step 2.5: Application Documents Policies

```sql
-- Students can upload documents for their own applications
CREATE POLICY "Students can upload own documents"
ON application_documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_id
    AND applications.student_id = auth.uid()
  )
);

-- Students can view their own documents
CREATE POLICY "Students can view own documents"
ON application_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_id
    AND applications.student_id = auth.uid()
  )
);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON application_documents FOR SELECT
TO authenticated
USING (is_admin());
```

### Step 2.6: Donations Table Policies

```sql
-- Anyone can create a donation (no auth required)
CREATE POLICY "Anyone can create donations"
ON donations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can view all donations
CREATE POLICY "Admins can view donations"
ON donations FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update donations
CREATE POLICY "Admins can update donations"
ON donations FOR UPDATE
TO authenticated
USING (is_admin());
```

### Step 2.7: Help Interests Table Policies

```sql
-- Anyone can submit help interest
CREATE POLICY "Anyone can submit help interest"
ON help_interests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view help interests"
ON help_interests FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update
CREATE POLICY "Admins can update help interests"
ON help_interests FOR UPDATE
TO authenticated
USING (is_admin());
```

### Step 2.8: Activity Log Policies

```sql
-- Only admins can insert activity logs
CREATE POLICY "Admins can insert activity logs"
ON admin_activity_log FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON admin_activity_log FOR SELECT
TO authenticated
USING (is_admin());
```

---

## Phase 3: Storage Setup

### Step 3.1: Create Private Bucket

In Supabase Dashboard → Storage → Create new bucket:
- **Name:** `application-documents`
- **Public:** OFF (private)
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp, application/pdf`

### Step 3.2: Storage Policies

```sql
-- Allow authenticated users to upload to their application folders
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM applications WHERE student_id = auth.uid()
  )
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM applications WHERE student_id = auth.uid()
  )
);

-- Allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND is_admin()
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND is_admin()
);
```

---

## Phase 4: Authentication Setup

### Step 4.1: Configure Google OAuth

**In Google Cloud Console:**
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. APIs & Services → OAuth consent screen → Configure
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `https://<YOUR_PROJECT>.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret

**In Supabase Dashboard:**
1. Authentication → Providers → Google
2. Enable Google
3. Paste Client ID and Client Secret
4. Save

### Step 4.2: Create Admin User

```sql
-- After creating an admin user via signup, update their role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@vidyonnati.org';

-- Delete the auto-created student record for admin
DELETE FROM students WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@vidyonnati.org'
);
```

---

## Phase 5: Install Dependencies

### Step 5.1: Install NPM Packages

```bash
npm install @supabase/supabase-js @supabase/ssr resend
```

### Step 5.2: Environment Variables

Create/update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Resend (Email)
RESEND_API_KEY=re_...your-resend-key
ADMIN_EMAIL=admin@vidyonnati.org

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 6: Create Supabase Client Libraries

### Step 6.1: Browser Client (`/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 6.2: Server Client (`/lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

### Step 6.3: Admin Client (`/lib/supabase/admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Step 6.4: TypeScript Types (`/types/database.ts`)

```typescript
export interface Student {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  village: string | null
  mandal: string | null
  district: string | null
  pincode: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  application_id: string
  student_id: string
  previous_application_id: string | null
  application_type: 'first-year' | 'second-year'
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
  academic_year: string
  // ... all other fields
  created_at: string
  updated_at: string
}

export interface ApplicationDocument {
  id: string
  application_id: string
  document_type: DocumentType
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

export type DocumentType =
  | 'ssc_marksheet'
  | 'aadhar_student'
  | 'aadhar_parent'
  | 'bonafide_certificate'
  | 'bank_passbook'
  | 'first_year_marksheet'
  | 'mango_plant_photo'

export interface Donation {
  id: string
  donation_id: string
  donor_name: string
  donor_email: string
  donor_phone: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'
  transaction_reference: string | null
  confirmed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HelpInterest {
  id: string
  name: string
  email: string
  phone: string
  help_type: 'donate' | 'volunteer' | 'corporate' | 'other'
  message: string | null
  student_id: string | null
  student_name: string | null
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}
```

---

## Phase 7: Create Auth Pages

### Step 7.1: Auth Context (`/app/context/AuthContext.tsx`)

Provides auth state to all components.

### Step 7.2: Login Page (`/app/(auth)/login/page.tsx`)

- Email/password form
- "Continue with Google" button
- Link to register page
- Redirect to /dashboard or /apply after login

### Step 7.3: Register Page (`/app/(auth)/register/page.tsx`)

- Email/password form with name
- "Continue with Google" button
- Email verification (optional)
- Auto-creates student record via trigger

### Step 7.4: OAuth Callback (`/app/(auth)/callback/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

### Step 7.5: Middleware (`/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response to modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect apply route
  if (request.nextUrl.pathname.startsWith('/apply') && !user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
    )
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/apply/:path*'],
}
```

---

## Phase 8: Create Student Dashboard

### Step 8.1: Dashboard Layout (`/app/dashboard/layout.tsx`)

- Sidebar with navigation
- Header with user info + logout

### Step 8.2: Dashboard Home (`/app/dashboard/page.tsx`)

- List of student's applications
- Status badges (pending, approved, etc.)
- "Apply Now" button

### Step 8.3: Application Detail (`/app/dashboard/applications/[id]/page.tsx`)

- View submitted application details
- Status with timeline
- View uploaded documents

### Step 8.4: Profile Page (`/app/dashboard/profile/page.tsx`)

- Edit profile information
- Change password

---

## Phase 9: Create API Routes

### Step 9.1: Student Profile (`/api/student/profile/route.ts`)

- GET: Fetch current student profile
- PATCH: Update profile

### Step 9.2: Student Applications (`/api/student/applications/route.ts`)

- GET: List student's applications
- POST: Create new application

### Step 9.3: File Upload (`/api/upload/route.ts`)

- POST: Generate signed URL for file upload

### Step 9.4: Donations (`/api/donations/route.ts`)

- POST: Create donation record

### Step 9.5: Help Interest (`/api/help-interest/route.ts`)

- POST: Create help interest record

---

## Phase 10: Update Existing Forms

### Step 10.1: Update ApplicationWizard

File: `/app/apply/components/ApplicationWizard.tsx`

Changes:
1. Add auth check at top
2. Fetch student profile on load
3. Pre-fill PersonalInfoStep from profile
4. Check for previous approved applications
5. Update handleSubmit to call API
6. Upload files after submission
7. Show real application ID on success

### Step 10.2: Update Donate Page

File: `/app/donate/page.tsx`

Changes:
1. Create donation record on submit
2. Pass donation ID to wire transfer page
3. Update DonorContext to include donation ID

### Step 10.3: Update Help Interest Modal

File: `/app/components/StudentSpotlightSection.tsx`

Changes:
1. Update onSubmit to call /api/help-interest
2. Show success message
3. Reset form

---

## Phase 11: Email Notifications

### Step 11.1: Create Email Service (`/lib/email/resend.ts`)

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApplicationConfirmation(data: {
  email: string
  name: string
  applicationId: string
}) {
  await resend.emails.send({
    from: 'Vidyonnati <onboarding@resend.dev>', // Use test domain
    to: data.email,
    subject: `Application Received - ${data.applicationId}`,
    html: `
      <h1>Application Received</h1>
      <p>Dear ${data.name},</p>
      <p>Your scholarship application has been received.</p>
      <p><strong>Application ID:</strong> ${data.applicationId}</p>
      <p>You can track your application status in your dashboard.</p>
    `,
  })
}

export async function sendAdminNotification(data: {
  type: 'application' | 'donation' | 'help_interest'
  details: string
}) {
  await resend.emails.send({
    from: 'Vidyonnati <onboarding@resend.dev>',
    to: process.env.ADMIN_EMAIL!,
    subject: `New ${data.type} submission`,
    html: `<p>${data.details}</p>`,
  })
}
```

---

## Files Summary

### New Files to Create

```
/lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── admin.ts
├── email/
│   └── resend.ts
└── upload.ts

/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── callback/route.ts
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/page.tsx
│   └── applications/[id]/page.tsx
├── api/
│   ├── student/
│   │   ├── profile/route.ts
│   │   └── applications/route.ts
│   ├── upload/route.ts
│   ├── donations/route.ts
│   └── help-interest/route.ts
├── context/
│   └── AuthContext.tsx
└── middleware.ts

/types/
└── database.ts
```

### Existing Files to Modify

```
/app/apply/components/ApplicationWizard.tsx
/app/donate/page.tsx
/app/components/StudentSpotlightSection.tsx
/app/components/MainNavigation.tsx (add login/register links)
```

---

## Implementation Checklist

### Phase 1: Database Setup ✅
- [x] 1.1 Create `students` table
- [x] 1.2 Create `applications` table
- [x] 1.3 Create application ID generator trigger
- [x] 1.4 Create `application_documents` table
- [x] 1.5 Create `donations` table
- [x] 1.6 Create `help_interests` table
- [x] 1.7 Create `admin_activity_log` table
- [x] 1.8 Create auto-create student trigger

### Phase 2: Row Level Security ✅
- [x] 2.1 Enable RLS on all tables
- [x] 2.2 Create is_admin() helper function
- [x] 2.3 Create students table policies
- [x] 2.4 Create applications table policies
- [x] 2.5 Create documents table policies
- [x] 2.6 Create donations table policies
- [x] 2.7 Create help_interests table policies
- [x] 2.8 Create activity_log table policies
- [x] 2.9 Fix function search paths (security)

### Phase 3: Storage Setup ✅
- [x] 3.1 Create private bucket (application-documents, 5MB limit)
- [x] 3.2 Create storage policies (user upload/read, admin read/delete)

### Phase 4: Authentication Setup ✅
- [x] 4.1 Configure Google OAuth in Google Cloud
- [x] 4.2 Configure Google OAuth in Supabase
- [x] 4.3 Create admin user with role (alphasapien17@gmail.com)

### Phase 5: Install Dependencies ✅
- [x] 5.1 Install npm packages (@supabase/supabase-js, @supabase/ssr, resend)
- [x] 5.2 Configure environment variables (.env.local created)

### Phase 6: Supabase Client Libraries ✅
- [x] 6.1 Create browser client (/lib/supabase/client.ts)
- [x] 6.2 Create server client (/lib/supabase/server.ts)
- [x] 6.3 Create admin client (/lib/supabase/admin.ts)
- [x] 6.4 Create TypeScript types (/types/database.ts - auto-generated)

### Phase 7: Auth Pages ✅
- [x] 7.1 Create AuthContext (/app/context/AuthContext.tsx)
- [x] 7.2 Create login page (/app/(auth)/login/page.tsx)
- [x] 7.3 Create register page (/app/(auth)/register/page.tsx)
- [x] 7.4 Create OAuth callback route (/app/(auth)/callback/route.ts)
- [x] 7.5 Create proxy for route protection (/proxy.ts)
- [x] 7.6 Update MainNavigation with login/user menu
- [x] 7.7 Add AuthProvider to root layout

### Phase 8: Student Dashboard
- [ ] 8.1 Create dashboard layout
- [ ] 8.2 Create dashboard home (applications list)
- [ ] 8.3 Create application detail page
- [ ] 8.4 Create profile page

### Phase 9: API Routes
- [ ] 9.1 Create student profile API
- [ ] 9.2 Create student applications API
- [ ] 9.3 Create file upload API
- [ ] 9.4 Create donations API
- [ ] 9.5 Create help interest API

### Phase 10: Update Existing Forms
- [ ] 10.1 Update ApplicationWizard
- [ ] 10.2 Update Donate page
- [ ] 10.3 Update Help Interest modal
- [ ] 10.4 Update navigation with login links

### Phase 11: Email Notifications
- [ ] 11.1 Create email service
- [ ] 11.2 Add notifications to API routes

---

## Testing Checklist

- [ ] Student can register with email
- [ ] Student can register with Google
- [ ] Student can login
- [ ] Student can logout
- [ ] Protected routes redirect to login
- [ ] Student can view empty dashboard
- [ ] Student can submit 1st year application
- [ ] Files upload successfully
- [ ] Application appears in dashboard
- [ ] Student can view application details
- [ ] Returning student can submit renewal
- [ ] Renewal links to previous application
- [ ] Donor can submit donation (no login)
- [ ] Help interest form works
- [ ] Admin receives email notifications
- [ ] Student receives confirmation email
