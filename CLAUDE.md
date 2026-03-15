# Bitan & Bitan Website — ביטן את ביטן

## Project
CPA firm website. Hebrew RTL, B2B audience. Live on Railway.
Repo: bitan-bitan-website | Branch: main | Auto-deploy: Railway watches main

## Stack
Next.js 15 · React 19 · Tailwind 3 · Sanity v3 · Framer Motion · TypeScript
Deploy: Railway (Docker, standalone output)
CMS: Sanity project ul4uwnp7, dataset production

## Current State (V3.5 — March 11, 2026)

### Content
- 80 articles in Sanity — ALL with AI-generated images (100% coverage)
  - ~27 Wayback batch 1 + 26 WP REST API batch 2 + 15 PDFs + 2 Bitan Finance + ~10 original
  - 5 mismatched articles deleted from batch 2 (wrong WP content via alt-search)
  - 7 unmatched articles not found in WP (skipped — may be from different WP site)
- 28+ FAQs with client-side search bar
- 11 services — unique body content, all enriched with processSteps, targetAudience, faqs, ALL with AI-generated header images
- 7 parent categories + 10 subcategories — two-row filter UI with mobile fade gradients
- 124 redirects in next.config.ts (old WP URLs → new articles + catch-alls)
- Elfsight All-in-One Reviews widget on homepage (Google + Facebook reviews)
- 14 testimonial docs in Sanity (backup, not rendered — Elfsight replaced them)
- Client logo conveyor belt — hidden when no real logos exist (returns null), real logos pending
- Newsletter signup collecting to Sanity (compact on /knowledge, full on /knowledge/[slug])

### Newsletter System
- Summit CRM (app.sumit.co.il) handles email distribution
- 3 branded HTML email templates in outputs/:
  - newsletter-1-article.html (new article notification)
  - newsletter-2-update.html (professional update)
  - newsletter-3-custom.html (free-form custom)
- Templates use navy #102040 header, gold #C5A572 CTA, RTL Hebrew, inline styles, table-based
- Summit supports raw HTML paste via hidden htmleditor-html input
- Phase 2: Resend API for automated sends on article publish (website subscribers)

### Image Generation
- Script: scripts/generate-article-images.mjs (Gemini)
- Env: GOOGLE_AI_API_KEY (set via env var when running, not in .env.local)
- Brand template: navy #102040 dominant, gold #C5A572 accents, category-specific visual elements
- Run for missing images: `GOOGLE_AI_API_KEY=<key> node scripts/generate-article-images.mjs --upload`
- Also needs SANITY_API_TOKEN env var for upload phase

### DNS Migration (Ready)
- Email: Google Workspace (MX → aspmx.l.google.com) — NOT on cPanel
- Only change: A record (bitancpa.com) + CNAME (www) → Railway
- DO NOT touch: MX, SPF, DKIM, TXT records
- cPanel: cpanel.bitancpa.com, Zone Editor available
- Server IP: 185.145.252.165
- Fresh backup: March 10, 2026 19:01

### WordPress (Old Site)
- WP admin accessible: bitancpa.com/wp-admin
- Plugin fix: viplus renamed to viplus_disabled
- REST API works: /wp-json/wp/v2/posts
- 210 total posts (195 published, 15 draft), Nov 2016 – Jan 2020
- All high-value articles already migrated

### Site Features
- Knowledge Center: server-side filtering (URL params), subcategory drill-down, client-side search, pagination 12/page
- PDF download system: downloadableFile + contentType fields, gold download button on article page, badges on cards
- About page: fully CMS-editable (13 fields) — no hardcoded Hebrew
- Trust bar: 30+ שנות ניסיון · דור שני · רו"ח + משפטנים · תל אביב
- Homepage scroll journey: Hero → TrustBar → Services → About → Process → Testimonials (Elfsight) → Knowledge Preview → TrustModule → FAQ → CTA → Footer
- Branded OG image (1200x630) generated with sharp + real logo
- All tel: links use +972 international format
- Homepage service cards deep-link to /services/[slug]
- Parent category articleCount includes subcategory articles
- FAQ page has client-side search/filter bar with debounce (FAQFilterable component)
- ISR 300s + Sanity webhook revalidation working
- CMS fully editable in Sanity Studio at /studio
- Logo hosted at: https://bitan-bitan-website-production.up.railway.app/logo-light.png (white+gold on transparent, for dark bg)

## Schemas (15)
article (with downloadableFile/contentType) · author · category (with parent self-reference for subcategories) · tag · service (with processSteps/targetAudience/faqs) · faq · testimonial · contactLead · homePage · aboutPage · legalPage · siteSettings · clientLogo · teamMember · newsletterSubscriber

## Key Conventions
- Server components default, 'use client' only for interactivity
- GROQ queries centralized in src/sanity/queries.ts
- Types centralized in src/sanity/types.ts
- Tokens: bitan-tokens.css → Tailwind config → classes
- Logical CSS only (start/end, never left/right)
- English slugs for all URLs
- Hebrew UI throughout
- Singletons use exact _id: homePage, aboutPage, siteSettings
- Categories support parent-child hierarchy (one level deep)
- Knowledge Center page is Dynamic (reads searchParams for filtering)

## Key Files
- src/app/(site)/page.tsx — Homepage with all sections
- src/app/(site)/knowledge/page.tsx — Dynamic, server-side filtering via searchParams
- src/app/(site)/knowledge/CategoryFilter.tsx — Two-row parent/subcategory pills, URL-based
- src/app/(site)/knowledge/Pagination.tsx — Page-based with ellipsis
- src/components/KnowledgeSearch.tsx — Client-side search with keyboard nav, ARIA combobox
- src/components/homepage/ClientLogosSection.tsx — CSS scroll-left/scroll-right conveyor belt
- src/components/homepage/HeroSection.tsx — Hero with CTA buttons
- src/components/homepage/TestimonialsSection.tsx — Elfsight widget wrapper
- src/components/Header.tsx — Sticky header + mobile hamburger + sticky CTA bar
- src/components/Footer.tsx — 3-column footer
- src/sanity/deskStructure.ts — Hierarchical Studio nav with parent→subcategory drill-down
- src/sanity/queries.ts — All GROQ queries including getFilteredArticles with parent/child category support
- src/sanity/types.ts — TypeScript types mirroring query projections
- src/components/NewsletterSignup.tsx — Newsletter form (compact/full modes, category pills, Framer Motion)
- src/app/api/newsletter/route.ts — POST handler (email validation, dupe check, Sanity create)
- src/lib/analytics.ts — GA4 event helpers including trackKnowledgeSearch, trackNewsletterSignup
- src/lib/site-url.ts — Canonical URL resolution (auto-prefixes https://)
- src/components/TeamSection.tsx — Team members grid on About page (accepts title/subtitle props)
- src/app/(site)/faq/FAQFilterable.tsx — Client-side FAQ search with debounce, PortableText text extraction
- scripts/generate-article-images.mjs — Gemini image generation + Sanity upload
- scripts/generate-service-images.mjs — Gemini service header image generation + Sanity upload
- scripts/upload-pdf-articles.mjs — PDF upload + article creation script
- scripts/migrate-batch2.mjs — WP REST API batch 2 migration (38 articles, 31 matched)
- scripts/generate-og-image.mjs — Branded OG image with sharp + real logo
- assets/pdfs/ — 15 PDF guides/circulars (source files)
- docs/wp-migration/batch2-raw-articles.json — Raw WP API data (195 posts)
- outputs/newsletter-1-article.html — Article announcement email template
- outputs/newsletter-2-update.html — Professional update email template (multi-paragraph, editable)
- outputs/newsletter-3-custom.html — Fully custom email template (free-form, bullet list, sign-off)
- tailwind.config.ts — Full token integration + scroll-left/scroll-right keyframes

## Env Vars (Railway)
Set: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN (note: Railway uses this name)
Set: NEXT_PUBLIC_SITE_URL = https://bitancpa.com (must include protocol)
Set: NEXT_PUBLIC_GOOGLE_MAPS_KEY
Set: SANITY_REVALIDATE_SECRET (must match Sanity webhook)
Set: NEXT_PUBLIC_GA4_ID
NOT SET: RESEND_API_KEY (contact form email doesn't send)
NOT SET: CONTACT_EMAIL_TO
Note: API routes use `process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN` for local/prod compat
Note: GOOGLE_AI_API_KEY set via env var when running image scripts, not stored in .env.local

## Pre-Launch Checklist
- [ ] Partner photos (waiting on founders to identify IMG numbers)
- [ ] Summit mailing lists (חברות בע"מ + עצמאים) — manual setup
- [ ] Summit template import (paste HTML)
- [ ] DNS cutover (2 records in Zone Editor: A + CNAME → Railway)
- [ ] Final Chrome QA
- [ ] Avi/Ron content approval
- [ ] First newsletter send

## Known Issues
- Contact form email doesn't send (Resend env vars missing)
- Partner photos are placeholder silhouettes (pending from founders)
- Client logos hidden (section returns null until real logos added)
- Team member photos are placeholders (pending from firm)
- Google Maps on /contact may show rejection if API key referrer not configured for domain
- No tests, no CI/CD

## Not In Scope
No client login · No payments · No i18n
Content Factory is a SEPARATE repo (apps/os-hub) — not this project
