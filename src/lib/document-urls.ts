/**
 * Build a clean filename for Sanity CDN uploads.
 * Pattern: {clientName}_{docType}_{date}.{ext}
 * Example: "יוסי-כהן_תעודת-התאגדות_2026-04-26.pdf"
 */
export function buildDocFilename(
  clientName: string,
  docLabel: string,
  originalFilename: string,
): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'pdf'
  const date = new Date().toISOString().split('T')[0]
  const cleanClient = clientName.replace(/\s+/g, '-').replace(/[/"']/g, '')
  const cleanDoc = docLabel.replace(/\s+/g, '-').replace(/[/"']/g, '')
  return `${cleanClient}_${cleanDoc}_${date}.${ext}`
}

/**
 * Build a compact display line for Summit הערות.
 * Pattern: "📄 {docLabel}: {shortUrl}"
 */
export function buildSummitNoteEntry(docLabel: string, url: string): string {
  return `📄 ${docLabel}: ${url}`
}
