/**
 * Leasing Calculator V2 — Configuration & Constants
 * Tax data imported from shared tax-tables-2026.ts.
 * Updatable via Sanity CMS (taxConfig singleton) or by editing tax tables.
 */

import type { CalculatorConfig, VehicleType } from './types'
import {
  TAX_BRACKETS_2026,
  NII_2026,
  VEHICLE_TAX_2026,
  GENERAL_2026,
} from '@/lib/tax-tables-2026'

/* ─── Default Config (overridden by Sanity) ─── */

export const DEFAULT_CONFIG: CalculatorConfig = {
  primeRate: GENERAL_2026.primeRate,
  vatRate: GENERAL_2026.vatRate,
  updatedAt: '2026-04-29',
}

/* ─── Car Price Presets ─── */

export const CAR_PRICE_PRESETS = [100_000, 150_000, 200_000, 250_000, 300_000]

/* ─── Income Presets ─── */

export const INCOME_PRESETS = [15_000, 20_000, 25_000, 30_000, 35_000, 40_000]

/* ─── Residual Car Values (Ron's spec: ~50% after 5 years) ─── */

export function getResidualCarValue(carPrice: number, periodMonths = 60): number {
  // ~10% depreciation per year, compounding. At 5yr → ~50%, at 3yr → ~35%, at 2yr → ~25%
  const years = periodMonths / 12
  const annualRetention = 0.87 // ~13% annual depreciation
  const retentionRate = Math.pow(annualRetention, years)
  return Math.round(carPrice * retentionRate)
}

/* ─── Depreciation Rate ─── */

export function getDepreciationRate(vehicleType: VehicleType): number {
  return vehicleType.includes('Electric')
    ? VEHICLE_TAX_2026.depreciation.electric
    : VEHICLE_TAX_2026.depreciation.petrol
}

/* ─── VAT Recovery Rate ─── */

export function getVatRecoveryRate(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial')
    ? VEHICLE_TAX_2026.vatRecovery.commercial
    : VEHICLE_TAX_2026.vatRecovery.private
}

/* ─── Tax Deduction Multiplier ─── */

export function getTaxDeductionMultiplier(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial')
    ? VEHICLE_TAX_2026.deductionMultiplier.commercial
    : VEHICLE_TAX_2026.deductionMultiplier.private
}

/* ─── Israeli Marginal Tax Brackets (from shared tax tables) ─── */

const TAX_BRACKETS_ANNUAL = TAX_BRACKETS_2026.annual

/** Top marginal rate for a given monthly income — used for display only */
export function getMarginalTaxRate(monthlyIncome: number): number {
  const annual = monthlyIncome * 12
  for (const b of TAX_BRACKETS_ANNUAL) {
    if (annual <= b.ceiling) return b.rate
  }
  return 0.50
}

/** Total annual income tax for a given annual income — bracket-by-bracket */
export function calculateAnnualTax(annualIncome: number): number {
  let tax = 0
  let prev = 0
  for (const b of TAX_BRACKETS_ANNUAL) {
    if (annualIncome <= prev) break
    const taxable = Math.min(annualIncome, b.ceiling) - prev
    tax += taxable * b.rate
    prev = b.ceiling
  }
  return tax
}

/**
 * Tax savings from an annual deduction — proper bracket-by-bracket difference.
 * Returns the actual tax reduction (tax at income - tax at income minus deduction).
 */
export function calculateTaxSavings(monthlyIncome: number, annualDeduction: number): number {
  const annualIncome = monthlyIncome * 12
  const reducedIncome = Math.max(0, annualIncome - annualDeduction)
  return Math.round(calculateAnnualTax(annualIncome) - calculateAnnualTax(reducedIncome))
}

/* ─── National Insurance (ביטוח לאומי) Savings Rate ─── */

export function getNiiSavingsRate(monthlyIncome: number): number {
  return monthlyIncome > NII_2026.lowThreshold
    ? NII_2026.selfEmployedSavingsRateAboveThreshold
    : NII_2026.selfEmployedSavingsRateBelowThreshold
}

/* ─── Company: שווי שימוש Constants (from shared tax tables) ─── */

export const VEHICLE_TAX_BENEFIT_RATE = VEHICLE_TAX_2026.benefitRate
export const MANUFACTURER_PRICE_CAP_2026 = VEHICLE_TAX_2026.manufacturerPriceCap
export const COMPANY_TAX_RATE = GENERAL_2026.companyTaxRate
export const NII_EMPLOYER_RATE_HIGH = NII_2026.employerHigh
export const NII_SALARY_THRESHOLD = NII_2026.lowThreshold
export const NII_EMPLOYEE_RATE_LOW = NII_2026.employeeLow
export const NII_EMPLOYEE_RATE_HIGH = NII_2026.employeeHigh

export const VEHICLE_TAX_REDUCTIONS: Record<string, number> = {
  privatePetrol: VEHICLE_TAX_2026.reductions.petrol,
  privateElectric: VEHICLE_TAX_2026.reductions.electric,
  commercialPetrol: VEHICLE_TAX_2026.reductions.commercial,
  commercialElectric: VEHICLE_TAX_2026.reductions.commercial,
}

export function calculateVehicleTaxBenefit(
  manufacturerPrice: number,
  vehicleType: VehicleType
): number {
  if (vehicleType.startsWith('commercial')) return 0
  const cappedPrice = Math.min(manufacturerPrice, MANUFACTURER_PRICE_CAP_2026)
  const baseBenefit = Math.round(cappedPrice * VEHICLE_TAX_BENEFIT_RATE)
  const reduction = VEHICLE_TAX_REDUCTIONS[vehicleType] || 0
  return Math.max(0, baseBenefit - reduction)
}

/* ─── Default Interest Spreads ─── */

export const DEFAULT_PURCHASE_SPREAD = 1.0 // P+1%
export const DEFAULT_FINANCIAL_SPREAD = 2.0 // P+2%

/* ─── Purchase: Equity Presets ─── */

export const PURCHASE_EQUITY_PRESETS = [
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
]

/* ─── Financial Leasing: Down Payment Presets ─── */

export const FINANCIAL_DOWN_PRESETS = [
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
]

/* ─── Financial Leasing: Residual Presets ─── */

export const FINANCIAL_RESIDUAL_PRESETS = [
  { value: 30, label: '30%' },
  { value: 35, label: '35%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
]

/* ─── Operational Leasing: Down Payment Presets ─── */

export const OPERATIONAL_DOWN_PRESETS = [
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
]

/* ─── Purchase Interest Rate Presets ─── */

export const PURCHASE_RATE_PRESETS = [
  { value: -1, label: 'P-1%' },
  { value: -0.5, label: 'P-0.5%' },
  { value: 0, label: 'P+0%' },
  { value: 0.5, label: 'P+0.5%' },
  { value: 1, label: 'P+1%' },
  { value: 1.5, label: 'P+1.5%' },
  { value: 2, label: 'P+2%' },
]

/* ─── Financial Leasing Interest Rate Presets ─── */

export const FINANCIAL_RATE_PRESETS = [
  { value: 1, label: 'P+1%' },
  { value: 1.5, label: 'P+1.5%' },
  { value: 2, label: 'P+2%' },
  { value: 2.5, label: 'P+2.5%' },
  { value: 3, label: 'P+3%' },
]

/* ─── Period Presets ─── */

export const PERIOD_PRESETS = [
  { value: 24, label: '24 חודשים' },
  { value: 36, label: '36 חודשים' },
  { value: 48, label: '48 חודשים' },
  { value: 60, label: '60 חודשים' },
]

/* ─── Running Cost Presets ─── */

export const FUEL_PRESETS = [500, 1000, 1500, 2000, 2500]
export const DEFAULT_FUEL_MONTHLY = 1500

export const MAINTENANCE_PRESETS = [5000, 6000, 7000, 8000, 9000, 10000]
export const DEFAULT_MAINTENANCE_YEARLY = 5000

export const INSURANCE_PRESETS = [7000, 8000, 9000, 10000, 11000]
export const DEFAULT_INSURANCE_YEARLY = 7000

/* ─── Electric Vehicle: km-based Cost ─── */

export const ELECTRIC_KM_PRESETS = [
  { km: 1000, cost: 150, label: '1,000 ק"מ (כ-150 ₪)' },
  { km: 1500, cost: 200, label: '1,500 ק"מ (כ-200 ₪)' },
  { km: 2000, cost: 250, label: '2,000 ק"מ (כ-250 ₪)' },
  { km: 2500, cost: 350, label: '2,500 ק"מ (כ-350 ₪)' },
]

/* ─── Operational Leasing: Monthly Rates by Price Range ─── */

export const OPERATIONAL_RATE_BRACKETS = [
  { min: 0, max: 100_000, defaultRate: 2000, options: [1800, 2000, 2250, 2500] },
  { min: 100_000, max: 150_000, defaultRate: 2700, options: [2500, 2700, 2900, 3100] },
  { min: 150_000, max: 200_000, defaultRate: 3800, options: [3600, 3800, 4000, 4200] },
  { min: 200_000, max: 250_000, defaultRate: 4800, options: [4600, 4800, 5000, 5200] },
  { min: 250_000, max: Infinity, defaultRate: 5800, options: [5500, 5800, 6200, 6500] },
]

export function getOperationalRateBracket(carPrice: number) {
  return (
    OPERATIONAL_RATE_BRACKETS.find((b) => carPrice >= b.min && carPrice < b.max) ||
    OPERATIONAL_RATE_BRACKETS[OPERATIONAL_RATE_BRACKETS.length - 1]
  )
}
