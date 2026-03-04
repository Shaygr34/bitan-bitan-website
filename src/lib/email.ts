/**
 * Email notification for contact form submissions.
 * Uses Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * No SDK dependency — uses native fetch.
 *
 * Required env vars:
 *   RESEND_API_KEY     — Resend API key
 *   CONTACT_EMAIL_TO   — recipient address (e.g. "office@bitancpa.com")
 *   CONTACT_EMAIL_FROM — sender address (default: "אתר ביטן את ביטן <noreply@bitancpa.co.il>")
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_TO = process.env.CONTACT_EMAIL_TO
const EMAIL_FROM = process.env.CONTACT_EMAIL_FROM ?? 'אתר ביטן את ביטן <noreply@bitancpa.co.il>'

type ContactLead = {
  name: string
  phone: string
  email?: string
  message?: string
}

/** Returns true if email sending is configured */
export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY && EMAIL_TO)
}

/**
 * Send a lead notification email via Resend.
 * Silently returns false if not configured — caller should still save to Sanity.
 */
export async function sendLeadNotification(lead: ContactLead): Promise<boolean> {
  if (!RESEND_API_KEY || !EMAIL_TO) return false

  const lines = [
    `<h2 style="color:#1B2A4A;margin:0 0 16px">פנייה חדשה מהאתר</h2>`,
    `<table style="border-collapse:collapse;font-size:15px;direction:rtl;text-align:right">`,
    `<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#1B2A4A">שם:</td><td style="padding:6px 0">${escapeHtml(lead.name)}</td></tr>`,
    `<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#1B2A4A">טלפון:</td><td style="padding:6px 0" dir="ltr">${escapeHtml(lead.phone)}</td></tr>`,
  ]

  if (lead.email) {
    lines.push(`<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#1B2A4A">דוא"ל:</td><td style="padding:6px 0" dir="ltr">${escapeHtml(lead.email)}</td></tr>`)
  }

  if (lead.message) {
    lines.push(`<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#1B2A4A;vertical-align:top">הודעה:</td><td style="padding:6px 0">${escapeHtml(lead.message).replace(/\n/g, '<br>')}</td></tr>`)
  }

  lines.push(`</table>`)
  lines.push(`<hr style="border:none;border-top:1px solid #E2E0DB;margin:24px 0">`)
  lines.push(`<p style="font-size:12px;color:#718096">הודעה זו נשלחה אוטומטית מטופס יצירת הקשר באתר.</p>`)

  const html = lines.join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: `פנייה חדשה מ${lead.name}`,
        html,
      }),
    })

    return res.ok
  } catch {
    return false
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
