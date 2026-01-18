import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { StudentUpdate } from '@/types/database'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }

  return NextResponse.json(student)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  let body: StudentUpdate
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Only allow updating specific fields
  const allowedFields: (keyof StudentUpdate)[] = [
    'full_name',
    'phone',
    'date_of_birth',
    'gender',
    'village',
    'mandal',
    'district',
    'pincode',
    'address',
  ]

  const updateData: StudentUpdate = {}
  for (const field of allowedFields) {
    if (field in body && body[field] !== undefined) {
      (updateData as Record<string, unknown>)[field] = body[field]
    }
  }

  const { data: student, error } = await supabase
    .from('students')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }

  return NextResponse.json(student)
}
