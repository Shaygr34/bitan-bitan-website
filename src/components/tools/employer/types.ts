/**
 * Employer Cost Calculator — Type Definitions
 * V2: Generalized שווי מס (vehicle + meals + other), service credits,
 * disabled children, pension credit fix, travel allowance.
 */

import type { NIICategory } from '@/lib/tax-tables-2026'

export type VehicleFuelType = 'petrol' | 'electric' | 'plugIn' | 'hybrid' | 'commercial'

export type Gender = 'male' | 'female'
export type MaritalStatus = 'married' | 'divorced' | 'single' | 'widowed' | 'singleParent'
export type ChildAllowanceRecipient = 'employee' | 'spouse'

export type ChildAge = number // 0-18

/* ─── Inputs ─── */

export type EmployerInputs = {
  // Salary
  grossSalary: number // שכר ברוטו
  pensionSalary: number // שכר לצרכי פנסיה (default = grossSalary)
  travelAllowance: number // נסיעות — default 315, range 0-1500

  // Vehicle
  hasVehicle: boolean // toggle: כן/לא for vehicle (default false)
  vehicleFuelType: VehicleFuelType
  manufacturerPrice: number // מחיר יצרן רכב

  // Meal benefit (שווי ארוחות)
  hasMealBenefit: boolean
  mealBenefitAmount: number // 500-2000, default 1000

  // Other benefit (שווי מס נוסף)
  hasOtherBenefit: boolean
  otherBenefitAmount: number // 500-3000, default 1000

  // Pension toggle + rates
  hasPension: boolean // כן/לא — default true
  employeePensionRate: number // 6% or 7%
  employerPensionRate: number // 5%, 6.5%, or 7.5% (includes disability)
  severanceRate: number // 6% or 8.33%
  disabilityRate: number // 0%, 1.5%, or 2.5% (included in employerPensionRate cap 7.5%)

  // Education fund toggle + rates (קרן השתלמות)
  hasEducationFund: boolean // כן/לא — default true
  educationFundSalary: number // שכר לקרן השתלמות (default = min(grossSalary, 15712))
  employeeEducationRate: number // 2.5%
  employerEducationRate: number // 5% or 7.5%

  // Pension credit salary (שכר מבוטח קצבה מזכה)
  pensionCreditSalary: number // default 9700, editable

  // Personal details (for tax credits)
  gender: Gender
  maritalStatus: MaritalStatus
  childAllowanceRecipient: ChildAllowanceRecipient
  childrenAges: ChildAge[] // array of ages (0-18)
  disabledChildrenCount: number // נטול יכולת — 0 to childrenCount

  // Service (שירות צבאי/לאומי)
  serviceType: 'military' | 'national' | 'none'
  serviceLevel: 'full' | 'partial' | 'none'
  // Service end date (Ron May 2026) — drives 36-month eligibility window.
  // null = legacy/unknown (treated as eligible for backwards compat).
  serviceEndDate: { month: number; year: number } | null

  // Reservist days (מילואים) in prior tax year — drives זיכוי מילואים tier
  reserveDays: number

  // NII category (BTL circular 1522, 2026) — defaults to 'standard' (טור 1)
  niiCategory: NIICategory

  // Backstage evaluation date (Ron May 2026)
  // Used for service eligibility (36-mo window) and degree credit windows.
  evaluationDate: { month: number /* 1-12 */; year: number }
}

/* ─── Results ─── */

export type CreditPointsBreakdown = {
  base: number
  marital: number
  children: number
  disabledChildren: number
  service: number
  reservist: number // זיכוי מילואים (Ron May 2026)
  pensionCredit: number // pension tax credit (₪/month)
  total: number // total credit points (not including pension credit)
  monthlyValue: number // total credit points × creditPointValue / 12
}

export type EmployeeBreakdown = {
  grossSalary: number
  travelAllowance: number
  vehicleTaxBenefit: number // שווי מס רכב component
  mealBenefit: number // שווי ארוחות component
  otherBenefit: number // שווי מס נוסף component
  totalShvuiMas: number // total שווי מס (vehicle + meals + other)
  imputedEducationFund: number // שווי זקופות השתלמות
  imputedPension: number // שווי זקופות תגמולים
  imputedSeverance: number // שווי זקופות פיצויים
  totalTaxableIncome: number // סה"כ שכר חייב במס

  // Deductions
  niiEmployee: number // ביטוח לאומי עובד
  incomeTax: number // מס הכנסה
  pensionEmployee: number // פנסיה עובד
  educationFundEmployee: number // השתלמות עובד
  totalDeductions: number

  // Net
  netWithShvui: number
  netWithoutShvui: number
  netDifference: number // פער נטו

  // Credit points detail
  totalCreditPoints: number
  creditPointsValue: number // monthly ₪
  creditPointsBreakdown: CreditPointsBreakdown
}

export type EmployerBreakdown = {
  grossSalary: number
  travelAllowance: number
  pensionEmployer: number // תגמולים מעסיק
  severanceEmployer: number // פיצויים מעסיק
  educationFundEmployer: number // השתלמות מעסיק
  niiEmployer: number // ביטוח לאומי מעסיק

  totalAdditionalCost: number // סה"כ תוספת עלות מעסיק
  totalWithShvui: number // סה"כ עלות מעסיק כולל שווי מס
  totalWithoutShvui: number // סה"כ עלות מעסיק ללא שווי מס
  costDifference: number // הפרש עלות מעסיק
}

export type EmployerCalcResult = {
  employee: EmployeeBreakdown
  employer: EmployerBreakdown
  vehicleTaxBenefit: number // shared reference
  hasShvuiMas: boolean
  totalShvuiMas: number
}

/* ─── Config ─── */

export type EmployerCalcConfig = {
  // Tax brackets (monthly)
  taxBrackets: { upTo: number; rate: number }[]
  // Credit point value
  creditPointValue: number // 2,904 for 2026
  // NII
  niiLowThreshold: number // 7,703
  niiHighThreshold: number // 51,910
  niiEmployeeLow: number // 4.27%
  niiEmployeeHigh: number // 12.17%
  niiEmployerLow: number // 4.51%
  niiEmployerHigh: number // 7.6%
  // Pension caps
  avgSalary: number // 13,769 שכר ממוצע במשק
  severanceCap: number // 34,900
  educationFundCap: number // 15,712
  // Vehicle
  vehicleTaxRate: number // 2.48%
  manufacturerPriceCap: number // 596,860
  electricReduction: number // 1,350
  plugInReduction: number // 1,130
  hybridReduction: number // 560
  // Tax thresholds
  surchargeThreshold: number // 60,130 מס יסף חודשי
  // Pension credit (employee)
  pensionCreditSalaryCap: number // 9,700
  pensionCreditRate: number // 0.07
  pensionCreditTaxRate: number // 0.35
  // Travel
  defaultTravelAllowance: number // 315
}
