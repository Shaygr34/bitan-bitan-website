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
  ClientLogo,
  AboutPage,
  Author,
  TeamMember,
  Tool,
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
  image,
  order,
  processSteps,
  targetAudience,
  faqs
}`

export async function getServices(): Promise<Service[]> {
  return sanityFetch<Service[]>(SERVICES_QUERY)
}

/* ─── Single Service ─── */

const SERVICE_BY_SLUG_QUERY = `*[_type == "service" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  body,
  icon,
  image,
  order,
  processSteps,
  targetAudience,
  faqs
}`

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return sanityFetch<Service | null>(SERVICE_BY_SLUG_QUERY, { slug })
}

/* ─── All service slugs (for generateStaticParams) ─── */

const SERVICE_SLUGS_QUERY = `*[_type == "service" && defined(slug.current)]{
  "slug": slug.current
}`

export async function getServiceSlugs(): Promise<{ slug: string }[]> {
  return sanityFetch<{ slug: string }[]>(SERVICE_SLUGS_QUERY)
}

/* ─── Categories ─── */

const CATEGORIES_QUERY = `*[_type == "category"] | order(order asc){
  _id,
  title,
  slug,
  description,
  order,
  "parent": parent->{_id, title, slug},
  "articleCount": count(*[_type == "article" && (
    ^._id in categories[]._ref ||
    category._ref == ^._id ||
    ^._id in categories[]->parent._ref ||
    category->parent._ref == ^._id
  )])
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
  contentType,
  mainImage,
  "categories": select(
    defined(categories) && length(categories) > 0 => categories[]->{_id, title, slug},
    defined(category) => [category->{_id, title, slug}],
    []
  ),
  "authors": select(
    defined(authors) && length(authors) > 0 => authors[]->{name},
    defined(author) => [author->{name}],
    []
  )
}`

export async function getArticles(): Promise<ArticleCard[]> {
  return sanityFetch<ArticleCard[]>(ARTICLES_QUERY)
}

/* ─── Filtered Articles (server-side pagination) ─── */

const FILTERED_ARTICLES_QUERY = `*[_type == "article" && (
  $categorySlug == "" ||
  $categorySlug in categories[]->slug.current ||
  $categorySlug in categories[]->parent->slug.current ||
  category->slug.current == $categorySlug ||
  category->parent->slug.current == $categorySlug
)] | order(publishedAt desc) [$start...$end] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  contentType,
  mainImage,
  "categories": select(
    defined(categories) && length(categories) > 0 => categories[]->{_id, title, slug},
    defined(category) => [category->{_id, title, slug}],
    []
  ),
  "authors": select(
    defined(authors) && length(authors) > 0 => authors[]->{name},
    defined(author) => [author->{name}],
    []
  )
}`

/** Direct-only: articles assigned directly to this category (not via parent→child) */
const FILTERED_ARTICLES_DIRECT_QUERY = `*[_type == "article" && (
  $categorySlug in categories[]->slug.current ||
  category->slug.current == $categorySlug
)] | order(publishedAt desc) [$start...$end] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  contentType,
  mainImage,
  "categories": select(
    defined(categories) && length(categories) > 0 => categories[]->{_id, title, slug},
    defined(category) => [category->{_id, title, slug}],
    []
  ),
  "authors": select(
    defined(authors) && length(authors) > 0 => authors[]->{name},
    defined(author) => [author->{name}],
    []
  )
}`

export async function getFilteredArticles(
  categorySlug: string,
  start: number,
  end: number,
  directOnly = false,
): Promise<ArticleCard[]> {
  const query = directOnly ? FILTERED_ARTICLES_DIRECT_QUERY : FILTERED_ARTICLES_QUERY
  return sanityFetch<ArticleCard[]>(query, {
    categorySlug,
    start,
    end,
  })
}

/* ─── Article Count (for pagination) ─── */

const ARTICLE_COUNT_QUERY = `count(*[_type == "article" && (
  $categorySlug == "" ||
  $categorySlug in categories[]->slug.current ||
  $categorySlug in categories[]->parent->slug.current ||
  category->slug.current == $categorySlug ||
  category->parent->slug.current == $categorySlug
)])`

const ARTICLE_COUNT_DIRECT_QUERY = `count(*[_type == "article" && (
  $categorySlug in categories[]->slug.current ||
  category->slug.current == $categorySlug
)])`

export async function getArticleCount(categorySlug: string, directOnly = false): Promise<number> {
  const query = directOnly ? ARTICLE_COUNT_DIRECT_QUERY : ARTICLE_COUNT_QUERY
  return sanityFetch<number>(query, { categorySlug })
}

/* ─── Single Article ─── */

const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  contentType,
  mainImage,
  body,
  tldr,
  difficulty,
  checklist,
  disclaimer,
  downloadableFile{
    ...,
    "url": asset->url,
    "size": asset->size,
    "originalFilename": asset->originalFilename
  },
  "categories": select(
    defined(categories) && length(categories) > 0 => categories[]->{_id, title, slug},
    defined(category) => [category->{_id, title, slug}],
    []
  ),
  "authors": select(
    defined(authors) && length(authors) > 0 => authors[]->{name},
    defined(author) => [author->{name}],
    []
  ),
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

const RELATED_ARTICLES_QUERY = `*[_type == "article" && (
  $categoryId in categories[]._ref ||
  category._ref == $categoryId
) && _id != $currentId] | order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  "categories": select(
    defined(categories) && length(categories) > 0 => categories[]->{_id, title, slug},
    defined(category) => [category->{_id, title, slug}],
    []
  ),
  "authors": select(
    defined(authors) && length(authors) > 0 => authors[]->{name},
    defined(author) => [author->{name}],
    []
  )
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

/* ─── Client Logos ─── */

const CLIENT_LOGOS_QUERY = `*[_type == "clientLogo" && isActive == true] | order(row asc, sortOrder asc){
  _id,
  companyName,
  subtitle,
  logo,
  logoSize,
  row,
  url
}`

export async function getClientLogos(): Promise<ClientLogo[]> {
  return sanityFetch<ClientLogo[]>(CLIENT_LOGOS_QUERY)
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
  heroTitle,
  storyHeadline,
  storyBody,
  credentialsNote,
  partnersTitle,
  teamTitle,
  teamSubtitle,
  differentiatorsTitle,
  differentiatorsSubtitle,
  differentiators,
  audienceTitle,
  audienceSubtitle,
  audienceCards,
  processTitle,
  processSubtitle,
  processSteps,
  valuesTitle,
  valuesSubtitle,
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

/* ─── Team Members ─── */

const TEAM_MEMBERS_QUERY = `*[_type == "teamMember"] | order(order asc){
  _id,
  name,
  role,
  bio,
  image,
  order
}`

export async function getTeamMembers(): Promise<TeamMember[]> {
  return sanityFetch<TeamMember[]>(TEAM_MEMBERS_QUERY)
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

/* ─── Newsletter ─── */

const NEWSLETTER_CHECK_QUERY = `count(*[_type == "newsletterSubscriber" && email == $email && isActive == true])`

export async function checkNewsletterSubscriber(email: string): Promise<number> {
  return sanityFetch<number>(NEWSLETTER_CHECK_QUERY, { email })
}

const PARENT_CATEGORIES_QUERY = `*[_type == "category" && !defined(parent)] | order(order asc){
  _id,
  title,
  slug
}`

export async function getParentCategories(): Promise<Category[]> {
  return sanityFetch<Category[]>(PARENT_CATEGORIES_QUERY)
}

/* ─── Tools ─── */

const TOOLS_QUERY = `*[_type == "tool"] | order(order asc) {
  _id, title, slug, toolType, excerpt, mainImage, order
}`

export async function getTools(): Promise<Tool[]> {
  return sanityFetch<Tool[]>(TOOLS_QUERY)
}

const TOOL_BY_SLUG_QUERY = `*[_type == "tool" && slug.current == $slug][0]{
  _id, title, slug, toolType, excerpt, mainImage,
  primeRate, vatRate, configJson, introBody, disclaimer,
  seoTitle, seoDescription
}`

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  return sanityFetch<Tool | null>(TOOL_BY_SLUG_QUERY, { slug })
}

const TOOL_SLUGS_QUERY = `*[_type == "tool"]{ "slug": slug.current }`

export async function getToolSlugs(): Promise<{ slug: string }[]> {
  return sanityFetch<{ slug: string }[]>(TOOL_SLUGS_QUERY)
}

/* ── Tax Config Singleton ── */

const TAX_CONFIG_QUERY = `*[_type == "taxConfig" && _id == "taxConfig"][0]{
  taxYear, primeRate, vatRate, companyTaxRate,
  taxBrackets[]{ ceiling, rate },
  niiLowThreshold, niiHighThreshold,
  niiEmployeeLow, niiEmployeeHigh, niiEmployerLow, niiEmployerHigh,
  vehicleTaxRate, manufacturerPriceCap,
  electricReduction, plugInReduction, hybridReduction,
  avgSalary, severanceCap, educationFundCap,
  pensionCreditSalaryCap, pensionCreditRate, pensionCreditTaxRate,
  creditPointValue,
  depreciationPetrol, depreciationElectric,
  vatRecoveryPrivate, taxDeductionPrivate,
  defaultTravelAllowance, surchargeThreshold
}`

export type TaxConfig = {
  taxYear?: number
  primeRate?: number
  vatRate?: number
  companyTaxRate?: number
  taxBrackets?: { ceiling: number; rate: number }[]
  niiLowThreshold?: number
  niiHighThreshold?: number
  niiEmployeeLow?: number
  niiEmployeeHigh?: number
  niiEmployerLow?: number
  niiEmployerHigh?: number
  vehicleTaxRate?: number
  manufacturerPriceCap?: number
  electricReduction?: number
  plugInReduction?: number
  hybridReduction?: number
  avgSalary?: number
  severanceCap?: number
  educationFundCap?: number
  pensionCreditSalaryCap?: number
  pensionCreditRate?: number
  pensionCreditTaxRate?: number
  creditPointValue?: number
  depreciationPetrol?: number
  depreciationElectric?: number
  vatRecoveryPrivate?: number
  taxDeductionPrivate?: number
  defaultTravelAllowance?: number
  surchargeThreshold?: number
}

export async function getTaxConfig(): Promise<TaxConfig | null> {
  return sanityFetch<TaxConfig | null>(TAX_CONFIG_QUERY)
}
