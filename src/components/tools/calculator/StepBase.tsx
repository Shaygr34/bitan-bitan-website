'use client'

import { InputGroup, ToggleGroup } from './InputGroup'
import { CAR_PRICE_PRESETS, INCOME_PRESETS } from './config'
import type { BaseInputs, VehicleType, UserType } from './types'

type StepBaseProps = {
  values: Partial<BaseInputs>
  onChange: (updates: Partial<BaseInputs>) => void
  onNext: () => void
}

const VEHICLE_OPTIONS: { value: VehicleType; label: string; sublabel?: string }[] = [
  { value: 'privatePetrol', label: 'פרטי (בנזין)' },
  { value: 'privateElectric', label: 'פרטי (חשמלי)' },
  { value: 'commercialPetrol', label: 'מסחרי (בנזין)', sublabel: 'מעל 3.5 טון, מונית, אוטובוס' },
  { value: 'commercialElectric', label: 'מסחרי (חשמלי)', sublabel: 'מעל 3.5 טון, מונית, אוטובוס' },
]

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL')
}

export function StepBase({ values, onChange, onNext }: StepBaseProps) {
  const isComplete =
    values.userType &&
    values.vehicleType &&
    values.carPrice &&
    values.carPrice > 0 &&
    values.monthlyIncome &&
    values.monthlyIncome > 0

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

      {/* Vehicle Type */}
      <div className="mb-space-6">
        <label className="block text-body font-semibold text-primary mb-space-1">
          סוג רכב
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VEHICLE_OPTIONS.map((opt) => {
            const isSelected = values.vehicleType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ vehicleType: opt.value })}
                className={[
                  'rounded-lg border px-3 py-3 text-center cursor-pointer transition-all duration-fast',
                  isSelected
                    ? 'border-gold bg-gold/10 text-primary font-bold shadow-sm'
                    : 'border-border hover:border-gold/50 hover:bg-gold/5 text-text-secondary',
                ].join(' ')}
              >
                <span className="text-body-sm block">{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-caption text-text-muted mt-0.5 block">{opt.sublabel}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Car Price */}
      <InputGroup
        label="מחיר הרכב"
        subtitle="כולל מע״מ"
        presets={CAR_PRICE_PRESETS.map((p) => ({
          value: p,
          label: `${formatCurrency(p)} ₪`,
        }))}
        value={values.carPrice || null}
        onChange={(v) => onChange({ carPrice: v })}
        manualPlaceholder="הזן מחיר"
        columns={3}
      />

      {/* Monthly Income */}
      <InputGroup
        label="הכנסה חודשית ברוטו"
        subtitle="הכנסות בניכוי הוצאות, כולל שכ״ע — לצורך חישוב חיסכון מס"
        presets={INCOME_PRESETS.map((p) => ({
          value: p,
          label: `${formatCurrency(p)} ₪`,
        }))}
        value={values.monthlyIncome || null}
        onChange={(v) => onChange({ monthlyIncome: v })}
        manualPlaceholder="הזן סכום"
        columns={3}
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
