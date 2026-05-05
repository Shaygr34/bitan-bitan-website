'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Calculator, CreditCard, TrendingDown, Receipt, Wallet, Info, Printer, Share2, Car, Banknote, Wrench } from 'lucide-react'
import type { CalculationResult, OptionType } from './types'

type ResultsViewProps = {
  primary: CalculationResult
  comparison: CalculationResult | null
  onCompare: () => void
  onRestart: () => void
  shareUrl?: string
}

const OPTION_NAMES: Record<OptionType, string> = {
  purchase: 'רכישת רכב',
  financialLeasing: 'ליסינג מימוני',
  operationalLeasing: 'ליסינג תפעולי',
}

const OPTION_ICONS: Record<OptionType, React.ComponentType<{ className?: string }>> = {
  purchase: Car,
  financialLeasing: Banknote,
  operationalLeasing: Wrench,
}

// Determine which scenario "wins" using same metrics as Verdict.
// Returns 0 (primary), 1 (comparison), or null (tie).
function pickPreferredIndex(a: CalculationResult, b: CalculationResult): number | null {
  let aWins = 0
  let bWins = 0
  // Lower cashflow better
  if (a.monthlyCashflow < b.monthlyCashflow) aWins++
  else if (b.monthlyCashflow < a.monthlyCashflow) bWins++
  // Lower annual better
  if (a.totalAnnualExpenses < b.totalAnnualExpenses) aWins++
  else if (b.totalAnnualExpenses < a.totalAnnualExpenses) bWins++
  // Higher tax savings better
  if (a.annualTaxSavings > b.annualTaxSavings) aWins++
  else if (b.annualTaxSavings > a.annualTaxSavings) bWins++
  // Lower end-of-term better
  const endA = a.residualPayment ?? 0
  const endB = b.residualPayment ?? 0
  if (endA < endB) aWins++
  else if (endB < endA) bWins++
  if (aWins === bWins) return null
  return aWins > bWins ? 0 : 1
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('he-IL')
}

function fmtCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'לא רלוונטי'
  return `${fmt(n)} ₪`
}

export function ResultsView({ primary, comparison, onCompare, onRestart, shareUrl }: ResultsViewProps) {
  const hasComparison = !!comparison

  // Default the "active" tab to the preferred (winner) scenario. User can click
  // the other tab to swap which one appears on top. (Ron May 2026: preferred-first)
  const preferredIdx = useMemo(
    () => (comparison ? pickPreferredIndex(primary, comparison) ?? 0 : 0),
    [primary, comparison]
  )
  const [activeIdx, setActiveIdx] = useState(preferredIdx)

  // Reorder so the active scenario displays first (and prints first)
  const orderedResults = useMemo(() => {
    if (!comparison) return [primary]
    return activeIdx === 0 ? [primary, comparison] : [comparison, primary]
  }, [primary, comparison, activeIdx])

  const handlePrint = useCallback(() => { window.print() }, [])
  const [shareMsg, setShareMsg] = useState('')

  // Inject creation date onto <html data-print-date="…"> so the print-only
  // html::after pseudo-element can render it in the top-left of every page.
  useEffect(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    document.documentElement.setAttribute('data-print-date', `${dd}/${mm}/${yyyy}`)
    return () => { document.documentElement.removeAttribute('data-print-date') }
  }, [])

  // Ron spec (May 2026): email subject = "ביטן את ביטן רו"ח - סימולציה <type> מיום DD/MM/YY"
  // Type label adapts: purchase only → "רכישת רכב"; leasing only → "ליסינג";
  // mix of purchase + leasing → "רכישת רכב / ליסינג".
  const emailSubject = (() => {
    const types = new Set<'purchase' | 'leasing'>()
    types.add(primary.optionType === 'purchase' ? 'purchase' : 'leasing')
    if (comparison) types.add(comparison.optionType === 'purchase' ? 'purchase' : 'leasing')
    const label = types.size === 2 ? 'רכישת רכב / ליסינג' : (types.has('purchase') ? 'רכישת רכב' : 'ליסינג')
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear() % 100).padStart(2, '0')
    return `ביטן את ביטן רו"ח - סימולציה ${label} מיום ${dd}/${mm}/${yy}`
  })()

  const handleShare = useCallback(async () => {
    const url = shareUrl || window.location.href
    // Always attempt the native share sheet first (WhatsApp/Mail/Telegram on mobile,
    // OS share picker on Chromium desktop). Fall back to clipboard copy only when
    // navigator.share is unavailable or rejects with a non-cancel error.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Drop redundant `text` (was duplicate of title) — when sharing to mail,
        // body = text + url; omitting text keeps the body short = mail client
        // (Gmail/Apple Mail) opens instantly instead of stalling on a bloated body.
        await navigator.share({ title: emailSubject, url })
        return
      } catch (err) {
        // AbortError = user cancelled — don't fall back, don't surface a message
        if (err instanceof Error && err.name === 'AbortError') return
        // any other error → fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setShareMsg('הקישור הועתק!')
    setTimeout(() => setShareMsg(''), 2000)
  }, [shareUrl, emailSubject])

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">
        {hasComparison ? 'השוואת תוצאות' : 'תוצאות החישוב'}
      </h2>
      <p className="text-body text-text-muted text-center mb-space-7">
        כל הסכומים שנתיים אלא אם צוין אחרת
      </p>

      {/* Print watermark — rendered via html::before in print CSS so the fixed
          containing block is the viewport (repeats on every page). The previous
          .lc-watermark div was trapped inside a transformed/animated ancestor
          and only painted on whichever page it landed in document order. */}

      {/* Result Cards / Comparison */}
      {hasComparison ? (
        <>
          <ScenarioTabs
            primaryType={primary.optionType}
            comparisonType={comparison!.optionType}
            activeIdx={activeIdx}
            onSelect={setActiveIdx}
          />
          <Verdict primary={primary} comparison={comparison!} />
          <ComparisonTable results={orderedResults} />
        </>
      ) : (
        <SingleResult result={primary} />
      )}

      {/* Action buttons — compare + restart + print + share */}
      <div className="flex flex-wrap justify-center gap-3 mt-space-6 mb-space-6 no-print">
        <button
          type="button"
          onClick={onCompare}
          className="rounded-xl border-2 border-gold px-5 py-2.5 text-body font-bold text-gold hover:bg-gold/5 cursor-pointer transition-all"
        >
          {hasComparison ? 'השווה אפשרות אחרת' : 'השווה מול אפשרות נוספת'}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border-2 border-border px-5 py-2.5 text-body font-medium text-primary hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" />
          התחל מחדש
        </button>
        <button type="button" onClick={handlePrint}
          className="rounded-xl border-2 border-border px-4 py-2.5 text-body-sm font-medium text-text-muted hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1">
          <Printer className="h-4 w-4" />
          הדפסה / PDF
        </button>
        <button type="button" onClick={handleShare}
          className="rounded-xl border-2 border-border px-4 py-2.5 text-body-sm font-medium text-text-muted hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          שיתוף
        </button>
        {shareMsg && (
          <span className="text-body-sm text-green-600 font-medium animate-pulse">{shareMsg}</span>
        )}
      </div>

      {/* CTA Section */}
      <div className="mt-space-5 text-center no-print">
        <h3 className="text-h3 font-bold text-primary mb-space-3">
          לחישוב מדויק המותאם למצב שלכם
        </h3>
        <p className="text-body text-text-secondary max-w-narrow mx-auto mb-space-6">
          המחשבון מספק הערכה כללית. לתוצאות מדויקות — פנו למשרד.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-primary font-medium rounded-lg hover:bg-gold-hover transition-colors">
            פנו למשרד
          </a>
          <a href="tel:+97235174295" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors" dir="ltr">
            03-5174295
          </a>
        </div>

      </div>

      {/* Print disclaimer (hidden on screen) */}
      <div className="print-only hidden mt-8 pt-4 border-t border-border text-center">
        <p className="text-caption text-text-muted">אין לנו אחריות. המידע להמחשה בלבד ואינו מהווה ייעוץ מקצועי.</p>
        <p className="text-caption text-text-muted">ביטן את ביטן — רואי חשבון | bitancpa.com</p>
      </div>

      {/* Print CSS — compact one-pager (matches employer calc) */}
      <style jsx global>{`
        @media print {
          /* Hide non-content elements */
          nav, footer, header, .no-print,
          [class*="WhatsApp"], [class*="whatsapp"] { display: none !important; }

          /* Watermark — anchored to <html> so the fixed containing block is the
             viewport. Chrome/Safari/Firefox repeat fixed elements on every page
             only when no ancestor creates a new containing block (transform,
             filter, will-change). <html> has no ancestors → reliable repeat. */
          html::before {
            content: 'להמחשה בלבד';
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-30deg) !important;
            transform-origin: center center !important;
            pointer-events: none !important;
            user-select: none !important;
            z-index: 9999 !important;
            opacity: 0.12 !important;
            font-size: 90px !important;
            font-weight: 700 !important;
            color: #1F2937 !important;
            white-space: nowrap !important;
            letter-spacing: 0.05em !important;
            line-height: 1 !important;
          }

          /* Print creation date — top-left, repeats per page (same fixed-on-html
             trick as the watermark). attr() pulls the value injected via the
             useEffect on <html>. */
          html::after {
            content: 'הופק: ' attr(data-print-date);
            position: fixed !important;
            top: 5mm !important;
            left: 5mm !important;
            font-size: 9px !important;
            font-weight: 500 !important;
            color: #6B7280 !important;
            letter-spacing: 0.02em !important;
            pointer-events: none !important;
            user-select: none !important;
            z-index: 9999 !important;
          }

          /* Page setup — top extra room so the print-date stamp at 5mm never
             collides with content; bottom room for clean break. */
          @page { margin: 14mm 10mm 12mm 10mm; }
          main, article, section { padding: 0 !important; }

          /* Compact typography */
          body { font-size: 10px !important; line-height: 1.3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h2, h3, h4 { font-size: 12px !important; margin-bottom: 2px !important; }
          .text-h3 { font-size: 14px !important; }
          .text-body-lg { font-size: 11px !important; }
          .text-body, .text-body-sm { font-size: 9px !important; }
          .text-caption { font-size: 7.5px !important; }

          /* Tight spacing */
          .mb-space-5, .mb-space-6, .mb-space-7, .mb-space-8 { margin-bottom: 6px !important; }
          .mb-space-3, .mb-space-2 { margin-bottom: 3px !important; }
          .p-space-4, .p-space-3, .p-space-5 { padding: 4px 6px !important; }
          .py-space-9 { padding-top: 8px !important; padding-bottom: 8px !important; }
          .py-2 { padding-top: 1px !important; padding-bottom: 1px !important; }
          .gap-3, .gap-4 { gap: 3px !important; }
          .mt-space-8, .mt-space-7, .mt-space-5, .mt-space-6 { margin-top: 6px !important; }
          .space-y-space-5 > * + * { margin-top: 6px !important; }

          /* Visual cleanup */
          .rounded-2xl, .rounded-xl { border-radius: 4px !important; }
          .shadow-md, .shadow-lg { box-shadow: none !important; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }

          /* Prevent page breaks inside result cards and sections */
          .rounded-2xl, .bg-primary, .grid { break-inside: avoid !important; page-break-inside: avoid !important; }
          h4 { break-after: avoid !important; page-break-after: avoid !important; }

          /* Ron May 2026 #31: 2-page comparison — page 1 = preferred (verdict + winner),
             page 2 = lesser scenario. The lesser card has class lc-print-break. */
          .lc-print-break { break-before: page !important; page-break-before: always !important; }

          /* Show print-only elements */
          .print\\:block { display: block !important; }
          .print-only { display: block !important; }
        }
      `}</style>
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

      {/* Key Metrics — Ron May 2026 #27: 2-column dual-value cards.
          Right col (RTL: visually first) = תזרים + מס.
          Left col = רכב + הלוואה. */}
      <div className="p-space-5">
        <KeyMetrics result={result} />

        {/* Full breakdown */}
        <ResultBreakdown result={result} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Key Metrics — paired-value cards (Ron May 2026 #27)
   ═══════════════════════════════════════════════ */

function KeyMetrics({ result }: { result: CalculationResult }) {
  const years = result.loan ? Math.ceil(result.loan.periodMonths / 12) : 5
  const loanEndBalance = result.loanYearlyBreakdown.length > 0
    ? result.loanYearlyBreakdown[result.loanYearlyBreakdown.length - 1].endBalance
    : 0
  const monthlyLoanPayment = result.loan
    ? Math.round((result.loan.amount + result.loanInterestTotal - (result.residualPayment ?? 0)) / result.loan.periodMonths)
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-space-5">
      {/* Right column (RTL: appears first) — cashflow + tax */}
      <DualMetricCard
        icon={<Wallet className="h-4 w-4 text-gold" />}
        title="תזרים"
        rows={[
          { label: 'תשלום חודשי ממוצע', value: fmtCurrency(result.monthlyCashflow) },
          { label: 'סה"כ הוצאות שנתי', value: fmtCurrency(result.totalAnnualExpenses) },
        ]}
        highlight
      />
      <DualMetricCard
        icon={<TrendingDown className="h-4 w-4 text-gold" />}
        title={result.totalTaxSavings < 0 ? 'מס (שווי שימוש)' : 'מס'}
        rows={[
          { label: 'הוצאות מוכרות (שנתי)', value: fmtCurrency(result.deductibleExpenses) },
          {
            label: result.totalTaxSavings < 0 ? 'עלות מס נוספת' : 'חיסכון מס שנתי',
            value: fmtCurrency(Math.abs(result.totalTaxSavings)),
          },
        ]}
      />

      {/* Left column — vehicle + loan */}
      <DualMetricCard
        icon={<Info className="h-4 w-4 text-gold" />}
        title="רכב"
        rows={[
          { label: 'עלות רכב חדש', value: fmtCurrency(result.carPrice) },
          ...(result.residualCarValue !== null
            ? [{ label: `שווי משוער לאחר ${years} שנים`, value: fmtCurrency(result.residualCarValue) }]
            : []),
        ]}
      />
      {(result.loan || result.monthlyLeasingPayment !== null) && (
        <DualMetricCard
          icon={<CreditCard className="h-4 w-4 text-gold" />}
          title={result.monthlyLeasingPayment !== null ? 'ליסינג' : 'הלוואה'}
          rows={[
            ...(result.monthlyLeasingPayment !== null
              ? [{ label: 'תשלום ליסינג חודשי', value: fmtCurrency(result.monthlyLeasingPayment) }]
              : [{ label: 'חיוב חודשי הלוואה', value: fmtCurrency(monthlyLoanPayment) }]),
            ...(result.residualPayment !== null
              ? [{ label: 'בלון בסוף תקופה', value: fmtCurrency(result.residualPayment) }]
              : loanEndBalance > 0
                ? [{ label: 'יתרת הלוואה בסוף תקופה', value: fmtCurrency(loanEndBalance) }]
                : []),
          ]}
        />
      )}

      {/* Vehicle benefit row — shown only when relevant (company/employee) */}
      {result.vehicleTaxBenefit > 0 && (
        <DualMetricCard
          icon={<Calculator className="h-4 w-4 text-gold" />}
          title="שווי רכב"
          rows={[
            { label: 'שווי מס חודשי', value: fmtCurrency(result.vehicleTaxBenefit) },
            ...(result.grossIncludingVehicle > 0
              ? [{ label: 'ברוטו כולל שווי רכב', value: fmtCurrency(result.grossIncludingVehicle) }]
              : []),
          ]}
        />
      )}
    </div>
  )
}

function DualMetricCard({
  icon,
  title,
  rows,
  highlight,
}: {
  icon: React.ReactNode
  title: string
  rows: { label: string; value: string }[]
  highlight?: boolean
}) {
  return (
    <div className={[
      'rounded-lg p-space-3 border',
      highlight ? 'border-gold bg-gold/5' : 'border-border-light bg-surface/50',
    ].join(' ')}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className={['text-caption font-bold', highlight ? 'text-gold-dark' : 'text-text-muted'].join(' ')}>{title}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-baseline gap-2">
            <span className="text-caption text-text-muted">{row.label}</span>
            <span className={['text-body-sm font-bold', highlight ? 'text-gold' : 'text-primary'].join(' ')}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Scenario Tabs (icon switch — Ron May 2026 #28)
   ═══════════════════════════════════════════════ */

function ScenarioTabs({
  primaryType,
  comparisonType,
  activeIdx,
  onSelect,
}: {
  primaryType: OptionType
  comparisonType: OptionType
  activeIdx: number
  onSelect: (idx: number) => void
}) {
  const tabs: { idx: 0 | 1; type: OptionType }[] = [
    { idx: 0, type: primaryType },
    { idx: 1, type: comparisonType },
  ]
  return (
    <div className="flex justify-center gap-2 mb-space-5 no-print" role="tablist" aria-label="תרחישים">
      {tabs.map(({ idx, type }) => {
        const Icon = OPTION_ICONS[type]
        const active = idx === activeIdx
        return (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(idx)}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-body-sm font-bold border-2 transition-all cursor-pointer',
              active
                ? 'border-gold bg-gold/10 text-gold scale-105 shadow-sm'
                : 'border-border bg-white text-text-muted hover:bg-surface',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {OPTION_NAMES[type]}
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Comparison Table
   ═══════════════════════════════════════════════ */

function ComparisonTable({ results }: { results: CalculationResult[] }) {
  return (
    <div className="space-y-space-5">
      {results.map((r, i) => (
        <div key={`${r.optionType}-${i}`} className={i === 1 ? 'lc-print-break' : undefined}>
          <SingleResult result={r} />
        </div>
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
          label: 'סכום חודשי ליסינג',
          value: fmtCurrency(r.monthlyLeasingPayment),
          bold: true as const,
        }] : []),
        ...(r.computedEffectiveRate !== null ? [{
          label: 'ריבית משוקללת לעסקה',
          value: `${r.computedEffectiveRate.toFixed(1)}%`,
          muted: true as const,
        }] : []),
        ...(r.loan && r.computedEffectiveRate === null ? [{
          label: 'הלוואה',
          value: `${fmtCurrency(r.loan.amount)} ב-${r.loan.annualRate.toFixed(1)}% ל-${r.loan.periodMonths} חודשים`,
        }] : []),
        ...(r.loan && r.computedEffectiveRate !== null ? [{
          label: 'סכום מימון',
          value: `${fmtCurrency(r.loan.amount)} ל-${r.loan.periodMonths} חודשים`,
        }] : []),
        ...(r.residualPayment !== null ? [{
          label: 'יתרת תשלום סוף תקופה (בלון)',
          value: fmtCurrency(r.residualPayment),
          bold: true,
        }] : []),
        // Ron May 2026: explicit amortizing principal when balloon exists
        // (helps user see how much actually gets paid off during the term)
        ...(r.loan && r.residualPayment !== null && r.residualPayment > 0 ? [{
          label: 'קרן מתאזנת במהלך התקופה',
          value: fmtCurrency(r.loan.amount - r.residualPayment),
          muted: true,
        }] : []),
        // שווי רכב prominent display for company/employee — Ron's feedback
        ...(r.vehicleTaxBenefit > 0 ? [{
          label: 'שווי מס רכב שנתי / חודשי',
          value: `${fmtCurrency(r.vehicleTaxBenefit * 12)} / שנה | ${fmtCurrency(r.vehicleTaxBenefit)} / חודש`,
          bold: true as const,
        }] : []),
        { label: 'עלות רכב חדש', value: fmtCurrency(r.carPrice) },
        ...(r.residualCarValue !== null ? [{
          label: `שווי רכב משוער לאחר ${r.loan ? Math.ceil(r.loan.periodMonths / 12) : 5} שנים`,
          value: fmtCurrency(r.residualCarValue),
        }] : []),
        ...(r.loanInterestTotal > 0 ? [{
          label: 'ריבית הלוואה — סה"כ לכל התקופה',
          value: fmtCurrency(r.loanInterestTotal),
          muted: true,
        }] : []),
        ...(r.loanYearlyBreakdown.length > 0 ? [{
          label: `יתרת הלוואה בסוף תקופה נבדקת (${r.loan?.periodMonths || 60} חודשים)`,
          value: fmtCurrency(r.loanYearlyBreakdown[r.loanYearlyBreakdown.length - 1].endBalance),
          muted: true,
        }] : []),
      ],
    },
    {
      title: 'הוצאות שוטפות',
      rows: [
        // R16+R18: show monthly+yearly, note net-of-VAT
        { label: 'דלק / חשמל', value: `${dual(r.fuelMonthly)}` },
        { label: 'בניכוי מע"מ מוכר', value: `${dual(r.fuelMonthlyNetVat)}`, muted: true },
        ...(r.maintenanceYearly !== null ? [
          { label: 'אחזקת רכב', value: `${fmtCurrency(Math.round(r.maintenanceYearly / 12))} / חודש | ${fmtCurrency(r.maintenanceYearly)} / שנה` },
          ...(r.maintenanceYearlyNetVat !== null ? [
            { label: 'בניכוי מע"מ מוכר', value: `${fmtCurrency(Math.round(r.maintenanceYearlyNetVat / 12))} / חודש | ${fmtCurrency(r.maintenanceYearlyNetVat)} / שנה`, muted: true },
          ] : []),
        ] : [{ label: 'אחזקת רכב', value: 'כלול בליסינג', muted: true }]),
        ...(r.insuranceYearly !== null ? [{
          label: 'ביטוחים ורישוי', value: `${fmtCurrency(Math.round(r.insuranceYearly / 12))} / חודש | ${fmtCurrency(r.insuranceYearly)} / שנה`,
        }] : [{ label: 'ביטוחים ורישוי', value: 'כלול בליסינג', muted: true }]),
        ...(r.depreciation > 0 ? [{
          label: 'ירידת ערך — פחת', value: `${fmtCurrency(Math.round(r.depreciation / 12))} / חודש | ${fmtCurrency(r.depreciation)} / שנה`,
        }] : []),
        ...(r.loanInterestTotal > 0 ? [
          { label: 'ריבית הלוואה ממוצעת', value: `${fmtCurrency(Math.round(avgAnnualInterest / 12))} / חודש | ${fmtCurrency(avgAnnualInterest)} / שנה` },
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
        // Ron May 2026: company net deductible (after subtracting שווי רכב).
        // employerNii > 0 is a clean company-mode signal (employee/self-employed = 0).
        ...(r.employerNii > 0 && !isCommercial && r.vehicleTaxBenefit > 0 ? [
          { label: 'סה"כ הוצאות מוכרות לפני מס בנטרול שווי רכב עובד', value: fmtCurrency(r.totalExpensesBeforeTax - r.vehicleTaxBenefit * 12), muted: true },
        ] : []),
        // Hide VAT and deductible rows when they're 0 (employee mode)
        ...(r.vatRecoverable === 0 && r.deductibleExpenses === 0 && r.totalTaxSavings < 0 ? [] : [
          { label: 'מע"מ מוכר (שנתי)', value: fmtCurrency(r.vatRecoverable) },
          { label: 'הוצאות מוכרות לצרכי מס (שנתי)', value: fmtCurrency(r.deductibleExpenses) },
        ]),
        {
          label: r.annualTaxSavings < 0 ? 'מס הכנסה נוסף (שווי שימוש)' : 'חיסכון מס הכנסה (שנתי)',
          value: fmtCurrency(Math.abs(r.annualTaxSavings)),
        },
        {
          label: r.niiSavings < 0 ? 'ביטוח לאומי נוסף (שווי שימוש)' : 'חיסכון ביטוח לאומי (שנתי)',
          value: fmtCurrency(Math.abs(r.niiSavings)),
        },
        {
          label: r.totalTaxSavings < 0 ? 'סה"כ עלות מס נוספת' : 'סה"כ חיסכון מס (שנתי)',
          value: fmtCurrency(Math.abs(r.totalTaxSavings)),
          bold: true,
        },
        // Note for company mode when שווי מס makes expenses negative
        ...(r.vehicleTaxBenefit > 0 && r.annualTaxSavings < 0 ? [{
          label: '',
          value: 'אין חיסכון מס — הוצאות שליליות בניכוי שווי רכב',
          muted: true as const,
        }] : []),
      ],
    },
    {
      // R17: add תזרים label + monthly AND yearly
      title: 'סיכום — תזרים',
      rows: [
        { label: 'תשלום חודשי ממוצע', value: fmtCurrency(r.monthlyCashflow), bold: true },
        { label: 'סה"כ הוצאות שנתי', value: fmtCurrency(r.totalAnnualExpenses), bold: true },
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
      detail: taxA >= 0 || taxB >= 0
        ? `${OPTION_NAMES[winner.optionType]} חוסך ${fmt(diff)} ₪ נוספים במס`
        : `${OPTION_NAMES[winner.optionType]} עלות מס נמוכה יותר ב-${fmt(diff)} ₪`,
    })
  }

  // End-of-term obligation (lower is better) — balloon vs. free-and-clear
  const endA = primary.residualPayment ?? 0
  const endB = comparison.residualPayment ?? 0
  if (endA !== endB) {
    const winner = endA < endB ? primary : comparison
    const loser = endA < endB ? comparison : primary
    const diff = Math.abs(endA - endB)
    metrics.push({
      label: 'סוף תקופה',
      aWins: endA < endB,
      bWins: endB < endA,
      detail: winner.residualPayment
        ? `${OPTION_NAMES[winner.optionType]} — בלון נמוך יותר ב-${fmt(diff)} ₪`
        : `ב${OPTION_NAMES[winner.optionType]} אין התחייבות בסוף התקופה (ב${OPTION_NAMES[loser.optionType]}: בלון ${fmt(diff)} ₪)`,
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

// getComparisonRows was dead code — removed
