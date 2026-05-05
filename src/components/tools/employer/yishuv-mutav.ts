/**
 * Yishuv Mutav (יישוב מוטב) — Tax Credits 2026
 *
 * 488 settlements with rate (7%-20%) and annual income cap.
 * Source: לוח ניכויים חודשי 2026, pages 20-32 (booklet PDF, April 2026).
 *
 * Per Ron (April 30, 2026):
 *   monthlyCap = annualCap / 12
 *   eligibleSalary = min(grossSalary, monthlyCap)
 *   yishuvCredit = eligibleSalary × ratePct%
 *
 * The credit reduces the employee's monthly income tax (separate "זיכוי
 * יישוב מוטב" line per Ron #43 display spec — not added to credit points).
 */

import yishuvData from './yishuv-mutav-2026.json'

export type YishuvMutav = {
  name: string
  ratePct: number   // 7, 10, 12, 14, 18, 20
  annualCap: number // ₪/year
}

export const YISHUV_MUTAV_LIST: YishuvMutav[] = yishuvData as YishuvMutav[]

const yishuvByName: Map<string, YishuvMutav> = new Map(
  YISHUV_MUTAV_LIST.map(y => [y.name, y]),
)

/**
 * Look up a yishuv mutav by exact Hebrew name. Returns null if not found
 * or if name is null/empty (the "no yishuv" case).
 */
export function findYishuv(name: string | null | undefined): YishuvMutav | null {
  if (!name) return null
  return yishuvByName.get(name) ?? null
}

/**
 * Calculate the monthly יישוב מוטב tax credit for a given salary.
 * Returns 0 if no yishuv selected or yishuv not found.
 */
export function calculateYishuvCredit(
  grossSalary: number,
  yishuvName: string | null | undefined,
): number {
  const yishuv = findYishuv(yishuvName)
  if (!yishuv) return 0
  const monthlyCap = yishuv.annualCap / 12
  const eligibleSalary = Math.min(grossSalary, monthlyCap)
  return Math.round(eligibleSalary * (yishuv.ratePct / 100))
}
