'use client'

import { Car, CreditCard, RefreshCw } from 'lucide-react'
import type { OptionType } from './types'

type StepPickOptionProps = {
  onSelect: (option: OptionType) => void
  excludeOption?: OptionType | null
}

const OPTIONS: {
  value: OptionType
  label: string
  description: string
  icon: typeof Car
}[] = [
  {
    value: 'purchase',
    label: 'רכישת רכב',
    description: 'רכישת רכב חדש או יד שנייה עם הון עצמי והלוואה',
    icon: Car,
  },
  {
    value: 'financialLeasing',
    label: 'ליסינג מימוני',
    description: 'ליסינג עם אפשרות רכישה בסוף התקופה',
    icon: CreditCard,
  },
  {
    value: 'operationalLeasing',
    label: 'ליסינג תפעולי',
    description: 'שכירות חודשית — אחזקה וביטוח כלולים',
    icon: RefreshCw,
  },
]

export function StepPickOption({ onSelect, excludeOption }: StepPickOptionProps) {
  const visibleOptions = excludeOption
    ? OPTIONS.filter((o) => o.value !== excludeOption)
    : OPTIONS

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">
        {excludeOption ? 'מול מה להשוות?' : 'איזו אפשרות תרצה לבדוק?'}
      </h2>
      <p className="text-body text-text-muted text-center mb-space-7">
        {excludeOption
          ? 'בחר אפשרות נוספת להשוואה מול התוצאה הקודמת'
          : 'נבדוק את המספרים ונראה מה עדיף עבורך'}
      </p>

      <div className="space-y-3 max-w-[480px] mx-auto">
        {visibleOptions.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className="w-full rounded-xl border-2 border-border hover:border-gold px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-base hover:bg-gold/5 hover:shadow-sm group text-start"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/5 group-hover:bg-gold/10 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="h-5 w-5 text-primary group-hover:text-gold transition-colors" />
              </div>
              <div>
                <span className="text-body font-bold text-primary block">{opt.label}</span>
                <span className="text-body-sm text-text-muted block">{opt.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
