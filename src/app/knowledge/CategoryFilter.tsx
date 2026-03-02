'use client'

import { useState, useCallback } from 'react'
import type { ArticleCard, Category } from '@/sanity/types'

const PAGE_SIZE = 12

/** Full category filter with pills + article grid + load more */
export function KnowledgeFilterable({
  categories,
  articles,
  renderArticle,
  renderFallback,
}: {
  categories: Pick<Category, '_id' | 'title'>[]
  articles: ArticleCard[]
  renderArticle: (article: ArticleCard) => React.ReactNode
  renderFallback: () => React.ReactNode
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

  const handleCategoryChange = useCallback((id: string) => {
    setActiveId(id)
    setVisibleCount(PAGE_SIZE)
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
              onClick={() => handleCategoryChange(cat._id)}
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
                  {visible.map((article) => renderArticle(article))}
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
              {renderFallback()}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
