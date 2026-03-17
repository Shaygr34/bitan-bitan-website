import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from 'next-sanity'
import { getArticleBySlug, getRelatedArticles, getParentCategories } from '@/sanity/queries'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { urlFor } from '@/sanity/image'
import { SectionHeader, WhatsAppCTA } from '@/components/ui'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site-url'
import { Breadcrumb } from '@/components/Breadcrumb'
import {
  Calendar,
  Tag,
  User,
  Lightbulb,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react'

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

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  basic: { label: 'בסיסי — מתאים לכולם', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'בינוני — דורש ידע מוקדם', color: 'bg-amber-100 text-amber-800' },
  advanced: { label: 'מתקדם — לבעלי ניסיון', color: 'bg-red-100 text-red-800' },
}

const DEFAULT_DISCLAIMER =
  'המידע במאמר זה הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני. מומלץ להתייעץ עם רואה חשבון לפני קבלת החלטות פיננסיות.'

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(decodeSlug(slug))

  if (!article) {
    notFound()
  }

  // Fetch related articles and parent categories in parallel
  const [relatedArticles, parentCategories] = await Promise.all([
    article.category?._id
      ? getRelatedArticles(article.category._id, article._id)
      : Promise.resolve([]),
    getParentCategories(),
  ])

  const articleImageUrl = urlFor(article.mainImage, 1200)
  const authorNames = article.authors?.filter(a => a?.name).map(a => a.name) ?? []
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(articleImageUrl ? { image: articleImageUrl } : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(authorNames.length > 0
      ? { author: authorNames.map(name => ({ '@type': 'Person', name })) }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'ביטן את ביטן — רואי חשבון',
      url: SITE_URL,
    },
    inLanguage: 'he',
  }

  const difficultyInfo = article.difficulty ? DIFFICULTY_LABELS[article.difficulty] : null
  const disclaimer = article.disclaimer ?? DEFAULT_DISCLAIMER

  return (
    <div>
      <JsonLd data={articleJsonLd} />
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[
              { label: 'מרכז ידע', href: '/knowledge' },
              { label: article.title },
            ]} />
          </div>
          <h1 className="text-white text-h1 font-bold">{article.title}</h1>
          <span className="gold-underline mt-4" />

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-space-5 text-white/70 text-body-sm">
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
            )}
            {authorNames.length > 0 && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {authorNames.join(', ')}
              </span>
            )}
            {article.category?.title && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                {article.category.title}
              </span>
            )}
            {difficultyInfo && (
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className={`px-2 py-0.5 rounded-full text-caption font-medium ${difficultyInfo.color}`}>
                  {difficultyInfo.label}
                </span>
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
          {/* TL;DR box */}
          {article.tldr && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-space-5 mb-space-7">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <span className="text-body font-bold text-primary">בקצרה</span>
              </div>
              <p className="text-text-secondary text-body leading-relaxed">
                {article.tldr}
              </p>
            </div>
          )}

          {article.excerpt && (
            <p className="text-body-lg text-text-secondary mb-space-7 leading-relaxed border-s-4 border-gold ps-space-4">
              {article.excerpt}
            </p>
          )}

          {article.body && article.body.length > 0 ? (
            <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-space-8 [&_h2]:mb-space-4 [&_h3]:text-h4 [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-space-6 [&_h3]:mb-space-3 [&_ul]:space-y-2 [&_ul]:ps-5 [&_li]:text-body [&_strong]:text-primary [&_a]:text-gold [&_a]:hover:text-gold-hover [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:ps-space-4 [&_blockquote]:italic [&_blockquote]:text-text-muted">
              <PortableText
                value={article.body}
                components={{
                  marks: {
                    textColor: ({ children, value }) => {
                      const colorMap: Record<string, string> = {
                        red: 'text-red-600',
                        gold: 'text-[#C5A572]',
                        blue: 'text-blue-600',
                        green: 'text-green-600',
                      }
                      return <span className={colorMap[value?.color] || ''}>{children}</span>
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-text-muted text-body text-center py-space-8">
              תוכן המאמר יעלה בקרוב.
            </p>
          )}

          {/* Checklist: "מה לעשות עכשיו" */}
          {article.checklist && article.checklist.length > 0 && (
            <div className="mt-space-8 bg-surface rounded-xl p-space-5 border border-border">
              <h3 className="text-h4 font-bold text-primary mb-space-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                מה לעשות עכשיו?
              </h3>
              <ul className="space-y-3">
                {article.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-body text-text-secondary">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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

          {/* PDF Download */}
          {article.downloadableFile?.url && (
            <div className="mt-space-8">
              <a
                href={`${article.downloadableFile.url}?dl=`}
                download
                className="flex items-center justify-center gap-3 w-full bg-gold hover:bg-gold-hover text-white font-bold text-body-lg py-4 px-6 rounded-xl transition-all duration-base shadow-md hover:shadow-lg"
              >
                <Download className="h-6 w-6" />
                {article.contentType === 'circular'
                  ? 'הורדת החוזר המקצועי (PDF)'
                  : 'הורדת המדריך המלא (PDF)'}
                {article.downloadableFile.size && (
                  <span className="text-white/70 text-body-sm font-normal">
                    ({(article.downloadableFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                )}
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-space-8 pt-space-5 border-t border-border-light print-show">
            <div className="flex items-start gap-3 bg-surface rounded-lg p-space-4">
              <AlertTriangle className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <p className="text-caption text-text-muted leading-relaxed">
                {disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-surface py-space-9 px-6">
          <div className="max-w-content mx-auto">
            <SectionHeader centered subtitle="תוכן נוסף שעשוי לעניין אתכם.">
              מאמרים קשורים
            </SectionHeader>
            <div className="grid md:grid-cols-3 gap-space-5 mt-space-7">
              {relatedArticles.map((related) => {
                const relatedImageUrl = urlFor(related.mainImage, 600)
                return (
                  <Link
                    key={related._id}
                    href={`/knowledge/${related.slug?.current ?? ''}`}
                    className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    {relatedImageUrl ? (
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={relatedImageUrl}
                          alt={related.mainImage?.alt ?? related.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-bl from-primary to-primary-light" />
                    )}
                    <div className="p-space-4">
                      <h3 className="text-body font-semibold text-primary line-clamp-2">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                      <span className="inline-block mt-2 text-body-sm font-medium text-gold">
                        קראו עוד
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter signup */}
      <div className="max-w-narrow mx-auto px-6 mb-space-8">
        <NewsletterSignup
          categories={parentCategories}
          preSelectedCategoryId={article.category?._id}
        />
      </div>

      {/* CTA */}
      <section className={`${relatedArticles.length > 0 ? '' : 'bg-surface'} py-space-9 px-6`}>
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
