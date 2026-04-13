'use client'

import { useState, useCallback, useEffect } from 'react'
import { SliderInput } from '../calculator/SliderInput'
import { ToggleGroup, YesNoToggle } from '../calculator/InputGroup'
import { calculateEmployerCost, getDefaultEmployerInputs } from './engine'
import { DEFAULT_EMPLOYER_CONFIG, SALARY_PRESETS, PENSION_EMPLOYEE_RATES, PENSION_EMPLOYER_RATES, SEVERANCE_RATES, EDUCATION_EMPLOYER_RATES, VEHICLE_FUEL_OPTIONS, getServiceThresholds } from './config'
import { EmployerResults } from './EmployerResults'
import type { EmployerInputs, EmployerCalcResult, VehicleFuelType, Gender, MaritalStatus } from './types'

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

export function EmployerCalculator() {
  const [phase, setPhase] = useState<Phase>('salary')
  const [inputs, setInputs] = useState<EmployerInputs>(getDefaultEmployerInputs())
  const [result, setResult] = useState<EmployerCalcResult | null>(null)
  const [comparisonResult, setComparisonResult] = useState<EmployerCalcResult | null>(null)
  const [comparisonInputs, setComparisonInputs] = useState<EmployerInputs | null>(null)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [primaryResult, setPrimaryResult] = useState<EmployerCalcResult | null>(null)
  const [primaryInputs, setPrimaryInputs] = useState<EmployerInputs | null>(null)

  const phaseIndex = PHASE_ORDER.indexOf(phase)

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
    if (idx < PHASE_ORDER.length - 2) {
      setPhase(PHASE_ORDER[idx + 1])
    } else if (phase === 'personal') {
      // Validate: filter out unfilled children ages (-1 sentinel)
      const cleanedInputs = {
        ...inputs,
        childrenAges: inputs.childrenAges.map(a => a < 0 ? 0 : a),
      }
      const res = calculateEmployerCost(cleanedInputs, DEFAULT_EMPLOYER_CONFIG)
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
    if (idx > 0) setPhase(PHASE_ORDER[idx - 1])
  }, [phase])

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
      setResult(calculateEmployerCost(cleanedInputs, DEFAULT_EMPLOYER_CONFIG))
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
          <button type="button" onClick={back} className="text-gold hover:text-gold-hover text-body font-medium transition-colors cursor-pointer px-2 py-1">
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
              min={5000} max={60000} step={500}
              value={inputs.grossSalary}
              onChange={v => update({ grossSalary: v, pensionSalary: v, educationFundSalary: Math.min(v, DEFAULT_EMPLOYER_CONFIG.educationFundCap) })}
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
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">פנסיה / ביטוח מנהלים וקרן השתלמות</h2>
            <p className="text-body text-text-muted text-center mb-space-6">אחוזי הפרשה — ברירת מחדל לפי חוק</p>

            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
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

            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
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
                        className="w-full rounded-lg border border-border px-2 py-1.5 text-body-sm text-center focus:border-gold focus:outline-none placeholder:text-text-muted/50"
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
                        className="w-20 rounded-lg border border-border px-2 py-1.5 text-body-sm text-center focus:border-gold focus:outline-none"
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
                <ToggleGroup
                  label="היקף שירות"
                  options={[
                    { value: 'full', label: `שירות מלא (${serviceThresholds.full})` },
                    { value: 'partial', label: `שירות חלקי (${serviceThresholds.partial})` },
                  ]}
                  value={inputs.serviceLevel}
                  onChange={v => update({ serviceLevel: v as 'full' | 'partial' })}
                />
              )}
            </div>

            <div className="mt-space-7 text-center">
              <button type="button" onClick={next}
                className="rounded-xl px-10 py-3.5 text-body-lg font-bold bg-gold text-white hover:bg-gold-hover cursor-pointer shadow-lg transition-all animate-pulse">
                {isCompareMode ? '✓ חשב תרחיש להשוואה' : '✓ חשב עלות מעסיק'}
              </button>
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
