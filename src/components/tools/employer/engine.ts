/**
 * Employer Cost Calculator — Calculation Engine
 * Full Israeli payroll math: tax brackets, NII, pension, severance,
 * education fund, זקופות, credit points, vehicle שווי שימוש.
 */

import type {
  EmployerInputs,
  EmployerCalcResult,
  EmployerCalcConfig,
  EmployeeBreakdown,
  EmployerBreakdown,
  VehicleFuelType,
  Gender,
  MaritalStatus,
  ChildAge,
} from './types'
import { DEFAULT_EMPLOYER_CONFIG, CHILD_AGE_CREDITS, CHILD_ALLOWANCE_BONUS_AGES } from './config'

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
   Credit Points (נקודות זיכוי)
   ═══════════════════════════════════════════════ */

export function calculateCreditPoints(
  gender: Gender,
  maritalStatus: MaritalStatus,
  childrenAges: ChildAge[],
  employeeGetsChildAllowance: boolean,
): number {
  // Base: male 2.25, female 2.75
  let points = gender === 'female' ? 2.75 : 2.25

  // Marital: divorced = 1, single parent = 1, others = 0
  if (maritalStatus === 'divorced' || maritalStatus === 'singleParent') {
    points += 1
  }

  // Children
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
      points += childPoints
    }
  }

  return points
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
   Pension Deduction & Credit for Tax
   ═══════════════════════════════════════════════ */

function calculatePensionTaxBenefits(
  pensionSalary: number,
  config: EmployerCalcConfig,
) {
  // Deduction: avg salary × 2% = monthly deduction cap
  const deductionCap = Math.round(config.avgSalary * 0.02)
  const pensionDeduction = Math.min(pensionSalary * 0.02, deductionCap)

  // Credit: avg salary × 5% × 35% = monthly credit cap
  const creditCap = Math.round(config.avgSalary * 0.05 * 0.35)
  const pensionCredit = Math.min(pensionSalary * 0.05 * 0.35, creditCap)

  return {
    pensionDeduction: Math.round(pensionDeduction),
    pensionCredit: Math.round(pensionCredit),
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
    grossSalary, pensionSalary, vehicleFuelType, manufacturerPrice,
    employeePensionRate, employerPensionRate, severanceRate,
    educationFundSalary, employeeEducationRate, employerEducationRate,
    gender, maritalStatus, childAllowanceRecipient, childrenAges,
  } = inputs

  // ─── Vehicle ───
  const vehicleTaxBenefit = calculateVehicleBenefit(manufacturerPrice, vehicleFuelType, config)
  const hasVehicle = vehicleTaxBenefit > 0

  // ─── Imputed Benefits ───
  const imputed = calculateImputedBenefits(
    pensionSalary, educationFundSalary,
    employerPensionRate, severanceRate, employerEducationRate, config
  )

  // ─── Total Taxable Income ───
  const totalTaxableWithVehicle = grossSalary + vehicleTaxBenefit +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance
  const totalTaxableWithoutVehicle = grossSalary +
    imputed.imputedEducation + imputed.imputedPension + imputed.imputedSeverance

  // ─── Credit Points ───
  const employeeGetsAllowance = childAllowanceRecipient === 'employee'
  const totalCreditPoints = calculateCreditPoints(gender, maritalStatus, childrenAges, employeeGetsAllowance)
  const creditPointsMonthly = Math.round((totalCreditPoints * config.creditPointValue) / 12)

  // ─── Pension Tax Benefits ───
  const pensionTax = calculatePensionTaxBenefits(pensionSalary, config)

  // ─── Employee Deductions WITH Vehicle ───
  const niiEmployeeWith = calculateNII(totalTaxableWithVehicle, true, config)
  const incomeTaxWith = calculateIncomeTax(
    totalTaxableWithVehicle, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config
  )
  const pensionEmployeeAmount = Math.round(pensionSalary * (employeePensionRate / 100))
  const educationEmployeeAmount = Math.round(educationFundSalary * (employeeEducationRate / 100))
  const totalDeductionsWith = niiEmployeeWith + incomeTaxWith + pensionEmployeeAmount + educationEmployeeAmount
  const netWithVehicle = grossSalary - totalDeductionsWith

  // ─── Employee Deductions WITHOUT Vehicle ───
  const niiEmployeeWithout = calculateNII(totalTaxableWithoutVehicle, true, config)
  const incomeTaxWithout = calculateIncomeTax(
    totalTaxableWithoutVehicle, creditPointsMonthly,
    pensionTax.pensionDeduction, pensionTax.pensionCredit, config
  )
  const totalDeductionsWithout = niiEmployeeWithout + incomeTaxWithout + pensionEmployeeAmount + educationEmployeeAmount
  const netWithoutVehicle = grossSalary - totalDeductionsWithout

  // ─── Employer Costs ───
  const pensionEmployer = Math.round(pensionSalary * (employerPensionRate / 100))
  const severanceEmployer = Math.round(pensionSalary * (severanceRate / 100))
  const educationEmployer = Math.round(educationFundSalary * (employerEducationRate / 100))

  // NII employer — on taxable income (WITHOUT pension deduction per Ron's spec)
  const niiEmployerWith = calculateNII(totalTaxableWithVehicle, false, config)
  const niiEmployerWithout = calculateNII(totalTaxableWithoutVehicle, false, config)

  const totalAdditionalCost = pensionEmployer + severanceEmployer + educationEmployer + niiEmployerWith
  const totalWithVehicle = grossSalary + totalAdditionalCost
  const totalAdditionalCostNoVehicle = pensionEmployer + severanceEmployer + educationEmployer + niiEmployerWithout
  const totalWithoutVehicle = grossSalary + totalAdditionalCostNoVehicle

  // ─── Build Result ───
  const employee: EmployeeBreakdown = {
    grossSalary,
    vehicleTaxBenefit,
    imputedEducationFund: imputed.imputedEducation,
    imputedPension: imputed.imputedPension,
    imputedSeverance: imputed.imputedSeverance,
    totalTaxableIncome: totalTaxableWithVehicle,
    niiEmployee: niiEmployeeWith,
    incomeTax: incomeTaxWith,
    pensionEmployee: pensionEmployeeAmount,
    educationFundEmployee: educationEmployeeAmount,
    totalDeductions: totalDeductionsWith,
    netWithVehicle,
    netWithoutVehicle,
    netDifference: netWithoutVehicle - netWithVehicle,
    totalCreditPoints,
    creditPointsValue: creditPointsMonthly,
  }

  const employer: EmployerBreakdown = {
    grossSalary,
    pensionEmployer,
    severanceEmployer,
    educationFundEmployer: educationEmployer,
    niiEmployer: niiEmployerWith,
    totalAdditionalCost,
    totalWithVehicle,
    totalWithoutVehicle,
    costDifference: totalWithVehicle - totalWithoutVehicle,
  }

  return { employee, employer, vehicleTaxBenefit, hasVehicle }
}

/* ─── Default Inputs ─── */

export function getDefaultEmployerInputs(): EmployerInputs {
  return {
    grossSalary: 15_000,
    pensionSalary: 15_000,
    vehicleFuelType: 'petrol',
    manufacturerPrice: 200_000,
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
  }
}
