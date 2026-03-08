# Bitan & Bitan Website — ביטן את ביטן

## Project
CPA firm website. Hebrew RTL, B2B audience. Live on Railway.
Repo: bitan-bitan-website | Branch: main | Auto-deploy: Railway watches main

## Stack
Next.js 15 · React 19 · Tailwind 3 · Sanity v3 · Framer Motion · TypeScript
Deploy: Railway (Docker, standalone output)
CMS: Sanity project ul4uwnp7, dataset production

## Current State (V3.1 — March 2026)
- 37 articles (7 original + 27 WP migration + 2 Bitan Finance + 1 new)
- 23 FAQs (5 original + 18 Bitan Finance)
- 11 services — unique body content, with optional processSteps/targetAudience/faqs enrichment fields
- 7 parent categories + 10 subcategories — two-row filter UI with mobile fade gradients
- Knowledge Center: server-side filtering (URL params), subcategory drill-down, client-side search, pagination 12/page
- Elfsight Google Reviews widget on homepage
- 14 testimonial docs in Sanity (backup, not rendered — Elfsight replaced them)
- Client logo conveyor belt — hidden when no real logos exist (returns null), real logos pending
- AI-generated article images for all articles (Gemini, script at scripts/generate-article-images.mjs)
- 104 WP redirects in next.config.ts
- ISR 300s + Sanity webhook revalidation working
- CMS fully editable in Sanity Studio at /studio
- About page: Avi + Ron Bitan (brothers), second generation to father Shlomo Bitan + Team section
- Trust bar: 30+ שנות ניסיון · דור שני · רו"ח + משפטנים · תל אביב
- Homepage scroll journey: Hero → TrustBar → Services → About → Process → Testimonials (Elfsight) → Knowledge Preview → TrustModule → FAQ → CTA → Footer
- Branded OG image (1200x630) generated with sharp + real logo
- All tel: links use +972 international format
- Homepage service cards deep-link to /services/[slug]
- Parent category articleCount includes subcategory articles

## Schemas (14)
article · author · category (with parent self-reference for subcategories) · tag · service (with processSteps/targetAudience/faqs) · faq · testimonial · contactLead · homePage · aboutPage · legalPage · siteSettings · clientLogo · teamMember

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
- src/lib/analytics.ts — GA4 event helpers including trackKnowledgeSearch
- src/lib/site-url.ts — Canonical URL resolution (auto-prefixes https://)
- src/components/TeamSection.tsx — Team members grid on About page
- scripts/generate-article-images.mjs — Gemini image generation + Sanity upload
- scripts/generate-og-image.mjs — Branded OG image with sharp + real logo
- tailwind.config.ts — Full token integration + scroll-left/scroll-right keyframes

## Env Vars (Railway)
Set: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
Set: NEXT_PUBLIC_SITE_URL = https://bitancpa.com (must include protocol)
Set: NEXT_PUBLIC_GOOGLE_MAPS_KEY
Set: SANITY_REVALIDATE_SECRET (must match Sanity webhook)
Set: NEXT_PUBLIC_GA4_ID
NOT SET: RESEND_API_KEY (contact form email doesn't send)
NOT SET: CONTACT_EMAIL_TO

## Known Issues
- Contact form email doesn't send (Resend env vars missing)
- Partner photos are placeholder silhouettes (pending from founders)
- Client logos hidden (section returns null until real logos added)
- Team member photos are placeholders (pending from firm)
- Google Maps on /contact may show rejection if API key referrer not configured for domain
- No tests, no CI/CD
- Service pages enrichment fields (processSteps/targetAudience/faqs) empty — pending content entry

## Not In Scope
No client login · No payments · No i18n · No newsletter yet (planned)
Content Factory is a SEPARATE repo (apps/os-hub) — not this project
