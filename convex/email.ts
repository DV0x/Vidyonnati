import { v } from "convex/values"
import { internalAction, internalMutation } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import {
  renderApplicationEmail,
  REPLY_TO,
  type ApplicationEmailKind,
} from "./lib/emailTemplates"

// Applicant email delivery.
//
// Everything here is internal. No client can send mail: the only callers are
// applications.create, applications.update and admin.updateApplication, each of
// which schedules a send from inside its own transaction. That matters — a
// scheduled function only runs if the scheduling transaction commits, so a
// write that rolls back cannot produce an "approved" email for an approval that
// never happened. It also means a Resend outage can never fail the status
// change itself, because the send happens after the commit, in an action.
//
// Actions, not mutations, because sending is a side effect on the outside world
// and mutations must stay deterministic and retryable.
//
// Plain fetch rather than the `resend` npm package: the REST surface used here
// is a single endpoint, and fetch works in Convex's default runtime, so this
// file needs no "use node" directive and can therefore hold its mutations
// alongside the action. (`resend` is still listed in package.json from an
// earlier phase and is now unused.)

const RESEND_ENDPOINT = "https://api.resend.com/emails"

// Resend will only deliver from a domain you have verified with it, via DNS.
// Until vidyonnatifoundation.org is verified, onboarding@resend.dev is the only
// usable sender AND it can only deliver to the Resend account owner's own
// address — fine for a first test, useless for real applicants. Once the domain
// verifies, set this on BOTH deployments:
//
//   npx convex env set RESEND_FROM "Vidyonnati Foundation <hello@vidyonnatifoundation.org>"
//   npx convex env set --prod RESEND_FROM "Vidyonnati Foundation <hello@vidyonnatifoundation.org>"
//
// Convex env vars are per-deployment. Setting only one leaves the other sending
// from resend.dev, or not sending at all — the same per-instance trap CLAUDE.md
// records for Clerk and for ALLOWED_WEB_ORIGINS.
const DEFAULT_FROM = "Vidyonnati Foundation <onboarding@resend.dev>"

// Used to build the links in every email. Defaults to production because a
// wrong-but-absolute link is recoverable by the reader, whereas a localhost
// link mailed to an applicant is not.
//
//   npx convex env set SITE_URL "http://localhost:3000"
const DEFAULT_SITE_URL = "https://vidyonnatifoundation.org"

export const applicationEmailKind = v.union(
  v.literal("application_received"),
  v.literal("under_review"),
  v.literal("needs_info"),
  v.literal("resubmission_received"),
  v.literal("approved"),
  v.literal("rejected"),
)

const applicationTypeValidator = v.union(
  v.literal("first-year"),
  v.literal("second-year"),
)

// -- emailLogs bookkeeping --------------------------------------------------
//
// Two phases rather than one write at the end, because the schema already
// models pending/sent/failed and because a row written before the request goes
// out is the only thing that survives the action dying mid-flight. A log that
// is only written on completion cannot record the sends that never completed.

export const recordAttempt = internalMutation({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    templateName: v.string(),
    relatedEntityType: v.string(),
    relatedEntityId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLogs", {
      ...args,
      status: "pending",
    })
  },
})

export const recordResult = internalMutation({
  args: {
    id: v.id("emailLogs"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    resendId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args
    await ctx.db.patch("emailLogs", id, {
      ...patch,
      ...(args.status === "sent" ? { sentAt: Date.now() } : {}),
    })
    return null
  },
})

// -- the send ---------------------------------------------------------------

export const sendApplicationEmail = internalAction({
  args: {
    kind: applicationEmailKind,
    to: v.string(),
    recipientName: v.string(),
    applicationId: v.string(),
    applicationDocId: v.id("applications"),
    applicationType: applicationTypeValidator,
    academicYear: v.string(),
    reviewerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL

    const { subject, html, text } = renderApplicationEmail({
      kind: args.kind as ApplicationEmailKind,
      recipientName: args.recipientName,
      applicationId: args.applicationId,
      applicationDocId: args.applicationDocId,
      applicationType: args.applicationType,
      academicYear: args.academicYear,
      reviewerNotes: args.reviewerNotes,
      siteUrl: siteUrl.replace(/\/+$/, ""),
    })

    // The plain-text body is what gets logged: it is the same words, it stays
    // readable in the data browser, and it keeps the row small.
    const logId: Id<"emailLogs"> = await ctx.runMutation(
      internal.email.recordAttempt,
      {
        recipientEmail: args.to,
        recipientName: args.recipientName,
        subject,
        body: text,
        templateName: args.kind,
        relatedEntityType: "application",
        relatedEntityId: args.applicationDocId,
      },
    )

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Deliberately not a throw. Until the key is set every submission would
      // otherwise raise an error, burying real failures in noise. The failed
      // row is the honest, visible record — silence is what we are fixing.
      await ctx.runMutation(internal.email.recordResult, {
        id: logId,
        status: "failed",
        errorMessage:
          "RESEND_API_KEY is not set on this deployment. Run: npx convex env set RESEND_API_KEY <key>",
      })
      return null
    }

    let response: Response
    try {
      response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? DEFAULT_FROM,
          to: [args.to],
          subject,
          html,
          text,
          // snake_case: this is Resend's REST field name. The npm SDK spells
          // the same thing replyTo, which is why it is easy to get wrong here.
          reply_to: REPLY_TO,
        }),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await ctx.runMutation(internal.email.recordResult, {
        id: logId,
        status: "failed",
        errorMessage: `Network error contacting Resend: ${message}`,
      })
      throw error
    }

    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      // Resend returns { name, message, statusCode } on error. Fall back to the
      // status line when the body is not what we expect.
      const message =
        (payload as { message?: string } | null)?.message ??
        `Resend returned ${response.status}`
      await ctx.runMutation(internal.email.recordResult, {
        id: logId,
        status: "failed",
        errorMessage: message,
      })
      // Thrown so it also surfaces in `npx convex logs`, which CLAUDE.md notes
      // is the only place delivery failures actually become visible. The log
      // row above is the durable record; this is the alert.
      throw new Error(`Failed to send ${args.kind} email: ${message}`)
    }

    await ctx.runMutation(internal.email.recordResult, {
      id: logId,
      status: "sent",
      resendId: (payload as { id?: string } | null)?.id,
    })

    return null
  },
})
