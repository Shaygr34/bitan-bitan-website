import type { Metadata } from 'next'
import Link from 'next/link'
import {
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  WhatsAppCTA,
  PhoneCTA,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'
import { Car, DollarSign, Users, ArrowLeft, type LucideIcon } from 'lucide-react'
import { getTools } from '@/sanity/queries'
import { Breadcrumb } from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'כלים ומחשבונים',
  description:
    'סימולטורים ומחשבונים פיננסיים — ליסינג או רכישה, מענקים, עלות מעסיק ועוד. ביטן את ביטן רואי חשבון.',
  alternates: { canonical: '/tools' },
}

const ICON_MAP: Record<string, LucideIcon> = {
  'leasing-simulator': Car,
  'grants-simulator': DollarSign,
  'employer-cost-calculator': Users,
}

const FALLBACK_TOOLS = [
  {
    slug: 'leasing-simulator',
    title: 'סימולטור ליסינג או רכישה',
    excerpt: 'בדקו מה משתלם יותר עבורכם — ליסינג תפעולי, ליסינג מימוני או רכישת רכב.',
    toolType: 'leasing-simulator',
  },
]

export default async function ToolsPage() {
  const tools = await getTools()
  const hasData = tools && tools.length > 0

  const displayTools = hasData
    ? tools.map((t) => ({
        slug: t.slug?.current ?? '',
        title: t.title,
        excerpt: t.excerpt ?? '',
        toolType: t.toolType,
      }))
    : FALLBACK_TOOLS

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'כלים ומחשבונים' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">כלים ומחשבונים</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            כלים אינטראקטיביים שיעזרו לכם לקבל החלטות פיננסיות מושכלות.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <RevealSection className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <RevealGroup className="grid md:grid-cols-2 gap-space-6">
            {displayTools.map((tool) => {
              const Icon = ICON_MAP[tool.toolType] ?? Car
              return (
                <RevealItem key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-space-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <h2 className="text-h3 font-bold text-primary">{tool.title}</h2>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p className="text-text-secondary text-body">{tool.excerpt}</p>
                      </CardBody>
                      <CardFooter>
                        <span className="inline-flex items-center gap-1 text-body-sm font-medium text-gold hover:text-gold-hover transition-colors">
                          לכלי
                          <ArrowLeft className="h-4 w-4" />
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* CTA */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-white text-h2 font-bold">צריכים ייעוץ אישי?</h2>
          <span className="gold-underline mt-3 mx-auto" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
            הכלים נותנים הערכה כללית. לחישוב מדויק המותאם למצב שלכם — דברו איתנו.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
            <PhoneCTA
              label="חייגו אלינו"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
