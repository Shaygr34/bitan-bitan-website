'use client'

import { useState, useCallback, useEffect } from 'react'
import { StepBase } from './StepBase'
import { StepPickOption } from './StepPickOption'
import { StepDetails } from './StepDetails'
import { ResultsView } from './ResultsView'
import { calculateOption, getDefaultPurchaseInputs, getDefaultFinancialInputs } from './engine'
import { DEFAULT_CONFIG, getOperationalRateBracket } from './config'
import type {
  CalculatorConfig,
  WizardPhase,
  BaseInputs,
  OptionType,
  CalculationResult,
  PurchaseInputs,
  FinancialLeasingInputs,
  OperationalLeasingInputs,
} from './types'

type LeasingCalculatorProps = {
  config?: Partial<CalculatorConfig>
}

const PHASE_LABELS: Record<WizardPhase, string> = {
  base: 'פרטים בסיסיים',
  pickOption: 'בחירת אפשרות',
  details: 'פרטי האפשרות',
  results: 'תוצאות',
}

const PHASE_ORDER: WizardPhase[] = ['base', 'pickOption', 'details', 'results']

// ── URL param helpers for shareable links ──
const NUM_OPTION_FIELDS = ['equityPercent', 'interestSpread', 'periodMonths', 'fuelMonthly', 'maintenanceYearly', 'insuranceYearly', 'downPaymentPercent', 'residualPercent', 'tradeInAmount', 'monthlyLeasingPayment', 'kmPerMonth']

function encodeLeasingParams(
  b: Partial<BaseInputs>,
  opt: OptionType,
  inp: Record<string, unknown>,
  cmp?: { option: OptionType; inputs: Record<string, unknown> } | null,
): string {
  const p = new URLSearchParams()
  if (b.userType) p.set('ut', b.userType)
  if (b.vehicleType) p.set('vt', b.vehicleType)
  if (b.carPrice) p.set('cp', String(b.carPrice))
  if (b.monthlyIncome) p.set('mi', String(b.monthlyIncome))
  if (b.manufacturerPrice) p.set('mfp', String(b.manufacturerPrice))
  p.set('opt', opt)
  // Encode primary option-specific inputs
  for (const [k, v] of Object.entries(inp)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  }
  // Encode comparison scenario (b_ prefix to namespace)
  if (cmp && cmp.option) {
    p.set('opt2', cmp.option)
    for (const [k, v] of Object.entries(cmp.inputs)) {
      if (v !== undefined && v !== null && v !== '') p.set(`b_${k}`, String(v))
    }
  }
  return p.toString()
}

function decodeLeasingParams(search: string): {
  base: Partial<BaseInputs>
  option: OptionType
  inputs: Record<string, unknown>
  comparison: { option: OptionType; inputs: Record<string, unknown> } | null
} | null {
  const p = new URLSearchParams(search)
  if (!p.has('opt')) return null
  const base: Partial<BaseInputs> = {
    userType: (p.get('ut') as BaseInputs['userType']) || 'selfEmployed',
    vehicleType: (p.get('vt') as BaseInputs['vehicleType']) || 'privatePetrol',
    carPrice: Number(p.get('cp')) || 150000,
    monthlyIncome: Number(p.get('mi')) || 20000,
  }
  if (p.has('mfp')) base.manufacturerPrice = Number(p.get('mfp'))
  const option = p.get('opt') as OptionType
  const inputs: Record<string, unknown> = {}
  for (const k of NUM_OPTION_FIELDS) {
    if (p.has(k)) inputs[k] = Number(p.get(k))
  }
  if (p.has('tradeIn')) inputs.tradeIn = p.get('tradeIn') === 'true'
  // Decode comparison scenario if present
  let comparison: { option: OptionType; inputs: Record<string, unknown> } | null = null
  if (p.has('opt2')) {
    const cmpInputs: Record<string, unknown> = {}
    for (const k of NUM_OPTION_FIELDS) {
      if (p.has(`b_${k}`)) cmpInputs[k] = Number(p.get(`b_${k}`))
    }
    if (p.has('b_tradeIn')) cmpInputs.tradeIn = p.get('b_tradeIn') === 'true'
    comparison = { option: p.get('opt2') as OptionType, inputs: cmpInputs }
  }
  return { base, option, inputs, comparison }
}

export function LeasingCalculator({ config: configOverride }: LeasingCalculatorProps) {
  const config: CalculatorConfig = {
    ...DEFAULT_CONFIG,
    ...configOverride,
  }

  const [phase, setPhase] = useState<WizardPhase>('base')
  const [base, setBase] = useState<Partial<BaseInputs>>({
    userType: 'selfEmployed',
    vehicleType: 'privatePetrol',
    carPrice: 150000,
    monthlyIncome: 20000,
  })
  const [primaryOption, setPrimaryOption] = useState<OptionType | null>(null)
  const [primaryInputs, setPrimaryInputs] = useState<Record<string, unknown>>({})
  const [primaryResult, setPrimaryResult] = useState<CalculationResult | null>(null)
  const [comparisonOption, setComparisonOption] = useState<OptionType | null>(null)
  const [comparisonInputs, setComparisonInputs] = useState<Record<string, unknown>>({})
  const [comparisonResult, setComparisonResult] = useState<CalculationResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const phaseIndex = PHASE_ORDER.indexOf(phase)
  const progressPercent = phase === 'results' ? 100 : ((phaseIndex + 1) / PHASE_ORDER.length) * 100

  // Auto-restore from URL params on mount
  useEffect(() => {
    const restored = decodeLeasingParams(window.location.search)
    if (restored) {
      setBase(restored.base)
      setPrimaryOption(restored.option)
      setPrimaryInputs(restored.inputs)
      const result = calculateOption(
        restored.option,
        restored.base as BaseInputs,
        restored.inputs as PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs,
        config
      )
      setPrimaryResult(result)
      // Restore comparison scenario if present
      if (restored.comparison) {
        setComparisonOption(restored.comparison.option)
        setComparisonInputs(restored.comparison.inputs)
        const cmpResult = calculateOption(
          restored.comparison.option,
          restored.base as BaseInputs,
          restored.comparison.inputs as PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs,
          config
        )
        setComparisonResult(cmpResult)
      }
      setPhase('results')
    }
  }, []) // eslint-disable-line

  // F9: scroll to top on phase change (mobile fix)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  // ─── Handlers ───

  const handleBaseChange = useCallback((updates: Partial<BaseInputs>) => {
    setBase((prev) => {
      const next = { ...prev, ...updates }
      // Auto-initialize manufacturerPrice when switching to company/employee
      if (updates.userType && (updates.userType === 'company' || updates.userType === 'employee') && !next.manufacturerPrice) {
        next.manufacturerPrice = next.carPrice || 200000
      }
      return next
    })
  }, [])

  const handleBaseNext = useCallback(() => {
    setPhase('pickOption')
  }, [])

  const handlePickOption = useCallback((option: OptionType) => {
    const isElectric = base.vehicleType?.includes('Electric') ?? false
    if (isComparing) {
      setComparisonOption(option)
      // Pre-fill defaults for comparison option
      setComparisonInputs(getDefaultInputsForOption(option, base.carPrice || 200000, isElectric))
    } else {
      setPrimaryOption(option)
      // Pre-fill defaults
      setPrimaryInputs(getDefaultInputsForOption(option, base.carPrice || 200000, isElectric))
    }
    setPhase('details')
  }, [isComparing, base.carPrice, base.vehicleType])

  const handleDetailsChange = useCallback((updates: Record<string, unknown>) => {
    if (isComparing) {
      setComparisonInputs((prev) => ({ ...prev, ...updates }))
    } else {
      setPrimaryInputs((prev) => ({ ...prev, ...updates }))
    }
  }, [isComparing])

  const handleDetailsNext = useCallback(() => {
    const fullBase = base as BaseInputs

    if (isComparing && comparisonOption) {
      const result = calculateOption(
        comparisonOption,
        fullBase,
        comparisonInputs as PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs,
        config
      )
      setComparisonResult(result)
      setIsComparing(false)
    } else if (primaryOption) {
      const result = calculateOption(
        primaryOption,
        fullBase,
        primaryInputs as PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs,
        config
      )
      setPrimaryResult(result)
    }
    setPhase('results')
  }, [base, isComparing, primaryOption, primaryInputs, comparisonOption, comparisonInputs, config])

  const handleCompare = useCallback(() => {
    setIsComparing(true)
    setComparisonResult(null)
    setComparisonInputs({})
    setComparisonOption(null)
    setPhase('base')
  }, [])

  const handleRestart = useCallback(() => {
    setPhase('base')
    setBase({ userType: 'selfEmployed', vehicleType: 'privatePetrol', carPrice: 150000, monthlyIncome: 20000 })
    setPrimaryOption(null)
    setPrimaryInputs({})
    setPrimaryResult(null)
    setComparisonOption(null)
    setComparisonInputs({})
    setComparisonResult(null)
    setIsComparing(false)
  }, [])

  const handleBack = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (idx > 0) {
      if (isComparing && phase === 'details') {
        setPhase('pickOption')
      } else if (phase === 'results') {
        // When going back from results after comparison, re-enter comparison mode
        // so the details show the comparison option (the last one edited)
        if (comparisonResult && comparisonOption) {
          setIsComparing(true)
        }
        setPhase('details')
      } else {
        setPhase(PHASE_ORDER[idx - 1])
      }
    }
  }, [phase, isComparing, comparisonResult, comparisonOption])

  // ─── Render ───

  const currentOption = isComparing ? comparisonOption : primaryOption
  const currentInputs = isComparing ? comparisonInputs : primaryInputs

  return (
    <div>
      {/* Progress steps */}
      {phase !== 'results' && (
        <div className="mb-space-7">
          <div className="flex items-center justify-center gap-2 mb-space-2">
            {PHASE_ORDER.filter(p => p !== 'results').map((p, i) => {
              const isCompleted = PHASE_ORDER.indexOf(p) < phaseIndex
              const isCurrent = p === phase
              return (
                <div key={p} className="flex items-center gap-2">
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold transition-all',
                    isCompleted ? 'bg-gold text-white' :
                    isCurrent ? 'bg-gold/20 text-gold border-2 border-gold' :
                    'bg-border text-text-muted',
                  ].join(' ')}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={['w-8 h-0.5 transition-all', isCompleted ? 'bg-gold' : 'bg-border'].join(' ')} />}
                </div>
              )
            })}
          </div>
          <p className="text-caption text-text-muted text-center">
            {PHASE_LABELS[phase]}
          </p>
        </div>
      )}

      {/* Back button — on all steps except base */}
      {phase !== 'base' && (
        <div className="mb-space-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-gold hover:text-gold-hover text-body-sm font-medium transition-colors cursor-pointer"
          >
            &#8592; חזרה לשלב הקודם
          </button>
        </div>
      )}

      {/* Phase content with animation */}
      <div
        key={`${phase}-${isComparing}`}
        style={{ animation: 'fadeIn 300ms ease-out' }}
      >
        {phase === 'base' && (
          <StepBase
            values={base}
            onChange={handleBaseChange}
            onNext={handleBaseNext}
          />
        )}

        {phase === 'pickOption' && (
          <StepPickOption
            onSelect={handlePickOption}
            excludeOption={null}
          />
        )}

        {phase === 'details' && currentOption && (
          <StepDetails
            optionType={currentOption}
            vehicleType={base.vehicleType || 'privatePetrol'}
            carPrice={base.carPrice || 200000}
            primeRate={config.primeRate}
            inputs={currentInputs}
            onChange={handleDetailsChange}
            onNext={handleDetailsNext}
          />
        )}

        {phase === 'results' && primaryResult && primaryOption && (
          <ResultsView
            primary={primaryResult}
            comparison={comparisonResult}
            onCompare={handleCompare}
            onRestart={handleRestart}
            shareUrl={`${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?${encodeLeasingParams(base, primaryOption, primaryInputs, comparisonResult && comparisonOption ? { option: comparisonOption, inputs: comparisonInputs } : null)}`}
          />
        )}
      </div>

      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ─── Helper: Default inputs per option ─── */

function getDefaultInputsForOption(
  option: OptionType,
  carPrice: number,
  isElectric: boolean,
): Record<string, unknown> {
  // For electric vehicles, fuelMonthly represents electricity cost — typical 1,500 km ≈ 200 ₪.
  // For petrol, the legacy default of 1,500 ₪/month stands.
  const defaultFuel = isElectric ? 200 : 1500
  switch (option) {
    case 'purchase':
      return { ...getDefaultPurchaseInputs(), fuelMonthly: defaultFuel }
    case 'financialLeasing':
      return { ...getDefaultFinancialInputs(carPrice), fuelMonthly: defaultFuel }
    case 'operationalLeasing': {
      const bracket = getOperationalRateBracket(carPrice)
      return {
        downPaymentPercent: 5,
        monthlyLeasingPayment: bracket.defaultRate,
        fuelMonthly: defaultFuel,
        kmPerMonth: 1500,
      }
    }
  }
}
