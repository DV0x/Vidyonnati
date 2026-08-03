// The six applicant-facing emails, as pure functions.
//
// No Convex imports on purpose: rendering is separable from sending, so these
// can be exercised directly without a deployment. convex/email.ts owns the
// sending and the emailLogs bookkeeping.
//
// Templates live here rather than in the emailTemplates table. That table is
// still unused, and using it would mean building an editing UI before a single
// email had ever gone out. When someone genuinely needs to reword these without
// a deploy, that is the moment to move them — not before.
//
// ---------------------------------------------------------------------------
// Design notes
// ---------------------------------------------------------------------------
//
// Read on an Android phone in the Gmail app, often on a slow connection, and
// usually by a teacher or a guardian rather than by the student. So: zero
// images, zero external fonts, zero remote requests, table layout, and every
// style inlined. Nothing here costs a round trip.
//
// The signature element is the application ID set as a TEAR-OFF STUB — dashed
// perforation, oversized monospace, its own warm panel. That is not decoration:
// the ID is the one thing a person reads down a phone line to us, and this
// audience screenshots rather than bookmarks. The stub is built to survive
// being a screenshot.
//
// Type deliberately inverts the transactional-email default. Headlines are a
// heavy system sans; body prose is Georgia, which ships on effectively every
// Android and Windows device. These are letters from a foundation to a family
// about their child's education, and a serif reads as correspondence where
// Arial reads as a system notification.
//
// Palette is derived from the site's own tokens — --primary 14 100% 56% and
// --secondary 35 96% 49% — not from a generic warm-neutral set.
//
// The status rail appears only on the four in-flight emails, where "where has
// my application got to" is a live question. On approve and reject the message
// IS the answer, so the rail is cut rather than left decorating a finished
// journey.

export type ApplicationEmailKind =
  | "application_received"
  | "under_review"
  | "needs_info"
  | "resubmission_received"
  | "approved"
  | "rejected"

export type ApplicationTypeName = "first-year" | "second-year"

export interface ApplicationEmailInput {
  kind: ApplicationEmailKind
  recipientName: string
  applicationId: string
  applicationDocId: string
  applicationType: ApplicationTypeName
  academicYear: string
  reviewerNotes?: string
  siteUrl: string
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export const REPLY_TO = "hello@vidyonnatifoundation.org"

// -- tokens -----------------------------------------------------------------

const EMBER = "#ff531f" // --primary 14 100% 56%
const AMBER = "#f59105" // --secondary 35 96% 49%
const INK = "#2a1508" // warm near-black, brown-shifted to sit with the orange
const BARK = "#7a6455" // muted warm text
const LINE = "#f0e2d4" // warm hairline
const SAND = "#fff6ee" // warm page ground — peach, not vintage cream
const PAPER = "#ffffff"

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
const SERIF = "Georgia,'Times New Roman',Times,serif"
const MONO =
  "ui-monospace,SFMono-Regular,'SF Mono','Roboto Mono',Menlo,Consolas,monospace"

// -- escaping ---------------------------------------------------------------

// Mandatory, not decorative. recipientName comes from the application's
// fullName, which is whatever the applicant typed into a text input, and
// reviewerNotes is free text an admin wrote. Both land inside HTML that gets
// mailed out; neither is trustworthy as markup.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Escape first, then convert newlines — the other order would let a typed "<"
// survive into the markup.
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />")
}

function typeLabel(type: ApplicationTypeName): string {
  return type === "first-year" ? "new scholarship" : "scholarship renewal"
}

// -- pieces -----------------------------------------------------------------

// Inbox preview text. Gmail shows this beside the subject in the list, and
// without it the client scrapes the wordmark instead, so every email would
// preview as "VIDYONNATI FOUNDATION".
function preheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(text)}</div>`
}

// Typographic wordmark. There is no logo asset worth mailing — the only mark in
// public/ is still the Next.js default — and a remote image would cost a round
// trip and be blocked by default in most clients anyway.
function masthead(): string {
  return `        <tr>
          <td style="padding:30px 32px 0;">
            <div style="font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:0.2em;color:${INK};">VIDYONNATI</div>
            <div style="font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:0.16em;color:${BARK};margin-top:3px;">FOUNDATION</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="height:3px;line-height:3px;font-size:0;border-radius:2px;background-color:${EMBER};background-image:linear-gradient(90deg,${EMBER} 0%,${AMBER} 100%);">&nbsp;</div>
          </td>
        </tr>`
}

function headline(text: string): string {
  return `        <tr>
          <td style="padding:26px 32px 0;">
            <h1 style="margin:0;font-family:${SANS};font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-0.02em;color:${INK};">${text}</h1>
          </td>
        </tr>`
}

function prose(html: string): string {
  return `        <tr>
          <td style="padding:14px 32px 0;font-family:${SERIF};font-size:16px;line-height:1.65;color:${INK};">${html}</td>
        </tr>`
}

// The signature. A perforated stub carrying the reference number, built to read
// as a keepable slip rather than a metadata footnote.
function stub(
  applicationId: string,
  applicationType: ApplicationTypeName,
  academicYear: string,
): string {
  return `        <tr>
          <td style="padding:26px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${SAND};border:1px solid ${LINE};border-radius:14px;">
              <tr>
                <td style="padding:0 20px;">
                  <div style="height:1px;line-height:1px;font-size:0;border-top:2px dashed ${LINE};">&nbsp;</div>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 20px 20px;text-align:center;">
                  <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BARK};">Application ID</div>
                  <div style="font-family:${MONO};font-size:26px;font-weight:700;letter-spacing:0.06em;color:${INK};padding:8px 0 6px;">${escapeHtml(applicationId)}</div>
                  <div style="font-family:${SANS};font-size:13px;color:${BARK};">${escapeHtml(typeLabel(applicationType) === "new scholarship" ? "New scholarship" : "Scholarship renewal")} &middot; ${escapeHtml(academicYear)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
}

// Three fixed stops, because the review genuinely is a sequence and "where has
// it got to" is the anxiety these emails exist to settle. Rendered with a text
// bullet rather than a styled box so it cannot collapse in a stripped client.
function rail(activeIndex: 0 | 1 | 2, middleLabel = "In review"): string {
  const stops = ["Received", middleLabel, "Decision"]
  const cells = stops
    .map((label, i) => {
      const done = i <= activeIndex
      const color = done ? EMBER : "#d9c9ba"
      const weight = i === activeIndex ? "700" : "500"
      const labelColor = i === activeIndex ? INK : BARK
      return `                  <td width="33%" style="text-align:center;font-family:${SANS};">
                    <div style="font-size:15px;line-height:15px;color:${color};">&#9679;</div>
                    <div style="font-size:11px;font-weight:${weight};letter-spacing:0.04em;color:${labelColor};padding-top:6px;">${escapeHtml(label)}</div>
                  </td>`
    })
    .join("\n")

  return `        <tr>
          <td style="padding:22px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${LINE};">
              <tr>
                <td style="padding-top:16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
${cells}
                  </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
}

// The label is a parameter because the same reviewer note means different
// things depending on the status it arrives with. "What we need" is a request;
// on an approval the note is a remark ("well done on your SSC marks"), and
// labelling that as a demand undercuts the whole email.
function noteBlock(notes: string, label: string): string {
  return `        <tr>
          <td style="padding:22px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#fffaf3;border-left:3px solid ${AMBER};border-radius:0 10px 10px 0;">
              <tr>
                <td style="padding:16px 18px;">
                  <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9a5b06;">${escapeHtml(label)}</div>
                  <div style="font-family:${SERIF};font-size:16px;line-height:1.6;color:${INK};padding-top:8px;">${escapeMultiline(notes)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
}

// Celebration panel — the one place the palette is allowed to be loud, and only
// because approval is the one moment that earns it.
function celebration(text: string): string {
  return `        <tr>
          <td style="padding:26px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-radius:14px;background-color:${EMBER};background-image:linear-gradient(135deg,${EMBER} 0%,${AMBER} 100%);">
              <tr>
                <td style="padding:26px 22px;text-align:center;">
                  <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ffe6d5;">Approved</div>
                  <div style="font-family:${SERIF};font-size:20px;line-height:1.45;color:#ffffff;padding-top:10px;">${text}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
}

function button(href: string, label: string): string {
  return `        <tr>
          <td style="padding:26px 32px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="border-radius:12px;background-color:${EMBER};">
                  <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:700;letter-spacing:0.01em;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 32px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${BARK};word-break:break-all;">
            Or paste this link into your browser:<br /><span style="color:#a08a78;">${escapeHtml(href)}</span>
          </td>
        </tr>`
}

function footer(): string {
  return `        <tr>
          <td style="padding:30px 32px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${LINE};">
              <tr>
                <td style="padding-top:18px;font-family:${SANS};font-size:13px;line-height:1.6;color:${BARK};">
                  <strong style="color:${INK};font-weight:700;">Reply to this email and a person will read it.</strong><br />
                  Please mention your application ID when you write or call.
                </td>
              </tr>
            </table>
          </td>
        </tr>`
}

function shell(previewText: string, rows: string): string {
  return `${preheader(previewText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${SAND};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <!-- Both the width attribute and the CSS, on purpose. Outlook's Word
           engine ignores max-width and would otherwise run the card to the
           full window width; the attribute gives it a sane 600px. Everywhere
           else style="width:100%" wins over the attribute, per spec, so the
           card stays fluid on a phone. Checked at a true 360px viewport: the
           two render identically with and without the attribute. -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;background-color:${PAPER};border:1px solid ${LINE};border-radius:18px;">
${rows}
      </table>
      <div style="font-family:${SANS};font-size:11px;letter-spacing:0.08em;color:#a08a78;padding-top:16px;">VIDYONNATI FOUNDATION</div>
    </td>
  </tr>
</table>`
}

// -- the six ----------------------------------------------------------------

export function renderApplicationEmail(
  input: ApplicationEmailInput,
): RenderedEmail {
  const {
    kind,
    recipientName,
    applicationId,
    applicationDocId,
    applicationType,
    academicYear,
    reviewerNotes,
    siteUrl,
  } = input

  const name = recipientName.trim() || "there"
  const safeName = escapeHtml(name)
  const detailUrl = `${siteUrl}/dashboard/applications/${applicationDocId}`
  const editUrl = `${siteUrl}/apply?edit=${applicationDocId}&type=${applicationType}`
  const notes = reviewerNotes?.trim()
  const theStub = stub(applicationId, applicationType, academicYear)
  const kindLabel =
    applicationType === "first-year" ? "new scholarship" : "scholarship renewal"

  const textFooter = `\n\nReply to this email and a person will read it. Please mention your application ID when you write or call.\n\nVIDYONNATI FOUNDATION`

  switch (kind) {
    case "application_received":
      return {
        subject: `Application received — ${applicationId}`,
        html: shell(
          `We have your ${kindLabel} application. Here is your ID and what happens next.`,
          masthead() +
            headline("We have your application") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0;">Thank you for applying. Your ${escapeHtml(kindLabel)} application for ${escapeHtml(academicYear)} reached us safely, and it is now in the queue to be read.</p>`,
            ) +
            theStub +
            prose(
              `<p style="margin:0;">Keep this number somewhere safe — a screenshot is fine. It is how we find your application when you write or call.</p>`,
            ) +
            rail(0) +
            prose(
              `<p style="margin:0;">Every application is read by hand by our team. We will write again within <strong>7 to 10 working days</strong>, either with a decision or to ask for anything that is missing. There is nothing you need to do until then.</p>`,
            ) +
            button(detailUrl, "View your application") +
            footer(),
        ),
        text: `Dear ${name},

Thank you for applying. Your ${kindLabel} application for ${academicYear} reached us safely, and it is now in the queue to be read.

  APPLICATION ID: ${applicationId}
  ${kindLabel === "new scholarship" ? "New scholarship" : "Scholarship renewal"} - ${academicYear}

Keep this number somewhere safe. It is how we find your application when you write or call.

Every application is read by hand by our team. We will write again within 7 to 10 working days, either with a decision or to ask for anything that is missing. There is nothing you need to do until then.

View your application: ${detailUrl}${textFooter}`,
      }

    case "under_review":
      return {
        subject: `Your application is being reviewed — ${applicationId}`,
        html: shell(
          `A reviewer has picked up your application. Nothing is needed from you.`,
          masthead() +
            headline("A reviewer has your application") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0;">Your application has moved out of the queue and someone on our team is reading it now.</p>`,
            ) +
            theStub +
            rail(1) +
            prose(
              `<p style="margin:0;">Nothing is needed from you at this stage. We will write again when there is a decision, or sooner if something is missing.</p>`,
            ) +
            button(detailUrl, "View your application") +
            footer(),
        ),
        text: `Dear ${name},

Your application has moved out of the queue and someone on our team is reading it now.

  APPLICATION ID: ${applicationId}

Nothing is needed from you at this stage. We will write again when there is a decision, or sooner if something is missing.

View your application: ${detailUrl}${textFooter}`,
      }

    case "needs_info":
      return {
        subject: `We need one more thing — ${applicationId}`,
        html: shell(
          `Your application is paused until you send us a little more information.`,
          masthead() +
            headline("We need one more thing from you") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0;">We have read your application, and it is nearly there. Before we can carry on, we need a little more information from you.</p>`,
            ) +
            (notes ? noteBlock(notes, "What we need") : "") +
            theStub +
            rail(1, "Needs you") +
            prose(
              `<p style="margin:0 0 14px;">Open your application with the button below, change what we have asked about, and send it back to us.</p>` +
                `<p style="margin:0;"><strong>Your documents are safe — do not upload them again.</strong> Everything you already sent us is still there. Only the part we have asked about needs changing.</p>`,
            ) +
            button(editUrl, "Update your application") +
            footer(),
        ),
        text: `Dear ${name},

We have read your application, and it is nearly there. Before we can carry on, we need a little more information from you.
${notes ? `\nWHAT WE NEED:\n${notes}\n` : ""}
  APPLICATION ID: ${applicationId}

Open your application with the link below, change what we have asked about, and send it back to us.

Your documents are safe - do NOT upload them again. Everything you already sent us is still there. Only the part we have asked about needs changing.

Update your application: ${editUrl}${textFooter}`,
      }

    case "resubmission_received":
      return {
        subject: `Got your update — ${applicationId}`,
        html: shell(
          `Your updated application is back with our review team.`,
          masthead() +
            headline("Got it, thank you") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0;">Your updated application has reached us and is back with the review team.</p>`,
            ) +
            theStub +
            rail(1) +
            prose(
              `<p style="margin:0;">There is nothing further for you to do. We will write again once it has been read.</p>`,
            ) +
            button(detailUrl, "View your application") +
            footer(),
        ),
        text: `Dear ${name},

Your updated application has reached us and is back with the review team.

  APPLICATION ID: ${applicationId}

There is nothing further for you to do. We will write again once it has been read.

View your application: ${detailUrl}${textFooter}`,
      }

    case "approved":
      return {
        subject: `Your scholarship is approved — ${applicationId}`,
        html: shell(
          `Congratulations. Your ${kindLabel} application for ${academicYear} has been approved.`,
          masthead() +
            headline("Congratulations") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0;">We are very glad to write to you with good news.</p>`,
            ) +
            celebration(
              `Your ${escapeHtml(kindLabel)} application for ${escapeHtml(academicYear)} has been approved.`,
            ) +
            (notes ? noteBlock(notes, "A note from our team") : "") +
            theStub +
            prose(
              `<p style="margin:0;">Someone from our team will contact you shortly about what happens next. Please keep your application ID until then — it is how we will identify you.</p>`,
            ) +
            button(detailUrl, "View your application") +
            footer(),
        ),
        text: `Dear ${name},

We are very glad to write to you with good news.

  *** APPROVED ***
  Your ${kindLabel} application for ${academicYear} has been approved.
${notes ? `\nA note from our team:\n${notes}\n` : ""}
  APPLICATION ID: ${applicationId}

Someone from our team will contact you shortly about what happens next. Please keep your application ID until then - it is how we will identify you.

View your application: ${detailUrl}${textFooter}`,
      }

    case "rejected":
      return {
        subject: `About your application — ${applicationId}`,
        html: shell(
          `A decision on your ${kindLabel} application for ${academicYear}.`,
          masthead() +
            headline("About your application") +
            prose(
              `<p style="margin:0 0 14px;">Dear ${safeName},</p>` +
                `<p style="margin:0 0 14px;">Thank you for applying to the Vidyonnati Foundation, and for the care you put into your application.</p>` +
                `<p style="margin:0;">After reading it carefully, we are sorry to tell you that we are not able to offer you a scholarship for ${escapeHtml(academicYear)}. We receive many more applications than we are able to support, and a decision not to fund one is not a judgement on the student behind it.</p>`,
            ) +
            (notes ? noteBlock(notes, "A note from our team") : "") +
            theStub +
            prose(
              `<p style="margin:0;">If you would like to talk to someone about this, please reply to this email. We would be glad to hear from you.</p>`,
            ) +
            footer(),
        ),
        text: `Dear ${name},

Thank you for applying to the Vidyonnati Foundation, and for the care you put into your application.

After reading it carefully, we are sorry to tell you that we are not able to offer you a scholarship for ${academicYear}. We receive many more applications than we are able to support, and a decision not to fund one is not a judgement on the student behind it.
${notes ? `\nA note from our team:\n${notes}\n` : ""}
  APPLICATION ID: ${applicationId}

If you would like to talk to someone about this, please reply to this email. We would be glad to hear from you.${textFooter}`,
      }
  }
}
