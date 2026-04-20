/**
 * Leasing Calculator V2 — Pure Calculation Engine
 *
 * No React dependencies. All math lives here.
 * Handles: loan amortization, VAT recovery, tax deductions,
 * cashflow projections for all 3 option types × 4 vehicle types.
 */

import type {
  BaseInputs,
  PurchaseInputs,
  FinancialLeasingInputs,
  OperationalLeasingInputs,
  CalculationResult,
  CalculatorConfig,
  YearlyLoanBreakdown,
  OptionType,
  VehicleType,
} from './types'

import {
  getDepreciationRate,
  getVatRecoveryRate,
  getTaxDeductionMultiplier,
  getNiiSavingsRate,
  getResidualCarValue,
  getOperationalRateBracket,
  calculateVehicleTaxBenefit,
  calculateTaxSavings,
  COMPANY_TAX_RATE,
  NII_EMPLOYER_RATE_HIGH,
  NII_SALARY_THRESHOLD,
  NII_EMPLOYEE_RATE_LOW,
  NII_EMPLOYEE_RATE_HIGH,
} from './config'

/* ═══════════════════════════════════════════════
   Loan Amortization
   ═══════════════════════════════════════════════ */

type AmortizationResult = {
  monthlyPayment: number
  totalInterest: number
  yearlyBreakdown: YearlyLoanBreakdown[]
}

export function calculateAmortization(
  principal: number,
  annualRate: number,
  months: number
): AmortizationResult {
  if (principal <= 0 || months <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, yearlyBreakdown: [] }
  }

  const monthlyRate = annualRate / 100 / 12

  let monthlyPayment: number
  if (monthlyRate > 0) {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
  } else {
    monthlyPayment = principal / months
  }

  // Build yearly breakdown
  let balance = principal
  let totalInterest = 0
  const yearlyBreakdown: YearlyLoanBreakdown[] = []
  const totalYears = Math.ceil(months / 12)

  for (let year = 1; year <= totalYears; year++) {
    let yearInterest = 0
    let yearPrincipal = 0
    const monthsThisYear = Math.min(12, months - (year - 1) * 12)

    for (let m = 0; m < monthsThisYear; m++) {
      const interestPortion = balance * monthlyRate
      const principalPortion = monthlyPayment - interestPortion
      yearInterest += interestPortion
      yearPrincipal += principalPortion
      balance = Math.max(0, balance - principalPortion)
    }

    totalInterest += yearInterest
    yearlyBreakdown.push({
      year,
      interestPaid: Math.round(yearInterest),
      principalPaid: Math.round(yearPrincipal),
      endBalance: Math.round(balance),
    })
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    yearlyBreakdown,
  }
}

/* ═══════════════════════════════════════════════
   IRR / Effective Rate Solver (Newton-Raphson)
   ═══════════════════════════════════════════════ */

/**
 * Solve for the effective annual interest rate implied by a leasing deal.
 *
 * Cash flow model (from lender perspective):
 *   t=0:  -financedAmount (lender disburses)
 *   t=1…N: +monthlyPayment (lender receives)
 *   t=N:  +balloon (lender receives residual)
 *
 * Solves:  financedAmount = P·[1-(1+r)^(-N)]/r + B·(1+r)^(-N)
 * Returns annual rate as percentage (e.g. 6.5 for 6.5%), or 0 on failure.
 */
export function solveEffectiveRate(
  financedAmount: number,
  monthlyPayment: number,
  balloon: number,
  months: number,
): number {
  if (financedAmount <= 0 || monthlyPayment <= 0 || months <= 0) return 0

  // Quick check: if total payments < financed (impossible loan), return 0
  const totalOut = monthlyPayment * months + balloon
  if (totalOut <= financedAmount) return 0

  // Initial guess from simple interest approximation
  const totalInterest = totalOut - financedAmount
  let r = Math.max(0.0005, Math.min(0.04, (totalInterest / financedAmount / months) * 2))

  for (let i = 0; i < 100; i++) {
    const opr = 1 + r
    const oprN = Math.pow(opr, -months)

    // f(r) = P·[1-(1+r)^-N]/r + B·(1+r)^-N - F
    const pvPayments = monthlyPayment * (1 - oprN) / r
    const pvBalloon = balloon * oprN
    const f = pvPayments + pvBalloon - financedAmount

    // f'(r) — quotient rule on P·[1-(1+r)^-N]/r gives +N·(1+r)^(-N-1)/r term
    const oprN1 = Math.pow(opr, -months - 1)
    const df = monthlyPayment * (months * oprN1 / r - (1 - oprN) / (r * r))
      + balloon * (-months) * oprN1

    if (Math.abs(df) < 1e-15) break
    const delta = f / df
    r = Math.max(0.00001, r - delta)
    if (Math.abs(delta) < 1e-8) break
  }

  return r * 12 * 100 // monthly → annual %
}

/**
 * Amortization schedule for a loan with known monthly payment (may not fully amortize — balloon remainder).
 */
export function calculateAmortizationWithBalloon(
  principal: number,
  monthlyPayment: number,
  months: number,
  annualRate: number,
): AmortizationResult {
  if (principal <= 0 || months <= 0) {
    return { monthlyPayment, totalInterest: 0, yearlyBreakdown: [] }
  }

  const monthlyRate = annualRate / 100 / 12
  let balance = principal
  let totalInterest = 0
  const yearlyBreakdown: YearlyLoanBreakdown[] = []
  const totalYears = Math.ceil(months / 12)

  for (let year = 1; year <= totalYears; year++) {
    let yearInterest = 0
    let yearPrincipal = 0
    const monthsThisYear = Math.min(12, months - (year - 1) * 12)

    for (let m = 0; m < monthsThisYear; m++) {
      const interestPortion = balance * monthlyRate
      const principalPortion = monthlyPayment - interestPortion
      yearInterest += interestPortion
      yearPrincipal += principalPortion
      balance = balance - principalPortion
    }

    totalInterest += yearInterest
    yearlyBreakdown.push({
      year,
      interestPaid: Math.round(yearInterest),
      principalPaid: Math.round(yearPrincipal),
      endBalance: Math.round(balance),
    })
  }

  return { monthlyPayment, totalInterest: Math.round(totalInterest), yearlyBreakdown }
}

/* ═══════════════════════════════════════════════
   VAT Helpers
   ═══════════════════════════════════════════════ */

// Extract VAT from a VAT-inclusive amount
function extractVat(amountInclVat: number, vatRate: number): number {
  return amountInclVat - amountInclVat / (1 + vatRate)
}

/* ═══════════════════════════════════════════════
   Company Fields Helper
   ═══════════════════════════════════════════════ */

function computeCompanyFields(base: BaseInputs) {
  const { userType, vehicleType, monthlyIncome, manufacturerPrice, carPrice } = base
  const isCompanyOrEmployee = userType === 'company' || userType === 'employee'

  if (!isCompanyOrEmployee) {
    return { vehicleTaxBenefit: 0, grossIncludingVehicle: monthlyIncome, employerNii: 0 }
  }

  // Default manufacturerPrice to carPrice if not set (slider phantom-default fix)
  const mfp = manufacturerPrice || carPrice || 200000

  const vehicleTaxBenefit = calculateVehicleTaxBenefit(mfp, vehicleType)
  const grossIncludingVehicle = monthlyIncome + vehicleTaxBenefit

  // ביטוח לאומי מעביד on שווי מס — only if salary > threshold
  let employerNii = 0
  if (monthlyIncome > NII_SALARY_THRESHOLD) {
    employerNii = Math.round(vehicleTaxBenefit * NII_EMPLOYER_RATE_HIGH * 12)
  }

  return { vehicleTaxBenefit, grossIncludingVehicle, employerNii }
}

/* ═══════════════════════════════════════════════
   Purchase (יד 2) Calculation
   ═══════════════════════════════════════════════ */

export function calculatePurchase(
  base: BaseInputs,
  inputs: PurchaseInputs,
  config: CalculatorConfig
): CalculationResult {
  const { carPrice, vehicleType, monthlyIncome } = base
  const { equityPercent, interestSpread, periodMonths, fuelMonthly, maintenanceYearly, insuranceYearly } = inputs

  const equity = Math.round(carPrice * (equityPercent / 100))
  const loanPrincipal = carPrice - equity
  const annualRate = config.primeRate + interestSpread

  const amort = calculateAmortization(loanPrincipal, annualRate, periodMonths)

  // Depreciation (annual)
  const depRate = getDepreciationRate(vehicleType)
  const depreciation = Math.round(carPrice * depRate)

  // VAT recovery (annual) — on fuel + maintenance at recovery rate
  const vatRecoveryRate = getVatRecoveryRate(vehicleType)
  const fuelVatAnnual = extractVat(fuelMonthly * 12, config.vatRate) * vatRecoveryRate
  const maintVatAnnual = extractVat(maintenanceYearly, config.vatRate) * vatRecoveryRate
  const vatRecoverable = Math.round(fuelVatAnnual + maintVatAnnual)

  // Purchase: VAT on car purchase is NOT deductible for private vehicles
  // For commercial: full VAT deductible
  const isCommercial = vehicleType.startsWith('commercial')
  const vatOnPurchase = isCommercial ? Math.round(extractVat(carPrice, config.vatRate)) : null

  // Deductible expenses (annual) — Ron's spec section (ג)
  // = (maintenance + fuel + insurance + depreciation + loan interest) annualized, minus recovered VAT, × multiplier
  const annualFuel = fuelMonthly * 12
  const annualLoanInterest = amort.yearlyBreakdown.length > 0
    ? amort.yearlyBreakdown.reduce((sum, y) => sum + y.interestPaid, 0) / amort.yearlyBreakdown.length
    : 0

  const totalAnnualBeforeVat = maintenanceYearly + annualFuel + insuranceYearly + depreciation + annualLoanInterest
  const deductibleBase = totalAnnualBeforeVat - vatRecoverable
  const taxMultiplier = getTaxDeductionMultiplier(vehicleType)
  const deductibleExpenses = Math.round(deductibleBase * taxMultiplier)

  // Company/Employee fields
  const companyFields = computeCompanyFields(base)
  const isCompany = base.userType === 'company'
  const isEmployee = base.userType === 'employee'

  // Override for employee: no VAT recovery, no deductible expenses
  let finalVatRecoverable = vatRecoverable
  let finalDeductibleExpenses = deductibleExpenses
  if (isEmployee) {
    finalVatRecoverable = 0
    finalDeductibleExpenses = 0
  }

  // Tax savings — company uses 23% flat rate, self-employed uses marginal + NII, employee gets negative (cost)
  let annualTaxSavings: number
  let niiSavings: number
  let totalTaxSavings: number

  if (isCompany) {
    // Company: deductible = total expenses (100%), tax = 23% minus שווי מס impact
    const companyDeductible = totalAnnualBeforeVat - vatRecoverable - (companyFields.vehicleTaxBenefit * 12)
    annualTaxSavings = Math.round(companyDeductible * COMPANY_TAX_RATE)
    niiSavings = companyFields.employerNii
    totalTaxSavings = annualTaxSavings // NII is a COST for company, not savings
  } else if (isEmployee) {
    // Employee: no deductions. שווי מס INCREASES tax burden (bracket-by-bracket)
    const vehicleTaxAnnual = companyFields.vehicleTaxBenefit * 12
    // Tax cost = tax at (salary + שווי מס) minus tax at salary
    annualTaxSavings = -calculateTaxSavings(monthlyIncome + companyFields.vehicleTaxBenefit, vehicleTaxAnnual)
    const employeeNiiRate = monthlyIncome > NII_SALARY_THRESHOLD ? NII_EMPLOYEE_RATE_HIGH : NII_EMPLOYEE_RATE_LOW
    niiSavings = -Math.round(vehicleTaxAnnual * employeeNiiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  } else {
    // Self-employed: bracket-by-bracket tax savings from deductible expenses
    annualTaxSavings = calculateTaxSavings(monthlyIncome, finalDeductibleExpenses)
    const niiRate = getNiiSavingsRate(monthlyIncome)
    niiSavings = Math.round(finalDeductibleExpenses * niiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  }

  // Total annual expenses — CASHFLOW based (loan payment, not depreciation)
  // Ron's formula: fuel + maintenance + insurance + loan payment (principal+interest)
  const monthlyCashflow = Math.round(
    amort.monthlyPayment + fuelMonthly + maintenanceYearly / 12 + insuranceYearly / 12
  )
  const totalAnnualExpenses = monthlyCashflow * 12

  // Net-of-VAT display amounts (R18) — employee sees full price (no VAT recovery)
  const fuelMonthlyNetVat = isEmployee
    ? fuelMonthly
    : Math.round(fuelMonthly - (extractVat(fuelMonthly, config.vatRate) * vatRecoveryRate))
  const maintenanceYearlyNetVat = isEmployee
    ? maintenanceYearly
    : Math.round(maintenanceYearly - (extractVat(maintenanceYearly, config.vatRate) * vatRecoveryRate))

  const residualCarValue = getResidualCarValue(carPrice, periodMonths)

  return {
    optionType: 'purchase',
    vehicleType,
    carPrice,
    vatOnPurchase,
    equity,
    monthlyLeasingPayment: null,
    loan: loanPrincipal > 0
      ? { amount: loanPrincipal, annualRate, periodMonths, monthlyPayment: amort.monthlyPayment }
      : null,
    depreciation,
    fuelMonthly,
    maintenanceYearly,
    insuranceYearly,
    loanInterestTotal: amort.totalInterest,
    totalAnnualExpenses,
    loanYearlyBreakdown: amort.yearlyBreakdown,
    residualPayment: null,
    vatRecoverable: finalVatRecoverable,
    deductibleExpenses: finalDeductibleExpenses,
    monthlyCashflow,
    residualCarValue,
    annualTaxSavings,
    niiSavings,
    totalTaxSavings,
    fuelMonthlyNetVat,
    maintenanceYearlyNetVat,
    totalExpensesBeforeTax: Math.round(deductibleBase),
    vehicleTaxBenefit: companyFields.vehicleTaxBenefit,
    grossIncludingVehicle: companyFields.grossIncludingVehicle,
    employerNii: companyFields.employerNii,
    excessKmNote: false,
    computedEffectiveRate: null,
  } as CalculationResult
}

/* ═══════════════════════════════════════════════
   Financial Leasing (ליסינג מימוני) Calculation
   ═══════════════════════════════════════════════ */

export function calculateFinancialLeasing(
  base: BaseInputs,
  inputs: FinancialLeasingInputs,
  config: CalculatorConfig
): CalculationResult {
  const { carPrice, vehicleType, monthlyIncome } = base
  const {
    downPaymentPercent, residualPercent, tradeIn, tradeInAmount,
    monthlyLeasingPayment, periodMonths, fuelMonthly, maintenanceYearly, insuranceYearly,
  } = inputs

  const downPayment = Math.round(carPrice * (downPaymentPercent / 100))
  const residualPayment = Math.round(carPrice * (residualPercent / 100))
  const tradeInValue = tradeIn ? tradeInAmount : 0

  // Total financed = car price - down payment - trade-in (balloon stays as end-of-term obligation)
  const financedAmount = Math.max(0, carPrice - downPayment - tradeInValue)

  // Compute effective annual rate via IRR from the cash flows
  const computedRate = solveEffectiveRate(financedAmount, monthlyLeasingPayment, residualPayment, periodMonths)

  // Build amortization schedule using computed rate (remaining balance at end ≈ balloon)
  const amort = calculateAmortizationWithBalloon(financedAmount, monthlyLeasingPayment, periodMonths, computedRate)
  const annualRate = computedRate

  // Depreciation
  const depRate = getDepreciationRate(vehicleType)
  const depreciation = Math.round(carPrice * depRate)

  // VAT recovery
  const vatRecoveryRate = getVatRecoveryRate(vehicleType)
  const isCommercial = vehicleType.startsWith('commercial')

  const fuelVatAnnual = extractVat(fuelMonthly * 12, config.vatRate) * vatRecoveryRate
  const maintVatAnnual = extractVat(maintenanceYearly, config.vatRate) * vatRecoveryRate
  let vatRecoverable = Math.round(fuelVatAnnual + maintVatAnnual)

  // For commercial: also recover VAT on monthly loan payments
  if (isCommercial) {
    const monthlyLoanVat = extractVat(amort.monthlyPayment, config.vatRate)
    vatRecoverable += Math.round(monthlyLoanVat * 12)
  }

  // VAT on purchase
  const vatOnPurchase = isCommercial ? Math.round(extractVat(carPrice, config.vatRate)) : null

  // Deductible expenses
  const annualFuel = fuelMonthly * 12
  const annualLoanInterest = amort.yearlyBreakdown.length > 0
    ? amort.yearlyBreakdown.reduce((sum, y) => sum + y.interestPaid, 0) / amort.yearlyBreakdown.length
    : 0

  const totalAnnualBeforeVat = maintenanceYearly + annualFuel + insuranceYearly + depreciation + annualLoanInterest
  const deductibleBase = totalAnnualBeforeVat - vatRecoverable
  const taxMultiplier = getTaxDeductionMultiplier(vehicleType)
  const deductibleExpenses = Math.round(deductibleBase * taxMultiplier)

  // Company/Employee fields
  const companyFields = computeCompanyFields(base)
  const isCompanyMode = base.userType === 'company'
  const isEmployee = base.userType === 'employee'

  // Override for employee: no VAT recovery, no deductible expenses
  let finalVatRecoverable = vatRecoverable
  let finalDeductibleExpenses = deductibleExpenses
  if (isEmployee) {
    finalVatRecoverable = 0
    finalDeductibleExpenses = 0
  }

  // Tax savings
  let annualTaxSavings: number
  let niiSavings: number
  let totalTaxSavings: number

  if (isCompanyMode) {
    const companyDeductible = totalAnnualBeforeVat - vatRecoverable - (companyFields.vehicleTaxBenefit * 12)
    annualTaxSavings = Math.round(companyDeductible * COMPANY_TAX_RATE)
    niiSavings = companyFields.employerNii
    totalTaxSavings = annualTaxSavings
  } else if (isEmployee) {
    const vehicleTaxAnnual = companyFields.vehicleTaxBenefit * 12
    annualTaxSavings = -calculateTaxSavings(monthlyIncome + companyFields.vehicleTaxBenefit, vehicleTaxAnnual)
    const employeeNiiRate = monthlyIncome > NII_SALARY_THRESHOLD ? NII_EMPLOYEE_RATE_HIGH : NII_EMPLOYEE_RATE_LOW
    niiSavings = -Math.round(vehicleTaxAnnual * employeeNiiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  } else {
    annualTaxSavings = calculateTaxSavings(monthlyIncome, finalDeductibleExpenses)
    const niiRate = getNiiSavingsRate(monthlyIncome)
    niiSavings = Math.round(finalDeductibleExpenses * niiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  }

  // Cashflow-based expenses (leasing payment + running costs)
  const monthlyCashflow = Math.round(
    monthlyLeasingPayment + fuelMonthly + maintenanceYearly / 12 + insuranceYearly / 12
  )
  const totalAnnualExpenses = monthlyCashflow * 12

  // Net-of-VAT display amounts (R18) — employee sees full price (no VAT recovery)
  const fuelMonthlyNetVat = isEmployee
    ? fuelMonthly
    : Math.round(fuelMonthly - (extractVat(fuelMonthly, config.vatRate) * getVatRecoveryRate(vehicleType)))
  const maintenanceYearlyNetVat = isEmployee
    ? maintenanceYearly
    : Math.round(maintenanceYearly - (extractVat(maintenanceYearly, config.vatRate) * getVatRecoveryRate(vehicleType)))

  const residualCarValue = getResidualCarValue(carPrice, periodMonths)

  return {
    optionType: 'financialLeasing',
    vehicleType,
    carPrice,
    vatOnPurchase,
    equity: downPayment,
    monthlyLeasingPayment,
    loan: financedAmount > 0
      ? { amount: financedAmount, annualRate, periodMonths, monthlyPayment: monthlyLeasingPayment }
      : null,
    depreciation,
    fuelMonthly,
    maintenanceYearly,
    insuranceYearly,
    loanInterestTotal: amort.totalInterest,
    totalAnnualExpenses,
    loanYearlyBreakdown: amort.yearlyBreakdown,
    residualPayment,
    vatRecoverable: finalVatRecoverable,
    deductibleExpenses: finalDeductibleExpenses,
    monthlyCashflow,
    residualCarValue,
    annualTaxSavings,
    niiSavings,
    totalTaxSavings,
    fuelMonthlyNetVat,
    maintenanceYearlyNetVat,
    totalExpensesBeforeTax: Math.round(deductibleBase),
    vehicleTaxBenefit: companyFields.vehicleTaxBenefit,
    grossIncludingVehicle: companyFields.grossIncludingVehicle,
    employerNii: companyFields.employerNii,
    excessKmNote: false,
    computedEffectiveRate: computedRate > 0 ? computedRate : null,
  } as CalculationResult
}

/* ═══════════════════════════════════════════════
   Operational Leasing (ליסינג תפעולי) Calculation
   ═══════════════════════════════════════════════ */

export function calculateOperationalLeasing(
  base: BaseInputs,
  inputs: OperationalLeasingInputs,
  config: CalculatorConfig
): CalculationResult {
  const { carPrice, vehicleType, monthlyIncome } = base
  const { downPaymentPercent, monthlyLeasingPayment, fuelMonthly } = inputs

  const downPayment = Math.round(carPrice * (downPaymentPercent / 100))
  const isCommercial = vehicleType.startsWith('commercial')

  // VAT recovery — on fuel (at recovery rate) + on leasing payment (commercial only gets full, private gets 67%)
  const vatRecoveryRate = getVatRecoveryRate(vehicleType)
  const fuelVatAnnual = extractVat(fuelMonthly * 12, config.vatRate) * vatRecoveryRate

  let leasingVatAnnual = 0
  if (isCommercial) {
    // Commercial: full VAT recovery on leasing payments
    leasingVatAnnual = extractVat(monthlyLeasingPayment * 12, config.vatRate)
  }

  const vatRecoverable = Math.round(fuelVatAnnual + leasingVatAnnual)

  // VAT on down payment (commercial: deductible)
  const vatOnPurchase = isCommercial ? Math.round(extractVat(downPayment, config.vatRate)) : null

  // Deductible expenses — leasing payment + fuel, annualized, minus recovered VAT, × multiplier
  const annualLeasing = monthlyLeasingPayment * 12
  const annualFuel = fuelMonthly * 12
  const totalAnnualBeforeVat = annualLeasing + annualFuel
  const deductibleBase = totalAnnualBeforeVat - vatRecoverable
  const taxMultiplier = getTaxDeductionMultiplier(vehicleType)
  const deductibleExpenses = Math.round(deductibleBase * taxMultiplier)

  // Company/Employee fields
  const companyFields = computeCompanyFields(base)
  const isCompanyMode = base.userType === 'company'
  const isEmployee = base.userType === 'employee'

  // Override for employee: no VAT recovery, no deductible expenses
  let finalVatRecoverable = vatRecoverable
  let finalDeductibleExpenses = deductibleExpenses
  if (isEmployee) {
    finalVatRecoverable = 0
    finalDeductibleExpenses = 0
  }

  // Tax savings
  let annualTaxSavings: number
  let niiSavings: number
  let totalTaxSavings: number

  if (isCompanyMode) {
    const companyDeductible = totalAnnualBeforeVat - vatRecoverable - (companyFields.vehicleTaxBenefit * 12)
    annualTaxSavings = Math.round(companyDeductible * COMPANY_TAX_RATE)
    niiSavings = companyFields.employerNii
    totalTaxSavings = annualTaxSavings
  } else if (isEmployee) {
    const vehicleTaxAnnual = companyFields.vehicleTaxBenefit * 12
    annualTaxSavings = -calculateTaxSavings(monthlyIncome + companyFields.vehicleTaxBenefit, vehicleTaxAnnual)
    const employeeNiiRate = monthlyIncome > NII_SALARY_THRESHOLD ? NII_EMPLOYEE_RATE_HIGH : NII_EMPLOYEE_RATE_LOW
    niiSavings = -Math.round(vehicleTaxAnnual * employeeNiiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  } else {
    annualTaxSavings = calculateTaxSavings(monthlyIncome, finalDeductibleExpenses)
    const niiRate = getNiiSavingsRate(monthlyIncome)
    niiSavings = Math.round(finalDeductibleExpenses * niiRate)
    totalTaxSavings = annualTaxSavings + niiSavings
  }

  // Cashflow-based expenses (pure out-of-pocket — VAT recovery is in tax section)
  const monthlyCashflow = Math.round(monthlyLeasingPayment + fuelMonthly)
  const totalAnnualExpenses = monthlyCashflow * 12

  // Net-of-VAT (R18) — employee sees full price (no VAT recovery)
  const fuelMonthlyNetVat = isEmployee
    ? fuelMonthly
    : Math.round(fuelMonthly - (extractVat(fuelMonthly, config.vatRate) * vatRecoveryRate))

  return {
    optionType: 'operationalLeasing',
    vehicleType,
    carPrice,
    vatOnPurchase,
    equity: downPayment,
    monthlyLeasingPayment,
    loan: null,
    depreciation: 0,
    fuelMonthly,
    maintenanceYearly: null,
    insuranceYearly: null,
    loanInterestTotal: 0,
    totalAnnualExpenses,
    loanYearlyBreakdown: [],
    residualPayment: null,
    vatRecoverable: finalVatRecoverable,
    deductibleExpenses: finalDeductibleExpenses,
    monthlyCashflow,
    residualCarValue: null,
    annualTaxSavings,
    niiSavings,
    totalTaxSavings,
    fuelMonthlyNetVat,
    maintenanceYearlyNetVat: null,
    totalExpensesBeforeTax: Math.round(deductibleBase),
    vehicleTaxBenefit: companyFields.vehicleTaxBenefit,
    grossIncludingVehicle: companyFields.grossIncludingVehicle,
    employerNii: companyFields.employerNii,
    excessKmNote: true,
    computedEffectiveRate: null,
  } as CalculationResult
}

/* ═══════════════════════════════════════════════
   Dispatcher
   ═══════════════════════════════════════════════ */

export function calculateOption(
  optionType: OptionType,
  base: BaseInputs,
  inputs: PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs,
  config: CalculatorConfig
): CalculationResult {
  switch (optionType) {
    case 'purchase':
      return calculatePurchase(base, inputs as PurchaseInputs, config)
    case 'financialLeasing':
      return calculateFinancialLeasing(base, inputs as FinancialLeasingInputs, config)
    case 'operationalLeasing':
      return calculateOperationalLeasing(base, inputs as OperationalLeasingInputs, config)
  }
}

/* ═══════════════════════════════════════════════
   Default Inputs (smart prefill)
   ═══════════════════════════════════════════════ */

export function getDefaultPurchaseInputs(): PurchaseInputs {
  return {
    equityPercent: 25,
    interestSpread: 1,
    periodMonths: 60,
    fuelMonthly: 1500,
    maintenanceYearly: 5000,
    insuranceYearly: 7000,
  }
}

export function getDefaultFinancialInputs(carPrice: number): FinancialLeasingInputs {
  // Compute reasonable default monthly payment assuming ~7.5% annual rate (Ron's spec)
  const downPct = 0.15
  const residualPct = 0.30
  const financed = carPrice * (1 - downPct)
  const balloon = carPrice * residualPct
  const monthlyRate = 0.075 / 12 // 7.5% annual — Ron's benchmark rate
  const months = 60
  const oprN = Math.pow(1 + monthlyRate, -months)
  const defaultPayment = Math.round(((financed - balloon * oprN) * monthlyRate / (1 - oprN)) / 100) * 100

  return {
    downPaymentPercent: 15,
    residualPercent: 30,
    tradeIn: false,
    tradeInAmount: 0,
    monthlyLeasingPayment: Math.max(500, defaultPayment),
    periodMonths: 60,
    fuelMonthly: 1500,
    maintenanceYearly: 5000,
    insuranceYearly: 7000,
  }
}

export function getDefaultOperationalInputs(carPrice: number): OperationalLeasingInputs {
  const bracket = getOperationalRateBracket(carPrice)
  return {
    downPaymentPercent: 5,
    monthlyLeasingPayment: bracket.defaultRate,
    fuelMonthly: 1500,
    kmPerMonth: 1500,
  }
}
