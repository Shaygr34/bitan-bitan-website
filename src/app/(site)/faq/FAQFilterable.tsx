'use client'

import { useState, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { PortableText } from 'next-sanity'
import { Accordion, AccordionItem } from '@/components/ui'
import type { FAQ } from '@/sanity/types'

type FAQGroup = { category: string; items: FAQ[] }

type Props = {
  groups: FAQGroup[]
}

const DEBOUNCE_MS = 300

/** Extract plain text from Portable Text blocks for search matching */
function extractText(blocks: FAQ['answer']): string {
  return blocks
    .map((block) =>
      'children' in block
        ? (block.children as { text?: string }[]).map((c) => c.text ?? '').join('')
        : ''
    )
    .join(' ')
}

export function FAQFilterable({ groups }: Props) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<FAQGroup[]>(groups)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filterFAQs = useCallback(
    (search: string) => {
      const term = search.trim().toLowerCase()
      if (!term) {
        setFiltered(groups)
        return
      }

      const result: FAQGroup[] = []
      for (const group of groups) {
        const matchingItems = group.items.filter((faq) => {
          const questionMatch = faq.question.toLowerCase().includes(term)
          const answerMatch = extractText(faq.answer).toLowerCase().includes(term)
          return questionMatch || answerMatch
        })
        if (matchingItems.length > 0) {
          result.push({ category: group.category, items: matchingItems })
        }
      }
      setFiltered(result)
    },
    [groups]
  )

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => filterFAQs(value), DEBOUNCE_MS)
  }

  const clearSearch = () => {
    setQuery('')
    setFiltered(groups)
    inputRef.current?.focus()
  }

  const totalResults = filtered.reduce((sum, g) => sum + g.items.length, 0)

  return (
    <>
      {/* Search bar */}
      <div className="max-w-narrow mx-auto mb-space-8">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="חפשו שאלה..."
            className="w-full ps-12 pe-10 py-3 rounded-xl border border-border bg-white text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface transition-colors"
              aria-label="נקה חיפוש"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-narrow mx-auto space-y-space-8">
        {filtered.length > 0 ? (
          filtered.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-h3 font-bold text-primary mb-space-4">
                {category}
              </h2>
              <Accordion>
                {items.map((faq) => (
                  <AccordionItem key={faq._id} title={faq.question}>
                    <div className="prose-sm text-text-secondary">
                      <PortableText value={faq.answer} />
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <p className="text-center text-text-muted text-body py-space-6">
            לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;
          </p>
        )}

        {query && filtered.length > 0 && (
          <p className="text-center text-text-muted text-caption">
            {totalResults} {totalResults === 1 ? 'תוצאה' : 'תוצאות'}
          </p>
        )}
      </div>
    </>
  )
}
