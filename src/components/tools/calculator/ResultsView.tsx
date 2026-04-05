'use client'

import { ArrowLeft, Calculator, TrendingDown, Receipt, Wallet, Info } from 'lucide-react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import type { CalculationResult, OptionType } from './types'

type ResultsViewProps = {
  primary: CalculationResult
  comparison: CalculationResult | null
  onCompare: () => void
  onRestart: () => void
}

const OPTION_NAMES: Record<OptionType, string> = {
  purchase: 'רכישה יד 2',
  financialLeasing: 'ליסינג מימוני',
  operationalLeasing: 'ליסינג תפעולי',
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('he-IL')
}

function fmtCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'לא רלוונטי'
  return `${fmt(n)} ₪`
}

export function ResultsView({ primary, comparison, onCompare, onRestart }: ResultsViewProps) {
  const results = comparison ? [primary, comparison] : [primary]
  const hasComparison = !!comparison

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">
        {hasComparison ? 'השוואת תוצאות' : 'תוצאות החישוב'}
      </h2>
      <p className="text-body text-text-muted text-center mb-space-7">
        כל הסכומים שנתיים אלא אם צוין אחרת
      </p>

      {/* Result Cards / Comparison */}
      {hasComparison ? (
        <>
          <Verdict primary={primary} comparison={comparison!} />
          <ComparisonTable results={results} />
        </>
      ) : (
        <SingleResult result={primary} />
      )}

      {/* CTA Section */}
      <div className="mt-space-8 text-center">
        {!hasComparison && (
          <button
            type="button"
            onClick={onCompare}
            className="mb-space-4 rounded-xl border-2 border-gold px-6 py-3 text-body font-bold text-gold hover:bg-gold/5 cursor-pointer transition-all duration-base block mx-auto"
          >
            השווה מול אפשרות נוספת
          </button>
        )}

        <h3 className="text-h3 font-bold text-primary mb-space-3">
          רוצים חישוב מדויק?
        </h3>
        <p className="text-body text-text-secondary max-w-narrow mx-auto mb-space-6">
          המחשבון נותן הערכה כללית. לחישוב מדויק המותאם למצב שלכם — דברו איתנו.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" location="leasing-calculator" />
          <PhoneCTA label="חייגו אלינו" variant="secondary" location="leasing-calculator" />
        </div>

        <div className="flex justify-center gap-4 mt-space-4">
          {hasComparison && (
            <button
              type="button"
              onClick={onCompare}
              className="inline-flex items-center gap-1 text-gold underline cursor-pointer text-body hover:text-gold-hover transition-colors"
            >
              השווה אפשרות אחרת
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1 text-gold underline cursor-pointer text-body hover:text-gold-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            התחל מחדש
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Single Result Card
   ═══════════════════════════════════════════════ */

function SingleResult({ result }: { result: CalculationResult }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-space-5 py-space-4 flex items-center gap-3">
        <Calculator className="h-5 w-5 text-gold" />
        <h3 className="text-body-lg font-bold text-white">
          {OPTION_NAMES[result.optionType]}
        </h3>
      </div>

      {/* Key Metrics */}
      <div className="p-space-5">
        <div className="grid grid-cols-2 gap-3 mb-space-5">
          <MetricCard
            icon={<Wallet className="h-4 w-4 text-gold" />}
            label="תשלום חודשי ממוצע"
            value={fmtCurrency(result.monthlyCashflow)}
            highlight
          />
          <MetricCard
            icon={<Receipt className="h-4 w-4 text-gold" />}
            label="סה״כ הוצאות שנתי"
            value={fmtCurrency(result.totalAnnualExpenses)}
          />
          <MetricCard
            icon={<TrendingDown className="h-4 w-4 text-gold" />}
            label="חיסכון מס שנתי"
            value={fmtCurrency(result.annualTaxSavings)}
          />
          {result.residualCarValue !== null && (
            <MetricCard
              icon={<Info className="h-4 w-4 text-gold" />}
              label="שווי רכב לאחר 5 שנים"
              value={fmtCurrency(result.residualCarValue)}
            />
          )}
        </div>

        {/* Full breakdown */}
        <ResultBreakdown result={result} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Comparison Table
   ═══════════════════════════════════════════════ */

function ComparisonTable({ results }: { results: CalculationResult[] }) {
  const rows = getComparisonRows()

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="p-space-4 text-body-sm text-text-muted font-medium text-start bg-surface border-b border-border w-1/3" />
              {results.map((r) => (
                <th key={r.optionType} className="p-space-4 bg-surface border-b border-border">
                  <span className="text-body font-bold text-primary block">
                    {OPTION_NAMES[r.optionType]}
                  </span>
                  <span className="text-body-lg font-bold text-gold block mt-1">
                    {fmtCurrency(r.monthlyCashflow)}/חודש
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}>
                <td className="p-space-3 text-body-sm text-text-muted font-medium text-start border-e border-border-light">
                  {row.label}
                </td>
                {results.map((r) => (
                  <td key={r.optionType} className="p-space-3 text-body-sm text-text-secondary">
                    {row.getValue(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-space-4">
        {results.map((r) => (
          <SingleResult key={r.optionType} result={r} />
        ))}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   Result Breakdown Table
   ═══════════════════════════════════════════════ */

function ResultBreakdown({ result }: { result: CalculationResult }) {
  const r = result
  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: 'עלות רכב', value: fmtCurrency(r.carPrice) },
    {
      label: 'מע"מ רכישת רכב',
      value: r.vatOnPurchase !== null ? `מוכר — ${fmtCurrency(r.vatOnPurchase)}` : 'לא מוכר',
      muted: r.vatOnPurchase === null,
    },
    { label: 'הון עצמי / מקדמה', value: fmtCurrency(r.equity) },
    {
      label: 'תשלום ליסינג חודשי',
      value: r.monthlyLeasingPayment !== null ? fmtCurrency(r.monthlyLeasingPayment) : 'לא רלוונטי',
      muted: r.monthlyLeasingPayment === null,
    },
    {
      label: 'הלוואה',
      value: r.loan
        ? `${fmtCurrency(r.loan.amount)} ב-${r.loan.annualRate.toFixed(1)}% ל-${r.loan.periodMonths} חודשים`
        : 'לא רלוונטי',
      muted: !r.loan,
    },
    {
      label: 'ירידת ערך (פחת) שנתי',
      value: r.depreciation > 0 ? fmtCurrency(r.depreciation) : 'לא רלוונטי',
      muted: r.depreciation === 0,
    },
    { label: 'דלק / חשמל (חודשי)', value: fmtCurrency(r.fuelMonthly) },
    {
      label: 'אחזקת רכב (שנתי)',
      value: r.maintenanceYearly !== null ? fmtCurrency(r.maintenanceYearly) : 'כלול בליסינג',
      muted: r.maintenanceYearly === null,
    },
    {
      label: 'ביטוחים ורישוי (שנתי)',
      value: r.insuranceYearly !== null ? fmtCurrency(r.insuranceYearly) : 'כלול בליסינג',
      muted: r.insuranceYearly === null,
    },
    { label: 'ריבית הלוואה (סה"כ)', value: r.loanInterestTotal > 0 ? fmtCurrency(r.loanInterestTotal) : 'לא רלוונטי', muted: r.loanInterestTotal === 0 },
    { label: 'סה"כ הוצאות שנתי', value: fmtCurrency(r.totalAnnualExpenses) },
    {
      label: 'יתרת הלוואה (סוף תקופה)',
      value: r.loanYearlyBreakdown.length > 0
        ? fmtCurrency(r.loanYearlyBreakdown[r.loanYearlyBreakdown.length - 1].endBalance)
        : 'לא רלוונטי',
      muted: r.loanYearlyBreakdown.length === 0,
    },
    {
      label: 'יתרת תשלום סוף תקופה',
      value: r.residualPayment !== null ? fmtCurrency(r.residualPayment) : 'לא רלוונטי',
      muted: r.residualPayment === null,
    },
    { label: 'מע"מ מוכר (שנתי)', value: fmtCurrency(r.vatRecoverable) },
    { label: 'הוצאות מוכרות לצרכי מס (שנתי)', value: fmtCurrency(r.deductibleExpenses) },
    { label: 'חיסכון מס שנתי', value: fmtCurrency(r.annualTaxSavings) },
    { label: 'תשלום חודשי ממוצע (תזרים)', value: fmtCurrency(r.monthlyCashflow) },
    {
      label: 'שווי רכב לאחר 5 שנים',
      value: r.residualCarValue !== null ? fmtCurrency(r.residualCarValue) : 'לא רלוונטי',
      muted: r.residualCarValue === null,
    },
  ]

  return (
    <div className="border-t border-border pt-space-4">
      <h4 className="text-body-sm font-bold text-primary mb-space-3">פירוט מלא</h4>
      <div className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={[
              'flex justify-between py-2 px-1 text-body-sm border-b border-border-light last:border-b-0',
              i % 2 === 0 ? '' : 'bg-surface/30',
            ].join(' ')}
          >
            <span className="text-text-muted">{row.label}</span>
            <span className={row.muted ? 'text-text-muted' : 'text-text-secondary font-medium'}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {result.excessKmNote && (
        <p className="text-caption text-text-muted mt-space-3">
          * במידה ומעל 20,000 ק&quot;מ בשנה, לרוב יש תוספת של כ-0.2-0.3 ₪ לכל ק&quot;מ נסיעה עודף.
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Metric Card
   ═══════════════════════════════════════════════ */

function MetricCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={[
      'rounded-lg p-space-3 border',
      highlight ? 'border-gold bg-gold/5' : 'border-border-light bg-surface/50',
    ].join(' ')}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-caption text-text-muted">{label}</span>
      </div>
      <span className={[
        'text-body font-bold block',
        highlight ? 'text-gold' : 'text-primary',
      ].join(' ')}>
        {value}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Comparison Row Definitions
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   Verdict — "What's better?"
   ═══════════════════════════════════════════════ */

function Verdict({ primary, comparison }: { primary: CalculationResult; comparison: CalculationResult }) {
  // Compare on key metrics
  const metrics: { label: string; aWins: boolean; bWins: boolean; detail: string }[] = []

  // Monthly cashflow (lower is better)
  const cashA = primary.monthlyCashflow
  const cashB = comparison.monthlyCashflow
  if (cashA !== cashB) {
    const winner = cashA < cashB ? primary : comparison
    const diff = Math.abs(cashA - cashB)
    metrics.push({
      label: 'תשלום חודשי',
      aWins: cashA < cashB,
      bWins: cashB < cashA,
      detail: `${OPTION_NAMES[winner.optionType]} זול ב-${fmt(diff)} ₪ לחודש`,
    })
  }

  // Total annual expenses (lower is better)
  const annA = primary.totalAnnualExpenses
  const annB = comparison.totalAnnualExpenses
  if (annA !== annB) {
    const winner = annA < annB ? primary : comparison
    const diff = Math.abs(annA - annB)
    metrics.push({
      label: 'הוצאות שנתיות',
      aWins: annA < annB,
      bWins: annB < annA,
      detail: `${OPTION_NAMES[winner.optionType]} חוסך ${fmt(diff)} ₪ בשנה`,
    })
  }

  // Tax savings (higher is better)
  const taxA = primary.annualTaxSavings
  const taxB = comparison.annualTaxSavings
  if (taxA !== taxB) {
    const winner = taxA > taxB ? primary : comparison
    const diff = Math.abs(taxA - taxB)
    metrics.push({
      label: 'חיסכון מס',
      aWins: taxA > taxB,
      bWins: taxB > taxA,
      detail: `${OPTION_NAMES[winner.optionType]} חוסך ${fmt(diff)} ₪ נוספים במס`,
    })
  }

  // Overall verdict
  const aWinCount = metrics.filter((m) => m.aWins).length
  const bWinCount = metrics.filter((m) => m.bWins).length
  const overallWinner = aWinCount > bWinCount ? primary : aWinCount < bWinCount ? comparison : null

  return (
    <div className="bg-white rounded-2xl border-2 border-gold shadow-md overflow-hidden mb-space-6">
      <div className="bg-primary px-space-5 py-space-3">
        <h3 className="text-body-lg font-bold text-white text-center">מה עדיף?</h3>
      </div>
      <div className="p-space-5">
        {overallWinner ? (
          <p className="text-center text-body-lg font-bold text-primary mb-space-4">
            <span className="text-gold">{OPTION_NAMES[overallWinner.optionType]}</span> יוצא
            משתלם יותר ברוב הפרמטרים
          </p>
        ) : (
          <p className="text-center text-body-lg font-bold text-primary mb-space-4">
            שתי האפשרויות דומות — הבחירה תלויה בהעדפה שלך
          </p>
        )}

        <div className="space-y-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-start gap-2 text-body-sm">
              <span className={m.aWins ? 'text-green-600' : m.bWins ? 'text-amber-600' : 'text-text-muted'}>
                {m.aWins ? '✓' : m.bWins ? '✗' : '—'}
              </span>
              <div>
                <span className="font-medium text-primary">{m.label}: </span>
                <span className="text-text-secondary">{m.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getComparisonRows(): { key: string; label: string; getValue: (r: CalculationResult) => string }[] {
  return [
    { key: 'carPrice', label: 'עלות רכב', getValue: (r) => fmtCurrency(r.carPrice) },
    { key: 'equity', label: 'הון עצמי / מקדמה', getValue: (r) => fmtCurrency(r.equity) },
    { key: 'monthlyCashflow', label: 'תשלום חודשי ממוצע', getValue: (r) => fmtCurrency(r.monthlyCashflow) },
    { key: 'totalAnnual', label: 'סה"כ הוצאות שנתי', getValue: (r) => fmtCurrency(r.totalAnnualExpenses) },
    { key: 'vatRecoverable', label: 'מע"מ מוכר (שנתי)', getValue: (r) => fmtCurrency(r.vatRecoverable) },
    { key: 'deductible', label: 'הוצאות מוכרות (שנתי)', getValue: (r) => fmtCurrency(r.deductibleExpenses) },
    { key: 'taxSavings', label: 'חיסכון מס שנתי', getValue: (r) => fmtCurrency(r.annualTaxSavings) },
    { key: 'loanInterest', label: 'ריבית הלוואה (סה"כ)', getValue: (r) => r.loanInterestTotal > 0 ? fmtCurrency(r.loanInterestTotal) : '—' },
    { key: 'residual', label: 'שווי רכב לאחר 5 שנים', getValue: (r) => r.residualCarValue !== null ? fmtCurrency(r.residualCarValue) : '—' },
  ]
}
