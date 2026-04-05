'use client'

import { InputGroup, YesNoToggle } from './InputGroup'
import {
  PURCHASE_EQUITY_PRESETS,
  PURCHASE_RATE_PRESETS,
  FINANCIAL_DOWN_PRESETS,
  FINANCIAL_RESIDUAL_PRESETS,
  FINANCIAL_RATE_PRESETS,
  OPERATIONAL_DOWN_PRESETS,
  PERIOD_PRESETS,
  FUEL_PRESETS,
  MAINTENANCE_PRESETS,
  INSURANCE_PRESETS,
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
  purchase: 'רכישה יד 2',
  financialLeasing: 'ליסינג מימוני',
  operationalLeasing: 'ליסינג תפעולי',
}

function formatCurrency(n: number): string {
  return n.toLocaleString('he-IL')
}

function formatRate(primeRate: number, spread: number): string {
  const total = primeRate + spread
  return `${total.toFixed(1)}%`
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
      <p className="text-body text-text-muted text-center mb-space-7">
        התאם את הפרמטרים — ברירות המחדל מבוססות על נתוני שוק
      </p>

      {/* Option-specific fields */}
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

      {/* Next */}
      <div className="mt-space-7 text-center">
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

  return (
    <>
      {/* Section: Financial Terms */}
      <div className="bg-surface rounded-xl p-space-4 mb-space-5">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי מימון</h3>

        <InputGroup
          label="הון עצמי"
          presets={PURCHASE_EQUITY_PRESETS.map((p) => ({
            value: p.value,
            label: p.label,
            sublabel: `${formatCurrency(Math.round(carPrice * (p.value / 100)))} ₪`,
          }))}
          value={equity}
          onChange={(v) => onChange({ equityPercent: v })}
          allowManual
          manualPlaceholder="אחוז"
          suffix="%"
          computedDisplay={equity < 100 ? `סכום הלוואה: ${formatCurrency(loanAmount)} ₪` : undefined}
          compact
        />

        {equity < 100 && (
          <>
            <InputGroup
              label="ריבית"
              subtitle={`פריים נוכחי: ${primeRate}%`}
              presets={PURCHASE_RATE_PRESETS.map((p) => ({
                value: p.value,
                label: p.label,
                sublabel: formatRate(primeRate, p.value),
              }))}
              value={spread}
              onChange={(v) => onChange({ interestSpread: v })}
              allowManual={false}
              columns={4}
              compact
            />

            <InputGroup
              label="תקופת הלוואה"
              presets={PERIOD_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              value={inputs.periodMonths ?? 60}
              onChange={(v) => onChange({ periodMonths: v })}
              allowManual
              manualPlaceholder="חודשים"
              suffix="חודשים"
              columns={4}
              compact
            />
          </>
        )}
      </div>

      {/* Section: Running Costs */}
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

  return (
    <>
      <div className="bg-surface rounded-xl p-space-4 mb-space-5">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי ליסינג מימוני</h3>

        <InputGroup
          label="מקדמה"
          presets={FINANCIAL_DOWN_PRESETS.map((p) => ({
            value: p.value,
            label: p.label,
            sublabel: `${formatCurrency(Math.round(carPrice * (p.value / 100)))} ₪`,
          }))}
          value={downPct}
          onChange={(v) => onChange({ downPaymentPercent: v })}
          allowManual
          manualPlaceholder="אחוז"
          suffix="%"
          compact
        />

        <InputGroup
          label="יתרה בסוף תקופה (בלון)"
          presets={FINANCIAL_RESIDUAL_PRESETS.map((p) => ({
            value: p.value,
            label: p.label,
            sublabel: `${formatCurrency(Math.round(carPrice * (p.value / 100)))} ₪`,
          }))}
          value={residualPct}
          onChange={(v) => onChange({ residualPercent: v })}
          allowManual
          manualPlaceholder="אחוז"
          suffix="%"
          computedDisplay={`סכום הלוואה: ${formatCurrency(loanAmount)} ₪`}
          compact
        />

        <YesNoToggle
          label="בוצע טרייד אין?"
          value={inputs.tradeIn ?? false}
          onChange={(v) => onChange({ tradeIn: v })}
        />

        {inputs.tradeIn && (
          <InputGroup
            label="סכום שהתקבל בגין הרכב הישן"
            presets={[]}
            value={inputs.tradeInAmount ?? null}
            onChange={(v) => onChange({ tradeInAmount: v })}
            manualPlaceholder="הזן סכום"
            compact
          />
        )}

        <InputGroup
          label="ריבית"
          subtitle={`פריים נוכחי: ${primeRate}%`}
          presets={FINANCIAL_RATE_PRESETS.map((p) => ({
            value: p.value,
            label: p.label,
            sublabel: formatRate(primeRate, p.value),
          }))}
          value={spread}
          onChange={(v) => onChange({ interestSpread: v })}
          allowManual={false}
          columns={3}
          compact
        />

        <InputGroup
          label="תקופה"
          presets={PERIOD_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          value={inputs.periodMonths ?? 60}
          onChange={(v) => onChange({ periodMonths: v })}
          allowManual
          manualPlaceholder="חודשים"
          suffix="חודשים"
          columns={4}
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
      <div className="bg-surface rounded-xl p-space-4 mb-space-5">
        <h3 className="text-body font-bold text-primary mb-space-3">תנאי ליסינג תפעולי</h3>

        <InputGroup
          label="מקדמה"
          presets={OPERATIONAL_DOWN_PRESETS.map((p) => ({
            value: p.value,
            label: p.label,
            sublabel: `${formatCurrency(Math.round(carPrice * (p.value / 100)))} ₪`,
          }))}
          value={inputs.downPaymentPercent ?? 5}
          onChange={(v) => onChange({ downPaymentPercent: v })}
          allowManual
          manualPlaceholder="אחוז"
          suffix="%"
          compact
        />

        <InputGroup
          label="תשלום ליסינג חודשי"
          subtitle="כולל מע״מ — הסכומים מותאמים לטווח המחיר של הרכב"
          presets={bracket.options.map((o) => ({
            value: o,
            label: `${formatCurrency(o)} ₪`,
          }))}
          value={inputs.monthlyLeasingPayment ?? bracket.defaultRate}
          onChange={(v) => onChange({ monthlyLeasingPayment: v })}
          manualPlaceholder="הזן סכום"
          columns={4}
          compact
        />
      </div>

      {/* Fuel only — maintenance + insurance included in leasing */}
      <div className="bg-surface rounded-xl p-space-4 mb-space-5">
        <h3 className="text-body font-bold text-primary mb-space-3">דלק</h3>
        <p className="text-caption text-text-muted mb-space-3">
          אחזקה וביטוח כלולים בליסינג תפעולי
        </p>

        {isElectric ? (
          <InputGroup
            label='כמה אתה נוסע ק"מ בממוצע בחודש?'
            presets={ELECTRIC_KM_PRESETS.map((e) => ({
              value: e.km,
              label: e.label,
            }))}
            value={inputs.kmPerMonth ?? 1500}
            onChange={(km) => {
              const match = ELECTRIC_KM_PRESETS.find((e) => e.km === km)
              onChange({
                kmPerMonth: km,
                fuelMonthly: match ? match.cost : Math.round(km * 0.13),
              })
            }}
            manualPlaceholder='ק"מ'
            suffix='ק"מ'
            compact
          />
        ) : (
          <InputGroup
            label="דלק (לחודש)"
            subtitle="כולל מע״מ"
            presets={FUEL_PRESETS.map((f) => ({
              value: f,
              label: `${formatCurrency(f)} ₪`,
            }))}
            value={inputs.fuelMonthly ?? DEFAULT_FUEL_MONTHLY}
            onChange={(v) => onChange({ fuelMonthly: v })}
            manualPlaceholder="הזן סכום"
            columns={3}
            compact
          />
        )}
      </div>

      <p className="text-caption text-text-muted text-center">
        * במידה ומעל 20,000 ק&quot;מ בשנה, לרוב יש תוספת של כ-0.2-0.3 ₪ לכל ק&quot;מ נסיעה עודף.
      </p>
    </>
  )
}

/* ═══════════════════════════════════════════════
   Running Costs — Shared Section
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
    <div className="bg-surface rounded-xl p-space-4 mb-space-5">
      <h3 className="text-body font-bold text-primary mb-space-3">הוצאות שוטפות</h3>

      {isElectric ? (
        <InputGroup
          label='כמה אתה נוסע ק"מ בממוצע בחודש?'
          presets={ELECTRIC_KM_PRESETS.map((e) => ({
            value: e.km,
            label: e.label,
          }))}
          value={(inputs.kmPerMonth as number) ?? 1500}
          onChange={(km) => {
            const match = ELECTRIC_KM_PRESETS.find((e) => e.km === km)
            onChange({
              kmPerMonth: km,
              fuelMonthly: match ? match.cost : Math.round(km * 0.13),
            })
          }}
          manualPlaceholder='ק"מ'
          suffix='ק"מ'
          compact
        />
      ) : (
        <InputGroup
          label="דלק (לחודש)"
          subtitle="כולל מע״מ"
          presets={FUEL_PRESETS.map((f) => ({
            value: f,
            label: `${formatCurrency(f)} ₪`,
          }))}
          value={(inputs.fuelMonthly as number) ?? DEFAULT_FUEL_MONTHLY}
          onChange={(v) => onChange({ fuelMonthly: v })}
          manualPlaceholder="הזן סכום"
          columns={3}
          compact
        />
      )}

      {showAll && (
        <>
          <InputGroup
            label="אחזקת רכב (לשנה)"
            presets={MAINTENANCE_PRESETS.map((m) => ({
              value: m,
              label: `${formatCurrency(m)} ₪`,
            }))}
            value={(inputs.maintenanceYearly as number) ?? DEFAULT_MAINTENANCE_YEARLY}
            onChange={(v) => onChange({ maintenanceYearly: v })}
            manualPlaceholder="הזן סכום"
            columns={3}
            compact
          />

          <InputGroup
            label="ביטוחים כולל רישיון רכב (לשנה)"
            presets={INSURANCE_PRESETS.map((i) => ({
              value: i,
              label: `${formatCurrency(i)} ₪`,
            }))}
            value={(inputs.insuranceYearly as number) ?? DEFAULT_INSURANCE_YEARLY}
            onChange={(v) => onChange({ insuranceYearly: v })}
            manualPlaceholder="הזן סכום"
            columns={3}
            compact
          />
        </>
      )}
    </div>
  )
}
