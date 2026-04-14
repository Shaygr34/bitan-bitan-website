import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PortableText } from 'next-sanity'
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
import { getServiceBySlug, getServiceSlugs } from '@/sanity/queries'
import { urlFor } from '@/sanity/image'
import { SectionHeader } from '@/components/ui'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 300

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

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getServiceSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'שירות לא נמצא' }

  return {
    title: service.title,
    description: service.shortDescription,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: `${service.title} — ביטן את ביטן רואי חשבון`,
      description: service.shortDescription,
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) notFound()

  const Icon = (service.icon && ICON_MAP[service.icon.toLowerCase()]) || Briefcase
  const imageUrl = urlFor(service.image, 800)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[
              { label: 'שירותים', href: '/services' },
              { label: service.title },
            ]} />
          </div>

          <div className="flex items-center gap-space-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-white text-h1 font-bold">{service.title}</h1>
          </div>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            {service.shortDescription}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-space-9 px-6">
        <div className="max-w-narrow mx-auto">
          {imageUrl && (
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-space-8">
              <Image
                src={imageUrl}
                alt={service.image?.alt ?? service.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          {service.body && service.body.length > 0 ? (
            <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed [&>h2]:text-h3 [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-space-8 [&>h2]:mb-space-4 [&>h3]:text-h4 [&>h3]:font-bold [&>h3]:text-primary [&>p]:mb-space-4 [&>ul]:space-y-2 [&>ul]:mb-space-4 [&>ol]:space-y-2 [&>ol]:mb-space-4">
              <PortableText value={service.body} />
            </div>
          ) : (
            <p className="text-text-secondary text-body-lg">
              {service.shortDescription}
            </p>
          )}
        </div>
      </section>

      {/* Process Steps */}
      {service.processSteps && service.processSteps.length > 0 && (
        <section className="bg-surface py-space-9 px-6">
          <div className="max-w-narrow mx-auto">
            <SectionHeader>איך התהליך עובד?</SectionHeader>
            <div className="mt-space-7 space-y-space-5">
              {service.processSteps.map((step) => (
                <div key={step._key} className="flex gap-space-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-primary font-bold text-body" dir="ltr">
                      {step.stepNumber}
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-h4 font-bold text-primary">{step.title}</h3>
                    <p className="text-text-secondary text-body mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Target Audience */}
      {service.targetAudience && service.targetAudience.length > 0 && (
        <section className="py-space-9 px-6">
          <div className="max-w-narrow mx-auto">
            <SectionHeader>למי השירות מתאים?</SectionHeader>
            <ul className="gold-bullet mt-space-6 space-y-space-3">
              {service.targetAudience.map((item, i) => (
                <li key={i} className="text-text-secondary text-body">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Service FAQs */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="bg-surface py-space-9 px-6">
          <div className="max-w-narrow mx-auto">
            <SectionHeader>שאלות נפוצות</SectionHeader>
            <div className="mt-space-7 space-y-space-5">
              {service.faqs.map((faq) => (
                <div key={faq._key}>
                  <h3 className="text-h4 font-semibold text-primary">{faq.question}</h3>
                  <p className="text-text-secondary text-body mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-white text-h2 font-bold">לפרטים נוספים</h2>
          <span className="gold-underline mt-3 mx-auto" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
            {`מעוניינים בשירותי ${service.title}? נשמח לסייע.`}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              פנו למשרד
            </a>
            <a
              href="tel:+97235174295"
              className="inline-flex items-center gap-2 px-8 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              03-5174295
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
