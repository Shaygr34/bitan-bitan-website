# Session Hand-Off Prompt — Site Completion Sprint
**Date:** 2026-03-02
**Use:** Copy-paste this as the opening prompt for the next engineering session

---

## COPY FROM HERE ↓

You are picking up the **bitan-bitan-website** project for a **site completion sprint** — polishing, fixing, and finishing everything needed to ship.

**Branch:** `claude/build-m1-hebrew-rtl-Wx6yk`
**Stack:** Next.js 15 App Router + Sanity v3 + Tailwind CSS + TypeScript
**Language:** Hebrew-first, full RTL

### Your first job: Study before you execute.

**Do NOT start coding yet.** First, read and internalize these files in order:

1. **`CLAUDE.md`** — Full project guide: architecture, directory structure, conventions, env vars, completed milestones, what's not done
2. **`docs/site-completion-sprint.md`** — The prioritized task list for this sprint. 25 items across 3 tiers (polish → features → cleanup). This is your backlog.
3. **`docs/qa-m11.md`** — Original QA audit (most items were fixed in PRs 1-5, but context is useful)
4. **`docs/founders-report-2026-03-02.md`** — Current status report

After reading all four files, respond with a brief acknowledgment:
- Confirm you've read and understood the project structure
- Confirm you understand the sprint priorities (Tier 1 polish first, then Tier 2 features, then Tier 3 cleanup)
- List any questions or ambiguities you see
- Then **wait for an execution prompt** before making any changes

### Context on current state (as of 2026-03-02):

The website is ~90% production-ready. All 9 pages are built, styled, SEO-optimized, and wired to Sanity CMS. A comprehensive QA audit was completed and all P0/P1 issues were fixed across 5 PRs (SiteSettings panel, webhook revalidation, TrustModule, editorial article template, contact form + QA fixes).

**What's solid:** RTL layout, responsive design, animations, Sanity integration, SEO metadata, GA4 analytics, JSON-LD, article experience, contact form (saves to Sanity).

**What this sprint needs to fix/finish (see `docs/site-completion-sprint.md` for full details):**

**Tier 1 — Polish (top priority):**
- No favicon or app icons (browser shows generic icon)
- Site-wide OG image field exists in Sanity but never wired to layout.tsx
- Google Maps API key hardcoded in source (needs env var)
- `/dev` QA page accessible in production (remove or gate)
- No error boundaries (no error.tsx)
- Email validation regex too permissive
- Hardcoded fallback content masks CMS issues
- Mobile CTA bar overlap, hardcoded header heights
- Print stylesheet incomplete

**Tier 2 — Missing Features:**
- Contact form email delivery (saves to Sanity, NO email sent)
- No `/services/[slug]` detail pages
- No breadcrumb navigation
- No article pagination
- Guide schema unused (no frontend route)
- No legacy redirect rules

**Tier 3 — Code Hygiene:**
- Unused dependency (`@sanity/image-url`)
- Dead guide schema
- CategoryFilter stub returning null
- Inline SVG duplication
- console.error in API route
- No `.env.example`
- Magic numbers not extracted
- Missing analytics events

### Conventions (must follow):
- All UI text in Hebrew
- RTL only — logical properties (start/end), never left/right
- Server components by default; `'use client'` only when needed
- All GROQ queries in `src/sanity/queries.ts` — never inline
- All Sanity types in `src/sanity/types.ts`
- Use `@/` path alias
- Animations via RevealSection/RevealItem wrappers; respect `prefers-reduced-motion`
- Every page exports metadata. JSON-LD on content pages.

**Remember: Read the files first, acknowledge, then wait for the go signal.**

## COPY TO HERE ↑
