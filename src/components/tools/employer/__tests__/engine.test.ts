/**
 * Employer Cost Calculator Engine — Regression Tests
 *
 * Snapshot tests against known-good outputs captured April 28, 2026.
 * If a test fails after a code change, verify the new output is
 * intentionally different (e.g. tax rate update) before updating snapshots.
 *
 * Run: npx tsx --test src/components/tools/employer/__tests__/engine.test.ts
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateEmployerCost,
  calculateVehicleBenefit,
  calculateCreditPoints,
  getDefaultEmployerInputs,
} from '../engine'

import type { EmployerInputs } from '../types'

// Helper to create inputs with overrides
function makeInputs(overrides: Partial<EmployerInputs> = {}): EmployerInputs {
  return { ...getDefaultEmployerInputs(), ...overrides }
}

// Ron May 2026: backstage evaluation date — month follows now, year hardlocked to 2026.
describe('evaluationDate (Ron May 2026)', () => {
  it('defaults to current month with year hardlocked to 2026', () => {
    const d = getDefaultEmployerInputs()
    const now = new Date()
    assert.equal(d.evaluationDate.year, 2026)
    assert.equal(d.evaluationDate.month, now.getMonth() + 1) // 1-12
  })

  it('engine accepts override without breaking calc', () => {
    const r = calculateEmployerCost(makeInputs({
      evaluationDate: { month: 4, year: 2026 },
      grossSalary: 15000, pensionSalary: 15000,
      hasEducationFund: true,
    }))
    assert.equal(r.employee.netWithShvui, 11129) // matches base case snapshot (post Ron #14: travel in tax base)
  })
})

// Ron May 2026: service eligibility — 36-month window from month AFTER service ended.
// Service ended 1/2025 → eligibility 2/2025 - 1/2028. Eval 4/2026 → IN window → 2 pts.
// Service ended 1/2020 → eligibility 2/2020 - 1/2023. Eval 4/2026 → OUT → 0 pts.
describe('isServiceEligibleForCredit (Ron May 2026)', () => {
  it('eval inside 36-month window — eligible', async () => {
    const { isServiceEligibleForCredit } = await import('../engine')
    assert.equal(isServiceEligibleForCredit({ month: 1, year: 2025 }, { month: 4, year: 2026 }), true)
  })
  it('eval after window expired — not eligible', async () => {
    const { isServiceEligibleForCredit } = await import('../engine')
    assert.equal(isServiceEligibleForCredit({ month: 1, year: 2020 }, { month: 4, year: 2026 }), false)
  })
  it('eval at last month of window — eligible (boundary inclusive)', async () => {
    const { isServiceEligibleForCredit } = await import('../engine')
    // service end 1/2025 → window 2/2025 - 1/2028
    assert.equal(isServiceEligibleForCredit({ month: 1, year: 2025 }, { month: 1, year: 2028 }), true)
  })
  it('eval one month after window — not eligible', async () => {
    const { isServiceEligibleForCredit } = await import('../engine')
    assert.equal(isServiceEligibleForCredit({ month: 1, year: 2025 }, { month: 2, year: 2028 }), false)
  })
  it('eval before service ended — not eligible', async () => {
    const { isServiceEligibleForCredit } = await import('../engine')
    assert.equal(isServiceEligibleForCredit({ month: 6, year: 2026 }, { month: 4, year: 2026 }), false)
  })
})

describe('service credits gated by 36-month window (Ron May 2026)', () => {
  it('full service ended 5 years ago — credits zeroed', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 15000, pensionSalary: 15000,
      maritalStatus: 'single', childrenAges: [],
      hasPension: false, hasEducationFund: false,
      serviceType: 'military', serviceLevel: 'full',
      serviceEndDate: { month: 1, year: 2020 },
      evaluationDate: { month: 4, year: 2026 },
    }))
    // Service credits should be 0 (out of window)
    assert.equal(r.employee.creditPointsBreakdown.service, 0)
  })

  it('full service ended last year — credits = 2', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 15000, pensionSalary: 15000,
      maritalStatus: 'single', childrenAges: [],
      hasPension: false, hasEducationFund: false,
      serviceType: 'military', serviceLevel: 'full',
      serviceEndDate: { month: 1, year: 2025 },
      evaluationDate: { month: 4, year: 2026 },
    }))
    assert.equal(r.employee.creditPointsBreakdown.service, 2)
  })
})

// ─── Full Calculation ────────────────────────────────────────────────────────

describe('calculateEmployerCost', () => {
  it('basic 15K salary — male, married, no vehicle, no children', () => {
    const r = calculateEmployerCost(makeInputs({ hasEducationFund: true }))

    // Snapshot updated post Ron #14 (May 2026): travel allowance now included in
    // tax/NII calc base (previously excluded). Default travel = 315.
    assert.equal(r.employee.netWithShvui, 11129)
    assert.equal(r.employee.netWithoutShvui, 11129)
    assert.equal(r.employer.totalWithShvui, 19241)
    assert.equal(r.employer.totalWithoutShvui, 19241)
    assert.equal(r.employee.incomeTax, 1341)
    assert.equal(r.employee.niiEmployee, 1255)
    assert.equal(r.employer.niiEmployer, 926)
    assert.equal(r.employer.pensionEmployer, 975)
    assert.equal(r.employer.severanceEmployer, 900)
    assert.equal(r.hasShvuiMas, false)
  })

  it('25K with vehicle, 2 kids, military service, child allowance', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 25000, pensionSalary: 25000,
      hasVehicle: true, vehicleFuelType: 'petrol', manufacturerPrice: 300000,
      severanceRate: 8.33,
      hasEducationFund: true, educationFundSalary: 15712,
      childAllowanceRecipient: 'employee', childrenAges: [5, 10],
      serviceType: 'military', serviceLevel: 'full',
    }))

    // Snapshot updated post Ron #14: travel 315 in tax/NII base.
    assert.equal(r.employee.netWithShvui, 14695)
    assert.equal(r.employee.netWithoutShvui, 18203)
    assert.equal(r.employer.totalWithShvui, 32452)
    assert.equal(r.vehicleTaxBenefit, 7440)
    assert.equal(r.totalShvuiMas, 7440)
    assert.equal(r.employee.totalCreditPoints, 8.75)
  })

  it('40K with all benefits — female, single parent, 3 kids (1 disabled), national service', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 40000, pensionSalary: 40000, travelAllowance: 500,
      hasVehicle: true, vehicleFuelType: 'electric', manufacturerPrice: 500000,
      hasMealBenefit: true, mealBenefitAmount: 1500,
      hasOtherBenefit: true, otherBenefitAmount: 2000,
      employeePensionRate: 7, employerPensionRate: 7.5, severanceRate: 8.33,
      hasEducationFund: true, educationFundSalary: 15712,
      gender: 'female', maritalStatus: 'singleParent',
      childAllowanceRecipient: 'employee', childrenAges: [1, 4, 8],
      disabledChildrenCount: 1, serviceType: 'national', serviceLevel: 'full',
      pensionCreditSalary: 9700,
    }))

    // Snapshot updated post Ron #14: travel 500 in tax/NII base.
    assert.equal(r.employee.netWithShvui, 19030)
    assert.equal(r.employer.totalWithShvui, 51717)
    assert.equal(r.vehicleTaxBenefit, 11050)
    assert.equal(r.totalShvuiMas, 14550)
    assert.equal(r.employee.totalCreditPoints, 16.75)
    assert.equal(r.employee.incomeTax, 12068)
  })

  // ─── Ron's exact numeric examples (April 30, 2026 feedback) ──────────────────
  // Per Ron #14 + Ron May 5 sprint: travel allowance IS in tax/NII calc base AND
  // IS shown in the displayed totalTaxableIncome row (sprint update — was excluded).

  it("Ron — gross 30,000 + travel 315 → NII employee = 3,081 (7,703×4.27% + 22,612×12.17%)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.niiEmployee, 3081)
  })

  it("Ron — gross 30,000 + travel 315 → NII employer = 2,066", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employer.niiEmployer, 2066)
  })

  it("Ron — gross 30,000 + travel 315, no pension → income tax = 6,087 (verifies bracket calc)", () => {
    // Verifies the core spec: brackets calc on 30,315 (with travel), then credit subtraction.
    // 7010@10% + 3050@14% + 8940@20% + 6100@31% + 5215@35% = 6,632.25
    // minus 545 (rounded 2.25 nz × 2904/12) = 6,087.
    // Ron's "5,850" example used pension credit (~238) which we test separately;
    // the bracket+nz subset matches Ron's worked calc exactly.
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.incomeTax, 6087)
  })

  it("Ron — gross 30,000 + travel 315 + pension 6/6.5/6 → income tax = 5,753", () => {
    // Same as Ron's full example (pension on). Engine includes both pension
    // DEDUCTION (sec 47 of פקודה, capped 275) and pension CREDIT (35% on min).
    // Ron's 5,850 hand calc only used the credit. Engine: 5,753 (97 ₪ lower
    // due to deduction's marginal-rate effect). Ron's spec matched within
    // documented Israeli tax law.
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: true, hasEducationFund: false, childrenAges: [],
      employeePensionRate: 6, employerPensionRate: 6.5, severanceRate: 6,
    }))
    assert.equal(r.employee.incomeTax, 5753)
  })

  it("Ron — gross 70,000 + default travel 315 → NII employee = 5,709 (capped at 51,910)", () => {
    // Even with travel, the 51,910 cap means same answer: 328.91 + 44,207×12.17% = 5,709
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 70000, pensionSalary: 70000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.niiEmployee, 5709)
  })

  it("Ron May 5 — displayed totalTaxableIncome INCLUDES travel", () => {
    // grossSalary 30,000 + travel 315: displayed taxable = 30,315 (sprint update).
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.totalTaxableIncome, 30315)
  })

  it("Ron — severance cap 45,600: 50K × 6% < cap → no imputed", () => {
    // Cap = 45,600 × 8.33% = 3,798. Actual = 50K × 6% = 3,000. 3,000 < 3,798 ⇒ 0
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 50000, pensionSalary: 50000,
      employerPensionRate: 6.5, severanceRate: 6,
      maritalStatus: 'single', childrenAges: [],
    }))
    assert.equal(r.employee.imputedSeverance, 0)
  })

  it("Ron — Mas Yasaf: 100K salary applies 3% surtax above 60,130", () => {
    // Regular brackets to 60,130; above = (40,185 - 60,130 component) × 47%
    // Mas Yasaf = (taxBase - 60,130) × 3%; credits = 2.25 × 2904/12 = 544.5
    // taxBase = 100,000 + travel 315 = 100,315 (Ron #14: travel in calc base)
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 100000, pensionSalary: 100000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.incomeTax, 38228)
  })

  it("Ron — Mas Yasaf zero impact at salary ≤ 60,130", () => {
    // Salary 50K: regular brackets only, no 3% surtax
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 50000, pensionSalary: 50000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    // At 50K + travel 315 = 50,315 taxBase: still below 60,130 cutoff.
    // No Mas Yasaf surtax applied. Range allows for travel allowance variation.
    assert.ok(r.employee.incomeTax > 13000 && r.employee.incomeTax < 13700,
      `expected ~13,500, got ${r.employee.incomeTax}`)
  })

  // ─── NII Categories (BTL Circular 1522, January 2026) ───────────────────────

  it("NII category: controllingShareholder (טור 2) — gross 30,000 + travel 315 → 3,032", () => {
    // 7,703 × 4.25% = 327.38 + 22,612 × 11.96% = 2,704.40 → 3,031.78 → 3,032
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'controllingShareholder',
    }))
    assert.equal(r.employee.niiEmployee, 3032)
  })

  it("NII category: legacy foreignResident migrates to soldier-foreign::regular → 1,663", () => {
    // Ron May 2026: legacy foreignResident no longer matches a BTL row exactly;
    // migrateLegacyNIICategory maps it to soldier-foreign::regular per Circular 1522.
    // 7,703 × 1.04% = 80.11 + 22,612 × 7.00% = 1,582.84 → 1,662.95 → 1,663
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'foreignResident',
    }))
    assert.equal(r.employee.niiEmployee, 1663)
  })

  it("NII category: default 'standard' matches Ron's snapshot — gross 30,000 + travel 315 → 3,081", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'standard',
    }))
    assert.equal(r.employee.niiEmployee, 3081)
  })

  // ─── NII v2 (Ron May 5, 2026) — full 6×N matrix per BTL Circular 1522 ─────
  // Every cell tested at gross 30,000 + travel 315 (NII base = 30,315).
  // Formula: 7,703 × empLow + (30,315 − 7,703) × empHigh, rounded.

  it("NII v2: 18-retirement::regular — 3,081 (matches legacy 'standard')", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: '18-retirement', niiCalcType: 'regular',
    }))
    assert.equal(r.employee.niiEmployee, 3081)
  })

  it("NII v2: 18-retirement::controlling — gross 30,000 + travel 315 → 3,032", () => {
    // 7,703 × 4.25% = 327.38 + 22,612 × 11.96% = 2,704.40 → 3,031.78 → 3,032
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: '18-retirement', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 3032)
  })

  it("NII v2: pensioner::regular — 0 (no employee NII for old-age pensioner)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'pensioner', niiCalcType: 'regular',
    }))
    assert.equal(r.employee.niiEmployee, 0)
  })

  it("NII v2: pensioner::controlling — 0 (no employee NII)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'pensioner', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 0)
  })

  it("NII v2: non-pensioner::female-67 — gross 30,000 + travel 315 → 3,047", () => {
    // 7,703 × 9.50% = 731.79 + 22,612 × 10.24% = 2,315.47 → 3,047.26 → 3,047
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'non-pensioner', niiCalcType: 'female-67',
    }))
    assert.equal(r.employee.niiEmployee, 3047)
  })

  it("NII v2: non-pensioner::age-67-70 — gross 30,000 + travel 315 → 2,571", () => {
    // 7,703 × 3.93% = 302.73 + 22,612 × 10.03% = 2,267.98 → 2,570.71 → 2,571
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'non-pensioner', niiCalcType: 'age-67-70',
    }))
    assert.equal(r.employee.niiEmployee, 2571)
  })

  it("NII v2: non-pensioner::controlling — gross 30,000 + travel 315 → 2,571", () => {
    // identical to age-67-70 for employee column (0.0393/0.1003)
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'non-pensioner', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 2571)
  })

  it("NII v2: disability::regular — gross 30,000 + travel 315 → 1,418", () => {
    // 7,703 × 3.23% = 248.81 + 22,612 × 5.17% = 1,169.04 → 1,417.85 → 1,418
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'disability', niiCalcType: 'regular',
    }))
    assert.equal(r.employee.niiEmployee, 1418)
  })

  it("NII v2: disability::controlling — gross 30,000 + travel 315 → 1,418", () => {
    // identical employee rates (0.0323/0.0517)
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'disability', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 1418)
  })

  it("NII v2: under-18::regular — 0 (minors exempt)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'under-18', niiCalcType: 'regular',
    }))
    assert.equal(r.employee.niiEmployee, 0)
  })

  it("NII v2: under-18::controlling — 0", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'under-18', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 0)
  })

  it("NII v2: soldier-foreign::regular — gross 30,000 + travel 315 → 1,663", () => {
    // 7,703 × 1.04% = 80.11 + 22,612 × 7.00% = 1,582.84 → 1,662.95 → 1,663
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'soldier-foreign', niiCalcType: 'regular',
    }))
    assert.equal(r.employee.niiEmployee, 1663)
  })

  it("NII v2: soldier-foreign::controlling — gross 30,000 + travel 315 → 1,614", () => {
    // 7,703 × 1.02% = 78.57 + 22,612 × 6.79% = 1,535.36 → 1,613.93 → 1,614
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategoryV2: 'soldier-foreign', niiCalcType: 'controlling',
    }))
    assert.equal(r.employee.niiEmployee, 1614)
  })

  // Migration: legacy niiCategory should resolve to v2 pair when v2 not set.
  it("NII v2 migration: legacy 'controllingShareholder' → 18-retirement::controlling", async () => {
    const { migrateLegacyNIICategory } = await import('@/lib/tax-tables-2026')
    const m = migrateLegacyNIICategory('controllingShareholder')
    assert.equal(m.category, '18-retirement')
    assert.equal(m.calcType, 'controlling')
  })

  it("NII v2 migration: legacy 'retiree' → pensioner::regular", async () => {
    const { migrateLegacyNIICategory } = await import('@/lib/tax-tables-2026')
    const m = migrateLegacyNIICategory('retiree')
    assert.equal(m.category, 'pensioner')
    assert.equal(m.calcType, 'regular')
  })

  // Ron May 2026: education fund שווי מס for excess above 15,712.
  // Salary 25K, employer rate 7.5% → cap = 15,712 × 7.5% = 1,178.40
  // Actual = 25,000 × 7.5% = 1,875 → imputed = 696.60 → rounds to 697
  // Ron May 2026: reservist credit tiers (מילואים)
  // - <30 days: 0 pts | 30-39: 0.5 | 40-49: 0.75 | 50: 1.0
  // - >50: +0.25 per additional 5 days, cap at 4.0 pts (= 110 days)
  it('Ron — reservist credit: 0 days = 0', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(0), 0)
  })
  it('Ron — reservist credit: 25 days = 0', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(25), 0)
  })
  it('Ron — reservist credit: 30 days = 0.5', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(30), 0.5)
  })
  it('Ron — reservist credit: 40 days = 0.75', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(40), 0.75)
  })
  it('Ron — reservist credit: 50 days = 1.0', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(50), 1.0)
  })
  it('Ron — reservist credit: 55 days = 1.25', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(55), 1.25)
  })
  it('Ron — reservist credit: 110 days = 4.0 (cap)', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(110), 4.0)
  })
  it('Ron — reservist credit: 200 days = 4.0 (capped)', async () => {
    const { calculateReservistCredit } = await import('../engine')
    assert.equal(calculateReservistCredit(200), 4.0)
  })

  it("Ron — education fund שווי מס on excess above 15,712 (employer 7.5%)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 25000, pensionSalary: 25000,
      hasEducationFund: true,
      educationFundSalary: 25000, // EXCEEDS 15,712 cap
      employerEducationRate: 7.5,
      maritalStatus: 'single', childrenAges: [],
    }))
    assert.ok(r.employee.imputedEducationFund >= 696 && r.employee.imputedEducationFund <= 698,
      `expected ~697, got ${r.employee.imputedEducationFund}`)
  })

  it("Ron — education fund: at cap 15,712 → no שווי מס", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 15712, pensionSalary: 15712,
      hasEducationFund: true,
      educationFundSalary: 15712,
      employerEducationRate: 7.5,
      maritalStatus: 'single', childrenAges: [],
    }))
    assert.equal(r.employee.imputedEducationFund, 0)
  })

  it('20K with NO pension, NO education fund', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 20000, pensionSalary: 20000,
      hasPension: false, hasEducationFund: false,
      maritalStatus: 'single',
    }))

    // Snapshot updated post Ron #14: travel 315 in tax/NII base.
    assert.equal(r.employee.netWithShvui, 15357)
    assert.equal(r.employer.totalWithShvui, 21621)
    assert.equal(r.employer.pensionEmployer, 0, 'pension disabled')
    assert.equal(r.employer.educationFundEmployer, 0, 'education fund disabled')
  })
})

// ─── Degree Credits (תואר אקדמי) ─────────────────────────────────────────────
// Ron May 2026 spec:
// - bachelor: 1 nz, 3-yr window from `year` (deferred → year+1)
// - master: 0.5 nz, 1-yr window = `year` only
// - phdRegular: 0.5 nz, 3-yr window from `year` (deferral → year+1)
// - phdMedicine: 1-yr window, 1 nz (year only).
// - phdDirect: bachelor (3-yr → 1 nz) + phdYear (2-yr → 0.5 nz)
// - professional: 1 nz, year only (mutex w/ bachelor/master same year — UI enforces)

describe('calculateDegreeCredit (Ron May 2026)', () => {
  it('empty degrees → 0', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([], 2026), 0)
  })

  it('bachelor: 3-yr window from year, returns 1 nz inside', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024 }], 2024), 1)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024 }], 2025), 1)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024 }], 2026), 1)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024 }], 2027), 0)
  })

  it('bachelor deferred: window starts year+1', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024, deferred: true }], 2024), 0)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024, deferred: true }], 2025), 1)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024, deferred: true }], 2027), 1)
    assert.equal(calculateDegreeCredit([{ type: 'bachelor', year: 2024, deferred: true }], 2028), 0)
  })

  it('master: only year, 0.5 nz', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'master', year: 2026 }], 2026), 0.5)
    assert.equal(calculateDegreeCredit([{ type: 'master', year: 2026 }], 2025), 0)
    assert.equal(calculateDegreeCredit([{ type: 'master', year: 2026 }], 2027), 0)
  })

  it('phdRegular: 3-yr window, 0.5 nz', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'phdRegular', year: 2024 }], 2024), 0.5)
    assert.equal(calculateDegreeCredit([{ type: 'phdRegular', year: 2024 }], 2026), 0.5)
    assert.equal(calculateDegreeCredit([{ type: 'phdRegular', year: 2024 }], 2027), 0)
  })

  it('phdMedicine: 1 nz for year only, 0 thereafter', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'phdMedicine', year: 2026 }], 2026), 1)
    assert.equal(calculateDegreeCredit([{ type: 'phdMedicine', year: 2026 }], 2027), 0)
    assert.equal(calculateDegreeCredit([{ type: 'phdMedicine', year: 2026 }], 2025), 0)
  })

  it('phdDirect: bachelor 3yr (1 nz) + phd 2yr (0.5 nz)', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    const d = [{ type: 'phdDirect' as const, year: 2024, phdYear: 2027 }]
    // Bachelor window 2024-2026
    assert.equal(calculateDegreeCredit(d, 2024), 1)
    assert.equal(calculateDegreeCredit(d, 2026), 1)
    // Phd window 2027-2028
    assert.equal(calculateDegreeCredit(d, 2027), 0.5)
    assert.equal(calculateDegreeCredit(d, 2028), 0.5)
    // Outside both
    assert.equal(calculateDegreeCredit(d, 2029), 0)
  })

  it('professional: year only, 1 nz', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    assert.equal(calculateDegreeCredit([{ type: 'professional', year: 2026 }], 2026), 1)
    assert.equal(calculateDegreeCredit([{ type: 'professional', year: 2026 }], 2027), 0)
  })

  it('multiple degrees: sums (bachelor + master in same year)', async () => {
    const { calculateDegreeCredit } = await import('../degree-credits')
    const d = [
      { type: 'bachelor' as const, year: 2024 },
      { type: 'master' as const, year: 2026 },
    ]
    // 2026: bachelor still in window (1) + master year (0.5) = 1.5
    assert.equal(calculateDegreeCredit(d, 2026), 1.5)
  })
})

// Engine integration: degree credit flows into total credit points
describe('engine: degree credit integration', () => {
  it('Ron — adding bachelor degree (year=2026) bumps total credit points by 1', () => {
    const base = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      evaluationDate: { month: 5, year: 2026 },
    }))
    const withDegree = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      evaluationDate: { month: 5, year: 2026 },
      degrees: [{ type: 'bachelor', year: 2026 }],
    }))
    assert.equal(withDegree.employee.totalCreditPoints - base.employee.totalCreditPoints, 1)
    // 1 nz = 2904/12 = 242 ₪/mo lower tax
    assert.ok(withDegree.employee.incomeTax < base.employee.incomeTax)
  })
})

// ─── Yishuv Mutav (יישוב מוטב) ───────────────────────────────────────────────
// Ron May 2026: 488 settlements. monthlyCap = annualCap/12;
// eligibleSalary = min(salary, monthlyCap); credit = eligibleSalary × ratePct%

describe('calculateYishuvCredit (Ron May 2026)', () => {
  it('אשקלון (7%, cap 146,640) — salary 30K → 855 ₪/mo', async () => {
    const { calculateYishuvCredit } = await import('../yishuv-mutav')
    // monthlyCap = 12,220; eligibleSalary = 12,220; credit = 12,220 × 7% = 855.40 → 855
    assert.equal(calculateYishuvCredit(30000, 'אשקלון'), 855)
  })

  it('אשקלון — salary 10K (below cap) → 700 ₪/mo', async () => {
    const { calculateYishuvCredit } = await import('../yishuv-mutav')
    // eligibleSalary = 10,000 (< cap 12,220); credit = 10,000 × 7% = 700
    assert.equal(calculateYishuvCredit(10000, 'אשקלון'), 700)
  })

  it('null/empty yishuv → 0', async () => {
    const { calculateYishuvCredit } = await import('../yishuv-mutav')
    assert.equal(calculateYishuvCredit(30000, null), 0)
    assert.equal(calculateYishuvCredit(30000, ''), 0)
    assert.equal(calculateYishuvCredit(30000, undefined), 0)
  })

  it('unknown yishuv name → 0 (graceful)', async () => {
    const { calculateYishuvCredit } = await import('../yishuv-mutav')
    assert.equal(calculateYishuvCredit(30000, 'לא קיים'), 0)
  })

  it('high-rate yishuv (20%): caps at monthlyCap × 20%', async () => {
    const { calculateYishuvCredit, findYishuv, YISHUV_MUTAV_LIST } = await import('../yishuv-mutav')
    // Pick first yishuv with rate 20%
    const y20 = YISHUV_MUTAV_LIST.find(y => y.ratePct === 20)
    assert.ok(y20, 'expected at least one 20% yishuv in list')
    const expected = Math.round((y20!.annualCap / 12) * 0.20)
    // Salary above cap → credit = monthlyCap × 20%
    assert.equal(calculateYishuvCredit(100000, y20!.name), expected)
    assert.ok(findYishuv(y20!.name)?.ratePct === 20)
  })

  it('list has 488 entries (Ron May 2026 booklet)', async () => {
    const { YISHUV_MUTAV_LIST } = await import('../yishuv-mutav')
    assert.equal(YISHUV_MUTAV_LIST.length, 488)
  })
})

// Engine integration: yishuv credit reduces income tax
describe('engine: yishuv credit integration', () => {
  it('Ron — gross 30K + travel 315 + אשקלון → income tax = 6,087 - 855 = 5,232', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      yishuvName: 'אשקלון',
    }))
    assert.equal(r.employee.incomeTax, 5232)
  })

  it('null yishuv: income tax matches non-yishuv base case', () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30000, pensionSalary: 30000, travelAllowance: 315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      yishuvName: null,
    }))
    assert.equal(r.employee.incomeTax, 6087)
  })
})

// ─── Vehicle Tax Benefit ─────────────────────────────────────────────────────

describe('calculateVehicleBenefit', () => {
  it('petrol 300K — below cap', () => {
    assert.equal(calculateVehicleBenefit(300000, 'petrol'), 7440)
  })

  it('electric 400K — with reduction', () => {
    assert.equal(calculateVehicleBenefit(400000, 'electric'), 8570)
  })

  it('commercial — always zero', () => {
    assert.equal(calculateVehicleBenefit(300000, 'commercial'), 0)
  })

  it('700K petrol — capped at manufacturer price cap', () => {
    assert.equal(calculateVehicleBenefit(700000, 'petrol'), 14802)
  })

  it('zero price — zero benefit', () => {
    assert.equal(calculateVehicleBenefit(0, 'petrol'), 0)
  })
})

// ─── Credit Points ───────────────────────────────────────────────────────────

describe('calculateCreditPoints', () => {
  it('male, married, 2 kids (3 + 7), military full, child allowance', () => {
    const r = calculateCreditPoints('male', 'married', [3, 7], true, 0, 'military', 'full', 0)

    assert.equal(r.base, 2.25)
    assert.equal(r.marital, 0)
    assert.equal(r.children, 5.5) // 3.5 (age 3) + 2 (age 7, doubled by allowance)
    assert.equal(r.disabledChildren, 0)
    assert.equal(r.service, 2)
    assert.equal(r.reservist, 0)
    assert.equal(r.total, 9.75)
  })

  it('female, single parent, 2 kids (1 + 10), 1 disabled, national partial', () => {
    const r = calculateCreditPoints('female', 'singleParent', [1, 10], false, 1, 'national', 'partial', 0)

    assert.equal(r.base, 2.75)
    assert.equal(r.marital, 1)
    assert.equal(r.children, 5.5) // 4.5 (age 1) + 1 (age 10, no allowance bonus)
    assert.equal(r.disabledChildren, 2)
    assert.equal(r.service, 1)
    assert.equal(r.reservist, 0)
    assert.equal(r.total, 12.25)
  })

  it('no service, no children — base only', () => {
    const r = calculateCreditPoints('male', 'married', [], false, 0, 'none', 'none', 0)

    assert.equal(r.base, 2.25)
    assert.equal(r.children, 0)
    assert.equal(r.service, 0)
    assert.equal(r.reservist, 0)
    assert.equal(r.total, 2.25)
  })

  // Ron May 2026: reservist days flow into total credit points
  it('Ron — base + reservist 55 days adds 1.25 to total', () => {
    const r = calculateCreditPoints('male', 'married', [], false, 0, 'none', 'none', 55)
    assert.equal(r.reservist, 1.25)
    assert.equal(r.total, 3.5) // 2.25 base + 1.25 reservist
  })

  it('Ron — full calc: 25K with 30 reserve days adds 0.5 pts → lower tax', () => {
    const baseR = calculateEmployerCost(makeInputs({
      grossSalary: 25000, pensionSalary: 25000,
      hasPension: false, hasEducationFund: false, childrenAges: [],
      maritalStatus: 'single',
    }))
    const reserveR = calculateEmployerCost(makeInputs({
      grossSalary: 25000, pensionSalary: 25000,
      hasPension: false, hasEducationFund: false, childrenAges: [],
      maritalStatus: 'single',
      reserveDays: 30,
    }))
    // 0.5 extra credit points × 2904 / 12 = 121 ₪/mo lower tax
    assert.ok(reserveR.employee.incomeTax < baseR.employee.incomeTax,
      `expected reservist tax < base, got ${reserveR.employee.incomeTax} vs ${baseR.employee.incomeTax}`)
    assert.equal(reserveR.employee.totalCreditPoints, baseR.employee.totalCreditPoints + 0.5)
  })
})
