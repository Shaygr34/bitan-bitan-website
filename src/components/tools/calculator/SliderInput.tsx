'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type NodePoint = {
  value: number
  label: string
}

type SliderInputProps = {
  label: string
  subtitle?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  /** Key points marked on the slider */
  nodes?: NodePoint[]
  /** Format display value */
  format?: (value: number) => string
  /** Suffix for manual input */
  suffix?: string
  /** Show manual input */
  allowManual?: boolean
  /** Computed display below slider */
  computedDisplay?: string
  /** Compact mode */
  compact?: boolean
}

function defaultFormat(n: number): string {
  return n.toLocaleString('he-IL')
}

export function SliderInput({
  label,
  subtitle,
  min,
  max,
  step = 1,
  value,
  onChange,
  nodes,
  format = defaultFormat,
  suffix = '₪',
  allowManual = true,
  computedDisplay,
  compact = false,
}: SliderInputProps) {
  const [manualValue, setManualValue] = useState('')
  const [isManualFocused, setIsManualFocused] = useState(false)
  const sliderRef = useRef<HTMLInputElement>(null)

  // Calculate fill percentage for styling
  const fillPercent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value)
      onChange(v)
    },
    [onChange]
  )

  const handleNodeClick = useCallback(
    (nodeValue: number) => {
      onChange(nodeValue)
    },
    [onChange]
  )

  const handleManualChange = useCallback(
    (raw: string) => {
      setManualValue(raw)
      const num = parseFloat(raw.replace(/,/g, ''))
      if (!isNaN(num) && num >= 0) {
        onChange(Math.min(max, Math.max(min, num)))
      }
    },
    [onChange, min, max]
  )

  // Sync manual value when slider changes
  useEffect(() => {
    if (!isManualFocused) {
      setManualValue('')
    }
  }, [value, isManualFocused])

  return (
    <div className={compact ? 'mb-space-4' : 'mb-space-6'}>
      <div className="flex items-baseline justify-between mb-space-1">
        <label className="text-body font-semibold text-primary">{label}</label>
        <span className="text-body font-bold text-gold">
          {format(value)} {suffix}
        </span>
      </div>
      {subtitle && (
        <p className="text-caption text-text-muted mb-space-2">{subtitle}</p>
      )}

      {/* Slider track */}
      <div className="relative mt-space-2 mb-space-1">
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="slider-input w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to left, #C5A572 ${fillPercent}%, #E2E0DB ${fillPercent}%)`,
          }}
        />
      </div>

      {/* Node points */}
      {nodes && nodes.length > 0 && (
        <div className="flex justify-between mt-space-1 px-0.5">
          {nodes.map((node) => {
            const isActive = value === node.value
            const isClose = Math.abs(value - node.value) < (max - min) * 0.03
            return (
              <button
                key={node.value}
                type="button"
                onClick={() => handleNodeClick(node.value)}
                className={[
                  'text-caption px-1 py-0.5 rounded transition-all cursor-pointer',
                  isActive || isClose
                    ? 'text-gold font-bold'
                    : 'text-text-muted hover:text-primary',
                ].join(' ')}
              >
                {node.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Manual input */}
      {allowManual && (
        <div className="mt-space-2 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={isManualFocused ? manualValue : ''}
            onChange={(e) => handleManualChange(e.target.value)}
            onFocus={() => {
              setIsManualFocused(true)
              setManualValue(value.toString())
            }}
            onBlur={() => setIsManualFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            placeholder="הזנה ידנית"
            className="rounded-lg border border-border px-3 py-1.5 text-body-sm w-full text-center focus:border-gold focus:outline-none transition-colors"
          />
          <span className="text-body-sm text-text-muted shrink-0">{suffix}</span>
        </div>
      )}

      {computedDisplay && (
        <p className="text-body-sm text-gold font-medium mt-space-1 text-center">
          {computedDisplay}
        </p>
      )}

      {/* Slider thumb styling */}
      <style jsx global>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #C5A572;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(27, 42, 74, 0.2);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-input::-webkit-slider-thumb:active {
          transform: scale(1.25);
        }
        .slider-input::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #C5A572;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(27, 42, 74, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
