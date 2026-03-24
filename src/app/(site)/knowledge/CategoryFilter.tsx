'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardBody,
  CardFooter,
} from '@/components/ui'
import { FileText, Building2, Receipt, Shield, Banknote, BookOpen, Download } from 'lucide-react'
import { urlFor } from '@/sanity/image'
import type { ArticleCard, Category } from '@/sanity/types'
import { trackCategoryFilter } from '@/lib/analytics'

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

export function ArticleCardComponent({ article }: { article: ArticleCard }) {
  const catTitle = article.categories?.[0]?.title ?? 'כללי'
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
          {article.contentType === 'guide' && (
            <span className="absolute top-3 end-3 px-2.5 py-1 text-caption font-bold bg-gold text-white rounded-full flex items-center gap-1 shadow-sm">
              <Download className="h-3 w-3" />
              מדריך PDF
            </span>
          )}
          {article.contentType === 'circular' && (
            <span className="absolute top-3 end-3 px-2.5 py-1 text-caption font-bold bg-gold text-white rounded-full flex items-center gap-1 shadow-sm">
              <Download className="h-3 w-3" />
              חוזר מקצועי
            </span>
          )}
          {article.contentType === 'form' && (
            <span className="absolute top-3 end-3 px-2.5 py-1 text-caption font-bold bg-gold text-white rounded-full flex items-center gap-1 shadow-sm">
              <Download className="h-3 w-3" />
              טופס PDF
            </span>
          )}
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

export function FallbackCard({ category, title, excerpt, date }: FallbackArticle) {
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

/* ─── Category Pills (URL-based, two-row layout) ─── */

interface CategoryPillsProps {
  categories: Category[]
  activeCategory: string
  directOnly?: boolean
}

export function CategoryPills({ categories, activeCategory, directOnly = false }: CategoryPillsProps) {
  const parentCategories = categories.filter((c) => !c.parent)
  const activeParent = parentCategories.find((c) => c.slug?.current === activeCategory)

  // If the active slug is a subcategory, find its parent
  const activeSubcategory = categories.find(
    (c) => c.parent && c.slug?.current === activeCategory,
  )
  const resolvedParent = activeParent ?? (activeSubcategory ? parentCategories.find((p) => p._id === activeSubcategory.parent?._id) : null)

  const subcategories = resolvedParent
    ? categories.filter((c) => c.parent?._id === resolvedParent._id)
    : []

  // Compute "כללי" count: parent total minus sum of subcategory counts
  const generalCount = resolvedParent && subcategories.length > 0
    ? (resolvedParent.articleCount ?? 0) - subcategories.reduce((sum, sub) => sum + (sub.articleCount ?? 0), 0)
    : 0

  return (
    <section className="border-b border-border bg-white sticky top-[var(--navbar-height-mobile)] md:top-[var(--navbar-height-desktop)] z-30 px-6">
      <div className="max-w-content mx-auto py-space-3">
        {/* Row 1: Parent category pills */}
        <div className="flex gap-2 overflow-x-auto [mask-image:linear-gradient(to_left,transparent,black_40px,black_calc(100%-40px),transparent)] [-webkit-mask-image:linear-gradient(to_left,transparent,black_40px,black_calc(100%-40px),transparent)] md:[mask-image:none] md:[-webkit-mask-image:none]">
          <Link
            href="/knowledge"
            onClick={() => trackCategoryFilter('הכל')}
            className={[
              'shrink-0 px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors',
              !activeCategory
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-callout',
            ].join(' ')}
          >
            הכל
          </Link>
          {parentCategories.map((cat) => {
            const isActive = cat.slug?.current === activeCategory || cat._id === resolvedParent?._id
            return (
              <Link
                key={cat._id}
                href={`/knowledge?category=${cat.slug?.current ?? ''}`}
                onClick={() => trackCategoryFilter(cat.title)}
                className={[
                  'shrink-0 px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary hover:bg-callout',
                ].join(' ')}
              >
                {cat.title}
                {cat.articleCount != null && cat.articleCount > 0 && (
                  <span className={`ms-1.5 text-caption ${isActive ? 'text-white/70' : 'text-text-muted'}`}>
                    ({cat.articleCount})
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Row 2: Subcategory pills (when a parent is active) */}
        {subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mt-2 pt-2 border-t border-border/50 [mask-image:linear-gradient(to_left,transparent,black_40px,black_calc(100%-40px),transparent)] [-webkit-mask-image:linear-gradient(to_left,transparent,black_40px,black_calc(100%-40px),transparent)] md:[mask-image:none] md:[-webkit-mask-image:none]">
            <Link
              href={`/knowledge?category=${resolvedParent!.slug?.current ?? ''}`}
              className={[
                'shrink-0 px-3 py-1 rounded-full text-caption font-medium transition-colors',
                activeCategory === resolvedParent!.slug?.current && !directOnly
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'bg-surface text-text-secondary hover:bg-callout',
              ].join(' ')}
            >
              הכל ב{resolvedParent!.title}
            </Link>
            {generalCount > 0 && (
              <Link
                href={`/knowledge?category=${resolvedParent!.slug?.current ?? ''}&sub=direct`}
                className={[
                  'shrink-0 px-3 py-1 rounded-full text-caption font-medium transition-colors',
                  directOnly
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'bg-surface text-text-secondary hover:bg-callout',
                ].join(' ')}
              >
                כללי
                <span className={`ms-1 ${directOnly ? 'text-gold/70' : 'text-text-muted'}`}>
                  ({generalCount})
                </span>
              </Link>
            )}
            {subcategories.map((sub) => {
              const isActive = sub.slug?.current === activeCategory
              return (
                <Link
                  key={sub._id}
                  href={`/knowledge?category=${sub.slug?.current ?? ''}`}
                  onClick={() => trackCategoryFilter(sub.title)}
                  className={[
                    'shrink-0 px-3 py-1 rounded-full text-caption font-medium transition-colors',
                    isActive
                      ? 'bg-gold/10 text-gold border border-gold/30'
                      : 'bg-surface text-text-secondary hover:bg-callout',
                  ].join(' ')}
                >
                  {sub.title}
                  {sub.articleCount != null && sub.articleCount > 0 && (
                    <span className={`ms-1 ${isActive ? 'text-gold/70' : 'text-text-muted'}`}>
                      ({sub.articleCount})
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
