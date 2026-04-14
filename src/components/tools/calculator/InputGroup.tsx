'use client'

import { useState } from 'react'

type Preset = {
  value: number
  label: string
  sublabel?: string
}

type InputGroupProps = {
  label: string
  subtitle?: string
  presets: Preset[]
  value: number | null
  onChange: (value: number) => void
  allowManual?: boolean
  manualPlaceholder?: string
  suffix?: string
  /** Show computed display value below input */
  computedDisplay?: string
  /** Columns for preset grid (default 3) */
  columns?: 2 | 3 | 4
  /** Compact mode — less spacing */
  compact?: boolean
}

export function InputGroup({
  label,
  subtitle,
  presets,
  value,
  onChange,
  allowManual = true,
  manualPlaceholder = 'הזן סכום',
  suffix = '₪',
  computedDisplay,
  columns = 3,
  compact = false,
}: InputGroupProps) {
  const [manualValue, setManualValue] = useState('')
  const [isManual, setIsManual] = useState(false)

  function handlePresetClick(preset: Preset) {
    setIsManual(false)
    setManualValue('')
    onChange(preset.value)
  }

  function handleManualChange(raw: string) {
    setManualValue(raw)
    const num = parseFloat(raw)
    if (!isNaN(num) && num >= 0) {
      setIsManual(true)
      onChange(num)
    }
  }

  function handleManualFocus() {
    setIsManual(true)
  }

  const gridCols =
    columns === 2 ? 'grid-cols-2' :
    columns === 4 ? 'grid-cols-2 sm:grid-cols-4' :
    'grid-cols-2 sm:grid-cols-3'

  return (
    <div className={compact ? 'mb-space-4' : 'mb-space-6'}>
      <label className="block text-body font-semibold text-primary mb-space-1">
        {label}
      </label>
      {subtitle && (
        <p className="text-body-sm text-text-muted mb-space-3">{subtitle}</p>
      )}

      <div className={`grid ${gridCols} gap-2`}>
        {presets.map((preset) => {
          const isSelected = !isManual && value === preset.value
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={[
                'rounded-lg border px-3 py-2.5 text-center cursor-pointer transition-all duration-fast',
                isSelected
                  ? 'border-gold bg-gold/10 text-primary font-bold shadow-sm'
                  : 'border-border hover:border-gold/50 hover:bg-gold/5 text-text-secondary',
              ].join(' ')}
            >
              <span className="text-body-sm block">{preset.label}</span>
              {preset.sublabel && (
                <span className="text-caption text-text-muted mt-0.5 block">{preset.sublabel}</span>
              )}
            </button>
          )
        })}
      </div>

      {allowManual && (
        <div className="mt-space-2 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={isManual ? manualValue : ''}
            onChange={(e) => handleManualChange(e.target.value)}
            onFocus={handleManualFocus}
            placeholder={manualPlaceholder}
            className={[
              'rounded-lg border px-3 py-2.5 text-body-sm w-full text-center transition-colors',
              isManual && value !== null
                ? 'border-gold bg-gold/5 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40'
                : 'border-border focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
            ].join(' ')}
          />
          {suffix && <span className="text-body-sm text-text-muted shrink-0">{suffix}</span>}
        </div>
      )}

      {computedDisplay && (
        <p className="text-body-sm text-gold font-medium mt-space-2 text-center">
          {computedDisplay}
        </p>
      )}
    </div>
  )
}

/* ─── Toggle Component ─── */

type ToggleOption = {
  value: string
  label: string
  disabled?: boolean
  badge?: string
}

type ToggleGroupProps = {
  label: string
  subtitle?: string
  options: ToggleOption[]
  value: string | null
  onChange: (value: string) => void
}

export function ToggleGroup({ label, subtitle, options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="mb-space-6">
      <label className="block text-body font-semibold text-primary mb-space-1">
        {label}
      </label>
      {subtitle && (
        <p className="text-body-sm text-text-muted mb-space-3">{subtitle}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onChange(opt.value)}
              className={[
                'rounded-lg border px-4 py-2.5 text-center transition-all duration-fast relative',
                opt.disabled
                  ? 'border-border bg-surface text-text-muted cursor-not-allowed opacity-60'
                  : isSelected
                    ? 'border-gold bg-gold/10 text-primary font-bold shadow-sm cursor-pointer'
                    : 'border-border hover:border-gold/50 hover:bg-gold/5 text-text-secondary cursor-pointer',
              ].join(' ')}
            >
              <span className="text-body-sm">{opt.label}</span>
              {opt.badge && (
                <span className="absolute -top-2 -start-1 bg-gold/20 text-gold text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {opt.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Yes/No Toggle ─── */

type YesNoProps = {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export function YesNoToggle({ label, value, onChange }: YesNoProps) {
  return (
    <div className="mb-space-4 flex items-center justify-between">
      <span className="text-body-sm font-medium text-primary">{label}</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            'rounded-md border px-3 py-1.5 text-body-sm cursor-pointer transition-all',
            value ? 'border-gold bg-gold/10 text-primary font-bold' : 'border-border text-text-muted',
          ].join(' ')}
        >
          כן
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            'rounded-md border px-3 py-1.5 text-body-sm cursor-pointer transition-all',
            !value ? 'border-gold bg-gold/10 text-primary font-bold' : 'border-border text-text-muted',
          ].join(' ')}
        >
          לא
        </button>
      </div>
    </div>
  )
}
