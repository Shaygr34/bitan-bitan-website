/**
 * Email notifications for client intake form submissions.
 * Uses Resend HTTP API — no SDK dependency.
 *
 * Required env vars:
 *   RESEND_API_KEY      — Resend API key
 *   CONTACT_EMAIL_TO    — recipient address (e.g. "office@bitancpa.com")
 *   CONTACT_EMAIL_FROM  — sender address (default: "אתר ביטן את ביטן <noreply@bitancpa.co.il>")
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_TO = process.env.CONTACT_EMAIL_TO
const EMAIL_FROM = process.env.CONTACT_EMAIL_FROM ?? 'אתר ביטן את ביטן <noreply@bitancpa.co.il>'

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type IntakeNotificationData = {
  fullName: string
  clientType: string
  companyNumber: string
  phone: string
  email: string
  fileCount: number
}

/**
 * Notify office (Ron/Avi) about a new client intake submission.
 * Returns true on success, false if not configured or on failure.
 */
export async function sendIntakeNotification(data: IntakeNotificationData): Promise<boolean> {
  if (!RESEND_API_KEY || !EMAIL_TO) return false

  const rows = [
    ['שם מלא', escapeHtml(data.fullName)],
    ['סוג לקוח', escapeHtml(data.clientType)],
    ['ת"ז / ח"פ', escapeHtml(data.companyNumber)],
    ['טלפון', escapeHtml(data.phone)],
    ['דוא"ל', escapeHtml(data.email)],
    ['מסמכים שהועלו', String(data.fileCount)],
  ]

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 16px 8px 0;font-weight:600;color:#1B2A4A;white-space:nowrap">${label}:</td>
          <td style="padding:8px 0">${value}</td>
        </tr>`
    )
    .join('\n')

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:15px;color:#2D3748;direction:rtl;text-align:right;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <div style="background:#1B2A4A;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700">לקוח חדש נרשם</h1>
    </div>
    <div style="background:#F7F6F3;padding:24px;border-radius:0 0 8px 8px;border:1px solid #E2E0DB;border-top:none">
      <h2 style="color:#1B2A4A;margin:0 0 20px;font-size:16px">פרטי הלקוח</h2>
      <table style="border-collapse:collapse;font-size:15px;width:100%">
        ${tableRows}
      </table>
      <hr style="border:none;border-top:1px solid #E2E0DB;margin:24px 0">
      <p style="font-size:12px;color:#718096;margin:0">הודעה זו נשלחה אוטומטית ממערכת קליטת לקוחות — ביטן את ביטן.</p>
    </div>
  </div>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: `לקוח חדש: ${data.fullName}`,
        html,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Send a welcome email to the new client.
 * Returns true on success, false if not configured or on failure.
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:15px;color:#2D3748;direction:rtl;text-align:right;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;text-align:center">
    <div style="background:#1B2A4A;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;color:#C5A572;font-size:22px;font-weight:700">ביטן את ביטן</h1>
    </div>
    <div style="background:#F7F6F3;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #E2E0DB;border-top:none;text-align:right">
      <h2 style="color:#1B2A4A;margin:0 0 16px;font-size:20px;text-align:center">ברוכים הבאים למשפחת ביטן!</h2>
      <p style="margin:0 0 12px;line-height:1.7">שלום ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px;line-height:1.7">תודה שהצטרפת למשפחת ביטן! קיבלנו את פרטיך ואת המסמכים שהעלית.</p>
      <p style="margin:0 0 24px;line-height:1.7">ניצור איתך קשר בהקרוב לאישור ולהמשך תהליך הקליטה.</p>
      <div style="text-align:center">
        <span style="display:inline-block;background:#C5A572;color:#FFFFFF;padding:10px 28px;border-radius:6px;font-weight:600;font-size:15px">משרד ביטן את ביטן</span>
      </div>
      <hr style="border:none;border-top:1px solid #E2E0DB;margin:24px 0">
      <p style="font-size:12px;color:#718096;margin:0;text-align:center">הודעה זו נשלחה אוטומטית — אין להשיב על מייל זה.</p>
    </div>
  </div>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: 'ברוכים הבאים למשפחת ביטן!',
        html,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
