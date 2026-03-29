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
  const doc = await client.fetch<{ status: string; prefillData?: string } | null>(
    `*[_type == "intakeToken" && token == $tokenValue][0]{ status, prefillData }`,
    { tokenValue: token },
    { next: { revalidate: 0 } }
  )

  if (!doc) {
    notFound()
  }

  if (doc.status === 'completed') {
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
          תודה! הטופס כבר מולא ונשלח בהצלחה.
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
  if (doc.prefillData) {
    try {
      const prefill = JSON.parse(doc.prefillData)
      prefillClientType = prefill.clientType
    } catch {
      // ignore malformed prefillData
    }
  }

  // status === 'pending' or 'opened' — show the form
  return <IntakeForm token={token} prefillClientType={prefillClientType} />
}
