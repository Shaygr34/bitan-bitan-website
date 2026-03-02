import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
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

    // Create lead document in Sanity
    await writeClient.create({
      _type: 'contactLead',
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      message: message?.trim() || undefined,
      submittedAt: new Date().toISOString(),
      status: 'new',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'שגיאה בשליחת הטופס, נסו שוב' },
      { status: 500 },
    )
  }
}
