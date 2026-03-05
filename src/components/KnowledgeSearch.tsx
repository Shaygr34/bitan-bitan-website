'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { trackKnowledgeSearch } from '@/lib/analytics'

interface SearchArticle {
  title: string
  slug: string
  excerpt: string
  categoryTitle: string
}

interface KnowledgeSearchProps {
  articles: SearchArticle[]
}

const MAX_RESULTS = 8
const MIN_CHARS = 2
const DEBOUNCE_MS = 300

export function KnowledgeSearch({ articles }: KnowledgeSearchProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchArticle[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(
    (term: string) => {
      if (term.length < MIN_CHARS) {
        setResults([])
        return
      }

      const lower = term.toLowerCase()
      const matched = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.excerpt.toLowerCase().includes(lower) ||
          a.categoryTitle.toLowerCase().includes(lower),
      ).slice(0, MAX_RESULTS)

      setResults(matched)
      setActiveIndex(-1)
      trackKnowledgeSearch(term, matched.length)
    },
    [articles],
  )

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), DEBOUNCE_MS)
  }

  const navigateToArticle = (slug: string) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    router.push(`/knowledge/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault()
      navigateToArticle(results[activeIndex].slug)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      setResults([])
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface text-text-secondary hover:bg-callout transition-colors text-body-sm cursor-pointer w-full md:w-auto"
      >
        <Search className="h-4 w-4" />
        <span>חיפוש מאמרים</span>
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 ring-2 ring-gold/20">
        <Search className="h-4 w-4 text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="חיפוש לפי כותרת, תוכן או קטגוריה..."
          className="flex-1 bg-transparent text-body-sm text-primary placeholder:text-text-muted outline-none"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setQuery('')
            setResults([])
          }}
          className="p-1 rounded text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          aria-label="סגור חיפוש"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute top-full start-0 end-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {results.map((article, i) => (
            <li
              key={article.slug}
              id={`search-result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={[
                'px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0',
                i === activeIndex ? 'bg-surface' : 'hover:bg-surface/50',
              ].join(' ')}
              onClick={() => navigateToArticle(article.slug)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <p className="text-body-sm font-medium text-primary">{article.title}</p>
              {article.categoryTitle && (
                <span className="text-caption text-text-muted">{article.categoryTitle}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {query.length >= MIN_CHARS && results.length === 0 && (
        <div className="absolute top-full start-0 end-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 px-4 py-3">
          <p className="text-body-sm text-text-muted text-center">
            לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
