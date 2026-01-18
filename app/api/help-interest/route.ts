import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { HelpType } from '@/types/database'

interface HelpInterestRequest {
  name: string
  email: string
  phone: string
  help_type: HelpType
  message?: string
  student_id?: string
  student_name?: string
}

const VALID_HELP_TYPES: HelpType[] = ['donate', 'volunteer', 'corporate', 'other']

export async function POST(request: Request) {
  let body: HelpInterestRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.name || !body.email || !body.phone || !body.help_type) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, phone, help_type' },
      { status: 400 }
    )
  }

  // Validate help type
  if (!VALID_HELP_TYPES.includes(body.help_type)) {
    return NextResponse.json(
      { error: `Invalid help_type. Must be one of: ${VALID_HELP_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  // Create help interest record
  const { data: helpInterest, error } = await supabaseAdmin
    .from('help_interests')
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      help_type: body.help_type,
      message: body.message || null,
      student_id: body.student_id || null,
      student_name: body.student_name || null,
      status: 'new',
    })
    .select()
    .single()

  if (error) {
    console.error('Help interest creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit help interest' },
      { status: 500 }
    )
  }

  // TODO: Send admin notification email (Phase 11)
  // await sendAdminNotification({
  //   type: 'help_interest',
  //   details: `New ${body.help_type} interest from ${body.name}${body.student_name ? ` for student ${body.student_name}` : ''}`
  // })

  return NextResponse.json({
    id: helpInterest.id,
    message: 'Thank you for your interest! We will contact you soon.',
  }, { status: 201 })
}
