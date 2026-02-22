'use client'

import { useState } from 'react'
import { ArrowLeft, Calculator, Briefcase, FileText, Shield, Globe, Users, BookOpen } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CalloutBox,
  TagPill,
  Accordion,
  AccordionItem,
  SectionHeader,
  LTR,
  WhatsAppCTA,
  PhoneCTA,
} from '@/components/ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-space-8 border-b border-border last:border-b-0">
      <h3 className="text-h3 font-bold text-primary mb-space-5">{title}</h3>
      {children}
    </section>
  )
}

export default function DevPage() {
  const [activeTag, setActiveTag] = useState('מס הכנסה')

  return (
    <div className="max-w-content mx-auto px-6 py-space-8">
      <div className="mb-space-8">
        <h1 className="text-h1 font-bold text-primary">קטלוג רכיבים — QA</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          כל הרכיבים של ביטן את ביטן עם כל הווריאנטים. דף זה לבדיקה ויזואלית בלבד.
        </p>
      </div>

      {/* ─── Button ─── */}
      <Section title="Button — כפתורים">
        <div className="space-y-space-6">
          {/* Variants */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">וריאנטים</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">ראשי (Primary)</Button>
              <Button variant="secondary">משני (Secondary)</Button>
              <Button variant="ghost">רוח (Ghost)</Button>
              <Button variant="cta">CTA זהב</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">גדלים</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">קטן (sm)</Button>
              <Button size="md">בינוני (md)</Button>
              <Button size="lg">גדול (lg)</Button>
            </div>
          </div>

          {/* With icons */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">עם אייקונים</p>
            <div className="flex flex-wrap gap-3">
              <Button icon={Calculator} iconPosition="start">עם אייקון בהתחלה</Button>
              <Button icon={ArrowLeft} iconPosition="end" variant="secondary">עם אייקון בסוף</Button>
            </div>
          </div>

          {/* Disabled */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">מושבת (Disabled)</p>
            <div className="flex flex-wrap gap-3">
              <Button disabled>ראשי מושבת</Button>
              <Button variant="cta" disabled>CTA מושבת</Button>
              <Button variant="secondary" disabled>משני מושבת</Button>
            </div>
          </div>

          {/* As link */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">ככפתור-קישור</p>
            <Button href="#" variant="primary">קישור שנראה ככפתור</Button>
          </div>
        </div>
      </Section>

      {/* ─── Card ─── */}
      <Section title="Card — כרטיסים">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-5">
          {/* Service card example */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-h4 font-bold text-primary">ייעוץ מס</h4>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                תכנון מס אסטרטגי לעצמאים, חברות ושכירים — חיסכון מקסימלי בהתאם לחוק.
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm" icon={ArrowLeft} iconPosition="end">
                פרטים נוספים
              </Button>
            </CardFooter>
          </Card>

          {/* Article card example */}
          <Card>
            <CardHeader>
              <span className="text-caption text-text-muted">
                <LTR>12.02.2025</LTR> · מס הכנסה
              </span>
              <h4 className="text-h4 font-bold text-primary mt-1">
                5 טיפים לחיסכון במס הכנסה
              </h4>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                גלו כיצד תוכלו לחסוך אלפי שקלים בשנה עם תכנון מס נכון — מדריך מעשי לשכירים ועצמאים.
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex gap-2">
                <TagPill>מס הכנסה</TagPill>
                <TagPill>עצמאים</TagPill>
              </div>
            </CardFooter>
          </Card>

          {/* Card without hover */}
          <Card hover={false}>
            <CardHeader>
              <h4 className="text-h4 font-bold text-primary">כרטיס ללא הובר</h4>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary">
                כרטיס סטטי ללא אנימציית הובר — מתאים לתצוגת מידע בלבד.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ─── CalloutBox ─── */}
      <Section title="CalloutBox — תיבות הדגשה">
        <div className="space-y-space-4 max-w-narrow">
          <CalloutBox variant="info" title="שימו לב">
            <p>
              מועד הגשת הדוח השנתי למס הכנסה לשכירים הוא עד 30 באפריל.
              עצמאים נדרשים להגיש עד 31 במאי, אלא אם ניתנה ארכה.
            </p>
          </CalloutBox>

          <CalloutBox variant="warning" title="חשוב!">
            <p>
              אי הגשה במועד עלולה לגרור קנסות והצמדה. פנו אלינו בהקדם לקבלת ארכה.
            </p>
          </CalloutBox>

          <CalloutBox variant="info">
            <p>תיבת מידע ללא כותרת — לטקסט עזר קצר.</p>
          </CalloutBox>
        </div>
      </Section>

      {/* ─── TagPill ─── */}
      <Section title="TagPill — תגיות">
        <div className="space-y-space-4">
          {/* Static */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">תגיות סטטיות</p>
            <div className="flex flex-wrap gap-2">
              <TagPill>מס הכנסה</TagPill>
              <TagPill active>פעיל</TagPill>
              <TagPill>מע&quot;מ</TagPill>
              <TagPill>ביטוח לאומי</TagPill>
            </div>
          </div>

          {/* Interactive */}
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">תגיות אינטראקטיביות (לחצו)</p>
            <div className="flex flex-wrap gap-2">
              {['מס הכנסה', 'מע"מ', 'ביטוח לאומי', 'חברות', 'שכר'].map((tag) => (
                <TagPill
                  key={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </TagPill>
              ))}
            </div>
            <p className="text-body-sm text-text-muted mt-2">
              נבחר: <strong>{activeTag}</strong>
            </p>
          </div>
        </div>
      </Section>

      {/* ─── Accordion ─── */}
      <Section title="Accordion — אקורדיון">
        <div className="max-w-narrow">
          <Accordion>
            <AccordionItem title="מתי צריך להגיש דוח שנתי למס הכנסה?" defaultOpen>
              <p>
                שכירים עם הכנסה מעל תקרה מסוימת, עצמאים, ובעלי חברות חייבים בהגשת דוח שנתי.
                המועד הקבוע הוא 30 באפריל לשכירים ו-31 במאי לעצמאים, אלא אם ניתנה ארכה ע&quot;י רואה חשבון.
              </p>
            </AccordionItem>
            <AccordionItem title="מהו ייעוץ מס ולמי הוא מתאים?">
              <p>
                ייעוץ מס הוא שירות מקצועי שמטרתו לסייע לכם לשלם את המינימום הנדרש על פי חוק.
                השירות מתאים לעצמאים, שכירים עם הכנסות נוספות, בעלי חברות, ומשפחות עם אירועי מס (מכירת נכס, ירושה, הגירה).
              </p>
            </AccordionItem>
            <AccordionItem title="כמה עולים שירותי הנהלת חשבונות?">
              <p>
                העלות משתנה בהתאם לסוג העסק, היקף הפעילות ומורכבות העבודה.
                אנו מציעים חבילות מותאמות אישית — צרו קשר לקבלת הצעת מחיר ללא התחייבות.
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      {/* ─── SectionHeader ─── */}
      <Section title="SectionHeader — כותרת מדור">
        <div className="space-y-space-8">
          <SectionHeader>השירותים שלנו</SectionHeader>

          <SectionHeader subtitle="צוות רואי החשבון שלנו משלב ניסיון של עשרות שנים עם גישה מודרנית ואישית.">
            מי אנחנו
          </SectionHeader>

          <SectionHeader centered>כותרת ממורכזת</SectionHeader>

          <SectionHeader centered subtitle="כותרת ממורכזת עם תת-כותרת מלווה — מתאימה לחלקים מרכזיים בעמוד.">
            מרכז הידע
          </SectionHeader>
        </div>
      </Section>

      {/* ─── LTR ─── */}
      <Section title="LTR — עטיפת שמאל-לימין">
        <div className="space-y-space-3 max-w-narrow">
          <p className="text-text-secondary">
            מספר טלפון: <LTR className="font-medium text-primary">03-5174295</LTR>
          </p>
          <p className="text-text-secondary">
            דוא&quot;ל: <LTR className="font-medium text-primary">office@bitancpa.com</LTR>
          </p>
          <p className="text-text-secondary">
            WhatsApp: <LTR className="font-medium text-primary">+972-52-722-1111</LTR>
          </p>
          <p className="text-text-secondary">
            כתובת URL: <LTR className="font-medium text-primary">https://bitancpa.co.il</LTR>
          </p>
        </div>
      </Section>

      {/* ─── WhatsAppCTA & PhoneCTA ─── */}
      <Section title="WhatsAppCTA & PhoneCTA — כפתורי יצירת קשר">
        <div className="space-y-space-5">
          <div>
            <p className="text-body-sm text-text-muted mb-space-3">WhatsApp CTA</p>
            <div className="flex flex-wrap gap-3">
              <WhatsAppCTA />
              <WhatsAppCTA variant="primary" label="WhatsApp — ראשי" />
              <WhatsAppCTA size="sm" label="WhatsApp קטן" />
              <WhatsAppCTA size="lg" label="WhatsApp גדול" />
            </div>
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-space-3">Phone CTA</p>
            <div className="flex flex-wrap gap-3">
              <PhoneCTA />
              <PhoneCTA variant="secondary" />
              <PhoneCTA variant="ghost" />
              <PhoneCTA size="sm" label="חייגו עכשיו" />
              <PhoneCTA size="lg" />
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Combined example ─── */}
      <Section title="דוגמה משולבת — כרטיס שירות מלא">
        <div className="max-w-narrow">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-h4 font-bold text-primary">מיסוי בינלאומי</h4>
                  <p className="text-body-sm text-text-muted">שירות מקצועי</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary mb-space-3">
                מיסוי חברות בינלאומיות, אמנות מס, דיווח FATCA/CRS ותושבות מס.
              </p>
              <CalloutBox variant="info">
                <p>
                  חל עליכם חוק <LTR>FATCA</LTR>? אנחנו מטפלים בכל הדיווחים הנדרשים.
                </p>
              </CalloutBox>
            </CardBody>
            <CardFooter>
              <div className="flex flex-wrap gap-3">
                <WhatsAppCTA size="sm" message="היי, אשמח לשמוע על שירותי מיסוי בינלאומי" />
                <PhoneCTA size="sm" variant="secondary" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ─── All service icons ─── */}
      <Section title="אייקונים — Lucide React">
        <div className="flex flex-wrap gap-4">
          {[
            { icon: Calculator, label: 'Calculator' },
            { icon: BookOpen, label: 'BookOpen' },
            { icon: FileText, label: 'FileText' },
            { icon: Shield, label: 'Shield' },
            { icon: Briefcase, label: 'Briefcase' },
            { icon: Globe, label: 'Globe' },
            { icon: Users, label: 'Users' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <LTR className="text-caption text-text-muted">{label}</LTR>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
