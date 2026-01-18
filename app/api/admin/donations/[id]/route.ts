import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { DonationStatus, AdminActivityLogInsert } from '@/types/database'

const VALID_STATUSES: DonationStatus[] = ['pending', 'confirmed', 'completed', 'failed', 'refunded']

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

  // Fetch donation
  const { data: donation, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !donation) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  }

  return NextResponse.json({ donation })
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

  // Fetch current donation for activity log
  const { data: currentDonation, error: fetchError } = await supabase
    .from('donations')
    .select('status, notes, transaction_reference')
    .eq('id', id)
    .single()

  if (fetchError || !currentDonation) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.status !== undefined) {
    updateData.status = body.status
    // If confirming, set confirmed_by and confirmed_at
    if (body.status === 'confirmed' || body.status === 'completed') {
      updateData.confirmed_by = user.id
      updateData.confirmed_at = new Date().toISOString()
    }
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes
  }

  if (body.transaction_reference !== undefined) {
    updateData.transaction_reference = body.transaction_reference
  }

  // Update donation
  const { data: updatedDonation, error: updateError } = await supabase
    .from('donations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating donation:', updateError)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }

  // Determine action type for activity log
  let actionType = 'notes_update'
  if (body.status && body.status !== currentDonation.status) {
    actionType = 'status_change'
  }

  // Log activity
  const activityLog: AdminActivityLogInsert = {
    admin_user_id: user.id,
    action_type: actionType,
    entity_type: 'donation',
    entity_id: id,
    old_value: {
      status: currentDonation.status,
      notes: currentDonation.notes,
      transaction_reference: currentDonation.transaction_reference,
    },
    new_value: {
      status: updatedDonation.status,
      notes: updatedDonation.notes,
      transaction_reference: updatedDonation.transaction_reference,
    },
  }

  await supabase.from('admin_activity_log').insert(activityLog)

  return NextResponse.json({ donation: updatedDonation })
}
