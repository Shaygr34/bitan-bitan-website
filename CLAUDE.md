# Bitan & Bitan Website — Project Guide

## Overview

Marketing website for **ביטן את ביטן**, an Israeli CPA & tax advisory firm based in Tel Aviv. Built with Next.js 15 (App Router) + Sanity CMS v3 + Tailwind CSS + TypeScript. Hebrew-first, fully RTL. Deployed via Docker on Railway.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, `output: "standalone"`) |
| CMS | Sanity v3 (embedded Studio at `/studio`) |
| Styling | Tailwind CSS 3.4 with custom design tokens (`src/styles/bitan-tokens.css`) |
| Animation | Framer Motion (`motion/react`) |
| Icons | Lucide React (named imports for tree-shaking) |
| Font | Heebo (Google Fonts via `next/font`) |
| Analytics | GA4 (`NEXT_PUBLIC_GA4_ID`) |
| Email | Resend HTTP API (zero-dependency, fetch-based) |
| Hosting | Railway (Docker) |

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home (/)
│   ├── icon.svg                  # Favicon (placeholder "בב")
│   ├── apple-icon.svg            # Apple touch icon
│   ├── about/page.tsx            # About (/about)
│   ├── services/page.tsx         # Services (/services)
│   ├── services/[slug]/page.tsx  # Service detail (/services/:slug)
│   ├── knowledge/page.tsx        # Knowledge hub (/knowledge) — load-more pagination
│   ├── knowledge/[slug]/page.tsx # Article detail (/knowledge/:slug)
│   ├── faq/page.tsx              # FAQ (/faq)
│   ├── contact/page.tsx          # Contact (/contact)
│   ├── privacy/page.tsx          # Privacy policy (/privacy)
│   ├── terms/page.tsx            # Terms of use (/terms)
│   ├── not-found.tsx             # Custom 404
│   ├── error.tsx                 # Error boundary (branded Hebrew UI)
│   ├── global-error.tsx          # Root layout error boundary
│   ├── sitemap.ts                # Dynamic sitemap.xml (includes service detail pages)
│   ├── robots.ts                 # robots.txt
│   ├── api/revalidate/           # Sanity webhook → ISR revalidation
│   ├── api/contact/              # Contact form → Sanity contactLead + email notification
│   └── studio/[[...tool]]/       # Embedded Sanity Studio
├── components/
│   ├── Header.tsx                # Sticky header + mobile hamburger menu
│   ├── Footer.tsx                # 3-column footer
│   ├── Breadcrumb.tsx            # RTL breadcrumb with BreadcrumbList JSON-LD
│   ├── TrustModule.tsx           # Reusable trust/process component
│   ├── SiteSettingsContext.tsx    # React Context for global settings
│   ├── GoogleAnalytics.tsx       # GA4 script loader
│   ├── JsonLd.tsx                # JSON-LD structured data
│   ├── icons/
│   │   └── WhatsAppIcon.tsx      # Shared WhatsApp SVG icon
│   ├── homepage/                 # 9 homepage section components
│   └── ui/                       # 12 shared UI primitives (incl. WhatsAppCTA)
├── sanity/
│   ├── schemas/                  # 12 document type schemas
│   ├── queries.ts                # All GROQ queries (centralized)
│   ├── types.ts                  # TypeScript types for query results
│   ├── client.ts                 # Sanity client (CDN, read-only)
│   ├── env.ts                    # Environment variable assertions
│   ├── image.ts                  # Image URL builder
│   └── deskStructure.ts          # Studio navigation structure
├── styles/
│   └── bitan-tokens.css          # CSS custom properties (colors, layout dimensions)
└── lib/
    ├── analytics.ts              # GA4 event helpers (10 events)
    ├── email.ts                  # Resend HTTP API email sender
    ├── fallback-warning.ts       # Dev-mode warning for hardcoded fallbacks
    └── site-url.ts               # Canonical URL resolution
```

## Key Architecture Decisions

### RTL Implementation
- `<html lang="he" dir="rtl">` set in `layout.tsx`
- **No `left/right` CSS** — exclusively uses logical properties (`start/end`, `ps/pe`, `ms/me`)
- `<LTR>` wrapper component for phone numbers, emails, fax (switches to `dir="ltr"`)

### Data Flow
- All content comes from Sanity CMS via server-side GROQ queries
- ISR revalidation: 300 seconds (5 minutes)
- Webhook endpoint at `/api/revalidate` for instant cache busting on Sanity publish
- `SiteSettingsContext` provides global contact info to client components

### Layout Dimensions (CSS custom properties)
- `--navbar-height-mobile: 64px`, `--navbar-height-desktop: 72px`
- `--mobile-cta-height: 60px` (bottom padding on `<main>` for sticky mobile CTA)
- Defined in `src/styles/bitan-tokens.css`

### Sanity Content Types (12 total)
- **Content:** `article`, `legalPage`
- **Taxonomy:** `category`, `tag`
- **Business:** `service`, `faq`, `testimonial`, `contactLead`
- **People:** `author`
- **Singletons:** `homePage`, `aboutPage`, `siteSettings`

### Article Schema (primary content type for Content Factory)
Required fields: `title`, `slug`
Key optional fields: `author` (ref→author), `category` (ref→category), `tags` (array of ref→tag), `publishedAt` (datetime, controls sort order only), `body` (Portable Text with blocks + images), `excerpt`, `mainImage`, `tldr`, `difficulty`, `checklist`, `disclaimer`, `seoTitle`, `seoDescription`

### Slug Convention
All slugs use a custom slugify that preserves Hebrew characters:
```
input.trim().replace(/\s+/g, '-').replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '').slice(0, 96)
```

### Email Notifications
- Contact form saves to Sanity `contactLead` (primary, must succeed)
- Email notification sent via Resend HTTP API (secondary, fire-and-forget)
- Graceful degradation: if `RESEND_API_KEY` or `CONTACT_EMAIL_TO` not set, email is silently skipped
- Implementation: `src/lib/email.ts` (zero dependencies, native fetch)

### Breadcrumbs
- Reusable `<Breadcrumb>` component on all inner pages
- Emits BreadcrumbList JSON-LD structured data
- Auto-prepends "דף הבית" (/) as first item
- Uses ChevronLeft separator (RTL)

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Default: `2024-01-01` |
| `SANITY_API_TOKEN` | For seed/writes | Token with write permissions |
| `SANITY_REVALIDATE_SECRET` | For webhooks | Shared secret for revalidation endpoint |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | For contact map | Google Maps embed API key |
| `NEXT_PUBLIC_GA4_ID` | For analytics | GA4 measurement ID |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL base for SEO |
| `RESEND_API_KEY` | For email | Resend API key for contact form notifications |
| `CONTACT_EMAIL_TO` | For email | Recipient email for lead notifications |
| `CONTACT_EMAIL_FROM` | For email | Sender email (default: `noreply@bitancpa.co.il`) |

## Code Conventions

- **Language:** All UI text, labels, and content in Hebrew
- **Imports:** Use `@/` path alias (maps to `src/`)
- **Components:** Functional components with TypeScript. Server components by default; `'use client'` only when needed
- **Sanity queries:** All centralized in `src/sanity/queries.ts` — never inline GROQ
- **Types:** All Sanity response types in `src/sanity/types.ts`
- **Animations:** Framer Motion via `RevealSection`/`RevealItem`/`RevealGroup` wrappers; respect `prefers-reduced-motion`
- **SEO:** Every page exports `metadata` or `generateMetadata`. JSON-LD on Home, Articles, FAQ. Breadcrumbs on all inner pages.
- **GA4 events:** `whatsapp_click`, `phone_click`, `form_submit`, `faq_expand`, `service_click`, `article_click`, `category_filter`, `related_article_click`, `print_page`, `social_click` — all in `src/lib/analytics.ts`
- **Icons:** Shared SVG components in `src/components/icons/` (e.g. `WhatsAppIcon`)
- **Fallback data:** Pages with hardcoded fallbacks call `warnFallback()` in dev mode

## Completed Milestones

| Milestone | Status | Key Commits |
|-----------|--------|-------------|
| M1-M7 | Done | Core pages, RTL, responsive, Sanity integration |
| M8 | Done | FAQ page, contact form, legal pages |
| M9 | Done | Sanity-driven About page, content corrections |
| M10 | Done | SEO foundations, GA4, sitemap, robots.txt, JSON-LD |
| M11 QA | Done | Comprehensive QA audit (see `docs/qa-m11.md`) |
| PR1 | Done | SiteSettings control panel + Studio Hebrew nav |
| PR2 | Done | Webhook revalidation endpoint |
| PR3 | Done | TrustModule component on Home/Services/Contact |
| PR4 | Done | Editorial article template + related articles + print styles |
| PR5 | Done | QA fixes: contact form→Sanity, category filter, 404, service cards, testimonials |
| Sprint | Done | Site completion sprint — 24/25 tasks (see below) |

### Site Completion Sprint (branch: `claude/site-completion-sprint-Ef4is`)

**Tier 1 — Site Polish (10 tasks, all done):**
1. Placeholder favicon (icon.svg, apple-icon.svg) with "בב" initials
2. OG image wired via `generateMetadata` from Sanity `siteSettings.ogImage`
3. Google Maps API key moved to `NEXT_PUBLIC_GOOGLE_MAPS_KEY` env var
4. Removed `/dev` page and stale spec PDFs from `/public`
5. Error boundaries: `error.tsx` (branded) + `global-error.tsx` (root)
6. Email regex fix: requires 2+ char TLD
7. Fallback warnings via `warnFallback()` on pages with hardcoded data
8. Mobile CTA overlap fix: `<main>` gets `pb-[var(--mobile-cta-height)]` on mobile
9. Header heights extracted to CSS custom properties
10. Print stylesheet: `.no-print`, iframe hiding, shadow removal, link URL suppression

**Tier 2 — Missing Features (6 tasks, 5 done, 1 deferred):**
11. Email delivery via Resend HTTP API (`src/lib/email.ts`)
12. Service detail pages (`/services/[slug]`) with generateStaticParams
13. Breadcrumbs on 7 inner pages with BreadcrumbList JSON-LD
14. Load-more pagination on knowledge hub (PAGE_SIZE=12)
15. ~~Guide pages~~ — **DEFERRED** (guide schema removed; needs CMS-side decision)
16. Redirect scaffold in `next.config.ts` (empty `async redirects()`)

**Tier 3 — Code Hygiene (7 tasks, all done):**
18. Removed `@sanity/image-url` unused dependency
19. Removed dead `guide` schema (12 schemas now, not 13)
20. Extracted WhatsApp SVG to shared `WhatsAppIcon` component
21. Updated `.env.example` with all env vars
22. Extracted magic numbers to CSS custom properties
23. Added 4 new GA4 event helpers (category_filter, related_article_click, print_page, social_click)
24-25. General cleanup and consistency

**Build status:** NOT verified (npm registry was blocked in dev environment). Manual code review passed. Needs `npm install && npm run build` verification.

## What's Not Done Yet

- **Build verification** — sprint changes compiled correctly in review but `next build` was not run (npm blocked). First priority for next session.
- **Guide pages** — `guide` schema was removed. If guide content is needed, decide on content type approach first (separate schema vs. article with tag).
- **Legacy redirects** — `next.config.ts` has empty `redirects()` scaffold. Populate when old URLs are known.
- **Safari/iOS manual testing** — code is correct but untested on real devices
- **Real favicon/OG image** — current ones are placeholders; replace with final brand assets
- **Resend email config** — `RESEND_API_KEY`, `CONTACT_EMAIL_TO` env vars need to be set in Railway for email delivery to work
- **Article pagination scaling** — load-more works but may need server-side pagination for 50+ articles

## External Integration Points

### Content Factory (bitan-bitan-os)
The Content Factory pushes articles via Sanity write API. Full schema documentation was generated as a handoff document. Key points:
- Target type: `article`
- Use `@sanity/client` with write token
- Upload images via `client.assets.upload()` before creating doc
- `publishedAt` controls sort order only — Sanity's publish state controls visibility
- ISR cache refreshes within 5 minutes; use webhook for instant

### Revalidation Webhook
`POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
Body: Sanity webhook payload. Revalidates affected routes by content type.

### Email Notifications (Resend)
Contact form submissions trigger email via Resend HTTP API.
- Configured in `src/lib/email.ts`
- Requires `RESEND_API_KEY` and `CONTACT_EMAIL_TO` env vars
- Falls back silently if not configured (form still saves to Sanity)

## QA Reference
Detailed QA audit with prioritized issues: `docs/qa-m11.md`
SEO/Analytics validation checklist: `docs/M10-RUNBOOK.md`
