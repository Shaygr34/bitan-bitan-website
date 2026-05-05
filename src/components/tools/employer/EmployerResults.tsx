'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowRight, Wallet, Receipt, TrendingDown, Users, Printer, Share2, BarChart3 } from 'lucide-react'
import type { EmployerCalcResult, EmployerInputs } from './types'
import { DEFAULT_EMPLOYER_CONFIG } from './config'
import { getNIIRatesV2, NII_CATEGORY_V2_LABELS, NII_CALCTYPE_LABELS } from '@/lib/tax-tables-2026'

type Props = {
  result: EmployerCalcResult
  inputs: EmployerInputs
  onRestart: () => void
  onCompare: () => void
  comparisonResult: EmployerCalcResult | null
  comparisonInputs: EmployerInputs | null
  onRemoveComparison: () => void
}

function fmt(n: number): string {
  return n.toLocaleString('he-IL')
}

export function EmployerResults({ result, inputs, onRestart, onCompare, comparisonResult, comparisonInputs, onRemoveComparison }: Props) {
  const { employee: emp, employer: empr, hasShvuiMas } = result
  const creditBreakdown = emp.creditPointsBreakdown

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const [shareMsg, setShareMsg] = useState('')
  const handleShare = useCallback(async () => {
    // Build share URL with encoded inputs
    const params = new URLSearchParams()
    params.set('gs', String(inputs.grossSalary))
    params.set('ta', String(inputs.travelAllowance))
    if (inputs.hasVehicle) { params.set('v', '1'); params.set('vf', inputs.vehicleFuelType); params.set('mp', String(inputs.manufacturerPrice)) }
    if (inputs.hasMealBenefit) params.set('ml', String(inputs.mealBenefitAmount))
    if (inputs.hasOtherBenefit) params.set('ob', String(inputs.otherBenefitAmount))
    params.set('pe', String(inputs.employeePensionRate))
    params.set('pp', String(inputs.employerPensionRate))
    params.set('sv', String(inputs.severanceRate))
    params.set('ee', String(inputs.employerEducationRate))
    params.set('g', inputs.gender[0])
    params.set('ms', inputs.maritalStatus)
    if (inputs.childrenAges.length > 0) params.set('ca', inputs.childrenAges.join(','))
    if (inputs.childAllowanceRecipient === 'employee') params.set('cr', 'e')
    if (inputs.disabledChildrenCount > 0) params.set('dc', String(inputs.disabledChildrenCount))
    if (inputs.serviceType !== 'none') {
      params.set('st', inputs.serviceType); params.set('sl', inputs.serviceLevel)
      if (inputs.serviceEndDate) params.set('se', `${inputs.serviceEndDate.month}-${inputs.serviceEndDate.year}`)
    }
    if (inputs.reserveDays > 0) params.set('rd', String(inputs.reserveDays))
    const today = new Date()
    if (inputs.evaluationDate.month !== today.getMonth() + 1 || inputs.evaluationDate.year !== today.getFullYear()) {
      params.set('ed', `${inputs.evaluationDate.month}-${inputs.evaluationDate.year}`)
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`

    // Ron spec (May 2026): "ביטן את ביטן רו"ח - סימולציה עלות מעסיק / עובד מיום DD/MM/YY"
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear() % 100).padStart(2, '0')
    const text = `ביטן את ביטן רו"ח - סימולציה עלות מעסיק / עובד מיום ${dd}/${mm}/${yy}`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url: shareUrl })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setShareMsg('הקישור הועתק!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }, [inputs])

  return (
    <div className="print-area">
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">תוצאות חישוב עלות מעסיק</h2>
      <p className="text-body text-text-muted text-center mb-space-6">סכומים חודשיים</p>

      {/* Print watermark — diagonal, faded, centered (Ron spec May 2026).
          Single fixed element with dedicated class to avoid conflicts with
          .print-only / body font-size !important rules. */}
      <div aria-hidden="true" className="ec-watermark" suppressHydrationWarning>להמחשה בלבד</div>

      {/* Comparison Table — CENTER STAGE when comparing */}
      {comparisonResult && comparisonInputs && (
        <ComparisonBlock
          primary={{ result, inputs }}
          comparison={{ result: comparisonResult, inputs: comparisonInputs }}
          onRemove={onRemoveComparison}
        />
      )}

      {/* Key Metrics — Top Summary */}
      <div className="grid grid-cols-2 gap-3 mb-space-6">
        <div className="rounded-lg p-space-3 border border-gold bg-gold/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">עלות מעסיק כולל</span>
          </div>
          <span className="text-body-lg font-bold text-gold-dark block">{fmt(empr.totalWithShvui)} ₪</span>
        </div>
        <div className="rounded-lg p-space-3 border border-gold bg-gold/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">נטו עובד</span>
          </div>
          <span className="text-body-lg font-bold text-gold-dark block">{fmt(emp.netWithShvui)} ₪</span>
        </div>
        {hasShvuiMas && (
          <>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">עלות מעסיק ללא שווי מס</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(empr.totalWithoutShvui)} ₪</span>
            </div>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">נטו עובד ללא שווי מס</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(emp.netWithoutShvui)} ₪</span>
            </div>
          </>
        )}
      </div>

      {/* שווי מס section removed per Ron — net cards already in top metrics */}

      {/* Employee Breakdown */}
      <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden mb-space-5">
        <div className="bg-primary px-space-5 py-space-3">
          <h3 className="text-body-lg font-bold text-white">עובד</h3>
        </div>
        <div className="p-space-4">
          <Section title="נתונים לחישוב שכר" rows={[
            { label: 'שכר ברוטו', value: `${fmt(emp.grossSalary)} ₪` },
            { label: 'נסיעות', value: `${fmt(emp.travelAllowance)} ₪` },
            ...(emp.vehicleTaxBenefit > 0 ? [{ label: 'שווי רכב', value: `${fmt(emp.vehicleTaxBenefit)} ₪` }] : []),
            ...(emp.mealBenefit > 0 ? [{ label: 'שווי ארוחות', value: `${fmt(emp.mealBenefit)} ₪` }] : []),
            ...(emp.otherBenefit > 0 ? [{ label: 'שווי מס נוסף', value: `${fmt(emp.otherBenefit)} ₪` }] : []),
            ...(hasShvuiMas ? [{ label: 'סה"כ שווי מס', value: `${fmt(emp.totalShvuiMas)} ₪`, bold: true }] : []),
            ...(emp.imputedEducationFund > 0 ? [{ label: 'שווי זקופות השתלמות', value: `${fmt(emp.imputedEducationFund)} ₪` }] : []),
            ...(emp.imputedPension > 0 ? [{ label: 'שווי זקופות תגמולים', value: `${fmt(emp.imputedPension)} ₪` }] : []),
            ...(emp.imputedSeverance > 0 ? [{ label: 'שווי זקופות פיצויים', value: `${fmt(emp.imputedSeverance)} ₪` }] : []),
            { label: 'סה"כ שכר עבודה חייב במס', value: `${fmt(emp.totalTaxableIncome)} ₪`, bold: true },
          ]} />

          <Section title="ניכויים" rows={[
            { label: 'ביטוח לאומי', value: `${fmt(emp.niiEmployee)} ₪` },
            { label: 'מס הכנסה', value: `${fmt(emp.incomeTax)} ₪` },
            { label: 'פנסיה עובד', value: `${fmt(emp.pensionEmployee)} ₪` },
            { label: 'קרן השתלמות עובד', value: `${fmt(emp.educationFundEmployee)} ₪` },
            { label: 'סה"כ ניכויים', value: `${fmt(emp.totalDeductions)} ₪`, bold: true },
          ]} />

          {/* NII bracket breakdown — Ron May 2026 #45 + v2 (May 5) full pair display.
              Sprint update: SUM shown in collapsed summary (Ron — "show the sum"). */}
          {(() => {
            const cfg = DEFAULT_EMPLOYER_CONFIG
            const rates = getNIIRatesV2(inputs.niiCategoryV2, inputs.niiCalcType)
            // niiBase: travel is already inside totalTaxableIncome (sprint update).
            const niiBase = emp.totalTaxableIncome
            const lowAmount = Math.min(niiBase, cfg.niiLowThreshold)
            const highAmount = Math.max(niiBase - cfg.niiLowThreshold, 0)
            const lowNii = Math.round(lowAmount * rates.employeeLow)
            const highNii = Math.round(highAmount * rates.employeeHigh)
            const catLabel = NII_CATEGORY_V2_LABELS[inputs.niiCategoryV2]
            const calcLabel = NII_CALCTYPE_LABELS[inputs.niiCalcType]
            return (
              <details className="mb-space-3 -mt-space-2">
                <summary className="cursor-pointer text-caption text-text-muted hover:text-primary px-2 py-1 flex items-center justify-between gap-2">
                  <span>📐 פירוט חישוב ביטוח לאומי</span>
                  <span className="font-bold text-primary">{fmt(emp.niiEmployee)} ₪</span>
                </summary>
                <div className="text-caption text-text-muted bg-surface/40 rounded-lg p-space-3 mt-1 space-y-0.5">
                  <div>סיווג: {catLabel} / {calcLabel}</div>
                  <div>בסיס חישוב: {fmt(niiBase)} ₪</div>
                  <div>מתחת לתקרה ({fmt(cfg.niiLowThreshold)} ₪) × {(rates.employeeLow * 100).toFixed(2)}% = {fmt(lowNii)} ₪</div>
                  {highAmount > 0 && (
                    <div>מעל לתקרה ({fmt(highAmount)} ₪) × {(rates.employeeHigh * 100).toFixed(2)}% = {fmt(highNii)} ₪</div>
                  )}
                  <div className="font-bold pt-1 border-t border-border/30">{'סה"כ ביטוח לאומי עובד: '}{fmt(emp.niiEmployee)} ₪</div>
                </div>
              </details>
            )
          })()}

          {/* Credit points display — Ron May 2026: separate lines per credit type */}
          <div className="mb-space-3 bg-surface/40 rounded-lg p-space-3">
            {(() => {
              // Separate base nz from degree nz per Ron's display template
              const baseNz = creditBreakdown.total - creditBreakdown.degree
              const baseValue = Math.round(baseNz * (creditBreakdown.monthlyValue / Math.max(creditBreakdown.total, 0.0001)))
              const degreeValue = Math.round(creditBreakdown.degree * (creditBreakdown.monthlyValue / Math.max(creditBreakdown.total, 0.0001)))
              const totalCredit = creditBreakdown.monthlyValue + creditBreakdown.pensionCredit + creditBreakdown.yishuvCredit
              return (
                <div className="text-body-sm text-primary space-y-1">
                  <p>
                    <span className="font-bold">{baseNz.toFixed(2)}</span> נ&quot;ז ({fmt(baseValue)} ₪/חודש)
                    {creditBreakdown.reservist > 0 && (
                      <> · כולל {creditBreakdown.reservist.toFixed(2)} נ&quot;ז מילואים</>
                    )}
                  </p>
                  {creditBreakdown.degree > 0 && (
                    <p>
                      + נ&quot;ז תואר/מקצוע: <span className="font-bold">{creditBreakdown.degree.toFixed(2)}</span> נ&quot;ז ({fmt(degreeValue)} ₪/חודש)
                    </p>
                  )}
                  {creditBreakdown.pensionCredit > 0 && (
                    <p>+ זיכוי פנסיה: <span className="font-bold">{fmt(creditBreakdown.pensionCredit)} ₪</span></p>
                  )}
                  {creditBreakdown.yishuvCredit > 0 && (
                    <p>+ זיכוי יישוב מוטב: <span className="font-bold">{fmt(creditBreakdown.yishuvCredit)} ₪</span></p>
                  )}
                  <p className="pt-1 border-t border-border/50 mt-1">
                    סה&quot;כ זיכוי מס:{' '}
                    <span className="font-bold text-gold-dark">{fmt(totalCredit)} ₪/חודש</span>
                  </p>
                </div>
              )
            })()}
          </div>

          {/* Net Summary — employee */}
          <div className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">סיכום נטו עובד</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg border border-gold bg-gold/5 p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">נטו עובד <strong>כולל</strong> שווי מס</span>
                <span className="text-body-lg font-bold text-gold-dark block">{fmt(emp.netWithShvui)} ₪</span>
              </div>
              <div className="rounded-lg border border-border p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">נטו עובד <strong>ללא</strong> שווי מס</span>
                <span className="text-body-lg font-bold text-primary block">{fmt(emp.netWithoutShvui)} ₪</span>
              </div>
            </div>
            {hasShvuiMas && (
              <div className="text-center mt-2 py-2 bg-surface rounded-lg">
                <span className="text-body-sm text-text-muted">פער שכר נטו (השפעת שווי מס): </span>
                <span className="text-body font-bold text-primary">{fmt(emp.netDifference)} ₪</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employer Breakdown */}
      <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden mb-space-5">
        <div className="bg-primary px-space-5 py-space-3">
          <h3 className="text-body-lg font-bold text-white">מעסיק</h3>
        </div>
        <div className="p-space-4">
          <Section title="פירוט עלות מעסיק" rows={[
            { label: 'שכר ברוטו', value: `${fmt(empr.grossSalary)} ₪` },
            { label: 'נסיעות', value: `${fmt(empr.travelAllowance)} ₪` },
            { label: 'ביטוח לאומי מעסיק', value: `${fmt(empr.niiEmployer)} ₪` },
            { label: 'תגמולים פנסיה מעסיק', value: `${fmt(empr.pensionEmployer)} ₪` },
            { label: 'פיצויים מעסיק', value: `${fmt(empr.severanceEmployer)} ₪` },
            { label: 'קרן השתלמות מעסיק', value: `${fmt(empr.educationFundEmployer)} ₪` },
          ]} />

          {/* Side by side: with vs without שווי מס */}
          <div className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">סיכום עלות מעסיק</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg border border-gold bg-gold/5 p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">כולל שווי מס</span>
                <span className="text-body-lg font-bold text-gold-dark block">{fmt(empr.totalWithShvui)} ₪</span>
              </div>
              <div className="rounded-lg border border-border p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">ללא שווי מס</span>
                <span className="text-body-lg font-bold text-primary block">{fmt(empr.totalWithoutShvui)} ₪</span>
              </div>
            </div>
            {hasShvuiMas && (
              <div className="text-center mt-2 py-2 bg-surface rounded-lg">
                <span className="text-body-sm text-text-muted">הפרש עלות מעסיק (השפעה שווי מס): </span>
                <span className="text-body font-bold text-primary">{fmt(empr.costDifference)} ₪</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — restart + compare + print + share */}
      <div className="flex flex-wrap justify-center gap-3 mb-space-5 no-print">
        <button type="button" onClick={onRestart}
          className="rounded-xl border-2 border-border px-5 py-2.5 text-body font-medium text-primary hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1">
          <ArrowRight className="h-4 w-4" />
          התחל מחדש
        </button>
        {!comparisonResult && (
          <button type="button" onClick={onCompare}
            className="rounded-xl border-2 border-gold px-5 py-2.5 text-body font-medium text-gold hover:bg-gold/5 cursor-pointer transition-all">
            השווה מול תרחיש נוסף
          </button>
        )}
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

      {/* Comparison — intentionally empty here, moved to top */}

      {/* CTA */}
      <div className="mt-space-8 text-center no-print">
        <h3 className="text-h3 font-bold text-primary mb-space-3">לחישוב מדויק המותאם למצב שלכם</h3>
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

      {/* Print CSS — compact one-pager */}
      <style jsx global>{`
        /* Watermark hidden on screen */
        .ec-watermark { display: none; }

        @media print {
          /* Hide everything except results */
          nav, footer, header, .no-print,
          [class*="introBody"], [class*="disclaimer"],
          [class*="WhatsApp"], [class*="whatsapp"] { display: none !important; }
          .print-only { display: block !important; }

          /* Watermark — fixed, centered, diagonal, faded.
             Uses !important to beat body { font-size: 10px !important } below. */
          .ec-watermark {
            display: block !important;
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

          /* The tool page wrapper often has large padding/margins — kill them */
          main, article, section { padding: 0 !important; }
          .print-area {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Hide the Sanity tool page header (title + intro above results) */
          .print-area ~ *, .print-area + * { display: none !important; }

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
          .py-2 { padding-top: 1px !important; padding-bottom: 1px !important; }
          .gap-3 { gap: 3px !important; }
          .mt-space-8, .mt-space-7, .mt-space-5 { margin-top: 6px !important; }

          /* Visual cleanup */
          .rounded-2xl, .rounded-xl { border-radius: 4px !important; }
          .shadow-md { box-shadow: none !important; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }

          /* Force page to start immediately */
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  )
}

/* ─── Comparison Block (Ron May 2026 #47): tabs + swap A/B + verdict ─── */

type Scenario = { result: EmployerCalcResult; inputs: EmployerInputs }

function ComparisonBlock({
  primary,
  comparison,
  onRemove,
}: {
  primary: Scenario
  comparison: Scenario
  onRemove: () => void
}) {
  // Default activeIdx = scenario with lower employer cost (preferred-first parity).
  const preferredIdx = useMemo<0 | 1>(() => {
    return primary.result.employer.totalWithShvui <= comparison.result.employer.totalWithShvui ? 0 : 1
  }, [primary, comparison])
  const [activeIdx, setActiveIdx] = useState<0 | 1>(preferredIdx)

  // Reorder so the active scenario is column A
  const colA = activeIdx === 0 ? primary : comparison
  const colB = activeIdx === 0 ? comparison : primary

  const cheaperLabel = colA.result.employer.totalWithShvui < colB.result.employer.totalWithShvui ? "תרחיש א׳"
    : colA.result.employer.totalWithShvui > colB.result.employer.totalWithShvui ? "תרחיש ב׳" : null

  const higherNetLabel = colA.result.employee.netWithShvui > colB.result.employee.netWithShvui ? "תרחיש א׳"
    : colA.result.employee.netWithShvui < colB.result.employee.netWithShvui ? "תרחיש ב׳" : null

  return (
    <div className="mb-space-6">
      <div className="flex items-center justify-between mb-space-3">
        <h3 className="text-h4 font-bold text-primary">השוואת תרחישים</h3>
        <button type="button" onClick={onRemove}
          className="text-body-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors no-print">
          הסר השוואה
        </button>
      </div>

      {/* Scenario tabs (icon parity with leasing #28) */}
      <div className="flex justify-center gap-2 mb-space-3 no-print" role="tablist" aria-label="תרחישים">
        {([0, 1] as const).map((idx) => {
          const scen = idx === 0 ? primary : comparison
          const active = idx === activeIdx
          return (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveIdx(idx)}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-body-sm font-bold border-2 transition-all cursor-pointer',
                active
                  ? 'border-gold bg-gold/10 text-gold scale-105 shadow-sm'
                  : 'border-border bg-white text-text-muted hover:bg-surface',
              ].join(' ')}
            >
              <BarChart3 className="h-4 w-4" />
              ברוטו {fmt(scen.inputs.grossSalary)} ₪
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        <table className="w-full text-body-sm" dir="rtl">
          <thead>
            <tr className="bg-primary text-white">
              <th className="py-2.5 px-4 text-start font-semibold"></th>
              <th className="py-2.5 px-4 text-center font-bold border-x border-white/20">תרחיש א׳</th>
              <th className="py-2.5 px-4 text-center font-bold">תרחיש ב׳</th>
              <th className="py-2.5 px-4 text-center font-bold border-r border-white/20">הפרש</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light">
              <td className="py-2 px-4 text-text-muted font-medium">ברוטו</td>
              <td className="py-2 px-4 text-center font-medium">{fmt(colA.inputs.grossSalary)} ₪</td>
              <td className="py-2 px-4 text-center font-medium">{fmt(colB.inputs.grossSalary)} ₪</td>
              <td className="py-2 px-4 text-center text-text-muted">{fmt(Math.abs(colA.inputs.grossSalary - colB.inputs.grossSalary))} ₪</td>
            </tr>
            <tr className="border-b border-border-light bg-surface/30">
              <td className="py-2 px-4 text-text-muted font-medium">עלות מעסיק</td>
              <td className="py-2 px-4 text-center font-bold text-gold-dark">{fmt(colA.result.employer.totalWithShvui)} ₪</td>
              <td className="py-2 px-4 text-center font-bold text-primary">{fmt(colB.result.employer.totalWithShvui)} ₪</td>
              <td className="py-2 px-4 text-center font-bold text-primary">{fmt(Math.abs(colA.result.employer.totalWithShvui - colB.result.employer.totalWithShvui))} ₪</td>
            </tr>
            <tr className="border-b border-border-light">
              <td className="py-2 px-4 text-text-muted font-medium">נטו עובד</td>
              <td className="py-2 px-4 text-center font-bold text-gold-dark">{fmt(colA.result.employee.netWithShvui)} ₪</td>
              <td className="py-2 px-4 text-center font-bold text-primary">{fmt(colB.result.employee.netWithShvui)} ₪</td>
              <td className="py-2 px-4 text-center font-bold text-primary">{fmt(Math.abs(colA.result.employee.netWithShvui - colB.result.employee.netWithShvui))} ₪</td>
            </tr>
            {(colA.result.hasShvuiMas || colB.result.hasShvuiMas) && (
              <tr className="bg-surface/30">
                <td className="py-2 px-4 text-text-muted font-medium">שווי מס</td>
                <td className="py-2 px-4 text-center">{fmt(colA.result.totalShvuiMas)} ₪</td>
                <td className="py-2 px-4 text-center">{fmt(colB.result.totalShvuiMas)} ₪</td>
                <td className="py-2 px-4 text-center">{fmt(Math.abs(colA.result.totalShvuiMas - colB.result.totalShvuiMas))} ₪</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Verdict */}
      <div className="mt-space-3 bg-gold/5 border border-gold rounded-xl p-space-3 text-center">
        <p className="text-body font-bold text-primary">
          {cheaperLabel
            ? `${cheaperLabel} זול יותר למעסיק ב-${fmt(Math.abs(colA.result.employer.totalWithShvui - colB.result.employer.totalWithShvui))} ₪`
            : 'עלות מעסיק שווה בשני התרחישים'}
        </p>
        <p className="text-body-sm text-text-muted mt-1">
          {higherNetLabel
            ? `נטו עובד גבוה יותר ב${higherNetLabel} ב-${fmt(Math.abs(colA.result.employee.netWithShvui - colB.result.employee.netWithShvui))} ₪`
            : 'נטו עובד שווה בשני התרחישים'}
        </p>
      </div>
    </div>
  )
}

/* ─── Section Component ─── */

function Section({ title, rows }: { title: string; rows: { label: string; value: string; bold?: boolean; muted?: boolean }[] }) {
  return (
    <div className="mb-space-3">
      <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">{title}</h4>
      {rows.map((row, i) => (
        <div key={row.label} className={[
          'flex justify-between py-2 px-2 text-body-sm border-b border-border-light last:border-b-0',
          i % 2 === 0 ? '' : 'bg-surface/30',
        ].join(' ')}>
          <span className="text-text-muted">{row.label}</span>
          <span className={row.bold ? 'text-primary font-bold' : row.muted ? 'text-text-muted' : 'text-text-secondary font-medium'}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
