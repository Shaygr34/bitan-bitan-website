import type { Metadata } from 'next'
import {
  HeroSection,
  TrustBar,
  ServicesSection,
  AboutSection,
  KnowledgePreview,
  TestimonialsSection,
  ClientLogosSection,
  FAQSection,
  CTASection,
} from '@/components/homepage'
import { TrustModule } from '@/components/TrustModule'
import { getServices, getFAQs, getArticles, getHomePage, getClientLogos } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'ביטן את ביטן — רואי חשבון | ייעוץ מיסוי וליווי עסקי בתל אביב',
  description:
    'משרד רואי חשבון ביטן את ביטן — ייעוץ מיסוי, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי לחברות, עסקים ויחידים.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ביטן את ביטן — רואי חשבון | ייעוץ מיסוי וליווי עסקי בתל אביב',
    description:
      'משרד רואי חשבון ביטן את ביטן — ייעוץ מיסוי, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי.',
  },
}

export default async function Home() {
  const [services, faqs, articles, homePage, clientLogos] = await Promise.all([
    getServices(),
    getFAQs(),
    getArticles(),
    getHomePage(),
    getClientLogos(),
  ])

  return (
    <>
      <HeroSection
        headline={homePage?.heroHeadline}
        subtitle={homePage?.heroSubtitle}
        footerNote={homePage?.heroFooterNote}
      />
      <TrustBar trustPoints={homePage?.trustPoints} />
      <ClientLogosSection logos={clientLogos} />
      <ServicesSection services={services} />
      <AboutSection
        heading={homePage?.aboutHeading}
        subtitle={homePage?.aboutSubtitle}
        linkText={homePage?.aboutLinkText}
        differentiators={homePage?.aboutDifferentiators}
      />
      <TestimonialsSection />
      <KnowledgePreview articles={articles} />
      <TrustModule showProcess={false} showPrepare={false} showCTA={false} />
      <CTASection />
      <FAQSection faqs={faqs} />
    </>
  )
}
