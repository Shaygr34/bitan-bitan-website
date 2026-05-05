'use client'

import { useState, useCallback, useEffect } from 'react'

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
  nodes?: NodePoint[]
  format?: (value: number) => string
  suffix?: string
  allowManual?: boolean
  computedDisplay?: string
  compact?: boolean
  goldFormat?: (value: number) => string // separate format for the large gold display (e.g. "P + 1%")
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
  goldFormat,
}: SliderInputProps) {
  const [manualValue, setManualValue] = useState('')
  const [isManualFocused, setIsManualFocused] = useState(false)

  // RTL: range input flips, min on right, max on left
  // Fill percentage from the RIGHT (start) side
  const fillPercent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value))
    },
    [onChange]
  )

  const handleNodeClick = useCallback(
    (nodeValue: number) => {
      onChange(nodeValue)
    },
    [onChange]
  )

  const handleManualSubmit = useCallback(
    (raw: string) => {
      const num = parseFloat(raw.replace(/,/g, ''))
      if (!isNaN(num)) {
        onChange(Math.min(max, Math.max(min, num)))
      }
    },
    [onChange, min, max]
  )

  // Keep manual input synced when not focused
  useEffect(() => {
    if (!isManualFocused) {
      setManualValue('')
    }
  }, [value, isManualFocused])

  // Displayed value text — goldFormat overrides for the large display only
  const goldDisplayValue = goldFormat ? goldFormat(value) : `${format(value)} ${suffix}`.trim()
  const displayValue = `${format(value)} ${suffix}`.trim()

  return (
    <div className={compact ? 'mb-space-5' : 'mb-space-6'}>
      {/* Header: label — gold when value set, muted when default */}
      <div className="flex items-baseline justify-between mb-space-1">
        <label className={`text-body font-semibold ${value !== min ? 'text-primary' : 'text-text-muted'}`}>{label}</label>
      </div>
      {subtitle && (
        <p className="text-caption text-text-muted mb-space-1">{subtitle}</p>
      )}

      {/* Large centered value */}
      <div className="text-center mb-space-2">
        <span className="text-h3 font-bold text-gold">{goldDisplayValue}</span>
      </div>

      {/* Slider track */}
      <div className="relative mt-space-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="slider-input w-full h-2.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to left, #C5A572 ${fillPercent}%, #E2E0DB ${fillPercent}%)`,
          }}
        />
      </div>

      {/* Node points — evenly distributed labels.
          Uniform font-weight (medium) prevents layout shift when active node
          changes during drag — only color swaps, widths stay stable. */}
      {nodes && nodes.length > 0 && (
        <div className="flex justify-between mt-space-1 px-1">
          {nodes.map((node) => {
            const isActive = value === node.value
            const isClose = Math.abs(value - node.value) < (max - min) * 0.05
            return (
              <button
                key={node.value}
                type="button"
                onClick={() => handleNodeClick(node.value)}
                className={[
                  'text-caption font-medium px-1 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap',
                  isActive || isClose
                    ? 'text-gold'
                    : 'text-text-muted hover:text-primary',
                ].join(' ')}
              >
                {node.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Manual input — shows current value as placeholder */}
      {allowManual && (
        <div className="mt-space-1 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={isManualFocused ? manualValue : format(value)}
            onChange={(e) => setManualValue(e.target.value)}
            onFocus={() => {
              setIsManualFocused(true)
              setManualValue(value.toString())
            }}
            onBlur={() => {
              handleManualSubmit(manualValue)
              setIsManualFocused(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualSubmit(manualValue);
                (e.target as HTMLInputElement).blur()
              }
            }}
            placeholder="הזנה ידנית"
            className="rounded-lg border border-border px-3 py-1.5 text-body-sm w-full text-center focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 transition-colors text-text-muted placeholder:text-text-muted/60"
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
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #C5A572;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(27, 42, 74, 0.25);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-input::-webkit-slider-thumb:active {
          transform: scale(1.25);
          box-shadow: 0 2px 12px rgba(197, 165, 114, 0.5);
        }
        .slider-input::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #C5A572;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(27, 42, 74, 0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
