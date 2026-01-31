import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

interface FeaturedStudent {
  id: string
  name: string
  image: string | null
  field: string
  location: string
  dream: string
  background: string
  achievement: string | null
  annualNeed: number
  gender: string
  source: 'scholarship' | 'spotlight'
}

function deriveSpotlightAchievement(app: Record<string, unknown>): string | null {
  // Check competitive_exams JSON array first
  const exams = app.competitive_exams as Array<{ exam?: string; score?: string }> | null
  if (Array.isArray(exams) && exams.length > 0) {
    const first = exams[0]
    if (first.exam && first.score) {
      return `${first.exam}: ${first.score}`
    }
  }

  // Fallback to percentage
  const percentage = app.percentage as number | null
  if (percentage && percentage > 0) {
    return `Scored ${percentage}%`
  }

  return null
}

function deriveScholarshipAchievement(app: Record<string, unknown>): string | null {
  const sscPercentage = app.ssc_percentage as number | null
  if (sscPercentage && sscPercentage > 0) {
    return `SSC: ${sscPercentage}%`
  }

  const firstYearPercentage = app.first_year_percentage as number | null
  if (firstYearPercentage && firstYearPercentage > 0) {
    return `1st Year: ${firstYearPercentage}%`
  }

  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : null

  // Fetch featured spotlight applications
  let spotlightQuery = supabaseAdmin
    .from('spotlight_applications')
    .select('id, full_name, gender, course_stream, district, dreams_goals, background_story, annual_financial_need, competitive_exams, percentage, featured_order')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true, nullsFirst: false })

  // Fetch featured scholarship applications
  let scholarshipQuery = supabaseAdmin
    .from('applications')
    .select('id, full_name, gender, course_joined, course_studying, district, goals_dreams, spotlight_story, spotlight_annual_need, ssc_percentage, first_year_percentage, spotlight_order')
    .eq('spotlight_enabled', true)
    .order('spotlight_order', { ascending: true, nullsFirst: false })

  const [spotlightResult, scholarshipResult] = await Promise.all([
    spotlightQuery,
    scholarshipQuery,
  ])

  if (spotlightResult.error) {
    console.error('Error fetching spotlight apps:', spotlightResult.error)
  }
  if (scholarshipResult.error) {
    console.error('Error fetching scholarship apps:', scholarshipResult.error)
  }

  const spotlightApps = spotlightResult.data || []
  const scholarshipApps = scholarshipResult.data || []

  // Fetch photos for spotlight applications
  const spotlightIds = spotlightApps.map(a => a.id)
  const scholarshipIds = scholarshipApps.map(a => a.id)

  const [spotlightDocsResult, scholarshipDocsResult] = await Promise.all([
    spotlightIds.length > 0
      ? supabaseAdmin
          .from('spotlight_documents')
          .select('spotlight_application_id, storage_path')
          .in('spotlight_application_id', spotlightIds)
          .eq('document_type', 'photo')
      : Promise.resolve({ data: [], error: null }),
    scholarshipIds.length > 0
      ? supabaseAdmin
          .from('application_documents')
          .select('application_id, storage_path')
          .in('application_id', scholarshipIds)
          .eq('document_type', 'student_photo')
      : Promise.resolve({ data: [], error: null }),
  ])

  // Build photo maps: id -> storage_path
  const spotlightPhotoMap = new Map<string, string>()
  if (spotlightDocsResult.data) {
    for (const doc of spotlightDocsResult.data) {
      spotlightPhotoMap.set(doc.spotlight_application_id, doc.storage_path)
    }
  }

  const scholarshipPhotoMap = new Map<string, string>()
  if (scholarshipDocsResult.data) {
    for (const doc of scholarshipDocsResult.data) {
      scholarshipPhotoMap.set(doc.application_id, doc.storage_path)
    }
  }

  // Generate signed URLs for all photos
  const allPhotoPaths: Array<{ id: string; bucket: string; path: string }> = []

  for (const [id, path] of spotlightPhotoMap) {
    allPhotoPaths.push({ id, bucket: 'spotlight-documents', path })
  }
  for (const [id, path] of scholarshipPhotoMap) {
    allPhotoPaths.push({ id, bucket: 'application-documents', path })
  }

  const signedUrlMap = new Map<string, string>()

  // Generate signed URLs in parallel
  const signedUrlResults = await Promise.all(
    allPhotoPaths.map(async ({ id, bucket, path }) => {
      const { data } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 31536000) // 1 year expiry
      return { id, url: data?.signedUrl || null }
    })
  )

  for (const { id, url } of signedUrlResults) {
    if (url) {
      signedUrlMap.set(id, url)
    }
  }

  // Normalize spotlight applications
  const normalizedSpotlight: Array<FeaturedStudent & { order: number | null }> = spotlightApps.map(app => ({
    id: app.id,
    name: app.full_name,
    image: signedUrlMap.get(app.id) || null,
    field: app.course_stream || 'Student',
    location: app.district || '',
    dream: app.dreams_goals || '',
    background: app.background_story || '',
    achievement: deriveSpotlightAchievement(app as Record<string, unknown>),
    annualNeed: app.annual_financial_need || 0,
    gender: app.gender || 'male',
    source: 'spotlight' as const,
    order: app.featured_order,
  }))

  // Normalize scholarship applications
  const normalizedScholarship: Array<FeaturedStudent & { order: number | null }> = scholarshipApps.map(app => ({
    id: app.id,
    name: app.full_name,
    image: signedUrlMap.get(app.id) || null,
    field: app.course_studying || app.course_joined || 'Student',
    location: app.district || '',
    dream: app.goals_dreams || '',
    background: app.spotlight_story || '',
    achievement: deriveScholarshipAchievement(app as Record<string, unknown>),
    annualNeed: app.spotlight_annual_need || 0,
    gender: app.gender || 'male',
    source: 'scholarship' as const,
    order: app.spotlight_order,
  }))

  // Combine and sort by order
  let allStudents: FeaturedStudent[] = [...normalizedSpotlight, ...normalizedScholarship]
    .sort((a, b) => {
      if (a.order === null && b.order === null) return 0
      if (a.order === null) return 1
      if (b.order === null) return -1
      return a.order - b.order
    })
    .map(({ order, ...student }) => student)

  // Apply limit if provided
  if (limit && limit > 0) {
    allStudents = allStudents.slice(0, limit)
  }

  return NextResponse.json({
    students: allStudents,
    total: (spotlightApps.length + scholarshipApps.length),
  })
}
