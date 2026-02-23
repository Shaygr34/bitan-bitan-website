'use client'

import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'

type ProcessStep = { stepNumber: number; title: string; description: string }

const DEFAULT_STEPS: ProcessStep[] = [
  {
    stepNumber: 1,
    title: 'פגישת היכרות',
    description: 'שיחה ראשונית להבנת הצרכים, המטרות והמצב הפיננסי הנוכחי.',
  },
  {
    stepNumber: 2,
    title: 'תכנון אסטרטגיה',
    description: 'בניית תוכנית עבודה מותאמת אישית — מס, חשבונאות וליווי עסקי.',
  },
  {
    stepNumber: 3,
    title: 'ביצוע מקצועי',
    description: 'יישום מדויק ומקצועי של התוכנית, עם דיווח שוטף ושקיפות מלאה.',
  },
  {
    stepNumber: 4,
    title: 'ליווי שוטף',
    description: 'מענה מהיר, עדכונים בזמן אמת ותמיכה מתמשכת בכל שלב בדרך.',
  },
]

type ProcessProps = {
  heading?: string
  subtitle?: string
  steps?: ProcessStep[]
}

export function ProcessSection({ heading, subtitle, steps }: ProcessProps) {
  const items = steps && steps.length > 0 ? steps : DEFAULT_STEPS

  return (
    <RevealSection className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle={
            subtitle ??
            'תהליך עבודה מסודר ושקוף — מפגישת ההיכרות ועד ליווי שוטף.'
          }
        >
          {heading ?? 'איך אנחנו עובדים?'}
        </SectionHeader>

        <RevealGroup className="grid md:grid-cols-4 gap-space-5 mt-space-8">
          {items.map(({ stepNumber, title, description }) => (
            <RevealItem key={stepNumber}>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-space-4">
                  <span className="text-white font-bold text-h4">
                    {stepNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-h4 font-semibold text-primary">{title}</h3>
                <p className="text-text-secondary text-body mt-2">
                  {description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </RevealSection>
  )
}
