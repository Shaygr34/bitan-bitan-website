import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { CLIENT_TYPE_IDS, BUSINESS_SECTOR_IDS, ACCOUNT_MANAGER_IDS, DOC_FIELDS, getNewsletterFlags } from '@/lib/intake-types'
import { sendIntakeNotification, sendWelcomeEmail } from '@/lib/intake-email'
import { buildDocFilename, buildSummitNoteEntry } from '@/lib/document-urls'

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
  businessName?: string
  businessNumber?: string
  businessSector?: string
  businessDescription?: string
  businessAddress?: string
  shareholderDetails?: string
  // Transfer fields
  previousCpaName?: string
  previousCpaEmail?: string
  previousCpaSoftware?: string
  onboardingPath?: string
  // From intake token
  accountManager?: string
}): Promise<{ entityId: string | null; error: string | null }> {
  const credentials = getSummitCredentials()
  if (!credentials.APIKey || !credentials.CompanyID) return { entityId: null, error: 'Summit API credentials not configured' }

  const clientTypeId = CLIENT_TYPE_IDS[fields.clientType]
  const newsletterFlags = getNewsletterFlags(fields.clientType)

  const sectorEntityId = fields.businessSector ? BUSINESS_SECTOR_IDS[fields.businessSector] : undefined
  const isCompanyType = ['חברה', 'חברה בע"מ', 'חברה שנתי', 'שותפות', 'עמותה'].includes(fields.clientType)

  // מנהל תיק from intake token (set during link generation in OS)
  const managerId = fields.accountManager ? ACCOUNT_MANAGER_IDS[fields.accountManager] : undefined

  const properties: Record<string, unknown> = {
    // Companies → business name, individuals → personal name
    Customers_FullName: (isCompanyType && fields.businessName) ? fields.businessName : fields.fullName,
    // Companies: ח.פ/ע.מ = businessNumber, individuals: ת.ז = companyNumber
    Customers_CompanyNumber: (isCompanyType && fields.businessNumber) ? fields.businessNumber : fields.companyNumber,
    Customers_Phone: fields.phone,
    Customers_EmailAddress: fields.email,
    'סוג לקוח': clientTypeId ?? undefined,
    ...(sectorEntityId ? { 'תחום עיסוק': sectorEntityId } : {}),
    ...(managerId ? { 'מנהל תיק': managerId } : {}),
    // עובד/ת ביקורת — not set at intake, assigned manually in Summit
  }

  // Newsletter flags
  for (const [key, value] of Object.entries(newsletterFlags)) {
    properties[key] = value
  }

  // Optional fields
  if (fields.address) properties.Customers_Address = fields.address
  if (fields.city) properties.Customers_City = fields.city
  if (fields.zipCode) properties.Customers_ZipCode = fields.zipCode
  if (fields.birthdate) properties.Customers_Birthdate = fields.birthdate.includes('T') ? fields.birthdate : `${fields.birthdate}T00:00:00`
  if (fields.shareholderDetails) properties['פרטי בעלי מניות'] = fields.shareholderDetails

  // New V2 fields
  if (fields.businessAddress) properties.Customers_Address = fields.businessAddress // override with business address if provided

  // Auto-set fields
  properties['מועד תחילת ייצוג'] = new Date().toISOString().split('T')[0] + 'T00:00:00'
  properties['Customers_Status'] = 557688551 // "1. איסוף נתונים"

  // Transfer + business details → store in Customers_Text (structured notes)
  const textParts: string[] = []
  if (fields.onboardingPath) textParts.push(`מסלול קליטה: ${fields.onboardingPath}`)
  if (fields.businessName) textParts.push(`שם העסק: ${fields.businessName}`)
  if (isCompanyType && fields.companyNumber) textParts.push(`ת.ז בעלים: ${fields.companyNumber}`)
  if (fields.businessNumber) textParts.push(`מס' ע.מ / ח.פ: ${fields.businessNumber}`)
  if (fields.businessSector) textParts.push(`תחום עיסוק: ${fields.businessSector}`)
  if (fields.businessDescription) textParts.push(`תיאור פעילות: ${fields.businessDescription}`)
  if (fields.previousCpaName) textParts.push(`רו"ח קודם: ${fields.previousCpaName}`)
  if (fields.previousCpaEmail) textParts.push(`מייל רו"ח קודם: ${fields.previousCpaEmail}`)
  if (fields.previousCpaSoftware) textParts.push(`תוכנות רו"ח קודם: ${fields.previousCpaSoftware}`)
  if (textParts.length > 0) properties.Customers_Text = textParts.join('\n')

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
      const errText = await res.text()
      console.error('Summit createentity failed:', res.status, errText)
      return { entityId: null, error: `Summit HTTP ${res.status}: ${errText.slice(0, 200)}` }
    }

    const json = await res.json()

    // Check Summit status (0 = success)
    if (json?.Status !== 0) {
      const errMsg = json?.UserErrorMessage || json?.TechnicalErrorDetails || 'Unknown error'
      console.error('Summit createentity business error:', errMsg)
      return { entityId: null, error: `Summit: ${errMsg}` }
    }

    const entityId: unknown =
      json?.Data?.EntityID ??
      json?.EntityID ??
      json?.Data?.ID ??
      json?.ID ??
      null

    return { entityId: entityId ? String(entityId) : null, error: null }
  } catch (err) {
    console.error('Summit createentity error:', err)
    return { entityId: null, error: `Exception: ${err instanceof Error ? err.message : String(err)}` }
  }
}

async function sendSummitSms(phone: string, message: string): Promise<void> {
  const credentials = getSummitCredentials()
  if (!credentials.APIKey || !credentials.CompanyID || !phone) return

  try {
    await fetch('https://api.sumit.co.il/sms/sms/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
      body: JSON.stringify({
        Credentials: credentials,
        Recipient: phone,
        Text: message,
      }),
    })
  } catch (err) {
    console.error('Summit SMS send error:', err)
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

async function updateSummitEntityFields(entityId: string, fields: Record<string, string | undefined>): Promise<void> {
  const credentials = getSummitCredentials()
  if (!credentials.APIKey || !credentials.CompanyID || !entityId) return

  const clientTypeId = fields.clientType ? CLIENT_TYPE_IDS[fields.clientType] : undefined
  const newsletterFlags = fields.clientType ? getNewsletterFlags(fields.clientType) : {}
  const sectorEntityId = fields.businessSector ? BUSINESS_SECTOR_IDS[fields.businessSector] : undefined

  const isCompanyType = fields.clientType ? ['חברה', 'חברה בע"מ', 'חברה שנתי', 'שותפות', 'עמותה'].includes(fields.clientType) : false

  const properties: Record<string, unknown> = {}
  // Companies → business name, individuals → personal name
  if (isCompanyType && fields.businessName) {
    properties.Customers_FullName = fields.businessName
  } else if (fields.fullName) {
    properties.Customers_FullName = fields.fullName
  }
  if (fields.companyNumber) properties.Customers_CompanyNumber = fields.companyNumber
  if (fields.phone) properties.Customers_Phone = fields.phone
  if (fields.email) properties.Customers_EmailAddress = fields.email
  if (clientTypeId) properties['סוג לקוח'] = clientTypeId
  for (const [key, value] of Object.entries(newsletterFlags)) properties[key] = value
  if (fields.address) properties.Customers_Address = fields.address
  if (fields.city) properties.Customers_City = fields.city
  if (fields.zipCode) properties.Customers_ZipCode = fields.zipCode
  if (fields.birthdate) properties.Customers_Birthdate = fields.birthdate.includes('T') ? fields.birthdate : `${fields.birthdate}T00:00:00`
  if (fields.shareholderDetails) properties['פרטי בעלי מניות'] = fields.shareholderDetails
  if (fields.businessAddress) properties.Customers_Address = fields.businessAddress
  // Gap 1: תחום עיסוק entity reference — TODO: activate once BUSINESS_SECTOR_IDS are populated
  if (sectorEntityId) properties['תחום עיסוק'] = sectorEntityId

  const textParts: string[] = []
  if (fields.onboardingPath) textParts.push(`מסלול קליטה: ${fields.onboardingPath}`)
  if (fields.businessName) textParts.push(`שם העסק: ${fields.businessName}`)
  if (isCompanyType && fields.companyNumber) textParts.push(`ת.ז בעלים: ${fields.companyNumber}`)
  if (fields.businessNumber) textParts.push(`מס' ע.מ / ח.פ: ${fields.businessNumber}`)
  if (fields.businessSector) textParts.push(`תחום עיסוק: ${fields.businessSector}`)
  if (fields.businessDescription) textParts.push(`תיאור פעילות: ${fields.businessDescription}`)
  if (fields.previousCpaName) textParts.push(`רו"ח קודם: ${fields.previousCpaName}`)
  if (fields.previousCpaEmail) textParts.push(`מייל רו"ח קודם: ${fields.previousCpaEmail}`)
  if (fields.previousCpaSoftware) textParts.push(`תוכנות רו"ח קודם: ${fields.previousCpaSoftware}`)
  if (textParts.length > 0) properties.Customers_Text = textParts.join('\n')

  try {
    await fetch('https://api.sumit.co.il/crm/data/updateentity/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
      body: JSON.stringify({
        Credentials: credentials,
        Entity: { ID: entityId, Folder: '557688522', Properties: properties },
      }),
    })
  } catch (err) {
    console.error('Sumit updateentity error:', err)
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
    const onboardingPath = get('onboardingPath') || undefined
    const fullName = get('fullName')
    const companyNumber = get('companyNumber')
    const phone = get('phone')
    const email = get('email')
    const address = get('address') || undefined
    const city = get('city') || undefined
    const zipCode = get('zipCode') || undefined
    const birthdate = get('birthdate') || undefined
    // V2 fields
    const businessName = get('businessName') || undefined
    const businessNumber = get('businessNumber') || undefined
    const businessSector = get('businessSector') || undefined
    const businessDescription = get('businessDescription') || undefined
    const businessAddress = get('businessAddress') || undefined
    const shareholderDetails = get('shareholderDetails') || undefined
    // Transfer fields
    const previousCpaName = get('previousCpaName') || undefined
    const previousCpaEmail = get('previousCpaEmail') || undefined
    const previousCpaSoftware = get('previousCpaSoftware') || undefined

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
      prefillData?: string
    } | null>(
      `*[_type == "intakeToken" && token == $tokenValue][0]{ _id, status, prefillData }`,
      { tokenValue: token },
      { cache: 'no-store' }
    )

    if (!tokenDoc) {
      return NextResponse.json({ error: 'קישור ההצטרפות אינו תקף' }, { status: 404 })
    }

    const isUpdateMode = get('isUpdate') === 'true'
    const existingSummitId = get('summitEntityId') || undefined

    // Extract accountManager from token's prefillData (set during link generation in OS)
    let accountManager: string | undefined
    if (tokenDoc.prefillData) {
      try {
        const prefill = JSON.parse(tokenDoc.prefillData)
        if (prefill.manager) accountManager = prefill.manager
      } catch { /* ignore parse errors */ }
    }

    // Allow re-submission if isUpdate mode, otherwise block completed tokens
    if (!isUpdateMode && tokenDoc.status !== 'pending' && tokenDoc.status !== 'opened') {
      return NextResponse.json(
        { error: 'קישור זה כבר שומש. לעזרה פנו למשרד.' },
        { status: 409 }
      )
    }

    // -----------------------------------------------------------------------
    // 4. Create or Update Summit CRM entity
    // -----------------------------------------------------------------------
    let entityId: string | null = existingSummitId || null
    let summitError: string | null = null

    if (isUpdateMode && existingSummitId) {
      // Update existing entity
      await updateSummitEntityFields(existingSummitId, {
        fullName, companyNumber, phone, email, clientType,
        address, city, zipCode, birthdate, businessName,
        businessNumber, businessSector, businessDescription,
        businessAddress, shareholderDetails, previousCpaName,
        previousCpaEmail, previousCpaSoftware, onboardingPath,
      })
    } else {
      // Create new entity
      const result = await createSummitEntity({
        fullName,
        companyNumber,
        phone,
        email,
        clientType,
        address,
        city,
        zipCode,
        birthdate,
        businessName,
        businessNumber,
        businessSector,
        businessDescription,
        businessAddress,
        shareholderDetails,
        previousCpaName,
        previousCpaEmail,
        previousCpaSoftware,
        onboardingPath,
        accountManager,
      })
      entityId = result.entityId
      summitError = result.error
    }

    // -----------------------------------------------------------------------
    // 5. Upload files to Sanity CDN + create clientDocument records
    // -----------------------------------------------------------------------
    const fileResults: { docKey: string; label: string; url: string; filename: string; sanityDocId: string }[] = []

    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (!key.startsWith('file_')) continue
      if (!(value instanceof File)) continue

      const docKey = key.replace(/^file_/, '')
      const docField = DOC_FIELDS.find(d => d.key === docKey)
      const label = docField?.label ?? (formData.get(`label_${docKey}`) as string | null) ?? docKey
      const originalFilename = value.name || `${docKey}.bin`
      const contentType = value.type || 'application/octet-stream'
      const cleanFilename = buildDocFilename(fullName, label, originalFilename)

      try {
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const asset = await writeClient.assets.upload('file', buffer, {
          filename: cleanFilename,
          contentType,
        })

        if (!asset?.url) continue

        // Create structured clientDocument in Sanity
        const sanityDoc = await writeClient.create({
          _type: 'clientDocument',
          summitEntityId: entityId || '',
          clientName: fullName,
          docType: docKey,
          file: {
            _type: 'file',
            asset: { _type: 'reference', _ref: asset._id },
          },
          uploadedBy: 'client',
        })

        fileResults.push({
          docKey,
          label,
          url: asset.url,
          filename: cleanFilename,
          sanityDocId: sanityDoc._id,
        })
      } catch (err) {
        console.error(`Failed to upload file ${originalFilename}:`, err)
      }
    }

    // -----------------------------------------------------------------------
    // 6. Write file URLs to Summit entity fields + notes
    // -----------------------------------------------------------------------
    if (entityId && fileResults.length > 0) {
      const summitFileProps: Record<string, string> = {}
      const noteLines: string[] = ['מסמכים שהועלו:', '']

      // Fetch files from Sanity CDN, base64 encode, and map to Summit File fields
      for (const f of fileResults) {
        noteLines.push(buildSummitNoteEntry(f.label, f.url))

        const docField = DOC_FIELDS.find(d => d.key === f.docKey)
        if (docField?.summitField) {
          try {
            const fileRes = await fetch(f.url)
            if (fileRes.ok) {
              const fileBuffer = await fileRes.arrayBuffer()
              const base64 = Buffer.from(fileBuffer).toString('base64')
              // Summit File fields expect "Filename;Base64Value" format
              // Multiple files for same field: only keep the latest
              summitFileProps[docField.summitField] = `${f.filename};${base64}`
            }
          } catch {
            // Non-fatal: file fetch failed, skip this field
          }
        }
      }

      // Update Summit: native File fields + הערות with URLs
      const credentials = getSummitCredentials()
      if (credentials.APIKey && credentials.CompanyID) {
        try {
          const fileUpdateRes = await fetch('https://api.sumit.co.il/crm/data/updateentity/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
            body: JSON.stringify({
              Credentials: credentials,
              Entity: {
                ID: parseInt(String(entityId), 10),
                Folder: '557688522',
                Properties: {
                  ...summitFileProps,
                  'הערות': noteLines.join('\n'),
                },
              },
            }),
          })
          if (!fileUpdateRes.ok) {
            console.error('[INTAKE] Summit file update HTTP error:', fileUpdateRes.status)
          } else {
            const fileUpdateJson = await fileUpdateRes.json().catch(() => null)
            if (fileUpdateJson?.Status !== 0) {
              console.error('[INTAKE] Summit file update error:', fileUpdateJson?.UserErrorMessage || 'Unknown')
            }
          }
        } catch (err) {
          console.error('Summit file fields update error:', err)
        }
      }
    }

    // -----------------------------------------------------------------------
    // 7. Mark token completed in Sanity
    // -----------------------------------------------------------------------
    // Preserve previous file metadata on re-submission when no new files uploaded
    let previousFileData: { fileCount?: number; fileNames?: string[]; sanityDocIds?: string[] } = {}
    if (fileResults.length === 0 && isUpdateMode && tokenDoc.status === 'completed') {
      try {
        const prevData = await writeClient.fetch<{ submittedData?: string } | null>(
          `*[_type == "intakeToken" && _id == $id][0]{ submittedData }`,
          { id: tokenDoc._id },
          { cache: 'no-store' }
        )
        if (prevData?.submittedData) {
          const parsed = JSON.parse(prevData.submittedData)
          previousFileData = {
            fileCount: parsed.fileCount || 0,
            fileNames: parsed.fileNames || [],
            sanityDocIds: parsed.sanityDocIds || [],
          }
        }
      } catch { /* ignore — will default to 0 */ }
    }

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
      fileCount: fileResults.length > 0 ? fileResults.length : (previousFileData.fileCount || 0),
      fileNames: fileResults.length > 0 ? fileResults.map((f) => f.filename) : (previousFileData.fileNames || []),
      sanityDocIds: fileResults.length > 0 ? fileResults.map((f) => f.sanityDocId) : (previousFileData.sanityDocIds || []),
    })

    const tokenStatus = summitError ? 'summit_failed' : 'completed'

    await writeClient
      .patch(tokenDoc._id)
      .set({
        status: tokenStatus,
        completedAt: new Date().toISOString(),
        submittedData,
        ...(entityId ? { summitEntityId: entityId } : {}),
        ...(summitError ? { summitError } : {}),
      })
      .commit()

    // -----------------------------------------------------------------------
    // 8. Fire-and-forget notifications (email + SMS)
    // -----------------------------------------------------------------------
    void Promise.all([
      sendIntakeNotification({
        fullName,
        clientType,
        companyNumber,
        phone,
        email,
        fileCount: fileResults.length,
      }),
      sendWelcomeEmail(email, fullName),
      // SMS confirmation to client — only on new submissions (not updates)
      ...(!isUpdateMode && phone
        ? [sendSummitSms(
            phone,
            `שלום ${fullName}, קיבלנו את הפרטים שלך בהצלחה. בשלב הבא נשלח ייפוי כוח לחתימה דיגיטלית. צוות ביטן את ביטן רואי חשבון`
          )]
        : []),
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
