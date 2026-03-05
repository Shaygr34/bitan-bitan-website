import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { getSiteSettings, getArticles, getHomePage } from '@/sanity/queries'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: Basic Sanity fetch (no next.revalidate)
  try {
    const count = await client.fetch('count(*[_type == "article"])')
    results.basicFetch = { ok: true, articleCount: count }
  } catch (err) {
    results.basicFetch = { ok: false, error: String(err) }
  }

  // Test 2: getSiteSettings (uses sanityFetch with next.revalidate)
  try {
    const settings = await getSiteSettings()
    results.siteSettings = { ok: true, hasSettings: !!settings, siteName: settings?.siteName }
  } catch (err) {
    results.siteSettings = { ok: false, error: String(err), stack: err instanceof Error ? err.stack : undefined }
  }

  // Test 3: getArticles
  try {
    const articles = await getArticles()
    results.articles = { ok: true, count: articles?.length }
  } catch (err) {
    results.articles = { ok: false, error: String(err), stack: err instanceof Error ? err.stack : undefined }
  }

  // Test 4: getHomePage
  try {
    const home = await getHomePage()
    results.homePage = { ok: true, hasData: !!home, headline: home?.heroHeadline }
  } catch (err) {
    results.homePage = { ok: false, error: String(err), stack: err instanceof Error ? err.stack : undefined }
  }

  // Test 5: Filesystem writability
  try {
    const nextDir = path.join(process.cwd(), '.next')
    const cacheDir = path.join(nextDir, 'cache')
    const testFile = path.join(nextDir, '__test_write__')

    results.filesystem = {
      cwd: process.cwd(),
      nextDirExists: fs.existsSync(nextDir),
      cacheDirExists: fs.existsSync(cacheDir),
      uid: process.getuid?.(),
      gid: process.getgid?.(),
    }

    // Try writing a file
    try {
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      results.filesystem = { ...results.filesystem as Record<string, unknown>, writable: true }
    } catch (writeErr) {
      results.filesystem = { ...results.filesystem as Record<string, unknown>, writable: false, writeError: String(writeErr) }
    }

    // Try creating cache dir
    if (!fs.existsSync(cacheDir)) {
      try {
        fs.mkdirSync(cacheDir, { recursive: true })
        results.filesystem = { ...results.filesystem as Record<string, unknown>, cacheCreated: true }
      } catch (mkdirErr) {
        results.filesystem = { ...results.filesystem as Record<string, unknown>, cacheCreated: false, mkdirError: String(mkdirErr) }
      }
    }
  } catch (err) {
    results.filesystem = { ok: false, error: String(err) }
  }

  // Test 6: Env vars
  results.env = {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'MISSING',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'MISSING',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'MISSING',
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN ?? 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json(results)
}
