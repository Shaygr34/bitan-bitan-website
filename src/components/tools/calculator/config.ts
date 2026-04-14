/**
 * Leasing Calculator V2 — Configuration & Constants
 * All values from Ron's spec. Updatable via Sanity (primeRate, vatRate)
 * or by editing this file (presets, defaults).
 */

import type { CalculatorConfig, VehicleType } from './types'

/* ─── Default Config (overridden by Sanity) ─── */

export const DEFAULT_CONFIG: CalculatorConfig = {
  primeRate: 5.5,
  vatRate: 0.18,
  updatedAt: '2026-04-05',
}

/* ─── Car Price Presets ─── */

export const CAR_PRICE_PRESETS = [100_000, 150_000, 200_000, 250_000, 300_000]

/* ─── Income Presets ─── */

export const INCOME_PRESETS = [15_000, 20_000, 25_000, 30_000, 35_000, 40_000]

/* ─── Residual Car Values (Ron's spec: ~50% after 5 years) ─── */

export function getResidualCarValue(carPrice: number): number {
  // Ron's mapping: 100K→50K, 150K→75K, 200K→100K, 250K→125K, 300K→150K
  return Math.round(carPrice * 0.5)
}

/* ─── Depreciation Rate ─── */

export function getDepreciationRate(vehicleType: VehicleType): number {
  // Electric: 20%, Petrol: 15% (Ron's spec)
  return vehicleType.includes('Electric') ? 0.20 : 0.15
}

/* ─── VAT Recovery Rate ─── */

// Private vehicles: 67% of VAT on fuel + maintenance
// Commercial vehicles: 100% of VAT
export function getVatRecoveryRate(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial') ? 1.0 : 0.67
}

/* ─── Tax Deduction Multiplier ─── */

// Private: 45% of deductible expenses count toward tax
// Commercial: 100%
export function getTaxDeductionMultiplier(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial') ? 1.0 : 0.45
}

/* ─── Israeli Marginal Tax Brackets (2026) ─── */

const TAX_BRACKETS_ANNUAL = [
  { ceiling: 84_120, rate: 0.10 },
  { ceiling: 120_720, rate: 0.14 },
  { ceiling: 193_800, rate: 0.20 },
  { ceiling: 269_280, rate: 0.31 },
  { ceiling: 560_280, rate: 0.35 },
  { ceiling: 721_560, rate: 0.47 },
  { ceiling: Infinity, rate: 0.50 },
]

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

// Ron's formula: above 7,700/mo → 18%, below → 7.7%
export function getNiiSavingsRate(monthlyIncome: number): number {
  return monthlyIncome > 7700 ? 0.18 : 0.077
}

/* ─── Company: שווי שימוש Constants ─── */

export const VEHICLE_TAX_BENEFIT_RATE = 0.0248 // 2.48% of manufacturer price
export const MANUFACTURER_PRICE_CAP_2026 = 596_860 // תקרת שווי רכב יצרן 2026
export const COMPANY_TAX_RATE = 0.23 // מס חברות 23%
export const NII_EMPLOYER_RATE_HIGH = 0.076 // ביטוח לאומי מעביד above threshold
export const NII_SALARY_THRESHOLD = 7703 // מדרגה נמוכה ביטוח לאומי
export const NII_EMPLOYEE_RATE_LOW = 0.0427  // ביטוח לאומי עובד — מדרגה נמוכה
export const NII_EMPLOYEE_RATE_HIGH = 0.1217  // ביטוח לאומי עובד — מדרגה גבוהה

// Electric/hybrid שווי מס reductions (monthly)
export const VEHICLE_TAX_REDUCTIONS: Record<string, number> = {
  privatePetrol: 0,
  privateElectric: 1350,
  commercialPetrol: 0,
  commercialElectric: 0,
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
