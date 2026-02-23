/**
 * Single source of truth for the site's base URL.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env var (set this in production)
 * 2. RAILWAY_PUBLIC_DOMAIN (auto-injected by Railway)
 * 3. localhost fallback for local dev
 *
 * When connecting a custom domain, set NEXT_PUBLIC_SITE_URL=https://yourdomain.co.il
 * in your Railway (or hosting) environment variables.
 */

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }

  return 'http://localhost:3000'
}

export const SITE_URL = getSiteUrl()
