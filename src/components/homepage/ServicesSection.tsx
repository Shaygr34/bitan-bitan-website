'use client'

import {
  Calculator,
  BookOpen,
  FileText,
  Shield,
  Briefcase,
  Globe,
  Users,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import {
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'
import type { Service } from '@/sanity/types'

/** Map Sanity icon names to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  calculator: Calculator,
  ledger: BookOpen,
  bookopen: BookOpen,
  chart: FileText,
  filetext: FileText,
  shield: Shield,
  briefcase: Briefcase,
  globe: Globe,
  users: Users,
}

const FALLBACK_SERVICES = [
  { icon: Calculator, title: 'ייעוץ מס', description: 'תכנון מס אסטרטגי ליחידים, חברות ועסקים — חיסכון מקסימלי במסגרת החוק.' },
  { icon: BookOpen, title: 'הנהלת חשבונות', description: 'ניהול ספרים מדויק ומקצועי, דיווחים תקופתיים ועמידה בדרישות רשויות המס.' },
  { icon: FileText, title: 'דוחות כספיים', description: 'הכנת דוחות כספיים שנתיים, דוחות מס הכנסה ודוחות מיוחדים בהתאם לתקנים.' },
  { icon: Shield, title: 'ביקורת חשבונות', description: 'שירותי ביקורת מקצועיים להבטחת דיוק ותקינות הדיווח הכספי של העסק.' },
  { icon: Briefcase, title: 'ליווי עסקי', description: 'ייעוץ עסקי שוטף, תמיכה בקבלת החלטות פיננסיות וליווי בצמתים עסקיים קריטיים.' },
  { icon: Globe, title: 'מיסוי בינלאומי', description: 'פתרונות מס לפעילות בינלאומית, אמנות מס, ומיסוי תושבי חוץ.' },
] as const

type Props = { services?: Service[] }

export function ServicesSection({ services }: Props) {
  const items = services && services.length > 0
    ? services.map((svc) => ({
        key: svc._id,
        Icon: (svc.icon && ICON_MAP[svc.icon.toLowerCase()]) || Briefcase,
        title: svc.title,
        description: svc.shortDescription,
        href: svc.slug?.current ? `/services#service-${svc.slug.current}` : '/services',
      }))
    : FALLBACK_SERVICES.map((s) => ({
        key: s.title,
        Icon: s.icon,
        title: s.title,
        description: s.description,
        href: '/services',
      }))

  return (
    <RevealSection className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="אנחנו מציעים מגוון שירותים פיננסיים מקיפים, מותאמים לצרכים הייחודיים של כל לקוח."
        >
          השירותים שלנו
        </SectionHeader>

        <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5 mt-space-8">
          {items.map(({ key, Icon, title, description, href }) => (
            <RevealItem key={key}>
              <Link href={href}>
                <Card>
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
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="text-center mt-space-7">
          <Link
            href="/services"
            className="inline-flex items-center text-nav font-medium text-gold hover:text-gold-hover transition-colors duration-fast"
          >
            לכל השירותים שלנו ←
          </Link>
        </div>
      </div>
    </RevealSection>
  )
}
