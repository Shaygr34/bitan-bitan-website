import {
  Calculator,
  BookOpen,
  FileText,
  Shield,
  Briefcase,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { SectionHeader, Card, CardHeader, CardBody } from '@/components/ui'

const SERVICES = [
  {
    icon: Calculator,
    title: 'ייעוץ מס',
    description:
      'תכנון מס אסטרטגי ליחידים, חברות ועסקים — חיסכון מקסימלי במסגרת החוק.',
  },
  {
    icon: BookOpen,
    title: 'הנהלת חשבונות',
    description:
      'ניהול ספרים מדויק ומקצועי, דיווחים תקופתיים ועמידה בדרישות רשויות המס.',
  },
  {
    icon: FileText,
    title: 'דוחות כספיים',
    description:
      'הכנת דוחות כספיים שנתיים, דוחות מס הכנסה ודוחות מיוחדים בהתאם לתקנים.',
  },
  {
    icon: Shield,
    title: 'ביקורת חשבונות',
    description:
      'שירותי ביקורת מקצועיים להבטחת דיוק ותקינות הדיווח הכספי של העסק.',
  },
  {
    icon: Briefcase,
    title: 'ליווי עסקי',
    description:
      'ייעוץ עסקי שוטף, תמיכה בקבלת החלטות פיננסיות וליווי בצמתים עסקיים קריטיים.',
  },
  {
    icon: Globe,
    title: 'מיסוי בינלאומי',
    description:
      'פתרונות מס לפעילות בינלאומית, אמנות מס, ומיסוי תושבי חוץ.',
  },
] as const

export function ServicesSection() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="אנחנו מציעים מגוון שירותים פיננסיים מקיפים, מותאמים לצרכים הייחודיים של כל לקוח."
        >
          השירותים שלנו
        </SectionHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5 mt-space-8">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-space-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-h4 font-semibold text-primary">{title}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-text-secondary text-body">{description}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="text-center mt-space-7">
          <Link
            href="/services"
            className="inline-flex items-center text-nav font-medium text-gold hover:text-gold-hover transition-colors duration-fast"
          >
            לכל השירותים שלנו ←
          </Link>
        </div>
      </div>
    </section>
  )
}
