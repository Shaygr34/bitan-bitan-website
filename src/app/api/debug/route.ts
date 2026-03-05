import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'

export async function GET() {
  try {
    const settings = await client.fetch('*[_type == "siteSettings"][0]{ _id, siteName }')
    const articleCount = await client.fetch('count(*[_type == "article"])')
    return NextResponse.json({
      ok: true,
      settings,
      articleCount,
      env: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'MISSING',
        NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'MISSING',
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 })
  }
}
