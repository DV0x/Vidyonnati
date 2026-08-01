"use client"

import Image from "next/image"
import { CheckCircle2, Download, ImageOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  useDocumentDownload,
  useDocumentObjectUrl,
  type DocumentKind,
} from "@/hooks/use-document-download"

// A document already on the server, in the shape the wizard steps were written
// against. The snake_case is a leftover of the Supabase row it used to be; both
// wizards map their Convex documents onto it.
export type ExistingDocument = {
  document_type: string
  file_name: string
  // The document ROW id — what the authorized download route takes. Added in
  // Phase 4; before that the badge had nothing to link to.
  id: string
}

// For the photo fields, where a filename is the least useful thing to show.
// Renders the image itself, fetched through the same authorized route as
// everything else — the bytes arrive as a blob, so no URL exists for anyone to
// keep. Use ExistingDocBadge for anything that is not an image; a PDF has no
// thumbnail worth rendering.
export function ExistingPhotoPreview({
  doc,
  kind,
}: {
  doc?: ExistingDocument
  kind: DocumentKind
}) {
  const { url, error } = useDocumentObjectUrl(kind, doc?.id ?? null)
  const { download, pendingId } = useDocumentDownload()

  if (!doc) return null

  const isPending = pendingId === doc.id

  return (
    <div className="mt-1.5 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-2">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-green-200 bg-white">
        {url ? (
          // unoptimized because a blob: URL cannot be proxied by the image
          // optimizer — and needs no proxying, the bytes are already here.
          <Image
            src={url}
            alt={`Current photo: ${doc.file_name}`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {error ? (
              <ImageOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-green-800">Current photo</p>
        <p className="truncate text-xs text-green-700">{doc.file_name}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        type="button"
        disabled={isPending}
        aria-label={`Download ${doc.file_name}`}
        onClick={async () => {
          const failure = await download(kind, doc.id, doc.file_name)
          if (failure) toast.error(failure)
        }}
        className="shrink-0 rounded p-1.5 text-green-600 transition-colors hover:bg-green-100 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

// Shared by both wizards' Documents step, for files that are not images.
export function ExistingDocBadge({
  doc,
  kind,
}: {
  doc?: ExistingDocument
  kind: DocumentKind
}) {
  const { download, pendingId } = useDocumentDownload()

  if (!doc) return null

  const isPending = pendingId === doc.id

  return (
    <button
      // type="button" matters: this sits inside the react-hook-form form, and
      // the default submit type would advance the wizard on every click.
      type="button"
      disabled={isPending}
      onClick={async () => {
        const failure = await download(kind, doc.id, doc.file_name)
        if (failure) toast.error(failure)
      }}
      className="flex w-full items-center gap-1.5 mt-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md text-left transition-colors hover:bg-green-100 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
      )}
      <span className="text-xs text-green-700 truncate">
        Uploaded: {doc.file_name}
      </span>
      <Download className="w-3.5 h-3.5 text-green-600 flex-shrink-0 ml-auto" />
    </button>
  )
}
