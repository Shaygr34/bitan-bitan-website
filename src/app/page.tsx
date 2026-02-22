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
import { getServices, getFAQs, getTestimonials, getArticles } from '@/sanity/queries'

export default async function Home() {
  const [services, faqs, testimonials, articles] = await Promise.all([
    getServices(),
    getFAQs(),
    getTestimonials(),
    getArticles(),
  ])

  return (
    <>
      <HeroSection />
      <TrustBar />
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
