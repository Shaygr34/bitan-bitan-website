/**
 * Leasing Calculator V2 — Type Definitions
 * Based on Ron's spec (21-page PDF, March 2026)
 */

export type UserType = 'selfEmployed' | 'employee'

export type VehicleType =
  | 'privatePetrol'
  | 'privateElectric'
  | 'commercialPetrol'
  | 'commercialElectric'

export type OptionType = 'purchase' | 'financialLeasing' | 'operationalLeasing'

/* ─── Inputs ─── */

export type BaseInputs = {
  userType: UserType
  vehicleType: VehicleType
  carPrice: number // ₪ including VAT
  monthlyIncome: number // gross monthly ₪
}

export type PurchaseInputs = {
  equityPercent: number // 0–100
  interestSpread: number // spread over prime, e.g. 1 = P+1%
  periodMonths: number // 24, 36, 48, 60
  fuelMonthly: number // ₪/month incl VAT
  maintenanceYearly: number // ₪/year
  insuranceYearly: number // ₪/year incl license
}

export type FinancialLeasingInputs = {
  downPaymentPercent: number // % of car price
  residualPercent: number // end-of-term residual as % of car price
  tradeIn: boolean
  tradeInAmount: number // ₪ received for old car
  interestSpread: number
  periodMonths: number
  fuelMonthly: number
  maintenanceYearly: number
  insuranceYearly: number
}

export type OperationalLeasingInputs = {
  downPaymentPercent: number
  monthlyLeasingPayment: number // ₪/month incl VAT
  fuelMonthly: number // ₪/month (petrol) or electricity cost
  kmPerMonth: number // for electric vehicles
}

/* ─── Calculation Results ─── */

export type YearlyLoanBreakdown = {
  year: number
  interestPaid: number
  principalPaid: number
  endBalance: number
}

export type CalculationResult = {
  optionType: OptionType
  vehicleType: VehicleType
  carPrice: number
  vatOnPurchase: number | null // null = not deductible
  equity: number // ₪ down payment / equity
  monthlyLeasingPayment: number | null // null for purchase
  loan: {
    amount: number
    annualRate: number
    periodMonths: number
    monthlyPayment: number
  } | null
  depreciation: number // annual ₪
  fuelMonthly: number
  maintenanceYearly: number | null // null for operational
  insuranceYearly: number | null // null for operational
  loanInterestTotal: number // total interest over full period (a)
  totalAnnualExpenses: number // (z)
  loanYearlyBreakdown: YearlyLoanBreakdown[] // (d)
  residualPayment: number | null // end-of-term balloon
  vatRecoverable: number // annual (b)
  deductibleExpenses: number // annual (c)
  monthlyCashflow: number // average monthly out-of-pocket (e)
  residualCarValue: number | null // market value after 5 years (f)
  annualTaxSavings: number // income tax savings
  niiSavings: number // national insurance savings (ביטוח לאומי)
  totalTaxSavings: number // annualTaxSavings + niiSavings
  // Net-of-VAT amounts for display
  fuelMonthlyNetVat: number // fuel minus recoverable VAT portion
  maintenanceYearlyNetVat: number | null // maintenance minus recoverable VAT
  // Pre-tax total for commercial display
  totalExpensesBeforeTax: number // before deduction multiplier
  // Excess km note for operational leasing
  excessKmNote: boolean
}

/* ─── Config ─── */

export type CalculatorConfig = {
  primeRate: number // e.g. 4.75
  vatRate: number // e.g. 0.18 (18%)
  updatedAt: string
}

/* ─── Wizard State ─── */

export type WizardPhase = 'base' | 'pickOption' | 'details' | 'results'

export type WizardState = {
  phase: WizardPhase
  base: Partial<BaseInputs>
  primaryOption: OptionType | null
  primaryInputs: Partial<PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs>
  primaryResult: CalculationResult | null
  comparisonOption: OptionType | null
  comparisonInputs: Partial<PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs>
  comparisonResult: CalculationResult | null
}
