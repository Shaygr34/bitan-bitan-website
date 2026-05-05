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

// Ron May 2026: backstage evaluation date (month/year) defaults to "now"
describe('evaluationDate (Ron May 2026)', () => {
  it('defaults to current month/year', () => {
    const d = getDefaultEmployerInputs()
    const now = new Date()
    assert.equal(d.evaluationDate.year, now.getFullYear())
    assert.equal(d.evaluationDate.month, now.getMonth() + 1) // 1-12
  })

  it('engine accepts override without breaking calc', () => {
    const r = calculateEmployerCost(makeInputs({
      evaluationDate: { month: 4, year: 2026 },
      grossSalary: 15000, pensionSalary: 15000,
      hasEducationFund: true,
    }))
    assert.equal(r.employee.netWithShvui, 11230) // matches base case snapshot
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

    assert.equal(r.employee.netWithShvui, 11230)
    assert.equal(r.employee.netWithoutShvui, 11230)
    assert.equal(r.employer.totalWithShvui, 19217)
    assert.equal(r.employer.totalWithoutShvui, 19217)
    assert.equal(r.employee.incomeTax, 1278)
    assert.equal(r.employee.niiEmployee, 1217)
    assert.equal(r.employer.niiEmployer, 902)
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

    assert.equal(r.employee.netWithShvui, 14844)
    assert.equal(r.employee.netWithoutShvui, 18338)
    assert.equal(r.employer.totalWithShvui, 32428)
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

    assert.equal(r.employee.netWithShvui, 19265)
    assert.equal(r.employer.totalWithShvui, 51717)
    assert.equal(r.vehicleTaxBenefit, 11050)
    assert.equal(r.totalShvuiMas, 14550)
    assert.equal(r.employee.totalCreditPoints, 16.75)
    assert.equal(r.employee.incomeTax, 11833)
  })

  // ─── Ron's exact numeric examples (April 30, 2026 feedback) ──────────────────

  it("Ron — salary 30,315 → NII employee = 3,081 (7,703×4.27% + 22,612×12.17%)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30315, pensionSalary: 30315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.niiEmployee, 3081)
  })

  it("Ron — salary 70,000 → NII employee = 5,709 (capped at 51,910)", () => {
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 70000, pensionSalary: 70000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.niiEmployee, 5709)
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
    // Regular brackets to 60,130 = 18,680.3; above = 39,870 × 47% = 18,738.9
    // Mas Yasaf = 39,870 × 3% = 1,196.1; credits = 2.25 × 2904/12 = 544.5
    // Total = 18,680.3 + 18,738.9 - 544.5 + 1,196.1 ≈ 38,070
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 100000, pensionSalary: 100000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    assert.equal(r.employee.incomeTax, 38070)
  })

  it("Ron — Mas Yasaf zero impact at salary ≤ 60,130", () => {
    // Salary 50K: regular brackets only, no 3% surtax
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 50000, pensionSalary: 50000,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
    }))
    // At exactly 50K: brackets = 701 + 427 + 1,788 + 1,891 + 7,556.5 + (3,310×0.47=1,555.7) = 13,919.2
    // - credits 544.5 ≈ 13,375 (no Mas Yasaf since 50K < 60,130)
    assert.ok(r.employee.incomeTax > 13000 && r.employee.incomeTax < 13500,
      `expected ~13,375, got ${r.employee.incomeTax}`)
  })

  // ─── NII Categories (BTL Circular 1522, January 2026) ───────────────────────

  it("NII category: controllingShareholder (טור 2) — salary 30,315 → 3,032", () => {
    // 7,703 × 4.25% = 327.38 + 22,612 × 11.96% = 2,704.40 → 3,031.78 → 3,032
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30315, pensionSalary: 30315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'controllingShareholder',
    }))
    assert.equal(r.employee.niiEmployee, 3032)
  })

  it("NII category: foreignResident — salary 30,315 → 861 (much lower)", () => {
    // 7,703 × 0.85% = 65.48 + 22,612 × 3.52% = 795.94 → 861.42 → 861
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30315, pensionSalary: 30315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'foreignResident',
    }))
    assert.equal(r.employee.niiEmployee, 861)
  })

  it("NII category: default 'standard' matches Ron's snapshot — 30,315 → 3,081", () => {
    // Same input as the 'Ron — salary 30,315' test above, using explicit category.
    const r = calculateEmployerCost(makeInputs({
      grossSalary: 30315, pensionSalary: 30315,
      maritalStatus: 'single', hasPension: false, hasEducationFund: false, childrenAges: [],
      niiCategory: 'standard',
    }))
    assert.equal(r.employee.niiEmployee, 3081)
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

    assert.equal(r.employee.netWithShvui, 15494)
    assert.equal(r.employer.totalWithShvui, 21597)
    assert.equal(r.employer.pensionEmployer, 0, 'pension disabled')
    assert.equal(r.employer.educationFundEmployer, 0, 'education fund disabled')
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
