'use client'

import { Car, Truck } from 'lucide-react'
import { ToggleGroup } from './InputGroup'
import { SliderInput } from './SliderInput'
import type { BaseInputs, VehicleType, UserType } from './types'

type StepBaseProps = {
  values: Partial<BaseInputs>
  onChange: (updates: Partial<BaseInputs>) => void
  onNext: () => void
}

// Derived state helpers
function getVehicleCategory(vt?: VehicleType): 'private' | 'commercial' | null {
  if (!vt) return null
  return vt.startsWith('commercial') ? 'commercial' : 'private'
}

function getFuelType(vt?: VehicleType): 'petrol' | 'electric' | null {
  if (!vt) return null
  return vt.includes('Electric') ? 'electric' : 'petrol'
}

function buildVehicleType(category: 'private' | 'commercial', fuel: 'petrol' | 'electric'): VehicleType {
  if (category === 'private') return fuel === 'electric' ? 'privateElectric' : 'privatePetrol'
  return fuel === 'electric' ? 'commercialElectric' : 'commercialPetrol'
}

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL')
}

export function StepBase({ values, onChange, onNext }: StepBaseProps) {
  const category = getVehicleCategory(values.vehicleType)
  const fuel = getFuelType(values.vehicleType)

  const isComplete =
    values.userType &&
    values.vehicleType &&
    values.carPrice &&
    values.carPrice > 0 &&
    values.monthlyIncome &&
    values.monthlyIncome > 0

  function handleCategoryChange(cat: 'private' | 'commercial') {
    // When category changes, default to petrol
    onChange({ vehicleType: buildVehicleType(cat, fuel || 'petrol') })
  }

  function handleFuelChange(f: 'petrol' | 'electric') {
    if (category) {
      onChange({ vehicleType: buildVehicleType(category, f) })
    }
  }

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">
        פרטים בסיסיים
      </h2>
      <p className="text-body text-text-muted text-center mb-space-7">
        נתחיל עם המידע הבסיסי לחישוב
      </p>

      {/* User Type */}
      <ToggleGroup
        label="סוג משתמש"
        options={[
          { value: 'selfEmployed', label: 'עצמאי' },
          { value: 'employee', label: 'שכיר', disabled: true, badge: 'בקרוב' },
        ]}
        value={values.userType || null}
        onChange={(v) => onChange({ userType: v as UserType })}
      />

      {/* Vehicle Type — 2 step reveal */}
      <div className="mb-space-6">
        <label className="block text-body font-semibold text-primary mb-space-3">
          סוג רכב
        </label>

        {/* Step 1: Private vs Commercial */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleCategoryChange('private')}
            className={[
              'rounded-xl border-2 px-4 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-base',
              category === 'private'
                ? 'border-gold bg-gold/10 shadow-sm'
                : 'border-border hover:border-gold/50 hover:bg-gold/5',
            ].join(' ')}
          >
            <Car className={[
              'h-7 w-7 transition-colors',
              category === 'private' ? 'text-gold' : 'text-text-muted',
            ].join(' ')} />
            <span className={[
              'text-body font-bold',
              category === 'private' ? 'text-primary' : 'text-text-secondary',
            ].join(' ')}>פרטי</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange('commercial')}
            className={[
              'rounded-xl border-2 px-4 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-base',
              category === 'commercial'
                ? 'border-gold bg-gold/10 shadow-sm'
                : 'border-border hover:border-gold/50 hover:bg-gold/5',
            ].join(' ')}
          >
            <Truck className={[
              'h-7 w-7 transition-colors',
              category === 'commercial' ? 'text-gold' : 'text-text-muted',
            ].join(' ')} />
            <span className={[
              'text-body font-bold',
              category === 'commercial' ? 'text-primary' : 'text-text-secondary',
            ].join(' ')}>מסחרי</span>
            <span className="text-caption text-text-muted">מעל 3.5 טון, מונית, אוטובוס</span>
          </button>
        </div>

        {/* Step 2: Fuel type — appears after category selection */}
        {category && (
          <div
            className="mt-space-3 flex gap-2"
            style={{ animation: 'fadeIn 200ms ease-out' }}
          >
            <button
              type="button"
              onClick={() => handleFuelChange('petrol')}
              className={[
                'flex-1 rounded-lg border px-3 py-2.5 text-center cursor-pointer transition-all duration-fast text-body-sm',
                fuel === 'petrol'
                  ? 'border-gold bg-gold/10 text-primary font-bold'
                  : 'border-border hover:border-gold/50 text-text-secondary',
              ].join(' ')}
            >
              ⛽ בנזין
            </button>
            <button
              type="button"
              onClick={() => handleFuelChange('electric')}
              className={[
                'flex-1 rounded-lg border px-3 py-2.5 text-center cursor-pointer transition-all duration-fast text-body-sm',
                fuel === 'electric'
                  ? 'border-gold bg-gold/10 text-primary font-bold'
                  : 'border-border hover:border-gold/50 text-text-secondary',
              ].join(' ')}
            >
              ⚡ חשמלי
            </button>
          </div>
        )}
      </div>

      {/* Car Price — Slider */}
      <SliderInput
        label="מחיר הרכב"
        subtitle="כולל מע״מ"
        min={50000}
        max={400000}
        step={5000}
        value={values.carPrice || 150000}
        onChange={(v) => onChange({ carPrice: v })}
        nodes={[
          { value: 100000, label: '100K' },
          { value: 150000, label: '150K' },
          { value: 200000, label: '200K' },
          { value: 250000, label: '250K' },
          { value: 300000, label: '300K' },
        ]}
        format={formatCurrency}
      />

      {/* Monthly Income — Slider */}
      <SliderInput
        label="הכנסה חודשית ברוטו"
        subtitle="הכנסות בניכוי הוצאות, כולל שכ״ע — לצורך חישוב חיסכון מס"
        min={5000}
        max={60000}
        step={1000}
        value={values.monthlyIncome || 20000}
        onChange={(v) => onChange({ monthlyIncome: v })}
        nodes={[
          { value: 15000, label: '15K' },
          { value: 20000, label: '20K' },
          { value: 30000, label: '30K' },
          { value: 40000, label: '40K' },
          { value: 50000, label: '50K' },
        ]}
        format={formatCurrency}
      />

      {/* Next */}
      <div className="mt-space-7 text-center">
        <button
          type="button"
          disabled={!isComplete}
          onClick={onNext}
          className={[
            'rounded-xl px-8 py-3 text-body font-bold transition-all duration-base',
            isComplete
              ? 'bg-gold text-white hover:bg-gold-hover cursor-pointer shadow-md'
              : 'bg-border text-text-muted cursor-not-allowed',
          ].join(' ')}
        >
          המשך ←
        </button>
      </div>
    </div>
  )
}
