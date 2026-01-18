import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AdminActivityLogInsert } from '@/types/database'

// GET - Fetch all featured students from both sources
export async function GET(request: NextRequest) {
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

  // Fetch featured students from scholarship applications
  const { data: scholarshipStudents, error: scholarshipError } = await supabase
    .from('applications')
    .select('id, application_id, full_name, email, spotlight_story, spotlight_annual_need, spotlight_enabled, spotlight_enabled_at, spotlight_order, status')
    .eq('spotlight_enabled', true)
    .order('spotlight_order', { ascending: true, nullsFirst: false })

  if (scholarshipError) {
    console.error('Error fetching scholarship students:', scholarshipError)
    return NextResponse.json({ error: 'Failed to fetch scholarship students' }, { status: 500 })
  }

  // Fetch featured students from spotlight applications
  const { data: spotlightStudents, error: spotlightError } = await supabase
    .from('spotlight_applications')
    .select('id, spotlight_id, full_name, email, background_story, annual_financial_need, is_featured, featured_at, featured_order, status, photo_url')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true, nullsFirst: false })

  if (spotlightError) {
    console.error('Error fetching spotlight students:', spotlightError)
    return NextResponse.json({ error: 'Failed to fetch spotlight students' }, { status: 500 })
  }

  // Normalize the data to a common format
  const normalizedScholarship = (scholarshipStudents || []).map(s => ({
    id: s.id,
    displayId: s.application_id,
    fullName: s.full_name,
    email: s.email,
    story: s.spotlight_story,
    annualNeed: s.spotlight_annual_need,
    isFeatured: s.spotlight_enabled,
    featuredAt: s.spotlight_enabled_at,
    order: s.spotlight_order,
    status: s.status,
    source: 'scholarship' as const,
    photoUrl: null,
  }))

  const normalizedSpotlight = (spotlightStudents || []).map(s => ({
    id: s.id,
    displayId: s.spotlight_id,
    fullName: s.full_name,
    email: s.email,
    story: s.background_story,
    annualNeed: s.annual_financial_need,
    isFeatured: s.is_featured,
    featuredAt: s.featured_at,
    order: s.featured_order,
    status: s.status,
    source: 'spotlight' as const,
    photoUrl: s.photo_url,
  }))

  // Combine and sort by order
  const allFeatured = [...normalizedScholarship, ...normalizedSpotlight]
    .sort((a, b) => {
      if (a.order === null && b.order === null) return 0
      if (a.order === null) return 1
      if (b.order === null) return -1
      return a.order - b.order
    })

  return NextResponse.json({
    students: allFeatured,
    scholarshipCount: normalizedScholarship.length,
    spotlightCount: normalizedSpotlight.length,
  })
}

// PATCH - Update featured status or reorder
export async function PATCH(request: NextRequest) {
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

  // Handle reorder operation
  if (body.reorder && Array.isArray(body.reorder)) {
    const reorderItems = body.reorder as Array<{
      id: string
      source: 'scholarship' | 'spotlight'
      order: number
    }>

    // Update orders in parallel
    const updatePromises = reorderItems.map(async (item) => {
      if (item.source === 'scholarship') {
        return supabase
          .from('applications')
          .update({ spotlight_order: item.order })
          .eq('id', item.id)
      } else {
        return supabase
          .from('spotlight_applications')
          .update({ featured_order: item.order })
          .eq('id', item.id)
      }
    })

    const results = await Promise.all(updatePromises)
    const hasError = results.some(r => r.error)

    if (hasError) {
      return NextResponse.json({ error: 'Failed to reorder students' }, { status: 500 })
    }

    // Log activity
    const activityLog: AdminActivityLogInsert = {
      admin_user_id: user.id,
      action_type: 'spotlight_reorder',
      entity_type: 'spotlight',
      entity_id: 'batch',
      old_value: null,
      new_value: { reorder: reorderItems },
    }
    await supabase.from('admin_activity_log').insert(activityLog)

    return NextResponse.json({ success: true })
  }

  // Handle toggle featured for a single student
  if (body.toggleFeatured) {
    const { id, source, featured } = body.toggleFeatured as {
      id: string
      source: 'scholarship' | 'spotlight'
      featured: boolean
    }

    if (source === 'scholarship') {
      const { error } = await supabase
        .from('applications')
        .update({
          spotlight_enabled: featured,
          spotlight_enabled_at: featured ? new Date().toISOString() : null,
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to update spotlight status' }, { status: 500 })
      }
    } else {
      const { error } = await supabase
        .from('spotlight_applications')
        .update({
          is_featured: featured,
          featured_at: featured ? new Date().toISOString() : null,
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to update featured status' }, { status: 500 })
      }
    }

    // Log activity
    const activityLog: AdminActivityLogInsert = {
      admin_user_id: user.id,
      action_type: 'featured_change',
      entity_type: source === 'scholarship' ? 'application' : 'spotlight_application',
      entity_id: id,
      old_value: { is_featured: !featured },
      new_value: { is_featured: featured },
    }
    await supabase.from('admin_activity_log').insert(activityLog)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
