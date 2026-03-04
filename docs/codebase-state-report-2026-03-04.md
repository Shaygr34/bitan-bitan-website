# Codebase State Report — Bitan & Bitan Website
**Date:** 2026-03-04
**Branch audited:** `main` (commit `bb258d2`)
**Build status:** BROKEN on main (3 errors). Fix in PR #36 (`claude/site-completion-sprint-Ef4is`).

---

## PART 1: ARCHITECTURE SNAPSHOT

### Tech Stack (actual, with versions)

| Layer | Package | Version | Status |
|-------|---------|---------|--------|
| Framework | Next.js | ^15.1.0 (resolves to 15.5.12) | Active |
| React | react / react-dom | ^19.0.0 | Active |
| CMS | sanity | ^3.72.0 | Active |
| CMS bridge | next-sanity | ^9.8.0 | Active |
| CMS vision | @sanity/vision | ^3.72.0 | Active (Studio query tool) |
| Styling | tailwindcss | ^3.4.17 | Active |
| Animation | motion (Framer Motion) | ^12.0.0 | Active |
| Icons | lucide-react | ^0.469.0 | Active |
| Linting | eslint + eslint-config-next | ^9.0.0 / ^15.1.0 | Active |
| TypeScript | typescript | ^5.7.0 | Active |
| PostCSS | postcss | ^8.4.49 | Active |

**Nothing installed but unused.** The `@sanity/image-url` dep was removed in the sprint.

### File Tree (src/, 3 levels deep)

```
src/
├── app/
│   ├── layout.tsx              # Root layout (RTL, Heebo font, Header/Footer, GA4, JSON-LD)
│   ├── page.tsx                # Home page (/)
│   ├── globals.css             # Tailwind + token import + base styles + print CSS
│   ├── icon.svg                # Placeholder favicon ("בב")
│   ├── apple-icon.svg          # Placeholder apple touch icon
│   ├── error.tsx               # Error boundary (branded Hebrew UI) ⚠️ BUILD ERROR on main
│   ├── global-error.tsx        # Root layout error boundary
│   ├── not-found.tsx           # Custom 404
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── robots.ts               # robots.txt
│   ├── about/
│   │   └── page.tsx            # About page (557 lines — largest file, has ~155 lines fallback)
│   ├── services/
│   │   ├── page.tsx            # Services listing
│   │   └── [slug]/page.tsx     # Service detail page
│   ├── knowledge/
│   │   ├── page.tsx            # Knowledge hub ⚠️ BUILD ERROR on main (RSC boundary)
│   │   ├── CategoryFilter.tsx  # Client component: category pills + load-more
│   │   └── [slug]/page.tsx     # Article detail (324 lines)
│   ├── faq/
│   │   ├── page.tsx            # FAQ page
│   │   └── FAQAccordion.tsx    # Client accordion component
│   ├── contact/
│   │   ├── page.tsx            # Contact page
│   │   └── ContactForm.tsx     # Client form component
│   ├── privacy/page.tsx        # Privacy policy
│   ├── terms/page.tsx          # Terms of use
│   ├── api/
│   │   ├── contact/route.ts    # POST → Sanity contactLead + Resend email
│   │   └── revalidate/route.ts # Sanity webhook → ISR revalidation
│   └── studio/
│       ├── layout.tsx          # Studio layout (no Header/Footer)
│       └── [[...tool]]/page.tsx # Embedded Sanity Studio
├── components/
│   ├── Header.tsx              # Sticky header + mobile hamburger (215 lines)
│   ├── Footer.tsx              # 3-column footer (169 lines)
│   ├── Breadcrumb.tsx          # RTL breadcrumb + BreadcrumbList JSON-LD
│   ├── TrustModule.tsx         # Reusable trust/process section
│   ├── SiteSettingsContext.tsx  # React Context for global site settings
│   ├── GoogleAnalytics.tsx     # GA4 script loader
│   ├── JsonLd.tsx              # JSON-LD structured data renderer
│   ├── icons/
│   │   └── WhatsAppIcon.tsx    # Shared WhatsApp SVG
│   ├── homepage/
│   │   ├── HeroSection.tsx     # Hero with CTA buttons
│   │   ├── TrustBar.tsx        # Trust points strip
│   │   ├── ServicesSection.tsx  # Service cards grid
│   │   ├── AboutSection.tsx    # About preview
│   │   ├── ProcessSection.tsx  # How-we-work steps
│   │   ├── TestimonialsSection.tsx # Client testimonials
│   │   ├── KnowledgePreview.tsx # Latest articles
│   │   ├── FAQSection.tsx      # FAQ preview
│   │   ├── CTASection.tsx      # Bottom CTA
│   │   └── index.ts            # Barrel export
│   └── ui/
│       ├── Button.tsx          # Base button
│       ├── Card.tsx            # Card + CardHeader/Body/Footer ⚠️ missing `id` prop on main
│       ├── SectionHeader.tsx   # Section title + gold underline
│       ├── Accordion.tsx       # Expandable accordion
│       ├── CalloutBox.tsx      # Highlighted callout box
│       ├── TagPill.tsx         # Tag badge
│       ├── LTR.tsx             # dir="ltr" wrapper for phone/email/fax
│       ├── WhatsAppCTA.tsx     # WhatsApp floating/inline CTA
│       ├── PhoneCTA.tsx        # Phone CTA button
│       ├── RevealSection.tsx   # Framer Motion scroll reveal wrapper
│       ├── RevealGroup.tsx     # Stagger container
│       ├── RevealItem.tsx      # Individual stagger item
│       └── index.ts            # Barrel export (12 components)
├── sanity/
│   ├── client.ts               # Sanity client (CDN, read-only)
│   ├── env.ts                  # Env var assertions (projectId, dataset)
│   ├── image.ts                # Manual image URL builder (no @sanity/image-url)
│   ├── queries.ts              # All 14 GROQ queries (316 lines)
│   ├── types.ts                # TypeScript types for query results (242 lines)
│   ├── deskStructure.ts        # Studio navigation (Hebrew labels)
│   └── schemas/
│       ├── index.ts            # 12 schema exports
│       ├── article.ts          # Article (primary content type)
│       ├── author.ts           # Author / partner
│       ├── category.ts         # Article category
│       ├── tag.ts              # Article tag
│       ├── service.ts          # Service offering
│       ├── faq.ts              # FAQ item
│       ├── testimonial.ts      # Client testimonial
│       ├── contactLead.ts      # Contact form submission
│       ├── homePage.ts         # Home page singleton
│       ├── aboutPage.ts        # About page singleton
│       ├── legalPage.ts        # Privacy/Terms content
│       └── siteSettings.ts     # Global settings singleton
├── styles/
│   └── bitan-tokens.css        # CSS custom properties (94 lines)
└── lib/
    ├── analytics.ts            # GA4 event helpers (10 events)
    ├── email.ts                # Resend HTTP API sender
    ├── fallback-warning.ts     # Dev-mode warning for hardcoded data
    ├── motion.ts               # Framer Motion shared variants
    └── site-url.ts             # Canonical URL resolution

Other root files:
├── public/logo.png             # Site logo
├── public/logo-backup.png      # Logo backup
├── scripts/seed.ts             # Sanity seed script
├── Dockerfile                  # Multi-stage Docker build (node:22-alpine)
├── sanity.config.ts            # Sanity Studio config
├── tailwind.config.ts          # Tailwind config with full token integration
├── next.config.ts              # Next.js config (standalone output, redirects scaffold)
├── .env.example                # All env vars documented
└── docs/                       # 6 documentation files
```

**No empty or stub directories.** All directories contain real files.

### Routing

| Route | Type | Content | Status |
|-------|------|---------|--------|
| `/` | Static (ISR) | Home — 9 sections, CMS-driven | Real content |
| `/about` | Static (ISR) | About — 7 sections, CMS with fallbacks | Real + fallback |
| `/services` | Static (ISR) | Services grid — CMS-driven | Real content |
| `/services/[slug]` | SSG (11 pages) | Service detail — CMS-driven | Real content |
| `/knowledge` | Static (ISR) | Knowledge hub — articles grid + category filter | Real content ⚠️ broken on main |
| `/knowledge/[slug]` | Dynamic | Article detail — CMS-driven | Real content |
| `/faq` | Static (ISR) | FAQ accordion — CMS-driven | Real content |
| `/contact` | Static (ISR) | Contact form + map + info | Real content |
| `/privacy` | Static (ISR) | Privacy policy — CMS (legalPage) | Real content |
| `/terms` | Static (ISR) | Terms of use — CMS (legalPage) | Real content |
| `/studio/[[...tool]]` | Dynamic | Embedded Sanity Studio | Functional |
| `/api/contact` | API (POST) | Form → Sanity + email | Functional |
| `/api/revalidate` | API (POST) | Webhook → ISR cache bust | Functional |
| `/sitemap.xml` | Static | Dynamic sitemap | Functional |
| `/robots.txt` | Static | Robots config | Functional |
| Custom 404 | Static | Branded Hebrew 404 page | Real content |

### Components Inventory

**Layout Components (7):**
| Component | Lines | Complete | Uses Tokens |
|-----------|-------|----------|-------------|
| Header.tsx | 215 | Complete | Yes (all Tailwind tokens) |
| Footer.tsx | 169 | Complete | Yes |
| Breadcrumb.tsx | 73 | Complete | Yes |
| TrustModule.tsx | 89 | Complete | Yes |
| SiteSettingsContext.tsx | 47 | Complete | N/A (context provider) |
| GoogleAnalytics.tsx | 22 | Complete | N/A |
| JsonLd.tsx | 14 | Complete | N/A |

**Homepage Components (9):**
| Component | Lines | Complete | Uses Tokens |
|-----------|-------|----------|-------------|
| HeroSection.tsx | 69 | Complete | Yes |
| TrustBar.tsx | 57 | Complete | Yes |
| ServicesSection.tsx | 108 | Complete | Yes |
| AboutSection.tsx | 70 | Complete | Yes |
| ProcessSection.tsx | 59 | Complete | Yes |
| TestimonialsSection.tsx | 100 | Complete | Yes |
| KnowledgePreview.tsx | 85 | Complete | Yes |
| FAQSection.tsx | 62 | Complete | Yes |
| CTASection.tsx | 47 | Complete | Yes |

**UI Primitives (12):**
| Component | Lines | Complete | Uses Tokens |
|-----------|-------|----------|-------------|
| Button.tsx | 35 | Complete | Yes |
| Card.tsx | 60 | Complete | Yes (⚠️ missing `id` prop on main) |
| SectionHeader.tsx | 35 | Complete | Yes |
| Accordion.tsx | 72 | Complete | Yes |
| CalloutBox.tsx | 20 | Complete | Yes |
| TagPill.tsx | 16 | Complete | Yes |
| LTR.tsx | 8 | Complete | N/A |
| WhatsAppCTA.tsx | 65 | Complete | Yes |
| PhoneCTA.tsx | 42 | Complete | Yes |
| RevealSection.tsx | 37 | Complete | N/A (motion wrapper) |
| RevealGroup.tsx | 28 | Complete | N/A |
| RevealItem.tsx | 20 | Complete | N/A |

**Icons (1):**
| Component | Lines | Complete |
|-----------|-------|----------|
| WhatsAppIcon.tsx | 18 | Complete |

**Page-specific client components (3):**
| Component | Lines | Complete |
|-----------|-------|----------|
| CategoryFilter.tsx | 98 | Complete ⚠️ broken on main (RSC boundary) |
| FAQAccordion.tsx | 42 | Complete |
| ContactForm.tsx | 180 | Complete |

### CMS Connection

**Sanity is fully configured:**
- Project ID: `ul4uwnp7`
- Dataset: `production`
- Client: CDN-backed, read-only, ISR 300s
- 14 GROQ queries centralized in `queries.ts`
- All schemas deployed (12 types)

**Content types with seed data:**
| Type | Has Seed Data | Count (approx) |
|------|---------------|-----------------|
| siteSettings | Yes | 1 (singleton) |
| service | Yes | 11 |
| category | Yes | 5 |
| author | Yes | 2 (אבי ביטן, רון ביטן) |
| homePage | Yes | 1 (singleton) |
| aboutPage | Yes | 1 (singleton) |
| faq | Yes | Multiple |
| testimonial | Yes | Multiple |
| article | Yes | Multiple |
| legalPage | Yes | 2 (privacy, terms) |
| contactLead | Accumulates | From form submissions |
| tag | Unknown | May be empty |

### Deployment

- **Platform:** Railway (Docker, `output: "standalone"`)
- **Dockerfile:** Multi-stage node:22-alpine build, present and complete
- **Auto-deploy:** On main merge (Railway watches GitHub)
- **Current deploy status:** ⚠️ BROKEN — main has 3 build errors (PR #36 fixes them, not yet merged)

**Env vars status:**
| Variable | Set in Railway | Set locally |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Assumed yes (was deploying) | Yes (.env.local) |
| `NEXT_PUBLIC_SANITY_DATASET` | Assumed yes | Yes (.env.local) |
| `SANITY_API_TOKEN` | Yes | Yes (.env.local) |
| `SANITY_REVALIDATE_SECRET` | Unknown | No |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Unknown | No |
| `NEXT_PUBLIC_GA4_ID` | Unknown | No |
| `NEXT_PUBLIC_SITE_URL` | Unknown | No |
| `RESEND_API_KEY` | **NOT SET** | No |
| `CONTACT_EMAIL_TO` | **NOT SET** | No |

---

## PART 2: MILESTONE AUDIT

### M1: Project Setup & Dev Environment ✅ Complete
- Next.js 15 App Router with TypeScript, Tailwind, standalone Docker output
- All tooling configured (ESLint, PostCSS, tsconfig)

### M2: Sanity CMS Integration ✅ Complete
- 12 schemas deployed (guide removed), embedded Studio at `/studio`
- Hebrew Studio navigation, desk structure configured
- Seed script creates services, categories, authors, settings

### M3: Design System & Tokens ✅ Complete
- `bitan-tokens.css` with 94 lines of CSS custom properties
- Tailwind config mirrors all token values
- `globals.css` imports tokens and sets base styles
- All 28 components use token classes (except justified exceptions)

### M4: RTL & Typography ✅ Complete
- `<html lang="he" dir="rtl">` in root layout
- Heebo font loaded via `next/font` with Hebrew + Latin subsets
- `<LTR>` wrapper component for phone/email/fax
- Logical properties used throughout (start/end, ps/pe, ms/me)
- No forbidden `left/right` CSS

### M5: Homepage ✅ Complete
- 9 section components: Hero, TrustBar, Services, About, Process, Testimonials, KnowledgePreview, FAQ, CTA
- All CMS-driven via `getHomePage()`, `getServices()`, `getTestimonials()`, `getFAQs()`, `getArticles()`
- Framer Motion animations with `RevealSection`/`RevealItem` wrappers

### M6: Inner Pages ✅ Complete
- About (7 sections, CMS with fallbacks)
- Services (grid + 11 detail pages via `generateStaticParams`)
- Knowledge Hub (category filter, load-more, article detail with related articles)
- FAQ (accordion, CMS-driven)
- Contact (form + map + info)
- Privacy & Terms (CMS `legalPage` type)

### M7: Responsive & Mobile ✅ Complete
- Mobile hamburger menu with slide-in animation
- Sticky mobile CTA bar (WhatsApp + Phone)
- `pb-[var(--mobile-cta-height)]` on `<main>` prevents content overlap
- Responsive grids: `md:grid-cols-2 lg:grid-cols-3` patterns throughout

### M8: Contact & Lead Capture ✅ Complete
- Contact form saves to Sanity `contactLead` type
- Email notification wired via Resend HTTP API (requires env vars)
- Email regex validates 2+ char TLD
- Hebrew form labels and error messages

### M9: Content Management ✅ Complete
- All page content editable via Sanity Studio at `/studio`
- ISR revalidation (5 min) + webhook for instant cache bust
- Singleton pages (home, about, settings) in desk structure
- `warnFallback()` alerts in dev when CMS data is missing

### M10: SEO & Analytics ✅ Complete
- Every page exports `metadata` / `generateMetadata`
- JSON-LD: Organization (layout), Article (knowledge detail), FAQPage (faq)
- BreadcrumbList JSON-LD on all inner pages via `<Breadcrumb>` component
- Dynamic `sitemap.xml` includes service detail pages
- `robots.txt` configured
- GA4 with 10 tracked events
- OG image from Sanity `siteSettings.ogImage`

### M11: QA ✅ Complete
- Comprehensive QA audit documented in `docs/qa-m11.md`
- All critical/high issues resolved in PR5 and site completion sprint

### M12: Launch Prep 🟡 Partial
**Done:**
- Placeholder favicon/app icons
- Error boundaries (error.tsx + global-error.tsx)
- Print stylesheet
- `.env.example` with all vars documented
- Dockerfile ready
- Redirect scaffold in `next.config.ts`

**Not done:**
- Real brand favicon and OG image (waiting on assets)
- Resend env vars not configured in Railway (email doesn't work)
- Safari/iOS testing not performed
- Legacy redirects not populated (need old URL list)
- PR #36 (build fix) not merged to main

---

## PART 3: DESIGN SYSTEM COMPLIANCE

### Token Import
**Yes — properly configured.** `globals.css` imports `../styles/bitan-tokens.css` at the top. CSS custom properties are globally available.

### Tailwind Configuration
**Fully integrated.** `tailwind.config.ts` mirrors every token from `bitan-tokens.css`:
- Colors: primary, gold, surface, callout, border, text-secondary, text-muted
- Font: heebo family
- Font sizes: h1–h4, body-lg/body/body-sm, caption, nav
- Spacing: space-1 through space-12
- Border radii: sm/md/lg/xl/pill
- Shadows: sm/md/lg/xl
- Transitions: fast/base/slow
- Max-widths: content (1200px), narrow (800px)

### Component Token Compliance (5-component sample)

| Component | Verdict | Notes |
|-----------|---------|-------|
| Header.tsx | ✅ Compliant | All Tailwind tokens: text-primary, gap-space-5, duration-base |
| Footer.tsx | ✅ Compliant | text-body-sm, gap-space-8, border-border |
| HeroSection.tsx | ✅ Compliant | text-white, py-space-9, max-w-narrow |
| ServicesSection.tsx | ✅ Compliant | gap-space-5, bg-primary/10, text-h4 |
| contact/page.tsx | ⚠️ Partial | 5 hardcoded hex values for third-party brand colors (Waze #30B6FC, Google Maps #4285F4, #EA4335) |

### Hardcoded Hex Colors (all instances)

| File | Color | Reason | Acceptable? |
|------|-------|--------|-------------|
| contact/page.tsx | #EA4335, #4285F4 | Google Maps SVG icon fills | Yes (brand) |
| contact/page.tsx | #30B6FC, #1DA1E6 | Waze button colors | Yes (brand) |
| contact/page.tsx | #4285F4 | Google Maps button border | Yes (brand) |
| knowledge/page.tsx | #1a3a5c, #2d5a87, etc. (8 total) | Category gradient variants | Debatable — could be tokenized |
| global-error.tsx | #1B2A4A, #64748B | Inline styles (emergency fallback, no CSS available) | Yes (necessary) |
| lib/email.ts | #1B2A4A, #E2E0DB | Email HTML template (inline styles required) | Yes (email standard) |

### RTL Setup
**Correct:**
- `<html lang="he" dir="rtl">` ✅
- Heebo font loaded with `subsets: ['hebrew', 'latin']` ✅
- Body defaults to RTL text alignment ✅
- `<LTR>` wrapper for phone/email/fax numbers ✅
- Logical properties only (no left/right) ✅

### Gold Ratio
**Respected.** Gold (#C5A572) is used for:
- `.gold-underline` (3px decorative line under headings)
- Focus ring outline
- CTA hover states
- "קראו עוד" link text
- One WhatsApp CTA button per viewport

No gold backgrounds, no gold-heavy sections. Estimated visual weight: ~5-8%.

---

## PART 4: BROKEN / BLOCKED / DEBT

### Build Errors (on main, fixed in PR #36)

1. **`src/app/error.tsx:41`** — ESLint `no-html-link-for-pages`: uses `<a>` instead of `<Link>` for home navigation
2. **`src/components/ui/Card.tsx`** — TypeScript error: `id` prop passed to `<Card>` in services/page.tsx but not in CardProps type
3. **`src/app/knowledge/page.tsx`** — RSC serialization error: `renderArticle` and `renderFallback` functions passed to client component `KnowledgeFilterable`

**All 3 fixed in PR #36** (branch `claude/site-completion-sprint-Ef4is`, commit `d282309`).

### Known Bugs / Regressions
- **Build is broken on main** until PR #36 is merged
- **Email notifications don't work** — Resend env vars not set in Railway

### TODO/FIXME/HACK Comments
**Zero.** No TODO, FIXME, or HACK comments found in any `.ts` or `.tsx` file.

### Console Statements
All 4 console calls are appropriate:
| File | Type | Guarded |
|------|------|---------|
| error.tsx | `console.error()` | Error boundary (intentional) |
| global-error.tsx | `console.error()` | Root error boundary (intentional) |
| api/contact/route.ts | `console.error()` | Dev-only (NODE_ENV check) |
| fallback-warning.ts | `console.warn()` | Dev-only (NODE_ENV check) |

### Files Over 300 Lines (refactoring candidates)
| File | Lines | Issue |
|------|-------|-------|
| `src/app/about/page.tsx` | 557 | ~155 lines of hardcoded fallback data. Could move fallbacks to a separate file. |
| `src/app/knowledge/[slug]/page.tsx` | 324 | Article detail + JSON-LD + related articles. Acceptable complexity. |
| `src/sanity/queries.ts` | 316 | 14 GROQ queries. Centralized by design. Fine. |

### Hardcoded Content That Should Be CMS-Driven
| File | What | Lines | Impact |
|------|------|-------|--------|
| about/page.tsx | Partner bios, differentiators, audience cards, process steps, values | ~155 lines | These ARE CMS-driven via `aboutPage` schema — fallbacks only show when CMS is empty |
| knowledge/page.tsx | 6 fallback article cards | ~8 lines | Only show when no articles in Sanity |
| Several pages | Hebrew UI labels (button text, section headers) | Scattered | These are UI chrome, not content — CMS-driven would be over-engineering |

---

## PART 5: CONTENT STATE

### Sanity CMS Content

| Content Type | Count | Completeness |
|-------------|-------|-------------|
| siteSettings | 1 | Full — phone, WhatsApp, email, address, hours, social links, CTA labels |
| service | 11 | Full — all have title, slug, shortDescription, icon, body |
| category | 5 | Full — מס הכנסה, מע"מ, ביטוח לאומי, חברות, שכר |
| author | 2 | Full — אבי ביטן, רון ביטן (isPartner: true) |
| homePage | 1 | Full — hero, trust points, about, process, CTA content |
| aboutPage | 1 | Full — story, differentiators, audience, process, values |
| faq | Multiple | Seeded, functional |
| testimonial | Multiple | Seeded, functional |
| article | Multiple | Seeded (Content Factory can push more via write API) |
| legalPage | 2 | Privacy policy + terms of use |
| contactLead | Accumulates | From live form submissions |
| tag | Unknown | May be empty — tags are optional on articles |

### Hardcoded Frontend Content
- **about/page.tsx fallbacks** — 155 lines of fallback data (partners, differentiators, audience, process, values). Only renders when CMS `aboutPage` fields are empty.
- **knowledge/page.tsx fallbacks** — 6 placeholder article cards. Only render when no articles exist in Sanity.
- All other pages render CMS content or show empty states.

### Example PDFs (הוראת שעה + חוזר מקצועי)
**Not present anywhere.** The spec PDF `m5-1-motion-polish-spec.md.pdf` was removed from `/public` during the sprint. No example tax PDFs exist in the codebase or CMS. If these are intended as sample articles, they would need to be created as `article` documents in Sanity.

---

## PART 6: WHAT THE PLANNER NEEDS TO KNOW

### Critical Blockers
1. **Main is broken.** PR #36 must be merged before any new work or deployment. The 3 errors are trivial fixes already done.
2. **Email is dead.** Contact form saves to Sanity but sends no email. Needs `RESEND_API_KEY` + `CONTACT_EMAIL_TO` set in Railway. This is a config task, not code.

### Architecture Quality
The codebase is clean and well-structured for v1:
- Clear separation: pages fetch data server-side, components are presentational
- CMS is source of truth for all content, with dev-mode warnings when fallbacks activate
- Design tokens flow: `bitan-tokens.css` → Tailwind config → component classes
- No dead code, no TODO debt, no unused dependencies

### Patterns That Should Carry Forward
- **Server components by default**, `'use client'` only for interactivity (4 client components total)
- **Centralized queries** in `queries.ts` — never inline GROQ
- **Centralized types** in `types.ts` — mirrors query projections
- **Logical CSS properties** only (start/end, never left/right)
- **`warnFallback()`** on any page with hardcoded data
- **ISR 300s** as default, webhook for instant revalidation

### Patterns That May Need Rethinking for V2
- **about/page.tsx at 557 lines** — if more complex pages are coming, establish a pattern for splitting page sections into separate files (the homepage already does this well with `components/homepage/`)
- **No i18n infrastructure** — if English support is ever needed, there's no framework in place
- **Client-side article filtering** — works for <50 articles. For scale, needs server-side pagination with URL search params
- **No testing** — zero tests exist. If v2 adds complexity (calculators, forms, dashboards), test infrastructure should be considered
- **No CI/CD pipeline** — no GitHub Actions for lint/build/test checks on PRs

### Performance Notes
- First Load JS: 102 kB shared, pages range 162–228 kB (good)
- Studio bundle: 1.61 MB (expected, only loaded at `/studio`)
- Images served via Sanity CDN with responsive `sizes` attributes
- Framer Motion animations respect `prefers-reduced-motion` via `RevealSection`

### What's Actually Missing for Production Launch
1. Merge PR #36 (build fix)
2. Set Resend env vars in Railway
3. Replace placeholder favicon/OG image with real brand assets
4. One Safari/iOS sanity check
5. That's it. The site is functionally complete.

---

## PART 8: V3 READINESS AUDIT

### Knowledge Center Filter State

**Category filtering exists, works, and is CMS-wired.**

- Implementation: `src/app/knowledge/CategoryFilter.tsx` (client component, `'use client'`)
- Categories fetched from Sanity via `getCategories()` GROQ query in the server component
- Filter pills render dynamically: "הכל" (all) + all CMS categories
- Clicking a pill filters articles client-side by `category._id` match
- `trackCategoryFilter()` fires GA4 event on selection
- Load-more pagination: PAGE_SIZE=12, shows remaining count

**What breaks:**
- On `main` branch: the knowledge page has a build error (render props crossing RSC boundary). Fixed in PR #36.
- If Sanity has 0 categories, filter bar shows only "הכל" pill — works but looks sparse.
- Client-side filtering won't scale past ~50 articles (all articles loaded at once). Server-side pagination with URL params needed for growth.

### Service Content Inventory

**11 services exist in Sanity** (beyond the original 7 in the master plan). All are CMS-driven, all have detail pages via `/services/[slug]`.

Generated service detail pages (from build output):
| # | Service (Hebrew slug) | Has Detail Page | Source |
|---|----------------------|-----------------|--------|
| 1 | החזר-מס-שבח | Yes | CMS |
| 2 | ניהול-דיונים-מול-רשויות-המס | Yes | CMS |
| 3 | החזרי-מס | Yes | CMS |
| 4 | +8 more paths | Yes | CMS |

All services have: `title`, `slug`, `shortDescription`, `icon`, `body` (Portable Text), `order`.
The `image` field exists on the schema but may not be populated for all services.
Services listing page at `/services` renders a card grid from CMS data — no hardcoded fallback for services.

### Image / Media State

**Images in the repo:**
| File | What | Real or Placeholder |
|------|------|-------------------|
| `public/logo.png` | Site logo | Real |
| `public/logo-backup.png` | Logo backup | Real |
| `src/app/icon.svg` | Favicon | Placeholder ("בב" text) |
| `src/app/apple-icon.svg` | Apple touch icon | Placeholder ("בב" text) |

**No partner photos in the repo.** Partner images are handled via Sanity `author.image` field. Whether real photos exist in Sanity depends on CMS content.

**Sanity image management:**
- 6 schemas have image fields with `hotspot: true`: article (mainImage + body images), author, service, testimonial, siteSettings (logo, ogImage)
- `alt` text is defined as a field on article `mainImage` but NOT on all image fields
- Image URL builder in `src/sanity/image.ts` constructs CDN URLs manually with width/format params
- Frontend uses `next/image` with Sanity CDN URLs and responsive `sizes` attributes

### Redirect Infrastructure

**Scaffold exists, nothing populated.**

- `next.config.ts` has `async redirects()` returning an empty array
- Comment says: "Legacy URL patterns — add redirects here when replacing an existing site"
- No middleware.ts exists
- No redirect mapping files
- No old URL data anywhere in the repo

### Content Duplication / Quality Flags

**"יחס אישי" (personal attention)** — appears exactly once in the codebase: `about/page.tsx:432` as a fallback differentiator title. However, this value proposition likely appears in CMS content too (siteSettings, homePage, etc.). The CMS is the source of truth; any duplication would be in Sanity data, not in code.

**English text that should be Hebrew:**
- `Header.tsx:200` — Sticky mobile CTA button text says `WhatsApp` in English. This is intentional (brand name), but could be `וואטסאפ` if Hebrew consistency is preferred.
- Contact form placeholders use Hebrew except `example@email.com` (line 212) and `050-000-0000` (line 182) — these are appropriate in their respective formats.

**No lorem/placeholder text found.** All visible content is real Hebrew or real brand content.

**No unedited AI output detected** in the frontend code. All Hebrew content reads naturally.

### WordPress Migration Prep

**Zero WordPress references.** No WP export files, no URL mapping, no migration scripts, no references to WordPress, wp-content, or any old site structure anywhere in the repo or docs.

If replacing an existing WordPress site, the entire migration effort (URL mapping, content extraction, redirect rules) would need to start from scratch.

### Mobile Sticky CTA Bar

**Exists, works, and is fully wired.**

- Location: `src/components/Header.tsx:182–212`
- Shows on mobile only (`md:hidden`), appears after scrolling past hero (`showStickyCTA` state)
- Animated entry/exit via Framer Motion (slides up from bottom)
- Two buttons: WhatsApp (gold, `bg-gold`) + Phone (navy, `bg-primary`)
- **Analytics wired:** `trackWhatsAppClick('header_sticky')` and `trackPhoneClick('header_sticky')` fire on click
- Contact info pulled from `SiteSettingsContext` (CMS-driven)
- `<main>` has `pb-[var(--mobile-cta-height)] md:pb-0` to prevent content overlap
- Fixed positioning: `fixed bottom-0 inset-x-0 z-40`
