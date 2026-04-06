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
  purchase: 'רכישת רכב',
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

      {/* Compare button — TOP */}
      {!hasComparison && (
        <div className="text-center mb-space-5">
          <button
            type="button"
            onClick={onCompare}
            className="rounded-xl border-2 border-gold px-6 py-3 text-body font-bold text-gold hover:bg-gold/5 cursor-pointer transition-all duration-base"
          >
            השווה מול אפשרות נוספת
          </button>
        </div>
      )}

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

        <div className="flex flex-wrap justify-center gap-3 mt-space-5">
          {!hasComparison && (
            <button
              type="button"
              onClick={onCompare}
              className="rounded-xl border-2 border-gold px-5 py-2.5 text-body font-bold text-gold hover:bg-gold/5 cursor-pointer transition-all"
            >
              השווה מול אפשרות נוספת
            </button>
          )}
          {hasComparison && (
            <button
              type="button"
              onClick={onCompare}
              className="rounded-xl border-2 border-gold px-5 py-2.5 text-body font-bold text-gold hover:bg-gold/5 cursor-pointer transition-all"
            >
              השווה אפשרות אחרת
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl border-2 border-border px-5 py-2.5 text-body font-medium text-primary hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1"
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
            value={fmtCurrency(result.totalTaxSavings)}
          />
          {result.residualCarValue !== null && (
            <MetricCard
              icon={<Info className="h-4 w-4 text-gold" />}
              label="שווי רכב לאחר 5 שנים"
              value={fmtCurrency(result.residualCarValue)}
            />
          )}
          {result.vehicleTaxBenefit > 0 && (
            <MetricCard
              icon={<Calculator className="h-4 w-4 text-gold" />}
              label="שווי מס רכב (חודשי)"
              value={fmtCurrency(result.vehicleTaxBenefit)}
            />
          )}
          {result.grossIncludingVehicle > 0 && result.vehicleTaxBenefit > 0 && (
            <MetricCard
              icon={<Receipt className="h-4 w-4 text-gold" />}
              label="שכר ברוטו כולל שווי רכב"
              value={fmtCurrency(result.grossIncludingVehicle)}
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
  return (
    <div className="space-y-space-5">
      {results.map((r) => (
        <SingleResult key={r.optionType} result={r} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Result Breakdown Table
   ═══════════════════════════════════════════════ */

function ResultBreakdown({ result }: { result: CalculationResult }) {
  const r = result
  const years = r.loan ? Math.ceil(r.loan.periodMonths / 12) : 0
  const avgAnnualInterest = years > 0 ? Math.round(r.loanInterestTotal / years) : 0

  type Row = { label: string; value: string; muted?: boolean; bold?: boolean }
  type Section = { title: string; rows: Row[] }

  // Helper: show both monthly and yearly (R16)
  const dual = (monthly: number) => `${fmtCurrency(monthly)} / חודש | ${fmtCurrency(monthly * 12)} / שנה`
  const isCommercial = r.vehicleType.startsWith('commercial')

  const sections: Section[] = [
    {
      title: 'נתוני הרכב והמימון',
      rows: [
        { label: 'עלות רכב', value: fmtCurrency(r.carPrice) },
        { label: 'הון עצמי / מקדמה', value: fmtCurrency(r.equity) },
        {
          label: 'מע"מ רכישת רכב',
          value: r.vatOnPurchase !== null ? `מוכר — ${fmtCurrency(r.vatOnPurchase)}` : 'לא מוכר',
          muted: r.vatOnPurchase === null,
        },
        ...(r.monthlyLeasingPayment !== null ? [{
          label: 'תשלום ליסינג חודשי',
          value: fmtCurrency(r.monthlyLeasingPayment),
        }] : []),
        ...(r.loan ? [{
          label: 'הלוואה',
          value: `${fmtCurrency(r.loan.amount)} ב-${r.loan.annualRate.toFixed(1)}% ל-${r.loan.periodMonths} חודשים`,
        }] : []),
        ...(r.residualPayment !== null ? [{
          label: 'יתרת תשלום סוף תקופה (בלון)',
          value: fmtCurrency(r.residualPayment),
          bold: true,
        }] : []),
        ...(r.residualCarValue !== null ? [{
          label: 'שווי רכב משוער בשוק לאחר 5 שנים',
          value: fmtCurrency(r.residualCarValue),
        }] : []),
      ],
    },
    {
      title: 'הוצאות שוטפות',
      rows: [
        // R16+R18: show monthly+yearly, note net-of-VAT
        { label: 'דלק / חשמל', value: `${dual(r.fuelMonthly)}` },
        { label: '  ↳ בניכוי מע"מ מוכר', value: `${dual(r.fuelMonthlyNetVat)}`, muted: true },
        ...(r.maintenanceYearly !== null ? [
          { label: 'אחזקת רכב', value: `${fmtCurrency(Math.round(r.maintenanceYearly / 12))} / חודש | ${fmtCurrency(r.maintenanceYearly)} / שנה` },
          ...(r.maintenanceYearlyNetVat !== null ? [
            { label: '  ↳ בניכוי מע"מ מוכר', value: `${fmtCurrency(Math.round(r.maintenanceYearlyNetVat / 12))} / חודש | ${fmtCurrency(r.maintenanceYearlyNetVat)} / שנה`, muted: true },
          ] : []),
        ] : [{ label: 'אחזקת רכב', value: 'כלול בליסינג', muted: true }]),
        ...(r.insuranceYearly !== null ? [{
          label: 'ביטוחים ורישוי', value: `${fmtCurrency(Math.round(r.insuranceYearly / 12))} / חודש | ${fmtCurrency(r.insuranceYearly)} / שנה`,
        }] : [{ label: 'ביטוחים ורישוי', value: 'כלול בליסינג', muted: true }]),
        ...(r.depreciation > 0 ? [{
          label: 'ירידת ערך — פחת', value: `${fmtCurrency(Math.round(r.depreciation / 12))} / חודש | ${fmtCurrency(r.depreciation)} / שנה`,
        }] : []),
        ...(r.loanInterestTotal > 0 ? [
          { label: 'ריבית הלוואה — ממוצע שנתי', value: fmtCurrency(avgAnnualInterest) },
          { label: 'ריבית הלוואה — סה"כ לכל התקופה', value: fmtCurrency(r.loanInterestTotal), muted: true },
        ] : []),
        ...(r.vehicleTaxBenefit > 0 ? [
          { label: 'שווי מס רכב', value: `${fmtCurrency(r.vehicleTaxBenefit)} / חודש | ${fmtCurrency(r.vehicleTaxBenefit * 12)} / שנה` },
        ] : []),
        ...(r.employerNii > 0 ? [
          { label: 'ביטוח לאומי מעביד (על שווי מס)', value: fmtCurrency(r.employerNii) },
        ] : []),
      ],
    },
    {
      // R19: show total before tax adjustment for commercial context
      title: 'ניתוח מס',
      rows: [
        ...(isCommercial ? [] : [
          { label: 'סה"כ הוצאות לפני התאמה למס', value: fmtCurrency(r.totalExpensesBeforeTax), muted: true },
        ]),
        { label: 'מע"מ מוכר (שנתי)', value: fmtCurrency(r.vatRecoverable) },
        { label: 'הוצאות מוכרות לצרכי מס (שנתי)', value: fmtCurrency(r.deductibleExpenses) },
        { label: 'חיסכון מס הכנסה (שנתי)', value: fmtCurrency(r.annualTaxSavings) },
        { label: 'חיסכון ביטוח לאומי (שנתי)', value: fmtCurrency(r.niiSavings) },
        { label: 'סה"כ חיסכון מס (שנתי)', value: fmtCurrency(r.totalTaxSavings), bold: true },
      ],
    },
    {
      // R17: add תזרים label + monthly AND yearly
      title: 'סיכום — תזרים',
      rows: [
        { label: 'תשלום חודשי ממוצע', value: fmtCurrency(r.monthlyCashflow), bold: true },
        { label: 'סה"כ הוצאות שנתי', value: fmtCurrency(r.totalAnnualExpenses), bold: true },
        ...(r.loanYearlyBreakdown.length > 0 ? [{
          label: 'יתרת הלוואה בסוף התקופה',
          value: fmtCurrency(r.loanYearlyBreakdown[r.loanYearlyBreakdown.length - 1].endBalance),
          muted: true,
        }] : []),
      ],
    },
  ]

  return (
    <div className="border-t border-border pt-space-4">
      <div>
        {sections.map((section) => (
          <div key={section.title} className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">
              {section.title}
            </h4>
            {section.rows.map((row, i) => (
              <div
                key={row.label}
                className={[
                  'flex justify-between py-2 px-2 text-body-sm border-b border-border-light last:border-b-0',
                  i % 2 === 0 ? '' : 'bg-surface/30',
                ].join(' ')}
              >
                <span className="text-text-muted">{row.label}</span>
                <span className={
                  row.bold ? 'text-primary font-bold' :
                  row.muted ? 'text-text-muted' :
                  'text-text-secondary font-medium'
                }>
                  {row.value}
                </span>
              </div>
            ))}
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
