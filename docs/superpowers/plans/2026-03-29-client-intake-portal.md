# Client Intake Portal — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-service client intake form that replaces manual WhatsApp-based onboarding — client fills a branded form, Summit CRM card is auto-populated, office is notified.

**Architecture:** Two repos — Bitan Website hosts the client-facing intake form at `/intake/[token]` with a submission API route that creates Summit CRM entities and uploads files to Sanity CDN. Bitan OS hosts the secretary-facing "Generate Link" page that creates one-time-use tokens in Sanity. Token lifecycle: pending → completed (on submission) or expired.

**Tech Stack:** Next.js 15 (website) + Next.js 14 (OS) + Sanity v3 (token storage + file CDN) + Summit CRM API (entity creation) + Resend (email notifications) + Tailwind 3 (website styling)

---

## Key Reference Data

### Summit סוג לקוח Entity IDs
| Client Type | Entity ID | Show on Form |
|-------------|-----------|--------------|
| עצמאי (חודשי) | 1099570216 | Yes |
| עצמאי שנתי | 1099570129 | Yes |
| חברה (חודשי) | 1099570010 | Yes |
| חברה שנתי | 1099569991 | Yes |
| פטור | 1099570246 | Yes |
| שותפות | 1099570170 | Yes |
| עמותה | 1099570107 | Yes |
| עסק זעיר | 1099570213 | Yes |
| החזר מס | 1179325026 | Yes |

### Summit Client Folder
- Folder ID: `557688522` (לקוחות)

### Summit API
- Base URL: `https://api.sumit.co.il`
- All POST, credentials in body: `{ Credentials: { CompanyID: 557813963, APIKey: env } }`
- Create entity: `POST /crm/data/createentity/`
- Add remark: `POST /accounting/customers/createremark/`
- No file upload API — files go to Sanity CDN, links stored in Summit remarks

### Sanity Project
- Project: `ul4uwnp7`, dataset: `production`
- Write token env var: `SANITY_API_WRITE_TOKEN` (Railway) / `SANITY_API_TOKEN` (local)

---

## Chunk 1: Bitan Website — Intake Form + API

### File Structure

```
src/sanity/schemas/intakeToken.ts          — NEW: Sanity schema for one-time tokens
src/sanity/schemas/index.ts                — MODIFY: add intakeToken to schema array
src/app/(site)/intake/[token]/page.tsx     — NEW: SSR page — validates token, renders form
src/app/(site)/intake/[token]/IntakeForm.tsx — NEW: "use client" multi-step wizard
src/app/(site)/intake/[token]/intake.module.css — NEW: form styles
src/app/api/intake/route.ts               — NEW: POST handler — Summit + Sanity + email
src/lib/intake-types.ts                   — NEW: types, client type config, field mappings
src/lib/intake-email.ts                   — NEW: email templates (office notification + welcome)
```

---

### Task 1: Sanity intakeToken Schema

**Files:**
- Create: `src/sanity/schemas/intakeToken.ts`
- Modify: `src/sanity/schemas/index.ts`

- [ ] **Step 1: Create the intakeToken schema**

```typescript
// src/sanity/schemas/intakeToken.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'intakeToken',
  title: 'טוקן קליטה',
  type: 'document',
  fields: [
    defineField({
      name: 'token',
      title: 'Token',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: {
        list: [
          { title: 'ממתין', value: 'pending' },
          { title: 'הושלם', value: 'completed' },
          { title: 'פג תוקף', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdBy',
      title: 'נוצר על ידי',
      type: 'string',
    }),
    defineField({
      name: 'clientName',
      title: 'שם לקוח (רמז)',
      type: 'string',
      description: 'שם הלקוח למעקב — לא מוצג בטופס',
    }),
    defineField({
      name: 'completedAt',
      title: 'תאריך השלמה',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'summitEntityId',
      title: 'Summit Entity ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'submittedData',
      title: 'נתונים שהוגשו',
      type: 'text',
      readOnly: true,
      description: 'JSON של הנתונים שהלקוח מילא',
    }),
  ],
  preview: {
    select: { title: 'clientName', status: 'status', date: '_createdAt' },
    prepare({ title, status, date }) {
      const statusMap: Record<string, string> = { pending: 'ממתין', completed: 'הושלם', expired: 'פג תוקף' }
      const d = date ? new Date(date).toLocaleDateString('he-IL') : ''
      return {
        title: title || 'ללא שם',
        subtitle: `${statusMap[status] || status} • ${d}`,
      }
    },
  },
})
```

- [ ] **Step 2: Register in schema index**

Add to `src/sanity/schemas/index.ts`:
```typescript
import intakeToken from './intakeToken'
// ... in schemaTypes array:
// Intake
intakeToken,
```

- [ ] **Step 3: Deploy schema to Sanity**

Run: `cd /Users/shay/bitan-bitan-website && npx sanity@latest schema deploy`
Expected: Schema deployed with new `intakeToken` type

- [ ] **Step 4: Commit**

```bash
git add src/sanity/schemas/intakeToken.ts src/sanity/schemas/index.ts
git commit -m "feat: add intakeToken Sanity schema for client onboarding"
```

---

### Task 2: Types and Client Type Configuration

**Files:**
- Create: `src/lib/intake-types.ts`

- [ ] **Step 1: Create types and configuration**

```typescript
// src/lib/intake-types.ts

/** Summit סוג לקוח entity IDs */
export const CLIENT_TYPE_IDS: Record<string, number> = {
  'עצמאי': 1099570216,
  'עצמאי שנתי': 1099570129,
  'חברה': 1099570010,
  'חברה שנתי': 1099569991,
  'פטור': 1099570246,
  'שותפות': 1099570170,
  'עמותה': 1099570107,
  'עסק זעיר': 1099570213,
  'החזר מס': 1179325026,
}

/** Client types shown in form dropdown */
export const CLIENT_TYPE_OPTIONS = [
  { value: 'עצמאי', label: 'עצמאי (חודשי)' },
  { value: 'עצמאי שנתי', label: 'עצמאי (שנתי)' },
  { value: 'חברה', label: 'חברה בע"מ (חודשי)' },
  { value: 'חברה שנתי', label: 'חברה בע"מ (שנתי)' },
  { value: 'פטור', label: 'פטור ממע"מ' },
  { value: 'שותפות', label: 'שותפות' },
  { value: 'עמותה', label: 'עמותה' },
  { value: 'עסק זעיר', label: 'עסק זעיר' },
  { value: 'החזר מס', label: 'החזר מס' },
] as const

/** Which document uploads are required/optional per client type category */
export type DocCategory = 'individual' | 'company' | 'exempt'

export function getDocCategory(clientType: string): DocCategory {
  if (['חברה', 'חברה שנתי', 'שותפות', 'עמותה'].includes(clientType)) return 'company'
  if (clientType === 'פטור') return 'exempt'
  return 'individual' // עצמאי, עצמאי שנתי, עסק זעיר, החזר מס
}

export interface DocField {
  key: string
  label: string
  summitField: string
  required: boolean
  categories: DocCategory[]
}

/** Document upload fields per client type category */
export const DOC_FIELDS: DocField[] = [
  { key: 'idCard', label: 'צילום ת.ז / רישיון', summitField: 'ת.ז/ רישיון בעלים', required: true, categories: ['individual', 'company', 'exempt'] },
  { key: 'osekMurshe', label: 'תעודת עוסק מורשה', summitField: 'תעודת עוסק מורשה', required: false, categories: ['individual'] },
  { key: 'nihulHeshbon', label: 'אישור ניהול חשבון', summitField: 'אישור ניהול חשבון', required: false, categories: ['individual', 'company'] },
  { key: 'ptihaTikMaam', label: 'פתיחת תיק מע"מ', summitField: 'פתיחת תיק מעמ', required: false, categories: ['individual', 'company'] },
  { key: 'teudatHitagdut', label: 'תעודת התאגדות', summitField: 'תעודת התאגדות', required: false, categories: ['company'] },
  { key: 'takanonHevra', label: 'תקנון חברה', summitField: 'תקנון חברה', required: false, categories: ['company'] },
  { key: 'protokolMurshe', label: 'פרוטוקול מורשה חתימה', summitField: 'פרוטוקול מורשה חתימה', required: false, categories: ['company'] },
  { key: 'nesahHevra', label: 'נסח חברה', summitField: 'נסח חברה', required: false, categories: ['company'] },
]

/** Newsletter flags auto-set based on client type */
export function getNewsletterFlags(clientType: string): Record<string, boolean> {
  const flags: Record<string, boolean> = { 'ניוזלטר כלל משרדי': true }
  if (['עצמאי', 'עצמאי שנתי', 'עסק זעיר', 'פטור', 'החזר מס'].includes(clientType)) {
    flags['ניוזלטר עצמאים'] = true
  }
  if (['חברה', 'חברה שנתי', 'שותפות', 'עמותה'].includes(clientType)) {
    flags['ניוזלטר חברות'] = true
  }
  return flags
}

/** Form submission data shape */
export interface IntakeSubmission {
  token: string
  clientType: string
  fullName: string
  companyNumber: string
  phone: string
  email: string
  address?: string
  city?: string
  zipCode?: string
  birthdate?: string
  businessSector?: string
  shareholderDetails?: string
  files: Record<string, File>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/intake-types.ts
git commit -m "feat: add intake types, client type config, and field mappings"
```

---

### Task 3: Intake API Route

**Files:**
- Create: `src/app/api/intake/route.ts`
- Create: `src/lib/intake-email.ts`

- [ ] **Step 1: Create email templates**

```typescript
// src/lib/intake-email.ts

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_TO = process.env.CONTACT_EMAIL_TO
const EMAIL_FROM = process.env.CONTACT_EMAIL_FROM ?? 'אתר ביטן את ביטן <noreply@bitancpa.co.il>'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Notify office about new client submission */
export async function sendIntakeNotification(data: {
  fullName: string
  clientType: string
  phone: string
  email: string
  companyNumber: string
  fileCount: number
}): Promise<boolean> {
  if (!RESEND_API_KEY || !EMAIL_TO) return false

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#1B2A4A;margin:0 0 16px">לקוח חדש נרשם דרך טופס הקליטה</h2>
      <table style="border-collapse:collapse;font-size:15px;text-align:right;width:100%">
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">שם:</td><td style="padding:8px 0">${escapeHtml(data.fullName)}</td></tr>
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">סוג לקוח:</td><td style="padding:8px 0">${escapeHtml(data.clientType)}</td></tr>
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">ת"ז/ח"פ:</td><td style="padding:8px 0" dir="ltr">${escapeHtml(data.companyNumber)}</td></tr>
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">טלפון:</td><td style="padding:8px 0" dir="ltr">${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">דוא"ל:</td><td style="padding:8px 0" dir="ltr">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:8px 12px 8px 0;font-weight:600;color:#1B2A4A">מסמכים:</td><td style="padding:8px 0">${data.fileCount} קבצים הועלו</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #E2E0DB;margin:24px 0">
      <p style="font-size:12px;color:#718096">הודעה זו נשלחה אוטומטית מטופס קליטת לקוחות באתר.</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: EMAIL_TO, subject: `לקוח חדש: ${data.fullName}`, html }),
    })
    return res.ok
  } catch { return false }
}

/** Send welcome email to the new client */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;text-align:center;padding:40px 20px">
      <h1 style="color:#1B2A4A;font-size:24px;margin:0 0 16px">ברוכים הבאים למשפחת ביטן!</h1>
      <p style="color:#4A5568;font-size:16px;line-height:1.6;margin:0 0 24px">
        ${escapeHtml(name)} שלום,<br>
        תודה שהצטרפת למשפחת ביטן!<br>
        ניצור איתך קשר בהקרוב.
      </p>
      <p style="color:#C5A572;font-size:14px;font-weight:600">ביטן את ביטן — רואי חשבון</p>
      <hr style="border:none;border-top:1px solid #E2E0DB;margin:24px 0">
      <p style="font-size:12px;color:#718096">הודעה זו נשלחה אוטומטית. אין צורך להשיב.</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: email, subject: 'ברוכים הבאים למשפחת ביטן!', html }),
    })
    return res.ok
  } catch { return false }
}
```

- [ ] **Step 2: Create the intake API route**

```typescript
// src/app/api/intake/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { CLIENT_TYPE_IDS, getNewsletterFlags } from '@/lib/intake-types'
import { sendIntakeNotification, sendWelcomeEmail } from '@/lib/intake-email'

const SUMMIT_BASE = 'https://api.sumit.co.il'
const CLIENTS_FOLDER = '557688522'

const writeClient = createClient({
  projectId, dataset, apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

function getSummitCredentials() {
  return {
    CompanyID: parseInt(process.env.SUMMIT_COMPANY_ID || '0', 10),
    APIKey: (process.env.SUMMIT_API_KEY || '').trim(),
  }
}

async function summitPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${SUMMIT_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
    body: JSON.stringify({ Credentials: getSummitCredentials(), ...body }),
  })
  if (!res.ok) throw new Error(`Summit API ${res.status}`)
  const data = await res.json()
  if (data.Status !== 0) throw new Error(data.UserErrorMessage || `Summit error ${data.Status}`)
  return data.Data
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string
    const clientType = formData.get('clientType') as string
    const fullName = formData.get('fullName') as string
    const companyNumber = formData.get('companyNumber') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string | null
    const city = formData.get('city') as string | null
    const zipCode = formData.get('zipCode') as string | null
    const birthdate = formData.get('birthdate') as string | null
    const businessSector = formData.get('businessSector') as string | null
    const shareholderDetails = formData.get('shareholderDetails') as string | null

    // Validate required fields
    if (!token || !clientType || !fullName || !companyNumber || !phone || !email) {
      return NextResponse.json({ error: 'נא למלא את כל השדות הנדרשים' }, { status: 400 })
    }

    // Validate token
    const tokenDoc = await writeClient.fetch(
      `*[_type == "intakeToken" && token == $token][0]`,
      { token }
    )
    if (!tokenDoc) {
      return NextResponse.json({ error: 'קישור לא תקין' }, { status: 404 })
    }
    if (tokenDoc.status !== 'pending') {
      return NextResponse.json({ error: 'טופס זה כבר הוגש' }, { status: 409 })
    }

    // 1. Upload files to Sanity CDN
    const fileUrls: { label: string; url: string }[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File && value.size > 0) {
        const label = formData.get(`label_${key.replace('file_', '')}`) as string || key
        const buffer = Buffer.from(await value.arrayBuffer())
        const asset = await writeClient.assets.upload('file', buffer, {
          filename: value.name,
          contentType: value.type,
        })
        fileUrls.push({ label, url: `https://cdn.sanity.io/files/${projectId}/${dataset}/${asset._id.replace('file-', '').replace(/-[^-]+$/, '')}.${value.name.split('.').pop()}` })
      }
    }

    // 2. Create Summit CRM entity
    const properties: Record<string, unknown> = {
      Customers_FullName: fullName,
      Customers_CompanyNumber: companyNumber,
      Customers_Phone: phone,
      Customers_EmailAddress: email,
    }
    if (address) properties.Customers_Address = address
    if (city) properties.Customers_City = city
    if (zipCode) properties.Customers_ZipCode = zipCode
    if (birthdate) properties.Customers_Birthdate = birthdate
    if (businessSector) properties['תחום עיסוק'] = businessSector
    if (shareholderDetails) properties['פרטי בעלי מניות'] = shareholderDetails

    // Set client type
    const clientTypeId = CLIENT_TYPE_IDS[clientType]
    if (clientTypeId) {
      properties['סוג לקוח'] = { ID: clientTypeId }
    }

    // Set newsletter flags
    const newsletterFlags = getNewsletterFlags(clientType)
    Object.assign(properties, newsletterFlags)

    const entityResult = await summitPost('/crm/data/createentity/', {
      Entity: { Folder: CLIENTS_FOLDER, Properties: properties },
    })

    const entityId = entityResult?.Entity?.ID || entityResult?.ID

    // 3. Add file URLs as remark on the entity
    if (fileUrls.length > 0 && entityId) {
      const fileList = fileUrls.map(f => `- ${f.label}: ${f.url}`).join('\n')
      const remarkContent = `מסמכים שהועלו על ידי הלקוח (טופס קליטה):\n${fileList}`

      // Use create_customer first to get accounting customer ID, then add remark
      // For now, store in entity remark via update
      try {
        await summitPost('/crm/data/updateentity/', {
          Entity: {
            ID: entityId,
            Folder: CLIENTS_FOLDER,
            Properties: { 'הערות': remarkContent },
          },
        })
      } catch {
        // Non-critical — files are in Sanity regardless
      }
    }

    // 4. Mark token as completed
    await writeClient.patch(tokenDoc._id).set({
      status: 'completed',
      completedAt: new Date().toISOString(),
      summitEntityId: String(entityId || ''),
      submittedData: JSON.stringify({ clientType, fullName, companyNumber, phone, email, address, city, zipCode, businessSector, fileCount: fileUrls.length }),
    }).commit()

    // 5. Send notifications (fire and forget)
    sendIntakeNotification({ fullName, clientType, phone, email, companyNumber, fileCount: fileUrls.length }).catch(() => {})
    sendWelcomeEmail(email, fullName).catch(() => {})

    return NextResponse.json({ ok: true, entityId })
  } catch (err) {
    console.error('Intake submission error:', err)
    return NextResponse.json({ error: 'שגיאה בשליחת הטופס, נסו שוב' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/intake/route.ts src/lib/intake-email.ts
git commit -m "feat: add intake API route with Summit entity creation and email notifications"
```

---

### Task 4: Token Validation Page (SSR)

**Files:**
- Create: `src/app/(site)/intake/[token]/page.tsx`

- [ ] **Step 1: Create the SSR page**

This page validates the token server-side and renders the appropriate state (form, already submitted, or invalid).

```typescript
// src/app/(site)/intake/[token]/page.tsx
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import IntakeForm from './IntakeForm'

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

export const metadata: Metadata = {
  title: 'קליטת לקוח חדש | ביטן את ביטן',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

export default async function IntakePage({ params }: Props) {
  const { token } = await params

  const tokenDoc = await client.fetch(
    `*[_type == "intakeToken" && token == $token][0]{ status }`,
    { token }
  )

  if (!tokenDoc) notFound()

  if (tokenDoc.status === 'completed') {
    return (
      <main dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F4', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ color: '#1B2A4A', fontSize: '1.5rem', marginBottom: '1rem' }}>הטופס כבר הוגש</h1>
          <p style={{ color: '#4A5568' }}>תודה! הטופס כבר מולא ונשלח בהצלחה.</p>
        </div>
      </main>
    )
  }

  if (tokenDoc.status === 'expired') {
    return (
      <main dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F4', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ color: '#1B2A4A', fontSize: '1.5rem', marginBottom: '1rem' }}>פג תוקף הקישור</h1>
          <p style={{ color: '#4A5568' }}>נא לפנות למשרד לקבלת קישור חדש.</p>
        </div>
      </main>
    )
  }

  return <IntakeForm token={token} />
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(site)/intake/[token]/page.tsx"
git commit -m "feat: add intake token validation page (SSR)"
```

---

### Task 5: Multi-Step Intake Form Component

**Files:**
- Create: `src/app/(site)/intake/[token]/IntakeForm.tsx`
- Create: `src/app/(site)/intake/[token]/intake.module.css`

This is the largest task — the client-facing multi-step wizard. It has 4 steps:
1. Client type selection
2. Personal details
3. Document uploads
4. Review & submit

- [ ] **Step 1: Create the CSS module**

Create `src/app/(site)/intake/[token]/intake.module.css` with styles following the website's design language (Navy #1B2A4A, Gold #C5A572, Tailwind-compatible). Styles should cover:
- Full-page form layout (centered, max-width 640px, mobile-responsive)
- Step progress indicator (4 dots with active/completed states)
- Form field groups (label + input, RTL)
- File upload dropzone (dashed border, hover state)
- Card selection grid (for client type step)
- Submit button (gold gradient, hover scale)
- Success screen (checkmark animation)
- Error states (red border on invalid fields)

- [ ] **Step 2: Create the IntakeForm component**

Create `src/app/(site)/intake/[token]/IntakeForm.tsx` as a `"use client"` component with:

**State management:**
- `step` (1-4) for wizard navigation
- `clientType` selected value
- `formData` object for all text fields
- `files` Record<string, File> for uploaded documents
- `submitting` boolean
- `submitted` boolean
- `error` string | null

**Step 1 — Client Type:** Card grid of `CLIENT_TYPE_OPTIONS`. On selection, advance to step 2.

**Step 2 — Details:** Form fields: שם מלא (required), ת"ז/ח"פ (required), טלפון (required), דוא"ל (required), כתובת, יישוב, מיקוד, תאריך לידה, תחום עיסוק. If company type: פרטי בעלי מניות textarea.

**Step 3 — Documents:** Show `DOC_FIELDS` filtered by `getDocCategory(clientType)`. Each field is a file input with label. Drag-and-drop support. File preview (name + size) after selection.

**Step 4 — Review:** Summary table of all data + file list. Submit button. On submit: construct `FormData`, POST to `/api/intake`, handle success/error.

**Success screen:** "תודה שהצטרפת למשפחת ביטן! ניצור איתך קשר בהקרוב" with gold checkmark.

Key conventions:
- `"use client"` at top
- All labels in Hebrew
- RTL direction
- Mobile-responsive (phone users from WhatsApp)
- File validation: max 20MB, PDF/JPG/PNG only
- Basic client-side validation before submit (required fields)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/intake/[token]/IntakeForm.tsx" "src/app/(site)/intake/[token]/intake.module.css"
git commit -m "feat: add multi-step client intake form with file uploads"
```

---

### Task 6: End-to-End Testing & Polish

- [ ] **Step 1: Set environment variables for local testing**

In `.env.local`:
```
SUMMIT_COMPANY_ID=557813963
SUMMIT_API_KEY=<from Railway>
```

- [ ] **Step 2: Create a test token in Sanity Studio**

Go to Sanity Studio → create an `intakeToken` document with:
- token: `test-token-123`
- status: `pending`
- clientName: `לקוח בדיקה`

- [ ] **Step 3: Test the full flow locally**

1. Open `http://localhost:3000/intake/test-token-123`
2. Select client type
3. Fill all fields
4. Upload a test file
5. Submit
6. Verify: Summit entity created, token marked completed, files in Sanity CDN

- [ ] **Step 4: Test edge cases**

- Submit same token again → "הטופס כבר הוגש"
- Invalid token → 404
- Missing required fields → validation error
- Large file (>20MB) → client-side rejection

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: intake form polish and edge case handling"
```

---

## Chunk 2: Bitan OS — Link Generator

### File Structure

```
apps/os-hub/src/app/onboarding/page.tsx        — NEW: link generator page
apps/os-hub/src/app/onboarding/page.module.css  — NEW: page styles
apps/os-hub/src/components/SideNav.tsx           — MODIFY: add onboarding nav item
apps/os-hub/src/app/page.tsx                     — MODIFY: update dashboard card href
apps/os-hub/src/lib/strings/he.ts                — MODIFY: update string if needed
```

---

### Task 7: Onboarding Page in Bitan OS

**Files:**
- Create: `apps/os-hub/src/app/onboarding/page.tsx`
- Create: `apps/os-hub/src/app/onboarding/page.module.css`
- Modify: `apps/os-hub/src/components/SideNav.tsx`
- Modify: `apps/os-hub/src/app/page.tsx`

- [ ] **Step 1: Create the onboarding page**

A simple page with:
- "Generate Link" button
- Optional: client name hint field (for tracking)
- On click: POST to `/api/intake/generate` → creates Sanity token → displays link
- Copy-to-clipboard button
- List of recent tokens with status (pending/completed)

The page should:
- Use the existing OS design system (CSS Modules, Navy/Gold tokens)
- Use `PageHeader` component
- Fetch recent tokens from Sanity on load

- [ ] **Step 2: Create the generate API route**

Create `apps/os-hub/src/app/api/intake/generate/route.ts`:
- Generate UUID token
- Create `intakeToken` document in Sanity (project `ul4uwnp7`)
- Return the full URL: `https://bitancpa.com/intake/${token}`

Uses the same Sanity write client pattern as Bitan OS's existing Sanity integration.

- [ ] **Step 3: Add to sidebar nav**

Add "קליטת לקוחות" to the `SideNav.tsx` main nav array, with href `/onboarding`.

- [ ] **Step 4: Update dashboard card**

In `apps/os-hub/src/app/page.tsx`, change the customerOnboarding module:
- `href: "#"` → `href: "/onboarding"`
- Remove `comingSoon: true`

- [ ] **Step 5: Commit**

```bash
git add apps/os-hub/src/app/onboarding/ apps/os-hub/src/app/api/intake/ apps/os-hub/src/components/SideNav.tsx apps/os-hub/src/app/page.tsx
git commit -m "feat: add client onboarding link generator page"
```

---

## Environment Variables Needed

### Bitan Website (Railway)
```
SUMMIT_COMPANY_ID=557813963      — NEW (not currently set)
SUMMIT_API_KEY=<value>           — NEW (not currently set)
RESEND_API_KEY=<value>           — EXISTING but NOT SET (needed for emails)
CONTACT_EMAIL_TO=<ron+avi email> — EXISTING but NOT SET
```

### Bitan OS (Railway)
No new env vars needed — Sanity tokens already configured.

---

## Deployment Sequence

1. Deploy website first (has the form + API)
2. Deploy OS second (has the link generator)
3. Set env vars on Railway (SUMMIT_COMPANY_ID, SUMMIT_API_KEY, RESEND_API_KEY, CONTACT_EMAIL_TO)
4. Test end-to-end with a real token
5. Demo to Avi
