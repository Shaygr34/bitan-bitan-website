import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateNiceTicks, formatCompactCurrency } from '../nice-ticks'

describe('generateNiceTicks', () => {
  describe('basic guarantees', () => {
    it('first tick equals min, last tick equals max', () => {
      const ticks = generateNiceTicks(50000, 596860)
      assert.equal(ticks[0], 50000)
      assert.equal(ticks[ticks.length - 1], 596860)
    })

    it('ticks are strictly increasing', () => {
      const ticks = generateNiceTicks(0, 72)
      for (let i = 1; i < ticks.length; i++) {
        assert.ok(ticks[i] > ticks[i - 1], `tick ${ticks[i]} not > ${ticks[i - 1]}`)
      }
    })

    it('produces between 2 and 6 ticks', () => {
      const ticks = generateNiceTicks(0, 100)
      assert.ok(ticks.length >= 2 && ticks.length <= 6)
    })
  })

  describe('currency ranges', () => {
    it('car price 50K-596,860 returns nice K values', () => {
      const ticks = generateNiceTicks(50000, 596860)
      // Expect roughly [50K, 200K, 300K, 500K, 597K]
      assert.equal(ticks[0], 50000)
      assert.equal(ticks[ticks.length - 1], 596860)
      // Middle ticks should be multiples of 100K
      for (let i = 1; i < ticks.length - 1; i++) {
        assert.equal(ticks[i] % 100000, 0, `${ticks[i]} not multiple of 100K`)
      }
    })

    it('income 5K-60K returns nice K values', () => {
      const ticks = generateNiceTicks(5000, 60000)
      assert.equal(ticks[0], 5000)
      assert.equal(ticks[ticks.length - 1], 60000)
      // Middle ticks should be multiples of 10K
      for (let i = 1; i < ticks.length - 1; i++) {
        assert.equal(ticks[i] % 10000, 0)
      }
    })

    it('maintenance 1K-15K covers full range', () => {
      const ticks = generateNiceTicks(1000, 15000)
      assert.equal(ticks[0], 1000)
      assert.equal(ticks[ticks.length - 1], 15000)
    })

    it('fuel 300-5000 covers Ron-requested 5K leftmost', () => {
      const ticks = generateNiceTicks(300, 5000)
      assert.equal(ticks[0], 300)
      assert.equal(ticks[ticks.length - 1], 5000)
    })
  })

  describe('percentage ranges', () => {
    it('0-100% returns clean quartiles', () => {
      const ticks = generateNiceTicks(0, 100)
      assert.deepEqual(ticks, [0, 25, 50, 75, 100])
    })

    it('financial leasing downpayment 0-50% covers full range', () => {
      const ticks = generateNiceTicks(0, 50)
      assert.equal(ticks[0], 0)
      assert.equal(ticks[ticks.length - 1], 50)
    })

    it('residual 10-60% covers Ron-requested 60% selection', () => {
      const ticks = generateNiceTicks(10, 60)
      assert.equal(ticks[0], 10)
      assert.equal(ticks[ticks.length - 1], 60)
    })

    it('operational downpayment 0-30% covers full range', () => {
      const ticks = generateNiceTicks(0, 30)
      assert.equal(ticks[0], 0)
      assert.equal(ticks[ticks.length - 1], 30)
    })
  })

  describe('integer ranges', () => {
    it('children 0-10 produces integer ticks', () => {
      const ticks = generateNiceTicks(0, 10)
      assert.equal(ticks[0], 0)
      assert.equal(ticks[ticks.length - 1], 10)
      for (const t of ticks) {
        assert.ok(Number.isInteger(t), `${t} not integer`)
      }
    })

    it('months 12-72 covers Ron-requested 72 max', () => {
      const ticks = generateNiceTicks(12, 72)
      assert.equal(ticks[0], 12)
      assert.equal(ticks[ticks.length - 1], 72)
    })

    it('reserve days 50-110 covers full range', () => {
      const ticks = generateNiceTicks(50, 110)
      assert.equal(ticks[0], 50)
      assert.equal(ticks[ticks.length - 1], 110)
    })
  })

  describe('fractional / negative ranges (interest offset)', () => {
    it('interest spread -1 to 4.5 produces sensible ticks', () => {
      const ticks = generateNiceTicks(-1, 4.5)
      assert.equal(ticks[0], -1)
      assert.equal(ticks[ticks.length - 1], 4.5)
      // Should include 0 or values around it
      assert.ok(ticks.some((t) => Math.abs(t) <= 1))
    })
  })

  describe('edge cases', () => {
    it('returns [min] when max <= min', () => {
      assert.deepEqual(generateNiceTicks(50, 50), [50])
      assert.deepEqual(generateNiceTicks(100, 50), [100])
    })

    it('handles count < 2 by returning single tick', () => {
      const ticks = generateNiceTicks(0, 100, 1)
      assert.equal(ticks.length, 1)
    })

    it('handles non-finite inputs gracefully', () => {
      const ticks = generateNiceTicks(NaN, 100)
      assert.ok(Array.isArray(ticks))
    })
  })
})

describe('formatCompactCurrency', () => {
  it('formats thousands with K suffix', () => {
    assert.equal(formatCompactCurrency(50000), '50K')
    assert.equal(formatCompactCurrency(150000), '150K')
    assert.equal(formatCompactCurrency(596860), '597K')
  })

  it('formats millions with M suffix', () => {
    assert.equal(formatCompactCurrency(1000000), '1M')
    assert.equal(formatCompactCurrency(2500000), '2.5M')
  })

  it('passes through small numbers unchanged', () => {
    assert.equal(formatCompactCurrency(500), '500')
    assert.equal(formatCompactCurrency(0), '0')
    assert.equal(formatCompactCurrency(999), '999')
  })

  it('handles fractional thousands', () => {
    assert.equal(formatCompactCurrency(1500), '2K') // rounds to nearest K
    assert.equal(formatCompactCurrency(1400), '1K')
  })
})
