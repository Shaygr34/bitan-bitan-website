# Bitan & Bitan Website — Project Guide

## Overview

Marketing website for **ביטן את ביטן**, an Israeli CPA & tax advisory firm based in Tel Aviv. Built with Next.js 15 (App Router) + Sanity CMS v3 + Tailwind CSS + TypeScript. Hebrew-first, fully RTL. Deployed via Docker on Railway. **V1 is feature-complete** — all milestones (M1–M11) done, site completion sprint done. Currently in pre-launch / V2 planning phase.

## Current State (2026-03-05)

- **Build:** Passing on `main`. Railway deploying successfully.
- **Deploy:** Railway auto-deploys on `main` merge. Docker standalone build.
- **Studio:** Working at `/studio` — isolated via route groups (no site chrome interference).
- **CMS:** All content populated (services, about, FAQ, testimonials). Phase 3 service body drafts pending review.
- **Full audit:** `docs/codebase-state-report-2026-03-04.md`

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router, `output: "standalone"`) | ^15.1.0 |
| CMS | Sanity v3 (embedded Studio at `/studio`) | ^3.72.0 |
| CMS bridge | next-sanity | ^9.8.0 |
| Styling | Tailwind CSS 3.4 with custom design tokens | ^3.4.17 |
| Animation | Framer Motion (`motion/react`) | ^12.0.0 |
| Icons | Lucide React (named imports for tree-shaking) | ^0.469.0 |
| Font | Heebo (Google Fonts via `next/font`) | — |
| Analytics | GA4 (`NEXT_PUBLIC_GA4_ID`) | — |
| Email | Resend HTTP API (zero-dependency, fetch-based) | — |
| Hosting | Railway (Docker, node:22-alpine) | — |

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout — minimal shell (html/body/font only)
│   ├── globals.css               # Global styles + token imports
│   ├── global-error.tsx          # Root layout error boundary
│   ├── (site)/                   # Route group — all public pages (has Header/Footer/metadata)
│   │   ├── layout.tsx            # Site layout — Header, Footer, GA4, JSON-LD, SiteSettingsProvider
│   │   ├── page.tsx              # Home (/)
│   │   ├── icon.svg              # Favicon
│   │   ├── apple-icon.svg        # Apple touch icon
│   │   ├── error.tsx             # Error boundary (branded Hebrew UI)
│   │   ├── not-found.tsx         # Custom 404
│   │   ├── sitemap.ts            # Dynamic sitemap.xml
│   │   ├── robots.ts             # robots.txt
│   │   ├── about/page.tsx        # About (/about)
│   │   ├── services/page.tsx     # Services (/services)
│   │   ├── services/[slug]/page.tsx  # Service detail (/services/:slug) — 11 pages SSG
│   │   ├── knowledge/page.tsx    # Knowledge hub (/knowledge) — load-more pagination
│   │   ├── knowledge/[slug]/page.tsx # Article detail (/knowledge/:slug)
│   │   ├── faq/page.tsx          # FAQ (/faq)
│   │   ├── contact/page.tsx      # Contact (/contact)
│   │   ├── privacy/page.tsx      # Privacy policy (/privacy)
│   │   ├── terms/page.tsx        # Terms of use (/terms)
│   │   └── api/                  # API routes (revalidate, contact)
│   └── (studio)/                 # Route group — Sanity Studio (NO site chrome)
│       └── studio/[[...tool]]/   # Studio at /studio (ssr: false, dynamic import)
├── components/
│   ├── Header.tsx                # Sticky header + mobile hamburger + sticky CTA bar
│   ├── Footer.tsx                # 3-column footer
│   ├── Breadcrumb.tsx            # RTL breadcrumb with BreadcrumbList JSON-LD
│   ├── TrustModule.tsx           # Reusable trust/process component
│   ├── SiteSettingsContext.tsx    # React Context for global settings
│   ├── GoogleAnalytics.tsx       # GA4 script loader
│   ├── JsonLd.tsx                # JSON-LD structured data
│   ├── icons/WhatsAppIcon.tsx    # Shared WhatsApp SVG icon
│   ├── homepage/                 # 9 homepage section components
│   └── ui/                       # 12 shared UI primitives (Button, Card, Accordion, etc.)
├── sanity/
│   ├── schemas/                  # 12 document type schemas
│   ├── queries.ts                # All 14 GROQ queries (centralized, 316 lines)
│   ├── types.ts                  # TypeScript types for query results (242 lines)
│   ├── client.ts                 # Sanity client (CDN, read-only)
│   ├── env.ts                    # Environment variable assertions
│   ├── image.ts                  # Image URL builder (manual, no @sanity/image-url)
│   └── deskStructure.ts          # Studio navigation structure (Hebrew labels)
├── styles/
│   └── bitan-tokens.css          # CSS custom properties (colors, spacing, layout — 94 lines)
└── lib/
    ├── analytics.ts              # GA4 event helpers (10 events)
    ├── email.ts                  # Resend HTTP API email sender
    ├── fallback-warning.ts       # Dev-mode warning for hardcoded fallbacks
    ├── motion.ts                 # Framer Motion shared variants and easing curves
    └── site-url.ts               # Canonical URL resolution
```

## Key Architecture

### Route Groups (Critical Architecture)
- **`(site)/`** — all public pages; layout has Header, Footer, metadata, getSiteSettings(), GA4, JSON-LD
- **`(studio)/`** — Sanity Studio only; clean layout with no site chrome, no async data fetching
- Root `layout.tsx` is minimal: just `<html>/<body>` + Heebo font
- This isolation prevents the site's async server components from crashing the Studio in production
- Studio uses `next/dynamic` with `ssr: false` to load client-only

### RTL
- `<html lang="he" dir="rtl">` in root `layout.tsx`
- **No `left/right` CSS** — exclusively logical properties (`start/end`, `ps/pe`, `ms/me`)
- `<LTR>` wrapper component for phone numbers, emails, fax

### Data Flow
- All content from Sanity via server-side GROQ queries in `queries.ts`
- ISR revalidation: 300 seconds (5 min)
- Webhook at `/api/revalidate` for instant cache bust on Sanity publish
- `SiteSettingsContext` provides global contact info to client components
- Server components by default; only 4 client components (`'use client'`)

### Design Tokens
- Source of truth: `src/styles/bitan-tokens.css` (CSS custom properties)
- Tailwind config mirrors all tokens (colors, spacing, fonts, radii, shadows)
- `globals.css` imports tokens and sets base styles
- Gold ratio: ≤10% visual weight (lines/underlines only, max 1 CTA per viewport)

### Layout Dimensions
- `--navbar-height-mobile: 56px`, `--navbar-height-desktop: 72px`
- `--mobile-cta-height: 60px` (bottom padding on `<main>` for sticky mobile CTA)

### Sanity Content Types (12)
- **Content:** `article`, `legalPage`
- **Taxonomy:** `category`, `tag`
- **Business:** `service`, `faq`, `testimonial`, `contactLead`
- **People:** `author`
- **Singletons:** `homePage`, `aboutPage`, `siteSettings`

### Article Schema (Content Factory target)
Required: `title`, `slug`
Key optional: `author` (ref→author), `category` (ref→category), `tags` (array of ref→tag), `publishedAt` (datetime, sort only), `body` (Portable Text), `excerpt`, `mainImage`, `tldr`, `difficulty`, `checklist`, `disclaimer`, `seoTitle`, `seoDescription`

### Slug Convention
```
input.trim().replace(/\s+/g, '-').replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '').slice(0, 96)
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | `ul4uwnp7` |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Default: `2024-01-01` |
| `SANITY_API_TOKEN` | For seed/writes | Token with write permissions |
| `SANITY_REVALIDATE_SECRET` | For webhooks | Shared secret for revalidation endpoint |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | For contact map | Google Maps embed API key |
| `NEXT_PUBLIC_GA4_ID` | For analytics | GA4 measurement ID |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL base for SEO |
| `RESEND_API_KEY` | For email | Resend API key (NOT YET SET in Railway) |
| `CONTACT_EMAIL_TO` | For email | Recipient email (NOT YET SET in Railway) |
| `CONTACT_EMAIL_FROM` | For email | Sender (default: `noreply@bitancpa.co.il`) |

## Code Conventions

- **Language:** All UI text in Hebrew. English only for brand names (WhatsApp) and technical strings.
- **Imports:** `@/` path alias → `src/`
- **Components:** Functional + TypeScript. Server components default; `'use client'` only when needed.
- **Sanity queries:** Centralized in `src/sanity/queries.ts` — never inline GROQ.
- **Types:** All Sanity response types in `src/sanity/types.ts` — mirrors query projections.
- **Animations:** Framer Motion via `RevealSection`/`RevealItem`/`RevealGroup`; respects `prefers-reduced-motion`.
- **SEO:** Every page exports `metadata`/`generateMetadata`. JSON-LD on Home, Articles, FAQ. Breadcrumbs on all inner pages.
- **GA4 events:** 10 events in `src/lib/analytics.ts`: `whatsapp_click`, `phone_click`, `form_submit`, `faq_expand`, `service_click`, `article_click`, `category_filter`, `related_article_click`, `print_page`, `social_click`
- **Icons:** Shared SVGs in `src/components/icons/`
- **Fallbacks:** Pages with hardcoded fallback data call `warnFallback()` in dev mode.
- **No TODO/FIXME/HACK comments** in the codebase.

## Completed Milestones

| Milestone | Status |
|-----------|--------|
| M1–M7 | ✅ Core pages, RTL, responsive, Sanity integration |
| M8 | ✅ FAQ, contact form, legal pages |
| M9 | ✅ Sanity-driven About page |
| M10 | ✅ SEO, GA4, sitemap, robots.txt, JSON-LD |
| M11 | ✅ Comprehensive QA audit |
| Sprint | ✅ 24/25 tasks (see `docs/site-completion-sprint.md`) |
| M12 Launch Prep | 🟡 Email env vars, placeholder assets |

## Known Issues (Priority Order)

1. **Email not working** — Resend env vars (`RESEND_API_KEY`, `CONTACT_EMAIL_TO`) not set in Railway.
2. **Placeholder favicon/OG image** — "בב" SVGs, not real brand assets.
3. **No test infrastructure** — zero tests. Consider adding if V2 introduces interactive features.
4. **No CI/CD** — no GitHub Actions for lint/build checks on PRs.
5. **Client-side article filter** — won't scale past ~50 articles; needs server-side pagination.

## What's Not Done

- **Legacy redirects** — `next.config.ts` has 4 Hebrew→English service URL redirects (uncommitted). More may be needed.
- **Safari/iOS testing** — code is correct but untested on real devices.
- **Guide pages** — schema removed. If needed, decide: separate type vs. article + tag.
- **WordPress migration** — zero prep. No URL mapping, no WP export, no migration tooling.

## External Integrations

### Content Factory (bitan-bitan-os)
Pushes articles via Sanity write API. Target type: `article`. Upload images via `client.assets.upload()` first. ISR refreshes within 5 min; use webhook for instant.

### Revalidation Webhook
`POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`

### Email (Resend)
Contact form → Sanity `contactLead` (must succeed) + Resend email (fire-and-forget). Silently skips email if env vars not set.

## Reference Docs
- Full codebase audit: `docs/codebase-state-report-2026-03-04.md`
- QA audit: `docs/qa-m11.md`
- SEO checklist: `docs/M10-RUNBOOK.md`
- Sprint backlog: `docs/site-completion-sprint.md`
