'use client'

import Link from 'next/link'
import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'

type Differentiator = { title: string; description: string }

const DEFAULT_DIFFERENTIATORS: Differentiator[] = [
  {
    title: 'רואי חשבון ומשפטנים',
    description:
      'שילוב ייחודי של ידע חשבונאי ומשפטי — מענה רחב ומקצועי ללקוחות.',
  },
  {
    title: 'ליווי אישי ומקצועי',
    description:
      'כל לקוח מקבל מענה ישיר מרואה חשבון. אנחנו שותפים לדרך, לא רק נותני שירות.',
  },
  {
    title: 'מענה מקיף',
    description:
      'תחת קורת גג אחת — חשבונאות, מיסוי, ייעוץ עסקי וליווי פיננסי מלא.',
  },
]

type AboutProps = {
  heading?: string
  subtitle?: string
  linkText?: string
  differentiators?: Differentiator[]
}

export function AboutSection({
  heading,
  subtitle,
  linkText,
  differentiators,
}: AboutProps) {
  const items =
    differentiators && differentiators.length > 0
      ? differentiators
      : DEFAULT_DIFFERENTIATORS

  return (
    <RevealSection className="bg-surface py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <div className="grid md:grid-cols-2 gap-space-8 items-start">
          {/* Text content */}
          <div>
            <SectionHeader
              subtitle={
                subtitle ??
                'משרד רואי חשבון ביטן את ביטן מלווה חברות פרטיות, בעלי שליטה ועסקים בשירותי ראיית חשבון, ייעוץ מס, ביקורת וליווי עסקי מקצועי.'
              }
            >
              {heading ?? 'למה ביטן את ביטן?'}
            </SectionHeader>

            <div className="mt-space-6">
              <Link
                href="/about"
                className="inline-flex items-center text-nav font-medium text-gold hover:text-gold-hover transition-colors duration-fast"
              >
                {linkText ?? 'קראו עוד עלינו ←'}
              </Link>
            </div>
          </div>

          {/* Differentiators */}
          <RevealGroup className="space-y-space-5">
            {items.map(({ title, description }, i) => (
              <RevealItem key={title}>
                <div className="flex gap-space-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <span className="text-gold font-bold text-body-lg">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-h4 font-semibold text-primary">
                      {title}
                    </h3>
                    <p className="text-text-secondary text-body mt-1">
                      {description}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </RevealSection>
  )
}
