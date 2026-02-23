# QA Report — M11 Hardening + Founder Control + Premium Trust

**Date:** 2026-02-23
**Branch:** `claude/build-m1-hebrew-rtl-Wx6yk`
**Status:** Awaiting approval before fixes

---

## A) Consistency & Truth Audit

### P0 — Critical (blocks trust / causes confusion)

| # | Issue | Details | Files |
|---|-------|---------|-------|
| A1 | **Office hours mismatch** | Footer/FAQ/JSON-LD say `08:30–17:00`; seed data says `09:00-17:00`. If Sanity has the seed value, visitors see conflicting hours. | `Footer.tsx:45`, `faq/page.tsx:46`, `layout.tsx:57`, `scripts/seed.ts:689` |
| A2 | **Contact form not wired** | Form shows "תודה! הפנייה התקבלה" on submit, but email delivery is **not implemented** — comment says `// Email provider not wired yet`. Leads are silently lost. | `contact/ContactForm.tsx:54` |
| A3 | **Contact info hardcoded in 6+ files** | Phone, WhatsApp, email, address, hours each appear as fallback literals in Header, Footer, PhoneCTA, WhatsAppCTA, contact page, layout.tsx, and seed.ts. Any future change requires editing every file — high mismatch risk. | See table below |

**Hardcoded contact info map:**

| Field | Header | Footer | PhoneCTA | WhatsAppCTA | contact/page | layout.tsx | seed.ts |
|-------|--------|--------|----------|-------------|-------------|-----------|---------|
| Phone `03-5174295` | :36 | :41 | :18 | — | :35 | :46 | :684 |
| WhatsApp `+972527221111` | :38 | :46 | — | :30 | :51 | — | :686 |
| Email `office@bitancpa.com` | — | :43 | — | — | :43,:164 | :47 | :687 |
| Address | — | :44 | — | — | :59,:75 | :50 | :688 |
| Hours | — | :45 | — | — | — | :57 | :689 |

### P1 — High (affects credibility)

| # | Issue | Details | Files |
|---|-------|---------|-------|
| A4 | **Fallback testimonials contain unverifiable claims** | "מלווים את החברה שלנו כבר 15 שנה", "חסכנו עשרות אלפי שקלים במס" — displayed when Sanity is empty. Partners should verify or soften. | `TestimonialsSection.tsx:8-9`, `seed.ts:342` |
| A5 | **LinkedIn link is dead** | Footer social link href is `'#'` — clicking goes nowhere. | `Footer.tsx:20` |
| A6 | **Address inconsistency (minor)** | Contact page shows two address variants: full (`קומה 11, תל אביב`) and short (`תל אביב` without floor). | `contact/page.tsx:59` vs `:75` |

### P2 — Low (polish)

| # | Issue | Details | Files |
|---|-------|---------|-------|
| A7 | **Seed hours format differs** | Seed uses `א׳-ה׳` while footer uses `ראשון–חמישי`. Minor if Sanity overrides, but confusing if seed is re-run. | `seed.ts:689` |
| A8 | **"Companies-first" messaging** | Messaging is balanced (עצמאים, שכירים, חברות). No inconsistency — just flagging for partner review that it's inclusive, not exclusively B2B. | Multiple pages |

---

## B) UX Logic Audit

### P0 — Critical

| # | Issue | Details | Files |
|---|-------|---------|-------|
| B1 | **Knowledge category pills are non-functional** | Category filter buttons on `/knowledge` are visible but purely decorative — no filtering logic. Creates false affordance. | `knowledge/page.tsx:134-150` |

### P1 — High

| # | Issue | Details | Files |
|---|-------|---------|-------|
| B2 | **No related content on article pages** | Article pages end with a generic CTA but have zero related articles, no "next article", no service cross-links. Users hit a dead end after reading. | `knowledge/[slug]/page.tsx:182-195` |
| B3 | **Service cards are not clickable** | Services page shows cards in a grid but they are display-only — no drill-down to detail pages, no link to related articles. | `services/page.tsx:106-135` |
| B4 | **No custom 404 page** | Missing `not-found.tsx` at app root. Users who hit typos/old URLs see a bare Next.js 404 with no branding or navigation back. | App root |
| B5 | **FAQ not in header navigation** | FAQ page only accessible via footer link — not discoverable from the main header nav. | `Header.tsx:13-19` vs `Footer.tsx:29` |

### P2 — Low

| # | Issue | Details | Files |
|---|-------|---------|-------|
| B6 | **No breadcrumbs on inner pages** | Article and service pages lack breadcrumb navigation. Minor — back links exist on articles. | `knowledge/[slug]/page.tsx` |
| B7 | **No article pagination** | Knowledge hub shows all articles in a flat grid. Fine for now (<20 articles) but won't scale. | `knowledge/page.tsx` |

### Positives (no action needed)

- Every page ends with a clear CTA (WhatsApp + Phone)
- Sticky mobile CTA bar appears after 600px scroll
- Contact form has good validation, honeypot, and success state
- Google Maps embed with Waze/Maps navigation buttons
- Homepage cross-links to all major sections

---

## C) Visual / RTL / Cross-Browser Audit

### Overall: EXCELLENT — no critical RTL issues found

| Area | Status | Notes |
|------|--------|-------|
| **Logical properties** | Pass | Uses `start/end`, `ps/pe`, `ms/me` throughout. Zero `left/right` violations. |
| **LTR spans** | Pass | Dedicated `<LTR>` component wraps all phone numbers, emails, fax. `dir="ltr"` on Header sticky CTA phone. |
| **HTML dir** | Pass | `<html lang="he" dir="rtl">` in layout.tsx:75 |
| **Mobile breakpoints** | Pass | Proper `sm:/md:/lg:` usage. No fixed widths causing overflow. `overflow-x-auto` on category pills is intentional. |
| **Sticky CTA overlap** | Pass | Z-index hierarchy correct: mobile menu (z-60) > header (z-50) > sticky CTA (z-40) > category filter (z-30) |
| **Animations** | Pass | All transforms are direction-agnostic (Y-axis, scale). `origin-right` on underlines correct for RTL. `prefers-reduced-motion` fully respected in globals.css. |
| **Images** | Pass | All use `next/image` with proper `sizes`, `fill`, `priority` on above-fold. No raw `<img>` tags. |

### P2 — Minor polish items

| # | Issue | Details | Files |
|---|-------|---------|-------|
| C1 | **Safari/iOS not tested** | RTL edge cases in Safari (flex gap, sticky positioning) should be manually verified. No code issues found, just untested. | — |
| C2 | **Mobile menu slide direction** | Uses `x: '100%'` which should slide from the left in RTL. CSS transforms auto-flip due to `dir="rtl"`, but worth a manual check on actual devices. | `Header.tsx:131-134` |

---

## D) Performance Regression Check (post-M10)

### Overall: No critical regressions. Well-optimized codebase.

| Area | Status | Notes |
|------|--------|-------|
| **Client components** | Acceptable | 25 `'use client'` components. Most justified (interactivity, animations). Homepage sections could theoretically be server components but impact is minimal. |
| **Tree-shaking** | Good | `motion` imported from `motion/react` (tree-shakeable). `lucide-react` uses named imports. |
| **Fonts** | Excellent | `next/font/google` with Heebo, `display: 'swap'`, Hebrew+Latin subsets only. |
| **Third-party scripts** | Clean | Only GA4 (afterInteractive) + Google Maps iframe (lazy). |
| **GROQ queries** | Good | Proper projections. ISR revalidation at 300s. |
| **next.config** | Optimal | `output: "standalone"`, Sanity CDN in `remotePatterns`. |
| **SEO/Metadata** | Excellent | All pages export metadata. JSON-LD for Organization, Article, FAQPage schemas. `generateMetadata` on dynamic pages. |

### P2 — Minor optimizations

| # | Issue | Details | Files |
|---|-------|---------|-------|
| D1 | **Unused `styled-components` dependency** | Installed but never imported. ~15KB wasted in node_modules (doesn't affect bundle but slows install). | `package.json` |
| D2 | **`force-dynamic` on article pages** | `knowledge/[slug]/page.tsx` uses `export const dynamic = 'force-dynamic'` for Hebrew slug encoding. Prevents static generation. Acceptable trade-off for now. | `knowledge/[slug]/page.tsx` |

---

## Proposed Fix Plan — PR Batches

Based on M11 scope, here are the recommended PRs. Items marked with `*` are from this QA report; the rest are from the M11 requirements.

### PR1: Founder Control Panel + Studio Hebrew (Phase 2)

**Scope:** SiteSettings singleton, centralized contact info, Studio customization

- Create `siteSettings` Sanity singleton with all contact/hours/CTA fields
- Wire Header, Footer, PhoneCTA, WhatsAppCTA, contact page, layout.tsx to read from SiteSettings (fixes **A1, A3**)
- Hebrew labels for all Sanity doc types and fields
- Grouped Studio navigation (הגדרות אתר, דף הבית, שירותים, etc.)
- Field descriptions so editors don't break layouts
- Make home/about/services/FAQ page content editable via Sanity
- Fix seed.ts hours to match (`08:30`) (**A7**)
- Fix LinkedIn dead link (**A5**)
- Standardize address format (**A6**)

### PR2: Webhook Revalidation (Phase 3)

**Scope:** Instant publishing without local commands

- Create `/api/revalidate` endpoint secured with shared secret
- Handle publish/unpublish of all content types → revalidate correct routes
- Document setup in `docs/revalidation.md`
- Add `SANITY_REVALIDATE_SECRET` to Dockerfile ARG/ENV

### PR3: Trust Module + Placements (Phase 4.1)

**Scope:** Reusable trust component, Sanity-driven

- "איך זה עובד בפועל" (4 steps)
- "שקיפות" (3–5 promises)
- "מה צריך להכין" (links to guides)
- Soft CTA (WhatsApp/phone)
- Place on Home + Services + Contact

### PR4: Editorial Templates + Print Styles (Phase 4.2, 4.4)

**Scope:** Article/playbook templates, print CSS

- Article template: TL;DR, difficulty level, checklist, "מה לעשות עכשיו", disclaimer
- Service playbook: who/what/process/docs/FAQs/related
- Print CSS: hide sticky CTA + animations, expand accordions, A4-friendly
- Hebrew SEO consistency check (H1/H2 anchor text)

### PR5: QA Fixes Batch (from this report)

**Scope:** All remaining issues from qa-m11.md

- **A2**: Wire contact form to email provider (or at minimum, POST to a serverless endpoint / Sanity document so leads aren't lost)
- **A4**: Soften fallback testimonial claims (remove specific numbers)
- **B1**: Either implement category filtering or remove the pills
- **B2**: Add related articles section to article pages
- **B3**: Make service cards link to anchors or detail views (or remove clickable affordance)
- **B4**: Create branded `not-found.tsx` with navigation
- **B5**: Add FAQ to header navigation
- **D1**: Remove unused `styled-components` from package.json

### PR6 (optional): Redirects + Final Polish

**Scope:** Legacy redirect safety net, if high-value paths identified

- Document recommended redirect list
- Implement ~10 most important redirects via `next.config.ts` `redirects()`
- Final cross-browser manual testing notes

---

## Summary

| Severity | Count | Category |
|----------|-------|----------|
| **P0 Critical** | 4 | A1 (hours), A2 (form), A3 (hardcoded info), B1 (fake filter) |
| **P1 High** | 6 | A4 (testimonials), A5 (LinkedIn), A6 (address), B2 (no related), B3 (cards), B4 (404), B5 (FAQ nav) |
| **P2 Low** | 6 | A7, A8, B6, B7, C1, C2, D1, D2 |
| **Pass** | RTL, animations, images, fonts, SEO, z-index, responsive, CTA coverage |

**Bottom line:** The codebase is solid — RTL, performance, and SEO are excellent. The main issues are (1) contact info scattered as hardcoded fallbacks (high mismatch risk), (2) contact form silently dropping leads, and (3) knowledge/services pages lacking cross-linking. All fixable within the M11 PR plan above.

---

*Waiting for approval before executing any fixes.*
