import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Fetch application ensuring it belongs to the user
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('student_id', user.id)
    .single()

  if (appError || !application) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  // Fetch documents
  const { data: documents } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', id)

  // Generate signed URLs for all documents
  const documentsWithUrls = await Promise.all(
    (documents || []).map(async (doc) => {
      const { data } = await supabase.storage
        .from('application-documents')
        .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

      return {
        ...doc,
        signedUrl: data?.signedUrl || null,
      }
    })
  )

  return NextResponse.json({
    ...application,
    documents: documentsWithUrls,
  })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if application exists and belongs to user
  const { data: existingApp, error: fetchError } = await supabase
    .from('applications')
    .select('id, status, student_id')
    .eq('id', id)
    .eq('student_id', user.id)
    .single()

  if (fetchError || !existingApp) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  // Only allow updates if status is 'needs_info'
  if (existingApp.status !== 'needs_info') {
    return NextResponse.json(
      { error: 'Cannot update application with current status' },
      { status: 403 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Remove fields that shouldn't be updated by student
  delete body.id
  delete body.application_id
  delete body.student_id
  delete body.status
  delete body.reviewed_by
  delete body.reviewed_at
  delete body.reviewer_notes
  delete body.spotlight_id
  delete body.created_at

  // Force status to under_review and set updated_at
  const updateData = {
    ...body,
    status: 'under_review',
    updated_at: new Date().toISOString(),
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }

  return NextResponse.json(application)
}
