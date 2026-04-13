'use client'

import { useCallback } from 'react'
import { ArrowRight, Wallet, Receipt, TrendingDown, Users, Printer, Share2 } from 'lucide-react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import type { EmployerCalcResult, EmployerInputs } from './types'

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

  const handleShare = useCallback(async () => {
    const url = window.location.href
    const text = `מחשבון עלות מעסיק — ביטן את ביטן`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('הקישור הועתק!')
    }
  }, [])

  return (
    <div className="print-area">
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">תוצאות חישוב עלות מעסיק</h2>
      <p className="text-body text-text-muted text-center mb-space-6">סכומים חודשיים</p>

      {/* Print watermark (hidden on screen) */}
      <div className="print-only hidden text-center text-text-muted text-caption mb-4">
        נתוני שכר להמחשה בלבד
      </div>

      {/* Key Metrics — Employer Summary */}
      <div className="grid grid-cols-2 gap-3 mb-space-6">
        <div className="rounded-lg p-space-3 border border-gold bg-gold/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">עלות מעסיק כולל שווי מס</span>
          </div>
          <span className="text-body-lg font-bold text-gold block">{fmt(empr.totalWithShvui)} ₪</span>
        </div>
        <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">עלות מעסיק ללא שווי מס</span>
          </div>
          <span className="text-body font-bold text-primary block">{fmt(empr.totalWithoutShvui)} ₪</span>
        </div>
        {hasShvuiMas && (
          <>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">הפרש עלות מעסיק (השפעה שווי מס)</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(empr.costDifference)} ₪</span>
            </div>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">פער נטו עובד (שווי מס)</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(emp.netDifference)} ₪</span>
            </div>
          </>
        )}
      </div>

      {/* שווי מס Breakdown — only if has שווי מס */}
      {hasShvuiMas && (
        <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden mb-space-5">
          <div className="bg-gold/10 px-space-5 py-space-3">
            <h3 className="text-body-lg font-bold text-primary">פירוט שווי מס</h3>
          </div>
          <div className="p-space-4">
            {emp.vehicleTaxBenefit > 0 && (
              <div className="flex justify-between py-2 px-2 text-body-sm border-b border-border-light">
                <span className="text-text-muted">שווי רכב</span>
                <span className="text-text-secondary font-medium">{fmt(emp.vehicleTaxBenefit)} ₪</span>
              </div>
            )}
            {emp.mealBenefit > 0 && (
              <div className="flex justify-between py-2 px-2 text-body-sm border-b border-border-light bg-surface/30">
                <span className="text-text-muted">שווי ארוחות</span>
                <span className="text-text-secondary font-medium">{fmt(emp.mealBenefit)} ₪</span>
              </div>
            )}
            {emp.otherBenefit > 0 && (
              <div className="flex justify-between py-2 px-2 text-body-sm border-b border-border-light">
                <span className="text-text-muted">שווי מס נוסף</span>
                <span className="text-text-secondary font-medium">{fmt(emp.otherBenefit)} ₪</span>
              </div>
            )}
            <div className="flex justify-between py-2 px-2 text-body-sm font-bold">
              <span className="text-primary">סה&quot;כ שווי מס</span>
              <span className="text-primary">{fmt(emp.totalShvuiMas)} ₪</span>
            </div>

            <div className="mt-space-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gold bg-gold/5 p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">שכר נטו <strong>כולל</strong> שווי מס</span>
                <span className="text-body-lg font-bold text-gold block">{fmt(emp.netWithShvui)} ₪</span>
              </div>
              <div className="rounded-lg border border-border p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">שכר נטו <strong>ללא</strong> שווי מס</span>
                <span className="text-body-lg font-bold text-primary block">{fmt(emp.netWithoutShvui)} ₪</span>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Credit points display */}
          <div className="mb-space-3 bg-surface/40 rounded-lg p-space-3">
            <p className="text-body-sm text-primary">
              <span className="font-bold">{creditBreakdown.total.toFixed(2)}</span>{' '}
              נקודות זיכוי ({fmt(creditBreakdown.monthlyValue)} ₪/חודש)
              {creditBreakdown.pensionCredit > 0 && (
                <> + זיכויים נוספים {fmt(creditBreakdown.pensionCredit)} ₪</>
              )}
              {', '}
              סה&quot;כ זיכוי מס:{' '}
              <span className="font-bold">{fmt(creditBreakdown.monthlyValue + creditBreakdown.pensionCredit)} ₪</span>
            </p>
          </div>

          {/* Net Summary — employee */}
          <div className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">סיכום נטו עובד</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg border border-gold bg-gold/5 p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">נטו עובד <strong>כולל</strong> שווי מס</span>
                <span className="text-body-lg font-bold text-gold block">{fmt(emp.netWithShvui)} ₪</span>
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
                <span className="text-body-lg font-bold text-gold block">{fmt(empr.totalWithShvui)} ₪</span>
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
      </div>

      {/* Comparison */}
      {comparisonResult && comparisonInputs && (
        <div className="mb-space-5">
          <div className="flex items-center justify-between mb-space-3">
            <h3 className="text-h4 font-bold text-primary">השוואת תרחישים</h3>
            <button type="button" onClick={onRemoveComparison}
              className="text-body-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors no-print">
              הסר השוואה
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Scenario A */}
            <div className="rounded-xl border border-gold bg-gold/5 p-space-3">
              <h4 className="text-body-sm font-bold text-gold text-center mb-space-2">תרחיש א׳</h4>
              <div className="space-y-1.5 text-body-sm">
                <div className="flex justify-between"><span className="text-text-muted">ברוטו</span><span className="font-medium">{fmt(inputs.grossSalary)} ₪</span></div>
                <div className="flex justify-between"><span className="text-text-muted">עלות מעסיק</span><span className="font-bold text-gold">{fmt(result.employer.totalWithShvui)} ₪</span></div>
                <div className="flex justify-between"><span className="text-text-muted">נטו עובד</span><span className="font-bold">{fmt(result.employee.netWithShvui)} ₪</span></div>
                {result.hasShvuiMas && (
                  <div className="flex justify-between"><span className="text-text-muted">שווי מס</span><span className="font-medium">{fmt(result.totalShvuiMas)} ₪</span></div>
                )}
              </div>
            </div>

            {/* Scenario B */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-space-3">
              <h4 className="text-body-sm font-bold text-primary text-center mb-space-2">תרחיש ב׳</h4>
              <div className="space-y-1.5 text-body-sm">
                <div className="flex justify-between"><span className="text-text-muted">ברוטו</span><span className="font-medium">{fmt(comparisonInputs.grossSalary)} ₪</span></div>
                <div className="flex justify-between"><span className="text-text-muted">עלות מעסיק</span><span className="font-bold text-primary">{fmt(comparisonResult.employer.totalWithShvui)} ₪</span></div>
                <div className="flex justify-between"><span className="text-text-muted">נטו עובד</span><span className="font-bold">{fmt(comparisonResult.employee.netWithShvui)} ₪</span></div>
                {comparisonResult.hasShvuiMas && (
                  <div className="flex justify-between"><span className="text-text-muted">שווי מס</span><span className="font-medium">{fmt(comparisonResult.totalShvuiMas)} ₪</span></div>
                )}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="mt-space-3 bg-surface rounded-xl p-space-3 text-center">
            <p className="text-body-sm text-text-muted mb-1">הפרש עלות מעסיק:</p>
            <p className="text-body font-bold text-primary">
              {fmt(Math.abs(result.employer.totalWithShvui - comparisonResult.employer.totalWithShvui))} ₪
              {result.employer.totalWithShvui < comparisonResult.employer.totalWithShvui
                ? ' (תרחיש א׳ זול יותר למעסיק)'
                : result.employer.totalWithShvui > comparisonResult.employer.totalWithShvui
                  ? ' (תרחיש ב׳ זול יותר למעסיק)'
                  : ' (שווים)'}
            </p>
            <p className="text-body-sm text-text-muted mt-1">הפרש נטו עובד:</p>
            <p className="text-body font-bold text-primary">
              {fmt(Math.abs(result.employee.netWithShvui - comparisonResult.employee.netWithShvui))} ₪
              {result.employee.netWithShvui > comparisonResult.employee.netWithShvui
                ? ' (תרחיש א׳ גבוה יותר לעובד)'
                : result.employee.netWithShvui < comparisonResult.employee.netWithShvui
                  ? ' (תרחיש ב׳ גבוה יותר לעובד)'
                  : ' (שווים)'}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-space-8 text-center no-print">
        <h3 className="text-h3 font-bold text-primary mb-space-3">רוצים חישוב מדויק?</h3>
        <p className="text-body text-text-secondary max-w-narrow mx-auto mb-space-6">
          המחשבון נותן הערכה כללית. לחישוב מדויק המותאם למצב שלכם — דברו איתנו.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" location="employer-calculator" />
          <PhoneCTA label="חייגו אלינו" variant="secondary" location="employer-calculator" />
        </div>
      </div>

      {/* Print disclaimer (hidden on screen) */}
      <div className="print-only hidden mt-8 pt-4 border-t border-border text-center">
        <p className="text-caption text-text-muted">אין לנו אחריות. המידע להמחשה בלבד ואינו מהווה ייעוץ מקצועי.</p>
        <p className="text-caption text-text-muted">ביטן את ביטן — רואי חשבון | bitancpa.com</p>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          nav, footer, .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-area { max-width: 100% !important; }
          body { font-size: 12px !important; }
        }
      `}</style>
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
