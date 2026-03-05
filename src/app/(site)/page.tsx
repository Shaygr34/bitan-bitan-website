import type { Metadata } from 'next'
import {
  HeroSection,
  TrustBar,
  ServicesSection,
  AboutSection,
  ProcessSection,
  KnowledgePreview,
  TestimonialsSection,
  FAQSection,
  CTASection,
} from '@/components/homepage'
import { TrustModule } from '@/components/TrustModule'
import { getServices, getFAQs, getArticles, getHomePage } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'ביטן את ביטן — רואי חשבון | ייעוץ מס וליווי עסקי בתל אביב',
  description:
    'משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי לחברות, עסקים ויחידים.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ביטן את ביטן — רואי חשבון | ייעוץ מס וליווי עסקי בתל אביב',
    description:
      'משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי.',
  },
}

export default async function Home() {
  const [services, faqs, articles, homePage] = await Promise.all([
    getServices(),
    getFAQs(),
    getArticles(),
    getHomePage(),
  ])

  return (
    <>
      <HeroSection
        headline={homePage?.heroHeadline}
        subtitle={homePage?.heroSubtitle}
        footerNote={homePage?.heroFooterNote}
      />
      <TrustBar trustPoints={homePage?.trustPoints} />
      <ServicesSection services={services} />
      <AboutSection
        heading={homePage?.aboutHeading}
        subtitle={homePage?.aboutSubtitle}
        linkText={homePage?.aboutLinkText}
        differentiators={homePage?.aboutDifferentiators}
      />
      <ProcessSection
        heading={homePage?.processHeading}
        subtitle={homePage?.processSubtitle}
        steps={homePage?.processSteps}
      />
      <KnowledgePreview articles={articles} />
      <TestimonialsSection />
      <TrustModule showProcess={false} showPrepare={false} />
      <FAQSection faqs={faqs} />
      <CTASection
        headline={homePage?.ctaHeadline}
        subtitle={homePage?.ctaSubtitle}
        footerNote={homePage?.ctaFooterNote}
      />
    </>
  )
}
