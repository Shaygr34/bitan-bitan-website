'use client'

import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'
import type { Testimonial } from '@/sanity/types'

type Props = { testimonials?: Testimonial[] }

export function TestimonialsSection({ testimonials }: Props) {
  if (!testimonials || testimonials.length === 0) return null

  const items = testimonials.map((t) => ({ key: t._id, name: t.clientName, role: t.clientRole ?? '', quote: t.quote }))

  return (
    <RevealSection className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="הלקוחות שלנו מספרים על החוויה שלהם."
        >
          מה אומרים עלינו
        </SectionHeader>

        <RevealGroup className="grid md:grid-cols-3 gap-space-5 mt-space-8">
          {items.map(({ key, quote, name, role }) => (
            <RevealItem key={key}>
              <div className="bg-white rounded-xl border border-border p-space-6 shadow-sm transition-all duration-base hover:shadow-lg hover:-translate-y-1">
                <span className="text-gold text-[3rem] leading-none font-serif">
                  &ldquo;
                </span>
                <p className="text-text-secondary text-body mt-2 leading-relaxed">
                  {quote}
                </p>
                <div className="mt-space-5 pt-space-3 border-t border-border-light">
                  <p className="text-primary font-semibold text-body">{name}</p>
                  {role && <p className="text-text-muted text-body-sm">{role}</p>}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </RevealSection>
  )
}
