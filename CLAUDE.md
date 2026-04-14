# Bitan & Bitan Website — ביטן את ביטן

## Project
CPA firm website. Hebrew RTL, B2B audience. **LIVE at bitancpa.com** (DNS cutover complete, old WP wiped).
Repo: bitan-bitan-website | Branch: main | Auto-deploy: Railway watches main

## Stack
Next.js 15 · React 19 · Tailwind 3 · Sanity v3 · Framer Motion · TypeScript
Deploy: Railway (Docker, standalone output)
CMS: Sanity project ul4uwnp7, dataset production

## Current State (V5.0 — April 13, 2026)

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

### Tools / Mini-Apps (V5.0)
- **Architecture**: SSR page shell (metadata, SEO) + `"use client"` component per toolType. Adding new tool = logic file + React component + Sanity doc. No route/schema changes needed.
- **Sanity schema**: `tool` type with toolType (maps to React component), configJson (JSON blob for rates), primeRate, vatRate, introBody, disclaimer, SEO
- **Leasing Calculator V2** (`/tools/leasing-calculator`): Real loan amortization, Israeli tax rules (VAT 67%/100%, deductions 45%/100%, marginal tax brackets). Slider-based UX. 3 options × 4 vehicle types. Comparison with "מה עדיף?" verdict. Code: `src/components/tools/calculator/`.
  - **שכיר path** (April 13): Employee mode enabled. Zero VAT/deductions, negative tax savings showing שווי שימוש cost. Employee NII rates (4.27%/12.17%) in config.
  - **חברה בע"מ mode**: Company tax 23%, שווי מס רכב, NII employer on שווי מס.
- **Employer Cost Calculator V2** (`/tools/employer-cost`): Full Israeli payroll engine (April 13). Code: `src/components/tools/employer/`.
  - Ron's 11-item feedback implemented: `docs/ron-employer-calc-feedback-2026-04-12.md`
  - שווי מס generalized: vehicle + ארוחות + שווי מס נוסף (3 conditional toggles)
  - נסיעות field (default 315), pension credit salary (editable 9700)
  - Employee pension credit: min(salary, 9700) × 7% × 35% = max 237.58/mo
  - נטול יכולת (disabled children): 2 credit points/child
  - Military/national service credits with gender-aware thresholds
  - Dual calculation: with/without all שווי מס, dual net + dual employer cost
  - Comparison feature (two salary scenarios side-by-side)
  - Print/PDF with watermark disclaimer "נתוני שכר להמחשה בלבד"
  - QA audit done: 7 issues fixed (age sentinel, comparison state, service defaults, etc.)
- **Planned tools**: סימולטור מענקי שאגת הארי (research done: `docs/superpowers/research/`)

### Client Onboarding (V3 — April 13, 2026)
- **Phase A** (website intake form): 4 paths (new/transfer × individual/company), business step, transfer CPA fields, doc validation, birthdate dropdowns
- **localStorage persistence**: Auto-saves form state keyed by `intake_draft_{token}`. Debounced 300ms. `isFirstSaveRender` ref skips mount to prevent race condition. Welcome-back banner on restore. Files cannot persist (browser security).
- **Soft docs validation**: Amber warnings on docs step (not hard block). Inline confirmation on submit when docs missing. Progress bar amber badge. Client can submit without all docs.
- **Summit error surfacing**: `createSummitEntity` returns `{ entityId, error }`. Token status `summit_failed` with `summitError` field stored when entity creation fails. OS dashboard shows red error box.
- **Sanity schemas**: `clientDocument` (structured file index per client — replaces הערות URL dump), `intakeToken` with `mode` field (new/update) and `summitError` field.

### Data Completion System (V3 — April 13, 2026)
- **Purpose**: Mass CRM data completion for ~960 existing clients (0% document uploads, 4% birthdate)
- **OS dashboard**: "השלמת נתונים" tab on /onboarding page (bitan-bitan-os)
- **Summit bulk parser**: Fetches all clients, computes completion % per field
- **Background scan**: `?scan=start` triggers async fetch, dashboard polls every 15s
- **Rate limiting**: 500ms/call, 50-batch with 10s pause, 65s backoff on 403, in-memory cache 1h TTL
- **Generate update links**: Pre-fills form with Summit data, creates `mode: 'update'` intakeToken
- **Summit API limitation**: Cannot upload files to File-type fields (JSON-only). Files stored in Sanity CDN with structured `clientDocument` index. Feature request sent to Summit April 2026.

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
article (with downloadableFile/contentType incl. form/categories[]/authors[]/body with link+textColor annotations + **image** blocks + **table** blocks (@sanity/table)/checklist with link annotations) · author · category (with parent self-reference for subcategories) · tag · service (with processSteps/targetAudience/faqs) · faq · testimonial · contactLead · homePage · aboutPage · legalPage · siteSettings · clientLogo · teamMember · newsletterSubscriber · **tool** (with toolType/primeRate/vatRate/configJson/introBody)

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
- src/sanity/schemas/clientDocument.ts — Structured file index per Summit client
- src/sanity/schemas/intakeToken.ts — Intake token with mode (new/update) + summitError
- src/components/tools/calculator/ — Leasing calculator (engine, types, config, StepBase, ResultsView, SliderInput, InputGroup)
- src/components/tools/employer/ — Employer cost calculator (engine, types, config, EmployerCalculator, EmployerResults)
- src/app/intake/[token]/IntakeForm.tsx — Client intake form (localStorage persistence, soft docs validation)
- src/app/intake/[token]/intake.module.css — Intake form styles (welcomeBanner, warningBanner, confirmPanel, stepBadge)
- src/app/api/intake/route.ts — Intake submission (Summit entity create/update, file upload to Sanity CDN, error surfacing)
- docs/ron-employer-calc-feedback-2026-04-12.md — Ron's 11-item employer calc feedback (with screenshots)
- scripts/migrate-checklist.mjs — Checklist string→block migration

## Env Vars (Railway)
Set: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN (note: Railway uses this name)
Set: NEXT_PUBLIC_SITE_URL = https://bitancpa.com (must include protocol)
Set: NEXT_PUBLIC_GOOGLE_MAPS_KEY
Set: SANITY_REVALIDATE_SECRET (must match Sanity webhook)
Set: NEXT_PUBLIC_GA4_ID
Set: RESEND_API_KEY (contact form email — set April 13, 2026)
Set: CONTACT_EMAIL_TO = office@bitancpa.com (set April 13, 2026)
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
- Partner photos are placeholder silhouettes (pending from founders to identify IMG numbers)
- Client logos hidden (section returns null until real logos added)
- Team member photos: 10/10 uploaded (AI-generated grey gradient headshots via Gemini)
- Google Maps on /contact may show rejection if API key referrer not configured for domain
- No tests, no CI/CD

## Not In Scope
No client login · No payments · No i18n
Content Factory is a SEPARATE repo (apps/os-hub) — not this project

## Key Gotchas (discovered in production)
- **React useEffect race condition** (IntakeForm): Auto-save effect on mount captures EMPTY_FORM in closure before restore populates state. Fix: `isFirstSaveRender` ref skips first save invocation.
- **SliderInput node positioning**: Absolute positioning clusters nodes at low values when presets are unevenly distributed. Fix: flexbox `justify-between`.
- **Summit API cannot upload files**: JSON-only, no multipart/form-data. Files → Sanity CDN, structured index in `clientDocument` schema.
- **Summit entity references**: Fields like סוג לקוח and מנהל תיק return entity IDs, not labels. Must map via lookup constants.
- **Employee vs self-employed pension credit**: Employee = min(salary, 9700) × 7% × 35%. Self-employed = avgSalary × 5% × 35%. DIFFERENT formulas — reason the employer calc is a separate tool.
- **Children age sentinel (-1)**: Using -1 as "empty" in childrenAges array causes silent credit point miscalculation. Clean to 0 at calculation boundary.
- **Zsh glob escaping**: File paths with `[brackets]` must be quoted in git/shell commands.

## Session History (archived — see git log for details)
- March 22, 2026: Economics report, analytics report, GA4/GSC API access, cost structure
- March 24, 2026: Sprint fixes, tools section V1, leasing simulator
- April 5-11, 2026: Calculator V2 + company mode, employer calc V1, onboarding V2 (3 phases), Summit MCP v2.3.0
- April 13, 2026: שכיר calc path, employer calc V2 (Ron's 11 items + QA), onboarding persistence + soft docs, Summit error surfacing, data completion dashboard, contact form email fix

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
- Sent to Avi & Ron for feedback via WhatsApp (2026-03-24)
- **Status**: AWAITING Avi/Ron feedback on leasing simulator → iterate → then build next tool
- **Planned next tools** (in order):
  1. מחשבון עלות מעסיק (employer cost calculator) — simplest, evergreen SEO, well-known formulas
  2. סימולטור מענקי שאגת הארי (grants simulator) — time-sensitive, complex logic, cross-links to #1 traffic article
- **Adding a new tool**: Write logic file (`src/components/tools/<name>-logic.ts`) + React component + create Sanity `tool` document with `toolType` matching. No route/schema changes needed.
- **Plan file**: `docs/superpowers/plans/2026-03-24-tools-leasing-simulator.md`

### Analytics Snapshot (Feb 24 – Mar 24, 2026)
- **Overall**: 512 clicks, 10,251 impressions, 5.0% CTR
- **שאגת הארי grants article**: 1,082 sessions, 57% of all landing traffic, position #1
- **Top organic gap**: "אישור ניכוי מס במקור וניהול ספרים" — 511 impressions, 1% CTR, position 8 → biggest untapped article opportunity
- **Other gaps**: טופס 6111 (272 impressions, pos 7-10), החזר בלו על סולר (292 impressions, pos 6-9)
- **Best engagement articles**: trapped-profits (16.7% bounce, 4:10 duration), credit-note-rules (14.3% bounce)
- **Top article candidates** (data-driven):
  1. אישור ניכוי מס במקור וניהול ספרים (511 impr, pos 8, 1% CTR — biggest gap)
  2. טופס 6111 מדריך (272 impr, pos 7-10 — page 1/2 border)
  3. החזר בלו על סולר + טבלת 2026 (292 impr, pos 6-9 — niche high-intent)

## Session: March 29, 2026 — Content Intelligence Infrastructure

Started with "I want a weekly performance brief for the website" → ended with a full content intelligence pipeline.

### 1. Weekly Performance Report (SHIPPED — autonomous)
- **Workflow**: `.github/workflows/weekly-report.yml` — Sunday 09:00 Israel
- **Script**: `scripts/weekly-report/main.py` — pulls GA4 + GSC → branded Hebrew email → Sanity storage
- **Sends to**: avi@, ron@, shay@bitancpa.com via Resend (`reports@bitancpa.com`)
- **Sanity schema**: `weeklyMetrics` (doc ID: `weeklyMetrics-YYYY-MM-DD`)
- **Metrics**: KPI cards (users, pageviews, clicks, impressions with WoW), traffic sources, top content, top queries, newsletter/lead counts
- **Manual trigger**: `gh workflow run weekly-report.yml`

### 2. Resend Domain Setup
- Account: `bitancpa` at resend.com (shay@bitancpa.com)
- Domain: `bitancpa.com` — DKIM + SPF configured in Cloudflare DNS
- Sender: `reports@bitancpa.com`
- API key: `bitan-reports` (stored as `RESEND_API_KEY` GitHub secret)

### 3. SEO Content Opportunity Scanner (SHIPPED — autonomous)
- **Workflow**: `.github/workflows/content-intelligence.yml` — Sunday 09:30 Israel
- Scans GSC for high-impression/low-CTR queries, matches against existing articles
- Sends opportunity digest email with gap analysis

### 4. Professional Intelligence Monitor (SHIPPED — autonomous, Phase 1+2)
- **Workflow**: `.github/workflows/intelligence-monitor.yml` — Tue + Thu 07:00 Israel
- **Script**: `scripts/intelligence-monitor/main.py` + `sources/` (7 scrapers)
- **7 sources**:
  1. Deloitte Israel tax alerts (PDF scrape)
  2. Tax Authority Telegram (`t.me/taxes_il`)
  3. Globes RSS (keyword-filtered for tax)
  4. Knesset Finance Committee (OData API)
  5. ביטוח לאומי RSS
  6. Bank of Israel interest rate API
  7. OS Experts + EY Israel circulars
- **Sanity schema**: `intelligenceItem` (stores seen items for dedup)
- Sends digest email only when there's something new
- **Phase 3** (open): Email inbox parsing for כל מס / רונן / לשכה newsletters
- **Phase 4** (open): Wire intelligence into Content Factory for auto-drafting

### 5. Bitan Website Strategy
- Documented: site is referral-confirmation, not lead-gen
- Metrics focus on brand signals (organic traffic, query positions, content engagement), not conversion funnels

### 6. Source Research (Israeli CPA Professional Ecosystem)
- gov.il Tax Authority: React SPA + 403 blocking, NOT directly scrapable
- Hashavim/כל מס + רונן: Paywalled, but email newsletters monitorable (Phase 3)
- לשכת יועצי המס: No public website, not viable for automation
- Deloitte Israel: Best structured source (34 free PDF alerts/year)
- Globes: Only Israeli news site with working RSS

### New GitHub Secrets (repo: Shaygr34/bitan-bitan-website)
- `GA4_CREDENTIALS_B64` — base64-encoded service account JSON
- `RESEND_API_KEY` — `bitan-reports` key
- `SANITY_API_WRITE_TOKEN` — `os-write` Editor token
- `REPORT_RECIPIENTS` — email list

### New Schemas
- `weeklyMetrics` — `src/sanity/schemas/weeklyMetrics.ts`
- `intelligenceItem` — `src/sanity/schemas/intelligenceItem.ts`

### New Key Files
- `.github/workflows/weekly-report.yml`
- `.github/workflows/content-intelligence.yml`
- `.github/workflows/intelligence-monitor.yml`
- `scripts/weekly-report/main.py` + `requirements.txt`
- `scripts/intelligence-monitor/main.py` + `sources/` (7 source files)

### What's Running Autonomously
| Schedule | System | Recipients |
|---|---|---|
| Sunday 09:00 | Weekly performance report | Avi, Ron, Shay |
| Sunday 09:30 | Content opportunity scanner | Avi, Ron, Shay |
| Tue 07:00 | Intelligence digest | Avi, Ron, Shay |
| Thu 07:00 | Intelligence digest | Avi, Ron, Shay |

### Open Items
- **Deloitte scraper**: Could be smarter about new vs. existing alerts
- **Globes RSS**: Returned 0 all session — may need keyword tuning when tax news breaks
- **Phase 3**: `alerts@bitancpa.com` inbox → parse forwarded newsletters
- **Phase 4**: Intelligence → Content Factory auto-drafting

## Session: March 29, 2026 — Summit CRM Integration + Client Intake System

Continuation of the content intelligence session. Added CRM integration and digital client onboarding.

### 1. Summit CRM Integration (via MCP — 30 tools)
- **Summit MCP server** already existed at `/Users/shay/summit-mcp` (Railway: `summit-mcp.up.railway.app`)
- Connected to claude.ai Cowork via MCP — Avi/Ron can query Summit in natural Hebrew
- **960 active clients** accessible in real-time
- Capabilities: client search (name/phone/email), client card + report status + debts, SMS/email send, שע"מ VAT check, exchange rates, webhook management, חשבשבת backup import
- See `summit-mcp` memory file for full tool list and security zones

### 2. Client Intake System (SHIPPED — end-to-end)
- **Flow**: Bitan OS creates unique token → WhatsApp link to client → client fills form → Summit entity created automatically
- **Intake form**: branded, 3-step progress bar, file uploads (ת.ז., certificates), mobile-optimized
- **Auto-creates**: Summit client entity + attaches uploaded documents + sends welcome email to client + notification to office
- **Status tracking**: tracks whether client opened the form (`opened` status on token)
- **Smart UX**: when client type is pre-filled in URL, hides סוג לקוח step (3 steps instead of 4)

### Key Files (Intake — on bitan-bitan-website)
- `src/app/intake/[token]/page.tsx` — SSR token validation page
- `src/app/intake/[token]/IntakeForm.tsx` — Client-side multi-step form (`"use client"`)
- `src/app/api/intake/route.ts` — POST handler: creates Summit entity + uploads files + sends emails
- `src/app/api/intake/track/route.ts` — Tracks form open status

### Key Files (Intake — on bitan-bitan-os)
- `apps/os-hub/src/app/onboarding/page.tsx` — Token generation UI for office staff
- `apps/os-hub/src/app/api/intake/generate/route.ts` — Token creation API
- `apps/os-hub/src/app/api/intake/tokens/route.ts` — Token listing API

### New Sanity Schema
- `intakeToken` — stores generated intake links with status, client type, expiry

### Summit Integration Fixes (during session)
- Fixed: Summit expects plain entity ID for סוג לקוח (not `{ID: ...}` wrapper)
- Fixed: תחום עיסוק is entity reference, not text — skip during creation
- Fixed: birthdate format needs `T00:00:00` suffix for Summit Date type
- Fixed: Summit property names corrected + Content-Language header added
- Fixed: flow reordered — create Summit entity before file uploads
- Fixed: RTL progress bar direction
- Hebrew copy fix: בהקרוב → בקרוב

### What's Running Autonomously (Updated)
| Schedule | System | Recipients |
|---|---|---|
| Sunday 09:00 | Weekly performance report | Avi, Ron, Shay |
| Sunday 09:30 | Content opportunity scanner | Avi, Ron, Shay |
| Tue 07:00 | Intelligence digest | Avi, Ron |
| Thu 07:00 | Intelligence digest | Avi, Ron |
| On demand | Client intake (Bitan OS → form → Summit) | Office staff |

### Next Steps (Pipeline)
- **Pre-intake**: Connect website contact form → lead pipeline → intake link
- **Pre-intake**: Digital retainer agreement + signature
- **Post-intake**: Auto-create bookkeeping file + assign manager
- **Intelligence Phase 3**: `alerts@bitancpa.com` email parsing
- **Intelligence Phase 4**: Intelligence → Content Factory auto-drafting
- **Top article opportunity**: "אישור ניכוי מס במקור" — 511 impressions, position 8, 1% CTR

### Summit MCP for Avi/Ron (Claude Desktop + claude.ai)
- Summit MCP server is remote on Railway — no local install needed
- Avi/Ron connect via Claude Desktop or claude.ai → Settings → Connectors → **Add custom connector**
  - Name: `Summit CRM`
  - URL: `https://summit-mcp.up.railway.app/mcp`
  - OAuth: leave empty
- **v2.3.0** (April 5, 2026): 30 tools, full financial data access, embedded Hebrew server instructions
- Full billing/fees, invoice amounts, tax liabilities, company numbers, documents — all accessible
- Only blocked: bank details, credit cards, ת.ז, passwords

## Session: April 5, 2026 — Calculator V2 + Summit MCP Unlock + Tables

### 1. Leasing Calculator V2 (SHIPPED — live on bitancpa.com)
- **Complete rebuild** of the leasing simulator based on Ron's 21-page spec
- Replaced 5-step recommendation quiz with professional financial calculator
- Real loan amortization, Israeli tax rules (VAT 67%/100%, deductions 45%/100%, marginal tax brackets)
- 3 option types × 4 vehicle types = 12 calculation paths (עצמאי only, שכיר בקרוב)
- Slider-based UX with node points + manual input (not pill grids)
- 2-step vehicle type reveal (פרטי/מסחרי → בנזין/חשמלי)
- Side-by-side comparison with "מה עדיף?" verdict card
- Results split into 4 sections: נתוני רכב/מימון, הוצאות שוטפות, ניתוח מס, סיכום
- Dedicated Sanity fields: `primeRate` (5.5%), `vatRate` (18%)
- Income-based tax savings calculation (Ron's email addition)
- Code: `src/components/tools/calculator/` (9 files)
- Plan: `docs/superpowers/plans/2026-04-05-leasing-calculator-v2.md`
- **Avi feedback applied**: "רכישה יד 2" → "רכישת רכב", prime rate 5.5%, sectioned results, loan interest avg annual

### 2. Summit MCP v2.3.0 (SHIPPED — live on Railway)
- **Security unlock**: opened billing, fees, tax files, documents, reports. Keep bank/CC/passwords locked.
- Removed YELLOW_REPORTS mode and monetary field stripping from document endpoints
- Tool descriptions updated — no more "yellow zone" language
- **Server instructions**: embedded Hebrew knowledge doc sent to Claude on every connection
  - Covers: firm context, folder IDs, how to search/query, revenue patterns, rate limits
  - Claude now speaks Hebrew by default and knows the Summit data model
- Avi/Ron can now ask: "מי הלקוח שמשלם הכי הרבה?", "תן לי דוח גבייה", "סטטוס דוחות שנתיים" etc.
- Default for unmapped folders changed from DENY ALL → WITH_PII_SCAN

### 3. Table + Image Support in Articles (SHIPPED)
- `@sanity/table` plugin installed — native table editor in Sanity Studio
- Image blocks now render in article body (were silently dropped)
- Table renderer: navy header, alternating rows, RTL, Bitan design language
- 3 comparison tables populated into Avi's leasing article via API
- Avi can now add tables to any article directly from Studio

### 4. Meeting Transcript Parsed (March 29 meeting)
- 45-minute recording transcribed via local mlx-whisper ($0 cost)
- 6 action items extracted: onboarding fixes, Summit MCP gaps, IDOM sync, stages roadmap
- Memory file: `bitan-meeting-2026-03-29.md`

### 5. תחום עיסוק Taxonomy (Research Complete)
- 469 raw Summit CRM entries → 25 canonical categories
- 23 entries identified as statuses (not sectors) — should be separate field
- Mapping file: `summit-mcp/taxonomy_cleanup_map_v2.json`
- Category doc: `docs/taxonomy-business-sectors.md`
- Ready for: onboarding form dropdown, Summit CRM cleanup script

### 6. שאגת הארי Grant Research (Research Complete)
- 400+ line research doc with full eligibility criteria, calculation formulas, special tracks
- Two paths: small business lookup table (≤300K) + larger business formula (300K-400M)
- Research file: `docs/superpowers/research/shaagat-haari-grant-research.md`
- Parked for future session — lower priority per Shay

### 7. Quick Wins
- Old V1 simulator files deleted (4 files, -930 lines)
- Contact form diagnosed: leads save to Sanity OK, email silently fails (missing RESEND_API_KEY + CONTACT_EMAIL_TO on Railway)
- Dev backlog documented: 17 items prioritized in memory

### New Key Files
- `src/components/tools/calculator/` — 9 files (types, config, engine, wizard steps, results, slider, input group)
- `docs/superpowers/plans/2026-04-05-leasing-calculator-v2.md`
- `docs/superpowers/research/shaagat-haari-grant-research.md`
- `docs/taxonomy-business-sectors.md`
- `sanity.config.ts` — added `table()` plugin

### Open Items (Full Backlog)
See memory file: `bitan-dev-backlog-2026-04-05.md` for complete 17-item prioritized backlog.

## Session: April 6, 2026 — Calculator Polish Sprint + Company Mode + Employer Cost

### 1. Calculator Polish — 3 Feedback Rounds from Ron/Avi (PRs #40-#45)
**Batch 1 (quick fixes):** Step indicators, labels, number formatting, back button, compare buttons, restart button visibility
**Batch 2 (medium):** ביטוח לאומי savings in tax calc, dual monthly+yearly display, net-of-VAT in results, pre-tax total for private vehicles, balloon shown in ליסינג מימוני
**Batch 3 (round 3):** CRITICAL BUG — totalAnnualExpenses was using depreciation instead of loan payment (fixed to cashflow-based). Scroll-to-top on mobile. Arrow direction RTL fix. Loan interest/balance moved to financing section. Compare below CTA. Pulse button when ready.

### 2. Company Mode (R20 — SHIPPED)
- חברה בע"מ option added to calculator
- שווי רכב חדש מהיצרן field (capped at 596,860 for 2026)
- שווי מס רכב = min(mfr price, cap) × 2.48%
- ביטוח לאומי מעביד on שווי מס (7.6%)
- Company tax at 23%
- Metric cards: שווי מס רכב + שכר ברוטו כולל שווי רכב

### 3. Other Fixes
- R9: Unrestricted comparison (all 3 options available)
- R15: Comparison view → stacked cards instead of flat table
- A3: "ייעוץ מס" → "ייעוץ מיסוי" fixed in 2 Sanity service documents (FAQs)
- R4: Field labels gold when filled
- R10: Percentage format fixed for RTL (25% not % 25)

### 4. Employer Cost Calculator (SHIPPED — live)
- Full Israeli payroll engine at `/tools/employer-cost` (1,071 lines)
- 3-phase wizard: שכר+רכב → פנסיה/הפרשות → נתונים אישיים → תוצאות
- Tax brackets (7), NII tiers, pension/severance/education fund, זקופות, credit points
- Vehicle שווי שימוש: petrol/electric/plug-in/hybrid/commercial with reductions
- Employee net with/without vehicle + employer cost breakdown side-by-side
- Child age legend (מקרא) per Ron's feedback
- Code: `src/components/tools/employer/` (5 files)
- Sanity tool doc published at `/tools/employer-cost`
- Ron: "זה טיל המחשבון 🚀"

### 5. Client Onboarding V2 (SHIPPED — all 3 phases)
**Phase A — Form Enhancement (bitan-website PRs #48-49-50):**
- 4 onboarding paths: עצמאי חדש / חברה חדשה / עצמאי שעובר / חברה שעוברת
- New "פרטי עסק" step: שם עסק, תחום עיסוק (25-category dropdown), מחזור שנתי (presets + free text), כתובת, עובדים
- Transfer fields: שם/מייל/תוכנות רו"ח קודם
- Birthdate: 3 Hebrew dropdowns (day/month/year)
- Document validation: blocks submit without required docs
- Client can return within 4 days: pre-fills previous data, updates existing Sumit entity
- Sumit field audit: every field has confirmed home (custom field מחזור שנתי, Customers_Text for structured data, auto-set מועד תחילת ייצוג + status "חדש")

**Phase B — Office Workflow (bitan-os PRs #103-104-105):**
- Dynamic onboarding checklist per path (new/transfer × individual/company)
- קודי מוסד letter template: copy or WhatsApp, pre-filled with client name
- Internal fields as real Sumit dropdowns (19 מנה"ח + 9 ביקורת + 5 שכר + 2 מנהל תיק)
- All staff names fetched from actual Sumit taxonomy entities
- "Summit" → "Sumit" spelling fix throughout

**Phase C — Re-editability:**
- Completed tokens editable for 4 days
- Form pre-fills from previous submission
- Re-submission updates Sumit entity (not creates duplicate)
- After 4 days: locked

### 6. Other Fixes This Session
- OG image regenerated: "ייעוץ מס" → "ייעוץ מיסוי"
- Calculator round 3: critical bug (totalAnnualExpenses used depreciation instead of loan payment), scroll-to-top mobile, arrow RTL, loan balance restructure
- Employer calc polish: child defaults empty, age legend, side-by-side employer results, vehicle merged into salary step

### Open Items — Next Session
See memory: `bitan-dev-backlog-2026-04-05.md` + `bitan-employer-calc-spec.md`
- **Onboarding V3** — new pivot from Avi/Ron meeting (April 13). Dedicated session.
- **Contact form email** — needs RESEND_API_KEY + CONTACT_EMAIL_TO on Railway
- **July 2026 handoff** — service ownership transfer planning

## Session: April 14, 2026 — Calculator Sprint Fixes + QA Crawl

### 1. Employer Cost Calculator — Ron's Sprint Fixes
- Removed שכר מבוטח קצבה מזכה from UI (engine uses 9,700 cap internally)
- Service default: ללא שירות first, removed ללא from היקף options
- נטו עובד at top key metrics alongside עלות מעסיק
- Kids: קצבת ילדים + נטול יכולת side-by-side (compact)
- Comparison: proper table with הפרש column, moved to TOP of results
- Removed פירוט שווי מס section

### 2. Leasing Calculator — Ron's Sprint Fixes
- Print/share buttons added to results
- Default selections pre-selected → immediate proceed
- Compare → step 1 for fresh vehicle selection
- Interest rate shows actual % instead of P+1%
- Consolidated action buttons (single row)

### 3. QA Crawl — Critical Bugs Fixed
- **Trade-in value NEVER subtracted from financial leasing loan** (silently overstated)
- React key collision comparing same option type
- Dirty comparison inputs (age sentinels leaked)
- State leak on second compare (scenario B overwrote A)
- excludeOption wired to StepPickOption

### 4. Shareable Result Links
- Both calcs encode all inputs as URL query params
- Share button generates link that auto-calculates on open
- Employer: `?gs=15000&ta=315&pe=6&pp=6.5&g=m&ms=married...`
- Leasing: `?opt=purchase&ut=selfEmployed&cp=150000...`
- Decode on mount → auto-calculate → show results

### 5. Polish
- Print CSS: both calcs compact one-pager, tool page hero/intro/disclaimer `print:hidden`
- Car price slider max 400K → 600K
- Verdict text handles negative tax savings (employee mode)
- alert() → inline toast for share fallback
- Dead code removed (getComparisonRows)

### Known Remaining
- H4: Employee manufacturer price default ₪200K — no UX guidance
- H5: pensionSalary/educationFundSalary not editable
- L6: disabilityRate field is dead code
