import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { SpotlightStatus } from '@/types/database'

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

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') as SpotlightStatus | null
  const featured = searchParams.get('featured')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

  // Build query
  let query = supabase
    .from('spotlight_applications')
    .select('*', { count: 'exact' })

  // Search filter (on full_name, email, or spotlight_id)
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,spotlight_id.ilike.%${search}%`
    )
  }

  // Status filter
  if (status) {
    query = query.eq('status', status)
  }

  // Featured filter
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  } else if (featured === 'false') {
    query = query.eq('is_featured', false)
  }

  // Order by created_at descending
  query = query.order('created_at', { ascending: false })

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: applications, error, count } = await query

  if (error) {
    console.error('Error fetching spotlight applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spotlight applications' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    applications: applications ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  })
}
