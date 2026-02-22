'use client'

import Link from 'next/link'
import {
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'

const ARTICLES = [
  {
    tag: 'מס הכנסה',
    title: 'מדריך להגשת דוח שנתי למס הכנסה',
    excerpt:
      'כל מה שצריך לדעת על הגשת הדוח השנתי — לוחות זמנים, מסמכים נדרשים וטיפים לחיסכון.',
  },
  {
    tag: 'חברות',
    title: 'הקמת חברה בע"מ — המדריך המלא',
    excerpt:
      'שלב אחר שלב: רישום חברה, פתיחת תיקים ברשויות, ותכנון מס נכון מהיום הראשון.',
  },
  {
    tag: 'מע"מ',
    title: 'ניהול מע"מ לעסקים קטנים ובינוניים',
    excerpt:
      'טיפים פרקטיים לניהול חשבוניות, דיווחים תקופתיים וזכויות לניכוי מע"מ תשומות.',
  },
] as const

export function KnowledgePreview() {
  return (
    <RevealSection className="bg-surface py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="מאמרים, מדריכים ומידע מקצועי שיעזרו לכם לקבל החלטות פיננסיות נכונות."
        >
          מרכז ידע
        </SectionHeader>

        <RevealGroup className="grid md:grid-cols-3 gap-space-5 mt-space-8">
          {ARTICLES.map(({ tag, title, excerpt }) => (
            <RevealItem key={title}>
              <Card>
                <CardHeader>
                  <span className="inline-block px-3 py-1 text-caption font-medium bg-primary/10 text-primary rounded-full">
                    {tag}
                  </span>
                </CardHeader>
                <CardBody>
                  <h3 className="text-h4 font-semibold text-primary">{title}</h3>
                  <p className="text-text-secondary text-body mt-2">{excerpt}</p>
                </CardBody>
                <CardFooter>
                  <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors cursor-pointer">
                    קראו עוד ←
                  </span>
                </CardFooter>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="text-center mt-space-7">
          <Link
            href="/knowledge"
            className="inline-flex items-center text-nav font-medium text-gold hover:text-gold-hover transition-colors duration-fast"
          >
            לכל המאמרים ←
          </Link>
        </div>
      </div>
    </RevealSection>
  )
}
