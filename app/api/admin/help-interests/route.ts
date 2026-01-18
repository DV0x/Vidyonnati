import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { HelpType, HelpInterestStatus } from '@/types/database'

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
  const status = searchParams.get('status') as HelpInterestStatus | null
  const helpType = searchParams.get('type') as HelpType | null
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

  // Build query
  let query = supabase
    .from('help_interests')
    .select('*', { count: 'exact' })

  // Search filter (on name, email, or student_name)
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,student_name.ilike.%${search}%`
    )
  }

  // Status filter
  if (status) {
    query = query.eq('status', status)
  }

  // Help type filter
  if (helpType) {
    query = query.eq('help_type', helpType)
  }

  // Order by created_at descending
  query = query.order('created_at', { ascending: false })

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: helpInterests, error, count } = await query

  if (error) {
    console.error('Error fetching help interests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch help interests' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    helpInterests: helpInterests ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  })
}
