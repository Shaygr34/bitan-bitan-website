'use client'

import { SliderInput } from './SliderInput'
import { YesNoToggle } from './InputGroup'
import {
  ELECTRIC_KM_PRESETS,
  DEFAULT_FUEL_MONTHLY,
  DEFAULT_MAINTENANCE_YEARLY,
  DEFAULT_INSURANCE_YEARLY,
  getOperationalRateBracket,
} from './config'
import type {
  OptionType,
  VehicleType,
  PurchaseInputs,
  FinancialLeasingInputs,
  OperationalLeasingInputs,
} from './types'

type StepDetailsProps = {
  optionType: OptionType
  vehicleType: VehicleType
  carPrice: number
  primeRate: number
  inputs: Partial<PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs>
  onChange: (updates: Record<string, unknown>) => void
  onNext: () => void
}

const OPTION_TITLES: Record<OptionType, string> = {
  purchase: 'רכישת רכב',
  financialLeasing: 'ליסינג מימוני',
  operationalLeasing: 'ליסינג תפעולי',
}

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL')
}

function formatPercent(n: number): string {
  return `${n}`
}

export function StepDetails({
  optionType,
  vehicleType,
  carPrice,
  primeRate,
  inputs,
  onChange,
  onNext,
}: StepDetailsProps) {
  const isElectric = vehicleType.includes('Electric')

  return (
    <div>
      <h2 className="text-h3 font-bold text-primary text-center mb-space-2">
        {OPTION_TITLES[optionType]}
      </h2>
      <p className="text-body text-text-muted text-center mb-space-6">
        כוונן את הפרמטרים — ברירות המחדל מבוססות על נתוני שוק
      </p>

      {optionType === 'purchase' && (
        <PurchaseFields
          carPrice={carPrice}
          primeRate={primeRate}
          isElectric={isElectric}
          inputs={inputs as Partial<PurchaseInputs>}
          onChange={onChange}
        />
      )}

      {optionType === 'financialLeasing' && (
        <FinancialFields
          carPrice={carPrice}
          primeRate={primeRate}
          isElectric={isElectric}
          inputs={inputs as Partial<FinancialLeasingInputs>}
          onChange={onChange}
        />
      )}

      {optionType === 'operationalLeasing' && (
        <OperationalFields
          carPrice={carPrice}
          isElectric={isElectric}
          inputs={inputs as Partial<OperationalLeasingInputs>}
          onChange={onChange}
        />
      )}

      <div className="mt-space-6 text-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl px-8 py-3 text-body font-bold bg-gold text-white hover:bg-gold-hover cursor-pointer shadow-md transition-all duration-base"
        >
          חשב תוצאות ←
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Purchase Fields
   ═══════════════════════════════════════════════ */

function PurchaseFields({
  carPrice,
  primeRate,
  isElectric,
  inputs,
  onChange,
}: {
  carPrice: number
  primeRate: number
  isElectric: boolean
  inputs: Partial<PurchaseInputs>
  onChange: (u: Record<string, unknown>) => void
}) {
  const equity = inputs.equityPercent ?? 25
  const equityAmount = Math.round(carPrice * (equity / 100))
  const loanAmount = carPrice - equityAmount
  const spread = inputs.interestSpread ?? 1
  const effectiveRate = primeRate + spread

  return (
    <>
      <div className="bg-surface rounded-xl p-space-4 mb-space-4">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי מימון</h3>

        <SliderInput
          label="הון עצמי"
          min={0}
          max={100}
          step={5}
          value={equity}
          onChange={(v) => onChange({ equityPercent: v })}
          nodes={[
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' },
          ]}
          format={formatPercent}
          suffix="%"
          computedDisplay={equity < 100 ? `הלוואה: ${formatCurrency(loanAmount)} ₪` : undefined}
          compact
        />

        {equity < 100 && (
          <>
            <SliderInput
              label="ריבית"
              subtitle={`פריים: ${primeRate}% | ריבית אפקטיבית: ${effectiveRate.toFixed(1)}%`}
              min={-1}
              max={3}
              step={0.5}
              value={spread}
              onChange={(v) => onChange({ interestSpread: v })}
              nodes={[
                { value: -1, label: 'P-1' },
                { value: 0, label: 'P+0' },
                { value: 1, label: 'P+1' },
                { value: 2, label: 'P+2' },
              ]}
              format={(v) => `P${v >= 0 ? '+' : ''}${v}%`}
              suffix=""
              compact
            />

            <SliderInput
              label="תקופת הלוואה"
              min={12}
              max={72}
              step={6}
              value={inputs.periodMonths ?? 60}
              onChange={(v) => onChange({ periodMonths: v })}
              nodes={[
                { value: 24, label: '24' },
                { value: 36, label: '36' },
                { value: 48, label: '48' },
                { value: 60, label: '60' },
              ]}
              format={(v) => `${v}`}
              suffix="חודשים"
              compact
            />
          </>
        )}
      </div>

      <RunningCosts isElectric={isElectric} inputs={inputs} onChange={onChange} showAll />
    </>
  )
}

/* ═══════════════════════════════════════════════
   Financial Leasing Fields
   ═══════════════════════════════════════════════ */

function FinancialFields({
  carPrice,
  primeRate,
  isElectric,
  inputs,
  onChange,
}: {
  carPrice: number
  primeRate: number
  isElectric: boolean
  inputs: Partial<FinancialLeasingInputs>
  onChange: (u: Record<string, unknown>) => void
}) {
  const downPct = inputs.downPaymentPercent ?? 15
  const residualPct = inputs.residualPercent ?? 30
  const downAmount = Math.round(carPrice * (downPct / 100))
  const residualAmount = Math.round(carPrice * (residualPct / 100))
  const loanAmount = Math.max(0, carPrice - downAmount - residualAmount)
  const spread = inputs.interestSpread ?? 2
  const effectiveRate = primeRate + spread

  return (
    <>
      <div className="bg-surface rounded-xl p-space-4 mb-space-4">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי ליסינג מימוני</h3>

        <SliderInput
          label="מקדמה"
          min={0}
          max={50}
          step={5}
          value={downPct}
          onChange={(v) => onChange({ downPaymentPercent: v })}
          nodes={[
            { value: 15, label: '15%' },
            { value: 20, label: '20%' },
            { value: 30, label: '30%' },
            { value: 40, label: '40%' },
          ]}
          format={formatPercent}
          suffix="%"
          computedDisplay={`${formatCurrency(downAmount)} ₪`}
          compact
        />

        <SliderInput
          label="יתרה בסוף תקופה (בלון)"
          min={10}
          max={60}
          step={5}
          value={residualPct}
          onChange={(v) => onChange({ residualPercent: v })}
          nodes={[
            { value: 30, label: '30%' },
            { value: 35, label: '35%' },
            { value: 40, label: '40%' },
            { value: 50, label: '50%' },
          ]}
          format={formatPercent}
          suffix="%"
          computedDisplay={`הלוואה: ${formatCurrency(loanAmount)} ₪`}
          compact
        />

        <YesNoToggle
          label="בוצע טרייד אין?"
          value={inputs.tradeIn ?? false}
          onChange={(v) => onChange({ tradeIn: v })}
        />

        {inputs.tradeIn && (
          <SliderInput
            label="סכום שהתקבל בגין הרכב הישן"
            min={0}
            max={200000}
            step={5000}
            value={inputs.tradeInAmount ?? 0}
            onChange={(v) => onChange({ tradeInAmount: v })}
            format={formatCurrency}
            compact
          />
        )}

        <SliderInput
          label="ריבית"
          subtitle={`פריים: ${primeRate}% | אפקטיבית: ${effectiveRate.toFixed(1)}%`}
          min={0.5}
          max={4}
          step={0.5}
          value={spread}
          onChange={(v) => onChange({ interestSpread: v })}
          nodes={[
            { value: 1, label: 'P+1' },
            { value: 2, label: 'P+2' },
            { value: 3, label: 'P+3' },
          ]}
          format={(v) => `P+${v}%`}
          suffix=""
          allowManual={false}
          compact
        />

        <SliderInput
          label="תקופה"
          min={12}
          max={72}
          step={6}
          value={inputs.periodMonths ?? 60}
          onChange={(v) => onChange({ periodMonths: v })}
          nodes={[
            { value: 24, label: '24' },
            { value: 36, label: '36' },
            { value: 48, label: '48' },
            { value: 60, label: '60' },
          ]}
          format={(v) => `${v}`}
          suffix="חודשים"
          allowManual={false}
          compact
        />
      </div>

      <RunningCosts isElectric={isElectric} inputs={inputs} onChange={onChange} showAll />
    </>
  )
}

/* ═══════════════════════════════════════════════
   Operational Leasing Fields
   ═══════════════════════════════════════════════ */

function OperationalFields({
  carPrice,
  isElectric,
  inputs,
  onChange,
}: {
  carPrice: number
  isElectric: boolean
  inputs: Partial<OperationalLeasingInputs>
  onChange: (u: Record<string, unknown>) => void
}) {
  const bracket = getOperationalRateBracket(carPrice)

  return (
    <>
      <div className="bg-surface rounded-xl p-space-4 mb-space-4">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי ליסינג תפעולי</h3>

        <SliderInput
          label="מקדמה"
          min={0}
          max={30}
          step={5}
          value={inputs.downPaymentPercent ?? 5}
          onChange={(v) => onChange({ downPaymentPercent: v })}
          nodes={[
            { value: 5, label: '5%' },
            { value: 10, label: '10%' },
            { value: 15, label: '15%' },
            { value: 20, label: '20%' },
          ]}
          format={formatPercent}
          suffix="%"
          computedDisplay={`${formatCurrency(Math.round(carPrice * ((inputs.downPaymentPercent ?? 5) / 100)))} ₪`}
          compact
        />

        <SliderInput
          label="תשלום ליסינג חודשי"
          subtitle="כולל מע״מ — מותאם לטווח המחיר"
          min={bracket.options[0]}
          max={bracket.options[bracket.options.length - 1]}
          step={100}
          value={inputs.monthlyLeasingPayment ?? bracket.defaultRate}
          onChange={(v) => onChange({ monthlyLeasingPayment: v })}
          nodes={bracket.options.map((o) => ({ value: o, label: formatCurrency(o) }))}
          format={formatCurrency}
          compact
        />
      </div>

      <div className="bg-surface rounded-xl p-space-4 mb-space-4">
        <h3 className="text-body font-bold text-primary mb-space-2">דלק</h3>
        <p className="text-caption text-text-muted mb-space-3">
          אחזקה וביטוח כלולים בליסינג תפעולי
        </p>

        {isElectric ? (
          <SliderInput
            label='נסיעה ק"מ ממוצע בחודש'
            min={500}
            max={3000}
            step={100}
            value={inputs.kmPerMonth ?? 1500}
            onChange={(km) => {
              const match = ELECTRIC_KM_PRESETS.find((e) => e.km === km)
              onChange({
                kmPerMonth: km,
                fuelMonthly: match ? match.cost : Math.round(km * 0.13),
              })
            }}
            nodes={ELECTRIC_KM_PRESETS.map((e) => ({ value: e.km, label: `${(e.km / 1000).toFixed(1)}K` }))}
            format={(v) => v.toLocaleString('he-IL')}
            suffix='ק"מ'
            compact
          />
        ) : (
          <SliderInput
            label="דלק (לחודש)"
            subtitle="כולל מע״מ"
            min={300}
            max={3000}
            step={100}
            value={(inputs.fuelMonthly as number) ?? DEFAULT_FUEL_MONTHLY}
            onChange={(v) => onChange({ fuelMonthly: v })}
            nodes={[
              { value: 500, label: '500' },
              { value: 1000, label: '1,000' },
              { value: 1500, label: '1,500' },
              { value: 2000, label: '2,000' },
              { value: 2500, label: '2,500' },
            ]}
            format={formatCurrency}
            compact
          />
        )}
      </div>

      <p className="text-caption text-text-muted text-center">
        * מעל 20,000 ק&quot;מ בשנה — תוספת של כ-0.2-0.3 ₪/ק&quot;מ עודף
      </p>
    </>
  )
}

/* ═══════════════════════════════════════════════
   Running Costs — Shared
   ═══════════════════════════════════════════════ */

function RunningCosts({
  isElectric,
  inputs,
  onChange,
  showAll,
}: {
  isElectric: boolean
  inputs: Record<string, unknown>
  onChange: (u: Record<string, unknown>) => void
  showAll: boolean
}) {
  return (
    <div className="bg-surface rounded-xl p-space-4 mb-space-4">
      <h3 className="text-body font-bold text-primary mb-space-3">הוצאות שוטפות</h3>

      {isElectric ? (
        <SliderInput
          label='נסיעה ק"מ ממוצע בחודש'
          min={500}
          max={3000}
          step={100}
          value={(inputs.kmPerMonth as number) ?? 1500}
          onChange={(km) => {
            const match = ELECTRIC_KM_PRESETS.find((e) => e.km === km)
            onChange({
              kmPerMonth: km,
              fuelMonthly: match ? match.cost : Math.round(km * 0.13),
            })
          }}
          nodes={ELECTRIC_KM_PRESETS.map((e) => ({ value: e.km, label: `${(e.km / 1000).toFixed(1)}K` }))}
          format={(v) => v.toLocaleString('he-IL')}
          suffix='ק"מ'
          compact
        />
      ) : (
        <SliderInput
          label="דלק (לחודש)"
          subtitle="כולל מע״מ"
          min={300}
          max={3000}
          step={100}
          value={(inputs.fuelMonthly as number) ?? DEFAULT_FUEL_MONTHLY}
          onChange={(v) => onChange({ fuelMonthly: v })}
          nodes={[
            { value: 500, label: '500' },
            { value: 1000, label: '1K' },
            { value: 1500, label: '1.5K' },
            { value: 2000, label: '2K' },
            { value: 2500, label: '2.5K' },
          ]}
          format={formatCurrency}
          compact
        />
      )}

      {showAll && (
        <>
          <SliderInput
            label="אחזקת רכב (לשנה)"
            min={3000}
            max={15000}
            step={500}
            value={(inputs.maintenanceYearly as number) ?? DEFAULT_MAINTENANCE_YEARLY}
            onChange={(v) => onChange({ maintenanceYearly: v })}
            nodes={[
              { value: 5000, label: '5K' },
              { value: 7000, label: '7K' },
              { value: 10000, label: '10K' },
              { value: 13000, label: '13K' },
            ]}
            format={formatCurrency}
            compact
          />

          <SliderInput
            label="ביטוחים + רישיון (לשנה)"
            min={4000}
            max={15000}
            step={500}
            value={(inputs.insuranceYearly as number) ?? DEFAULT_INSURANCE_YEARLY}
            onChange={(v) => onChange({ insuranceYearly: v })}
            nodes={[
              { value: 7000, label: '7K' },
              { value: 9000, label: '9K' },
              { value: 11000, label: '11K' },
              { value: 13000, label: '13K' },
            ]}
            format={formatCurrency}
            compact
          />
        </>
      )}
    </div>
  )
}
