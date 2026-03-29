import { NextResponse } from 'next/server'

export async function GET() {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || ''
  const apiToken = process.env.SANITY_API_TOKEN || ''
  const used = writeToken || apiToken

  return NextResponse.json({
    hasWriteToken: !!writeToken,
    hasApiToken: !!apiToken,
    usedTokenPrefix: used ? used.substring(0, 8) + '...' : 'NONE',
    summitCompanyId: process.env.SUMMIT_COMPANY_ID || 'NOT SET',
    hasSummitApiKey: !!process.env.SUMMIT_API_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY,
  })
}
