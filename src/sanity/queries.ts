/**
 * Centralized GROQ queries for Sanity CMS.
 * All queries used across the site live here.
 */

import { client } from './client'
import type {
  SiteSettings,
  HomePage,
  Service,
  Category,
  ArticleCard,
  ArticleFull,
  LegalPage,
  FAQ,
  Testimonial,
  AboutPage,
  Author,
} from './types'

/* ─── Revalidation ─── */

/** Default ISR revalidation in seconds (5 minutes) */
const REVALIDATE = 300

/** Fetch helper with ISR baked in */
async function sanityFetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  return client.fetch<T>(query, params ?? {}, {
    next: { revalidate: REVALIDATE },
  })
}

/* ─── Site Settings ─── */

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  _id,
  siteName,
  siteDescription,
  phone,
  fax,
  whatsapp,
  email,
  address,
  officeHours,
  googleMapsUrl,
  wazeUrl,
  googleMapsEmbedUrl,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
  ctaWhatsAppLabel,
  ctaPhoneLabel,
  ctaWhatsAppMessage,
  footerDisclaimer,
  logo,
  ogImage
}`

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings | null>(SITE_SETTINGS_QUERY)
}

/* ─── Services ─── */

const SERVICES_QUERY = `*[_type == "service"] | order(order asc){
  _id,
  title,
  slug,
  shortDescription,
  body,
  icon,
  order
}`

export async function getServices(): Promise<Service[]> {
  return sanityFetch<Service[]>(SERVICES_QUERY)
}

/* ─── Categories ─── */

const CATEGORIES_QUERY = `*[_type == "category"] | order(order asc){
  _id,
  title,
  slug,
  description,
  order
}`

export async function getCategories(): Promise<Category[]> {
  return sanityFetch<Category[]>(CATEGORIES_QUERY)
}

/* ─── Articles (listing) ─── */

const ARTICLES_QUERY = `*[_type == "article"] | order(publishedAt desc){
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  category->{
    _id,
    title,
    slug
  },
  author->{
    name
  }
}`

export async function getArticles(): Promise<ArticleCard[]> {
  return sanityFetch<ArticleCard[]>(ARTICLES_QUERY)
}

/* ─── Single Article ─── */

const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  body,
  tldr,
  difficulty,
  checklist,
  disclaimer,
  category->{
    _id,
    title,
    slug
  },
  author->{
    name
  },
  tags[]->{
    _id,
    title,
    slug
  }
}`

export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  return sanityFetch<ArticleFull | null>(ARTICLE_BY_SLUG_QUERY, { slug })
}

/* ─── Related Articles (same category, excluding current) ─── */

const RELATED_ARTICLES_QUERY = `*[_type == "article" && category._ref == $categoryId && _id != $currentId] | order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  category->{
    _id,
    title,
    slug
  },
  author->{
    name
  }
}`

export async function getRelatedArticles(categoryId: string, currentId: string): Promise<ArticleCard[]> {
  return sanityFetch<ArticleCard[]>(RELATED_ARTICLES_QUERY, { categoryId, currentId })
}

/* ─── All article slugs (for generateStaticParams) ─── */

const ARTICLE_SLUGS_QUERY = `*[_type == "article" && defined(slug.current)]{
  "slug": slug.current
}`

export async function getArticleSlugs(): Promise<{ slug: string }[]> {
  return sanityFetch<{ slug: string }[]>(ARTICLE_SLUGS_QUERY)
}

/* ─── FAQs ─── */

const FAQS_QUERY = `*[_type == "faq"] | order(order asc){
  _id,
  question,
  answer,
  category->{
    _id,
    title
  },
  order
}`

export async function getFAQs(): Promise<FAQ[]> {
  return sanityFetch<FAQ[]>(FAQS_QUERY)
}

/* ─── Testimonials ─── */

const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc){
  _id,
  clientName,
  clientRole,
  quote,
  image,
  order
}`

export async function getTestimonials(): Promise<Testimonial[]> {
  return sanityFetch<Testimonial[]>(TESTIMONIALS_QUERY)
}

/* ─── Home Page (singleton) ─── */

const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  _id,
  heroHeadline,
  heroSubtitle,
  heroFooterNote,
  trustPoints,
  aboutHeading,
  aboutSubtitle,
  aboutLinkText,
  aboutDifferentiators,
  processHeading,
  processSubtitle,
  processSteps,
  ctaHeadline,
  ctaSubtitle,
  ctaFooterNote
}`

export async function getHomePage(): Promise<HomePage | null> {
  return sanityFetch<HomePage | null>(HOME_PAGE_QUERY)
}

/* ─── About Page (singleton) ─── */

const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0]{
  _id,
  storyHeadline,
  storyBody,
  credentialsNote,
  differentiators,
  audienceCards,
  processSteps,
  values,
  officeNote,
  ctaHeadline,
  ctaSubtitle
}`

export async function getAboutPage(): Promise<AboutPage | null> {
  return sanityFetch<AboutPage | null>(ABOUT_PAGE_QUERY)
}

/* ─── Partners (authors with isPartner == true) ─── */

const PARTNERS_QUERY = `*[_type == "author" && isPartner == true]{
  _id,
  name,
  slug,
  role,
  bio,
  image,
  isPartner,
  specializations,
  experienceYears
}`

export async function getPartners(): Promise<Author[]> {
  return sanityFetch<Author[]>(PARTNERS_QUERY)
}

/* ─── Legal Pages ─── */

const LEGAL_PAGE_QUERY = `*[_type == "legalPage" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  lastUpdated,
  body
}`

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  return sanityFetch<LegalPage | null>(LEGAL_PAGE_QUERY, { slug })
}
