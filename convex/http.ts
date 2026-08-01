import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

// Private document serving — Phase 4.
//
// This is the alternative to ctx.storage.getUrl(), and the reason for it is in
// the header of documents.ts: a getUrl() string is a permanent, unrevocable
// capability over an Aadhaar card or a bank passbook. Here every single request
// re-checks who is asking, so nothing shareable is ever produced. The client
// fetches with an Authorization header and turns the response into a blob URL;
// no document URL is ever placed in the DOM, in history, or in a Referer.
//
// Served from the deployment's .convex.site origin — a DIFFERENT origin from
// the Next app, which is why CORS is handled below rather than ignored.

// Browsers preflight any cross-origin request carrying an Authorization header,
// so the OPTIONS route below is mandatory, not decorative. Without it the GET
// never leaves the browser.
//
// localhost is the default so a fresh dev deployment works with no config. Any
// other origin has to be named explicitly:
//
//   npx convex env set ALLOWED_WEB_ORIGINS "https://vidyonnatifoundation.org"
//
// This is per-deployment, so production needs its own — the same per-instance
// trap CLAUDE.md records for Clerk. An unlisted origin gets no CORS headers and
// the browser blocks it: this fails closed.
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000"]

function allowedOrigins(): string[] {
  const configured = process.env.ALLOWED_WEB_ORIGINS
  if (!configured) return DEFAULT_ALLOWED_ORIGINS
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin")
  if (!origin || !allowedOrigins().includes(origin)) return {}
  // Vary matters: the response genuinely differs per origin, and without it a
  // cache could hand one origin's headers to another.
  return { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
}

function errorResponse(
  status: number,
  message: string,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

// RFC 5987. Filenames here are routinely non-ASCII, and a raw non-ASCII byte in
// a header is not transmissible — so send a sanitized ASCII fallback plus the
// encoded real name, which is what every current browser reads.
function contentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_")
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

const serveDocument = httpAction(async (ctx, request) => {
  const cors = corsHeaders(request)

  // 401 before anything else, so an anonymous caller learns nothing about which
  // ids exist. Everything after this collapses to 404 for the same reason.
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return errorResponse(401, "Not authenticated", cors)

  const url = new URL(request.url)
  const kind = url.searchParams.get("kind")
  const documentId = url.searchParams.get("id")
  if ((kind !== "application" && kind !== "spotlight") || !documentId) {
    return errorResponse(400, "Bad request", cors)
  }

  // The authorization lives in a query because HTTP actions have no ctx.db.
  // It re-derives identity from its own ctx.auth rather than taking anything
  // from here as an argument — identity is never a function parameter.
  const doc = await ctx.runQuery(internal.documents.authorizeDownload, {
    kind,
    documentId,
  })
  if (!doc) return errorResponse(404, "Not found", cors)

  const blob = await ctx.storage.get(doc.storageId)
  // Reachable if the sweeper collected the object but the row survived. Same
  // 404 as not-yours; there is nothing useful to say beyond it being gone.
  if (!blob) return errorResponse(404, "Not found", cors)

  return new Response(blob, {
    status: 200,
    headers: {
      ...cors,
      // The authoritative type recorded at upload from _storage, never a
      // client-supplied one.
      "Content-Type": doc.mimeType,
      // The app never sees this — it names the file itself off the blob — but
      // it stops a direct hit on this URL rendering user-uploaded content
      // inline on the convex.site origin.
      "Content-Disposition": contentDisposition(doc.fileName),
      "X-Content-Type-Options": "nosniff",
      // An authorized document must never land in a shared cache.
      "Cache-Control": "private, no-store",
    },
  })
})

const preflight = httpAction(async (_ctx, request) => {
  const cors = corsHeaders(request)
  if (!cors["Access-Control-Allow-Origin"]) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...cors,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
})

const http = httpRouter()

http.route({ path: "/documents", method: "GET", handler: serveDocument })
http.route({ path: "/documents", method: "OPTIONS", handler: preflight })

export default http
