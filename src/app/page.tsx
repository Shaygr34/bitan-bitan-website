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
import { getServices, getFAQs, getTestimonials, getArticles, getHomePage } from '@/sanity/queries'

export default async function Home() {
  const [services, faqs, testimonials, articles, homePage] = await Promise.all([
    getServices(),
    getFAQs(),
    getTestimonials(),
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
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <CTASection
        headline={homePage?.ctaHeadline}
        subtitle={homePage?.ctaSubtitle}
        footerNote={homePage?.ctaFooterNote}
      />
    </>
  )
}
