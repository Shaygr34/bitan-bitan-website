# Bitan & Bitan Website — ביטן את ביטן

## Project
CPA firm website. Hebrew RTL, B2B audience. **LIVE at bitancpa.com** (DNS cutover complete, old WP wiped).
Repo: bitan-bitan-website | Branch: main | Auto-deploy: Railway watches main

## Stack
Next.js 15 · React 19 · Tailwind 3 · Sanity v3 · Framer Motion · TypeScript
Deploy: Railway (Docker, standalone output)
CMS: Sanity project ul4uwnp7, dataset production

## Current State (V3.8 — March 24, 2026)

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

### Tools / Mini-Apps (V3.8 — NEW)
- **`/tools` section**: New nav item "כלים", listing page, detail page with dynamic component mapping
- **Leasing Simulator** (`/tools/leasing-simulator`): 5-step guided questionnaire → recommendation (ליסינג תפעולי / מימוני / רכישה)
  - Scoring engine: 5-axis weighted model (businessType, period, priority, priceRange, downPayment)
  - Cost estimates: monthly + total for all 3 options, tax notes per business type
  - Price ranges calibrated to Israeli market 2026 (130K-400K+ segments, rates from market research)
  - Pyramid layout for odd-numbered option sets, unified comparison table
  - 100% client-side (`"use client"`) — no API calls, instant calculation
  - CMS-editable via `configJson` field on tool document (rates, thresholds, interest rate)
  - SEO content area below tool via `introBody` Portable Text
- **Sanity schema**: `tool` type with toolType (maps to React component), configJson (JSON blob for rates), introBody, disclaimer, SEO
- **Planned tools**: מענקי שאגת הארי simulator, מחשבון עלות מעסיק
- **Architecture**: SSR page shell (metadata, SEO) + client component per tool type. Tool selection via `toolType` field → component map in `[slug]/page.tsx`

### Schema Changes (V3.8)
- **`tool` document type**: title, slug, toolType, configJson, introBody, disclaimer, SEO fields
- **`contentType` on articles**: Added `form` (טופס + PDF) option — drives download button text + card badge
- **`checklist` on articles**: Migrated from `array of [string]` to `array of [block]` with link annotations. Editors can now add hyperlinks in "מה לעשות עכשיו" items. Frontend backward-compatible with legacy strings via `typeof` check.
- **Terminology**: All instances of ייעוץ מס / יועצי מס replaced with ייעוץ מיסוי / יועצי מיסוי across source code + Sanity CMS content

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

## Schemas (16)
article (with downloadableFile/contentType incl. form/categories[]/authors[]/body with link+textColor annotations/checklist with link annotations) · author · category (with parent self-reference for subcategories) · tag · service (with processSteps/targetAudience/faqs) · faq · testimonial · contactLead · homePage · aboutPage · legalPage · siteSettings · clientLogo · teamMember · newsletterSubscriber · **tool** (with toolType/configJson/introBody)

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
- src/app/(site)/tools/page.tsx — Tools listing page (card grid)
- src/app/(site)/tools/[slug]/page.tsx — Tool detail page (SSR shell + dynamic component)
- src/components/tools/LeasingSimulator.tsx — Main wizard (5 steps + results)
- src/components/tools/SimulatorStep.tsx — Reusable step card with pill buttons
- src/components/tools/SimulatorResult.tsx — Recommendation card + comparison table + CTA
- src/components/tools/leasing-logic.ts — Pure scoring engine + cost estimates (no React)
- src/sanity/schemas/tool.ts — Tool document schema
- scripts/migrate-checklist.mjs — Checklist string→block migration

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

## Session: March 22, 2026 — Economics + Analytics + Infrastructure Separation

### Deliverables Produced

1. **Economics Report (PDF)** — Hebrew branded report for Avi & Ron. Covers: monthly operating costs (~₪131/mo post-July excluding Summit), reimbursement to Shay (~₪148), and handoff plan for all services before July 2026. Delivered + printed.

2. **Economics Master Spreadsheet (XLSX)** — 4 tabs: עלויות שוטפות, החזר הוצאות, תוכנית העברה, מעקב חודשי (blank tracker Apr 2026–Mar 2027). Formulas use 3.1 ₪/$ exchange rate.

3. **Analytics Report (PDF)** — Hebrew branded report on first content campaign performance. V3 final with corrections from Claude Code data verification. Key findings:
   - שאגת הארי article: 799 views, 581 users (main article alone)
   - Combined with חל"ת article: 1,026 views
   - Newsletter: 71% open rate (3x industry), 34% CTR (10x industry)
   - 23 WhatsApp clicks (12 from grants article), 6 phone clicks
   - Google organic: 71% of all traffic, position #1 for core queries
   - Article got 116 views/day BEFORE newsletter was sent — organic flywheel works
   - ~15,000 Google impressions/week for the site

### GA4 API Access (NEW)

- **Property ID**: 525595931
- **Service Account**: bitan-analytics@bitan-ga4-reader.iam.gserviceaccount.com
- **GCP Project**: bitan-ga4-reader (created under personal Gmail to bypass org policy)
- **Credentials**: ~/ga4-credentials.json
- **APIs enabled**: Analytics Data API, Search Console API
- **Search Console**: Full access on sc-domain:bitancpa.com
- **Note**: The bitancpa.com Google Workspace org enforces `iam.disableServiceAccountKeyCreation` — all service accounts must be created in projects outside that org.

### Cost Structure (Locked)

Monthly operating (post-July 2026, no Claude Max):
- Railway Pro: $20/mo
- Sanity Growth: $15/mo (1 seat)
- GoDaddy: ₪80/yr (₪6.67/mo)
- Anthropic API: ~$5/mo variable
- Everything else: free tier (Cloudflare, GA4, GSC, GitHub, Resend)
- Total: ~₪131/mo (~$42)
- Summit CRM: ~₪9,000–9,500/mo (firm-owned, not in our scope)

### July 2026 Handoff — Service Separation Plan

All infrastructure must transfer to firm ownership before Shay leaves:
- **Railway**: New workspace under ron@bitancpa.com — PENDING
- **Sanity**: Bitan CPA org exists, Ron needs to become owner + add card for Growth — URGENT (trial ending)
- **Cloudflare**: Transfer zone from shay@bitancpa.com to ron@bitancpa.com — MEDIUM
- **Anthropic API**: New org under firm email — MEDIUM
- **Google AI Studio**: New account under firm email — LOW
- **GitHub**: Create BitanCPA org, transfer 4 repos — MEDIUM
- **Claude Max** ($200/mo): Stays with Shay on shay@bitancpa.com — Ron stops paying July
- **GoDaddy**: Already on ron@bitancpa.com ✓
- **Google Workspace**: Already firm-owned ✓

### Content Campaign Benchmarks (First Campaign Baseline)

For future comparison:
- Newsletter open rate: 71% (target: maintain >50%)
- Newsletter CTR: 34% (target: maintain >20%)
- Article organic daily views after stabilization: 105–129/day
- Time from publish to Google indexing: <24 hours (sitemap auto-discovery)
- WhatsApp conversion rate from article: ~2% of unique readers (12/581)
- Contact form: BROKEN — 0 submissions, needs Resend fix

### Key Learnings

- GA4 "direct" traffic includes newsletter clicks — email apps don't send referrer headers. Must use UTM parameters on all future newsletter links.
- Google org policies on Workspace domains block service account key creation. Workaround: create GCP projects under personal Gmail accounts.
- Route all infrastructure/CLI tasks to Claude Code immediately — don't attempt UI guidance through claude.ai.

## Session: March 24, 2026 — Sprint Fixes + Tools Section + Analytics

### Sprint Fixes
- **Terminology**: ייעוץ מס → ייעוץ מיסוי across 13 source files + 3 Sanity CMS documents
- **contentType `form`**: New option for articles with downloadable forms (טופס). Drives button text + card badge. חל"ת article updated.
- **Checklist hyperlinks**: Migrated `checklist` field from `array of [string]` to `array of [block]` with link annotations. 2 articles migrated (15 items). Schema deployed.

### Tools Section (V1)
- Built `/tools` infrastructure + first mini-app (leasing simulator)
- Sent to Avi & Ron for feedback via WhatsApp
- **Planned next tools**: מענקי שאגת הארי simulator, מחשבון עלות מעסיק

### Analytics Snapshot (Feb 24 – Mar 24, 2026)
- **Overall**: 512 clicks, 10,251 impressions, 5.0% CTR
- **שאגת הארי grants article**: 1,082 sessions, 57% of all landing traffic, position #1
- **Top organic gap**: "אישור ניכוי מס במקור וניהול ספרים" — 511 impressions, 1% CTR, position 8 → biggest untapped article opportunity
- **Other gaps**: טופס 6111 (272 impressions, pos 7-10), החזר בלו על סולר (292 impressions, pos 6-9)
- **Best engagement articles**: trapped-profits (16.7% bounce, 4:10 duration), credit-note-rules (14.3% bounce)
