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
  logo?: SanityImage
  ogImage?: SanityImage
}

/* ─── Author ─── */

export type Author = {
  _id: string
  name: string
  slug: SanitySlug
  role?: string
  bio?: string
  image?: SanityImage
}

/* ─── Category ─── */

export type Category = {
  _id: string
  title: string
  slug: SanitySlug
  description?: string
  order: number
}

/* ─── Tag ─── */

export type Tag = {
  _id: string
  title: string
  slug: SanitySlug
}

/* ─── Service ─── */

export type Service = {
  _id: string
  title: string
  slug: SanitySlug
  shortDescription: string
  body?: PortableTextBlock[]
  icon?: string
  order: number
}

/* ─── Article (listing) ─── */

export type ArticleCard = {
  _id: string
  title: string
  slug: SanitySlug
  excerpt?: string
  publishedAt?: string
  category?: {
    _id: string
    title: string
    slug: SanitySlug
  }
  mainImage?: SanityImage
  author?: {
    name: string
  }
}

/* ─── Article (full) ─── */

export type ArticleFull = ArticleCard & {
  body?: PortableTextBlock[]
  tags?: Tag[]
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

/* ─── Testimonial ─── */

export type Testimonial = {
  _id: string
  clientName: string
  clientRole?: string
  quote: string
  image?: SanityImage
  order: number
}
