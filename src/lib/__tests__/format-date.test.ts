import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatHebrewDate } from '../format-date'

describe('formatHebrewDate', () => {
  it('returns empty string for missing input', () => {
    assert.equal(formatHebrewDate(undefined), '')
    assert.equal(formatHebrewDate(null), '')
    assert.equal(formatHebrewDate(''), '')
  })

  it('returns empty string for invalid input', () => {
    assert.equal(formatHebrewDate('not-a-date'), '')
  })

  it('formats month/day/year in Hebrew (March)', () => {
    assert.equal(formatHebrewDate('2026-03-06T12:00:00Z'), '6 במרץ 2026')
  })

  it('formats May correctly', () => {
    assert.equal(formatHebrewDate('2025-05-05T12:00:00Z'), '5 במאי 2025')
  })

  it('formats all 12 months with correct Hebrew names', () => {
    const months = [
      ['2026-01-15T12:00:00Z', '15 בינואר 2026'],
      ['2026-02-10T12:00:00Z', '10 בפברואר 2026'],
      ['2026-03-01T12:00:00Z', '1 במרץ 2026'],
      ['2026-04-20T12:00:00Z', '20 באפריל 2026'],
      ['2026-05-05T12:00:00Z', '5 במאי 2026'],
      ['2026-06-30T12:00:00Z', '30 ביוני 2026'],
      ['2026-07-04T12:00:00Z', '4 ביולי 2026'],
      ['2026-08-18T12:00:00Z', '18 באוגוסט 2026'],
      ['2026-09-09T12:00:00Z', '9 בספטמבר 2026'],
      ['2026-10-31T12:00:00Z', '31 באוקטובר 2026'],
      ['2026-11-11T12:00:00Z', '11 בנובמבר 2026'],
      ['2026-12-25T12:00:00Z', '25 בדצמבר 2026'],
    ] as const
    for (const [iso, expected] of months) {
      assert.equal(formatHebrewDate(iso), expected)
    }
  })
})
