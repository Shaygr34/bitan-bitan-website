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
): { base: number; marital: number; children: number; disabledChildren: number; service: number; total: number } {
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

  const total = base + marital + children + disabledChildren + service

  return { base, marital, children, disabledChildren, service, total }
}

/* ═══════════════════════════════════════════════
   Income Tax (מס הכנסה)
   ═══════════════════════════════════════════════ */

function calculateIncomeTax(
  taxableIncome: number,
  creditPointsMonthly: number,
  pensionDeduction: number,
  pensionCredit: number,
  config: EmployerCalcConfig,
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

  // Subtract credit points value + pension credit
  tax = Math.max(0, tax - creditPointsMonthly - pensionCredit)

  return Math.round(tax)
}

/* ═══════════════════════════════════════════════
   National Insurance (ביטוח לאומי)
   ═══════════════════════════════════════════════ */

function calculateNII(
  taxableIncome: number,
  isEmployee: boolean,
  config: EmployerCalcConfig,
): number {
  const lowRate = isEmployee ? config.niiEmployeeLow : config.niiEmployerLow
  const highRate = isEmployee ? config.niiEmployeeHigh : config.niiEmployerHigh

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
    employeePensionRate, employerPensionRate, severanceRate,
    educationFundSalary, employeeEducationRate, employerEducationRate,
    gender, maritalStatus, childAllowanceRecipient, childrenAges,
    disabledChildrenCount, serviceType, serviceLevel,
    pensionCreditSalary,
  } = inputs

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
  const totalTaxableWithShvui = grossSalary + totalShvuiMas +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance
  const totalTaxableWithoutShvui = grossSalary +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance

  // ─── Credit Points (with breakdown) ───
  const employeeGetsAllowance = childAllowanceRecipient === 'employee'
  const creditBreakdown = calculateCreditPoints(
    gender, maritalStatus, childrenAges, employeeGetsAllowance,
    disabledChildrenCount, serviceType, serviceLevel,
  )
  const creditPointsMonthly = Math.round((creditBreakdown.total * config.creditPointValue) / 12)

  // ─── Pension Tax Benefits (employee-specific) ───
  const pensionTax = calculatePensionTaxBenefits(pensionSalary, pensionCreditSalary, config)

  // Build full credit points breakdown with pension credit
  const creditPointsBreakdownFull: CreditPointsBreakdown = {
    base: creditBreakdown.base,
    marital: creditBreakdown.marital,
    children: creditBreakdown.children,
    disabledChildren: creditBreakdown.disabledChildren,
    service: creditBreakdown.service,
    pensionCredit: pensionTax.pensionCredit,
    total: creditBreakdown.total,
    monthlyValue: creditPointsMonthly,
  }

  // ─── Employee Deductions WITH שווי מס ───
  const niiEmployeeWith = calculateNII(totalTaxableWithShvui, true, config)
  const incomeTaxWith = calculateIncomeTax(
    totalTaxableWithShvui, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config
  )
  const pensionEmployeeAmount = Math.round(pensionSalary * (employeePensionRate / 100))
  const educationEmployeeAmount = Math.round(educationFundSalary * (employeeEducationRate / 100))
  const totalDeductionsWith = niiEmployeeWith + incomeTaxWith + pensionEmployeeAmount + educationEmployeeAmount
  const netWithShvui = grossSalary - totalDeductionsWith

  // ─── Employee Deductions WITHOUT שווי מס ───
  const niiEmployeeWithout = calculateNII(totalTaxableWithoutShvui, true, config)
  const incomeTaxWithout = calculateIncomeTax(
    totalTaxableWithoutShvui, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config
  )
  const totalDeductionsWithout = niiEmployeeWithout + incomeTaxWithout + pensionEmployeeAmount + educationEmployeeAmount
  const netWithoutShvui = grossSalary - totalDeductionsWithout

  // ─── Employer Costs ───
  const pensionEmployer = Math.round(pensionSalary * (employerPensionRate / 100))
  const severanceEmployer = Math.round(pensionSalary * (severanceRate / 100))
  const educationEmployer = Math.round(educationFundSalary * (employerEducationRate / 100))

  // NII employer — on taxable income (WITHOUT pension deduction per Ron's spec)
  const niiEmployerWith = calculateNII(totalTaxableWithShvui, false, config)
  const niiEmployerWithout = calculateNII(totalTaxableWithoutShvui, false, config)

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
    totalCreditPoints: creditBreakdown.total,
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
    employeePensionRate: 6,
    employerPensionRate: 6.5,
    severanceRate: 6,
    disabilityRate: 0,
    educationFundSalary: 15_000,
    employeeEducationRate: 2.5,
    employerEducationRate: 7.5,
    gender: 'male',
    maritalStatus: 'married',
    childAllowanceRecipient: 'spouse',
    childrenAges: [],
    disabledChildrenCount: 0,
    serviceType: 'military',
    serviceLevel: 'none',
    pensionCreditSalary: 9_700,
  }
}
