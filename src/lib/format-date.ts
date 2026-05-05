/**
 * Hebrew absolute date formatter.
 *
 * Returns dates like "12 במרץ 2026". Empty string for missing/invalid input.
 */

const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

export function formatHebrewDate(iso?: string | null): string {
  if (!iso) return ''

  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const day = d.getDate()
  const month = HEBREW_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ב${month} ${year}`
}
