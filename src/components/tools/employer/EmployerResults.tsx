'use client'

import { ArrowRight, Wallet, Receipt, TrendingDown, Users } from 'lucide-react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import type { EmployerCalcResult, EmployerInputs } from './types'

type Props = {
  result: EmployerCalcResult
  inputs: EmployerInputs
  onRestart: () => void
}

function fmt(n: number): string {
  return n.toLocaleString('he-IL')
}

export function EmployerResults({ result, inputs, onRestart }: Props) {
  const { employee: emp, employer: empr, vehicleTaxBenefit, hasVehicle } = result

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">תוצאות חישוב עלות מעסיק</h2>
      <p className="text-body text-text-muted text-center mb-space-6">סכומים חודשיים</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-space-6">
        <div className="rounded-lg p-space-3 border border-gold bg-gold/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">עלות מעסיק כולל רכב</span>
          </div>
          <span className="text-body-lg font-bold text-gold block">{fmt(empr.totalWithVehicle)} ₪</span>
        </div>
        <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className="h-4 w-4 text-gold" />
            <span className="text-caption text-text-muted">עלות מעסיק ללא רכב</span>
          </div>
          <span className="text-body font-bold text-primary block">{fmt(empr.totalWithoutVehicle)} ₪</span>
        </div>
        {hasVehicle && (
          <>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">הפרש עלות מעסיק (רכב)</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(empr.costDifference)} ₪</span>
            </div>
            <div className="rounded-lg p-space-3 border border-border-light bg-surface/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-gold" />
                <span className="text-caption text-text-muted">פער נטו עובד (רכב)</span>
              </div>
              <span className="text-body font-bold text-primary block">{fmt(emp.netDifference)} ₪</span>
            </div>
          </>
        )}
      </div>

      {/* Employee Breakdown */}
      <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden mb-space-5">
        <div className="bg-primary px-space-5 py-space-3">
          <h3 className="text-body-lg font-bold text-white">עובד</h3>
        </div>
        <div className="p-space-4">
          <Section title="נתוני הזנה" rows={[
            { label: 'שכר ברוטו', value: `${fmt(emp.grossSalary)} ₪` },
            ...(hasVehicle ? [{ label: 'שווי מס רכב', value: `${fmt(vehicleTaxBenefit)} ₪` }] : []),
            ...(emp.imputedEducationFund > 0 ? [{ label: 'שווי זקופות השתלמות', value: `${fmt(emp.imputedEducationFund)} ₪` }] : []),
            ...(emp.imputedPension > 0 ? [{ label: 'שווי זקופות תגמולים', value: `${fmt(emp.imputedPension)} ₪` }] : []),
            ...(emp.imputedSeverance > 0 ? [{ label: 'שווי זקופות פיצויים', value: `${fmt(emp.imputedSeverance)} ₪` }] : []),
            { label: 'סה"כ שכר חייב במס', value: `${fmt(emp.totalTaxableIncome)} ₪`, bold: true },
          ]} />

          <Section title="ניכויים" rows={[
            { label: 'ביטוח לאומי', value: `${fmt(emp.niiEmployee)} ₪` },
            { label: 'מס הכנסה', value: `${fmt(emp.incomeTax)} ₪` },
            { label: 'פנסיה עובד', value: `${fmt(emp.pensionEmployee)} ₪` },
            { label: 'קרן השתלמות עובד', value: `${fmt(emp.educationFundEmployee)} ₪` },
            { label: 'סה"כ ניכויים', value: `${fmt(emp.totalDeductions)} ₪`, bold: true },
          ]} />

          <Section title="נטו" rows={[
            { label: 'נטו עובד כולל שווי רכב', value: `${fmt(emp.netWithVehicle)} ₪`, bold: true },
            { label: 'נטו עובד ללא שווי רכב', value: `${fmt(emp.netWithoutVehicle)} ₪` },
            ...(hasVehicle ? [{ label: 'פער נטו (השפעת רכב)', value: `${fmt(emp.netDifference)} ₪`, bold: true }] : []),
          ]} />

          <p className="text-caption text-text-muted mt-space-2">
            נקודות זיכוי: {emp.totalCreditPoints} ({fmt(emp.creditPointsValue)} ₪/חודש)
          </p>
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
            { label: 'תגמולים פנסיה מעסיק', value: `${fmt(empr.pensionEmployer)} ₪` },
            { label: 'פיצויים מעסיק', value: `${fmt(empr.severanceEmployer)} ₪` },
            { label: 'קרן השתלמות מעסיק', value: `${fmt(empr.educationFundEmployer)} ₪` },
            { label: 'ביטוח לאומי מעסיק', value: `${fmt(empr.niiEmployer)} ₪` },
          ]} />

          {/* Side by side: with vs without vehicle */}
          <div className="mb-space-3">
            <h4 className="text-body-sm font-bold text-primary bg-surface/60 px-2 py-1.5 rounded mb-0">סיכום עלות מעסיק</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg border border-gold bg-gold/5 p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">כולל שווי רכב</span>
                <span className="text-body-lg font-bold text-gold block">{fmt(empr.totalWithVehicle)} ₪</span>
              </div>
              <div className="rounded-lg border border-border p-space-3 text-center">
                <span className="text-caption text-text-muted block mb-1">ללא שווי רכב</span>
                <span className="text-body-lg font-bold text-primary block">{fmt(empr.totalWithoutVehicle)} ₪</span>
              </div>
            </div>
            {hasVehicle && (
              <div className="text-center mt-2 py-2 bg-surface rounded-lg">
                <span className="text-body-sm text-text-muted">הפרש עלות מעסיק (השפעת רכב): </span>
                <span className="text-body font-bold text-primary">{fmt(empr.costDifference)} ₪</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-space-8 text-center">
        <h3 className="text-h3 font-bold text-primary mb-space-3">רוצים חישוב מדויק?</h3>
        <p className="text-body text-text-secondary max-w-narrow mx-auto mb-space-6">
          המחשבון נותן הערכה כללית. לחישוב מדויק המותאם למצב שלכם — דברו איתנו.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" location="employer-calculator" />
          <PhoneCTA label="חייגו אלינו" variant="secondary" location="employer-calculator" />
        </div>
        <div className="flex justify-center gap-3 mt-space-5">
          <button type="button" onClick={onRestart}
            className="rounded-xl border-2 border-border px-5 py-2.5 text-body font-medium text-primary hover:bg-surface cursor-pointer transition-all inline-flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            התחל מחדש
          </button>
        </div>
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
