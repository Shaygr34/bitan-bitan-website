'use client'

import { useState } from 'react'
import { Star, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import { SectionHeader, RevealSection, RevealGroup, RevealItem } from '@/components/ui'
import type { Testimonial } from '@/sanity/types'

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/%D7%91%D7%99%D7%98%D7%9F+%D7%90%D7%AA+%D7%91%D7%99%D7%98%D7%9F+%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%9D/'

const PAGE_SIZE = 3

function StarRating() {
  return (
    <span className="inline-flex gap-0.5" aria-label="5 כוכבים">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </span>
  )
}

function isGoogle(role: string) {
  return role.includes('Google')
}

function SourceBadge({ role }: { role: string }) {
  if (isGoogle(role)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-body-sm text-text-muted">
        <GoogleIcon />
        <span>Google</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-body-sm text-text-muted">
      <FacebookIcon />
      <span>Facebook</span>
    </span>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  )
}

type Props = { testimonials?: Testimonial[] }

export function TestimonialsSection({ testimonials }: Props) {
  const [page, setPage] = useState(0)

  if (!testimonials || testimonials.length === 0) return null

  const totalPages = Math.ceil(testimonials.length / PAGE_SIZE)
  const visible = testimonials.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const googleCount = testimonials.filter((t) => isGoogle(t.clientRole ?? '')).length

  return (
    <RevealSection className="bg-surface py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="הלקוחות שלנו מספרים על החוויה שלהם."
        >
          מה אומרים עלינו
        </SectionHeader>

        {/* Rating summary */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-space-5">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-border shadow-sm">
            <GoogleIcon />
            <span className="text-body font-semibold text-primary">4.9</span>
            <StarRating />
            <span className="text-body-sm text-text-muted">
              ({googleCount} ביקורות)
            </span>
          </div>
        </div>

        {/* Review cards */}
        <RevealGroup className="grid md:grid-cols-3 gap-space-5 mt-space-8">
          {visible.map((t) => {
            const role = t.clientRole ?? ''
            return (
              <RevealItem key={t._id}>
                <div className="bg-white rounded-xl border border-border p-space-6 shadow-sm flex flex-col h-full transition-all duration-base hover:shadow-lg hover:-translate-y-1">
                  {/* Stars */}
                  {isGoogle(role) && (
                    <div className="mb-3">
                      <StarRating />
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-text-secondary text-body leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Footer */}
                  <div className="mt-space-5 pt-space-3 border-t border-border-light flex items-center justify-between">
                    <div>
                      <p className="text-primary font-semibold text-body">
                        {t.clientName}
                      </p>
                    </div>
                    <SourceBadge role={role} />
                  </div>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>

        {/* Pagination + Google link */}
        <div className="flex flex-col items-center gap-space-5 mt-space-7">
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-border bg-white text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="ביקורות קודמות"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="text-body-sm text-text-muted min-w-[3rem] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 rounded-lg border border-border bg-white text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="ביקורות הבאות"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          )}

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium text-body hover:text-primary-light transition-colors"
          >
            כל הביקורות ב-Google
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </RevealSection>
  )
}
