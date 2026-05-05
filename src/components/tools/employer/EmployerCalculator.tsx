'use client'

import { useState, useCallback, useEffect } from 'react'
import { SliderInput } from '../calculator/SliderInput'
import { ToggleGroup, YesNoToggle } from '../calculator/InputGroup'
import { calculateEmployerCost, getDefaultEmployerInputs } from './engine'
import { DEFAULT_EMPLOYER_CONFIG, SALARY_PRESETS, PENSION_EMPLOYEE_RATES, PENSION_EMPLOYER_RATES, SEVERANCE_RATES, EDUCATION_EMPLOYER_RATES, VEHICLE_FUEL_OPTIONS, getServiceThresholds } from './config'
import { EmployerResults } from './EmployerResults'
import type { EmployerInputs, EmployerCalcResult, EmployerCalcConfig, VehicleFuelType, Gender, MaritalStatus } from './types'
import { type NIICategory, NII_CATEGORY_LABELS } from '@/lib/tax-tables-2026'
import { YISHUV_MUTAV_LIST } from './yishuv-mutav'

type EmployerCalculatorProps = {
  config?: Partial<EmployerCalcConfig>
}

type Phase = 'salary' | 'pension' | 'personal' | 'results'

const PHASE_ORDER: Phase[] = ['salary', 'pension', 'personal', 'results']
const PHASE_LABELS: Record<Phase, string> = {
  salary: 'שכר ושווי מס',
  pension: 'פנסיה / ביטוח מנהלים וקרן השתלמות',
  personal: 'נתונים אישיים',
  results: 'תוצאות',
}

function fmt(n: number): string {
  return n.toLocaleString('he-IL')
}

// ── URL param helpers ──
function encodeEmployerParams(inp: EmployerInputs): string {
  const p = new URLSearchParams()
  p.set('gs', String(inp.grossSalary))
  p.set('ta', String(inp.travelAllowance))
  if (inp.hasVehicle) { p.set('v', '1'); p.set('vf', inp.vehicleFuelType); p.set('mp', String(inp.manufacturerPrice)) }
  if (inp.hasMealBenefit) { p.set('ml', String(inp.mealBenefitAmount)) }
  if (inp.hasOtherBenefit) { p.set('ob', String(inp.otherBenefitAmount)) }
  if (!inp.hasPension) p.set('np', '1')
  if (inp.hasPension && inp.pensionSalary !== inp.grossSalary) p.set('ps', String(inp.pensionSalary))
  p.set('pe', String(inp.employeePensionRate))
  p.set('pp', String(inp.employerPensionRate))
  p.set('sv', String(inp.severanceRate))
  if (inp.hasEducationFund) p.set('he', '1')
  if (inp.hasEducationFund) p.set('es', String(inp.educationFundSalary))
  p.set('ee', String(inp.employerEducationRate))
  p.set('g', inp.gender[0]) // m/f
  p.set('ms', inp.maritalStatus)
  if (inp.childrenAges.length > 0) p.set('ca', inp.childrenAges.join(','))
  if (inp.childAllowanceRecipient === 'employee') p.set('cr', 'e')
  if (inp.disabledChildrenCount > 0) p.set('dc', String(inp.disabledChildrenCount))
  if (inp.serviceType !== 'none') {
    p.set('st', inp.serviceType); p.set('sl', inp.serviceLevel)
    if (inp.serviceEndDate) p.set('se', `${inp.serviceEndDate.month}-${inp.serviceEndDate.year}`)
  }
  if (inp.reserveDays > 0) p.set('rd', String(inp.reserveDays))
  if (inp.niiCategory !== 'standard') p.set('nc', inp.niiCategory)
  if (inp.yishuvName) p.set('yn', inp.yishuvName)
  if (inp.degrees && inp.degrees.length > 0) {
    // Compact encoding: type:year[:phdYear][:d] joined by ','
    p.set('dg', inp.degrees.map(d => {
      const parts = [d.type, String(d.year)]
      if (d.type === 'phdDirect' && typeof d.phdYear === 'number') parts.push(String(d.phdYear))
      else if (d.deferred) parts.push('d')
      return parts.join(':')
    }).join(','))
  }
  // evalDate format: "MM-YYYY" (only set when user overrode default)
  const today = new Date()
  if (inp.evaluationDate.month !== today.getMonth() + 1 || inp.evaluationDate.year !== today.getFullYear()) {
    p.set('ed', `${inp.evaluationDate.month}-${inp.evaluationDate.year}`)
  }
  return p.toString()
}

function decodeEmployerParams(search: string, config: EmployerCalcConfig = DEFAULT_EMPLOYER_CONFIG): EmployerInputs | null {
  const p = new URLSearchParams(search)
  if (!p.has('gs')) return null
  const defaults = getDefaultEmployerInputs()
  const gs = Number(p.get('gs')) || defaults.grossSalary
  return {
    ...defaults,
    grossSalary: gs,
    travelAllowance: Number(p.get('ta')) || defaults.travelAllowance,
    hasVehicle: p.get('v') === '1',
    vehicleFuelType: (p.get('vf') as EmployerInputs['vehicleFuelType']) || defaults.vehicleFuelType,
    manufacturerPrice: Number(p.get('mp')) || defaults.manufacturerPrice,
    hasMealBenefit: p.has('ml'),
    mealBenefitAmount: Number(p.get('ml')) || defaults.mealBenefitAmount,
    hasOtherBenefit: p.has('ob'),
    otherBenefitAmount: Number(p.get('ob')) || defaults.otherBenefitAmount,
    hasPension: p.get('np') !== '1',
    pensionSalary: Number(p.get('ps')) || gs,
    employeePensionRate: Number(p.get('pe')) || defaults.employeePensionRate,
    employerPensionRate: Number(p.get('pp')) || defaults.employerPensionRate,
    severanceRate: Number(p.get('sv')) || defaults.severanceRate,
    hasEducationFund: p.get('he') === '1',
    employerEducationRate: Number(p.get('ee')) || defaults.employerEducationRate,
    educationFundSalary: Number(p.get('es')) || Math.min(gs, config.educationFundCap),
    gender: p.get('g') === 'f' ? 'female' : 'male',
    maritalStatus: (p.get('ms') as EmployerInputs['maritalStatus']) || defaults.maritalStatus,
    childrenAges: p.has('ca') ? p.get('ca')!.split(',').map(Number) : [],
    childAllowanceRecipient: p.get('cr') === 'e' ? 'employee' : 'spouse',
    disabledChildrenCount: Number(p.get('dc')) || 0,
    serviceType: (p.get('st') as EmployerInputs['serviceType']) || 'none',
    serviceLevel: (p.get('sl') as EmployerInputs['serviceLevel']) || 'none',
    serviceEndDate: (() => {
      const se = p.get('se')
      if (!se) return null
      const [m, y] = se.split('-').map(Number)
      if (m >= 1 && m <= 12 && y >= 2010 && y <= 2040) return { month: m, year: y }
      return null
    })(),
    reserveDays: Number(p.get('rd')) || 0,
    evaluationDate: (() => {
      const ed = p.get('ed')
      if (ed) {
        const [m, y] = ed.split('-').map(Number)
        if (m >= 1 && m <= 12 && y >= 2024 && y <= 2040) return { month: m, year: y }
      }
      return defaults.evaluationDate
    })(),
    pensionCreditSalary: defaults.pensionCreditSalary,
    niiCategory: (p.get('nc') as NIICategory) || 'standard',
    yishuvName: p.get('yn') || null,
    degrees: (() => {
      const dg = p.get('dg')
      if (!dg) return []
      const validTypes = new Set(['bachelor', 'master', 'phdRegular', 'phdDirect', 'phdMedicine', 'professional'])
      return dg.split(',').map(token => {
        const parts = token.split(':')
        const type = parts[0]
        const year = Number(parts[1])
        if (!validTypes.has(type) || !Number.isFinite(year)) return null
        const d: import('./degree-credits').Degree = { type: type as import('./degree-credits').DegreeType, year }
        if (type === 'phdDirect') {
          const py = Number(parts[2])
          if (Number.isFinite(py)) d.phdYear = py
        } else if (parts[2] === 'd') {
          d.deferred = true
        }
        return d
      }).filter((d): d is import('./degree-credits').Degree => d !== null)
    })(),
  }
}

export function EmployerCalculator({ config: cmsConfig }: EmployerCalculatorProps = {}) {
  // Merge CMS overrides with hardcoded defaults
  const effectiveConfig: EmployerCalcConfig = { ...DEFAULT_EMPLOYER_CONFIG, ...cmsConfig }
  const [phase, setPhase] = useState<Phase>('salary')
  const [inputs, setInputs] = useState<EmployerInputs>(getDefaultEmployerInputs())
  const [result, setResult] = useState<EmployerCalcResult | null>(null)
  const [comparisonResult, setComparisonResult] = useState<EmployerCalcResult | null>(null)
  const [comparisonInputs, setComparisonInputs] = useState<EmployerInputs | null>(null)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [primaryResult, setPrimaryResult] = useState<EmployerCalcResult | null>(null)
  const [primaryInputs, setPrimaryInputs] = useState<EmployerInputs | null>(null)

  const phaseIndex = PHASE_ORDER.indexOf(phase)

  // Auto-calculate from URL params on mount
  useEffect(() => {
    const restored = decodeEmployerParams(window.location.search, effectiveConfig)
    if (restored) {
      setInputs(restored)
      const res = calculateEmployerCost(restored, effectiveConfig)
      setResult(res)
      setPhase('results')
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  const update = useCallback((updates: Partial<EmployerInputs>) => {
    setInputs(prev => {
      const next = { ...prev, ...updates }
      // Gender-aware child allowance default
      if ('gender' in updates) {
        next.childAllowanceRecipient = updates.gender === 'female' ? 'employee' : 'spouse'
      }
      return next
    })
  }, [])

  const next = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    // Ron May 2026: skip pension phase entirely when both toggles are off
    if (phase === 'salary' && !inputs.hasPension && !inputs.hasEducationFund) {
      setPhase('personal')
      return
    }
    if (idx < PHASE_ORDER.length - 2) {
      setPhase(PHASE_ORDER[idx + 1])
    } else if (phase === 'personal') {
      // Validate: filter out unfilled children ages (-1 sentinel)
      const cleanedInputs = {
        ...inputs,
        childrenAges: inputs.childrenAges.map(a => a < 0 ? 0 : a),
      }
      const res = calculateEmployerCost(cleanedInputs, effectiveConfig)
      if (isCompareMode) {
        setComparisonResult(res)
        setComparisonInputs(cleanedInputs)
        setResult(primaryResult)
        setInputs(primaryInputs || cleanedInputs)
        setIsCompareMode(false)
      } else {
        setResult(res)
      }
      setPhase('results')
    }
  }, [phase, inputs, isCompareMode, primaryResult])

  const back = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    // Ron May 2026: skip pension phase entirely when both toggles are off
    if (phase === 'personal' && !inputs.hasPension && !inputs.hasEducationFund) {
      setPhase('salary')
      return
    }
    if (idx > 0) setPhase(PHASE_ORDER[idx - 1])
  }, [phase, inputs.hasPension, inputs.hasEducationFund])

  const restart = useCallback(() => {
    setInputs(getDefaultEmployerInputs())
    setResult(null)
    setComparisonResult(null)
    setComparisonInputs(null)
    setPrimaryResult(null)
    setPrimaryInputs(null)
    setIsCompareMode(false)
    setPhase('salary')
  }, [])

  const handleCompare = useCallback(() => {
    // Save current result as primary, reset wizard for second scenario
    setPrimaryResult(result)
    setPrimaryInputs(inputs)
    setIsCompareMode(true)
    setComparisonResult(null)
    setComparisonInputs(null)
    setPhase('salary')
  }, [result, inputs])

  const handleRemoveComparison = useCallback(() => {
    // Recalculate primary result to ensure inputs and result stay in sync
    if (primaryInputs) {
      const cleanedInputs = {
        ...primaryInputs,
        childrenAges: primaryInputs.childrenAges.map(a => a < 0 ? 0 : a),
      }
      setResult(calculateEmployerCost(cleanedInputs, effectiveConfig))
      setInputs(primaryInputs)
    }
    setComparisonResult(null)
    setComparisonInputs(null)
    setPrimaryResult(null)
    setPrimaryInputs(null)
  }, [primaryInputs])

  // Service thresholds for display
  const serviceThresholds = inputs.serviceType !== 'none'
    ? getServiceThresholds(inputs.gender, inputs.serviceType as 'military' | 'national')
    : null

  return (
    <div>
      {/* Progress */}
      {phase !== 'results' && (
        <div className="mb-space-7">
          {isCompareMode && (
            <div className="text-center mb-space-3">
              <span className="inline-block bg-gold/10 border border-gold text-gold text-body-sm font-bold px-4 py-1.5 rounded-full">
                תרחיש ב׳ — השוואה
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-space-2">
            {PHASE_ORDER.filter(p => p !== 'results').map((p, i) => {
              const isCompleted = PHASE_ORDER.indexOf(p) < phaseIndex
              const isCurrent = p === phase
              return (
                <div key={p} className="flex items-center gap-2">
                  <div className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-body-sm font-bold transition-all',
                    isCompleted ? 'bg-gold text-white' :
                    isCurrent ? 'bg-gold/20 text-gold border-2 border-gold' :
                    'bg-border text-text-muted',
                  ].join(' ')}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={['w-6 h-0.5 transition-all', isCompleted ? 'bg-gold' : 'bg-border'].join(' ')} />}
                </div>
              )
            })}
          </div>
          <p className="text-body-sm text-text-muted text-center">{PHASE_LABELS[phase]}</p>
        </div>
      )}

      {/* Back */}
      {phase !== 'salary' && (
        <div className="mb-space-4">
          <button type="button" onClick={back} className="text-gold-dark hover:text-gold text-body font-medium transition-colors cursor-pointer px-2 py-1">
            ← חזרה לשלב הקודם
          </button>
        </div>
      )}

      <div key={phase} style={{ animation: 'fadeIn 300ms ease-out' }}>
        {/* Phase 1: Salary + שווי מס */}
        {phase === 'salary' && (
          <div>
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">מחשבון שכר עלות מעסיק</h2>
            <p className="text-body text-text-muted text-center mb-space-6">נתוני שכר עובד לחישוב</p>

            <SliderInput
              label="שכר ברוטו חודשי (ללא נסיעות)"
              min={5000} max={100000} step={500}
              value={inputs.grossSalary}
              onChange={v => update({ grossSalary: v, pensionSalary: v, educationFundSalary: Math.min(v, effectiveConfig.educationFundCap) })}
              nodes={SALARY_PRESETS.map(s => ({ value: s, label: `${fmt(s)}` }))}
              format={fmt}
            />

            <SliderInput
              label="נסיעות"
              min={0} max={1500} step={5}
              value={inputs.travelAllowance}
              onChange={v => update({ travelAllowance: v })}
              nodes={[
                { value: 0, label: '0' },
                { value: 315, label: '315' },
                { value: 500, label: '500' },
                { value: 1000, label: '1,000' },
                { value: 1500, label: '1,500' },
              ]}
              format={fmt}
            />

            {/* Pension toggle (Ron May 2026: moved from step 2) */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <YesNoToggle
                label="הפרשה לקרן פנסיה?"
                value={inputs.hasPension}
                onChange={v => update({ hasPension: v, pensionSalary: v ? inputs.grossSalary : 0 })}
              />
              {inputs.hasPension && (
                <SliderInput
                  label="שכר לפנסיה"
                  subtitle="ברירת מחדל: שכר ברוטו"
                  min={0} max={inputs.grossSalary} step={500}
                  value={Math.min(inputs.pensionSalary, inputs.grossSalary)}
                  onChange={v => update({ pensionSalary: v })}
                  nodes={[
                    { value: 0, label: '0' },
                    { value: Math.round(inputs.grossSalary / 2), label: fmt(Math.round(inputs.grossSalary / 2)) },
                    { value: inputs.grossSalary, label: fmt(inputs.grossSalary) },
                  ]}
                  format={fmt}
                />
              )}
            </div>

            {/* Education fund toggle (Ron May 2026: moved from step 2, default NO) */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <YesNoToggle
                label="הפרשה לקרן השתלמות?"
                value={inputs.hasEducationFund}
                onChange={v => update({ hasEducationFund: v, educationFundSalary: v ? Math.min(inputs.grossSalary, effectiveConfig.educationFundCap) : 0 })}
              />
              {inputs.hasEducationFund && (
                <SliderInput
                  label="שכר לקרן השתלמות"
                  subtitle={`תקרה לזיכוי ממס: ${fmt(effectiveConfig.educationFundCap)}`}
                  min={0} max={inputs.grossSalary} step={500}
                  value={Math.min(inputs.educationFundSalary, inputs.grossSalary)}
                  onChange={v => update({ educationFundSalary: v })}
                  nodes={[
                    { value: 0, label: '0' },
                    { value: Math.min(effectiveConfig.educationFundCap, inputs.grossSalary), label: fmt(Math.min(effectiveConfig.educationFundCap, inputs.grossSalary)) },
                    { value: inputs.grossSalary, label: fmt(inputs.grossSalary) },
                  ]}
                  format={fmt}
                />
              )}
            </div>

            {/* Vehicle toggle */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <YesNoToggle
                label="האם לעובד קיים רכב צמוד / שווי רכב?"
                value={inputs.hasVehicle}
                onChange={v => update({ hasVehicle: v })}
              />

              {inputs.hasVehicle && (
                <>
                  <ToggleGroup
                    label="סוג רכב"
                    options={VEHICLE_FUEL_OPTIONS.map(o => ({ value: o.value, label: o.label, sublabel: o.sublabel }))}
                    value={inputs.vehicleFuelType}
                    onChange={v => update({ vehicleFuelType: v as VehicleFuelType })}
                  />

                  {inputs.vehicleFuelType !== 'commercial' && (
                    <SliderInput
                      label="מחיר יצרן רכב"
                      subtitle="לצורך חישוב שווי מס רכב"
                      min={50000} max={600000} step={5000}
                      value={inputs.manufacturerPrice}
                      onChange={v => update({ manufacturerPrice: v })}
                      nodes={[
                        { value: 100000, label: '100K' },
                        { value: 200000, label: '200K' },
                        { value: 400000, label: '400K' },
                      ]}
                      format={fmt}
                    />
                  )}

                  {inputs.vehicleFuelType === 'commercial' && (
                    <p className="text-caption text-text-muted text-center mt-space-2">
                      רכב מסחרי מעל 3.5 טון — אין שווי מס רכב
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Meal benefit toggle */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <YesNoToggle
                label="האם לעובד קיים שווי ארוחות (תן ביס/סיבוס וכדומה)?"
                value={inputs.hasMealBenefit}
                onChange={v => update({ hasMealBenefit: v })}
              />
              {inputs.hasMealBenefit && (
                <SliderInput
                  label="שווי ארוחות חודשי"
                  min={500} max={2000} step={50}
                  value={inputs.mealBenefitAmount}
                  onChange={v => update({ mealBenefitAmount: v })}
                  nodes={[
                    { value: 500, label: '500' },
                    { value: 1000, label: '1,000' },
                    { value: 1500, label: '1,500' },
                    { value: 2000, label: '2,000' },
                  ]}
                  format={fmt}
                />
              )}
            </div>

            {/* Other benefit toggle */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <YesNoToggle
                label="האם העובד מקבל הטבות נוספות (שווי מס נוסף מכל סוג)?"
                value={inputs.hasOtherBenefit}
                onChange={v => update({ hasOtherBenefit: v })}
              />
              {inputs.hasOtherBenefit && (
                <SliderInput
                  label="שווי מס נוסף חודשי"
                  min={500} max={3000} step={50}
                  value={inputs.otherBenefitAmount}
                  onChange={v => update({ otherBenefitAmount: v })}
                  nodes={[
                    { value: 500, label: '500' },
                    { value: 1000, label: '1,000' },
                    { value: 2000, label: '2,000' },
                    { value: 3000, label: '3,000' },
                  ]}
                  format={fmt}
                />
              )}
            </div>

            <NextButton onClick={next} />
          </div>
        )}

        {/* Phase 2: Pension & Benefits */}
        {phase === 'pension' && (
          <div>
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">שיעורי הפרשה</h2>
            <p className="text-body text-text-muted text-center mb-space-6">ברירת מחדל לפי חוק</p>

            {inputs.hasPension && (
              <div className="bg-surface rounded-xl p-space-4 mb-space-5" style={{ animation: 'fadeIn 200ms ease-out' }}>
                <h3 className="text-body font-bold text-primary mb-space-3">פנסיה</h3>

                <div className="grid grid-cols-2 gap-3 mb-space-3">
                  <div>
                    <label className="text-body-sm font-medium text-primary block mb-1">עובד</label>
                    <div className="flex gap-1">
                      {PENSION_EMPLOYEE_RATES.map(r => (
                        <button key={r.value} type="button" onClick={() => update({ employeePensionRate: r.value })}
                          className={['rounded-lg border px-3 py-2 text-body-sm cursor-pointer transition-all flex-1',
                            inputs.employeePensionRate === r.value ? 'border-gold bg-gold/10 font-bold text-primary' : 'border-border text-text-muted'].join(' ')}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-primary block mb-1">מעסיק (כולל א.כ.ע)</label>
                    <div className="flex gap-1">
                      {PENSION_EMPLOYER_RATES.map(r => (
                        <button key={r.value} type="button" onClick={() => update({ employerPensionRate: r.value })}
                          className={['rounded-lg border px-2 py-2 text-body-sm cursor-pointer transition-all flex-1',
                            inputs.employerPensionRate === r.value ? 'border-gold bg-gold/10 font-bold text-primary' : 'border-border text-text-muted'].join(' ')}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-body-sm font-medium text-primary block mb-1">פיצויים</label>
                    <div className="flex gap-1">
                      {SEVERANCE_RATES.map(r => (
                        <button key={r.value} type="button" onClick={() => update({ severanceRate: r.value })}
                          className={['rounded-lg border px-3 py-2 text-body-sm cursor-pointer transition-all flex-1',
                            inputs.severanceRate === r.value ? 'border-gold bg-gold/10 font-bold text-primary' : 'border-border text-text-muted'].join(' ')}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {(inputs.disabilityRate + (inputs.employerPensionRate > 5 ? inputs.employerPensionRate - 5 : 0)) > 2.5 && (
                  <p className="text-caption text-red-600 mt-space-2">אחוז א.כ.ע + תגמולים מעסיק לא יכול לעבור 7.5%</p>
                )}
              </div>
            )}

            {inputs.hasEducationFund && (
              <div className="bg-surface rounded-xl p-space-4 mb-space-5" style={{ animation: 'fadeIn 200ms ease-out' }}>
                <h3 className="text-body font-bold text-primary mb-space-3">קרן השתלמות</h3>
                <div>
                  <label className="text-body-sm font-medium text-primary block mb-1">מעסיק</label>
                  <div className="flex gap-2">
                    {EDUCATION_EMPLOYER_RATES.map(r => (
                      <button key={r.value} type="button" onClick={() => update({ employerEducationRate: r.value })}
                        className={['rounded-lg border px-4 py-2 text-body-sm cursor-pointer transition-all',
                          inputs.employerEducationRate === r.value ? 'border-gold bg-gold/10 font-bold text-primary' : 'border-border text-text-muted'].join(' ')}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-caption text-text-muted mt-1">עובד: 2.5% (קבוע)</p>
                </div>
              </div>
            )}

            <NextButton onClick={next} />
          </div>
        )}

        {/* Phase 3: Personal Details */}
        {phase === 'personal' && (
          <div>
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">נתונים אישיים</h2>
            <p className="text-body text-text-muted text-center mb-space-6">לצורך חישוב נקודות זיכוי ומס הכנסה</p>

            <ToggleGroup
              label="מגדר"
              options={[
                { value: 'male', label: 'זכר' },
                { value: 'female', label: 'נקבה' },
              ]}
              value={inputs.gender}
              onChange={v => update({ gender: v as Gender })}
            />

            <div className="mb-space-5">
              <label className="block text-body font-semibold text-primary mb-space-2">
                סיווג ביטוח לאומי
              </label>
              <select
                value={inputs.niiCategory}
                onChange={e => update({ niiCategory: e.target.value as NIICategory })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-body bg-white focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
              >
                {(Object.keys(NII_CATEGORY_LABELS) as NIICategory[]).map(cat => (
                  <option key={cat} value={cat}>
                    {NII_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <p className="text-caption text-text-muted mt-1">
                לפי טבלאות חוזר מעסיקים 1522 (ינואר 2026). ברירת מחדל: תושב ישראל.
              </p>
            </div>

            <div className="mb-space-5">
              <label className="block text-body font-semibold text-primary mb-space-2">
                יישוב מוטב (זיכוי מס)
              </label>
              <input
                list="yishuv-mutav-list"
                value={inputs.yishuvName ?? ''}
                onChange={e => {
                  const val = e.target.value.trim()
                  // Only commit if exact match in list, else null (prevents typos)
                  const matched = YISHUV_MUTAV_LIST.find(y => y.name === val)
                  update({ yishuvName: matched ? val : (val === '' ? null : val) })
                }}
                placeholder="ללא יישוב מוטב"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-body bg-white focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
              />
              <datalist id="yishuv-mutav-list">
                {YISHUV_MUTAV_LIST.map(y => (
                  <option key={y.name} value={y.name}>
                    {y.ratePct}% (תקרה שנתית {y.annualCap.toLocaleString('he-IL')} ₪)
                  </option>
                ))}
              </datalist>
              <p className="text-caption text-text-muted mt-1">
                הקלד שם יישוב לחיפוש (488 יישובים, לוח 2026). השאר ריק אם אין.
              </p>
            </div>

            {/* Degree credits (תואר אקדמי / מקצוע) — Ron May 2026 */}
            <div className="mb-space-5">
              <label className="block text-body font-semibold text-primary mb-space-2">
                תואר אקדמי / מקצוע (נקודות זיכוי)
              </label>
              {inputs.degrees.length === 0 && (
                <p className="text-caption text-text-muted mb-2">אין תואר/מקצוע. לחץ להוספה.</p>
              )}
              {inputs.degrees.map((deg, i) => (
                <div key={i} className="bg-surface rounded-lg p-space-3 mb-space-2 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                  <select
                    value={deg.type}
                    onChange={e => {
                      const newType = e.target.value as import('./degree-credits').DegreeType
                      const next = [...inputs.degrees]
                      next[i] = { ...deg, type: newType }
                      // phdDirect needs phdYear, others don't
                      if (newType === 'phdDirect' && typeof next[i].phdYear !== 'number') next[i].phdYear = deg.year
                      if (newType !== 'phdDirect') delete next[i].phdYear
                      // deferred only for bachelor / phdRegular
                      if (newType !== 'bachelor' && newType !== 'phdRegular') delete next[i].deferred
                      update({ degrees: next })
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-body bg-white focus:border-gold focus:outline-none"
                  >
                    <option value="bachelor">תואר ראשון (1 נ.ז × 3 שנים)</option>
                    <option value="master">תואר שני (0.5 נ.ז × שנה אחת)</option>
                    <option value="phdRegular">דוקטורט רגיל (0.5 נ.ז × 3 שנים)</option>
                    <option value="phdMedicine">דוקטורט ברפואה (1+0.5 נ.ז × 2 שנים)</option>
                    <option value="phdDirect">מסלול ישיר לדוקטורט</option>
                    <option value="professional">מקצוע (טאבון / שמאי וכד׳ — 1 נ.ז × שנה אחת)</option>
                  </select>
                  <input
                    type="number"
                    min={2000}
                    max={2040}
                    value={deg.year || ''}
                    onChange={e => {
                      const y = Number(e.target.value)
                      const next = [...inputs.degrees]
                      next[i] = { ...deg, year: Number.isFinite(y) ? y : 0 }
                      update({ degrees: next })
                    }}
                    placeholder="שנת סיום"
                    className="rounded-lg border border-border px-3 py-2 text-body bg-white w-28 focus:border-gold focus:outline-none"
                  />
                  {deg.type === 'phdDirect' ? (
                    <input
                      type="number"
                      min={2000}
                      max={2040}
                      value={deg.phdYear ?? ''}
                      onChange={e => {
                        const py = Number(e.target.value)
                        const next = [...inputs.degrees]
                        next[i] = { ...deg, phdYear: Number.isFinite(py) ? py : undefined }
                        update({ degrees: next })
                      }}
                      placeholder="שנת דוק׳"
                      className="rounded-lg border border-border px-3 py-2 text-body bg-white w-28 focus:border-gold focus:outline-none"
                    />
                  ) : (deg.type === 'bachelor' || deg.type === 'phdRegular') ? (
                    <label className="text-caption text-text-muted flex items-center gap-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={!!deg.deferred}
                        onChange={e => {
                          const next = [...inputs.degrees]
                          next[i] = { ...deg, deferred: e.target.checked }
                          update({ degrees: next })
                        }}
                      />
                      דחיית הזיכוי בשנה
                    </label>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => update({ degrees: inputs.degrees.filter((_, j) => j !== i) })}
                    className="text-body-sm text-red-600 hover:text-red-700 px-2 py-1"
                  >
                    הסר
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({
                  degrees: [...inputs.degrees, { type: 'bachelor' as const, year: inputs.evaluationDate.year }],
                })}
                className="text-body-sm text-gold-dark hover:text-gold font-medium px-3 py-1.5 border border-gold/30 rounded-lg"
              >
                + הוסף תואר / מקצוע
              </button>
              <p className="text-caption text-text-muted mt-1">
                נקודות זיכוי לפי הוראות פקיד שומה — חלון זכאות מתחיל בשנה שלאחר סיום הלימודים (ניתן לדחות לשנה).
              </p>
            </div>

            <ToggleGroup
              label="סטטוס משפחתי"
              options={[
                { value: 'married', label: 'נשוי/ה' },
                { value: 'single', label: 'רווק/ה' },
                { value: 'divorced', label: 'גרוש/ה' },
                { value: 'widowed', label: 'אלמן/ה' },
                { value: 'singleParent', label: 'הורה יחיד/ה' },
              ]}
              value={inputs.maritalStatus}
              onChange={v => update({ maritalStatus: v as MaritalStatus })}
            />

            <div className="mb-space-5">
              <label className="block text-body font-semibold text-primary mb-space-2">מספר ילדים</label>
              <SliderInput
                label=""
                min={0} max={10} step={1}
                value={inputs.childrenAges.length}
                onChange={v => {
                  const current = inputs.childrenAges
                  if (v > current.length) {
                    // Fill new children with empty string equivalent (will show as empty)
                    update({
                      childrenAges: [...current, ...Array(v - current.length).fill(-1)],
                      disabledChildrenCount: Math.min(inputs.disabledChildrenCount, v),
                    })
                  } else {
                    update({
                      childrenAges: current.slice(0, v),
                      disabledChildrenCount: Math.min(inputs.disabledChildrenCount, v),
                    })
                  }
                }}
                nodes={[{ value: 0, label: '0' }, { value: 2, label: '2' }, { value: 4, label: '4' }, { value: 6, label: '6' }]}
                format={v => `${v}`}
                suffix=""
                allowManual={false}
                compact
              />
            </div>

            {inputs.childrenAges.length > 0 && (
              <div className="bg-surface rounded-xl p-space-4 mb-space-5">
                <h3 className="text-body-sm font-bold text-primary mb-space-2">גילאי ילדים</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {inputs.childrenAges.map((age, i) => (
                    <div key={i} className="text-center">
                      <label className="text-caption text-text-muted">ילד {i + 1}</label>
                      <input
                        type="number" min={0} max={18}
                        value={age >= 0 ? age : ''}
                        placeholder="גיל"
                        onChange={e => {
                          const newAges = [...inputs.childrenAges]
                          const val = e.target.value
                          if (val === '') {
                            newAges[i] = -1
                          } else {
                            newAges[i] = Math.min(18, Math.max(0, parseInt(val) || 0))
                          }
                          update({ childrenAges: newAges })
                        }}
                        className="w-full rounded-lg border border-border px-2 py-1.5 text-body-sm text-center focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 placeholder:text-text-muted/50"
                      />
                    </div>
                  ))}
                </div>

                {/* מקרא — age guide */}
                <div className="mt-space-3 bg-white/60 rounded-lg p-space-3">
                  <p className="text-caption font-medium text-primary mb-1">מקרא — רישום גיל ילדים:</p>
                  <div className="text-caption text-text-muted space-y-0.5">
                    <p>0 = שנת לידה.</p>
                    <p>1-2 = מלאו לילד שנה — שנתיים.</p>
                    <p>3 = מלאו לילד 3 שנים.</p>
                    <p>4-5 = מלאו לילד 4 — 5 שנים.</p>
                    <p>6-17 = מלאו לילד 6 — 17 שנים.</p>
                    <p>18 = מלאו לילד 18 שנים.</p>
                  </div>
                  <p className="text-caption text-text-muted mt-1 italic">*מנוסח בלשון זכר לצורך הנוחות, מתייחס לזכר/נקבה כאחד.</p>
                </div>

                {/* Compact row: קצבת ילדים + נטול יכולת side by side */}
                <div className="mt-space-3 grid grid-cols-2 gap-3">
                  <div>
                    <ToggleGroup
                      label="מי מקבל קצבת ילדים?"
                      subtitle="בני זוג נשואים — זכר ממלא ׳בן/בת זוג׳"
                      options={[
                        { value: 'spouse', label: 'בן/בת זוג' },
                        { value: 'employee', label: 'העובד/ת' },
                      ]}
                      value={inputs.childAllowanceRecipient}
                      onChange={v => update({ childAllowanceRecipient: v as 'employee' | 'spouse' })}
                    />
                  </div>
                  <div className="bg-white/60 rounded-lg p-space-3">
                    <label className="block text-body-sm font-semibold text-primary mb-space-1">ילדים נטולי יכולת</label>
                    <p className="text-caption text-text-muted mb-space-2">כל ילד = 2 נ.ז שנתיות</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={inputs.childrenAges.length}
                        value={inputs.disabledChildrenCount}
                        onChange={e => {
                          const v = parseInt(e.target.value) || 0
                          update({ disabledChildrenCount: Math.min(Math.max(0, v), inputs.childrenAges.length) })
                        }}
                        className="w-20 rounded-lg border border-border px-2 py-1.5 text-body-sm text-center focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                      />
                      <span className="text-caption text-text-muted">מתוך {inputs.childrenAges.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Military/National Service */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <h3 className="text-body font-bold text-primary mb-space-3">שירות צבאי / לאומי</h3>
              <ToggleGroup
                label="סוג שירות"
                options={[
                  { value: 'none', label: 'ללא שירות' },
                  { value: 'military', label: 'שירות צבאי' },
                  { value: 'national', label: 'שירות לאומי' },
                ]}
                value={inputs.serviceType}
                onChange={v => {
                  const serviceType = v as 'military' | 'national' | 'none'
                  update({
                    serviceType,
                    serviceLevel: serviceType === 'none' ? 'none' : inputs.serviceLevel === 'none' ? 'full' : inputs.serviceLevel,
                  })
                }}
              />

              {inputs.serviceType !== 'none' && serviceThresholds && (
                <>
                  <ToggleGroup
                    label="היקף שירות"
                    options={[
                      { value: 'full', label: `שירות מלא (${serviceThresholds.full})` },
                      { value: 'partial', label: `שירות חלקי (${serviceThresholds.partial})` },
                    ]}
                    value={inputs.serviceLevel}
                    onChange={v => update({ serviceLevel: v as 'full' | 'partial' })}
                  />

                  {/* Service end date — Ron May 2026: drives 36-month eligibility window */}
                  <div className="mt-space-3">
                    <label className="block text-body-sm font-medium text-primary mb-2">
                      חודש/שנה סיום שירות
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={inputs.serviceEndDate?.month ?? new Date().getMonth() + 1}
                        onChange={e => update({
                          serviceEndDate: {
                            month: parseInt(e.target.value, 10),
                            year: inputs.serviceEndDate?.year ?? new Date().getFullYear(),
                          },
                        })}
                        className="rounded-lg border border-border px-3 py-2 text-body-sm focus:border-gold focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>חודש {String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={inputs.serviceEndDate?.year ?? new Date().getFullYear()}
                        onChange={e => update({
                          serviceEndDate: {
                            month: inputs.serviceEndDate?.month ?? new Date().getMonth() + 1,
                            year: parseInt(e.target.value, 10),
                          },
                        })}
                        className="rounded-lg border border-border px-3 py-2 text-body-sm focus:border-gold focus:outline-none"
                      >
                        {Array.from({ length: 30 }, (_, i) => 2010 + i).map(y => (
                          <option key={y} value={y}>שנת {y}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-caption text-text-muted mt-1 italic">
                      הטבת מס ניתנת ל-36 חודשים מהחודש שלאחר סיום השירות.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Reservist days (זיכוי מילואים) — Ron May 2026 */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <h3 className="text-body font-bold text-primary mb-space-3">ימי מילואים בשנת המס הקודמת</h3>
              <ToggleGroup
                label="טווח ימי מילואים"
                options={[
                  { value: '0', label: 'ללא' },
                  { value: '30', label: '30-39 ימים' },
                  { value: '40', label: '40-49 ימים' },
                  { value: '50', label: '50+ ימים' },
                ]}
                value={
                  inputs.reserveDays >= 50 ? '50'
                  : inputs.reserveDays >= 40 ? '40'
                  : inputs.reserveDays >= 30 ? '30'
                  : '0'
                }
                onChange={v => update({ reserveDays: parseInt(v, 10) })}
              />
              {inputs.reserveDays >= 50 && (
                <SliderInput
                  label="מספר ימי מילואים"
                  value={inputs.reserveDays}
                  onChange={v => update({ reserveDays: v })}
                  min={50}
                  max={150}
                  step={5}
                  nodes={[
                    { value: 50, label: '50' },
                    { value: 70, label: '70' },
                    { value: 90, label: '90' },
                    { value: 110, label: '110 (תקרה)' },
                    { value: 130, label: '130' },
                  ]}
                  suffix=" ימים"
                />
              )}
              {inputs.reserveDays > 0 && (
                <div className="text-caption text-secondary mt-space-2">
                  זיכוי מילואים: {(() => {
                    const d = inputs.reserveDays
                    if (d < 30) return 0
                    if (d < 40) return 0.5
                    if (d < 50) return 0.75
                    return Math.min(1.0 + Math.floor((d - 50) / 5) * 0.25, 4.0)
                  })()} נקודות זיכוי
                </div>
              )}
            </div>

            {/* Backstage evaluation date (Ron May 2026) — sets reference month/year for
                service eligibility (36-mo window) and degree credit windows. Hidden by
                default; user can override (e.g. for retroactive simulations). */}
            <details className="mt-space-4 text-caption text-text-muted">
              <summary className="cursor-pointer select-none hover:text-primary">
                ⚙️ הגדרות מתקדמות — תאריך חישוב: {String(inputs.evaluationDate.month).padStart(2, '0')}/{inputs.evaluationDate.year}
              </summary>
              <div className="mt-space-2 bg-surface/40 rounded-lg p-space-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption text-text-muted mb-1">חודש בדיקה</label>
                  <select
                    value={inputs.evaluationDate.month}
                    onChange={e => update({ evaluationDate: { ...inputs.evaluationDate, month: parseInt(e.target.value, 10) } })}
                    className="w-full rounded-lg border border-border px-2 py-1.5 text-body-sm focus:border-gold focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-caption text-text-muted mb-1">שנת בדיקה</label>
                  <select
                    value={inputs.evaluationDate.year}
                    onChange={e => update({ evaluationDate: { ...inputs.evaluationDate, year: parseInt(e.target.value, 10) } })}
                    className="w-full rounded-lg border border-border px-2 py-1.5 text-body-sm focus:border-gold focus:outline-none"
                  >
                    {Array.from({ length: 5 }, (_, i) => 2024 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <p className="col-span-2 text-caption text-text-muted/80 italic">
                  ברירת מחדל — חודש/שנה נוכחיים. רלוונטי לזכאות שירות צבאי (חלון 36 חודשים) ולנקודות זיכוי תואר.
                </p>
              </div>
            </details>

            <div className="mt-space-7 text-center">
              {(() => {
                // Ron May 2026 #16: child ages must be entered when children > 0
                const missingAges = inputs.childrenAges.some(a => a < 0)
                return (
                  <>
                    {missingAges && (
                      <div className="mb-3 inline-block bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        <p className="text-body-sm text-red-700">
                          ⚠ יש להזין גיל לכל ילד לפני חישוב
                        </p>
                      </div>
                    )}
                    <div>
                      <button type="button" onClick={next} disabled={missingAges}
                        className={[
                          'rounded-xl px-10 py-3.5 text-body-lg font-bold shadow-lg transition-all',
                          missingAges
                            ? 'bg-text-muted text-white opacity-60 cursor-not-allowed'
                            : 'bg-gold text-white hover:bg-gold-hover cursor-pointer animate-pulse',
                        ].join(' ')}>
                        {isCompareMode ? '✓ חשב תרחיש להשוואה' : '✓ חשב עלות מעסיק'}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && result && (
          <EmployerResults
            result={result}
            inputs={primaryInputs || inputs}
            onRestart={restart}
            onCompare={handleCompare}
            comparisonResult={comparisonResult}
            comparisonInputs={comparisonInputs}
            onRemoveComparison={handleRemoveComparison}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-space-7 text-center">
      <button type="button" onClick={onClick}
        className="rounded-xl px-8 py-3 text-body font-bold bg-gold text-white hover:bg-gold-hover cursor-pointer shadow-md transition-all">
        המשך ←
      </button>
    </div>
  )
}
