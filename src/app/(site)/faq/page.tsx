import type { Metadata } from 'next'
import { getFAQs } from '@/sanity/queries'
import { SectionHeader } from '@/components/ui'
import { FAQAccordion } from './FAQAccordion'
import { FAQFilterable } from './FAQFilterable'
import { JsonLd } from '@/components/JsonLd'
import type { FAQ } from '@/sanity/types'
import { warnFallback } from '@/lib/fallback-warning'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'שאלות נפוצות',
  description:
    'תשובות לשאלות נפוצות בנושאי מס הכנסה, הנהלת חשבונות, הקמת חברה ועוד — משרד רואי חשבון ביטן את ביטן.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'שאלות נפוצות — ביטן את ביטן רואי חשבון',
    description:
      'תשובות לשאלות נפוצות בנושאי מס הכנסה, הנהלת חשבונות, הקמת חברה ועוד.',
  },
}

/** Group FAQs by category title, preserving order within each group */
function groupByCategory(faqs: FAQ[]): { category: string; items: FAQ[] }[] {
  const map = new Map<string, FAQ[]>()
  for (const faq of faqs) {
    const cat = faq.category?.title ?? 'כללי'
    const list = map.get(cat) ?? []
    list.push(faq)
    map.set(cat, list)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}

/* Fallback when Sanity has no FAQs */
const FALLBACK_GROUPS = [
  {
    category: 'כללי',
    items: [
      { q: 'למי מתאימים השירותים של המשרד?', a: 'המשרד מעניק שירות לעצמאים, שכירים עם הכנסות נוספות, חברות בע"מ, עמותות ועסקים בכל גודל. אנחנו מתאימים את השירות לצרכים הייחודיים של כל לקוח.' },
      { q: 'כמה עולים השירותים?', a: 'המחיר משתנה בהתאם להיקף השירות ולמורכבות. אנחנו מאמינים בשקיפות מלאה — בפגישת ההיכרות נציג הצעת מחיר מפורטת וללא התחייבות.' },
      { q: 'איך מתחילים לעבוד איתכם?', a: 'צרו קשר בטלפון, בוואטסאפ או דרך האתר. נקבע פגישת היכרות (ללא עלות), נבין את הצרכים שלכם ונבנה תוכנית עבודה מותאמת.' },
      { q: 'האם המשרד עובד עם תוכנות חשבונאות מסוימות?', a: 'אנחנו עובדים עם כל התוכנות המובילות בשוק ויכולים להתאים את העבודה למערכת שכבר קיימת אצלכם, או להמליץ על פתרון מתאים.' },
      { q: 'מה שעות הפעילות של המשרד?', a: 'המשרד פתוח ימים ראשון עד חמישי, 08:30–17:00. ניתן לתאם פגישות גם מחוץ לשעות אלו בתיאום מראש.' },
    ],
  },
]

export default async function FAQPage() {
  const faqs = await getFAQs()
  const hasData = faqs && faqs.length > 0
  if (!hasData) warnFallback('FAQPage')
  const groups = hasData ? groupByCategory(faqs) : null

  /* Build FAQPage JSON-LD from Sanity data or fallback */
  const faqJsonLdItems = hasData
    ? faqs.map((faq) => ({
        '@type': 'Question' as const,
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: faq.answer
            .map((block) =>
              'children' in block
                ? (block.children as { text?: string }[])
                    .map((c) => c.text ?? '')
                    .join('')
                : '',
            )
            .join(' '),
        },
      }))
    : FALLBACK_GROUPS.flatMap((g) =>
        g.items.map((item) => ({
          '@type': 'Question' as const,
          name: item.q,
          acceptedAnswer: { '@type': 'Answer' as const, text: item.a },
        })),
      )

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqJsonLdItems,
  }

  return (
    <div>
      <JsonLd data={faqJsonLd} />
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'שאלות נפוצות' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">שאלות נפוצות</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            ריכזנו עבורכם תשובות לשאלות הנפוצות ביותר. לא מצאתם תשובה? צרו
            איתנו קשר.
          </p>
        </div>
      </section>

      {/* FAQ groups */}
      <section className="py-space-9 px-6">
        {groups ? (
          <FAQFilterable groups={groups} />
        ) : (
          <div className="max-w-narrow mx-auto space-y-space-8">
            {FALLBACK_GROUPS.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-h3 font-bold text-primary mb-space-4">
                  {category}
                </h2>
                <FAQAccordion fallbackItems={items} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <SectionHeader
            centered
            subtitle="לא מצאתם תשובה? פנו אלינו."
          >
            ביטן את ביטן — 03-5174295
          </SectionHeader>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              פנו למשרד
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
