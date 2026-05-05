/**
 * Hebrew smart-relative date formatter.
 *
 * Returns:
 *  - "היום" for same day
 *  - "אתמול" for 1 day ago
 *  - "לפני יומיים" / "לפני N ימים" for 2-6 days
 *  - "לפני שבוע" / "לפני שבועיים" / "לפני N שבועות" for 7-29 days
 *  - "לפני חודש" for 30-59 days
 *  - Absolute Hebrew date (e.g. "12 במרץ 2026") for 60+ days
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

export function formatRelativeHebrew(iso?: string | null, now: Date = new Date()): string {
  if (!iso) return ''

  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  // Normalize both to UTC-midnight to avoid DST/timezone-shift inflation
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.floor((startOfDay(now) - startOfDay(then)) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'היום'
  if (diffDays === 1) return 'אתמול'
  if (diffDays === 2) return 'לפני יומיים'
  if (diffDays < 7) return `לפני ${diffDays} ימים`

  const weeks = Math.floor(diffDays / 7)
  if (weeks === 1) return 'לפני שבוע'
  if (weeks === 2) return 'לפני שבועיים'
  if (diffDays < 30) return `לפני ${weeks} שבועות`

  if (diffDays < 60) return 'לפני חודש'

  // Absolute Hebrew date
  const day = then.getDate()
  const month = HEBREW_MONTHS[then.getMonth()]
  const year = then.getFullYear()
  return `${day} ב${month} ${year}`
}
