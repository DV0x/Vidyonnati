"use client"

import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"

// Client access to private documents — Aadhaar cards, bank passbooks,
// marksheets.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS IS NOT JUST AN <a href>.
//
// The Phase 4 decision (see the header of convex/documents.ts) was that private
// documents are never handed out as ctx.storage.getUrl() strings, because such a
// URL never expires and cannot be withdrawn. Instead an authorized HTTP action
// re-checks the caller on every request.
//
// Authorization travels in a header, and neither <a href> nor <img src> can set
// one. So the bytes are fetched here, turned into a blob URL, used, and revoked.
// A blob: URL is scoped to this document and dies with the tab, so nothing
// shareable ever exists — no entry in history, no Referer, nothing to forward.
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentKind = "application" | "spotlight"

// HTTP actions are served from the deployment's .convex.site origin, which is a
// DIFFERENT host from the .convex.cloud URL the reactive client uses — hence the
// separate env var, and hence the CORS handling in convex/http.ts.
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL

const SESSION_EXPIRED = "Your session has expired. Sign in again to view this document."
const UNAVAILABLE = "This document is no longer available."
const GENERIC = "Could not load the document. Please try again."

async function fetchDocumentBlob(
  token: string | null,
  kind: DocumentKind,
  documentId: string,
): Promise<Blob> {
  if (!CONVEX_SITE_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_SITE_URL is not configured")
  }
  if (!token) throw new Error(SESSION_EXPIRED)

  const url = `${CONVEX_SITE_URL}/documents?kind=${kind}&id=${encodeURIComponent(documentId)}`
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

  if (!response.ok) {
    // 404 deliberately covers both "no such document" and "not yours" — the
    // route refuses to distinguish them, so neither can this message.
    if (response.status === 401) throw new Error(SESSION_EXPIRED)
    if (response.status === 404) throw new Error(UNAVAILABLE)
    throw new Error(GENERIC)
  }

  return await response.blob()
}

function messageFor(error: unknown): string {
  return error instanceof Error && error.message ? error.message : GENERIC
}

/**
 * Downloads a private document to the user's machine.
 *
 * `pendingId` is the document currently in flight, so a list of documents can
 * show a spinner on the one row that was clicked rather than on all of them.
 *
 * `download` RESOLVES to an error message, or null on success — it does not
 * throw and does not keep the error in state. That lets a caller toast the
 * failure straight from its click handler, instead of needing an effect to
 * watch an error field, which is the pattern this codebase spent Phase 2b
 * removing.
 */
export function useDocumentDownload() {
  const { getToken } = useAuth()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const download = useCallback(
    async (
      kind: DocumentKind,
      documentId: string,
      fileName: string,
    ): Promise<string | null> => {
      setPendingId(documentId)

      let objectUrl: string | null = null
      let failure: string | null = null
      try {
        // No template argument. See lib/convexToken.ts and CLAUDE.md — passing
        // one forces Clerk's legacy path and drops the email/name claims.
        const blob = await fetchDocumentBlob(await getToken(), kind, documentId)

        objectUrl = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = objectUrl
        anchor.download = fileName
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
      } catch (caught) {
        failure = messageFor(caught)
      } finally {
        if (objectUrl) {
          // Revoking in the same tick can cancel the download in Firefox and
          // Safari, which read the blob asynchronously after click(). A second
          // is far longer than either needs and still frees the bytes promptly.
          const toRevoke = objectUrl
          setTimeout(() => URL.revokeObjectURL(toRevoke), 1000)
        }
        setPendingId(null)
      }

      return failure
    },
    [getToken],
  )

  return { download, pendingId }
}

/**
 * Resolves a private document to a blob URL for inline rendering — the student
 * photo on the review screens.
 *
 * Only for images. Pass `null` to render nothing and skip the fetch entirely.
 * The URL is revoked on unmount and whenever the document changes, so a
 * reviewer paging through applications does not accumulate blobs.
 */
export function useDocumentObjectUrl(kind: DocumentKind, documentId: string | null) {
  const { getToken } = useAuth()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!documentId) return

    let cancelled = false
    let created: string | null = null

    void (async () => {
      try {
        const blob = await fetchDocumentBlob(await getToken(), kind, documentId)
        if (cancelled) return
        created = URL.createObjectURL(blob)
        setUrl(created)
      } catch (caught) {
        if (!cancelled) setError(messageFor(caught))
      }
    })()

    return () => {
      cancelled = true
      setUrl(null)
      setError(null)
      if (created) URL.revokeObjectURL(created)
    }
  }, [getToken, kind, documentId])

  return { url, error }
}
