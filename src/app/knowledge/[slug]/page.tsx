import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from 'next-sanity'
import { getArticleBySlug } from '@/sanity/queries'
import { urlFor } from '@/sanity/image'
import { SectionHeader, WhatsAppCTA } from '@/components/ui'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site-url'
import { ArrowRight, Calendar, Tag, User } from 'lucide-react'

/* Render article pages on-demand (SSR) — avoids cache/encoding issues with Hebrew slugs on Railway */
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

/** Safely decode a slug that may arrive percent-encoded from the proxy */
function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const decoded = decodeSlug(slug)
  const article = await getArticleBySlug(decoded)
  if (!article) return { title: 'מאמר לא נמצא' }

  const imageUrl = urlFor(article.mainImage, 1200)
  return {
    title: article.title,
    description: article.excerpt ?? '',
    alternates: { canonical: `/knowledge/${encodeURIComponent(decoded)}` },
    openGraph: {
      title: `${article.title} — ביטן את ביטן רואי חשבון`,
      description: article.excerpt ?? '',
      type: 'article',
      publishedTime: article.publishedAt,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(decodeSlug(slug))

  if (!article) {
    notFound()
  }

  const articleImageUrl = urlFor(article.mainImage, 1200)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(articleImageUrl ? { image: articleImageUrl } : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.author?.name
      ? { author: { '@type': 'Person', name: article.author.name } }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'ביטן את ביטן — רואי חשבון',
      url: SITE_URL,
    },
    inLanguage: 'he',
  }

  return (
    <div>
      <JsonLd data={articleJsonLd} />
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 text-white/70 text-body-sm hover:text-white transition-colors mb-space-4"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה למרכז הידע
          </Link>
          <h1 className="text-white text-h1 font-bold">{article.title}</h1>
          <span className="gold-underline mt-4" />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-space-5 text-white/70 text-body-sm">
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
            )}
            {article.author?.name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {article.author.name}
              </span>
            )}
            {article.category?.title && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                {article.category.title}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main image */}
      {articleImageUrl && (
        <section className="px-6">
          <div className="max-w-narrow mx-auto -mt-space-5 relative aspect-[16/9] max-h-[420px] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={articleImageUrl}
              alt={article.mainImage?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </div>
        </section>
      )}

      {/* Body */}
      <section className="py-space-9 px-6">
        <div className="max-w-narrow mx-auto">
          {article.excerpt && (
            <p className="text-body-lg text-text-secondary mb-space-7 leading-relaxed border-s-4 border-gold ps-space-4">
              {article.excerpt}
            </p>
          )}

          {article.body && article.body.length > 0 ? (
            <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-space-8 [&_h2]:mb-space-4 [&_h3]:text-h4 [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-space-6 [&_h3]:mb-space-3 [&_ul]:space-y-2 [&_ul]:ps-5 [&_li]:text-body [&_strong]:text-primary [&_a]:text-gold [&_a]:hover:text-gold-hover [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:ps-space-4 [&_blockquote]:italic [&_blockquote]:text-text-muted">
              <PortableText value={article.body} />
            </div>
          ) : (
            <p className="text-text-muted text-body text-center py-space-8">
              תוכן המאמר יעלה בקרוב.
            </p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-space-8 pt-space-5 border-t border-border-light">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="px-3 py-1 text-caption font-medium bg-surface text-text-secondary rounded-full"
                  >
                    {tag.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <SectionHeader
            centered
            subtitle="יש לכם שאלה על הנושא? נשמח לעזור."
          >
            צריכים ייעוץ מקצועי?
          </SectionHeader>
          <div className="mt-space-7">
            <WhatsAppCTA label="שלחו לנו שאלה בוואטסאפ" size="lg" />
          </div>
        </div>
      </section>
    </div>
  )
}
