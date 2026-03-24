/**
 * Leasing vs Purchase Simulator — Pure TypeScript Logic
 * No React dependencies. All computations and scoring live here.
 */

/* ─── Types ─── */

export type PriceRange = 'under130' | '130-160' | '160-250' | '250-400' | '400plus'

export type LeasingConfig = {
  updatedAt: string
  fringeBenefitRate: number
  depreciationRate: { min: number; max: number }
  freelancerDeduction: { low: number; mid: number; full: number }
  avgMonthlyRates: {
    operational: Record<PriceRange, number>
    financial: Record<PriceRange, number>
  }
  avgMaintenanceMonthly: number
  loanInterestRate: number
  downPaymentPercent: { low: number; high: number }
}

export type SimulatorAnswers = {
  businessType: 'company' | 'freelancer' | 'private'
  period: '1-2' | '2-3' | '3-4' | '4+'
  priority: 'cost' | 'comfort' | 'flexibility'
  priceRange: PriceRange | number
  downPayment: 'none' | 'up-to-20' | '30-50' | 'full'
}

export type OptionEstimate = {
  monthlyPayment: number
  totalCost: number
  taxBenefit: string
  highlights: string[]
}

export type SimulatorResult = {
  recommendation: 'operational' | 'financial' | 'purchase'
  confidence: 'strong' | 'moderate'
  options: {
    operational: OptionEstimate
    financial: OptionEstimate
    purchase: OptionEstimate
  }
}

/* ─── Default Config ─── */

export const DEFAULT_LEASING_CONFIG: LeasingConfig = {
  updatedAt: '2026-01-01',
  fringeBenefitRate: 0.0248,
  depreciationRate: { min: 0.15, max: 0.25 },
  freelancerDeduction: { low: 0.45, mid: 0.90, full: 1.0 },
  avgMonthlyRates: {
    operational: {
      under130: 2500,
      '130-160': 2900,
      '160-250': 3500,
      '250-400': 5000,
      '400plus': 7500,
    },
    financial: {
      under130: 1900,
      '130-160': 2200,
      '160-250': 2800,
      '250-400': 4200,
      '400plus': 6000,
    },
  },
  avgMaintenanceMonthly: 400,
  loanInterestRate: 0.075,
  downPaymentPercent: { low: 0.10, high: 0.20 },
}

/* ─── Helpers ─── */

const RANGE_MIDPOINTS: Record<PriceRange, number> = {
  under130: 110_000,
  '130-160': 145_000,
  '160-250': 200_000,
  '250-400': 320_000,
  '400plus': 500_000,
}

function getPrice(priceRange: PriceRange | number): number {
  if (typeof priceRange === 'number') return priceRange * 1000
  return RANGE_MIDPOINTS[priceRange]
}

function getRange(priceRange: PriceRange | number): PriceRange {
  if (typeof priceRange === 'string') return priceRange
  const priceK = priceRange
  if (priceK < 130) return 'under130'
  if (priceK < 160) return '130-160'
  if (priceK < 250) return '160-250'
  if (priceK < 400) return '250-400'
  return '400plus'
}

function getPeriodMonths(period: SimulatorAnswers['period']): number {
  switch (period) {
    case '1-2': return 18
    case '2-3': return 30
    case '3-4': return 42
    case '4+': return 54
  }
}

/* ─── Scoring ─── */

type Scores = { operational: number; financial: number; purchase: number }

function scoreBusinessType(type: SimulatorAnswers['businessType']): Scores {
  switch (type) {
    case 'company': return { operational: 10, financial: 10, purchase: 10 }
    case 'freelancer': return { operational: 7, financial: 8, purchase: 10 }
    case 'private': return { operational: 3, financial: 3, purchase: 10 }
  }
}

function scorePeriod(period: SimulatorAnswers['period']): Scores {
  switch (period) {
    case '1-2': return { operational: 10, financial: 5, purchase: 2 }
    case '2-3': return { operational: 7, financial: 10, purchase: 6 }
    case '3-4': return { operational: 4, financial: 7, purchase: 10 }
    case '4+': return { operational: 2, financial: 5, purchase: 10 }
  }
}

function scorePriority(priority: SimulatorAnswers['priority']): Scores {
  switch (priority) {
    case 'cost': return { operational: 4, financial: 7, purchase: 10 }
    case 'comfort': return { operational: 10, financial: 6, purchase: 3 }
    case 'flexibility': return { operational: 7, financial: 10, purchase: 3 }
  }
}

function scorePriceRange(priceRange: PriceRange | number): Scores {
  const range = getRange(priceRange)
  switch (range) {
    case 'under130': return { operational: 4, financial: 6, purchase: 10 }
    case '130-160': return { operational: 6, financial: 7, purchase: 9 }
    case '160-250': return { operational: 7, financial: 8, purchase: 7 }
    case '250-400': return { operational: 9, financial: 8, purchase: 5 }
    case '400plus': return { operational: 10, financial: 8, purchase: 4 }
  }
}

function scoreDownPayment(dp: SimulatorAnswers['downPayment']): Scores {
  switch (dp) {
    case 'none': return { operational: 10, financial: 8, purchase: 1 }
    case 'up-to-20': return { operational: 8, financial: 10, purchase: 5 }
    case '30-50': return { operational: 5, financial: 7, purchase: 10 }
    case 'full': return { operational: 2, financial: 3, purchase: 10 }
  }
}

/* ─── Tax Notes ─── */

function getTaxBenefit(businessType: SimulatorAnswers['businessType'], option: 'operational' | 'financial' | 'purchase'): string {
  if (businessType === 'company') {
    if (option === 'purchase') return 'כחברה, הפחת וכל הוצאות הרכב מוכרים במלואם'
    return 'כחברה, תשלומי הליסינג מוכרים כהוצאה במלואם'
  }
  if (businessType === 'freelancer') {
    return 'כעצמאי, ההוצאה מוכרת לפי שיעור השימוש העסקי (45%-100%)'
  }
  return 'לשכיר/פרטי אין הטבת מס ישירה על הוצאות רכב'
}

/* ─── Highlights ─── */

function getHighlights(
  option: 'operational' | 'financial' | 'purchase',
  answers: SimulatorAnswers,
): string[] {
  const { period, priority, businessType } = answers
  const isShort = period === '1-2' || period === '2-3'

  const pools: Record<'operational' | 'financial' | 'purchase', string[]> = {
    operational: [],
    financial: [],
    purchase: [],
  }

  // Context-dependent highlights
  if (isShort) {
    pools.operational.push('מתאים מצוין לתקופה קצרה', 'כל ההוצאות כלולות', 'ללא סיכון ערך שייר')
    pools.financial.push('אפשרות רכישה בסוף התקופה', 'תשלום חודשי נמוך מליסינג תפעולי', 'גמישות להחליף')
    pools.purchase.push('העלות הכוללת הנמוכה ביותר', 'בעלות מלאה ללא הגבלות', 'חיסכון משמעותי לאורך זמן')
  } else {
    pools.operational.push('תחזוקה ושירות כלולים', 'החלפת רכב קלה בסוף התקופה', 'ודאות תקציבית — סכום קבוע')
    pools.financial.push('בעלות על הרכב בסוף התקופה', 'תשלום חודשי נמוך יותר', 'מתאים לטווח ארוך')
    pools.purchase.push('ללא תשלומים חודשיים (לאחר פירעון)', 'בעלות מיידית מלאה', 'אין הגבלת קילומטרז\'')
  }

  if (priority === 'comfort') {
    pools.operational.push('אפס כאב ראש — הכל מנוהל')
  }
  if (priority === 'flexibility') {
    pools.financial.push('אפשרות להחזיר או לרכוש')
  }
  if (businessType === 'company') {
    pools.operational.push('הוצאה מוכרת מלאה')
    pools.financial.push('הוצאה מוכרת מלאה')
    pools.purchase.push('פחת מוכר כהוצאה')
  }

  // Return first 3 unique
  return [...new Set(pools[option])].slice(0, 3)
}

/* ─── Cost Estimation ─── */

function estimateOperational(
  answers: SimulatorAnswers,
  config: LeasingConfig,
): OptionEstimate {
  const range = getRange(answers.priceRange)
  const months = getPeriodMonths(answers.period)
  const monthly = config.avgMonthlyRates.operational[range]
  const total = monthly * months

  return {
    monthlyPayment: Math.round(monthly),
    totalCost: Math.round(total),
    taxBenefit: getTaxBenefit(answers.businessType, 'operational'),
    highlights: getHighlights('operational', answers),
  }
}

function estimateFinancial(
  answers: SimulatorAnswers,
  config: LeasingConfig,
): OptionEstimate {
  const range = getRange(answers.priceRange)
  const price = getPrice(answers.priceRange)
  const months = getPeriodMonths(answers.period)
  const rateBase = config.avgMonthlyRates.financial[range]

  // Adjust for down payment
  let downPaymentAmount = 0
  if (answers.downPayment === 'up-to-20') {
    downPaymentAmount = price * config.downPaymentPercent.low
  }

  const financed = price - downPaymentAmount
  const interestMonthly = (financed * config.loanInterestRate) / 12
  const monthly = rateBase + interestMonthly * 0.3 // rate already includes most finance cost; add marginal interest
  const total = monthly * months + downPaymentAmount

  return {
    monthlyPayment: Math.round(monthly),
    totalCost: Math.round(total),
    taxBenefit: getTaxBenefit(answers.businessType, 'financial'),
    highlights: getHighlights('financial', answers),
  }
}

function estimatePurchase(
  answers: SimulatorAnswers,
  config: LeasingConfig,
): OptionEstimate {
  const price = getPrice(answers.priceRange)
  const months = getPeriodMonths(answers.period)

  let downPaymentPct = 0
  if (answers.downPayment === 'full') downPaymentPct = 1.0
  else if (answers.downPayment === '30-50') downPaymentPct = 0.40
  else if (answers.downPayment === 'up-to-20') downPaymentPct = 0.15

  const downPayment = price * downPaymentPct
  const financed = price - downPayment
  const needsLoan = financed > 0

  let monthly = 0
  let total = price

  if (needsLoan) {
    // Simple amortized loan payment
    const r = config.loanInterestRate / 12
    if (r > 0 && months > 0) {
      monthly = (financed * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    } else {
      monthly = financed / months
    }
    total = monthly * months + downPayment
  }

  // Add maintenance
  monthly += config.avgMaintenanceMonthly
  total += config.avgMaintenanceMonthly * months

  return {
    monthlyPayment: Math.round(monthly),
    totalCost: Math.round(total),
    taxBenefit: getTaxBenefit(answers.businessType, 'purchase'),
    highlights: getHighlights('purchase', answers),
  }
}

/* ─── Main Computation ─── */

export function computeRecommendation(
  answers: SimulatorAnswers,
  config: LeasingConfig = DEFAULT_LEASING_CONFIG,
): SimulatorResult {
  // Accumulate scores
  const scoreFns = [
    scoreBusinessType(answers.businessType),
    scorePeriod(answers.period),
    scorePriority(answers.priority),
    scorePriceRange(answers.priceRange),
    scoreDownPayment(answers.downPayment),
  ]

  const totals: Scores = { operational: 0, financial: 0, purchase: 0 }
  for (const s of scoreFns) {
    totals.operational += s.operational
    totals.financial += s.financial
    totals.purchase += s.purchase
  }

  // Determine winner
  const maxScore = Math.max(totals.operational, totals.financial, totals.purchase)
  let recommendation: SimulatorResult['recommendation'] = 'operational'
  if (totals.financial === maxScore) recommendation = 'financial'
  if (totals.purchase === maxScore) recommendation = 'purchase'

  // Confidence: strong if winner leads by >30% of max possible (50)
  const sorted = [totals.operational, totals.financial, totals.purchase].sort((a, b) => b - a)
  const gap = sorted[0] - sorted[1]
  const confidence: SimulatorResult['confidence'] = gap > 50 * 0.3 ? 'strong' : 'moderate'

  return {
    recommendation,
    confidence,
    options: {
      operational: estimateOperational(answers, config),
      financial: estimateFinancial(answers, config),
      purchase: estimatePurchase(answers, config),
    },
  }
}
