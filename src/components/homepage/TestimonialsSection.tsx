'use client'

import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'
import type { Testimonial } from '@/sanity/types'

const FALLBACK_TESTIMONIALS = [
  { name: 'דני כ.', role: 'בעל חברה', quote: 'ביטן את ביטן מלווים את החברה שלנו כבר שנים רבות. השירות מקצועי, אישי ותמיד זמין — מרגישים שיש שותף אמיתי.' },
  { name: 'מיכל ל.', role: 'עצמאית', quote: 'מאז שעברנו לביטן את ביטן אנחנו מרגישים בטוחים שמנצלים כל הטבה שמגיעה לנו. תכנון מס מקצועי ומענה מהיר.' },
  { name: 'יוסי א.', role: 'יזם', quote: 'הצוות של המשרד עזר לנו להקים את החברה מאפס — רישום, פתיחת תיקים, ובניית מבנה נכון. ליווי מלא ואמין.' },
] as const

type Props = { testimonials?: Testimonial[] }

export function TestimonialsSection({ testimonials }: Props) {
  const items = testimonials && testimonials.length > 0
    ? testimonials.map((t) => ({ key: t._id, name: t.clientName, role: t.clientRole ?? '', quote: t.quote }))
    : FALLBACK_TESTIMONIALS.map((t) => ({ key: t.name, ...t }))

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
