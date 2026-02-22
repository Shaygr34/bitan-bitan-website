'use client'

import { SectionHeader, Accordion, AccordionItem, RevealSection } from '@/components/ui'

const FAQS = [
  {
    question: 'למי מתאימים השירותים של המשרד?',
    answer:
      'המשרד מעניק שירות לעצמאים, שכירים עם הכנסות נוספות, חברות בע"מ, עמותות ועסקים בכל גודל. אנחנו מתאימים את השירות לצרכים הייחודיים של כל לקוח.',
  },
  {
    question: 'כמה עולים השירותים?',
    answer:
      'המחיר משתנה בהתאם להיקף השירות ולמורכבות. אנחנו מאמינים בשקיפות מלאה — בפגישת ההיכרות נציג הצעת מחיר מפורטת וללא התחייבות.',
  },
  {
    question: 'איך מתחילים לעבוד איתכם?',
    answer:
      'צרו קשר בטלפון, בוואטסאפ או דרך האתר. נקבע פגישת היכרות (ללא עלות), נבין את הצרכים שלכם ונבנה תוכנית עבודה מותאמת.',
  },
  {
    question: 'האם המשרד עובד עם תוכנות חשבונאות מסוימות?',
    answer:
      'אנחנו עובדים עם כל התוכנות המובילות בשוק ויכולים להתאים את העבודה למערכת שכבר קיימת אצלכם, או להמליץ על פתרון מתאים.',
  },
  {
    question: 'מה שעות הפעילות של המשרד?',
    answer:
      'המשרד פתוח ימים ראשון עד חמישי, 08:30–17:00. ניתן לתאם פגישות גם מחוץ לשעות אלו בתיאום מראש.',
  },
] as const

export function FAQSection() {
  return (
    <RevealSection className="bg-surface py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="תשובות לשאלות הנפוצות ביותר שאנחנו מקבלים."
        >
          שאלות נפוצות
        </SectionHeader>

        <div className="max-w-narrow mx-auto mt-space-8">
          <Accordion>
            {FAQS.map(({ question, answer }, i) => (
              <AccordionItem key={question} title={question} defaultOpen={i === 0}>
                {answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </RevealSection>
  )
}
