import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

/** POST /api/intake/track — mark a token as "opened" when the client loads the form */
export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string }
    if (!token) return NextResponse.json({ ok: false }, { status: 400 })

    const doc = await writeClient.fetch<{ _id: string; status: string } | null>(
      `*[_type == "intakeToken" && token == $tokenValue][0]{ _id, status }`,
      { tokenValue: token },
      { cache: 'no-store' },
    )

    // Only update pending → opened (don't overwrite completed)
    if (doc && doc.status === 'pending') {
      await writeClient.patch(doc._id).set({ status: 'opened' }).commit()
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
