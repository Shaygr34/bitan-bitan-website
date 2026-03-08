import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { sendLeadNotification } from '@/lib/email'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, phone, email, message, website } = body

    // Honeypot check — bots fill the hidden field
    if (website) {
      return NextResponse.json({ ok: true })
    }

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'נא להזין שם מלא' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !/^[\d\-+() ]{7,}$/.test(phone.trim())) {
      return NextResponse.json({ error: 'נא להזין מספר טלפון תקין' }, { status: 400 })
    }

    const lead = {
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      message: message?.trim() || undefined,
    }

    // Save to Sanity (primary — must succeed)
    await writeClient.create({
      _type: 'contactLead',
      ...lead,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })

    // Send email notification (secondary — fire and forget, don't block response)
    sendLeadNotification(lead).catch(() => {
      // Email failure is non-critical; lead is already saved in Sanity
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Log error details server-side for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Contact form error:', err)
    }
    return NextResponse.json(
      { error: 'שגיאה בשליחת הטופס, נסו שוב' },
      { status: 500 },
    )
  }
}
