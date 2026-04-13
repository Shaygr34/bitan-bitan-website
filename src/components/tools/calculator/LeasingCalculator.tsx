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

  // F9: scroll to top on phase change (mobile fix)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  // ─── Handlers ───

  const handleBaseChange = useCallback((updates: Partial<BaseInputs>) => {
    setBase((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleBaseNext = useCallback(() => {
    setPhase('pickOption')
  }, [])

  const handlePickOption = useCallback((option: OptionType) => {
    if (isComparing) {
      setComparisonOption(option)
      // Pre-fill defaults for comparison option
      setComparisonInputs(getDefaultInputsForOption(option, base.carPrice || 200000))
    } else {
      setPrimaryOption(option)
      // Pre-fill defaults
      setPrimaryInputs(getDefaultInputsForOption(option, base.carPrice || 200000))
    }
    setPhase('details')
  }, [isComparing, base.carPrice])

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
      // If we're comparing and going back from details, go to pickOption
      if (isComparing && phase === 'details') {
        setPhase('pickOption')
      } else if (phase === 'results') {
        setPhase('details')
      } else {
        setPhase(PHASE_ORDER[idx - 1])
      }
    }
  }, [phase, isComparing])

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
            excludeOption={isComparing ? primaryOption : null}
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

        {phase === 'results' && primaryResult && (
          <ResultsView
            primary={primaryResult}
            comparison={comparisonResult}
            onCompare={handleCompare}
            onRestart={handleRestart}
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

function getDefaultInputsForOption(option: OptionType, carPrice: number): Record<string, unknown> {
  switch (option) {
    case 'purchase':
      return { ...getDefaultPurchaseInputs() }
    case 'financialLeasing':
      return { ...getDefaultFinancialInputs() }
    case 'operationalLeasing': {
      const bracket = getOperationalRateBracket(carPrice)
      return {
        downPaymentPercent: 5,
        monthlyLeasingPayment: bracket.defaultRate,
        fuelMonthly: 1500,
        kmPerMonth: 1500,
      }
    }
  }
}
