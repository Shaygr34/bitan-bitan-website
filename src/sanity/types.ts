/**
 * TypeScript types for Sanity CMS data.
 * These mirror the GROQ query projections, not the raw schema.
 */

import type { PortableTextBlock } from 'next-sanity'

/* ─── Primitives ─── */

export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: { x: number; y: number; width: number; height: number }
  alt?: string
}

export type SanitySlug = {
  _type: 'slug'
  current: string
}

/* ─── Site Settings ─── */

export type SiteSettings = {
  _id: string
  siteName: string
  siteDescription: string
  phone: string
  fax: string
  whatsapp: string
  email: string
  address: string
  officeHours: string
  googleMapsUrl?: string
  wazeUrl?: string
  googleMapsEmbedUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  ctaWhatsAppLabel?: string
  ctaPhoneLabel?: string
  ctaWhatsAppMessage?: string
  footerDisclaimer?: string
  logo?: SanityImage
  ogImage?: SanityImage
}

/* ─── Home Page ─── */

export type HomePageTrustPoint = {
  _key: string
  heading: string
  description: string
}

export type HomePageDifferentiator = {
  _key: string
  title: string
  description: string
}

export type HomePageProcessStep = {
  _key: string
  stepNumber: number
  title: string
  description: string
}

export type HomePage = {
  _id: string
  heroHeadline?: string
  heroSubtitle?: string
  heroFooterNote?: string
  trustPoints?: HomePageTrustPoint[]
  aboutHeading?: string
  aboutSubtitle?: string
  aboutLinkText?: string
  aboutDifferentiators?: HomePageDifferentiator[]
  processHeading?: string
  processSubtitle?: string
  processSteps?: HomePageProcessStep[]
  ctaHeadline?: string
  ctaSubtitle?: string
  ctaFooterNote?: string
}

/* ─── Author ─── */

export type Author = {
  _id: string
  name: string
  slug: SanitySlug
  role?: string
  bio?: string
  image?: SanityImage
  isPartner?: boolean
  specializations?: string[]
  experienceYears?: number
}

/* ─── About Page ─── */

export type AboutPageDifferentiator = {
  _key: string
  title: string
  description: string
  icon?: string
}

export type AboutPageAudienceCard = {
  _key: string
  title: string
  description: string
  icon?: string
}

export type AboutPageProcessStep = {
  _key: string
  stepNumber: number
  title: string
  description: string
}

export type AboutPageValue = {
  _key: string
  title: string
  description: string
  icon?: string
}

export type AboutPage = {
  _id: string
  heroTitle?: string
  storyHeadline: string
  storyBody: PortableTextBlock[]
  credentialsNote?: string
  partnersTitle?: string
  teamTitle?: string
  teamSubtitle?: string
  differentiatorsTitle?: string
  differentiatorsSubtitle?: string
  differentiators?: AboutPageDifferentiator[]
  audienceTitle?: string
  audienceSubtitle?: string
  audienceCards?: AboutPageAudienceCard[]
  processTitle?: string
  processSubtitle?: string
  processSteps?: AboutPageProcessStep[]
  valuesTitle?: string
  valuesSubtitle?: string
  values?: AboutPageValue[]
  officeNote?: string
  ctaHeadline?: string
  ctaSubtitle?: string
}

/* ─── Category ─── */

export type Category = {
  _id: string
  title: string
  slug: SanitySlug
  description?: string
  order: number
  parent?: { _id: string; title: string; slug: SanitySlug }
  articleCount?: number
}

/* ─── Tag ─── */

export type Tag = {
  _id: string
  title: string
  slug: SanitySlug
}

/* ─── Service ─── */

export type ServiceProcessStep = {
  _key: string
  stepNumber: number
  title: string
  description: string
}

export type ServiceFAQ = {
  _key: string
  question: string
  answer: string
}

export type Service = {
  _id: string
  title: string
  slug: SanitySlug
  shortDescription: string
  body?: PortableTextBlock[]
  icon?: string
  image?: SanityImage
  order: number
  processSteps?: ServiceProcessStep[]
  targetAudience?: string[]
  faqs?: ServiceFAQ[]
}

/* ─── File Asset ─── */

export type SanityFileAsset = {
  _type: 'file'
  asset: {
    _ref: string
    _type: 'reference'
    url?: string
    size?: number
    originalFilename?: string
  }
}

/* ─── Article (listing) ─── */

export type ArticleCard = {
  _id: string
  title: string
  slug: SanitySlug
  excerpt?: string
  publishedAt?: string
  contentType?: 'article' | 'guide' | 'circular'
  category?: {
    _id: string
    title: string
    slug: SanitySlug
  }
  mainImage?: SanityImage
  authors?: { name: string }[]
}

/* ─── Article (full) ─── */

export type ArticleFull = ArticleCard & {
  body?: PortableTextBlock[]
  tags?: Tag[]
  tldr?: string
  difficulty?: 'basic' | 'intermediate' | 'advanced'
  checklist?: string[]
  disclaimer?: string
  downloadableFile?: SanityFileAsset & {
    url?: string
    size?: number
    originalFilename?: string
  }
}

/* ─── Legal Page ─── */

export type LegalPage = {
  _id: string
  title: string
  slug: SanitySlug
  lastUpdated?: string
  body: PortableTextBlock[]
}

/* ─── FAQ ─── */

export type FAQ = {
  _id: string
  question: string
  answer: PortableTextBlock[]
  category?: {
    _id: string
    title: string
  }
  order: number
}

/* ─── Client Logo ─── */

export type ClientLogo = {
  _id: string
  companyName: string
  logo: SanityImage
  url?: string
}

/* ─── Team Member ─── */

export type TeamMember = {
  _id: string
  name: string
  role?: string
  bio?: string
  image?: SanityImage
  order: number
}

/* ─── Newsletter Subscriber ─── */

export type NewsletterSubscriber = {
  _id: string
  email: string
  name?: string
  subscribedCategories: { _ref: string }[]
  isActive: boolean
  subscribedAt: string
}

/* ─── Testimonial ─── */

export type Testimonial = {
  _id: string
  clientName: string
  clientRole?: string
  quote: string
  image?: SanityImage
  order: number
}
