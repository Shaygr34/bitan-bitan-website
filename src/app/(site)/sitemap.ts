import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { getArticleSlugs, getServiceSlugs, getToolSlugs } from '@/sanity/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  /* Static pages */
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/knowledge`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  /* Dynamic service detail pages */
  let servicePages: MetadataRoute.Sitemap = []
  try {
    const slugs = await getServiceSlugs()
    servicePages = slugs.map(({ slug }) => ({
      url: `${SITE_URL}/services/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // Sanity unreachable — skip
  }

  /* Dynamic knowledge article pages */
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const slugs = await getArticleSlugs()
    articlePages = slugs.map(({ slug }) => ({
      url: `${SITE_URL}/knowledge/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // Sanity unreachable — return static pages only
  }

  /* Dynamic tool pages */
  let toolPages: MetadataRoute.Sitemap = []
  try {
    const slugs = await getToolSlugs()
    toolPages = slugs.map(({ slug }) => ({
      url: `${SITE_URL}/tools/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    // Sanity unreachable — skip
  }

  return [...staticPages, ...servicePages, ...articlePages, ...toolPages]
}
