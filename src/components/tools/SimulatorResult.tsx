'use client'

import { Car, Check, ArrowLeft } from 'lucide-react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import type { SimulatorResult as SimulatorResultType, SimulatorAnswers } from './leasing-logic'

type SimulatorResultProps = {
  result: SimulatorResultType
  answers: SimulatorAnswers
  onRestart: () => void
}

const OPTION_NAMES: Record<string, string> = {
  operational: 'ליסינג תפעולי',
  financial: 'ליסינג מימוני',
  purchase: 'רכישת רכב',
}

const CONFIDENCE_MAP = {
  strong: { label: 'התאמה גבוהה', className: 'bg-green-100 text-green-800' },
  moderate: { label: 'התאמה בינונית', className: 'bg-amber-100 text-amber-800' },
}

const COMPARISON_ROWS: { key: string; label: string; values: Record<string, string> }[] = [
  {
    key: 'ownership',
    label: 'בעלות',
    values: {
      operational: 'אין — הרכב חוזר בסוף',
      financial: 'אפשרות רכישה בסוף',
      purchase: 'בעלות מלאה מיידית',
    },
  },
  {
    key: 'flexibility',
    label: 'גמישות',
    values: {
      operational: 'גבוהה — קל להחליף',
      financial: 'בינונית',
      purchase: 'נמוכה — מכירה עצמאית',
    },
  },
  {
    key: 'certainty',
    label: 'ודאות תקציבית',
    values: {
      operational: 'מלאה — סכום קבוע',
      financial: 'גבוהה',
      purchase: 'נמוכה — הוצאות משתנות',
    },
  },
  {
    key: 'maintenance',
    label: 'אחזקה',
    values: {
      operational: 'כלולה במחיר',
      financial: 'באחריות הלוקח',
      purchase: 'באחריות הבעלים',
    },
  },
  {
    key: 'period',
    label: 'תקופה מתאימה',
    values: {
      operational: '1-3 שנים',
      financial: '2-4 שנים',
      purchase: '3+ שנים',
    },
  },
]

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL')
}

export function SimulatorResult({ result, answers, onRestart }: SimulatorResultProps) {
  const rec = result.recommendation
  const recOption = result.options[rec]
  const conf = CONFIDENCE_MAP[result.confidence]

  return (
    <div>
      {/* Recommendation Card */}
      <div className="bg-white rounded-2xl border-2 border-gold shadow-lg overflow-hidden">
        <div className="bg-primary px-space-6 py-space-4 flex items-center gap-3">
          <Car className="h-6 w-6 text-gold" />
          <h2 className="text-body-lg font-bold text-white">ההמלצה שלנו</h2>
        </div>

        <div className="p-space-6">
          <div className="flex flex-wrap items-center gap-space-3 mb-space-4">
            <h3 className="text-h2 font-bold text-primary">{OPTION_NAMES[rec]}</h3>
            <span className={`px-3 py-1 rounded-full text-caption font-medium ${conf.className}`}>
              {conf.label}
            </span>
          </div>

          <div className="mb-space-4">
            <span className="text-h3 text-gold font-bold">
              {formatCurrency(recOption.monthlyPayment)} &#8362;
            </span>
            <span className="text-body text-text-muted me-1">/חודש</span>
          </div>

          <p className="text-body text-text-secondary mb-space-3">
            עלות כוללת משוערת: {formatCurrency(recOption.totalCost)} &#8362;
          </p>

          <div className="p-space-3 bg-surface rounded-lg mb-space-4">
            <p className="text-body-sm text-text-muted leading-relaxed">
              {recOption.taxBenefit}
            </p>
          </div>

          <ul className="space-y-2">
            {recOption.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-body text-text-secondary">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-space-7">
        <h3 className="text-h3 font-bold text-primary mb-space-5 text-center">
          השוואה מלאה
        </h3>

        {/* Desktop: unified table */}
        <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="p-space-4 text-body-sm text-text-muted font-medium text-start bg-surface border-b border-border" />
                {(['operational', 'financial', 'purchase'] as const).map((key) => {
                  const opt = result.options[key]
                  const isRec = key === rec
                  return (
                    <th
                      key={key}
                      className={[
                        'p-space-4 border-b',
                        isRec ? 'bg-gold/5 border-b-2 border-b-gold' : 'bg-surface border-border',
                      ].join(' ')}
                    >
                      <span className={`text-h4 font-bold block ${isRec ? 'text-primary' : 'text-text-muted'}`}>
                        {OPTION_NAMES[key]}
                      </span>
                      <span className={`text-body-lg font-bold block mt-1 ${isRec ? 'text-gold' : 'text-text-muted'}`}>
                        {formatCurrency(opt.monthlyPayment)} &#8362;/חודש
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}>
                  <td className="p-space-4 text-body-sm text-text-muted font-medium text-start border-e border-border-light">
                    {row.label}
                  </td>
                  {(['operational', 'financial', 'purchase'] as const).map((key) => {
                    const isRec = key === rec
                    return (
                      <td
                        key={key}
                        className={[
                          'p-space-4 text-body-sm',
                          isRec ? 'text-primary font-medium' : 'text-text-muted',
                        ].join(' ')}
                      >
                        {row.values[key]}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-space-4">
          {(['operational', 'financial', 'purchase'] as const).map((key) => {
            const opt = result.options[key]
            const isRec = key === rec
            return (
              <div
                key={key}
                className={[
                  'bg-white rounded-xl border overflow-hidden',
                  isRec ? 'border-gold border-2' : 'border-border opacity-70',
                ].join(' ')}
              >
                <div className={`px-space-4 py-space-3 flex items-center justify-between ${isRec ? 'bg-gold/5' : 'bg-surface'}`}>
                  <h4 className={`text-h4 font-bold ${isRec ? 'text-primary' : 'text-text-muted'}`}>{OPTION_NAMES[key]}</h4>
                  <span className={`text-body-lg font-bold ${isRec ? 'text-gold' : 'text-text-muted'}`}>
                    {formatCurrency(opt.monthlyPayment)} &#8362;/חודש
                  </span>
                </div>
                <div className="px-space-4 py-space-2">
                  {COMPARISON_ROWS.map((row) => (
                    <div key={row.key} className="flex justify-between py-space-2 border-b border-border-light last:border-b-0">
                      <span className="text-body-sm text-text-muted">{row.label}</span>
                      <span className={`text-body-sm ${isRec ? 'text-text-secondary font-medium' : 'text-text-muted'}`}>{row.values[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-space-8 text-center">
        <h3 className="text-h3 font-bold text-primary mb-space-3">
          רוצים חישוב מדויק?
        </h3>
        <p className="text-body text-text-secondary max-w-narrow mx-auto mb-space-6">
          הסימולטור נותן הערכה כללית. לחישוב מדויק המותאם למצב שלכם — דברו איתנו.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" location="leasing-simulator" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            location="leasing-simulator"
          />
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-space-4 inline-flex items-center gap-1 text-gold underline cursor-pointer text-body hover:text-gold-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          התחל מחדש
        </button>
      </div>
    </div>
  )
}
