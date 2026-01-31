import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { SpotlightStatus, AdminActivityLogInsert } from '@/types/database'

const VALID_STATUSES: SpotlightStatus[] = ['pending', 'under_review', 'approved', 'rejected', 'needs_info']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  // Fetch application
  const { data: application, error: appError } = await supabase
    .from('spotlight_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Fetch documents
  const { data: documents } = await supabase
    .from('spotlight_documents')
    .select('*')
    .eq('spotlight_application_id', id)
    .order('uploaded_at', { ascending: true })

  // Generate signed URLs for documents
  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from('spotlight-documents')
        .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

      return {
        ...doc,
        signedUrl: data?.signedUrl || null,
      }
    })
  )

  return NextResponse.json({
    application,
    documents: documentsWithUrls,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const body = await request.json()

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Fetch current application for activity log
  const { data: currentApp, error: fetchError } = await supabase
    .from('spotlight_applications')
    .select('status, reviewer_notes, is_featured')
    .eq('id', id)
    .single()

  if (fetchError || !currentApp) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.status !== undefined) {
    updateData.status = body.status
    updateData.reviewed_by = user.id
    updateData.reviewed_at = new Date().toISOString()
  }

  if (body.reviewer_notes !== undefined) {
    updateData.reviewer_notes = body.reviewer_notes
  }

  if (body.is_featured !== undefined) {
    updateData.is_featured = body.is_featured
    if (body.is_featured) {
      updateData.featured_at = new Date().toISOString()
    } else {
      updateData.featured_at = null
    }
  }

  // Update application
  const { data: updatedApp, error: updateError } = await supabase
    .from('spotlight_applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating spotlight application:', updateError)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }

  // Determine action type for activity log
  let actionType = 'notes_update'
  if (body.status && body.status !== currentApp.status) {
    actionType = 'status_change'
  } else if (body.is_featured !== undefined && body.is_featured !== currentApp.is_featured) {
    actionType = 'featured_change'
  }

  // Log activity
  const activityLog: AdminActivityLogInsert = {
    admin_user_id: user.id,
    action_type: actionType,
    entity_type: 'spotlight_application',
    entity_id: id,
    old_value: {
      status: currentApp.status,
      reviewer_notes: currentApp.reviewer_notes,
      is_featured: currentApp.is_featured,
    },
    new_value: {
      status: updatedApp.status,
      reviewer_notes: updatedApp.reviewer_notes,
      is_featured: updatedApp.is_featured,
    },
  }

  await supabase.from('admin_activity_log').insert(activityLog)

  return NextResponse.json({ application: updatedApp })
}
