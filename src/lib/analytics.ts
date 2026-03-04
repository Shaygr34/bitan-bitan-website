/**
 * Centralized GA4 event helpers.
 *
 * All analytics calls go through this module so we have:
 * - A single place to maintain event names
 * - Graceful no-ops when GA4 is not loaded
 * - Debounce protection against double-fires
 */

type GtagFn = (...args: unknown[]) => void

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  const g = (window as unknown as Record<string, unknown>).gtag as GtagFn | undefined
  return g ?? null
}

/* Simple debounce: ignore the same event name within 500ms */
const recentEvents = new Map<string, number>()
const DEBOUNCE_MS = 500

function shouldFire(eventName: string): boolean {
  const now = Date.now()
  const last = recentEvents.get(eventName)
  if (last && now - last < DEBOUNCE_MS) return false
  recentEvents.set(eventName, now)
  return true
}

function trackEvent(name: string, params?: Record<string, string | number>) {
  if (!shouldFire(name)) return
  const gtag = getGtag()
  gtag?.('event', name, params)
}

/* ─── Public API ─── */

export function trackWhatsAppClick(location: string) {
  trackEvent('whatsapp_click', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    location_label: location,
  })
}

export function trackPhoneClick(location: string) {
  trackEvent('phone_click', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    location_label: location,
  })
}

export function trackFormSubmit() {
  trackEvent('form_submit', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackServiceClick(serviceTitle: string) {
  trackEvent('service_click', {
    service_title: serviceTitle,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackArticleClick(articleTitle: string) {
  trackEvent('article_click', {
    article_title: articleTitle,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackFAQExpand(question: string) {
  trackEvent('faq_expand', {
    question,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackCategoryFilter(category: string) {
  trackEvent('category_filter', {
    category,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackRelatedArticleClick(articleTitle: string) {
  trackEvent('related_article_click', {
    article_title: articleTitle,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackPrintPage() {
  trackEvent('print_page', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

export function trackSocialClick(platform: string) {
  trackEvent('social_click', {
    platform,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}
