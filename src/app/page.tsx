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
import { getServices, getFAQs, getTestimonials, getArticles, getSiteSettings } from '@/sanity/queries'

export default async function Home() {
  const [services, faqs, testimonials, articles, settings] = await Promise.all([
    getServices(),
    getFAQs(),
    getTestimonials(),
    getArticles(),
    getSiteSettings(),
  ])

  return (
    <>
      <HeroSection />
      <TrustBar trustPoints={settings?.trustPoints} />
      <ServicesSection services={services} />
      <AboutSection />
      <ProcessSection />
      <KnowledgePreview articles={articles} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <CTASection />
    </>
  )
}
