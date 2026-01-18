import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SpotlightDocumentType } from '@/types/database'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const VALID_DOCUMENT_TYPES: SpotlightDocumentType[] = [
  'photo',
  'marksheet',
  'aadhar',
  'income_certificate',
  'other',
]

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const applicationId = formData.get('applicationId') as string | null
  const documentType = formData.get('documentType') as SpotlightDocumentType | null

  if (!file || !applicationId || !documentType) {
    return NextResponse.json(
      { error: 'Missing required fields: file, applicationId, documentType' },
      { status: 400 }
    )
  }

  // Validate document type
  if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
    return NextResponse.json(
      { error: `Invalid document type: ${documentType}` },
      { status: 400 }
    )
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size exceeds 10MB limit' },
      { status: 400 }
    )
  }

  // Verify application belongs to user
  const { data: application, error: appError } = await supabase
    .from('spotlight_applications')
    .select('id')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  if (appError || !application) {
    return NextResponse.json(
      { error: 'Application not found or access denied' },
      { status: 404 }
    )
  }

  // Generate storage path: {applicationId}/{documentType}_{timestamp}.{ext}
  const fileExt = file.name.split('.').pop() || 'bin'
  const timestamp = Date.now()
  const storagePath = `${applicationId}/${documentType}_${timestamp}.${fileExt}`

  // Upload file to storage
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('spotlight-documents')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }

  // Check if document of this type already exists for this application
  const { data: existingDoc } = await supabase
    .from('spotlight_documents')
    .select('id, storage_path')
    .eq('spotlight_application_id', applicationId)
    .eq('document_type', documentType)
    .single()

  if (existingDoc) {
    // Delete old file from storage
    await supabase.storage
      .from('spotlight-documents')
      .remove([existingDoc.storage_path])

    // Update existing record
    const { data: document, error: updateError } = await supabase
      .from('spotlight_documents')
      .update({
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
      })
      .eq('id', existingDoc.id)
      .select()
      .single()

    if (updateError) {
      console.error('Document update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document record' },
        { status: 500 }
      )
    }

    // If this is a photo, update the photo_url on the application
    if (documentType === 'photo') {
      const { data: signedUrlData } = await supabase.storage
        .from('spotlight-documents')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year for display

      if (signedUrlData?.signedUrl) {
        await supabase
          .from('spotlight_applications')
          .update({ photo_url: signedUrlData.signedUrl })
          .eq('id', applicationId)
      }
    }

    return NextResponse.json(document)
  }

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('spotlight_documents')
    .insert({
      spotlight_application_id: applicationId,
      document_type: documentType,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single()

  if (docError) {
    console.error('Document creation error:', docError)
    // Try to clean up uploaded file
    await supabase.storage
      .from('spotlight-documents')
      .remove([storagePath])

    return NextResponse.json(
      { error: 'Failed to create document record' },
      { status: 500 }
    )
  }

  // If this is a photo, update the photo_url on the application
  if (documentType === 'photo') {
    const { data: signedUrlData } = await supabase.storage
      .from('spotlight-documents')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year for display

    if (signedUrlData?.signedUrl) {
      await supabase
        .from('spotlight_applications')
        .update({ photo_url: signedUrlData.signedUrl })
        .eq('id', applicationId)
    }
  }

  return NextResponse.json(document, { status: 201 })
}

// GET endpoint to retrieve signed URLs for documents
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')
  const documentType = searchParams.get('documentType')

  if (!applicationId) {
    return NextResponse.json(
      { error: 'Missing applicationId parameter' },
      { status: 400 }
    )
  }

  // Verify application belongs to user (or user is admin)
  const { data: application } = await supabase
    .from('spotlight_applications')
    .select('id')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  if (!application) {
    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      )
    }
  }

  // Build query
  let query = supabase
    .from('spotlight_documents')
    .select('*')
    .eq('spotlight_application_id', applicationId)

  if (documentType) {
    query = query.eq('document_type', documentType)
  }

  const { data: documents, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }

  // Generate signed URLs for each document
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from('spotlight-documents')
        .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

      return {
        ...doc,
        signedUrl: data?.signedUrl || null,
      }
    })
  )

  return NextResponse.json(documentsWithUrls)
}
