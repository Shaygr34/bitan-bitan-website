'use client'

import { useCallback, useState } from 'react'
import { ArrowRight, Wallet, Receipt, TrendingDown, Users, Printer, Share2, BarChart3, ChevronDown } from 'lucide-react'
import type { EmployerCalcResult, EmployerInputs } from './types'
import { DEFAULT_EMPLOYER_CONFIG } from './config'
import { encodeEmployerParams } from './EmployerCalculator'
import { getNIIRatesV2, NII_CATEGORY_V2_LABELS, NII_CALCTYPE_LABELS } from '@/lib/tax-tables-2026'

type Props = {
  result: EmployerCalcResult
  inputs: EmployerInputs
  onRestart: () => void
  onCompare: () => void
  comparisonResult: EmployerCalcResult | null
  comparisonInputs: EmployerInputs | null
  onRemoveComparison: () => void
  onEditPrimary: () => void
  onEditComparison: () => void
}

function fmt(n: number): string {
  return n.toLocaleString('he-IL')
}

export function EmployerResults({ result, inputs, onRestart, onCompare, comparisonResult, comparisonInputs, onRemoveComparison, onEditPrimary, onEditComparison }: Props) {
  // activeIdx selects which scenario the breakdown sections below render.
  // 0 = primary (תרחיש א׳), 1 = comparison (תרחיש ב׳). Card click flips this;
  // ערוך link still routes to the wizard via onEditPrimary/onEditComparison.
  const [activeIdx, setActiveIdx] = useState(0)
  const isCompareMode = !!(comparisonResult && comparisonInputs)
  const activeResult = isCompareMode && activeIdx === 1 ? (comparisonResult as EmployerCalcResult) : result
  const activeInputs = isCompareMode && activeIdx === 1 ? (comparisonInputs as EmployerInputs) : inputs

  const { employee: emp, employer: empr, hasShvuiMas } = activeResult
  const creditBreakdown = emp.creditPointsBreakdown

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const [shareMsg, setShareMsg] = useState('')
  const handleShare = useCallback(async () => {
    // Encode primary + comparison (if present) — comparison preserved across share
    const qs = encodeEmployerParams(inputs, comparisonInputs)
    const shareUrl = `${window.location.origin}${window.location.pathname}?${qs}`

    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear() % 100).padStart(2, '0')
    const text = `ביטן את ביטן רו"ח - סימולציה עלות מעסיק / עובד מיום ${dd}/${mm}/${yy}`

    // Always attempt the native share sheet first (WhatsApp/Mail/Telegram on mobile,
    // OS share picker on Chromium desktop). Fall back to clipboard copy only when
    // navigator.share is unavailable or rejects with a non-cancel error.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: text, text, url: shareUrl })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        // any other error → fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl)
    setShareMsg('הקישור הועתק!')
    setTimeout(() => setShareMsg(''), 2000)
  }, [inputs, comparisonInputs])

  return (
    <div className="print-area">
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">תוצאות חישוב עלות מעסיק</h2>
      <p className="text-body text-text-muted text-center mb-space-6">סכומים חודשיים</p>

      {/* Print watermark — rendered via html::before in print CSS so the fixed
          containing block is the viewport (repeats on every page). The previous
          .ec-watermark div was trapped inside a transformed/animated ancestor
          and only painted on whichever page it landed in document order. */}

      {/* Comparison Table — CENTER STAGE when comparing.
          Card click selects which scenario the breakdown below shows;
          the small "✏ ערוך" rubric inside each card routes to the wizard. */}
      {isCompareMode && (
        <ComparisonBlock
          primary={{ result, inputs }}
          comparison={{ result: comparisonResult as EmployerCalcResult, inputs: comparisonInputs as EmployerInputs }}
          onRemove={onRemoveComparison}
          onEditPrimary={onEditPrimary}
          onEditComparison={onEditComparison}
          activeIdx={activeIdx}
          onSelect={setActiveIdx}
        />
      )}

      {/* Scenario heading — labels which scenario the breakdown sections below refer to.
          Toggles between א׳/ב׳ as the user selects different cards above. */}
      {isCompareMode && (
        <div className="mb-space-4 flex items-center justify-between gap-3 px-1">
          <h3 className="text-h4 font-bold text-primary">
            {activeIdx === 0 ? 'תרחיש א׳ — פירוט מלא' : 'תרחיש ב׳ — פירוט מלא'}
          </h3>
          <span className="text-caption text-text-muted">
            {activeIdx === 0 ? 'לפירוט תרחיש ב׳ — לחצו עליו למעלה' : 'לפירוט תרחיש א׳ — לחצו עליו למעלה'}
          </span>
        </div>
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

          {/* ניכויים — ביטוח לאומי + מס הכנסה rows are themselves the disclosures.
              No separate dropdowns below: the breakdown opens in-row on click,
              eliminating the duplicate "סה"כ" line that used to appear underneath. */}
          <div className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">ניכויים</h4>

            {/* Row 1: ביטוח לאומי — clickable */}
            {(() => {
              const cfg = DEFAULT_EMPLOYER_CONFIG
              const rates = getNIIRatesV2(activeInputs.niiCategoryV2, activeInputs.niiCalcType)
              const niiBase = emp.totalTaxableIncome
              const lowAmount = Math.min(niiBase, cfg.niiLowThreshold)
              const highAmount = Math.max(niiBase - cfg.niiLowThreshold, 0)
              const lowNii = Math.round(lowAmount * rates.employeeLow)
              const highNii = Math.round(highAmount * rates.employeeHigh)
              const catLabel = NII_CATEGORY_V2_LABELS[activeInputs.niiCategoryV2]
              const calcLabel = NII_CALCTYPE_LABELS[activeInputs.niiCalcType]
              return (
                <details className="group border-b border-border-light">
                  <summary className="flex justify-between items-center py-2 px-2 text-body-sm cursor-pointer hover:bg-surface/40 list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180 text-text-muted/70" />
                      ביטוח לאומי
                    </span>
                    <span className="text-text-secondary font-medium">{fmt(emp.niiEmployee)} ₪</span>
                  </summary>
                  <div className="text-caption text-text-muted bg-surface/40 px-3 py-2 space-y-0.5">
                    <div>סיווג: {catLabel} / {calcLabel}</div>
                    <div>בסיס חישוב: {fmt(niiBase)} ₪</div>
                    <div>מתחת לתקרה ({fmt(cfg.niiLowThreshold)} ₪) × {(rates.employeeLow * 100).toFixed(2)}% = {fmt(lowNii)} ₪</div>
                    {highAmount > 0 && (
                      <div>מעל לתקרה ({fmt(highAmount)} ₪) × {(rates.employeeHigh * 100).toFixed(2)}% = {fmt(highNii)} ₪</div>
                    )}
                  </div>
                </details>
              )
            })()}

            {/* Row 2: מס הכנסה — clickable, expands to credit-points breakdown */}
            {(() => {
              const baseNz = creditBreakdown.total - creditBreakdown.degree
              const baseValue = Math.round(baseNz * (creditBreakdown.monthlyValue / Math.max(creditBreakdown.total, 0.0001)))
              const degreeValue = Math.round(creditBreakdown.degree * (creditBreakdown.monthlyValue / Math.max(creditBreakdown.total, 0.0001)))
              const totalCredit = creditBreakdown.monthlyValue + creditBreakdown.pensionCredit + creditBreakdown.yishuvCredit
              return (
                <details className="group border-b border-border-light bg-surface/30">
                  <summary className="flex justify-between items-center py-2 px-2 text-body-sm cursor-pointer hover:bg-surface/50 list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180 text-text-muted/70" />
                      מס הכנסה
                    </span>
                    <span className="text-text-secondary font-medium">{fmt(emp.incomeTax)} ₪</span>
                  </summary>
                  <div className="text-caption text-text-muted bg-surface/40 px-3 py-2 space-y-1">
                    <p>
                      <span className="font-bold">{baseNz.toFixed(2)}</span> {'נ"ז'} ({fmt(baseValue)} ₪/חודש)
                      {creditBreakdown.reservist > 0 && (
                        <> · כולל {creditBreakdown.reservist.toFixed(2)} {'נ"ז'} מילואים</>
                      )}
                    </p>
                    {creditBreakdown.degree > 0 && (
                      <p>+ {'נ"ז'} תואר/מקצוע: <span className="font-bold">{creditBreakdown.degree.toFixed(2)}</span> {'נ"ז'} ({fmt(degreeValue)} ₪/חודש)</p>
                    )}
                    {creditBreakdown.pensionCredit > 0 && (
                      <p>+ זיכוי פנסיה: <span className="font-bold">{fmt(creditBreakdown.pensionCredit)} ₪</span></p>
                    )}
                    {creditBreakdown.yishuvCredit > 0 && (
                      <p>+ זיכוי יישוב מוטב: <span className="font-bold">{fmt(creditBreakdown.yishuvCredit)} ₪</span></p>
                    )}
                    <p className="pt-1 border-t border-border/50 mt-1">
                      {'סה"כ זיכוי מס: '}
                      <span className="font-bold text-gold-dark">{fmt(totalCredit)} ₪/חודש</span>
                    </p>
                  </div>
                </details>
              )
            })()}

            {/* Static rows */}
            <div className="flex justify-between py-2 px-2 text-body-sm border-b border-border-light">
              <span className="text-text-muted">פנסיה עובד</span>
              <span className="text-text-secondary font-medium">{fmt(emp.pensionEmployee)} ₪</span>
            </div>
            <div className="flex justify-between py-2 px-2 text-body-sm border-b border-border-light bg-surface/30">
              <span className="text-text-muted">קרן השתלמות עובד</span>
              <span className="text-text-secondary font-medium">{fmt(emp.educationFundEmployee)} ₪</span>
            </div>
            <div className="flex justify-between py-2 px-2 text-body-sm">
              <span className="text-text-muted">{'סה"כ ניכויים'}</span>
              <span className="text-primary font-bold">{fmt(emp.totalDeductions)} ₪</span>
            </div>
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
        @media print {
          /* Hide everything except results */
          nav, footer, header, .no-print,
          [class*="introBody"], [class*="disclaimer"],
          [class*="WhatsApp"], [class*="whatsapp"] { display: none !important; }
          .print-only { display: block !important; }

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

/* ─── Comparison Block (Ron May 5 2026): scenario cards are click-to-edit ─── */

type Scenario = { result: EmployerCalcResult; inputs: EmployerInputs }

function ScenarioCard({
  label,
  scenario,
  onSelect,
  onEdit,
  cheaper,
  active,
}: {
  label: string
  scenario: Scenario
  onSelect: () => void
  onEdit: () => void
  cheaper: boolean
  active: boolean
}) {
  // Outer = display (selects which scenario the breakdown below shows).
  // Inner ערוך button stops propagation and routes to the wizard for editing.
  // Using a div+role rather than nested <button>s to keep semantics valid.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={active}
      aria-label={`הצג ${label}`}
      className={[
        'group text-start rounded-xl border-2 p-space-3 transition-all cursor-pointer no-print',
        active ? 'ring-2 ring-gold-dark shadow-md' : '',
        cheaper
          ? 'border-gold bg-gold/5 hover:bg-gold/10'
          : 'border-border bg-white hover:border-gold/60 hover:bg-surface/40',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-caption text-text-muted font-medium flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          {label}
          {active && <span className="text-caption text-gold-dark font-bold">• מוצג</span>}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="text-caption text-gold-dark font-bold underline-offset-2 hover:underline cursor-pointer transition-opacity"
          aria-label={`ערוך ${label}`}
        >
          ✏ ערוך
        </button>
      </div>
      <div className="text-body font-bold text-primary">{'ברוטו '}{fmt(scenario.inputs.grossSalary)} ₪</div>
      <div className="text-caption text-text-muted mt-0.5">
        {'עלות מעסיק: '}{fmt(scenario.result.employer.totalWithShvui)} ₪
      </div>
      <div className="text-caption text-text-muted">
        {'נטו עובד: '}{fmt(scenario.result.employee.netWithShvui)} ₪
      </div>
    </div>
  )
}

function ComparisonBlock({
  primary,
  comparison,
  onRemove,
  onEditPrimary,
  onEditComparison,
  activeIdx,
  onSelect,
}: {
  primary: Scenario
  comparison: Scenario
  onRemove: () => void
  onEditPrimary: () => void
  onEditComparison: () => void
  activeIdx: number
  onSelect: (idx: number) => void
}) {
  // Always show A on the left, B on the right (no activeIdx swap — click = edit).
  const colA = primary
  const colB = comparison

  const cheaperLabel = colA.result.employer.totalWithShvui < colB.result.employer.totalWithShvui ? "תרחיש א׳"
    : colA.result.employer.totalWithShvui > colB.result.employer.totalWithShvui ? "תרחיש ב׳" : null

  const higherNetLabel = colA.result.employee.netWithShvui > colB.result.employee.netWithShvui ? "תרחיש א׳"
    : colA.result.employee.netWithShvui < colB.result.employee.netWithShvui ? "תרחיש ב׳" : null

  const cheaperA = colA.result.employer.totalWithShvui <= colB.result.employer.totalWithShvui

  return (
    <div className="mb-space-6">
      <div className="flex items-center justify-between mb-space-3">
        <h3 className="text-h4 font-bold text-primary">השוואת תרחישים</h3>
        <button type="button" onClick={onRemove}
          className="text-body-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors no-print">
          הסר השוואה
        </button>
      </div>

      {/* Scenario cards — outer click selects the scenario shown below; ערוך → wizard. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-space-3 no-print">
        <ScenarioCard
          label="תרחיש א׳"
          scenario={primary}
          onSelect={() => onSelect(0)}
          onEdit={onEditPrimary}
          cheaper={cheaperA}
          active={activeIdx === 0}
        />
        <ScenarioCard
          label="תרחיש ב׳"
          scenario={comparison}
          onSelect={() => onSelect(1)}
          onEdit={onEditComparison}
          cheaper={!cheaperA}
          active={activeIdx === 1}
        />
      </div>
      <p className="text-caption text-text-muted text-center mb-space-3 no-print">
        לחצו על תרחיש להצגתו | ✏ ערוך — לשינוי הנתונים
      </p>

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
