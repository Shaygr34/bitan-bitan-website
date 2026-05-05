import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatRelativeHebrew } from '../format-date'

const NOW = new Date('2026-05-05T10:00:00+03:00')

const daysAgo = (n: number) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

describe('formatRelativeHebrew', () => {
  it('returns empty string for missing input', () => {
    assert.equal(formatRelativeHebrew(undefined, NOW), '')
    assert.equal(formatRelativeHebrew(null, NOW), '')
    assert.equal(formatRelativeHebrew('', NOW), '')
  })

  it('היום for same day', () => {
    assert.equal(formatRelativeHebrew(NOW.toISOString(), NOW), 'היום')
    assert.equal(formatRelativeHebrew(daysAgo(0), NOW), 'היום')
  })

  it('אתמול for 1 day ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(1), NOW), 'אתמול')
  })

  it('לפני N ימים for 2-6 days ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(2), NOW), 'לפני יומיים')
    assert.equal(formatRelativeHebrew(daysAgo(3), NOW), 'לפני 3 ימים')
    assert.equal(formatRelativeHebrew(daysAgo(6), NOW), 'לפני 6 ימים')
  })

  it('לפני שבוע for 7-13 days ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(7), NOW), 'לפני שבוע')
    assert.equal(formatRelativeHebrew(daysAgo(13), NOW), 'לפני שבוע')
  })

  it('לפני שבועיים for 14-20 days ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(14), NOW), 'לפני שבועיים')
    assert.equal(formatRelativeHebrew(daysAgo(20), NOW), 'לפני שבועיים')
  })

  it('לפני N שבועות for 21-29 days ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(21), NOW), 'לפני 3 שבועות')
    assert.equal(formatRelativeHebrew(daysAgo(28), NOW), 'לפני 4 שבועות')
  })

  it('לפני חודש for 30-59 days ago', () => {
    assert.equal(formatRelativeHebrew(daysAgo(30), NOW), 'לפני חודש')
    assert.equal(formatRelativeHebrew(daysAgo(45), NOW), 'לפני חודש')
    assert.equal(formatRelativeHebrew(daysAgo(59), NOW), 'לפני חודש')
  })

  it('absolute Hebrew date for >= 60 days ago', () => {
    // 60 days before May 5, 2026 = March 6, 2026
    assert.equal(formatRelativeHebrew(daysAgo(60), NOW), '6 במרץ 2026')
    // 365 days before = May 5, 2025
    assert.equal(formatRelativeHebrew(daysAgo(365), NOW), '5 במאי 2025')
  })

  it('handles future dates as "היום"', () => {
    // Edge case — published timestamp in the future. Treat as today, never negative.
    const future = new Date(NOW.getTime() + 60 * 60 * 1000).toISOString()
    assert.equal(formatRelativeHebrew(future, NOW), 'היום')
  })

  it('uses real "now" when not provided', () => {
    const today = new Date().toISOString()
    assert.equal(formatRelativeHebrew(today), 'היום')
  })
})
