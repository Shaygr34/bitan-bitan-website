import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { getFAQs, getCategories } from '@/sanity/queries'
import { SectionHeader, WhatsAppCTA, PhoneCTA } from '@/components/ui'
import { FAQAccordion } from './FAQAccordion'
import type { FAQ } from '@/sanity/types'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'שאלות נפוצות — ביטן את ביטן רואי חשבון',
  description:
    'תשובות לשאלות נפוצות בנושאי מס הכנסה, הנהלת חשבונות, הקמת חברה ועוד — משרד רואי חשבון ביטן את ביטן.',
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
  const groups = hasData ? groupByCategory(faqs) : null

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
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
        <div className="max-w-narrow mx-auto space-y-space-8">
          {groups
            ? groups.map(({ category, items }) => (
                <div key={category}>
                  <h2 className="text-h3 font-bold text-primary mb-space-4">
                    {category}
                  </h2>
                  <FAQAccordion faqs={items} />
                </div>
              ))
            : FALLBACK_GROUPS.map(({ category, items }) => (
                <div key={category}>
                  <h2 className="text-h3 font-bold text-primary mb-space-4">
                    {category}
                  </h2>
                  <FAQAccordion fallbackItems={items} />
                </div>
              ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <SectionHeader
            centered
            subtitle="לא מצאתם תשובה לשאלה שלכם? נשמח לעזור."
          >
            צריכים ייעוץ אישי?
          </SectionHeader>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <WhatsAppCTA label="שלחו לנו שאלה בוואטסאפ" size="lg" />
            <PhoneCTA label="התקשרו אלינו" size="lg" variant="secondary" />
          </div>
        </div>
      </section>
    </div>
  )
}
