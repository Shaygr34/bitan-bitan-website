/**
 * Employer Cost Calculator — Configuration (2026 values)
 * Tax data imported from shared tax-tables-2026.ts.
 * Updatable via Sanity CMS (taxConfig singleton) or by editing tax tables.
 */

import type { EmployerCalcConfig } from './types'
import {
  TAX_BRACKETS_2026,
  NII_2026,
  VEHICLE_TAX_2026,
  SALARY_CAPS_2026,
  CREDIT_POINTS_2026,
  GENERAL_2026,
} from '@/lib/tax-tables-2026'

export const DEFAULT_EMPLOYER_CONFIG: EmployerCalcConfig = {
  // Israeli income tax brackets 2026 (monthly) — derived from annual shared tables
  taxBrackets: TAX_BRACKETS_2026.monthly.map(b => ({ upTo: b.upTo, rate: b.rate })),

  creditPointValue: CREDIT_POINTS_2026.valuePerYear,

  // National Insurance (ביטוח לאומי) 2026
  niiLowThreshold: NII_2026.lowThreshold,
  niiHighThreshold: NII_2026.highThreshold,
  niiEmployeeLow: NII_2026.employeeLow,
  niiEmployeeHigh: NII_2026.employeeHigh,
  niiEmployerLow: NII_2026.employerLow,
  niiEmployerHigh: NII_2026.employerHigh,

  // Pension/severance/education caps
  avgSalary: SALARY_CAPS_2026.averageSalary,
  severanceCap: SALARY_CAPS_2026.severanceCap,
  educationFundCap: SALARY_CAPS_2026.educationFundCap,

  // Vehicle שווי שימוש
  vehicleTaxRate: VEHICLE_TAX_2026.benefitRate,
  manufacturerPriceCap: VEHICLE_TAX_2026.manufacturerPriceCap,
  electricReduction: VEHICLE_TAX_2026.reductions.electric,
  plugInReduction: VEHICLE_TAX_2026.reductions.plugIn,
  hybridReduction: VEHICLE_TAX_2026.reductions.hybrid,

  // מס יסף threshold (monthly)
  surchargeThreshold: GENERAL_2026.surchargeThreshold,

  // Pension credit (employee-specific)
  pensionCreditSalaryCap: SALARY_CAPS_2026.pensionCredit.salaryCap,
  pensionCreditRate: SALARY_CAPS_2026.pensionCredit.rate,
  pensionCreditTaxRate: SALARY_CAPS_2026.pensionCredit.taxRate,

  // Travel allowance default
  defaultTravelAllowance: GENERAL_2026.defaultTravelAllowance,
}

/* ─── Presets for UI ─── */

export const SALARY_PRESETS = [8_000, 15_000, 25_000, 40_000, 55_000]

export const PENSION_EMPLOYEE_RATES = [
  { value: 6, label: '6%' },
  { value: 7, label: '7%' },
]

export const PENSION_EMPLOYER_RATES = [
  { value: 5, label: '5%' },
  { value: 6.5, label: '6.5%' },
  { value: 7.5, label: '7.5%' },
]

export const SEVERANCE_RATES = [
  { value: 6, label: '6%' },
  { value: 8.33, label: '8.33%' },
]

export const DISABILITY_RATES = [
  { value: 0, label: '0%' },
  { value: 1.5, label: '1.5%' },
  { value: 2.5, label: '2.5%' },
]

export const EDUCATION_EMPLOYER_RATES = [
  { value: 5, label: '5%' },
  { value: 7.5, label: '7.5%' },
]

export const VEHICLE_FUEL_OPTIONS = [
  { value: 'petrol', label: 'פרטי (בנזין)' },
  { value: 'electric', label: 'פרטי (חשמלי)' },
  { value: 'plugIn', label: 'פרטי (פלאג אין)' },
  { value: 'hybrid', label: 'פרטי (היברידי)' },
  { value: 'commercial', label: 'מסחרי', sublabel: 'אין שווי מס רכב' },
]

export const CHILD_AGE_CREDITS: { minAge: number; maxAge: number; points: number }[] = [
  { minAge: 0, maxAge: 0, points: 2.5 },
  { minAge: 1, maxAge: 2, points: 4.5 },
  { minAge: 3, maxAge: 3, points: 3.5 },
  { minAge: 4, maxAge: 5, points: 2.5 },
  { minAge: 6, maxAge: 17, points: 1 },
  { minAge: 18, maxAge: 18, points: 0 },
]

// When employee receives child allowance, ages 6-17 get doubled points
export const CHILD_ALLOWANCE_BONUS_AGES = { minAge: 6, maxAge: 17, multiplier: 2 }

/* ─── Service Credit Point Rules ─── */

export function getServiceCreditPoints(
  gender: 'male' | 'female',
  serviceType: 'military' | 'national' | 'none',
  serviceLevel: 'full' | 'partial' | 'none'
): number {
  void gender // gender doesn't affect point count, only thresholds
  if (serviceType === 'none' || serviceLevel === 'none') return 0
  return serviceLevel === 'full' ? 2 : 1
}

export function getServiceThresholds(
  gender: 'male' | 'female',
  serviceType: 'military' | 'national'
): { full: string; partial: string } {
  if (serviceType === 'national') return { full: '24 חודשים ומעלה', partial: '12-24 חודשים' }
  if (gender === 'female') return { full: '22 חודשים ומעלה', partial: '12-22 חודשים' }
  return { full: '23 חודשים ומעלה', partial: '12-23 חודשים' }
}
