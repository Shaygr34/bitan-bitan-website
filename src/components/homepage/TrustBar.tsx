'use client'

import { RevealGroup, RevealItem } from '@/components/ui'
import { statPop } from '@/lib/motion'

type TrustPoint = { heading: string; description: string }

const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  { heading: 'שקיפות מלאה', description: 'בתהליך ובדיווח' },
  { heading: 'ליווי חברות', description: 'פרטיות ובעלי שליטה' },
  { heading: 'תכנון מס', description: 'וייצוג מול הרשויות' },
  { heading: 'תהליכי עבודה', description: 'מסודרים וברורים' },
]

export function TrustBar({
  trustPoints,
}: {
  trustPoints?: TrustPoint[]
}) {
  const points =
    trustPoints && trustPoints.length > 0 ? trustPoints : DEFAULT_TRUST_POINTS

  return (
    <section className="bg-surface py-space-7 px-6 border-b border-border-light">
      <RevealGroup className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-4 gap-space-5 text-center">
        {points.map(({ heading, description }) => (
          <RevealItem key={heading} variants={statPop}>
            <p className="text-h3 font-bold text-gold">{heading}</p>
            <p className="text-body text-text-secondary mt-1">{description}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
