import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface DonationRequest {
  donor_name: string
  donor_email: string
  donor_phone: string
  amount: number
  currency?: string
  notes?: string
}

export async function POST(request: Request) {
  let body: DonationRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.donor_name || !body.donor_email || !body.donor_phone || !body.amount) {
    return NextResponse.json(
      { error: 'Missing required fields: donor_name, donor_email, donor_phone, amount' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.donor_email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  // Validate amount
  if (body.amount <= 0) {
    return NextResponse.json(
      { error: 'Amount must be greater than 0' },
      { status: 400 }
    )
  }

  // Generate donation ID using the database function
  const { data: donationIdResult } = await supabaseAdmin.rpc('generate_donation_id')
  const donationId = donationIdResult || `DON-${Date.now()}`

  // Create donation record
  const { data: donation, error } = await supabaseAdmin
    .from('donations')
    .insert({
      donation_id: donationId,
      donor_name: body.donor_name,
      donor_email: body.donor_email,
      donor_phone: body.donor_phone,
      amount: body.amount,
      currency: body.currency || 'INR',
      payment_method: 'wire_transfer',
      status: 'pending',
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Donation creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create donation', details: error.message },
      { status: 500 }
    )
  }

  // TODO: Send admin notification email (Phase 11)
  // await sendAdminNotification({
  //   type: 'donation',
  //   details: `New donation of ${body.currency || 'INR'} ${body.amount} from ${body.donor_name}`
  // })

  return NextResponse.json({
    donation_id: donation.donation_id,
    amount: donation.amount,
    currency: donation.currency,
    status: donation.status,
  }, { status: 201 })
}
