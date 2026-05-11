/**
 * Generate visually-honest tick labels for a slider with range [min, max].
 *
 * Guarantees:
 *  - First tick === min (exact)
 *  - Last tick === max (exact)
 *  - Middle ticks are at "nice" round values close to their proportional
 *    quartile positions
 *  - Strictly increasing, no duplicates
 *  - 2 to ~6 ticks (typically 5)
 *
 * This is the structural fix for the recurring "slider axis lies about the
 * range" bug — callers no longer pass hardcoded tick arrays that drift out of
 * sync with the slider's actual min/max.
 */
export function generateNiceTicks(
  min: number,
  max: number,
  count: number = 5,
): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [min, max]
  if (max <= min) return [min]
  if (count < 2) return [max]

  const range = max - min
  const wantInteger = Number.isInteger(min) && Number.isInteger(max)
  let step = niceStep(range / (count - 1))
  // For integer-only ranges, never use sub-unit steps
  if (wantInteger && step < 1) step = 1
  if (wantInteger && !Number.isInteger(step)) step = Math.ceil(step)

  const ticks: number[] = [min]
  for (let i = 1; i < count - 1; i++) {
    const raw = min + (range * i) / (count - 1)
    let snapped = Math.round(raw / step) * step
    // Restore integer purity for integer ranges (floating point drift)
    if (wantInteger) snapped = Math.round(snapped)
    const last = ticks[ticks.length - 1]
    if (snapped > last && snapped < max) {
      ticks.push(snapped)
    }
  }
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}

/**
 * Round a positive number to the nearest "nice" value of the form 1*10^n,
 * 2.5*10^n, 5*10^n, or 10*10^n. Used to pick a clean tick step.
 */
function niceStep(rough: number): number {
  if (rough === 0) return 1
  const sign = rough < 0 ? -1 : 1
  const abs = Math.abs(rough)
  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)))
  const normalized = abs / magnitude // in [1, 10)
  let nice: number
  if (normalized <= 1.5) nice = 1
  else if (normalized <= 3) nice = 2.5
  else if (normalized <= 7) nice = 5
  else nice = 10
  return sign * nice * magnitude
}

/**
 * Compact currency formatter for tick labels. Renders K/M suffixes so 5 axis
 * labels stay short on mobile RTL layouts. Tiered precision keeps labels
 * honest for small ranges (where rounding to nearest K would lie by >5%)
 * while staying compact at large scale:
 *   50,000    → "50K"      (exact K, integer)
 *   1,500     → "1.5K"     (< 100K, keep 1 decimal — fixes נסיעות display)
 *   12,500    → "12.5K"    (< 100K, keep 1 decimal)
 *   596,860   → "597K"     (≥ 100K, round — drift ~0.02% is acceptable)
 *   2,500,000 → "2.5M"
 *   999       → "999"      (no suffix below 1K)
 */
export function formatCompactCurrency(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    const m = n / 1_000_000
    return `${Number(m.toFixed(1))}M`.replace(/\.0M$/, 'M')
  }
  if (abs >= 1000) {
    const k = n / 1000
    if (Number.isInteger(k)) return `${k}K`
    if (abs < 100_000) return `${k.toFixed(1)}K`
    return `${Math.round(k)}K`
  }
  return String(Math.round(n))
}
