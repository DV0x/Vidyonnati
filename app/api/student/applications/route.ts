import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ApplicationInsert, ApplicationType } from '@/types/database'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      application_documents (*)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }

  return NextResponse.json(applications)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  let body: Partial<ApplicationInsert>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Validate required fields
  const requiredFields = [
    'application_type',
    'academic_year',
    'full_name',
    'email',
    'phone',
    'date_of_birth',
    'village',
    'mandal',
    'district',
    'pincode',
    'address',
    'mother_name',
    'father_name',
    'high_school_studied',
    'ssc_total_marks',
    'ssc_max_marks',
    'ssc_percentage',
    'college_address',
    'group_subjects',
    'bank_account_number',
    'bank_name_branch',
    'ifsc_code',
  ] as const

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  const applicationType = body.application_type as ApplicationType
  const academicYear = body.academic_year as string

  // Check for duplicate application (same type and academic year)
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id, application_id')
    .eq('student_id', user.id)
    .eq('application_type', applicationType)
    .eq('academic_year', academicYear)
    .single()

  if (existingApp) {
    return NextResponse.json(
      {
        error: `You already have a ${applicationType} application for ${academicYear}`,
        existingApplicationId: existingApp.application_id
      },
      { status: 409 }
    )
  }

  // For renewal applications, find and link to previous approved application
  let previousApplicationId: string | null = null
  if (applicationType === 'second-year') {
    const { data: previousApp } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('application_type', 'first-year')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (previousApp) {
      previousApplicationId = previousApp.id
    }
  }

  // Generate application ID using the database function
  const { data: appIdResult } = await supabase.rpc('generate_application_id')
  const applicationId = appIdResult || `VF-${Date.now()}`

  // Create the application
  const applicationData: ApplicationInsert = {
    application_id: applicationId,
    student_id: user.id,
    previous_application_id: previousApplicationId,
    application_type: applicationType,
    academic_year: academicYear,
    status: 'pending',

    // Personal info
    full_name: body.full_name!,
    email: body.email!,
    phone: body.phone!,
    date_of_birth: body.date_of_birth!,
    gender: body.gender || null,
    village: body.village!,
    mandal: body.mandal!,
    district: body.district!,
    pincode: body.pincode!,
    address: body.address!,

    // Family info
    mother_name: body.mother_name!,
    father_name: body.father_name!,
    guardian_name: body.guardian_name || null,
    guardian_relationship: body.guardian_relationship || null,
    mother_occupation: body.mother_occupation || null,
    mother_mobile: body.mother_mobile || null,
    father_occupation: body.father_occupation || null,
    father_mobile: body.father_mobile || null,
    guardian_details: body.guardian_details || null,
    family_adults_count: body.family_adults_count || null,
    family_children_count: body.family_children_count || null,
    annual_family_income: body.annual_family_income || null,

    // Education info
    high_school_studied: body.high_school_studied!,
    ssc_total_marks: body.ssc_total_marks!,
    ssc_max_marks: body.ssc_max_marks!,
    ssc_percentage: body.ssc_percentage!,
    college_address: body.college_address!,
    group_subjects: body.group_subjects!,

    // 1st year specific
    college_admitted: body.college_admitted || null,
    course_joined: body.course_joined || null,
    date_of_admission: body.date_of_admission || null,

    // 2nd year specific
    current_college: body.current_college || null,
    course_studying: body.course_studying || null,
    first_year_total_marks: body.first_year_total_marks || null,
    first_year_max_marks: body.first_year_max_marks || null,
    first_year_percentage: body.first_year_percentage || null,

    // Bank details
    bank_account_number: body.bank_account_number!,
    bank_name_branch: body.bank_name_branch!,
    ifsc_code: body.ifsc_code!,

    // Essays (2nd year)
    study_activities: body.study_activities || null,
    goals_dreams: body.goals_dreams || null,
    additional_info: body.additional_info || null,
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert(applicationData)
    .select()
    .single()

  if (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }

  // Update student profile with latest info
  await supabase
    .from('students')
    .update({
      full_name: body.full_name,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      village: body.village,
      mandal: body.mandal,
      district: body.district,
      pincode: body.pincode,
      address: body.address,
    })
    .eq('id', user.id)

  return NextResponse.json(application, { status: 201 })
}
