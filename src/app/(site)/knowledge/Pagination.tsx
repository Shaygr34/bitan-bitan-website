'use client'

import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  activeCategory: string
  directOnly?: boolean
}

function buildHref(page: number, category: string, directOnly?: boolean): string {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (directOnly) params.set('sub', 'direct')
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/knowledge?${qs}` : '/knowledge'
}

/**
 * Compute which page numbers to show.
 * Always shows first, last, current, and 1 neighbor on each side.
 * Gaps are represented as `null`.
 */
function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | null)[] = []
  const neighbors = new Set([1, total, current, current - 1, current + 1])

  for (let i = 1; i <= total; i++) {
    if (neighbors.has(i)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null) // ellipsis
    }
  }
  return pages
}

export function Pagination({ currentPage, totalPages, activeCategory, directOnly }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="ניווט בין עמודים" className="flex items-center justify-center gap-1 mt-space-8">
      {/* Next page (RTL: chevron-right goes forward) */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1, activeCategory, directOnly)}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface transition-colors"
          aria-label="עמוד הבא"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <span className="p-2 text-text-muted/40" aria-hidden>
          <ChevronRight className="h-5 w-5" />
        </span>
      )}

      {pages.map((page, i) =>
        page === null ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page, activeCategory, directOnly)}
            className={[
              'min-w-[36px] h-9 flex items-center justify-center rounded-lg text-body-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface',
            ].join(' ')}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {/* Previous page (RTL: chevron-left goes back) */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1, activeCategory, directOnly)}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface transition-colors"
          aria-label="עמוד קודם"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="p-2 text-text-muted/40" aria-hidden>
          <ChevronLeft className="h-5 w-5" />
        </span>
      )}
    </nav>
  )
}
