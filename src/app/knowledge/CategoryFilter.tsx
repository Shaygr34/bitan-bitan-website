'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardBody,
  CardFooter,
} from '@/components/ui'
import { FileText, Building2, Receipt, Shield, Banknote, BookOpen } from 'lucide-react'
import { urlFor } from '@/sanity/image'
import type { ArticleCard, Category } from '@/sanity/types'
import { trackCategoryFilter } from '@/lib/analytics'

const PAGE_SIZE = 12

/* Category → visual config for card banners */
const CATEGORY_VISUALS: Record<string, { gradient: string; icon: typeof FileText }> = {
  "מס הכנסה": { gradient: "from-primary to-primary-light", icon: FileText },
  "חברות":    { gradient: "from-[#1a3a5c] to-[#2d5a87]", icon: Building2 },
  "מע\"מ":    { gradient: "from-[#2c3e50] to-[#3d566e]", icon: Receipt },
  "ביטוח לאומי": { gradient: "from-[#1e3a5f] to-[#2a4a6b]", icon: Shield },
  "שכר":      { gradient: "from-[#2d4a3e] to-[#3d6b56]", icon: Banknote },
}
const DEFAULT_VISUAL = { gradient: "from-primary to-primary-light", icon: BookOpen }

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function ArticleCardComponent({ article }: { article: ArticleCard }) {
  const catTitle = article.category?.title ?? 'כללי'
  const visual = CATEGORY_VISUALS[catTitle] ?? DEFAULT_VISUAL
  const Icon = visual.icon
  const imageUrl = urlFor(article.mainImage, 600)

  return (
    <Link href={`/knowledge/${article.slug?.current ?? ''}`}>
      <Card className="!p-0 overflow-hidden">
        <div className={`relative h-36 bg-gradient-to-bl ${visual.gradient} flex items-center justify-center overflow-hidden`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.mainImage?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5" />
              <Icon className="h-12 w-12 text-white/30" strokeWidth={1.5} />
            </>
          )}
          <span className="absolute top-3 start-3 px-3 py-1 text-caption font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
            {catTitle}
          </span>
        </div>
        <CardBody className="px-space-5 pt-space-4">
          <h2 className="text-h4 font-semibold text-primary">{article.title}</h2>
          {article.excerpt && (
            <p className="text-text-secondary text-body mt-2">{article.excerpt}</p>
          )}
        </CardBody>
        <CardFooter className="flex items-center justify-between mx-space-5 mb-space-4">
          <span className="text-text-muted text-caption">{formatDate(article.publishedAt)}</span>
          <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors">
            קראו עוד
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

type FallbackArticle = {
  category: string
  title: string
  excerpt: string
  date: string
}

function FallbackCard({ category, title, excerpt, date }: FallbackArticle) {
  const visual = CATEGORY_VISUALS[category] ?? DEFAULT_VISUAL
  const Icon = visual.icon
  return (
    <Card className="!p-0 overflow-hidden">
      <div className={`relative h-36 bg-gradient-to-bl ${visual.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5" />
        <Icon className="h-12 w-12 text-white/30" strokeWidth={1.5} />
        <span className="absolute top-3 start-3 px-3 py-1 text-caption font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
          {category}
        </span>
      </div>
      <CardBody className="px-space-5 pt-space-4">
        <h2 className="text-h4 font-semibold text-primary">{title}</h2>
        <p className="text-text-secondary text-body mt-2">{excerpt}</p>
      </CardBody>
      <CardFooter className="flex items-center justify-between mx-space-5 mb-space-4">
        <span className="text-text-muted text-caption">{date}</span>
        <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors cursor-pointer">
          קראו עוד
        </span>
      </CardFooter>
    </Card>
  )
}

/** Full category filter with pills + article grid + load more */
export function KnowledgeFilterable({
  categories,
  articles,
  fallbackArticles,
}: {
  categories: Pick<Category, '_id' | 'title'>[]
  articles: ArticleCard[]
  fallbackArticles: FallbackArticle[]
}) {
  const [activeId, setActiveId] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const allCategories = [{ _id: 'all', title: 'הכל' }, ...categories]

  const filtered =
    activeId === 'all'
      ? articles
      : articles.filter((a) => a.category?._id === activeId)

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleCategoryChange = useCallback((id: string, title: string) => {
    setActiveId(id)
    setVisibleCount(PAGE_SIZE)
    trackCategoryFilter(title)
  }, [])

  return (
    <>
      {/* Category pills */}
      <section className="border-b border-border bg-white sticky top-[var(--navbar-height-mobile)] md:top-[var(--navbar-height-desktop)] z-30 px-6">
        <div className="max-w-content mx-auto py-space-3 flex gap-2 overflow-x-auto">
          {allCategories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => handleCategoryChange(cat._id, cat.title)}
              className={[
                'shrink-0 px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors cursor-pointer',
                activeId === cat._id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-callout',
              ].join(' ')}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          {articles.length > 0 ? (
            filtered.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5">
                  {visible.map((article) => (
                    <ArticleCardComponent key={article._id} article={article} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-space-8">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 bg-surface text-primary font-bold text-body px-8 py-3 rounded-lg hover:bg-callout transition-colors cursor-pointer"
                    >
                      הציגו עוד ({filtered.length - visibleCount} נותרו)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-text-muted text-body text-center py-space-8">
                אין מאמרים בקטגוריה זו כרגע.
              </p>
            )
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5">
              {fallbackArticles.map((fa) => (
                <FallbackCard key={fa.title} {...fa} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
