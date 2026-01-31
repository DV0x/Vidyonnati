import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

  // Fetch stats in parallel
  const [
    pendingApplicationsResult,
    pendingSpotlightResult,
    newHelpInterestsResult,
    pendingDonationsResult,
    featuredStudentsResult,
  ] = await Promise.all([
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('spotlight_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('help_interests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase
      .from('donations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('spotlight_applications')
      .select('id', { count: 'exact', head: true })
      .eq('is_featured', true),
  ])

  return NextResponse.json({
    pendingApplications: (pendingApplicationsResult.count ?? 0) + (pendingSpotlightResult.count ?? 0),
    newHelpInterests: newHelpInterestsResult.count ?? 0,
    pendingDonations: pendingDonationsResult.count ?? 0,
    featuredStudents: featuredStudentsResult.count ?? 0,
  })
}
