/**
 * Employer Cost Calculator — Configuration (2026 values)
 * All values confirmed by Ron Bitan, April 6, 2026
 */

import type { EmployerCalcConfig } from './types'

export const DEFAULT_EMPLOYER_CONFIG: EmployerCalcConfig = {
  // Israeli income tax brackets 2026 (monthly)
  taxBrackets: [
    { upTo: 7_010, rate: 0.10 },
    { upTo: 10_060, rate: 0.14 },
    { upTo: 19_000, rate: 0.20 },
    { upTo: 25_100, rate: 0.31 },
    { upTo: 46_690, rate: 0.35 },
    { upTo: 60_129, rate: 0.47 },
    { upTo: Infinity, rate: 0.50 }, // includes מס יסף
  ],

  // Credit point value (2026)
  creditPointValue: 2_904, // ₪/year per point

  // National Insurance (ביטוח לאומי) 2026
  niiLowThreshold: 7_703,
  niiHighThreshold: 51_910,
  niiEmployeeLow: 0.0427,
  niiEmployeeHigh: 0.1217,
  niiEmployerLow: 0.0451,
  niiEmployerHigh: 0.076,

  // Pension/severance/education caps
  avgSalary: 13_769, // שכר ממוצע במשק 2026
  severanceCap: 34_900, // תקרת פיצויים
  educationFundCap: 15_712, // תקרת קרן השתלמות

  // Vehicle שווי שימוש
  vehicleTaxRate: 0.0248, // 2.48%
  manufacturerPriceCap: 596_860,
  electricReduction: 1_350,
  plugInReduction: 1_130,
  hybridReduction: 560,

  // מס יסף threshold (monthly)
  surchargeThreshold: 60_130,
}

/* ─── Presets for UI ─── */

export const SALARY_PRESETS = [8_000, 12_000, 15_000, 20_000, 25_000, 30_000]

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
]

// When employee receives child allowance, ages 6-17 get doubled points
export const CHILD_ALLOWANCE_BONUS_AGES = { minAge: 6, maxAge: 17, multiplier: 2 }
