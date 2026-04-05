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
  getMarginalTaxRate,
  getResidualCarValue,
  getOperationalRateBracket,
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
   VAT Helpers
   ═══════════════════════════════════════════════ */

// Extract VAT from a VAT-inclusive amount
function extractVat(amountInclVat: number, vatRate: number): number {
  return amountInclVat - amountInclVat / (1 + vatRate)
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

  // Tax savings
  const marginalRate = getMarginalTaxRate(monthlyIncome)
  const annualTaxSavings = Math.round(deductibleExpenses * marginalRate)

  // Total annual expenses (ז) — loan interest + fuel + insurance + maintenance + depreciation - VAT recovered
  const totalAnnualExpenses = Math.round(
    annualLoanInterest + annualFuel + insuranceYearly + maintenanceYearly + depreciation - vatRecoverable
  )

  // Monthly cashflow (ה) — loan payment + fuel + maintenance/12 + insurance/12
  const monthlyCashflow = Math.round(
    amort.monthlyPayment + fuelMonthly + maintenanceYearly / 12 + insuranceYearly / 12
  )

  // Residual car value after 5 years
  const residualCarValue = getResidualCarValue(carPrice)

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
    vatRecoverable,
    deductibleExpenses,
    monthlyCashflow,
    residualCarValue,
    annualTaxSavings,
    excessKmNote: false,
  }
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
    interestSpread, periodMonths, fuelMonthly, maintenanceYearly, insuranceYearly,
  } = inputs

  const downPayment = Math.round(carPrice * (downPaymentPercent / 100))
  const residualPayment = Math.round(carPrice * (residualPercent / 100))
  const tradeInValue = tradeIn ? tradeInAmount : 0

  // Loan = car price - down payment - residual (balloon at end)
  const loanPrincipal = Math.max(0, carPrice - downPayment - residualPayment)
  const annualRate = config.primeRate + interestSpread

  const amort = calculateAmortization(loanPrincipal, annualRate, periodMonths)

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

  // Tax savings
  const marginalRate = getMarginalTaxRate(monthlyIncome)
  const annualTaxSavings = Math.round(deductibleExpenses * marginalRate)

  // Total annual expenses
  const totalAnnualExpenses = Math.round(
    annualLoanInterest + annualFuel + insuranceYearly + maintenanceYearly + depreciation - vatRecoverable
  )

  // Monthly cashflow
  const monthlyCashflow = Math.round(
    amort.monthlyPayment + fuelMonthly + maintenanceYearly / 12 + insuranceYearly / 12
  )

  const residualCarValue = getResidualCarValue(carPrice)

  return {
    optionType: 'financialLeasing',
    vehicleType,
    carPrice,
    vatOnPurchase,
    equity: downPayment,
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
    residualPayment,
    vatRecoverable,
    deductibleExpenses,
    monthlyCashflow,
    residualCarValue,
    annualTaxSavings,
    excessKmNote: false,
  }
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

  // Tax savings
  const marginalRate = getMarginalTaxRate(monthlyIncome)
  const annualTaxSavings = Math.round(deductibleExpenses * marginalRate)

  // Total annual expenses
  const totalAnnualExpenses = Math.round(annualLeasing + annualFuel - vatRecoverable)

  // Monthly cashflow — leasing + fuel
  const monthlyCashflow = Math.round(monthlyLeasingPayment + fuelMonthly)

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
    vatRecoverable,
    deductibleExpenses,
    monthlyCashflow,
    residualCarValue: null,
    annualTaxSavings,
    // Note about excess km charges above 20,000 km/year
    excessKmNote: true,
  }
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

export function getDefaultFinancialInputs(): FinancialLeasingInputs {
  return {
    downPaymentPercent: 15,
    residualPercent: 30,
    tradeIn: false,
    tradeInAmount: 0,
    interestSpread: 2,
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
