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
import { WhatsAppCTA, PhoneCTA, SectionHeader } from '@/components/ui'
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
        <div className="max-w-content mx-auto">
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

      {/* CTA */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <SectionHeader
            centered
            subtitle={`מעוניינים בשירותי ${service.title}? נשמח לשמוע מכם.`}
          >
            <span className="text-white">בואו נדבר</span>
          </SectionHeader>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <WhatsAppCTA
              label="שלחו הודעה בוואטסאפ"
              size="lg"
              message={`היי, אשמח לשמוע על שירותי ${service.title}`}
            />
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
