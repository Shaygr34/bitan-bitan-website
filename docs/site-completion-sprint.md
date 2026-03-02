# Site Completion Sprint — Prioritized Task List
**Date:** 2026-03-02
**Branch:** `claude/build-m1-hebrew-rtl-Wx6yk`

---

## How This Is Organized

**Tier 1 — Site Polish & Touch-Ups** (things that ARE on the site but incomplete, broken, or missing)
These are the top priority. A visitor or Google crawler would notice these gaps TODAY.

**Tier 2 — Missing Features** (things the site doesn't have yet but should)
Important for full functionality, but the site can technically launch without them.

**Tier 3 — Code Hygiene & DX** (cleanup, dead code, dev experience)
Won't affect users but will affect maintainability and next developer's life.

---

## Tier 1 — Site Polish & Touch-Ups

| # | Task | What's Wrong | Where | Severity |
|---|------|-------------|-------|----------|
| 1 | **Add favicon & app icons** | No favicon.ico, apple-touch-icon, or PWA manifest. Browser shows generic icon, no home screen icon. | `/public/` + `layout.tsx` metadata | HIGH |
| 2 | **Wire site-wide OG image** | `siteSettings.ogImage` field exists in Sanity schema but is **never read** in `layout.tsx` metadata. Social shares show no image. | `src/app/layout.tsx` + `siteSettings` schema | HIGH |
| 3 | **Move Google Maps API key to env var** | API key `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8` is hardcoded in source code (client-visible). Can be rate-limited or abused. | `src/app/contact/page.tsx:36` | HIGH |
| 4 | **Remove or gate `/dev` page** | QA component catalog page is accessible in production. Has `href="#"` demo links. Should not ship. | `src/app/dev/page.tsx` | MEDIUM |
| 4b | **Remove spec PDF from `/public`** | `m5-1-motion-polish-spec.md.pdf` (942KB) is a dev spec doc sitting in the public directory — publicly downloadable by anyone. | `public/m5-1-motion-polish-spec.md.pdf` | MEDIUM |
| 5 | **Add error boundaries** | No `error.tsx` anywhere. If a page component crashes, user sees raw Next.js error instead of branded fallback. | `src/app/error.tsx` (create) | MEDIUM |
| 6 | **Fix email validation regex** | Contact form regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` accepts `a@b.c`, consecutive dots, single-char domains. Too permissive. | `src/app/contact/ContactForm.tsx:26` | MEDIUM |
| 7 | **Tighten fallback content strategy** | 6 pages have extensive hardcoded fallback data (services, FAQ, about, knowledge, testimonials). These mask Sanity data issues — if CMS is empty, site looks "full" with fake data. | Multiple page.tsx files | MEDIUM |
| 8 | **Fix mobile CTA bar content overlap** | Sticky mobile CTA bar at bottom can overlap page content on small screens. Missing bottom padding to account for fixed bar height. | `src/components/Header.tsx:186-216` + page layouts | LOW |
| 9 | **Hardcoded header height in category filter** | `top-[56px] md:top-[72px]` — if header height ever changes, Knowledge hub filter bar breaks. Should use CSS variable. | `src/app/knowledge/CategoryFilter.tsx:53` | LOW |
| 10 | **Print stylesheet incomplete** | Only article detail has `print-show` class. No comprehensive print CSS (hide nav, CTA buttons, optimize colors, show URLs). | Global CSS / article page | LOW |

---

## Tier 2 — Missing Features

| # | Task | Description | Impact | Effort |
|---|------|------------|--------|--------|
| 11 | **Contact form email delivery** | Form saves to Sanity `contactLead` but sends NO email. Founders must check Studio manually. Users get no confirmation email. | CRITICAL — blocking for real lead capture | Medium |
| 12 | **Service detail pages** (`/services/[slug]`) | No individual service pages. Cards link to `/contact` or anchor `#service-{slug}`. Visitors can't read detailed service descriptions. | HIGH — hurts SEO and conversion | Medium |
| 13 | **Breadcrumb navigation** | Inner pages (articles, about, services) have no breadcrumb trail. Hurts UX and misses BreadcrumbList JSON-LD for SEO. | MEDIUM | Low |
| 14 | **Article pagination / load-more** | All articles in flat grid. Fine for <20 but won't scale. Knowledge hub will break visually at ~30+ articles. | MEDIUM — becomes urgent when Content Factory starts | Low |
| 15 | **Guide pages or merge into articles** | `guide` schema exists in Sanity but has zero frontend routes. Content Factory can't publish guides. Either build `/guides/[slug]` or consolidate into article type with a `contentType` field. | LOW until Content Factory needs it | Low |
| 16 | **Legacy redirect rules** | No `redirects()` in `next.config.ts`. If the firm had a previous site, old URLs will 404. | MEDIUM if replacing existing site | Low |
| 17 | **Safari/iOS testing pass** | Code uses all standard APIs but has never been tested on real Apple devices. | LOW — likely works, but unverified | Manual |

---

## Tier 3 — Code Hygiene & DX

| # | Task | What's Wrong | Where |
|---|------|-------------|-------|
| 18 | **Remove unused `@sanity/image-url` dependency** | Listed in package.json but never imported. Custom `urlFor()` is built manually in `src/sanity/image.ts`. | `package.json` |
| 19 | **Remove or implement guide schema** | `guide.ts` is in schema index but has no queries, no routes, no links anywhere. Dead code. | `src/sanity/schemas/guide.ts` |
| 20 | **Remove CategoryFilter stub** | `CategoryFilter` function exists but returns `null` with comment "not used standalone". | `src/app/knowledge/CategoryFilter.tsx` |
| 21 | **Extract inline SVG icons to shared components** | WhatsApp, Waze, Google Maps SVGs are copy-pasted across Header, Footer, ContactForm, contact/page.tsx. | Multiple files → `src/components/icons/` |
| 22 | **Remove console.error from API route** | `console.error('Contact form error:', err)` in production. Should use structured logging or remove. | `src/app/api/contact/route.ts:45` |
| 23 | **Create `.env.example`** | No environment variable template. Next developer has to read CLAUDE.md to know what's needed. | Project root |
| 24 | **Extract magic numbers to constants** | Header scroll threshold (600px), debounce values, stagger delays all hardcoded inline. | Header.tsx, various motion configs |
| 25 | **Add missing analytics events** | Category filter selections, related article clicks, print actions, social media clicks not tracked. | `src/lib/analytics.ts` |

---

## Recommended Sprint Order

**If you have ONE session:** Do #1-6 (polish) + #11 (email) + #18-23 (cleanup) = ship-ready site.

**If you have TWO sessions:**
- Session A: #1-10 (all polish) + #18-23 (cleanup)
- Session B: #11-17 (all features)

**If you have THREE sessions:**
- Session A: #1-6 (critical polish) + #11 (email delivery)
- Session B: #7-10 (remaining polish) + #12-13 (service pages + breadcrumbs)
- Session C: #14-17 (remaining features) + #18-25 (all cleanup)
