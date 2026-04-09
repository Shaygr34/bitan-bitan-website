import { notFound } from 'next/navigation'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import IntakeForm from './IntakeForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'קליטת לקוח חדש | ביטן את ביטן',
  robots: { index: false, follow: false },
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

interface Props {
  params: Promise<{ token: string }>
}

export default async function IntakeTokenPage({ params }: Props) {
  const { token } = await params

  // Note: "token" is a reserved key in Sanity QueryParams (it's a client option),
  // so we use "tokenValue" as the GROQ parameter name.
  const doc = await client.fetch<{ status: string; prefillData?: string; submittedData?: string; _createdAt: string; summitEntityId?: string } | null>(
    `*[_type == "intakeToken" && token == $tokenValue][0]{ status, prefillData, submittedData, _createdAt, summitEntityId }`,
    { tokenValue: token },
    { next: { revalidate: 0 } }
  )

  if (!doc) {
    notFound()
  }

  // Allow re-entry within 4 days of creation even if completed
  const ageMs = Date.now() - new Date(doc._createdAt).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  const isEditable = ageDays <= 4

  if (doc.status === 'completed' && !isEditable) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F7F4',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#1B2A4A', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          הטופס כבר הוגש
        </h1>
        <p style={{ color: '#4A5568', fontSize: '1rem', margin: 0 }}>
          תודה! הטופס כבר מולא ונשלח בהצלחה. לעדכון פרטים — פנו למשרד.
        </p>
      </div>
    )
  }

  if (doc.status === 'expired') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F7F4',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#1B2A4A', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          פג תוקף הקישור
        </h1>
        <p style={{ color: '#4A5568', fontSize: '1rem', margin: 0 }}>
          נא לפנות למשרד לקבלת קישור חדש.
        </p>
      </div>
    )
  }

  // Parse prefillData if present
  let prefillClientType: string | undefined
  let previousData: Record<string, string> | undefined
  if (doc.prefillData) {
    try {
      const prefill = JSON.parse(doc.prefillData)
      prefillClientType = prefill.clientType
    } catch {
      // ignore malformed prefillData
    }
  }

  // If completed but still editable, pass previous data for pre-fill
  if (doc.status === 'completed' && isEditable && doc.submittedData) {
    try {
      previousData = JSON.parse(doc.submittedData)
    } catch {
      // ignore
    }
  }

  // status === 'pending', 'opened', or 'completed' (within 4 days) — show the form
  return (
    <IntakeForm
      token={token}
      prefillClientType={prefillClientType}
      previousData={previousData}
      summitEntityId={doc.summitEntityId}
      isUpdate={doc.status === 'completed' && isEditable}
    />
  )
}
