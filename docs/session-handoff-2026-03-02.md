# Session Hand-Off Prompt
**Date:** 2026-03-02
**Use:** Copy-paste this as the opening prompt for the next engineering session on `bitan-bitan-website`

---

**Project:** Bitan & Bitan website (`bitan-bitan-website`)
**Branch:** `claude/build-m1-hebrew-rtl-Wx6yk`
**Stack:** Next.js 15 App Router + Sanity v3 + Tailwind CSS + TypeScript
**Language:** Hebrew-first, full RTL

**Read `CLAUDE.md` first** — it contains the full project guide, directory structure, architecture decisions, conventions, completed milestones, and what's not done yet.

**Current state (as of 2026-03-02):**
The website is ~90% production-ready. All 9 pages are built, styled, SEO-optimized, and wired to Sanity CMS. A comprehensive QA audit was completed and all P0/P1 issues were fixed across 5 PRs:

- **PR1:** SiteSettings control panel — centralized all contact info into one Sanity singleton. Studio fully in Hebrew with grouped navigation.
- **PR2:** Webhook revalidation endpoint at `/api/revalidate` — instant cache busting on Sanity publish.
- **PR3:** TrustModule component placed on Home, Services, and Contact pages — process steps, transparency promises, preparation checklist.
- **PR4:** Editorial article template — TL;DR callout, difficulty badge, actionable checklist, disclaimer, related articles section, print-optimized CSS.
- **PR5:** QA fixes — contact form saves leads to Sanity `contactLead` docs, category filter pills are functional, branded 404 page, service cards link to /contact, testimonial claims softened, unused styled-components removed.

**Key docs:**
- `CLAUDE.md` — project guide (architecture, conventions, env vars, what's done/not done)
- `docs/qa-m11.md` — original QA audit with issue tracking
- `docs/M10-RUNBOOK.md` — SEO/analytics validation checklist
- `docs/founders-report-2026-03-02.md` — current status report for founders
- `docs/session-handoff-2026-03-02.md` — this file

**Content Factory integration:**
A full Sanity schema snapshot was generated for the bitan-bitan-os Content Factory. The article schema supports: title, slug (Hebrew-safe), author (ref), category (ref), tags (array of refs), publishedAt (sort order only — Sanity publish state gates visibility), body (Portable Text: blocks + images), excerpt, mainImage, tldr, difficulty (basic/intermediate/advanced), checklist (array of strings), disclaimer, seoTitle, seoDescription. ISR is 300s; webhook available for instant updates.

**Remaining work (prioritized):**
1. Wire email delivery for contact form (form saves to Sanity but no email notification — founders must check Studio manually)
2. Build `/services/[slug]` detail pages with service body content, related articles, and FAQ cross-links
3. Add article pagination or "load more" to Knowledge hub (currently flat grid, fine for <30 articles)
4. Build guide pages (schema exists as `guide` type, no frontend route) — or consolidate into article type
5. Add breadcrumbs to article and service pages
6. Configure legacy redirect rules in `next.config.ts`
7. Safari/iOS manual testing pass

**Conventions to follow:**
- All UI text in Hebrew
- RTL only — use logical properties (start/end), never left/right
- Server components by default; `'use client'` only when needed
- All GROQ queries in `src/sanity/queries.ts` — never inline
- All Sanity types in `src/sanity/types.ts`
- Use `@/` path alias
- Animations via RevealSection/RevealItem wrappers; respect `prefers-reduced-motion`
- Every page exports metadata. JSON-LD on content pages.
