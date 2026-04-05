# Tools Section + Leasing Simulator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/tools` section with the first mini-app — a guided car leasing vs purchase simulator that recommends ליסינג תפעולי, ליסינג מימוני, or רכישת רכב based on user inputs.

**Architecture:** Client-side guided questionnaire (5 steps + results) rendered within the existing Next.js site. CMS-editable rates/copy via a new `tool` Sanity schema. SSR shell for SEO, `"use client"` simulator component for interactivity. Design follows existing Bitan tokens (navy/gold/white), mobile-first, RTL.

**Tech Stack:** Next.js 15, React 19, Tailwind 3 (existing tokens), Sanity v3, Framer Motion (existing), Lucide icons (existing)

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/sanity/schemas/tool.ts` | Sanity schema for tool documents (title, slug, SEO, config JSON, intro/result copy, disclaimer) |
| `src/app/(site)/tools/page.tsx` | Tools listing page — shows all published tools as cards |
| `src/app/(site)/tools/[slug]/page.tsx` | Tool detail page — SSR shell (metadata, SEO text below), renders the tool component |
| `src/components/tools/LeasingSimulator.tsx` | Main wizard: state machine, step navigation, progress bar, results |
| `src/components/tools/SimulatorStep.tsx` | Reusable step card — question + pill-button options |
| `src/components/tools/SimulatorResult.tsx` | Result display — recommendation card + comparison table + CTA |
| `src/components/tools/leasing-logic.ts` | Pure function: takes answers → returns recommendation + cost estimates |

### Modified Files

| File | Change |
|---|---|
| `src/sanity/schemas/index.ts` | Add `tool` to schema array |
| `src/sanity/queries.ts` | Add `getTools()` and `getToolBySlug()` queries |
| `src/sanity/types.ts` | Add `Tool` type |
| `src/components/Header.tsx` | Add "כלים" nav link between "שאלות נפוצות" and "צור קשר" |
| `src/app/(site)/sitemap.ts` | Add tool pages to sitemap |
| `src/sanity/deskStructure.ts` | Add tools section to Studio nav |

---

## Chunk 1: Infrastructure (Schema + Routes + Nav)

### Task 1: Sanity schema for tools

**Files:**
- Create: `src/sanity/schemas/tool.ts`
- Modify: `src/sanity/schemas/index.ts`
- Modify: `src/sanity/deskStructure.ts`

The `tool` schema stores:
- Standard fields: title, slug, excerpt, SEO, mainImage
- `toolType` string — identifies which React component to render (e.g. "leasing-simulator")
- `configJson` text field — JSON blob for CMS-editable rates/thresholds (parsed at runtime)
- `introBody` Portable Text — SEO-rich content shown below the tool
- `disclaimer` text

- [ ] **Step 1:** Create `src/sanity/schemas/tool.ts` with fields above
- [ ] **Step 2:** Add `tool` import to `src/sanity/schemas/index.ts`
- [ ] **Step 3:** Add "כלים" section to `src/sanity/deskStructure.ts`
- [ ] **Step 4:** Deploy schema: `NEXT_PUBLIC_SANITY_PROJECT_ID=ul4uwnp7 NEXT_PUBLIC_SANITY_DATASET=production npx sanity@latest schema deploy`

### Task 2: GROQ queries + types

**Files:**
- Modify: `src/sanity/queries.ts`
- Modify: `src/sanity/types.ts`

- [ ] **Step 1:** Add `Tool` type to `types.ts`:
```ts
export type Tool = {
  _id: string
  title: string
  slug: SanitySlug
  toolType: string
  excerpt?: string
  configJson?: string
  introBody?: PortableTextBlock[]
  disclaimer?: string
  mainImage?: SanityImageSource
  seoTitle?: string
  seoDescription?: string
}
```

- [ ] **Step 2:** Add queries to `queries.ts`:
```ts
const TOOLS_QUERY = `*[_type == "tool"] | order(order asc) { _id, title, slug, toolType, excerpt, mainImage }`
const TOOL_BY_SLUG_QUERY = `*[_type == "tool" && slug.current == $slug][0]{ ... }`
```

### Task 3: Route pages (listing + detail)

**Files:**
- Create: `src/app/(site)/tools/page.tsx` — listing page
- Create: `src/app/(site)/tools/[slug]/page.tsx` — detail page (SSR shell)

- [ ] **Step 1:** Create tools listing page with metadata, hero section, card grid (follows services page pattern)
- [ ] **Step 2:** Create tool detail page — loads tool from Sanity, renders appropriate component based on `toolType`, shows `introBody` Portable Text below the tool
- [ ] **Step 3:** Add "כלים" to nav links in `src/components/Header.tsx`
- [ ] **Step 4:** Add tools to sitemap in `src/app/(site)/sitemap.ts`

### Task 4: Seed the leasing tool document in Sanity

- [ ] **Step 1:** Create the tool document via Sanity MCP with:
  - title: "ליסינג או רכישה — סימולטור"
  - slug: "leasing-simulator"
  - toolType: "leasing-simulator"
  - configJson: JSON with default rates (see leasing-logic.ts config shape)
  - introBody: SEO content about the 3 options
  - disclaimer: standard CPA disclaimer

---

## Chunk 2: Leasing Logic (Pure Functions)

### Task 5: Decision engine

**Files:**
- Create: `src/components/tools/leasing-logic.ts`

Pure TypeScript, no React. Takes user answers + config → returns recommendation.

**Config shape (from CMS `configJson`):**
```ts
type LeasingConfig = {
  updatedAt: string // "2026-03"
  fringeBenefitRate: number // 0.0248
  depreciationRate: { min: number; max: number } // { min: 0.15, max: 0.25 }
  freelancerDeduction: { low: number; mid: number; full: number } // 0.45, 0.90, 1.0
  avgMonthlyRates: {
    operational: { low: number; mid: number; high: number; premium: number }
    financial: { low: number; mid: number; high: number; premium: number }
  }
  avgMaintenanceMonthlyCost: number
  loanInterestRate: number
}
```

**User answers:**
```ts
type SimulatorAnswers = {
  businessType: 'company' | 'freelancer' | 'private'
  period: '1-2' | '2-3' | '3-4' | '4+'
  priority: 'cost' | 'comfort' | 'flexibility'
  priceRange: 'under150' | '150-250' | '250-350' | '350-500' | '500plus' | number
  downPayment: 'none' | 'up-to-20' | '30-50'
}
```

**Output:**
```ts
type SimulatorResult = {
  recommendation: 'operational' | 'financial' | 'purchase'
  confidence: 'strong' | 'moderate' // strong = clear winner, moderate = close call
  monthlyEstimate: { operational: number; financial: number; purchase: number }
  totalEstimate: { operational: number; financial: number; purchase: number }
  taxNote: string // e.g. "כחברה, ההוצאה מוכרת במלואה"
  highlights: { operational: string[]; financial: string[]; purchase: string[] }
}
```

- [ ] **Step 1:** Define types (config, answers, result)
- [ ] **Step 2:** Implement `computeRecommendation(answers, config): SimulatorResult`
  - Scoring model: each answer contributes weighted points to each option
  - Cost estimates: based on price range × average rates from config
  - Tax note: derived from businessType
- [ ] **Step 3:** Export default config (used as fallback when CMS is empty)

---

## Chunk 3: UI Components

### Task 6: SimulatorStep component

**Files:**
- Create: `src/components/tools/SimulatorStep.tsx`

Reusable step card. Receives question text + options array. Renders pill-shaped buttons. Calls `onSelect` when user picks. Supports optional free-form input (for exact car price).

- [ ] **Step 1:** Build component with:
  - Question text (h2, navy, centered)
  - Options as large pill buttons (white bg, navy border, gold on hover/selected)
  - Optional text input (for "מחיר מדויק" when user wants specific number)
  - `onSelect(value)` callback
  - Entrance animation (fade up, subtle)

### Task 7: SimulatorResult component

**Files:**
- Create: `src/components/tools/SimulatorResult.tsx`

Renders the recommendation + comparison + CTA.

- [ ] **Step 1:** Build recommendation card:
  - Gold border, large icon, recommendation title + confidence badge
  - Monthly + total cost estimates
  - Tax benefit note
  - Key highlights (3 bullets)

- [ ] **Step 2:** Build comparison table:
  - 3 columns (operational / financial / purchase)
  - Recommended column highlighted with gold header
  - Rows: monthly cost, total cost, ownership, flexibility, certainty
  - Non-recommended columns slightly dimmed

- [ ] **Step 3:** Build CTA section:
  - "רוצים חישוב מדויק?" heading
  - WhatsApp + Phone CTAs (reuse existing components)
  - "או חזרו על הסימולציה" link to restart

### Task 8: LeasingSimulator (main wizard)

**Files:**
- Create: `src/components/tools/LeasingSimulator.tsx`

`"use client"` component. State machine with 5 steps + results.

- [ ] **Step 1:** Build wizard shell:
  - `currentStep` state (0-5, where 5 = results)
  - `answers` state object (accumulated from each step)
  - Progress bar at top (gold fill, step indicators)
  - Back button (except on step 0)

- [ ] **Step 2:** Wire up the 5 steps:
  - Step 0: סוג העסק (company/freelancer/private)
  - Step 1: תקופה משוערת (4 options)
  - Step 2: מה חשוב לך יותר? (cost/comfort/flexibility)
  - Step 3: מחיר רכב (ranges + "מחיר מדויק" input)
  - Step 4: מקדמה זמינה (none/up-to-20/30-50)

- [ ] **Step 3:** On final answer → call `computeRecommendation()` → show SimulatorResult
- [ ] **Step 4:** Step transitions: CSS transition (fade + slight slide), 300ms

### Task 9: Wire into detail page

- [ ] **Step 1:** In `tools/[slug]/page.tsx`, map `toolType === 'leasing-simulator'` → render `<LeasingSimulator config={parsedConfig} />`
- [ ] **Step 2:** Below the simulator, render `introBody` with PortableText (SEO content about leasing vs purchase)
- [ ] **Step 3:** Add disclaimer at bottom

---

## Chunk 4: Polish & Local Preview

### Task 10: Local testing

- [ ] **Step 1:** Run `npm run dev`
- [ ] **Step 2:** Verify `/tools` listing page renders
- [ ] **Step 3:** Verify `/tools/leasing-simulator` loads the wizard
- [ ] **Step 4:** Walk through all 5 steps + verify results render
- [ ] **Step 5:** Test mobile viewport (375px)
- [ ] **Step 6:** Test RTL alignment, Hebrew text
- [ ] **Step 7:** Open for user review — DO NOT commit/push until approved

---

## Design Specs (Reference)

### Colors (from tailwind.config.ts)
- Navy: `#1B2A4A` (bg-primary)
- Gold: `#C5A572` (bg-gold, text-gold)
- Surface: `#F8F7F4` (bg-surface)
- White: `#FFFFFF`
- Text: `#4A5568` (text-text-secondary)

### Progress Bar
- Full-width, 4px height, bg-border background
- Gold fill animating left-to-right per step (20% per step)
- Step indicators: small circles, filled gold for completed/current, gray for upcoming

### Option Buttons (Pills)
- `rounded-xl`, `border-2 border-border`, `px-6 py-4`
- Hover: `border-gold bg-gold/5`
- Selected: `border-gold bg-gold/10 text-primary font-bold`
- Text: `text-body-lg text-text-secondary`, centered

### Result Card
- `bg-white rounded-2xl border-2 border-gold shadow-lg p-space-7`
- Header: navy bg strip with gold icon + "ההמלצה שלנו"
- Body: recommendation name (h2), confidence badge, cost breakdown, highlights

### Comparison Table
- 3 columns, header row with option names
- Recommended column: gold top border, slightly larger text
- Other columns: `opacity-60`
- Rows alternate `bg-surface` / `bg-white`
