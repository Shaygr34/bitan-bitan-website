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

// ─── Full Calculation ────────────────────────────────────────────────────────

describe('calculateEmployerCost', () => {
  it('basic 15K salary — male, married, no vehicle, no children', () => {
    const r = calculateEmployerCost(makeInputs())

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
      educationFundSalary: 15712,
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
      educationFundSalary: 15712,
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
    const r = calculateCreditPoints('male', 'married', [3, 7], true, 0, 'military', 'full')

    assert.equal(r.base, 2.25)
    assert.equal(r.marital, 0)
    assert.equal(r.children, 5.5) // 3.5 (age 3) + 2 (age 7, doubled by allowance)
    assert.equal(r.disabledChildren, 0)
    assert.equal(r.service, 2)
    assert.equal(r.total, 9.75)
  })

  it('female, single parent, 2 kids (1 + 10), 1 disabled, national partial', () => {
    const r = calculateCreditPoints('female', 'singleParent', [1, 10], false, 1, 'national', 'partial')

    assert.equal(r.base, 2.75)
    assert.equal(r.marital, 1)
    assert.equal(r.children, 5.5) // 4.5 (age 1) + 1 (age 10, no allowance bonus)
    assert.equal(r.disabledChildren, 2)
    assert.equal(r.service, 1)
    assert.equal(r.total, 12.25)
  })

  it('no service, no children — base only', () => {
    const r = calculateCreditPoints('male', 'married', [], false, 0, 'none', 'none')

    assert.equal(r.base, 2.25)
    assert.equal(r.children, 0)
    assert.equal(r.service, 0)
    assert.equal(r.total, 2.25)
  })
})
