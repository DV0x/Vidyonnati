import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { HelpInterestStatus, AdminActivityLogInsert } from '@/types/database'

const VALID_STATUSES: HelpInterestStatus[] = ['new', 'contacted', 'converted', 'closed']

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

  // Fetch help interest
  const { data: helpInterest, error } = await supabase
    .from('help_interests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !helpInterest) {
    return NextResponse.json({ error: 'Help interest not found' }, { status: 404 })
  }

  return NextResponse.json({ helpInterest })
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

  // Fetch current help interest for activity log
  const { data: currentInterest, error: fetchError } = await supabase
    .from('help_interests')
    .select('status, notes')
    .eq('id', id)
    .single()

  if (fetchError || !currentInterest) {
    return NextResponse.json({ error: 'Help interest not found' }, { status: 404 })
  }

  // Build update object
  const updateData: Record<string, unknown> = {}

  if (body.status !== undefined) {
    updateData.status = body.status
    // If status changed to contacted or later, record follow-up info
    if (body.status !== 'new' && currentInterest.status === 'new') {
      updateData.followed_up_by = user.id
      updateData.followed_up_at = new Date().toISOString()
    }
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes
  }

  // Update help interest
  const { data: updatedInterest, error: updateError } = await supabase
    .from('help_interests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating help interest:', updateError)
    return NextResponse.json(
      { error: 'Failed to update help interest' },
      { status: 500 }
    )
  }

  // Determine action type for activity log
  let actionType = 'notes_update'
  if (body.status && body.status !== currentInterest.status) {
    actionType = 'status_change'
  }

  // Log activity
  const activityLog: AdminActivityLogInsert = {
    admin_user_id: user.id,
    action_type: actionType,
    entity_type: 'help_interest',
    entity_id: id,
    old_value: {
      status: currentInterest.status,
      notes: currentInterest.notes,
    },
    new_value: {
      status: updatedInterest.status,
      notes: updatedInterest.notes,
    },
  }

  await supabase.from('admin_activity_log').insert(activityLog)

  return NextResponse.json({ helpInterest: updatedInterest })
}
