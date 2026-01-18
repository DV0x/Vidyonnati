import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ApplicationStatus, AdminActivityLogInsert } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin check
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch application with documents
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
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

  // Generate signed URLs for documents
  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin check
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse request body
  let body: { status?: ApplicationStatus; reviewer_notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Validate status if provided
  const validStatuses: ApplicationStatus[] = ['pending', 'under_review', 'approved', 'rejected', 'needs_info']
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    )
  }

  // Fetch current application for activity log
  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('status, reviewer_notes')
    .eq('id', id)
    .single()

  if (fetchError || !currentApp) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.status) {
    updateData.status = body.status
    updateData.reviewed_by = user.id
    updateData.reviewed_at = new Date().toISOString()
  }

  if (body.reviewer_notes !== undefined) {
    updateData.reviewer_notes = body.reviewer_notes
  }

  // Update application
  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating application:', updateError)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }

  // Log activity
  const activityLog: AdminActivityLogInsert = {
    admin_user_id: user.id,
    action_type: body.status ? 'status_change' : 'notes_update',
    entity_type: 'application',
    entity_id: id,
    old_value: {
      status: currentApp.status,
      reviewer_notes: currentApp.reviewer_notes,
    },
    new_value: {
      status: updatedApp.status,
      reviewer_notes: updatedApp.reviewer_notes,
    },
  }

  await supabase.from('admin_activity_log').insert(activityLog)

  return NextResponse.json(updatedApp)
}
