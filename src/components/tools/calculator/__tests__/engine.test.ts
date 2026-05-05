/**
 * Leasing Calculator Engine — Regression Tests
 *
 * Snapshot tests against known-good outputs captured April 28, 2026.
 * If a test fails after a code change, verify the new output is
 * intentionally different (e.g. tax rate update) before updating snapshots.
 *
 * Run: npx tsx --test src/components/tools/calculator/__tests__/engine.test.ts
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculatePurchase,
  calculateFinancialLeasing,
  calculateOperationalLeasing,
  calculateAmortization,
  solveEffectiveRate,
} from '../engine'

import {
  calculateTaxSavings,
  calculateVehicleTaxBenefit,
  calculateAnnualTax,
  DEFAULT_CONFIG,
} from '../config'

import type { BaseInputs, PurchaseInputs, FinancialLeasingInputs, OperationalLeasingInputs } from '../types'

const config = DEFAULT_CONFIG

// ─── Purchase ────────────────────────────────────────────────────────────────

describe('calculatePurchase', () => {
  it('self-employed, private petrol, 200K car, 25K income', () => {
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'privatePetrol', carPrice: 200000, monthlyIncome: 25000 }
    const inputs: PurchaseInputs = { equityPercent: 25, interestSpread: 1, periodMonths: 60, fuelMonthly: 1500, maintenanceYearly: 5000, insuranceYearly: 7000 }
    const r = calculatePurchase(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 65220)
    assert.equal(r.totalTaxSavings, 13865)
    assert.equal(r.annualTaxSavings, 8772)
    assert.equal(r.niiSavings, 5093)
    assert.equal(r.vatRecoverable, 2339)
    assert.equal(r.deductibleExpenses, 28296)
    assert.equal(r.monthlyCashflow, 5435)
    assert.equal(r.depreciation, 30000)
  })

  it('company, private electric, 300K car, 30K income', () => {
    const base: BaseInputs = { userType: 'company', vehicleType: 'privateElectric', carPrice: 300000, monthlyIncome: 30000, manufacturerPrice: 350000 }
    const inputs: PurchaseInputs = { equityPercent: 30, interestSpread: 1.5, periodMonths: 48, fuelMonthly: 800, maintenanceYearly: 4000, insuranceYearly: 8000 }
    const r = calculatePurchase(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 81948)
    assert.equal(r.totalTaxSavings, 23)
    assert.equal(r.vehicleTaxBenefit, 7330)
    assert.equal(r.employerNii, 6685)
    assert.equal(r.grossIncludingVehicle, 37330)
  })

  it('employee, private petrol, 150K car, 15K income — negative tax savings', () => {
    const base: BaseInputs = { userType: 'employee', vehicleType: 'privatePetrol', carPrice: 150000, monthlyIncome: 15000, manufacturerPrice: 200000 }
    const inputs: PurchaseInputs = { equityPercent: 50, interestSpread: 1, periodMonths: 36, fuelMonthly: 1200, maintenanceYearly: 4000, insuranceYearly: 6000 }
    const r = calculatePurchase(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 51988)
    assert.equal(r.totalTaxSavings, -20415)
    assert.equal(r.vehicleTaxBenefit, 4960)
    assert.equal(r.vatRecoverable, 0, 'employee should have zero VAT recovery')
    assert.equal(r.deductibleExpenses, 0, 'employee should have zero deductible expenses')
  })
})

// ─── Financial Leasing ───────────────────────────────────────────────────────

describe('calculateFinancialLeasing', () => {
  it('self-employed with trade-in', () => {
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'privatePetrol', carPrice: 250000, monthlyIncome: 30000 }
    const inputs: FinancialLeasingInputs = {
      downPaymentPercent: 15, residualPercent: 30, tradeIn: true, tradeInAmount: 40000,
      monthlyLeasingPayment: 3200, periodMonths: 48, fuelMonthly: 1500, maintenanceYearly: 6000, insuranceYearly: 8000,
    }
    const r = calculateFinancialLeasing(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 70400)
    assert.equal(r.totalTaxSavings, 19339)
    assert.equal(r.monthlyCashflow, 5867)
    assert.ok(r.computedEffectiveRate !== null, 'should compute effective rate')
    assert.ok(Math.abs(r.computedEffectiveRate! - 10.93) < 0.1, `effective rate should be ~10.93%, got ${r.computedEffectiveRate}`)
  })
})

// ─── Operational Leasing ─────────────────────────────────────────────────────

describe('calculateOperationalLeasing', () => {
  it('self-employed, commercial vehicle — full deductions', () => {
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'commercialPetrol', carPrice: 180000, monthlyIncome: 20000 }
    const inputs: OperationalLeasingInputs = { downPaymentPercent: 10, monthlyLeasingPayment: 3800, fuelMonthly: 2000, kmPerMonth: 2000 }
    const r = calculateOperationalLeasing(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 69600)
    assert.equal(r.totalTaxSavings, 23734)
    assert.equal(r.vatRecoverable, 10617)
    assert.equal(r.deductibleExpenses, 58983)
  })

  // ─── Ron's exact numeric examples (May 2, 2026 feedback) ─────────────────────

  it("Ron — VAT recovery uses exact 2/3 (not 0.67) on private fuel", () => {
    // 1,500/mo fuel = 18,000/yr. VAT = 18000 - 18000/1.18 = 2,745.76
    // Recovery (2/3) = 1,830.51 → rounds to 1,831
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'privatePetrol', carPrice: 200000, monthlyIncome: 25000 }
    const inputs: OperationalLeasingInputs = { downPaymentPercent: 5, monthlyLeasingPayment: 3800, fuelMonthly: 1500, kmPerMonth: 1500 }
    const r = calculateOperationalLeasing(base, inputs, config)
    assert.equal(r.vatRecoverable, 1831)
  })

  it('employee, private petrol — no deductions, negative savings', () => {
    const base: BaseInputs = { userType: 'employee', vehicleType: 'privatePetrol', carPrice: 200000, monthlyIncome: 20000, manufacturerPrice: 250000 }
    const inputs: OperationalLeasingInputs = { downPaymentPercent: 5, monthlyLeasingPayment: 4000, fuelMonthly: 1500, kmPerMonth: 1500 }
    const r = calculateOperationalLeasing(base, inputs, config)

    assert.equal(r.totalAnnualExpenses, 66000)
    assert.equal(r.totalTaxSavings, -32646)
    assert.equal(r.vehicleTaxBenefit, 6200)
    assert.equal(r.vatRecoverable, 0)
  })
})

// ─── Amortization ────────────────────────────────────────────────────────────

// ─── Ron's commercial pre-VAT examples (May 2, 2026) ─────────────────────────

describe('Ron commercial pre-VAT', () => {
  it('commercial 150K, 25% down → loan principal = 89,619 (uses pre-VAT)', () => {
    // 150,000 / 1.18 = 127,118.64; equity = 37,500; loan = 89,619
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'commercialPetrol', carPrice: 150000, monthlyIncome: 25000 }
    const inputs: PurchaseInputs = { equityPercent: 25, interestSpread: 1, periodMonths: 60, fuelMonthly: 1500, maintenanceYearly: 5000, insuranceYearly: 7000 }
    const r = calculatePurchase(base, inputs, config)
    assert.equal(r.loan?.amount, 89619)
  })

  it('commercial 150K → depreciation = 19,068/yr (15% × pre-VAT 127,118.64)', () => {
    const base: BaseInputs = { userType: 'selfEmployed', vehicleType: 'commercialPetrol', carPrice: 150000, monthlyIncome: 25000 }
    const inputs: PurchaseInputs = { equityPercent: 25, interestSpread: 1, periodMonths: 60, fuelMonthly: 1500, maintenanceYearly: 5000, insuranceYearly: 7000 }
    const r = calculatePurchase(base, inputs, config)
    assert.equal(r.depreciation, 19068)
  })
})

describe('calculateAmortization', () => {
  it('standard loan: 150K at 6.5% for 60 months', () => {
    const r = calculateAmortization(150000, 6.5, 60)
    assert.equal(r.monthlyPayment, 2935)
    assert.equal(r.totalInterest, 26095)
    assert.equal(r.yearlyBreakdown.length, 5)
  })

  it('zero interest rate: 100K for 36 months', () => {
    const r = calculateAmortization(100000, 0, 36)
    assert.equal(r.monthlyPayment, 2778)
    assert.equal(r.totalInterest, 0)
  })

  it('zero principal returns empty', () => {
    const r = calculateAmortization(0, 6.5, 60)
    assert.equal(r.monthlyPayment, 0)
    assert.equal(r.totalInterest, 0)
    assert.equal(r.yearlyBreakdown.length, 0)
  })
})

// ─── IRR Solver ──────────────────────────────────────────────────────────────

describe('solveEffectiveRate', () => {
  it('standard scenario: 200K financed, 4K/month, 60K balloon, 48 months', () => {
    const rate = solveEffectiveRate(200000, 4000, 60000, 48)
    assert.ok(Math.abs(rate - 9.57) < 0.1, `expected ~9.57%, got ${rate.toFixed(2)}%`)
  })

  it('returns 0 for impossible loan (payments < principal)', () => {
    const rate = solveEffectiveRate(200000, 100, 0, 48)
    assert.equal(rate, 0)
  })

  it('returns 0 for zero inputs', () => {
    assert.equal(solveEffectiveRate(0, 4000, 0, 48), 0)
    assert.equal(solveEffectiveRate(200000, 0, 0, 48), 0)
    assert.equal(solveEffectiveRate(200000, 4000, 0, 0), 0)
  })
})

// ─── Tax Calculations ────────────────────────────────────────────────────────

describe('calculateTaxSavings', () => {
  it('25K income, 50K deduction', () => {
    assert.equal(calculateTaxSavings(25000, 50000), 15500)
  })

  it('7K income (lowest bracket), 20K deduction', () => {
    assert.equal(calculateTaxSavings(7000, 20000), 2000)
  })

  it('zero deduction returns zero savings', () => {
    assert.equal(calculateTaxSavings(25000, 0), 0)
  })
})

describe('calculateAnnualTax', () => {
  it('300K annual income', () => {
    assert.equal(Math.round(calculateAnnualTax(300000)), 57312)
  })

  it('zero income', () => {
    assert.equal(calculateAnnualTax(0), 0)
  })
})

// ─── Vehicle Tax Benefit ─────────────────────────────────────────────────────

describe('calculateVehicleTaxBenefit', () => {
  it('400K petrol — below cap', () => {
    assert.equal(calculateVehicleTaxBenefit(400000, 'privatePetrol'), 9920)
  })

  it('700K electric — capped + electric reduction', () => {
    assert.equal(calculateVehicleTaxBenefit(700000, 'privateElectric'), 13452)
  })

  it('commercial — always zero', () => {
    assert.equal(calculateVehicleTaxBenefit(200000, 'commercialPetrol'), 0)
  })
})
