import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
  const actionType = searchParams.get('action_type')
  const entityType = searchParams.get('entity_type')
  const adminId = searchParams.get('admin_id')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

  // Build query
  let query = supabase
    .from('admin_activity_log')
    .select('*', { count: 'exact' })

  // Action type filter
  if (actionType) {
    query = query.eq('action_type', actionType)
  }

  // Entity type filter
  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  // Admin filter
  if (adminId) {
    query = query.eq('admin_user_id', adminId)
  }

  // Order by created_at descending
  query = query.order('created_at', { ascending: false })

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: activities, error, count } = await query

  if (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }

  // Fetch admin info for each activity
  const adminIds = [...new Set((activities || []).map(a => a.admin_user_id))]
  const { data: admins } = await supabase
    .from('admins')
    .select('id, name, email')
    .in('id', adminIds)

  const adminMap = new Map(admins?.map(a => [a.id, a]) || [])

  // Enrich activities with admin info
  const enrichedActivities = (activities || []).map(activity => ({
    ...activity,
    admin: adminMap.get(activity.admin_user_id) || { name: 'Unknown', email: activity.admin_user_id },
  }))

  // Also fetch list of all admins for filter dropdown
  const { data: allAdmins } = await supabase
    .from('admins')
    .select('id, name, email')
    .order('name')

  return NextResponse.json({
    activities: enrichedActivities,
    admins: allAdmins || [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  })
}
