# Bitan & Bitan Website — ביטן את ביטן

## Project
CPA firm website. Hebrew RTL, B2B audience. **LIVE at bitancpa.com** (DNS cutover complete, old WP wiped).
Repo: bitan-bitan-website | Branch: main | Auto-deploy: Railway watches main

## Stack
Next.js 15 · React 19 · Tailwind 3 · Sanity v3 · Framer Motion · TypeScript
Deploy: Railway (Docker, standalone output)
CMS: Sanity project ul4uwnp7, dataset production

## Current State (V3.7 — March 18, 2026)

### Content
- ~72 articles in Sanity — ALL with AI-generated images (100% coverage)
  - ~27 Wayback batch 1 + 26 WP REST API batch 2 + 15 PDFs + 2 Bitan Finance + ~10 original
  - 7 חרבות ברזל grant articles recovered from Wayback Machine (Elementor pages, Nov 2023 snapshots)
  - 1 שאגת הארי new article + 1 חל"ת שאגת הארי article
  - Ron deleted 15 blank articles (WP stubs with no body content)
  - 3 unrecoverable חרבות ברזל articles deleted (Wayback only captured sidebar HTML)
- 28+ FAQs with client-side search bar
- 11 services — unique body content, all enriched with processSteps, targetAudience, faqs, ALL with AI-generated header images
- 7 parent categories + 10 subcategories — two-row filter UI with "כללי" pill for uncategorized parent articles, mobile fade gradients
- 139+ redirects in next.config.ts (old WP URLs → new articles + חרבות ברזל specific redirects)
- Elfsight All-in-One Reviews widget on homepage (Google + Facebook reviews)
- 14 testimonial docs in Sanity (backup, not rendered — Elfsight replaced them)
- Client logo conveyor belt — hidden when no real logos exist (returns null), real logos pending
- Newsletter signup collecting to Sanity (compact on /knowledge, full on /knowledge/[slug]), defaults to all categories selected

### Schema Changes (V3.7)
- **Multi-category articles**: `categories` array field (was singular `category`). Old field hidden, GROQ uses `select()` fallback. Migration script: `scripts/migrate-categories.mjs`
- **Multi-author articles**: `authors` array field (was singular `author`). Old field hidden, GROQ uses `select()` fallback. Migration script: `scripts/migrate-authors.mjs`
- **Hyperlinks in Portable Text**: `link` annotation with `href` (url, allowRelative) + `openInNewTab` toggle. Hebrew label "קישור". Renderer auto-detects external vs internal links.
- **Text color annotation**: `textColor` annotation with dropdown (אדום/זהב/כחול/ירוק). Single toolbar button, not individual decorators.
- **Body validation**: `min(1)` on body field — prevents publishing articles with no content.
- All GROQ queries (8 total) updated with dual-field fallback for both categories and authors.

### Image Generation
- Script: scripts/generate-article-images.mjs (Gemini)
- Recovery: scripts/recover-iron-swords.mjs (Wayback scrape + Gemini Imagen 4)
- Env: GOOGLE_AI_API_KEY (set via env var when running, not in .env.local)
- **Imagen 4**: `imagen-4.0-fast-generate-001` (Imagen 3 deprecated)
- Brand template: navy #102040 dominant, gold #C5A572 accents, category-specific visual elements
- **New style** (V3.7): Painterly watercolor editorial style, NO text/numbers/Hebrew in prompts to avoid gibberish
- Run for missing images: `GOOGLE_AI_API_KEY=<key> SANITY_API_TOKEN=<token> node scripts/generate-article-images.mjs --upload`

### Newsletter System
- Summit CRM (app.sumit.co.il) handles email distribution
- 3 branded HTML email templates in outputs/:
  - newsletter-1-article.html (new article notification)
  - newsletter-2-update.html (professional update)
  - newsletter-3-custom.html (free-form custom)
- Templates use navy #102040 header, gold #C5A572 CTA, RTL Hebrew, inline styles, table-based
- Summit supports raw HTML paste via hidden htmleditor-html input
- Phase 2: Resend API for automated sends on article publish (website subscribers)

### WordPress (Old Site) — WIPED
- DNS cutover complete — bitancpa.com points to Railway
- Old WP site no longer accessible
- WP REST API gone — all migration data preserved in docs/wp-migration/
- Wayback Machine snapshots used for חרבות ברזל article recovery
- **Lesson learned**: WP Elementor pages store content in meta fields, not post_content — Wayback scraper saw 0 words

### Site Features
- Knowledge Center: server-side filtering (URL params), subcategory drill-down with "כללי" pill (?sub=direct), client-side search, pagination 12/page
- PDF download system: downloadableFile + contentType fields, gold download button on article page, badges on cards
- About page: fully CMS-editable (13 fields) — no hardcoded Hebrew
- About page team: 3:4 portrait cards with rounded-2xl, partner/team hierarchy, hover zoom effect
- Team photos: 10 members with AI-generated headshots (rembg → Gemini grey gradient backgrounds)
- Trust bar: 30+ שנות ניסיון · דור שני · רו"ח + משפטנים · תל אביב (with animated counters)
- Homepage scroll journey: Hero → TrustBar → Services → About → Process → Testimonials (Elfsight) → Knowledge Preview → TrustModule → FAQ → CTA → Footer
- Branded OG image (1200x630) generated with sharp + real logo
- All tel: links use +972 international format
- Homepage service cards deep-link to /services/[slug]
- Parent category articleCount includes subcategory articles (multi-category aware)
- FAQ page has client-side search/filter bar with debounce (FAQFilterable component)
- ISR 300s + Sanity webhook revalidation working
- CMS fully editable in Sanity Studio at /studio
- Logo hosted at: https://bitan-bitan-website-production.up.railway.app/logo-light.png (white+gold on transparent, for dark bg)

### UX Polish (V3.6)
- Floating WhatsApp button: fixed bottom-left, green pulse glow, respects mobile CTA bar
- Navbar blur transition: glass morphism at 80px scroll, logo crossfade (dark→light), nav text color swap
- Page transitions: CSS `key={pathname}` remount, 400ms fade+slide entrance
- Hero stagger animations: CSS-only `nth-child` delays on all subpage heroes (8 pages)
- Scroll reveal animations: RevealSection/RevealGroup/RevealItem (Framer Motion whileInView)
- Gold diamond bullet points: CSS `::before` pseudo-elements on footer, services, prose content
- Logo crossfade: both logos rendered absolutely, opacity swap (no size jump — canvases matched)

## Schemas (15)
article (with downloadableFile/contentType/categories[]/authors[]/body with link+textColor annotations) · author · category (with parent self-reference for subcategories) · tag · service (with processSteps/targetAudience/faqs) · faq · testimonial · contactLead · homePage · aboutPage · legalPage · siteSettings · clientLogo · teamMember · newsletterSubscriber

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
- **Multi-field backward compat pattern**: new array fields (categories[], authors[]) + hidden old singular fields + GROQ `select(defined(new) => new[]->..., defined(old) => [old->...], [])` fallback
- **Hebrew redirects in next.config.ts**: MUST use percent-encoded URLs in `source` (raw Hebrew chars don't match)

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
- src/sanity/queries.ts — All GROQ queries (8 article queries with dual-field fallback)
- src/sanity/types.ts — TypeScript types mirroring query projections
- src/components/NewsletterSignup.tsx — Newsletter form (compact/full modes, category pills, Framer Motion)
- src/app/api/newsletter/route.ts — POST handler (email validation, dupe check, Sanity create)
- src/lib/analytics.ts — GA4 event helpers including trackKnowledgeSearch, trackNewsletterSignup
- src/lib/site-url.ts — Canonical URL resolution (auto-prefixes https://)
- src/components/TeamSection.tsx — Team members grid on About page (3:4 portrait cards, accepts title/subtitle props)
- src/components/WhatsAppButton.tsx — Floating WhatsApp button with pulse glow
- src/components/PageTransition.tsx — Global page entrance animation (key={pathname} remount)
- src/components/AnimatedCounter.tsx — Number counter with ease-out curve, triggered by useInView
- src/components/FadeIn.tsx — Lightweight scroll fade-in wrapper (useInView + CSS transition)
- src/hooks/useInView.ts — IntersectionObserver hook (threshold, triggerOnce, rootMargin)
- src/app/(site)/faq/FAQFilterable.tsx — Client-side FAQ search with debounce, PortableText text extraction
- scripts/generate-article-images.mjs — Gemini image generation + Sanity upload
- scripts/generate-service-images.mjs — Gemini service header image generation + Sanity upload
- scripts/recover-iron-swords.mjs — Wayback scrape + Imagen 4 generation for חרבות ברזל articles
- scripts/migrate-categories.mjs — Copy singular category → categories[] for all articles
- scripts/migrate-authors.mjs — Copy singular author → authors[] for all articles
- scripts/upload-pdf-articles.mjs — PDF upload + article creation script
- scripts/migrate-batch2.mjs — WP REST API batch 2 migration (38 articles, 31 matched)
- scripts/gemini-headshots-batch2.mjs — Gemini headshot generation (rembg → grey gradient portrait)
- scripts/upload-team-photos.mjs — Upload team photos to Sanity + patch documents
- scripts/generate-og-image.mjs — Branded OG image with sharp + real logo
- assets/pdfs/ — 15 PDF guides/circulars (source files)
- docs/wp-migration/batch2-raw-articles.json — Raw WP API data (195 posts)
- docs/wp-migration/extract.log — Wayback scrape log (shows 0w skips for Elementor pages)
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

## Post-Launch Checklist
- [x] DNS cutover (A + CNAME → Railway) — DONE
- [ ] Partner photos (waiting on founders to identify IMG numbers)
- [ ] Summit mailing lists (חברות בע"מ + עצמאים) — manual setup
- [ ] Summit template import (paste HTML)
- [ ] Final Chrome QA
- [ ] Avi/Ron content approval
- [ ] First newsletter send

## Known Issues
- Contact form email doesn't send (Resend env vars missing)
- Partner photos are placeholder silhouettes (pending from founders to identify IMG numbers)
- Client logos hidden (section returns null until real logos added)
- Team member photos: 10/10 uploaded (AI-generated grey gradient headshots via Gemini)
- Google Maps on /contact may show rejection if API key referrer not configured for domain
- No tests, no CI/CD

## Not In Scope
No client login · No payments · No i18n
Content Factory is a SEPARATE repo (apps/os-hub) — not this project
