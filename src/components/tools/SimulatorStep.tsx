'use client'

import { useState } from 'react'

type SimulatorStepProps = {
  question: string
  subtitle?: string
  options: { value: string; label: string; sublabel?: string }[]
  selectedValue?: string
  onSelect: (value: string) => void
  allowCustomInput?: boolean
  customInputLabel?: string
  customInputPlaceholder?: string
  onCustomInput?: (value: number) => void
}

export function SimulatorStep({
  question,
  subtitle,
  options,
  selectedValue,
  onSelect,
  allowCustomInput,
  customInputLabel,
  customInputPlaceholder,
  onCustomInput,
}: SimulatorStepProps) {
  const [customValue, setCustomValue] = useState('')

  function handleCustomSubmit() {
    const num = parseInt(customValue, 10)
    if (num > 0 && onCustomInput) {
      onCustomInput(num)
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-h2 font-bold text-primary text-center mb-space-3">
        {question}
      </h2>
      {subtitle && (
        <p className="text-body text-text-secondary text-center mb-space-7">
          {subtitle}
        </p>
      )}

      <div className="max-w-[560px] mx-auto">
        {/* Pyramid layout: pairs on top, odd one centered below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-3">
          {options.map((opt, idx) => {
            const isSelected = selectedValue === opt.value
            const isOddLast = options.length % 2 === 1 && idx === options.length - 1
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={[
                  'rounded-xl border-2 px-6 py-4 text-center cursor-pointer transition-all duration-base',
                  isSelected
                    ? 'border-gold bg-gold/10 text-primary font-bold shadow-sm'
                    : 'border-border hover:border-gold hover:bg-gold/5',
                  isOddLast ? 'sm:col-span-2 sm:mx-auto sm:w-1/2' : '',
                ].join(' ')}
              >
                <span className="text-body-lg block">{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-body-sm text-text-muted mt-1 block">
                    {opt.sublabel}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {allowCustomInput && (
        <div className="mt-space-5 flex items-center justify-center gap-space-3 flex-wrap">
          {customInputLabel && (
            <span className="text-body-sm text-text-muted">{customInputLabel}</span>
          )}
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomSubmit()
              }}
              onBlur={handleCustomSubmit}
              placeholder={customInputPlaceholder}
              className="rounded-lg border border-border px-4 py-3 text-body w-40 text-center focus:border-gold focus:outline-none transition-colors"
            />
            <span className="text-body text-text-muted">&#8362;</span>
          </div>
        </div>
      )}
    </div>
  )
}
