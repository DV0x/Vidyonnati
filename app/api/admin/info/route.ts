import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch admin info' },
      { status: 500 }
    )
  }

  return NextResponse.json(admin)
}
