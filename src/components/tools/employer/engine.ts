/**
 * Employer Cost Calculator — Calculation Engine V2
 * Full Israeli payroll math: tax brackets, NII, pension, severance,
 * education fund, זקופות, credit points, vehicle שווי שימוש,
 * meals, other benefits, service credits, disabled children, pension credit.
 */

import type {
  EmployerInputs,
  EmployerCalcResult,
  EmployerCalcConfig,
  EmployeeBreakdown,
  EmployerBreakdown,
  CreditPointsBreakdown,
  VehicleFuelType,
  Gender,
  MaritalStatus,
  ChildAge,
} from './types'
import { DEFAULT_EMPLOYER_CONFIG, CHILD_AGE_CREDITS, CHILD_ALLOWANCE_BONUS_AGES, getServiceCreditPoints } from './config'
import {
  MAS_YASAF_2026,
  NII_TABLE_2026,
  type NIICategory,
  type NIICategoryV2,
  type NIICalcType,
  getNIIRatesV2,
  migrateLegacyNIICategory,
} from '@/lib/tax-tables-2026'
import { calculateYishuvCredit } from './yishuv-mutav'
import { calculateDegreeCredit } from './degree-credits'

/* ═══════════════════════════════════════════════
   Vehicle Tax Benefit (שווי מס רכב)
   ═══════════════════════════════════════════════ */

export function calculateVehicleBenefit(
  manufacturerPrice: number,
  fuelType: VehicleFuelType,
  config: EmployerCalcConfig = DEFAULT_EMPLOYER_CONFIG
): number {
  if (fuelType === 'commercial' || manufacturerPrice <= 0) return 0

  const capped = Math.min(manufacturerPrice, config.manufacturerPriceCap)
  const base = Math.round(capped * config.vehicleTaxRate)

  const reductions: Record<string, number> = {
    petrol: 0,
    electric: config.electricReduction,
    plugIn: config.plugInReduction,
    hybrid: config.hybridReduction,
  }

  return Math.max(0, base - (reductions[fuelType] || 0))
}

/* ═══════════════════════════════════════════════
   Service Eligibility (חייל משוחרר — 36-mo window)
   ═══════════════════════════════════════════════ */

type YM = { month: number; year: number }

/**
 * Ron May 2026: military/national service credits apply for 36 months
 * starting the month AFTER service ended.
 * Example: service ended 1/2025 → eligibility 2/2025 - 1/2028 inclusive.
 * Eval date inside this window → eligible. Otherwise → not eligible.
 */
export function isServiceEligibleForCredit(serviceEnd: YM, evalDate: YM): boolean {
  // Window starts the month after service end
  let startMonth = serviceEnd.month + 1
  let startYear = serviceEnd.year
  if (startMonth > 12) { startMonth = 1; startYear += 1 }

  // Window ends 36 months later (inclusive of last month).
  // Last month = start + 35 months.
  const endTotal = startYear * 12 + (startMonth - 1) + 35
  const endYear = Math.floor(endTotal / 12)
  const endMonth = (endTotal % 12) + 1

  const evalKey = evalDate.year * 12 + evalDate.month
  const startKey = startYear * 12 + startMonth
  const endKey = endYear * 12 + endMonth

  return evalKey >= startKey && evalKey <= endKey
}

/* ═══════════════════════════════════════════════
   Reservist Credit (זיכוי מילואים)
   ═══════════════════════════════════════════════ */

/**
 * Ron May 2026 spec: reservist credit tiers (לוחם, prior tax year days).
 * - <30 days: 0 | 30-39: 0.5 | 40-49: 0.75 | ≥50: 1.0 + 0.25 per add'l 5 days
 * - Capped at 4.0 points (reached at 110 days). Beyond 110 days: stays 4.0.
 */
export function calculateReservistCredit(days: number): number {
  if (days < 30) return 0
  if (days < 40) return 0.5
  if (days < 50) return 0.75
  const extraSteps = Math.floor((days - 50) / 5)
  return Math.min(1.0 + extraSteps * 0.25, 4.0)
}

/* ═══════════════════════════════════════════════
   Credit Points (נקודות זיכוי) — returns breakdown
   ═══════════════════════════════════════════════ */

export function calculateCreditPoints(
  gender: Gender,
  maritalStatus: MaritalStatus,
  childrenAges: ChildAge[],
  employeeGetsChildAllowance: boolean,
  disabledChildrenCount: number,
  serviceType: 'military' | 'national' | 'none',
  serviceLevel: 'full' | 'partial' | 'none',
  reserveDays: number = 0,
): { base: number; marital: number; children: number; disabledChildren: number; service: number; reservist: number; total: number } {
  // Base: male 2.25, female 2.75
  const base = gender === 'female' ? 2.75 : 2.25

  // Marital: divorced = 1, single parent = 1, others = 0
  const marital = (maritalStatus === 'divorced' || maritalStatus === 'singleParent') ? 1 : 0

  // Children
  let children = 0
  for (const age of childrenAges) {
    const bracket = CHILD_AGE_CREDITS.find(b => age >= b.minAge && age <= b.maxAge)
    if (bracket) {
      let childPoints = bracket.points
      // If employee gets child allowance AND age 6-17 → double the points
      if (employeeGetsChildAllowance &&
          age >= CHILD_ALLOWANCE_BONUS_AGES.minAge &&
          age <= CHILD_ALLOWANCE_BONUS_AGES.maxAge) {
        childPoints *= CHILD_ALLOWANCE_BONUS_AGES.multiplier
      }
      children += childPoints
    }
  }

  // Disabled children: 2 points each (annual)
  const disabledChildren = disabledChildrenCount * 2

  // Service
  const service = getServiceCreditPoints(gender, serviceType, serviceLevel)

  // Reservist (זיכוי מילואים) — Ron May 2026
  const reservist = calculateReservistCredit(reserveDays)

  const total = base + marital + children + disabledChildren + service + reservist

  return { base, marital, children, disabledChildren, service, reservist, total }
}

/* ═══════════════════════════════════════════════
   Income Tax (מס הכנסה)
   ═══════════════════════════════════════════════ */

/**
 * Mas Yasaf (3% surtax) — applied separately on monthly income above threshold.
 * Per Ron's spec (April 30, 2026): credits offset regular brackets only, Mas Yasaf
 * is added on top after credits.
 */
function calculateMasYasaf(taxableIncome: number): number {
  const { threshold, rate } = MAS_YASAF_2026.monthly
  if (taxableIncome <= threshold) return 0
  return (taxableIncome - threshold) * rate
}

function calculateIncomeTax(
  taxableIncome: number,
  creditPointsMonthly: number,
  pensionDeduction: number,
  pensionCredit: number,
  config: EmployerCalcConfig,
  yishuvCredit: number = 0,
): number {
  // Taxable income reduced by pension deduction
  const adjustedIncome = Math.max(0, taxableIncome - pensionDeduction)

  let tax = 0
  let remaining = adjustedIncome

  const brackets = config.taxBrackets
  let prevUpTo = 0

  for (const bracket of brackets) {
    const bracketSize = bracket.upTo === Infinity
      ? remaining
      : Math.min(remaining, bracket.upTo - prevUpTo)

    if (bracketSize <= 0) break

    tax += bracketSize * bracket.rate
    remaining -= bracketSize
    prevUpTo = bracket.upTo
  }

  // Credits offset regular bracket tax only (cannot reduce below 0).
  // Yishuv mutav credit (Ron May 2026) is a tax credit — joins same offset.
  const taxAfterCredits = Math.max(0, tax - creditPointsMonthly - pensionCredit - yishuvCredit)

  // Mas Yasaf (3%) added on top — not offset by credits
  const masYasaf = calculateMasYasaf(adjustedIncome)

  return Math.round(taxAfterCredits + masYasaf)
}

/* ═══════════════════════════════════════════════
   National Insurance (ביטוח לאומי)
   ═══════════════════════════════════════════════ */

function calculateNII(
  taxableIncome: number,
  isEmployee: boolean,
  config: EmployerCalcConfig,
  categoryV2: NIICategoryV2 = '18-retirement',
  calcType: NIICalcType = 'regular',
): number {
  // Look up rates for the (category, calcType) pair from BTL Circular 1522.
  // For the default pair (18-retirement::regular) prefer config overrides
  // — preserves Sanity CMS control over the standard rates.
  const isDefaultPair = categoryV2 === '18-retirement' && calcType === 'regular'
  const rates = getNIIRatesV2(categoryV2, calcType)

  const lowRate = isDefaultPair
    ? (isEmployee ? config.niiEmployeeLow : config.niiEmployerLow)
    : (isEmployee ? rates.employeeLow : rates.employerLow)
  const highRate = isDefaultPair
    ? (isEmployee ? config.niiEmployeeHigh : config.niiEmployerHigh)
    : (isEmployee ? rates.employeeHigh : rates.employerHigh)

  let nii = 0

  if (taxableIncome <= config.niiLowThreshold) {
    nii = taxableIncome * lowRate
  } else {
    nii = config.niiLowThreshold * lowRate
    const highPortion = Math.min(taxableIncome - config.niiLowThreshold,
      config.niiHighThreshold - config.niiLowThreshold)
    nii += highPortion * highRate
  }

  return Math.round(nii)
}

/* ═══════════════════════════════════════════════
   Imputed Benefits (שווי זקופות)
   ═══════════════════════════════════════════════ */

function calculateImputedBenefits(
  pensionSalary: number,
  educationFundSalary: number,
  employerPensionRate: number,
  severanceRate: number,
  employerEducationRate: number,
  config: EmployerCalcConfig,
) {
  // תגמולים: above 2.5 × avg salary × 7.5%
  const pensionCap = config.avgSalary * 2.5 * 0.075
  const actualPension = pensionSalary * (employerPensionRate / 100)
  const imputedPension = Math.max(0, actualPension - pensionCap)

  // פיצויים: above 8.33% × 34,900
  const severanceCap = config.severanceCap * 0.0833
  const actualSeverance = pensionSalary * (severanceRate / 100)
  const imputedSeverance = Math.max(0, actualSeverance - severanceCap)

  // השתלמות: above employer% × 15,712
  const educationCap = config.educationFundCap * (employerEducationRate / 100)
  const actualEducation = educationFundSalary * (employerEducationRate / 100)
  const imputedEducation = Math.max(0, actualEducation - educationCap)

  return {
    imputedPension: Math.round(imputedPension),
    imputedSeverance: Math.round(imputedSeverance),
    imputedEducation: Math.round(imputedEducation),
  }
}

/* ═══════════════════════════════════════════════
   Pension Deduction & Credit for Tax (Employee-specific)
   ═══════════════════════════════════════════════ */

function calculatePensionTaxBenefits(
  pensionSalary: number,
  pensionCreditSalary: number,
  config: EmployerCalcConfig,
) {
  // Deduction: avg salary × 2% = monthly deduction cap
  const deductionCap = Math.round(config.avgSalary * 0.02)
  const pensionDeduction = Math.min(pensionSalary * 0.02, deductionCap)

  // Employee credit: min(pensionCreditSalary, pensionCreditSalaryCap) × 7% × 35%
  const insuredSalary = Math.min(pensionCreditSalary, config.pensionCreditSalaryCap)
  const maxDeposit = insuredSalary * config.pensionCreditRate
  const pensionCredit = Math.round(maxDeposit * config.pensionCreditTaxRate)

  return {
    pensionDeduction: Math.round(pensionDeduction),
    pensionCredit,
  }
}

/* ═══════════════════════════════════════════════
   Main Calculation
   ═══════════════════════════════════════════════ */

export function calculateEmployerCost(
  inputs: EmployerInputs,
  config: EmployerCalcConfig = DEFAULT_EMPLOYER_CONFIG,
): EmployerCalcResult {
  const {
    grossSalary, pensionSalary, travelAllowance,
    hasVehicle, vehicleFuelType, manufacturerPrice,
    hasMealBenefit, mealBenefitAmount,
    hasOtherBenefit, otherBenefitAmount,
    hasPension, hasEducationFund,
    gender, maritalStatus, childAllowanceRecipient, childrenAges,
    disabledChildrenCount, serviceType, serviceLevel,
    pensionCreditSalary,
  } = inputs
  const reserveDays = inputs.reserveDays ?? 0

  // NII v2 (Ron May 5, 2026): prefer the (category, calcType) pair.
  // For share-URL backwards-compat: if legacy `niiCategory` is non-default but v2
  // is still at default, migrate the legacy value to the new pair.
  const v2AtDefault = (inputs.niiCategoryV2 ?? '18-retirement') === '18-retirement'
    && (inputs.niiCalcType ?? 'regular') === 'regular'
  const legacyNonDefault = (inputs.niiCategory ?? 'standard') !== 'standard'
  const useLegacy = v2AtDefault && legacyNonDefault
  const niiCategoryV2: NIICategoryV2 = useLegacy
    ? migrateLegacyNIICategory(inputs.niiCategory!).category
    : (inputs.niiCategoryV2 ?? '18-retirement')
  const niiCalcType: NIICalcType = useLegacy
    ? migrateLegacyNIICategory(inputs.niiCategory!).calcType
    : (inputs.niiCalcType ?? 'regular')

  // Zero out rates when pension/education fund is disabled
  const employeePensionRate = hasPension ? inputs.employeePensionRate : 0
  const employerPensionRate = hasPension ? inputs.employerPensionRate : 0
  const severanceRate = hasPension ? inputs.severanceRate : 0
  const employeeEducationRate = hasEducationFund ? inputs.employeeEducationRate : 0
  const employerEducationRate = hasEducationFund ? inputs.employerEducationRate : 0
  const educationFundSalary = hasEducationFund ? inputs.educationFundSalary : 0

  // ─── Vehicle ───
  const vehicleTaxBenefit = hasVehicle
    ? calculateVehicleBenefit(manufacturerPrice, vehicleFuelType, config)
    : 0

  // ─── Total שווי מס ───
  const mealBenefit = hasMealBenefit ? mealBenefitAmount : 0
  const otherBenefit = hasOtherBenefit ? otherBenefitAmount : 0
  const totalShvuiMas = vehicleTaxBenefit + mealBenefit + otherBenefit
  const hasShvuiMas = totalShvuiMas > 0

  // ─── Imputed Benefits ───
  const imputed = calculateImputedBenefits(
    pensionSalary, educationFundSalary,
    employerPensionRate, severanceRate, employerEducationRate, config
  )

  // ─── Total Taxable Income ───
  // Display value (Ron #15: travel allowance does NOT appear in this row).
  const totalTaxableWithShvui = grossSalary + totalShvuiMas +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance
  const totalTaxableWithoutShvui = grossSalary +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance

  // Tax/NII calculation base (Ron #14: includes travel + שווי מס + שווי זקופות).
  // Display value above keeps travel separate; engine math always adds it.
  const taxCalcBaseWith = totalTaxableWithShvui + travelAllowance
  const taxCalcBaseWithout = totalTaxableWithoutShvui + travelAllowance

  // ─── Credit Points (with breakdown) ───
  const employeeGetsAllowance = childAllowanceRecipient === 'employee'

  // Ron May 2026: gate service credits by 36-month window from end of service.
  // If serviceEndDate provided AND eval date is outside window → suppress service.
  // If null → backwards-compat (apply credits as before).
  const eligibleForService = inputs.serviceEndDate === null || inputs.serviceEndDate === undefined
    ? true
    : isServiceEligibleForCredit(inputs.serviceEndDate, inputs.evaluationDate)
  const effectiveServiceType = eligibleForService ? serviceType : 'none'
  const effectiveServiceLevel = eligibleForService ? serviceLevel : 'none'

  const creditBreakdown = calculateCreditPoints(
    gender, maritalStatus, childrenAges, employeeGetsAllowance,
    disabledChildrenCount, effectiveServiceType, effectiveServiceLevel, reserveDays,
  )

  // Ron May 2026: degree/profession credit points. Window rules per type
  // (see degree-credits.ts). Joins the regular credit-point total.
  const degreeCredit = calculateDegreeCredit(inputs.degrees ?? [], inputs.evaluationDate.year)
  const totalCreditPoints = creditBreakdown.total + degreeCredit

  const creditPointsMonthly = Math.round((totalCreditPoints * config.creditPointValue) / 12)

  // ─── Pension Tax Benefits (employee-specific) ───
  const pensionTax = hasPension
    ? calculatePensionTaxBenefits(pensionSalary, pensionCreditSalary, config)
    : { pensionDeduction: 0, pensionCredit: 0 }

  // ─── Yishuv Mutav Credit (Ron May 2026) ───
  // Calculated on grossSalary (Ron's spec — not on tax calc base).
  const yishuvCredit = calculateYishuvCredit(grossSalary, inputs.yishuvName)

  // Build full credit points breakdown with pension + yishuv credits
  const creditPointsBreakdownFull: CreditPointsBreakdown = {
    base: creditBreakdown.base,
    marital: creditBreakdown.marital,
    children: creditBreakdown.children,
    disabledChildren: creditBreakdown.disabledChildren,
    service: creditBreakdown.service,
    reservist: creditBreakdown.reservist,
    pensionCredit: pensionTax.pensionCredit,
    yishuvCredit,
    degree: degreeCredit,
    total: totalCreditPoints,
    monthlyValue: creditPointsMonthly,
  }

  // ─── Employee Deductions WITH שווי מס ───
  const niiEmployeeWith = calculateNII(taxCalcBaseWith, true, config, niiCategoryV2, niiCalcType)
  const incomeTaxWith = calculateIncomeTax(
    taxCalcBaseWith, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config,
    yishuvCredit,
  )
  const pensionEmployeeAmount = Math.round(pensionSalary * (employeePensionRate / 100))
  const educationEmployeeAmount = Math.round(educationFundSalary * (employeeEducationRate / 100))
  const totalDeductionsWith = niiEmployeeWith + incomeTaxWith + pensionEmployeeAmount + educationEmployeeAmount
  const netWithShvui = grossSalary - totalDeductionsWith

  // ─── Employee Deductions WITHOUT שווי מס ───
  const niiEmployeeWithout = calculateNII(taxCalcBaseWithout, true, config, niiCategoryV2, niiCalcType)
  const incomeTaxWithout = calculateIncomeTax(
    taxCalcBaseWithout, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config,
    yishuvCredit,
  )
  const totalDeductionsWithout = niiEmployeeWithout + incomeTaxWithout + pensionEmployeeAmount + educationEmployeeAmount
  const netWithoutShvui = grossSalary - totalDeductionsWithout

  // ─── Employer Costs ───
  const pensionEmployer = Math.round(pensionSalary * (employerPensionRate / 100))
  const severanceEmployer = Math.round(pensionSalary * (severanceRate / 100))
  const educationEmployer = Math.round(educationFundSalary * (employerEducationRate / 100))

  // NII employer — on tax calc base (Ron #14: includes travel + שווי מס)
  const niiEmployerWith = calculateNII(taxCalcBaseWith, false, config, niiCategoryV2, niiCalcType)
  const niiEmployerWithout = calculateNII(taxCalcBaseWithout, false, config, niiCategoryV2, niiCalcType)

  // Employer total includes travel allowance
  const totalAdditionalCost = pensionEmployer + severanceEmployer + educationEmployer + niiEmployerWith
  const totalWithShvui = grossSalary + travelAllowance + totalAdditionalCost
  const totalAdditionalCostNoShvui = pensionEmployer + severanceEmployer + educationEmployer + niiEmployerWithout
  const totalWithoutShvui = grossSalary + travelAllowance + totalAdditionalCostNoShvui

  // ─── Build Result ───
  const employee: EmployeeBreakdown = {
    grossSalary,
    travelAllowance,
    vehicleTaxBenefit,
    mealBenefit,
    otherBenefit,
    totalShvuiMas,
    imputedEducationFund: imputed.imputedEducation,
    imputedPension: imputed.imputedPension,
    imputedSeverance: imputed.imputedSeverance,
    totalTaxableIncome: totalTaxableWithShvui,
    niiEmployee: niiEmployeeWith,
    incomeTax: incomeTaxWith,
    pensionEmployee: pensionEmployeeAmount,
    educationFundEmployee: educationEmployeeAmount,
    totalDeductions: totalDeductionsWith,
    netWithShvui,
    netWithoutShvui,
    netDifference: netWithoutShvui - netWithShvui,
    totalCreditPoints,
    creditPointsValue: creditPointsMonthly,
    creditPointsBreakdown: creditPointsBreakdownFull,
  }

  const employer: EmployerBreakdown = {
    grossSalary,
    travelAllowance,
    pensionEmployer,
    severanceEmployer,
    educationFundEmployer: educationEmployer,
    niiEmployer: niiEmployerWith,
    totalAdditionalCost,
    totalWithShvui,
    totalWithoutShvui,
    costDifference: totalWithShvui - totalWithoutShvui,
  }

  return { employee, employer, vehicleTaxBenefit, hasShvuiMas, totalShvuiMas }
}

/* ─── Default Inputs ─── */

export function getDefaultEmployerInputs(): EmployerInputs {
  return {
    grossSalary: 15_000,
    pensionSalary: 15_000,
    travelAllowance: 315,
    hasVehicle: false,
    vehicleFuelType: 'petrol',
    manufacturerPrice: 200_000,
    hasMealBenefit: false,
    mealBenefitAmount: 1_000,
    hasOtherBenefit: false,
    otherBenefitAmount: 1_000,
    hasPension: true,
    employeePensionRate: 6,
    employerPensionRate: 6.5,
    severanceRate: 6,
    disabilityRate: 0,
    hasEducationFund: false,
    educationFundSalary: 15_000,
    employeeEducationRate: 2.5,
    employerEducationRate: 7.5,
    gender: 'male',
    maritalStatus: 'married',
    childAllowanceRecipient: 'spouse',
    childrenAges: [],
    disabledChildrenCount: 0,
    serviceType: 'none',
    serviceLevel: 'none',
    serviceEndDate: null,
    reserveDays: 0,
    pensionCreditSalary: 9_700,
    niiCategory: 'standard',
    niiCategoryV2: '18-retirement',
    niiCalcType: 'regular',
    evaluationDate: (() => {
      const now = new Date()
      return { month: now.getMonth() + 1, year: now.getFullYear() }
    })(),
    yishuvName: null,
    degrees: [],
  }
}
