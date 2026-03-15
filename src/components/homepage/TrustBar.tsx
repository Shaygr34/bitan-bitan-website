'use client'

import { RevealGroup, RevealItem } from '@/components/ui'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { statPop } from '@/lib/motion'

type TrustPoint = { heading: string; description: string }

/** Default trust stats — numeric values animate, text stays static */
const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  { heading: '30+', description: 'שנות ניסיון' },
  { heading: 'דור שני', description: 'של מקצוענות' },
  { heading: 'רו"ח + משפטנים', description: 'ידע משולב' },
  { heading: 'תל אביב', description: 'מגדל אלקטרה סיטי' },
]

/**
 * Parse a heading like "30+" into { number: 30, suffix: "+" }.
 * Returns null if the heading is not primarily numeric.
 */
function parseNumeric(heading: string): { number: number; suffix: string } | null {
  const match = heading.match(/^(\d+)(\+?)$/)
  if (!match) return null
  return { number: parseInt(match[1], 10), suffix: match[2] }
}

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
        {points.map(({ heading, description }) => {
          const numeric = parseNumeric(heading)
          return (
            <RevealItem key={heading} variants={statPop}>
              <p className="text-h3 font-bold text-gold">
                {numeric ? (
                  <AnimatedCounter
                    target={numeric.number}
                    suffix={numeric.suffix}
                    duration={2000}
                  />
                ) : (
                  heading
                )}
              </p>
              <p className="text-body text-text-secondary mt-1">{description}</p>
            </RevealItem>
          )
        })}
      </RevealGroup>
    </section>
  )
}
