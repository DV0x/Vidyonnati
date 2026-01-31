# Vidyonnati Foundation - Architecture & Code Reference

Educational scholarship platform connecting donors with meritorious students from economically disadvantaged backgrounds in India. Built with Next.js 16, React 19, TypeScript, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.5 |
| UI | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth (Email + Google OAuth) | - |
| File Storage | Supabase Storage | - |
| Styling | Tailwind CSS | 4.1.7 |
| Component Library | shadcn/ui (New York style) | 59 components |
| Forms | React Hook Form + Zod | 7.60.0 / 3.25.76 |
| Animations | Framer Motion (via `motion`) | 12.23.24 |
| Icons | Lucide React | 0.555.0 |
| Charts | Recharts | 2.15.4 |
| Carousel | Embla Carousel | 8.6.0 |
| Email | Resend | 6.5.2 |
| PDF | pdf-lib | 1.17.1 |
| Analytics | @vercel/analytics | 1.5.0 |
| Themes | next-themes | 0.4.6 |

---

## Directory Structure

```
/Vidyonnati
├── app/
│   ├── layout.tsx                    # Root layout: AuthProvider > DonorProvider > LayoutWrapper
│   ├── page.tsx                      # Home page (public)
│   ├── globals.css                   # Global Tailwind + custom styles
│   │
│   ├── (auth)/                       # Auth route group
│   │   ├── layout.tsx                # Auth overlay layout
│   │   ├── login/page.tsx            # Email/password + Google OAuth login
│   │   ├── register/page.tsx         # Student registration
│   │   └── callback/route.ts         # OAuth code exchange handler
│   │
│   ├── apply/                        # Scholarship application (auth required)
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── ApplicationWizard.tsx  # 6-step form orchestrator
│   │       ├── StepProgress.tsx       # Step indicator (desktop/mobile)
│   │       └── steps/
│   │           ├── PersonalInfoStep.tsx
│   │           ├── FamilyBackgroundStep.tsx
│   │           ├── EducationStep.tsx
│   │           ├── BankDetailsStep.tsx
│   │           ├── DocumentsStep.tsx
│   │           └── ReviewStep.tsx
│   │
│   ├── spotlight/                    # Spotlight program
│   │   ├── page.tsx                  # Info page (public)
│   │   └── apply/
│   │       ├── page.tsx              # Application entry (auth required)
│   │       └── components/
│   │           ├── SpotlightWizard.tsx     # 9-step form orchestrator
│   │           ├── SpotlightStepProgress.tsx
│   │           └── steps/
│   │               ├── PersonalInfoStep.tsx
│   │               ├── FamilyBackgroundStep.tsx
│   │               ├── EducationStep.tsx
│   │               ├── CircumstancesStep.tsx
│   │               ├── CompetitiveExamsStep.tsx
│   │               ├── StoryGoalsStep.tsx
│   │               ├── DocumentsStep.tsx
│   │               └── ReviewStep.tsx
│   │
│   ├── students/                     # Featured students (public)
│   │   └── page.tsx                  # Full featured students grid
│   │
│   ├── donate/                       # Donation flow (public, no auth)
│   │   ├── page.tsx                  # Amount selection + donor info
│   │   └── wire-transfer/page.tsx    # Bank transfer details display
│   │
│   ├── dashboard/                    # Student dashboard (auth guarded)
│   │   ├── layout.tsx                # Sidebar nav + auth guard
│   │   ├── page.tsx                  # Applications overview (stats combine scholarship + spotlight)
│   │   ├── applications/
│   │   │   ├── page.tsx              # Unified applications list (scholarship + spotlight, with type/status filters)
│   │   │   └── [id]/page.tsx         # Application detail view
│   │   ├── profile/page.tsx          # Edit student profile
│   │   └── spotlight/[id]/page.tsx   # Spotlight application detail
│   │
│   ├── admin/                        # Admin dashboard (auth + admin guarded)
│   │   ├── layout.tsx                # Admin sidebar + auth/admin guard
│   │   ├── page.tsx                  # Stats overview + activity feed
│   │   ├── scholarship-applications/
│   │   │   ├── page.tsx              # List with search/filter/pagination
│   │   │   └── [id]/page.tsx         # Review detail + status change
│   │   ├── spotlight-applications/
│   │   │   ├── page.tsx              # List spotlight apps
│   │   │   └── [id]/page.tsx         # Review spotlight detail
│   │   ├── spotlight/page.tsx        # Manage featured students (drag-reorder)
│   │   ├── donations/page.tsx        # Track donations
│   │   ├── help-interests/page.tsx   # Track help interest leads
│   │   └── activity-log/page.tsx     # Admin audit trail
│   │
│   ├── api/                          # Backend API routes
│   │   ├── featured-students/route.ts # GET: public featured students with signed URLs
│   │   ├── donations/route.ts        # POST: create donation (public)
│   │   ├── help-interest/route.ts    # GET/POST: help interests (public)
│   │   ├── upload/
│   │   │   ├── route.ts              # POST/GET: scholarship doc upload
│   │   │   └── spotlight/route.ts    # POST/GET: spotlight doc upload
│   │   ├── student/
│   │   │   ├── profile/route.ts      # GET/PATCH: student profile
│   │   │   ├── applications/
│   │   │   │   ├── route.ts          # GET/POST: list/create applications
│   │   │   │   └── [id]/route.ts     # GET: single app + documents + signed URLs
│   │   │   └── spotlight/
│   │   │       ├── route.ts          # GET/POST: spotlight apps
│   │   │       └── [id]/route.ts     # GET: single spotlight app
│   │   └── admin/
│   │       ├── info/route.ts         # GET: admin name/role
│   │       ├── stats/route.ts        # GET: dashboard statistics
│   │       ├── activity-log/route.ts # GET: admin action history
│   │       ├── donations/
│   │       │   ├── route.ts          # GET: all donations
│   │       │   └── [id]/route.ts     # GET/PATCH: single donation
│   │       ├── help-interests/
│   │       │   ├── route.ts          # GET: all help interests
│   │       │   └── [id]/route.ts     # GET/PATCH: single help interest
│   │       ├── scholarship-applications/
│   │       │   ├── route.ts          # GET: all scholarship apps
│   │       │   └── [id]/route.ts     # GET/PATCH: single app
│   │       └── spotlight-applications/
│   │           ├── route.ts          # GET: all spotlight apps
│   │           ├── [id]/route.ts     # GET/PATCH: single spotlight app
│   │           └── spotlight/route.ts # GET/PUT: manage featured order
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # User/session/student/isAdmin state
│   │   └── DonorContext.tsx          # Donor info for donation flow
│   │
│   └── components/                   # Feature-specific components
│       ├── MainNavigation.tsx        # Sticky nav with auth-aware menu
│       ├── TopNavigation.tsx         # Scrollable info bar
│       ├── HeroSlider.tsx            # 4-slide auto-rotating carousel
│       ├── ImpactStatsSection.tsx    # Key metrics
│       ├── WelcomeSection.tsx        # Value proposition
│       ├── StudentSpotlightSection.tsx # Featured students section (data-driven with fallback)
│       ├── StudentCard.tsx            # Shared student card component
│       ├── HelpInterestDialog.tsx     # Shared help interest dialog
│       ├── EmpoweringSection.tsx     # Mission statement
│       ├── GoalsSection.tsx          # Organization goals
│       ├── HowWeWorkSection.tsx      # Step-by-step process
│       ├── WhySupportUsSection.tsx   # Reasons to donate
│       ├── TestimonialSection.tsx    # Success stories
│       ├── Footer.tsx                # Links & contact
│       ├── LayoutWrapper.tsx         # Layout utility
│       ├── AnimatedInput.tsx         # Floating-label input
│       ├── AnimatedTextarea.tsx      # Floating-label textarea
│       ├── FileUpload.tsx            # Drag-drop file upload with preview
│       └── WireTransferForm.tsx      # Bank details display
│
├── components/
│   ├── theme-provider.tsx            # next-themes wrapper
│   └── ui/                           # 59 shadcn/ui components
│       ├── button.tsx, card.tsx, input.tsx, textarea.tsx, select.tsx,
│       │   checkbox.tsx, radio-group.tsx, form.tsx, label.tsx, ...
│       ├── dialog.tsx, alert-dialog.tsx, dropdown-menu.tsx, popover.tsx, ...
│       ├── table.tsx, pagination.tsx, badge.tsx, tabs.tsx, ...
│       ├── carousel.tsx, chart.tsx, skeleton.tsx, spinner.tsx, ...
│       ├── toast.tsx, toaster.tsx, sonner.tsx, ...
│       └── sidebar.tsx, scroll-area.tsx, separator.tsx, avatar.tsx, ...
│
├── lib/
│   ├── utils.ts                      # cn() - clsx + tailwind-merge
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   ├── server.ts                 # Server client (cookie-based SSR)
│   │   ├── admin.ts                  # Admin client (service role key)
│   │   └── proxy.ts                  # updateSession() utility for proxy.ts middleware
│   └── schemas/
│       ├── application.ts            # Zod schemas for scholarship forms
│       └── spotlight.ts              # Zod schemas for spotlight forms
│
├── types/
│   └── database.ts                   # Auto-generated Supabase TypeScript types
│
├── hooks/
│   ├── use-mobile.ts                 # Responsive breakpoint detection (768px)
│   └── use-toast.ts                  # Toast notification state (reducer-based)
│
├── public/                           # Static assets (icons, placeholders)
├── styles/
│   └── globals.css                   # Additional global styles
├── scripts/                          # Build/utility scripts
├── test-documents/                   # Sample test documents
│
├── proxy.ts                          # Next.js 16 middleware: session refresh + route protection
├── next.config.js                    # Image optimization (Unsplash, Supabase CDN)
├── tsconfig.json                     # Strict mode, path aliases (@/*)
├── postcss.config.mjs                # Tailwind CSS 4 integration
├── components.json                   # shadcn/ui config (New York style, lucide icons)
└── package.json                      # Dependencies and npm scripts
```

---

## Database Schema

### Tables (10)

**students**
- `id` (UUID, PK, matches auth.users.id)
- `email`, `full_name`, `phone`, `date_of_birth`, `gender`
- Location: `address`, `village`, `mandal`, `district`, `pincode`
- `created_at`, `updated_at`

**applications** (scholarship applications - 1st year & 2nd year)
- `id` (UUID, PK), `application_id` (human-readable: VF-{timestamp})
- `student_id` (FK -> students), `application_type` (first-year | second-year), `academic_year`
- `status`: pending | under_review | approved | rejected | needs_info
- Personal: `full_name`, `email`, `phone`, `date_of_birth`, `gender`, location fields
- Family: `mother_name`, `father_name`, occupations, mobiles, guardian fields, `family_adults_count`, `family_children_count`, `annual_family_income`
- Education: `high_school_studied`, `group_subjects`, SSC marks, college fields, 1st year marks (2nd year only)
- Bank: `bank_account_number`, `bank_name_branch`, `ifsc_code`
- Essays (2nd year): `study_activities`, `goals_dreams`, `additional_info`
- Admin review: `reviewed_by`, `reviewed_at`, `reviewer_notes`
- Spotlight: `spotlight_enabled`, `spotlight_story`, `spotlight_order`, `spotlight_annual_need`, `is_spotlight_eligible`
- `previous_application_id` (self-join for renewals)

**application_documents**
- `id`, `application_id` (FK)
- `document_type`: student_photo | ssc_marksheet | aadhar_student | aadhar_parent | bonafide_certificate | bank_passbook | first_year_marksheet | mango_plant_photo
- `storage_path`, `file_name`, `file_size`, `mime_type`, `uploaded_at`

**spotlight_applications** (standalone spotlight-only applications)
- `id`, `spotlight_id` (human-readable: VS-{timestamp})
- `student_id` (FK), `status`: pending | under_review | approved | rejected | needs_info
- Personal + location fields, education with `current_status`
- `competitive_exams` (JSON array), `circumstances` (JSON array)
- `parent_status`: both_alive | single_parent_father | single_parent_mother | orphan
- Conditional parent fields, `siblings_count`, `annual_family_income`
- `background_story`, `dreams_goals`, `how_help_changes_life`, `annual_financial_need`
- Admin: `reviewed_by`, `reviewed_at`, `reviewer_notes`
- Featured: `is_featured`, `featured_at`, `featured_order`, `photo_url`

**spotlight_documents**
- `id`, `spotlight_application_id` (FK)
- `document_type`: photo | marksheet | aadhar | income_certificate | other
- `storage_path`, `file_name`, `file_size`, `mime_type`, `uploaded_at`

**donations**
- `id`, `donation_id` (human-readable: DON-{timestamp})
- `donor_name`, `donor_email`, `donor_phone`, `amount`, `currency` (INR)
- `status`: pending | confirmed | completed | failed | refunded
- `payment_method`, `transaction_reference`
- `confirmed_by`, `confirmed_at`, `notes`

**help_interests**
- `id`, `name`, `email`, `phone`
- `help_type`: donate | volunteer | corporate | other
- `message`, `student_id` (optional FK), `student_name`
- `status`: new | contacted | converted | closed
- `followed_up_by`, `followed_up_at`, `notes`

**admins**
- `id` (UUID, matches auth.users.id), `email`, `name`
- `role`: admin | super_admin
- `created_by`, `created_at`

**admin_activity_log**
- `id`, `admin_user_id`, `action_type`, `entity_type`, `entity_id`
- `old_value` (JSON), `new_value` (JSON), `created_at`

**email_templates** / **email_logs**
- Templates: `name`, `display_name`, `subject`, `body`, `variables` (JSON), `is_enabled`
- Logs: `recipient_email`, `subject`, `body`, `template_name`, `status` (pending | sent | failed), `resend_id`, `related_entity_type`, `related_entity_id`

### Database Functions (RPC)

| Function | Returns | Purpose |
|----------|---------|---------|
| `generate_application_id()` | string | Creates VF-{timestamp} ID |
| `generate_donation_id()` | string | Creates DON-{timestamp} ID |
| `generate_spotlight_id()` | string | Creates VS-{timestamp} ID |
| `is_admin()` | boolean | Checks if current user exists in admins table |

### Storage Buckets

| Bucket | Purpose | Path Pattern | Limit |
|--------|---------|-------------|-------|
| `application-documents` | Scholarship docs | `{appId}/{docType}_{timestamp}.{ext}` | 10 MB |
| `spotlight-documents` | Spotlight docs | `{appId}/{docType}_{timestamp}.{ext}` | 10 MB |

### Relationships

```
students 1──* applications 1──* application_documents
students 1──* spotlight_applications 1──* spotlight_documents
applications *──1 applications (previous_application_id self-join)
help_interests *──? students (optional link)
admins (linked to auth.users)
donations (standalone, no FK)
```

---

## Authentication & Authorization

### Auth Flow

```
Email/Password Login:
  /login -> supabase.auth.signInWithPassword() -> AuthContext update -> redirect to /dashboard

Google OAuth:
  /login -> supabase.auth.signInWithOAuth({provider:'google'})
    -> Google consent -> /callback?code=...
    -> exchangeCodeForSession() -> redirect to /dashboard

Registration:
  /register -> supabase.auth.signUp({email,password,metadata:{full_name,role:'student'}})
    -> email verification -> /login?registered=true
```

### AuthContext (`app/context/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null          // Supabase Auth user
  session: Session | null    // Current session
  student: Student | null    // Student profile (null if admin)
  isAdmin: boolean           // true if user in admins table
  isLoading: boolean         // Auth initialization loading
  signOut: () => Promise<void>        // Global sign-out
  refreshStudent: () => Promise<void> // Re-fetch student profile
}
```

- Listens to `onAuthStateChange()` for session events
- On sign-in: calls `is_admin()` RPC, fetches student profile if not admin
- Uses `initializedRef` to distinguish first-time boot from post-init session recovery
- Post-init `SIGNED_IN` events (idle/tab reactivation) refresh data silently without showing loading spinner
- `TOKEN_REFRESHED` events update session/user only, no data re-fetch
- Sign-out uses `scope: 'global'` (all devices)

### Route Protection

**Client-side guards (layout useEffect):**
- `/dashboard/*` - Redirects to `/login?redirect=/dashboard` if no user
- `/admin/*` - Redirects to `/login?redirect=/admin` if no user, redirects to `/` if not admin
- Shows skeleton during `isLoading` to prevent blank screen

**API route guards:**
```typescript
// All admin API routes:
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401

const { data: isAdmin } = await supabase.rpc('is_admin')
if (!isAdmin) return 403
```

**`proxy.ts` middleware** - Refreshes Supabase session cookies on every request, redirects unauthenticated users from protected routes. Layout guards + API-level checks provide secondary enforcement.

### Supabase Clients

| Client | File | Key | Purpose |
|--------|------|-----|---------|
| Browser | `lib/supabase/client.ts` | ANON_KEY | **AuthContext only** (auth state management) |
| Server | `lib/supabase/server.ts` | ANON_KEY | API routes, Server Components (cookie-based) |
| Admin | `lib/supabase/admin.ts` | SERVICE_ROLE_KEY | Elevated operations (bypasses RLS) |
| Proxy | `lib/supabase/proxy.ts` | ANON_KEY | Middleware session refresh + cookie management |

**Important**: The browser client (`client.ts`) is ONLY used in `AuthContext.tsx` for auth state management. All data fetching (reads, writes, storage) goes through `/api/` routes using the server client. This avoids auth timing issues where the browser client token isn't ready yet.

---

## Routing Map

### Public Routes (no auth)

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Landing page with all home sections |
| `/login` | `app/(auth)/login/page.tsx` | Login form |
| `/register` | `app/(auth)/register/page.tsx` | Student registration |
| `/callback` | `app/(auth)/callback/route.ts` | OAuth callback |
| `/donate` | `app/donate/page.tsx` | Donation amount + donor form |
| `/donate/wire-transfer` | `app/donate/wire-transfer/page.tsx` | Bank transfer details |
| `/spotlight` | `app/spotlight/page.tsx` | Spotlight program info |
| `/students` | `app/students/page.tsx` | All featured students grid |

### Student Routes (auth required)

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/apply` | `app/apply/page.tsx` | 6-step scholarship application wizard |
| `/spotlight/apply` | `app/spotlight/apply/page.tsx` | 9-step spotlight application wizard |
| `/dashboard` | `app/dashboard/page.tsx` | Student overview (stats combine scholarship + spotlight) |
| `/dashboard/applications` | `app/dashboard/applications/page.tsx` | Unified list (scholarship + spotlight, type/status filters) |
| `/dashboard/applications/[id]` | `app/dashboard/applications/[id]/page.tsx` | Application detail |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Edit student profile |
| `/dashboard/spotlight/[id]` | `app/dashboard/spotlight/[id]/page.tsx` | Spotlight application detail |

### Admin Routes (auth + admin required)

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/admin` | `app/admin/page.tsx` | Stats dashboard + activity feed |
| `/admin/scholarship-applications` | `app/admin/scholarship-applications/page.tsx` | List/search/filter apps |
| `/admin/scholarship-applications/[id]` | `app/admin/scholarship-applications/[id]/page.tsx` | Review + status change |
| `/admin/spotlight-applications` | `app/admin/spotlight-applications/page.tsx` | List spotlight apps |
| `/admin/spotlight-applications/[id]` | `app/admin/spotlight-applications/[id]/page.tsx` | Review spotlight detail |
| `/admin/spotlight` | `app/admin/spotlight/page.tsx` | Manage featured students (drag-reorder) |
| `/admin/donations` | `app/admin/donations/page.tsx` | Track donations |
| `/admin/help-interests` | `app/admin/help-interests/page.tsx` | Track help interest leads |
| `/admin/activity-log` | `app/admin/activity-log/page.tsx` | Admin audit trail |

### API Routes (22 total)

**Public:**
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/featured-students` | Fetch featured students with signed photo URLs (supports `?limit=N`) |
| POST | `/api/donations` | Create donation record |
| GET/POST | `/api/help-interest` | Submit help interest |
| POST | `/api/upload` | Upload scholarship documents |
| GET | `/api/upload` | Get documents with signed URLs |
| POST | `/api/upload/spotlight` | Upload spotlight documents |
| GET | `/api/upload/spotlight` | Get spotlight docs with signed URLs |

**Student (auth required):**
| Method | Route | Purpose |
|--------|-------|---------|
| GET/PATCH | `/api/student/profile` | Get/update student profile |
| GET/POST | `/api/student/applications` | List/create scholarship applications |
| GET/PATCH | `/api/student/applications/[id]` | Single app + documents with signed URLs / Edit & resubmit (needs_info → under_review) |
| GET/POST | `/api/student/spotlight` | List/create spotlight apps |
| GET/PATCH | `/api/student/spotlight/[id]` | Single spotlight app detail / Edit & resubmit (needs_info → under_review) |

**Admin (auth + is_admin required):**
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/info` | Admin name and role |
| GET | `/api/admin/stats` | Dashboard statistics (pending count combines scholarship + spotlight) |
| GET | `/api/admin/activity-log` | Admin action history (paginated) |
| GET | `/api/admin/scholarship-applications` | List apps (search, filter, paginate) |
| GET/PATCH | `/api/admin/scholarship-applications/[id]` | View/update app status |
| GET | `/api/admin/spotlight-applications` | List spotlight apps |
| GET/PATCH | `/api/admin/spotlight-applications/[id]` | View/update spotlight app |
| GET/PUT | `/api/admin/spotlight/route.ts` | Get/reorder featured students |
| GET | `/api/admin/donations` | List all donations |
| GET/PATCH | `/api/admin/donations/[id]` | View/update donation |
| GET | `/api/admin/help-interests` | List help interests |
| GET/PATCH | `/api/admin/help-interests/[id]` | View/update help interest |

---

## Key Workflows

### Scholarship Application (6 steps)

```
/apply -> ApplicationWizard.tsx
  Step 0: PersonalInfoStep   -> photo, name, email, phone, DOB, location
                                (2nd year adds: gender)
  Step 1: FamilyBackgroundStep -> parent names, optional guardian
                                  (2nd year adds: occupation, mobile, family count, income)
  Step 2: EducationStep       -> high school, SSC marks (auto-% calc), college, course
                                 (2nd year adds: 1st year marks)
  Step 3: BankDetailsStep     -> account number, bank/branch, IFSC
  Step 4: DocumentsStep       -> file uploads (SSC, Aadhar x2, bonafide, passbook)
                                 (2nd year adds: 1st year marksheet, mango photo)
                                 (2nd year adds: essays - study activities, goals/dreams)
  Step 5: ReviewStep          -> summary with edit buttons -> declaration -> submit

Submit flow:
  1. Call generate_application_id() RPC
  2. Insert into applications table via POST /api/student/applications
  3. Upload student photo + all documents to Supabase Storage via POST /api/upload
  4. Insert document metadata into application_documents
  5. Update student profile
  6. Clear localStorage draft
  7. Show success with application ID

Auto-save: localStorage with 24hr expiry key (excludes file data)
Application types: first-year | second-year (toggle in wizard)
Duplicate check: one application per student per type per academic year
```

### Spotlight Application (9 steps)

```
/spotlight/apply -> SpotlightWizard.tsx
  Step 0: PersonalInfoStep      -> photo, name, DOB, gender, location + state
  Step 1: EducationStep         -> college, course/stream, marks, year, current_status
  Step 2: CompetitiveExamsStep  -> dynamic array (NEET/JEE/EAMCET scores)
  Step 3: FamilyBackgroundStep  -> parent_status (conditional fields), siblings, income
  Step 4: CircumstancesStep     -> checkboxes (single parent, orphan, disability, debt, etc.)
  Step 5: StoryGoalsStep        -> background_story, dreams_goals, how_help_changes_life, financial_need
  Step 6: DocumentsStep         -> photo, marksheet, aadhar (required), income cert (optional)
  Step 7: ReviewStep            -> summary -> submit

Submit: generate_spotlight_id() -> insert -> upload docs -> success
```

### Edit & Resubmit Workflow (needs_info)

```
Admin sets needs_info:
  /admin/spotlight-applications/[id] or /admin/scholarship-applications/[id]
  -> select "Needs Info" status + add reviewer note -> Save
  -> PATCH /api/admin/spotlight-applications/[id] or /api/admin/scholarship-applications/[id]

Student sees banner:
  /dashboard/applications/[id] or /dashboard/spotlight/[id]
  -> orange alert banner with reviewer notes + "Edit & Resubmit" button

Edit flow (scholarship):
  -> navigates to /apply?edit={id}&type={application_type}
  -> ApplicationWizard fetches existing data via GET /api/student/applications/{id}
  -> maps DB snake_case fields to camelCase form fields, pre-fills form
  -> type toggle hidden (locked to existing type)
  -> localStorage draft load/save skipped, profile pre-fill skipped
  -> DocumentsStep shows "Uploaded: filename" badges, file uploads not required
  -> on submit: PATCH /api/student/applications/{id} (status forced to under_review)
  -> only uploads documents where user selected new files
  -> success screen: "Application Resubmitted" with link to detail page

Edit flow (spotlight):
  -> navigates to /spotlight/apply?edit={id}
  -> SpotlightWizard follows same pattern via GET/PATCH /api/student/spotlight/{id}

Guard: PATCH returns 403 if status !== needs_info (scholarship) or not in [pending, needs_info] (spotlight)
```

### Donation Flow

```
/donate -> select amount ($500-$5000 or custom) + donor info form
  -> DonorContext.setDonorInfo() -> navigate to /donate/wire-transfer
  -> POST /api/donations (creates record with status: pending)
  -> Display bank transfer details

Admin confirms payment: PATCH /api/admin/donations/[id] -> status: confirmed/completed
```

### Admin Review Flow

```
/admin/scholarship-applications -> search/filter/paginate list
  -> click application -> /admin/scholarship-applications/[id]
  -> view all data + documents (signed URLs)
  -> change status (pending -> under_review -> approved/rejected/needs_info)
  -> add reviewer_notes
  -> PATCH /api/admin/scholarship-applications/[id]
  -> activity_log entry created automatically

Spotlight featuring:
  -> admin enables spotlight on approved scholarship app OR approves spotlight-only app
  -> /admin/spotlight -> drag-to-reorder featured students
  -> PUT /api/admin/spotlight -> update featured_order
```

---

## State Management

### React Context

**AuthContext** (wraps entire app)
- Provides: `user`, `session`, `student`, `isAdmin`, `isLoading`, `signOut()`, `refreshStudent()`
- Listens to Supabase auth state changes
- Determines role via `is_admin()` RPC
- Fetches student profile for non-admin users

**DonorContext** (wraps entire app)
- Provides: `donorInfo` (name, email, phone, amount, donationId)
- Carries state from `/donate` to `/donate/wire-transfer`

### Form State

- React Hook Form with `FormProvider` wrapping multi-step wizards
- `useFormContext()` in step components for field access
- Zod resolver for per-step validation
- localStorage auto-save on step navigation (24hr expiry)

---

## Validation Schemas

### Scholarship Schemas (`lib/schemas/application.ts`)

| Schema | Key Fields | Notes |
|--------|-----------|-------|
| `firstYearPersonalInfoSchema` | name, email, phone, DOB, location | Age 15-35, 6-digit PIN |
| `secondYearPersonalInfoSchema` | + gender | male/female |
| `firstYearFamilySchema` | motherName, fatherName, guardian? | Simple |
| `secondYearFamilySchema` | + occupation, mobile, family count, income | Income enum |
| `firstYearEducationSchema` | highSchool, SSC marks, college, course, admission date | Auto-calc % |
| `secondYearEducationSchema` | + 1st year marks, currentCollege | No admission date |
| `bankDetailsSchema` | accountNumber, bankNameBranch, ifscCode | IFSC: `^[A-Z]{4}0[A-Z0-9]{6}$` |
| `firstYearDocumentsSchema` | photo, SSC, aadhar x2, bonafide, passbook | All required files |
| `secondYearDocumentsSchema` | + 1st year marksheet, mango photo | Photo optional |
| `secondYearStatementSchema` | studyActivities, goalsDreams, additionalInfo? | Min 50 chars |
| `helpInterestSchema` | name, email, helpType, message | Modal form |

Helper: `getStepSchema(step, applicationType)` returns correct schema per step.
Helper: `getStepFields(step, applicationType)` returns field names for validation.

### Spotlight Schemas (`lib/schemas/spotlight.ts`)

| Schema | Key Fields |
|--------|-----------|
| `spotlightPersonalInfoSchema` | photo, name, DOB, gender, location + state |
| `spotlightEducationSchema` | college, course, marks, year, currentStatus |
| `spotlightCompetitiveExamsSchema` | dynamic exams array (name, score, percentile) |
| `spotlightFamilySchema` | parentStatus, conditional parent fields, siblings, income |
| `spotlightCircumstancesSchema` | circumstances array, circumstances_other |
| `spotlightStorySchema` | backgroundStory, dreamsGoals, howHelpChangesLife, financialNeed |
| `spotlightDocumentsSchema` | photo, marksheet, aadhar (required), income cert (optional) |

---

## Enums & Constants

```typescript
ApplicationType    = 'first-year' | 'second-year'
ApplicationStatus  = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
SpotlightStatus    = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
DonationStatus     = 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'
HelpType           = 'donate' | 'volunteer' | 'corporate' | 'other'
HelpInterestStatus = 'new' | 'contacted' | 'converted' | 'closed'
Gender             = 'male' | 'female'
AdminRole          = 'admin' | 'super_admin'
ParentStatus       = 'both_alive' | 'single_parent_father' | 'single_parent_mother' | 'orphan'
CurrentStatus      = 'studying' | 'seeking_admission' | 'working' | 'other'
IncomeRange        = 'below-1-lakh' | '1-2-lakhs' | '2-3-lakhs' | '3-5-lakhs' | 'above-5-lakhs'
EmailStatus        = 'pending' | 'sent' | 'failed'

Document types (scholarship): student_photo | ssc_marksheet | aadhar_student | aadhar_parent
                               | bonafide_certificate | bank_passbook | first_year_marksheet
                               | mango_plant_photo
Document types (spotlight):    photo | marksheet | aadhar | income_certificate | other
```

---

## Key Design Patterns

1. **Multi-step wizard**: React Hook Form + FormProvider, Zod per-step validation, localStorage auto-save
2. **Auth guard**: `proxy.ts` (Next.js 16 middleware) refreshes Supabase session cookies + redirects unauthenticated users. Client-side useEffect in layout.tsx as secondary guard. API-level auth + admin RPC check.
3. **Data fetching via API routes**: ALL pages fetch data through `/api/` routes (server-side Supabase client with cookies). No page or component uses the browser Supabase client for data fetching. The browser client is only used in `AuthContext.tsx` for auth state. This avoids auth timing issues where the browser client token isn't ready.
4. **Admin activity logging**: Every status change inserts into admin_activity_log with old/new JSON values
5. **File upload**: Client validates type/size -> POST multipart to API route -> Supabase Storage -> insert metadata row
6. **Signed URLs**: Documents served via `createSignedUrl()` with 1hr expiry (photos: 1yr for homepage display)
7. **Conditional forms**: `applicationType` (first-year/second-year) and `parentStatus` drive different field sets
8. **Dual spotlight sources**: Scholarship applicants (admin-enabled) + standalone spotlight applicants
9. **Draft persistence**: localStorage keyed by application type with 24hr TTL, excludes all file data (studentPhoto, sscMarksheet, aadharStudent, aadharParent, bonafideCertificate, bankPassbook, firstYearMarksheet, mangoPlantPhoto)

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://ukjlfvupcajxnqyoinso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
ADMIN_EMAIL=admin@vidyonnati.org
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Config Files

| File | Purpose |
|------|---------|
| `next.config.js` | Image optimization: Unsplash (`images.unsplash.com`), Supabase CDN (`ukjlfvupcajxnqyoinso.supabase.co`), WebP format |
| `tsconfig.json` | Strict mode, `@/*` path alias to project root |
| `postcss.config.mjs` | `@tailwindcss/postcss` plugin |
| `components.json` | shadcn/ui: New York style, lucide icons, `@/components` path |

---

## Project Progress

### Completed

| Phase | Description |
|-------|-------------|
| Phase A | Database infrastructure: 10 tables, RLS, RPC functions, storage buckets |
| Phase 8 | Student dashboard: application list/detail, profile editing, spotlight viewing |
| Phase 9-10 | API routes (19 endpoints) and form integrations |
| Phase B | Admin dashboard core: stats overview, scholarship app management, search/filter |
| Phase C | Admin dashboard complete: donations, help interests, spotlight management, activity log |
| Phase D | Spotlight application: 9-step wizard, student dashboard integration, blank screen fix |
| Phase D.1 | Unified data fetching: migrated all pages to API routes, fixed student photo upload, removed browser client from all pages |
| Phase D.2 | Auth idle fix + unified dashboards: fixed SIGNED_IN loading flash on idle/tab reactivation, unified scholarship + spotlight counts in student dashboard stats and admin stats, unified "My Applications" list with type/status filters |
| Phase E | Homepage featured students: public API (`/api/featured-students`) fetches from both spotlight & scholarship tables with signed photo URLs + derived achievements; extracted `StudentCard` + `HelpInterestDialog` shared components; data-driven `StudentSpotlightSection` with fallback placeholders + loading skeletons; new `/students` page with full grid + empty state |

### Not Started

| Phase | Description |
|-------|-------------|
| Phase F | Email notifications: wire Resend into status change workflows using email_templates/email_logs tables |

### Known Gaps

- Email system has DB infrastructure (templates + logs tables) but no send logic
- Supabase MCP tool is linked to project `gpwtnzeawexqabilvbey` (ravila), not the app's project `ukjlfvupcajxnqyoinso` — needs token update for MCP DB access

---

## File Statistics

| Metric | Count |
|--------|-------|
| TypeScript/TSX files | ~157 |
| Pages (page.tsx) | 23 |
| API routes (route.ts) | 22 |
| Layouts (layout.tsx) | 4 |
| UI components (shadcn) | 59 |
| Feature components | 20 |
| Form step components | 14 |
| Zod schemas | 22+ |
| Database tables | 10 |
| RPC functions | 4 |
| npm dependencies | 159 |
