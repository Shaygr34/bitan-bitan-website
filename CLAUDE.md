# Bitan & Bitan Website — Project Guide

## Overview

Marketing website for **ביטן את ביטן**, an Israeli CPA & tax advisory firm based in Tel Aviv. Built with Next.js 15 (App Router) + Sanity CMS v3 + Tailwind CSS + TypeScript. Hebrew-first, fully RTL. Deployed via Docker on Railway.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, `output: "standalone"`) |
| CMS | Sanity v3 (embedded Studio at `/studio`) |
| Styling | Tailwind CSS 3.4 with custom design tokens |
| Animation | Framer Motion (`motion/react`) |
| Icons | Lucide React (named imports for tree-shaking) |
| Font | Heebo (Google Fonts via `next/font`) |
| Analytics | GA4 (`NEXT_PUBLIC_GA4_ID`) |
| Hosting | Railway (Docker) |

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home (/)
│   ├── about/page.tsx            # About (/about)
│   ├── services/page.tsx         # Services (/services)
│   ├── knowledge/page.tsx        # Knowledge hub (/knowledge)
│   ├── knowledge/[slug]/page.tsx # Article detail (/knowledge/:slug)
│   ├── faq/page.tsx              # FAQ (/faq)
│   ├── contact/page.tsx          # Contact (/contact)
│   ├── privacy/page.tsx          # Privacy policy (/privacy)
│   ├── terms/page.tsx            # Terms of use (/terms)
│   ├── not-found.tsx             # Custom 404
│   ├── sitemap.ts                # Dynamic sitemap.xml
│   ├── robots.ts                 # robots.txt
│   ├── api/revalidate/           # Sanity webhook → ISR revalidation
│   ├── api/contact/              # Contact form submission → Sanity contactLead
│   └── studio/[[...tool]]/       # Embedded Sanity Studio
├── components/
│   ├── Header.tsx                # Sticky header + mobile hamburger menu
│   ├── Footer.tsx                # 3-column footer
│   ├── TrustModule.tsx           # Reusable trust/process component
│   ├── SiteSettingsContext.tsx    # React Context for global settings
│   ├── GoogleAnalytics.tsx       # GA4 script loader
│   ├── JsonLd.tsx                # JSON-LD structured data
│   ├── homepage/                 # 9 homepage section components
│   └── ui/                       # 12 shared UI primitives
├── sanity/
│   ├── schemas/                  # 13 document type schemas
│   ├── queries.ts                # All GROQ queries (centralized)
│   ├── types.ts                  # TypeScript types for query results
│   ├── client.ts                 # Sanity client (CDN, read-only)
│   ├── env.ts                    # Environment variable assertions
│   ├── image.ts                  # Image URL builder
│   └── deskStructure.ts          # Studio navigation structure
└── lib/
    ├── analytics.ts              # GA4 event helpers
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

### Sanity Content Types (13 total)
- **Content:** `article`, `guide`, `legalPage`
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

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Default: `2024-01-01` |
| `SANITY_API_TOKEN` | For seed/writes | Token with write permissions |
| `SANITY_REVALIDATE_SECRET` | For webhooks | Shared secret for revalidation endpoint |
| `NEXT_PUBLIC_GA4_ID` | For analytics | GA4 measurement ID |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL base for SEO |

## Code Conventions

- **Language:** All UI text, labels, and content in Hebrew
- **Imports:** Use `@/` path alias (maps to `src/`)
- **Components:** Functional components with TypeScript. Server components by default; `'use client'` only when needed
- **Sanity queries:** All centralized in `src/sanity/queries.ts` — never inline GROQ
- **Types:** All Sanity response types in `src/sanity/types.ts`
- **Animations:** Framer Motion via `RevealSection`/`RevealItem`/`RevealGroup` wrappers; respect `prefers-reduced-motion`
- **SEO:** Every page exports `metadata` or `generateMetadata`. JSON-LD on Home, Articles, FAQ
- **GA4 events:** `whatsapp_click`, `phone_click`, `form_submit`, `faq_expand`, `service_click`, `article_click` — all in `src/lib/analytics.ts`

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

## What's Not Done Yet

- **Email delivery for contact form** — form saves to Sanity `contactLead` but does NOT send email. Needs email provider (Resend/Postmark/etc.)
- **Guide pages** — `guide` schema exists but no frontend route (`/knowledge/[slug]` only queries `article` type)
- **Service detail pages** — no `/services/[slug]` route; cards link to `/contact` instead
- **Article pagination** — all articles in flat grid; fine for <20 but won't scale
- **Breadcrumbs** on inner pages
- **Legacy redirects** — no redirect rules configured yet
- **Safari/iOS manual testing** — code is correct but untested on real devices

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

## QA Reference
Detailed QA audit with prioritized issues: `docs/qa-m11.md`
SEO/Analytics validation checklist: `docs/M10-RUNBOOK.md`
