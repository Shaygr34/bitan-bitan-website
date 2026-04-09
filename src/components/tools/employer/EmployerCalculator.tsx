'use client'

import { useState, useCallback, useEffect } from 'react'
import { SliderInput } from '../calculator/SliderInput'
import { ToggleGroup, YesNoToggle } from '../calculator/InputGroup'
import { calculateEmployerCost, getDefaultEmployerInputs } from './engine'
import { DEFAULT_EMPLOYER_CONFIG, SALARY_PRESETS, PENSION_EMPLOYEE_RATES, PENSION_EMPLOYER_RATES, SEVERANCE_RATES, DISABILITY_RATES, EDUCATION_EMPLOYER_RATES, VEHICLE_FUEL_OPTIONS } from './config'
import { EmployerResults } from './EmployerResults'
import type { EmployerInputs, EmployerCalcResult, VehicleFuelType, Gender, MaritalStatus } from './types'

type Phase = 'salary' | 'pension' | 'personal' | 'results'

const PHASE_ORDER: Phase[] = ['salary', 'pension', 'personal', 'results']
const PHASE_LABELS: Record<Phase, string> = {
  salary: 'שכר ורכב',
  pension: 'פנסיה והפרשות',
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

  const phaseIndex = PHASE_ORDER.indexOf(phase)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  const update = useCallback((updates: Partial<EmployerInputs>) => {
    setInputs(prev => ({ ...prev, ...updates }))
  }, [])

  const next = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (idx < PHASE_ORDER.length - 2) {
      setPhase(PHASE_ORDER[idx + 1])
    } else if (phase === 'personal') {
      const res = calculateEmployerCost(inputs, DEFAULT_EMPLOYER_CONFIG)
      setResult(res)
      setPhase('results')
    }
  }, [phase, inputs])

  const back = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (idx > 0) setPhase(PHASE_ORDER[idx - 1])
  }, [phase])

  const restart = useCallback(() => {
    setInputs(getDefaultEmployerInputs())
    setResult(null)
    setPhase('salary')
  }, [])

  return (
    <div>
      {/* Progress */}
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
                  {i < 2 && <div className={['w-6 h-0.5 transition-all', isCompleted ? 'bg-gold' : 'bg-border'].join(' ')} />}
                </div>
              )
            })}
          </div>
          <p className="text-caption text-text-muted text-center">{PHASE_LABELS[phase]}</p>
        </div>
      )}

      {/* Back */}
      {phase !== 'salary' && (
        <div className="mb-space-4">
          <button type="button" onClick={back} className="text-gold hover:text-gold-hover text-body-sm font-medium transition-colors cursor-pointer">
            ← חזרה לשלב הקודם
          </button>
        </div>
      )}

      <div key={phase} style={{ animation: 'fadeIn 300ms ease-out' }}>
        {/* Phase 1: Salary + Vehicle (merged per Avi's feedback) */}
        {phase === 'salary' && (
          <div>
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">נתוני שכר ורכב</h2>
            <p className="text-body text-text-muted text-center mb-space-6">שכר ברוטו של העובד ופרטי רכב צמוד (אם קיים)</p>

            <SliderInput
              label="שכר ברוטו חודשי"
              min={5000} max={60000} step={500}
              value={inputs.grossSalary}
              onChange={v => update({ grossSalary: v, pensionSalary: v, educationFundSalary: Math.min(v, DEFAULT_EMPLOYER_CONFIG.educationFundCap) })}
              nodes={SALARY_PRESETS.map(s => ({ value: s, label: `${fmt(s)}` }))}
              format={fmt}
            />

            {/* Vehicle as part of same step */}
            <div className="bg-surface rounded-xl p-space-4 mb-space-5">
              <h3 className="text-body font-bold text-primary mb-space-3">רכב צמוד</h3>
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
            </div>

            <NextButton onClick={next} />
          </div>
        )}

        {/* Phase 2: Pension & Benefits (was phase 3) */}
        {phase === 'pension' && (
          <div>
            <h2 className="text-h3 font-bold text-primary text-center mb-space-2">פנסיה והפרשות</h2>
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
                <div>
                  <label className="text-body-sm font-medium text-primary block mb-1">אובדן כושר עבודה</label>
                  <div className="flex gap-1">
                    {DISABILITY_RATES.map(r => (
                      <button key={r.value} type="button" onClick={() => update({ disabilityRate: r.value })}
                        className={['rounded-lg border px-2 py-2 text-body-sm cursor-pointer transition-all flex-1',
                          inputs.disabilityRate === r.value ? 'border-gold bg-gold/10 font-bold text-primary' : 'border-border text-text-muted'].join(' ')}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(inputs.disabilityRate + (inputs.employerPensionRate > 5 ? inputs.employerPensionRate - 5 : 0)) > 2.5 && (
                <p className="text-caption text-red-600 mt-space-2">⚠️ אחוז א.כ.ע + תגמולים מעסיק לא יכול לעבור 7.5%</p>
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

        {/* Phase 4: Personal Details */}
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
                    update({ childrenAges: [...current, ...Array(v - current.length).fill(0)] })
                  } else {
                    update({ childrenAges: current.slice(0, v) })
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
                        type="number" min={0} max={17}
                        value={age}
                        onChange={e => {
                          const newAges = [...inputs.childrenAges]
                          newAges[i] = Math.min(17, Math.max(0, parseInt(e.target.value) || 0))
                          update({ childrenAges: newAges })
                        }}
                        className="w-full rounded-lg border border-border px-2 py-1.5 text-body-sm text-center focus:border-gold focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* מקרא — age guide */}
                <div className="mt-space-3 bg-white/60 rounded-lg p-space-3">
                  <p className="text-caption font-medium text-primary mb-1">מקרא — רישום גיל ילדים:</p>
                  <div className="text-caption text-text-muted space-y-0.5">
                    <p>0 = שנת לידה</p>
                    <p>1-2 = מלאו לילד שנה — שנתיים</p>
                    <p>3 = מלאו לילד 3 שנים</p>
                    <p>4-5 = מלאו לילד 4 — 5 שנים</p>
                    <p>6-12 = מלאו לילד 6 — 12 שנים</p>
                    <p>13-17 = מלאו לילד 13 — 17 שנים</p>
                    <p>18 = מלאו לילד 18 שנים</p>
                  </div>
                  <p className="text-caption text-text-muted mt-1 italic">*מנוסח בלשון זכר לצורך הנוחות, מתייחס לזכר/נקבה כאחד.</p>
                </div>

                <div className="mt-space-3">
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
              </div>
            )}

            <div className="mt-space-7 text-center">
              <button type="button" onClick={next}
                className="rounded-xl px-10 py-3.5 text-body-lg font-bold bg-gold text-white hover:bg-gold-hover cursor-pointer shadow-lg transition-all animate-pulse">
                ✓ חשב עלות מעסיק
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && result && (
          <EmployerResults result={result} inputs={inputs} onRestart={restart} />
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
