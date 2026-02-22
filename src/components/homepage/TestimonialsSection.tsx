'use client'

import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'

const TESTIMONIALS = [
  {
    quote:
      'ביטן את ביטן מלווים את החברה שלנו כבר 15 שנה. השירות מקצועי, אישי ותמיד זמין. אנחנו מרגישים שיש לנו שותף אמיתי.',
    name: 'דני כהן',
    role: 'מנכ"ל, חברת דיגיטל סולושנס',
  },
  {
    quote:
      'מאז שעברנו לביטן את ביטן חסכנו עשרות אלפי שקלים במס בזכות תכנון מס מקצועי. ממליץ בחום.',
    name: 'מיכל לוי',
    role: 'בעלת עסק עצמאי',
  },
  {
    quote:
      'הצוות של המשרד עזר לנו להקים את החברה מאפס — רישום, פתיחת תיקים, ובניית מבנה מס נכון. ליווי מלא ואמין.',
    name: 'יוסי אברהמי',
    role: 'שותף מייסד, סטארטאפ פינטק',
  },
] as const

export function TestimonialsSection() {
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
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <RevealItem key={name}>
              <div className="bg-white rounded-xl border border-border p-space-6 shadow-sm transition-all duration-base hover:shadow-lg hover:-translate-y-1">
                <span className="text-gold text-[3rem] leading-none font-serif">
                  &ldquo;
                </span>
                <p className="text-text-secondary text-body mt-2 leading-relaxed">
                  {quote}
                </p>
                <div className="mt-space-5 pt-space-3 border-t border-border-light">
                  <p className="text-primary font-semibold text-body">{name}</p>
                  <p className="text-text-muted text-body-sm">{role}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </RevealSection>
  )
}
