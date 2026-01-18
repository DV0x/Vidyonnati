import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SpotlightApplicationInsert } from '@/types/database'

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
    .from('spotlight_applications')
    .select(`
      *,
      spotlight_documents (*)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch spotlight applications' },
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

  let body: Partial<SpotlightApplicationInsert>
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
    'full_name',
    'date_of_birth',
    'phone',
    'email',
    'village',
    'mandal',
    'district',
    'pincode',
    'college_name',
    'course_stream',
    'year_of_completion',
    'total_marks',
    'max_marks',
    'percentage',
    'current_status',
    'parent_status',
    'circumstances',
    'background_story',
    'dreams_goals',
    'how_help_changes_life',
    'annual_financial_need',
  ] as const

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  // Check for existing active application (pending or under_review)
  const { data: existingApp } = await supabase
    .from('spotlight_applications')
    .select('id, spotlight_id, status')
    .eq('student_id', user.id)
    .in('status', ['pending', 'under_review'])
    .single()

  if (existingApp) {
    return NextResponse.json(
      {
        error: 'You already have an active spotlight application',
        existingApplicationId: existingApp.spotlight_id
      },
      { status: 409 }
    )
  }

  // Generate spotlight ID using the database function
  const { data: spotlightIdResult } = await supabase.rpc('generate_spotlight_id')
  const spotlightId = spotlightIdResult || `VS-${Date.now()}`

  // Create the application
  const applicationData: SpotlightApplicationInsert = {
    spotlight_id: spotlightId,
    student_id: user.id,
    status: 'pending',

    // Personal info
    full_name: body.full_name!,
    date_of_birth: body.date_of_birth!,
    gender: body.gender || null,
    phone: body.phone!,
    email: body.email!,
    village: body.village!,
    mandal: body.mandal!,
    district: body.district!,
    state: body.state || 'Andhra Pradesh',
    pincode: body.pincode!,

    // Education
    college_name: body.college_name!,
    course_stream: body.course_stream!,
    year_of_completion: body.year_of_completion!,
    total_marks: body.total_marks!,
    max_marks: body.max_marks!,
    percentage: body.percentage!,
    current_status: body.current_status!,

    // Competitive Exams
    competitive_exams: body.competitive_exams || null,

    // Family Background
    parent_status: body.parent_status!,
    mother_name: body.mother_name || null,
    mother_occupation: body.mother_occupation || null,
    mother_health: body.mother_health || null,
    father_name: body.father_name || null,
    father_occupation: body.father_occupation || null,
    father_health: body.father_health || null,
    guardian_name: body.guardian_name || null,
    guardian_relationship: body.guardian_relationship || null,
    guardian_details: body.guardian_details || null,
    siblings_count: body.siblings_count || null,
    annual_family_income: body.annual_family_income || null,

    // Circumstances
    circumstances: body.circumstances!,
    circumstances_other: body.circumstances_other || null,

    // Story & Goals
    background_story: body.background_story!,
    dreams_goals: body.dreams_goals!,
    how_help_changes_life: body.how_help_changes_life!,
    annual_financial_need: body.annual_financial_need!,
  }

  const { data: application, error } = await supabase
    .from('spotlight_applications')
    .insert(applicationData)
    .select()
    .single()

  if (error) {
    console.error('Spotlight application creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create spotlight application' },
      { status: 500 }
    )
  }

  return NextResponse.json(application, { status: 201 })
}
