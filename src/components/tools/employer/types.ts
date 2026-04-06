/**
 * Employer Cost Calculator — Type Definitions
 * Based on Ron's spec (Google Doc pages 22-27, April 2026)
 */

export type VehicleFuelType = 'petrol' | 'electric' | 'plugIn' | 'hybrid' | 'commercial'

export type Gender = 'male' | 'female'
export type MaritalStatus = 'married' | 'divorced' | 'single' | 'widowed' | 'singleParent'
export type ChildAllowanceRecipient = 'employee' | 'spouse'

export type ChildAge = number // 0-17

/* ─── Inputs ─── */

export type EmployerInputs = {
  // Salary
  grossSalary: number // שכר ברוטו
  pensionSalary: number // שכר לצרכי פנסיה (default = grossSalary)

  // Vehicle
  vehicleFuelType: VehicleFuelType
  manufacturerPrice: number // מחיר יצרן רכב (0 = no vehicle)

  // Pension rates
  employeePensionRate: number // 6% or 7%
  employerPensionRate: number // 5%, 6.5%, or 7.5% (includes disability)
  severanceRate: number // 6% or 8.33%
  disabilityRate: number // 0%, 1.5%, or 2.5% (included in employerPensionRate cap 7.5%)

  // Education fund (קרן השתלמות)
  educationFundSalary: number // שכר לקרן השתלמות (default = min(grossSalary, 15712))
  employeeEducationRate: number // 2.5%
  employerEducationRate: number // 5% or 7.5%

  // Personal details (for tax credits)
  gender: Gender
  maritalStatus: MaritalStatus
  childAllowanceRecipient: ChildAllowanceRecipient
  childrenAges: ChildAge[] // array of ages (0-17)
}

/* ─── Results ─── */

export type EmployeeBreakdown = {
  grossSalary: number
  vehicleTaxBenefit: number // שווי מס רכב
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
  netWithVehicle: number
  netWithoutVehicle: number
  netDifference: number // פער נטו

  // Credit points detail
  totalCreditPoints: number
  creditPointsValue: number // monthly ₪
}

export type EmployerBreakdown = {
  grossSalary: number
  pensionEmployer: number // תגמולים מעסיק
  severanceEmployer: number // פיצויים מעסיק
  educationFundEmployer: number // השתלמות מעסיק
  niiEmployer: number // ביטוח לאומי מעסיק

  totalAdditionalCost: number // סה"כ תוספת עלות מעסיק
  totalWithVehicle: number // סה"כ עלות מעסיק כולל שווי רכב
  totalWithoutVehicle: number // סה"כ עלות מעסיק ללא שווי רכב
  costDifference: number // הפרש עלות מעסיק
}

export type EmployerCalcResult = {
  employee: EmployeeBreakdown
  employer: EmployerBreakdown
  vehicleTaxBenefit: number // shared reference
  hasVehicle: boolean
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
}
