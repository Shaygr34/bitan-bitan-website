import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { CLIENT_TYPE_IDS, getNewsletterFlags } from '@/lib/intake-types'
import { sendIntakeNotification, sendWelcomeEmail } from '@/lib/intake-email'

// ---------------------------------------------------------------------------
// Sanity write client
// ---------------------------------------------------------------------------
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

// ---------------------------------------------------------------------------
// Summit CRM helpers
// ---------------------------------------------------------------------------
function getSummitCredentials() {
  return {
    CompanyID: parseInt(process.env.SUMMIT_COMPANY_ID ?? '0', 10),
    APIKey: (process.env.SUMMIT_API_KEY ?? '').trim(),
  }
}

async function createSummitEntity(fields: {
  fullName: string
  companyNumber: string
  phone: string
  email: string
  clientType: string
  address?: string
  city?: string
  zipCode?: string
  birthdate?: string
  businessSector?: string
  shareholderDetails?: string
}): Promise<string | null> {
  const credentials = getSummitCredentials()
  if (!credentials.APIKey || !credentials.CompanyID) return null

  const clientTypeId = CLIENT_TYPE_IDS[fields.clientType]
  const newsletterFlags = getNewsletterFlags(fields.clientType)

  const properties: Record<string, unknown> = {
    Customers_FullName: fields.fullName,
    Customers_CompanyNumber: fields.companyNumber,
    Customers_Phone: fields.phone,
    Customers_EmailAddress: fields.email,
    'סוג לקוח': clientTypeId ?? undefined,
  }

  // Newsletter flags
  for (const [key, value] of Object.entries(newsletterFlags)) {
    properties[key] = value
  }

  // Optional fields — use API names from Summit schema
  if (fields.address) properties.Customers_Address = fields.address
  if (fields.city) properties.Customers_City = fields.city
  if (fields.zipCode) properties.Customers_ZipCode = fields.zipCode
  if (fields.birthdate) properties.Customers_Birthdate = fields.birthdate.includes('T') ? fields.birthdate : `${fields.birthdate}T00:00:00`
  // תחום עיסוק is an Entity reference field — skipped for now (requires entity ID lookup)
  // if (fields.businessSector) properties['תחום עיסוק'] = fields.businessSector
  if (fields.shareholderDetails) properties['פרטי בעלי מניות'] = fields.shareholderDetails

  // Remove undefined values
  for (const key of Object.keys(properties)) {
    if (properties[key] === undefined) delete properties[key]
  }

  try {
    const res = await fetch('https://api.sumit.co.il/crm/data/createentity/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
      body: JSON.stringify({
        Credentials: credentials,
        Entity: {
          Folder: '557688522',
          Properties: properties,
        },
      }),
    })

    if (!res.ok) {
      console.error('Summit createentity failed:', res.status, await res.text())
      return null
    }

    const json = await res.json()

    // Check Summit status (0 = success)
    if (json?.Status !== 0) {
      console.error('Summit createentity business error:', json?.UserErrorMessage, json?.TechnicalErrorDetails)
      return null
    }

    const entityId: unknown =
      json?.Data?.EntityID ??
      json?.EntityID ??
      json?.Data?.ID ??
      json?.ID ??
      null

    return entityId ? String(entityId) : null
  } catch (err) {
    console.error('Summit createentity error:', err)
    return null
  }
}

async function updateSummitEntityNotes(entityId: string, notes: string): Promise<void> {
  const credentials = getSummitCredentials()
  if (!credentials.APIKey || !credentials.CompanyID || !entityId) return

  try {
    await fetch('https://api.sumit.co.il/crm/data/updateentity/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Credentials: credentials,
        Entity: {
          ID: entityId,
          Folder: '557688522',
          Properties: { 'הערות': notes },
        },
      }),
    })
  } catch (err) {
    console.error('Summit updateentity notes error:', err)
  }
}

// ---------------------------------------------------------------------------
// POST /api/intake
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. Parse FormData
    // -----------------------------------------------------------------------
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'פורמט הבקשה אינו תקין' }, { status: 400 })
    }

    const get = (key: string): string => (formData.get(key) as string | null) ?? ''

    const token = get('token')
    const clientType = get('clientType')
    const fullName = get('fullName')
    const companyNumber = get('companyNumber')
    const phone = get('phone')
    const email = get('email')
    const address = get('address') || undefined
    const city = get('city') || undefined
    const zipCode = get('zipCode') || undefined
    const birthdate = get('birthdate') || undefined
    const businessSector = get('businessSector') || undefined
    const shareholderDetails = get('shareholderDetails') || undefined

    // -----------------------------------------------------------------------
    // 2. Validate required fields
    // -----------------------------------------------------------------------
    const missing: string[] = []
    if (!token) missing.push('token')
    if (!clientType) missing.push('clientType')
    if (!fullName) missing.push('fullName')
    if (!companyNumber) missing.push('companyNumber')
    if (!phone) missing.push('phone')
    if (!email) missing.push('email')

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `שדות חובה חסרים: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // -----------------------------------------------------------------------
    // 3. Validate token in Sanity
    // -----------------------------------------------------------------------
    const tokenDoc = await writeClient.fetch<{
      _id: string
      status: string
    } | null>(
      `*[_type == "intakeToken" && token == $tokenValue][0]{ _id, status }`,
      { tokenValue: token },
      { cache: 'no-store' }
    )

    if (!tokenDoc) {
      return NextResponse.json({ error: 'קישור ההצטרפות אינו תקף' }, { status: 404 })
    }

    if (tokenDoc.status !== 'pending') {
      return NextResponse.json(
        { error: 'קישור זה כבר שומש. לעזרה פנו למשרד.' },
        { status: 409 }
      )
    }

    // -----------------------------------------------------------------------
    // 4. Create Summit CRM entity FIRST (fast, critical)
    // -----------------------------------------------------------------------
    const entityId = await createSummitEntity({
      fullName,
      companyNumber,
      phone,
      email,
      clientType,
      address,
      city,
      zipCode,
      birthdate,
      businessSector,
      shareholderDetails,
    })

    // -----------------------------------------------------------------------
    // 5. Upload files to Sanity CDN (slower, non-critical for entity)
    // -----------------------------------------------------------------------
    const fileUrls: { label: string; url: string; filename: string }[] = []

    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (!key.startsWith('file_')) continue
      if (!(value instanceof File)) continue

      const fileKey = key.replace(/^file_/, '')
      const label = (formData.get(`label_${fileKey}`) as string | null) ?? fileKey
      const filename = value.name || `${fileKey}.bin`
      const contentType = value.type || 'application/octet-stream'

      try {
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const asset = await writeClient.assets.upload('file', buffer, {
          filename,
          contentType,
        })

        if (asset?.url) {
          fileUrls.push({ label, url: asset.url, filename })
        }
      } catch (err) {
        console.error(`Failed to upload file ${filename}:`, err)
      }
    }

    // -----------------------------------------------------------------------
    // 6. Store file URLs in Summit entity notes
    // -----------------------------------------------------------------------
    if (entityId && fileUrls.length > 0) {
      const noteLines = ['קבצים שהועלו על ידי הלקוח:', '']
      for (const f of fileUrls) {
        noteLines.push(`${f.label}: ${f.url}`)
      }
      await updateSummitEntityNotes(entityId, noteLines.join('\n'))
    }

    // -----------------------------------------------------------------------
    // 7. Mark token completed in Sanity
    // -----------------------------------------------------------------------
    const submittedData = JSON.stringify({
      clientType,
      fullName,
      companyNumber,
      phone,
      email,
      address,
      city,
      zipCode,
      birthdate,
      businessSector,
      shareholderDetails,
      fileCount: fileUrls.length,
      fileNames: fileUrls.map((f) => f.filename),
    })

    await writeClient
      .patch(tokenDoc._id)
      .set({
        status: 'completed',
        completedAt: new Date().toISOString(),
        submittedData,
        ...(entityId ? { summitEntityId: entityId } : {}),
      })
      .commit()

    // -----------------------------------------------------------------------
    // 8. Fire-and-forget emails
    // -----------------------------------------------------------------------
    void Promise.all([
      sendIntakeNotification({
        fullName,
        clientType,
        companyNumber,
        phone,
        email,
        fileCount: fileUrls.length,
      }),
      sendWelcomeEmail(email, fullName),
    ])

    // -----------------------------------------------------------------------
    // 9. Return success
    // -----------------------------------------------------------------------
    return NextResponse.json({ ok: true, entityId: entityId ?? null })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Intake submission error:', message)
    return NextResponse.json(
      { error: 'אירעה שגיאה בעיבוד הבקשה. נסו שוב או פנו למשרד.' },
      { status: 500 }
    )
  }
}
