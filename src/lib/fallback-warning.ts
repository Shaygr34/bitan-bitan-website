/**
 * Logs a warning in development when fallback data is used instead of CMS content.
 * Silent in production.
 */
export function warnFallback(pageName: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[Fallback] ${pageName}: using hardcoded fallback data. Check that Sanity CMS has content for this page.`
    )
  }
}
