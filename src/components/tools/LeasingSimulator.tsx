'use client'

import { useState, useCallback } from 'react'
import { SimulatorStep } from './SimulatorStep'
import { SimulatorResult } from './SimulatorResult'
import {
  computeRecommendation,
  DEFAULT_LEASING_CONFIG,
  type LeasingConfig,
  type SimulatorAnswers,
  type SimulatorResult as SimulatorResultType,
  type PriceRange,
} from './leasing-logic'

type LeasingSimulatorProps = {
  config?: LeasingConfig
}

type StepDef = {
  question: string
  subtitle?: string
  key: keyof SimulatorAnswers
  options: { value: string; label: string; sublabel?: string }[]
  allowCustomInput?: boolean
  customInputLabel?: string
  customInputPlaceholder?: string
}

const STEPS: StepDef[] = [
  {
    question: 'מה סוג העסק שלך?',
    subtitle: 'סוג הפעילות משפיע על הטבות המס',
    key: 'businessType',
    options: [
      { value: 'company', label: 'חברה בע"מ', sublabel: 'הוצאה מוכרת במלואה' },
      { value: 'freelancer', label: 'עצמאי / עוסק', sublabel: 'הכרה חלקית לפי שימוש' },
      { value: 'private', label: 'שכיר / פרטי', sublabel: 'ללא הטבת מס' },
    ],
  },
  {
    question: 'לכמה זמן אתה צריך את הרכב?',
    subtitle: 'התקופה משפיעה על העלות הכוללת',
    key: 'period',
    options: [
      { value: '1-2', label: '1-2 שנים', sublabel: 'טווח קצר' },
      { value: '2-3', label: '2-3 שנים', sublabel: 'טווח בינוני' },
      { value: '3-4', label: '3-4 שנים', sublabel: 'טווח ארוך' },
      { value: '4+', label: '4 שנים ומעלה', sublabel: 'טווח ארוך מאוד' },
    ],
  },
  {
    question: 'מה הכי חשוב לך?',
    subtitle: 'אין תשובה נכונה — זה עניין של העדפה',
    key: 'priority',
    options: [
      { value: 'cost', label: 'עלות כוללת נמוכה', sublabel: 'לשלם כמה שפחות בסך הכל' },
      { value: 'comfort', label: 'נוחות וודאות', sublabel: 'הכל כלול, בלי הפתעות' },
      { value: 'flexibility', label: 'גמישות להחליף', sublabel: 'אפשרות לשנות רכב' },
    ],
  },
  {
    question: 'מה טווח המחיר של הרכב?',
    subtitle: 'מחיר מחירון ברוטו — כולל מע"מ',
    key: 'priceRange',
    options: [
      { value: 'under130', label: 'עד 130,000 ₪' },
      { value: '130-160', label: '130,000 - 160,000 ₪' },
      { value: '160-250', label: '160,000 - 250,000 ₪' },
      { value: '250-400', label: '250,000 - 400,000 ₪' },
      { value: '400plus', label: 'מעל 400,000 ₪' },
    ],
    allowCustomInput: true,
    customInputLabel: 'או הזינו מחיר מדויק',
    customInputPlaceholder: 'למשל: 280000',
  },
  {
    question: 'כמה מקדמה תוכל לשים?',
    subtitle: 'המקדמה משפיעה על ההתאמה בין האפשרויות',
    key: 'downPayment',
    options: [
      { value: 'none', label: 'ללא מקדמה', sublabel: 'אפס השקעה ראשונית' },
      { value: 'up-to-20', label: 'עד 20%', sublabel: 'השקעה נמוכה' },
      { value: '30-50', label: '30%-50%', sublabel: 'השקעה משמעותית' },
      { value: 'full', label: '100% מזומן', sublabel: 'תשלום מלא מראש' },
    ],
  },
]

export function LeasingSimulator({ config }: LeasingSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<SimulatorAnswers>>({})
  const [result, setResult] = useState<SimulatorResultType | null>(null)

  const totalSteps = STEPS.length
  const showResult = currentStep >= totalSteps

  const handleSelect = useCallback(
    (value: string) => {
      const step = STEPS[currentStep]
      const updated = { ...answers, [step.key]: value }
      setAnswers(updated)

      // Auto-advance after brief delay for visual feedback
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep((s) => s + 1)
        } else {
          // Final step — compute result
          const finalAnswers = updated as SimulatorAnswers
          const res = computeRecommendation(finalAnswers, config ?? DEFAULT_LEASING_CONFIG)
          setResult(res)
          setCurrentStep(totalSteps)
        }
      }, 200)
    },
    [currentStep, answers, config, totalSteps],
  )

  const handleCustomInput = useCallback(
    (value: number) => {
      const priceK = value / 1000
      const updated = { ...answers, priceRange: priceK as unknown as PriceRange }
      setAnswers(updated)

      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep((s) => s + 1)
        } else {
          const finalAnswers = updated as SimulatorAnswers
          const res = computeRecommendation(finalAnswers, config ?? DEFAULT_LEASING_CONFIG)
          setResult(res)
          setCurrentStep(totalSteps)
        }
      }, 200)
    },
    [currentStep, answers, config, totalSteps],
  )

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const handleRestart = useCallback(() => {
    setAnswers({})
    setCurrentStep(0)
    setResult(null)
  }, [])

  return (
    <div>
      {/* Progress bar */}
      {!showResult && (
        <div className="mb-space-7">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-caption text-text-muted text-center mt-space-2">
            שלב {currentStep + 1} מתוך {totalSteps}
          </p>
        </div>
      )}

      {/* Back button */}
      {!showResult && currentStep > 0 && (
        <div className="mb-space-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-text-muted hover:text-primary text-body-sm transition-colors cursor-pointer"
          >
            &#8592; חזרה
          </button>
        </div>
      )}

      {/* Step content with transition */}
      {!showResult && (
        <div
          key={currentStep}
          className="animate-fadeIn"
          style={{
            animation: 'fadeIn 300ms ease-out',
          }}
        >
          <SimulatorStep
            question={STEPS[currentStep].question}
            subtitle={STEPS[currentStep].subtitle}
            options={STEPS[currentStep].options}
            selectedValue={answers[STEPS[currentStep].key] as string | undefined}
            onSelect={handleSelect}
            allowCustomInput={STEPS[currentStep].allowCustomInput}
            customInputLabel={STEPS[currentStep].customInputLabel}
            customInputPlaceholder={STEPS[currentStep].customInputPlaceholder}
            onCustomInput={STEPS[currentStep].allowCustomInput ? handleCustomInput : undefined}
          />
        </div>
      )}

      {/* Result */}
      {showResult && result && (
        <div
          className="animate-fadeIn"
          style={{
            animation: 'fadeIn 300ms ease-out',
          }}
        >
          <SimulatorResult
            result={result}
            answers={answers as SimulatorAnswers}
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
