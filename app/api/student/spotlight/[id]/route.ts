import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SpotlightApplicationUpdate } from '@/types/database'

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

  const { data: application, error } = await supabase
    .from('spotlight_applications')
    .select(`
      *,
      spotlight_documents (*)
    `)
    .eq('id', id)
    .eq('student_id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Spotlight application not found' },
      { status: 404 }
    )
  }

  // Generate signed URLs for documents
  interface DocumentWithUrl {
    [key: string]: unknown
    signedUrl: string | null
  }

  let documentsWithUrls: DocumentWithUrl[] = []
  if (application.spotlight_documents && application.spotlight_documents.length > 0) {
    documentsWithUrls = await Promise.all(
      application.spotlight_documents.map(async (doc: { storage_path: string; [key: string]: unknown }) => {
        const { data } = await supabase.storage
          .from('spotlight-documents')
          .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

        return {
          ...doc,
          signedUrl: data?.signedUrl || null,
        } as DocumentWithUrl
      })
    )
  }

  return NextResponse.json({
    ...application,
    spotlight_documents: documentsWithUrls,
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
    .from('spotlight_applications')
    .select('id, status')
    .eq('id', id)
    .eq('student_id', user.id)
    .single()

  if (fetchError || !existingApp) {
    return NextResponse.json(
      { error: 'Spotlight application not found' },
      { status: 404 }
    )
  }

  // Only allow updates if status is 'pending' or 'needs_info'
  if (!['pending', 'needs_info'].includes(existingApp.status)) {
    return NextResponse.json(
      { error: 'Cannot update application with current status' },
      { status: 403 }
    )
  }

  let body: Partial<SpotlightApplicationUpdate>
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
  delete body.spotlight_id
  delete body.student_id
  delete body.status
  delete body.reviewed_by
  delete body.reviewed_at
  delete body.reviewer_notes
  delete body.is_featured
  delete body.featured_at
  delete body.featured_order
  delete body.photo_url
  delete body.created_at

  // Add updated_at
  body.updated_at = new Date().toISOString()

  const { data: application, error } = await supabase
    .from('spotlight_applications')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Spotlight application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update spotlight application' },
      { status: 500 }
    )
  }

  return NextResponse.json(application)
}
