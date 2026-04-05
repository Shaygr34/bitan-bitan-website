# Bitan & Bitan — Codebase Technical Report

> Generated: March 15, 2026
> Version: V3.6
> Repository: `bitan-bitan-website` | Branch: `main` | Deploy: Railway (auto-deploy on push)

---

## 1. Architecture Overview

### Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15 |
| UI Library | React | 19 |
| Styling | Tailwind CSS | 3 |
| CMS | Sanity | v3 |
| Animation | motion (formerly framer-motion) | ^12.0.0 |
| CMS Integration | next-sanity | ^9.8.0 |
| Icons | lucide-react | ^0.469.0 |
| AI Image Gen | @google/genai | ^1.44.0 |
| Language | TypeScript | - |
| Deploy | Railway (Docker, standalone output) | - |

### Project Scale

- **11 pages** + embedded Sanity Studio
- **3 API routes**
- **15 Sanity schemas**
- **37 components**
- **80 articles**, 28+ FAQs, 11 services, 7 parent categories + 10 subcategories
- **124+ redirect rules** (WP migration)

### Route Map

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static (ISR 300s) | Homepage — Hero, TrustBar, Services, About, Process, Testimonials, Knowledge Preview, FAQ, CTA |
| `/about` | Static (ISR 300s) | About page — fully CMS-editable (13 fields), team grid |
| `/contact` | Static | Contact form + Google Maps |
| `/faq` | Static (ISR 300s) | FAQ page with client-side search/filter |
| `/knowledge` | Dynamic | Knowledge center — server-side filtering via URL params, pagination |
| `/knowledge/[slug]` | Dynamic (ISR 300s) | Article detail — full content, related articles, newsletter signup |
| `/services` | Static (ISR 300s) | Services listing |
| `/services/[slug]` | Dynamic (ISR 300s) | Service detail — processSteps, targetAudience, FAQs |
| `/privacy` | Static (ISR 300s) | Legal page (singleton) |
| `/terms` | Static (ISR 300s) | Legal page (singleton) |
| `/studio` | Client-side | Embedded Sanity Studio |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contact` | POST | Contact form — honeypot + validation, creates `contactLead` in Sanity. Email disabled (no Resend key). |
| `/api/newsletter` | POST | Newsletter signup — email validation + dupe check, creates `newsletterSubscriber` with category refs |
| `/api/revalidate` | POST | ISR webhook — secret validation, calls `revalidatePath` per document type |

### Key Architectural Decisions

1. **Server Components by default** — `'use client'` only for interactive components
2. **Centralized GROQ queries** — all in `src/sanity/queries.ts`
3. **CSS-first animations** — CSS keyframes for page transitions and hero stagger; Framer Motion for scroll reveals and interactive animations
4. **RTL-safe logical CSS** — `start/end` instead of `left/right`, `inset-inline-start` for positioning
5. **ISR 300s + webhook** — 5-minute static cache with on-demand revalidation from Sanity
6. **Category hierarchy** — one-level parent/child via self-referencing `category` schema
7. **Design tokens** — CSS custom properties in `bitan-tokens.css`, mapped to Tailwind config

---

## 2. Design System

### Token Architecture

Tokens flow through three layers:

```
bitan-tokens.css (CSS custom properties)
    -> tailwind.config.ts (Tailwind theme extension)
        -> Component classes (utility-first)
```

Source file: `src/styles/bitan-tokens.css`

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#1B2A4A` | Navy — dominant brand color (60-70% of viewport) |
| `primary-light` | `#2A3F6E` | Navy lighter — hover states |
| `gold` | `#C5A572` | Gold — accent lines, underlines, focus rings (5-10%) |
| `gold-hover` | `#B8955F` | Gold darker — CTA hover |
| `surface` | `#F8F7F4` | Off-white/warm gray — alternate sections |
| `callout` | `#F0EDE6` | Callout box background |
| `border` | `#E2E0DB` | Default border color |
| `border-light` | `#F0EDE6` | Lighter border |
| `text-secondary` | `#4A5568` | Secondary text |
| `text-muted` | `#718096` | Captions, meta |

**Brand rule**: Gold CTA button — max 1 per viewport. Color ratio: Navy 60-70%, Gold 5-10%, White/off-white 20-30%.

### Typography

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `h1` | 2.5rem (40px) | 1.3 | Page titles |
| `h2` | 2rem (32px) | 1.3 | Section headings |
| `h3` | 1.5rem (24px) | 1.3 | Card titles |
| `h4` | 1.25rem (20px) | 1.3 | Sub-headings |
| `body-lg` | 1.125rem (18px) | 1.6 | Lead paragraphs |
| `body` | 1rem (16px) | 1.6 | Body text |
| `body-sm` | 0.875rem (14px) | 1.6 | Small text, meta |
| `caption` | 0.75rem (12px) | 1.6 | Captions, labels |
| `nav` | 0.9375rem (15px) | 1.3 | Navigation links |

**Font**: Heebo (Google Fonts), loaded via Tailwind config `fontFamily.heebo`.

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| `space-1` | 0.25rem | 4px |
| `space-2` | 0.5rem | 8px |
| `space-3` | 0.75rem | 12px |
| `space-4` | 1rem | 16px |
| `space-5` | 1.5rem | 24px |
| `space-6` | 2rem | 32px |
| `space-7` | 2.5rem | 40px |
| `space-8` | 3rem | 48px |
| `space-9` | 4rem | 64px |
| `space-10` | 5rem | 80px |
| `space-11` | 6rem | 96px |
| `space-12` | 8rem | 128px |

### Other Tokens

**Border Radius**: `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `pill` (9999px)

**Shadows** (all use brand navy rgba):
- `sm`: `0 1px 2px rgba(27, 42, 74, 0.05)`
- `md`: `0 4px 6px rgba(27, 42, 74, 0.07), 0 2px 4px rgba(27, 42, 74, 0.04)`
- `lg`: `0 10px 15px rgba(27, 42, 74, 0.1), 0 4px 6px rgba(27, 42, 74, 0.05)`
- `xl`: `0 20px 25px rgba(27, 42, 74, 0.1), 0 10px 10px rgba(27, 42, 74, 0.04)`

**Max Widths**: `content` (1200px), `narrow` (800px)

**Transitions**: `fast` (150ms), `base` (250ms), `slow` (350ms)

**Layout**: Navbar desktop 72px, mobile 56px, mobile CTA bar 60px

---

## 3. Animation Catalog (Complete Code)

This section contains all 17 animation patterns used in the codebase, with full copy-pasteable source code.

### 3.1 Motion Tokens — `src/lib/motion.ts`

The shared animation configuration file. All Framer Motion variants and easing curves are defined here.

```typescript
/**
 * Motion configuration and shared variants.
 * Uses the `motion` package (formerly framer-motion).
 *
 * Timing guidelines:
 * - Micro-interactions: 150-200ms
 * - Section reveals: 500-700ms
 * - Stagger between items: 80-120ms
 * - Page transitions: 300-400ms
 */

import type { Variants, Transition } from 'motion/react'

/* --- Shared easing curves --- */
export const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

/* --- Default transition for reveals --- */
export const REVEAL_TRANSITION: Transition = {
  duration: 0.6,
  ease: EASE_OUT_QUART,
}

/* --- Section / element reveal variants --- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: REVEAL_TRANSITION,
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
}

/* --- Stagger container --- */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

/* --- Gold underline grow --- */
export const underlineGrow: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: EASE_OUT_QUART, delay: 0.2 },
  },
}

/* --- Counter / stat number --- */
export const statPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
}
```

### 3.2 useInView Hook — `src/hooks/useInView.ts`

Lightweight IntersectionObserver hook used by FadeIn and AnimatedCounter.

```typescript
'use client'

import { useRef, useState, useEffect } from 'react'

type UseInViewOptions = {
  /** Fraction of element visible before triggering (0-1). Default 0.1 */
  threshold?: number
  /** Fire only once. Default true */
  triggerOnce?: boolean
  /** Root margin string. Default '0px' */
  rootMargin?: string
}

/**
 * Lightweight IntersectionObserver hook.
 * Returns a ref to attach and a boolean `inView`.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, triggerOnce, rootMargin])

  return { ref, inView }
}
```

### 3.3 Pattern 1: Page Enter — CSS 400ms ease-out

Triggers on every route change via React `key={pathname}` remount. No JavaScript animation library needed.

**Component** — `src/components/PageTransition.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

/**
 * Global page entrance animation.
 * Uses pathname as React key -- when route changes, the div remounts,
 * which restarts the CSS animation. No external deps needed.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  )
}
```

**CSS** — in `src/app/globals.css`:

```css
/* --- Page transition --- */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-page-enter {
  animation: page-enter 400ms ease-out both;
}
```

### 3.4 Pattern 2: Fade-Up Reveal — Framer Motion 600ms

The primary scroll-reveal pattern. Wraps full-width sections with a fade-up animation triggered by `whileInView`.

**Component** — `src/components/ui/RevealSection.tsx`:

```tsx
'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealSectionProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * Wraps a full-width section with a fade-up reveal on scroll.
 * Uses `whileInView` with `once: true` so animation fires only the first time.
 */
export function RevealSection({
  children,
  className = '',
  variants = fadeUp,
}: RevealSectionProps) {
  return (
    <motion.section
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
```

**Variant** (from `motion.ts`):

```typescript
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
}
```

### 3.5 Pattern 3: Stagger Group — Framer Motion 100ms stagger

Reveals child items sequentially. Used for card grids, service lists, team members.

**Container** — `src/components/ui/RevealGroup.tsx`:

```tsx
'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { staggerContainer } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealGroupProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * A stagger container that reveals children sequentially.
 * Wrap RevealItem children inside this component.
 */
export function RevealGroup({
  children,
  className = '',
  variants = staggerContainer,
}: RevealGroupProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**Child Item** — `src/components/ui/RevealItem.tsx`:

```tsx
'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealItemProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * An individual item inside a RevealGroup.
 * Inherits stagger timing from the parent RevealGroup.
 */
export function RevealItem({
  children,
  className = '',
  variants = fadeUp,
}: RevealItemProps) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}
```

**Variant** (from `motion.ts`):

```typescript
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}
```

**Usage example** (TeamSection):

```tsx
<RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-5">
  {members.map((member) => (
    <RevealItem key={member._id}>
      <TeamMemberCard member={member} />
    </RevealItem>
  ))}
</RevealGroup>
```

### 3.6 Pattern 4: Hero Stagger — Framer Motion (Homepage)

Custom stagger container with 150ms between children. Uses `animate="visible"` (not `whileInView`) because the hero is always in the initial viewport.

**Component** — `src/components/homepage/HeroSection.tsx`:

```tsx
'use client'

import { motion } from 'motion/react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import { fadeUp, fadeIn, underlineGrow } from '@/lib/motion'

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

type HeroProps = {
  headline?: string
  subtitle?: string
  footerNote?: string
}

export function HeroSection({ headline, subtitle, footerNote }: HeroProps) {
  return (
    <section className="bg-primary py-space-9 md:py-space-10 px-6">
      <motion.div
        className="max-w-content mx-auto"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="text-white text-h1 font-bold leading-tight"
        >
          {headline ?? 'המומחים הפיננסיים של העסק שלכם'}
        </motion.h1>

        <motion.span
          variants={underlineGrow}
          className="gold-underline mt-4 origin-right"
        />

        <motion.p
          variants={fadeUp}
          className="text-white/85 text-body-lg mt-space-5 max-w-narrow"
        >
          {subtitle ??
            'משרד רואי חשבון ביטן את ביטן — רואי חשבון, יועצי מס ומשפטנים. ייעוץ מס, דוחות כספיים וליווי עסקי מקצועי.'}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-space-7">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          />
        </motion.div>

        <motion.p
          variants={fadeIn}
          className="text-white/60 text-body-sm mt-space-5"
        >
          {footerNote ?? 'רואי חשבון ומשפטנים · ייעוץ מס וליווי עסקי · תל אביב'}
        </motion.p>
      </motion.div>
    </section>
  )
}
```

### 3.7 Pattern 5: Hero Stagger — CSS-only (Subpage Heroes)

Pure CSS stagger for all 8 subpage hero sections. No JavaScript needed. Uses `nth-child` delays from 50ms to 450ms.

**CSS** — in `src/app/globals.css`:

```css
/* --- Hero stagger -- CSS-only entrance for subpage heroes --- */
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hero-underline-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.hero-animate > * {
  opacity: 0;
  animation: hero-fade-up 600ms ease-out both;
}
.hero-animate > *:nth-child(1) { animation-delay: 50ms; }
.hero-animate > *:nth-child(2) { animation-delay: 150ms; }
.hero-animate > *:nth-child(3) { animation-delay: 250ms; }
.hero-animate > *:nth-child(4) { animation-delay: 350ms; }
.hero-animate > *:nth-child(5) { animation-delay: 450ms; }
.hero-animate > .gold-underline {
  animation: hero-underline-grow 600ms ease-out 300ms both;
  transform-origin: right; /* RTL: grow from right */
}
```

**Usage**: Apply `hero-animate` class to any container. Direct children auto-stagger.

```html
<div class="hero-animate">
  <h1>Page Title</h1>
  <span class="gold-underline" />
  <p>Subtitle text</p>
</div>
```

### 3.8 Pattern 6: Underline Grow — Framer Motion scaleX 0 to 1

Gold decorative underline that grows from the right edge (RTL). 600ms with 200ms delay.

**Variant** (from `motion.ts`):

```typescript
export const underlineGrow: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: EASE_OUT_QUART, delay: 0.2 },
  },
}
```

**Usage**:

```tsx
<motion.span
  variants={underlineGrow}
  className="gold-underline mt-4 origin-right"
/>
```

The `origin-right` class ensures it grows from the right edge in RTL layouts. The `.gold-underline` class provides the visual styling (120px wide, 3px tall, gold color).

### 3.9 Pattern 7: Animated Counter — RAF 2000ms cubic ease-out

Counts from 0 to target number when scrolled into view. Uses `requestAnimationFrame` for smooth 60fps animation with a cubic ease-out curve.

**Component** — `src/components/AnimatedCounter.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
  /** Target number to animate to */
  target: number
  /** Suffix to append after animation (e.g. "+") */
  suffix?: string
  /** Prefix to prepend (e.g. "NIS") */
  prefix?: string
  /** Animation duration in ms. Default 2000 */
  duration?: number
  /** Additional class names */
  className?: string
}

/**
 * Animates a number from 0 to target when scrolled into view.
 * Uses ease-out curve, triggers once.
 */
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.3 })
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
```

**Usage** (TrustBar):

```tsx
<AnimatedCounter target={30} suffix="+" className="text-h2 font-bold text-gold" />
```

### 3.10 Pattern 8: FadeIn (useInView) — CSS transition 600ms

Lightweight alternative to RevealSection for simple fade-up effects. Uses IntersectionObserver + inline CSS transitions. No Framer Motion dependency.

**Component** — `src/components/FadeIn.tsx`:

```tsx
'use client'

import { type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
  children: ReactNode
  className?: string
  /** Delay in ms (useful for staggering siblings). Default 0 */
  delay?: number
}

/**
 * Lightweight scroll-triggered fade-in wrapper.
 * Uses IntersectionObserver (no external deps).
 * For most sections, prefer the existing RevealSection/RevealGroup system.
 */
export function FadeIn({ children, className = '', delay = 0 }: Props) {
  const { ref, inView } = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
```

**Usage with manual stagger**:

```tsx
<FadeIn delay={0}>First item</FadeIn>
<FadeIn delay={100}>Second item</FadeIn>
<FadeIn delay={200}>Third item</FadeIn>
```

### 3.11 Pattern 9: Stat Pop — Framer Motion scale 0.8 to 1

Scale-up animation for stat numbers and counters. 500ms with EASE_OUT_QUART.

**Variant** (from `motion.ts`):

```typescript
export const statPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  },
}
```

**Usage**: Apply as a variant to `motion.div` elements inside a `RevealGroup` or standalone with `whileInView`.

### 3.12 Pattern 10: Logo Crossfade — CSS 500ms opacity swap on scroll

Both dark and light logos are rendered absolutely positioned in the same container. At 80px scroll, opacity swaps. No layout shift because both images occupy the same space.

**Implementation** — in `src/components/Header.tsx`:

```tsx
// State: navBlurred triggers at 80px scroll
const [navBlurred, setNavBlurred] = useState(false)

// Both logos rendered simultaneously, crossfade via opacity
<Link href="/" className="shrink-0 relative w-[130px] md:w-[160px] h-[35px] md:h-[43px]">
  <Image
    src="/logo-header.png"
    alt="..."
    fill
    className={`object-contain object-right transition-opacity duration-500 ${
      navBlurred ? 'opacity-0' : 'opacity-100'
    }`}
    sizes="160px"
    priority
  />
  <Image
    src="/logo-light.png"
    alt="..."
    fill
    className={`object-contain object-right transition-opacity duration-500 ${
      navBlurred ? 'opacity-100' : 'opacity-0'
    }`}
    sizes="160px"
    priority
  />
</Link>
```

**Scroll handler** (RAF-throttled):

```tsx
useEffect(() => {
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const y = window.scrollY
      setScrolled(y > 0)
      setNavBlurred(y > 80)   // NAV_BLUR_THRESHOLD
      setShowStickyCTA(y > 600) // STICKY_CTA_THRESHOLD
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

### 3.13 Pattern 11: Mobile Menu — Framer Motion AnimatePresence

Panel slides from right (RTL start edge) with backdrop fade. Links stagger in with 50ms delay between each.

**Implementation** — in `src/components/Header.tsx`:

```tsx
<AnimatePresence>
  {mobileOpen && (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-primary/30"
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel -- slides from right (start edge in RTL) */}
      <motion.nav
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
        className="absolute top-0 end-0 h-full w-[280px] bg-white shadow-xl flex flex-col"
      >
        {/* Close button + logo header */}
        <div className="h-[var(--navbar-height-mobile)] flex items-center justify-between px-6 border-b border-border">
          <Image src="/logo-header.png" alt="..." width={130} height={35} className="w-[130px] h-auto" />
          <button type="button" onClick={() => setMobileOpen(false)} className="p-2 -m-2 text-primary cursor-pointer" aria-label="סגור תפריט">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Links with stagger */}
        <div className="flex flex-col py-space-4">
          {NAV_LINKS.map(({ label, href }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.25, ease: EASE_OUT_QUART }}
            >
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'block px-6 py-3 text-body-lg font-medium text-primary transition-colors duration-fast hover:bg-surface',
                  isActive(href) && 'border-e-[3px] border-gold bg-surface',
                ].filter(Boolean).join(' ')}
              >
                {label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.nav>
    </div>
  )}
</AnimatePresence>
```

**Key details**:
- Panel: 300ms slide, EASE_OUT_QUART
- Links: 250ms each, 50ms stagger (delay = 0.1 + i * 0.05)
- Backdrop: 200ms fade
- Body scroll locked while open (`document.body.style.overflow = 'hidden'`)

### 3.14 Pattern 12: Sticky CTA Bar — Framer Motion 300ms slide-up

Mobile-only CTA bar that slides up from bottom after scrolling past 600px. Contains WhatsApp + Phone buttons.

**Implementation** — in `src/components/Header.tsx`:

```tsx
<AnimatePresence>
  {showStickyCTA && (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border shadow-lg px-4 py-3 flex gap-3"
    >
      <a
        href={`https://wa.me/${whatsappClean}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body-sm py-2.5 rounded-lg hover:bg-gold-hover transition-colors"
      >
        <WhatsAppIcon className="h-4 w-4" />
        WhatsApp
      </a>
      <a
        href={`tel:${phoneTel}`}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-medium text-body-sm py-2.5 rounded-lg hover:bg-primary-light transition-colors"
      >
        <Phone className="h-4 w-4" />
        <span dir="ltr">{phone}</span>
      </a>
    </motion.div>
  )}
</AnimatePresence>
```

### 3.15 Pattern 13: Newsletter Accordion — Framer Motion height 0 to auto

Expand/collapse animation for the category picker in compact newsletter mode. 200ms duration.

**Implementation** — in `src/components/NewsletterSignup.tsx`:

```tsx
<AnimatePresence>
  {expanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="pt-space-4 space-y-space-3">
        {/* Name input + category pills */}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### 3.16 Pattern 14: WhatsApp Pulse — CSS infinite 3s pulse glow

Infinite pulse glow effect on the floating WhatsApp button. Green shadow expands and fades.

**CSS** — in `src/app/globals.css`:

```css
/* WhatsApp floating button pulse glow */
@keyframes whatsapp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(37, 211, 102, 0); }
}
.whatsapp-pulse {
  animation: whatsapp-pulse 3s ease-in-out infinite;
}
```

**Component** — `src/components/WhatsAppButton.tsx`:

```tsx
'use client'

import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { trackWhatsAppClick } from '@/lib/analytics'

/**
 * Floating WhatsApp button -- fixed bottom-left (natural for RTL).
 * Pulse glow animation, visible on all pages and viewports.
 */
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972527221111"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating_button')}
      aria-label="שלחו הודעה בוואטסאפ"
      className="fixed bottom-20 md:bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 whatsapp-pulse"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
```

### 3.17 Pattern 15: Team Card Hover — CSS 300ms lift + 500ms image zoom

CSS-only hover effect on team member cards. Card lifts (-translate-y-1) with shadow increase; image scales 1.03x.

**Implementation** — in `src/components/TeamSection.tsx`:

```tsx
<div className="group bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gold/30">
  {/* Photo */}
  <div className="relative aspect-[3/4] bg-primary/5 overflow-hidden">
    <Image
      src={imageUrl}
      alt={member.name}
      fill
      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  </div>
  {/* Info below */}
</div>
```

**Key details**:
- Card: `transition-all duration-300` for lift + shadow + border color
- Image: `transition-transform duration-500` for slower zoom
- `group` / `group-hover:` Tailwind pattern for parent-triggered child animation
- `overflow-hidden` on the image container clips the zoomed image

### 3.18 Pattern 16: Conveyor Belt — CSS 30s linear infinite

Dual-row logo scroller with opposite directions. Pauses on hover. Logos are grayscale until hovered.

**Tailwind Config** — keyframes in `tailwind.config.ts`:

```typescript
keyframes: {
  "scroll-left": {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(-50%)" },
  },
  "scroll-right": {
    from: { transform: "translateX(-50%)" },
    to: { transform: "translateX(0)" },
  },
},
animation: {
  "scroll-left": "scroll-left 30s linear infinite",
  "scroll-right": "scroll-right 30s linear infinite",
},
```

**Component** — `src/components/homepage/ClientLogosSection.tsx`:

```tsx
function ScrollRow({ logos, direction }: { logos: ClientLogo[]; direction: 'left' | 'right' }) {
  const animClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'

  return (
    <div className="overflow-hidden group">
      <div className={`flex gap-space-8 w-max group-hover:[animation-play-state:paused] ${animClass}`}>
        {/* Render logos twice for seamless loop */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-space-8" aria-hidden={copy === 1 || undefined}>
            {logos.map((logo) => <LogoItem key={`${copy}-${logo._id}`} logo={logo} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Logo item styling**: `grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100`

**Key details**:
- Content duplicated (rendered twice) for seamless infinite scroll
- `w-max` prevents flex wrapping
- `group-hover:[animation-play-state:paused]` pauses animation on hover
- Second copy has `aria-hidden` for accessibility
- Two rows scroll in opposite directions for visual interest

### 3.19 Pattern 17: Reduced Motion — Global Override

All animations are disabled when the user has `prefers-reduced-motion: reduce` enabled.

**CSS** — in `src/app/globals.css`:

```css
/* Respect user's reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

This nuclear approach ensures:
- All CSS animations complete instantly (0.01ms)
- All CSS transitions complete instantly
- Smooth scroll is disabled
- Framer Motion's own `prefers-reduced-motion` detection also handles its animations

### Animation Summary Table

| # | Pattern | Engine | Duration | Trigger | File(s) |
|---|---------|--------|----------|---------|---------|
| 1 | Page Enter | CSS | 400ms | Route change (key remount) | PageTransition.tsx, globals.css |
| 2 | Fade-Up Reveal | Framer Motion | 600ms | whileInView | RevealSection.tsx, motion.ts |
| 3 | Stagger Group | Framer Motion | 100ms stagger | whileInView | RevealGroup.tsx, RevealItem.tsx, motion.ts |
| 4 | Hero Stagger (FM) | Framer Motion | 150ms stagger | Page load (animate) | HeroSection.tsx, motion.ts |
| 5 | Hero Stagger (CSS) | CSS | 600ms + nth-child delays | Page load | globals.css |
| 6 | Underline Grow | Framer Motion | 600ms | Inherited from parent | motion.ts |
| 7 | Animated Counter | RAF | 2000ms | useInView | AnimatedCounter.tsx |
| 8 | FadeIn (useInView) | CSS transition | 600ms | useInView | FadeIn.tsx |
| 9 | Stat Pop | Framer Motion | 500ms | Inherited from parent | motion.ts |
| 10 | Logo Crossfade | CSS | 500ms | Scroll > 80px | Header.tsx |
| 11 | Mobile Menu | Framer Motion | 300ms panel, 250ms links | User interaction | Header.tsx |
| 12 | Sticky CTA Bar | Framer Motion | 300ms | Scroll > 600px | Header.tsx |
| 13 | Newsletter Accordion | Framer Motion | 200ms | User interaction | NewsletterSignup.tsx |
| 14 | WhatsApp Pulse | CSS | 3s infinite | Always | globals.css, WhatsAppButton.tsx |
| 15 | Team Card Hover | CSS | 300ms/500ms | Hover | TeamSection.tsx |
| 16 | Conveyor Belt | CSS | 30s infinite | Always | tailwind.config.ts, ClientLogosSection.tsx |
| 17 | Reduced Motion | CSS | 0.01ms override | System preference | globals.css |

---

## 4. Component Library

### Component Inventory (37 components)

| Component | Path | Type | Description |
|-----------|------|------|-------------|
| `Header` | `src/components/Header.tsx` | Client | Sticky navbar, mobile menu, logo crossfade, sticky CTA |
| `Footer` | `src/components/Footer.tsx` | Server | 3-column footer with gold diamond bullets |
| `PageTransition` | `src/components/PageTransition.tsx` | Client | Global page entrance animation |
| `WhatsAppButton` | `src/components/WhatsAppButton.tsx` | Client | Floating button with pulse glow |
| `AnimatedCounter` | `src/components/AnimatedCounter.tsx` | Client | RAF-powered number counter |
| `FadeIn` | `src/components/FadeIn.tsx` | Client | Lightweight scroll fade-in |
| `TeamSection` | `src/components/TeamSection.tsx` | Server | Team grid with hover cards |
| `NewsletterSignup` | `src/components/NewsletterSignup.tsx` | Client | Compact/full modes, category pills |
| `KnowledgeSearch` | `src/components/KnowledgeSearch.tsx` | Client | Search with keyboard nav, ARIA combobox |
| `SiteSettingsContext` | `src/components/SiteSettingsContext.tsx` | Client | React context for global settings |

**UI Primitives** (`src/components/ui/`):

| Component | Description |
|-----------|-------------|
| `RevealSection` | Framer Motion whileInView section wrapper |
| `RevealGroup` | Stagger container for child items |
| `RevealItem` | Individual item inside RevealGroup |
| `SectionHeader` | Standardized section heading with gold underline |
| `WhatsAppCTA` | WhatsApp call-to-action button |
| `PhoneCTA` | Phone call-to-action button |

**Homepage Sections** (`src/components/homepage/`):

| Component | Description |
|-----------|-------------|
| `HeroSection` | Homepage hero with Framer Motion stagger |
| `ClientLogosSection` | Conveyor belt logo scroller |
| `TestimonialsSection` | Elfsight widget wrapper |
| (+ additional homepage section components) | Services, About, Process, TrustBar, Knowledge Preview, FAQ, CTA, TrustModule |

**Page-Specific**:

| Component | Path | Description |
|-----------|------|-------------|
| `CategoryFilter` | `src/app/(site)/knowledge/CategoryFilter.tsx` | Two-row parent/subcategory pills, URL-based |
| `Pagination` | `src/app/(site)/knowledge/Pagination.tsx` | Page-based with ellipsis |
| `FAQFilterable` | `src/app/(site)/faq/FAQFilterable.tsx` | Client-side FAQ search with debounce |

---

## 5. Sanity CMS Architecture

### Schema Overview (15 schemas)

| Schema | Type | Key Fields | Notes |
|--------|------|------------|-------|
| `article` | Document | title, slug, body, category, author, tags, image, downloadableFile, contentType | PDF download support |
| `service` | Document | title, slug, body, processSteps, targetAudience, faqs, headerImage | Rich service pages |
| `category` | Document | title, slug, parent (self-ref) | One-level parent/child hierarchy |
| `faq` | Document | question, answer | Client-side searchable |
| `teamMember` | Document | name, role, bio, image, order | Ordered grid display |
| `author` | Document | name, slug, bio, image | Article author reference |
| `tag` | Document | title, slug | Article tagging |
| `testimonial` | Document | name, company, quote, rating | Backup (Elfsight used instead) |
| `contactLead` | Document | name, email, phone, message, source | Form submissions |
| `clientLogo` | Document | companyName, logo, url, order | Conveyor belt logos |
| `newsletterSubscriber` | Document | email, name, categories[] | Category-based subscriptions |
| `homePage` | Singleton | headline, subtitle, footerNote, sections | `_id: 'homePage'` |
| `aboutPage` | Singleton | 13 fields (title, bio, team intro, etc.) | Fully CMS-editable |
| `legalPage` | Singleton | title, body | Privacy + Terms |
| `siteSettings` | Singleton | phone, whatsapp, address, socials, GA4 ID | `_id: 'siteSettings'` |

### GROQ Patterns

All queries are centralized in `src/sanity/queries.ts`. Key patterns:

- **Category hierarchy with article counts**: Parent categories include subcategory article counts
- **Singleton fetching**: `*[_id == "homePage"][0]` pattern
- **Related articles**: Query by shared category, exclude current article
- **File asset dereferencing**: `"fileUrl": downloadableFile.asset->url` for PDF downloads
- **ISR revalidation**: All fetch calls use `{ next: { revalidate: 300 } }`

### Type Mapping

TypeScript types in `src/sanity/types.ts` mirror GROQ projections exactly. This ensures type safety between CMS data and component props without runtime validation overhead.

### Desk Structure

Hierarchical Studio navigation with Hebrew labels:

```
Site Settings (singleton editor)
Homepage (singleton editor)
About (singleton editor)
Categories
  -> Parent categories
    -> Subcategories (filtered by parent)
Articles
Services
FAQs
Team Members
Authors
Tags
Testimonials
Client Logos
Contact Leads
Newsletter Subscribers
Legal Pages
```

Defined in `src/sanity/deskStructure.ts`.

---

## 6. Integrations

### Contact Form

| Aspect | Detail |
|--------|--------|
| Endpoint | `POST /api/contact` |
| Spam protection | Honeypot field (hidden input) |
| Validation | Server-side name/email/message validation |
| Storage | Creates `contactLead` document in Sanity |
| Email | Disabled (no `RESEND_API_KEY` configured) |

### Newsletter

| Aspect | Detail |
|--------|--------|
| Endpoint | `POST /api/newsletter` |
| Validation | Email format check + duplicate detection in Sanity |
| Storage | Creates `newsletterSubscriber` with category references |
| Distribution | Summit CRM (app.sumit.co.il) — manual HTML paste |
| Templates | 3 branded HTML templates in `outputs/` directory |
| Modes | Compact (inline on `/knowledge`) and full (sidebar on `/knowledge/[slug]`) |

### ISR Revalidation

| Aspect | Detail |
|--------|--------|
| Endpoint | `POST /api/revalidate` |
| Auth | `SANITY_REVALIDATE_SECRET` must match webhook config |
| Behavior | Calls `revalidatePath()` per document type |
| Default TTL | 300 seconds (5 minutes) |

### Google Analytics 4

| Aspect | Detail |
|--------|--------|
| Loading | `afterInteractive` strategy |
| Events | 12 custom event types (debounced) |
| Helpers | `src/lib/analytics.ts` — `trackWhatsAppClick`, `trackPhoneClick`, `trackKnowledgeSearch`, `trackNewsletterSignup`, etc. |

### Structured Data (JSON-LD)

| Type | Page | Notes |
|------|------|-------|
| `AccountingService` | Homepage | Business info, address, phone |
| `Article` | Article pages | Title, author, dates, image |
| ~~`BreadcrumbList`~~ | — | Missing (see Technical Debt) |
| ~~`FAQPage`~~ | — | Missing (see Technical Debt) |

---

## 7. Performance & SEO

### Metadata

- Dynamic metadata from Sanity per page
- Title template: `%s | ביטן את ביטן`
- Locale: `he_IL`
- OG images: 1200x630 from Sanity with fallback to `/og-image.png` (generated with sharp + real logo)

### Image Optimization

- `next/image` with Sanity CDN URLs
- `sizes` attribute on all images for responsive loading
- `priority` on above-fold images (hero, logo)
- Hotspot support from Sanity image metadata

### Caching Strategy

```
Request -> ISR Cache (300s TTL) -> Sanity CDN
                                     |
                  Webhook POST /api/revalidate
                  (on Sanity document publish)
```

### Redirects

- 124+ rules in `next.config.ts`
- Specific WP URL to new article slug mappings
- Catch-all patterns for old WP URL structures
- All permanent (308) redirects

### Missing SEO Items

- No `sitemap.ts` (Next.js built-in)
- No `robots.ts` (Next.js built-in)
- No `BreadcrumbList` JSON-LD
- No `FAQPage` JSON-LD (missed opportunity on `/faq`)
- Font loaded via Tailwind config, not `next/font` (misses font optimization)

---

## 8. Patterns for Tetra (Reusable vs Project-Specific)

### REUSABLE — Framework-Level Patterns

These patterns are generic and can be extracted into a shared component library or project template.

| Pattern | Files | Why Reusable |
|---------|-------|--------------|
| **Motion tokens** | `motion.ts` | Easing curves, reveal/stagger variants — universal |
| **useInView hook** | `useInView.ts` | Zero-dep IntersectionObserver — works everywhere |
| **RevealSection/Group/Item** | `ui/Reveal*.tsx` | Composable scroll-reveal system — any content |
| **PageTransition** | `PageTransition.tsx` | CSS key-remount pattern — any Next.js app |
| **FadeIn** | `FadeIn.tsx` | Lightweight alternative to Framer Motion reveals |
| **AnimatedCounter** | `AnimatedCounter.tsx` | RAF counter — any stats/numbers section |
| **Hero CSS stagger** | `globals.css .hero-animate` | Drop-in CSS — any subpage hero |
| **Reduced motion override** | `globals.css @media` | Accessibility — every project needs this |
| **Logo crossfade** | Header.tsx pattern | Dual-image opacity swap — any sticky header |
| **Mobile menu slide** | Header.tsx pattern | AnimatePresence panel + link stagger |
| **Sticky CTA bar** | Header.tsx pattern | Mobile conversion — any service site |
| **Conveyor belt** | ClientLogosSection.tsx + tailwind keyframes | Logo/partner scroller — any B2B site |
| **Card hover lift** | TeamSection.tsx `group` pattern | Tailwind group-hover — any card grid |
| **WhatsApp pulse** | globals.css + WhatsAppButton.tsx | Israeli market standard |
| **Design tokens CSS** | `bitan-tokens.css` | Token architecture pattern (CSS vars -> Tailwind) |
| **ISR + webhook revalidation** | `/api/revalidate` | Sanity + Next.js pattern — every CMS project |
| **Newsletter accordion** | AnimatePresence height animation | Expand/collapse — any form |

### PROJECT-SPECIFIC — Bitan-Only Patterns

These patterns contain business logic, Hebrew content, or brand-specific decisions that should NOT be copied blindly.

| Pattern | Why Project-Specific |
|---------|---------------------|
| **Color values** (navy #1B2A4A, gold #C5A572) | Bitan brand — Tetra has its own palette |
| **Heebo font** | Hebrew body font choice — Tetra may use different |
| **Category hierarchy** (parent/child) | Bitan's content model — Tetra is single-page |
| **Knowledge Center server-side filtering** | Multi-page article site — Tetra doesn't have this |
| **WP migration redirects** (124 rules) | Bitan's legacy — Tetra starts fresh |
| **Summit CRM newsletter** | Bitan's email provider — not transferable |
| **Elfsight testimonials** | External widget dependency — avoid |
| **Gold diamond bullets** | Bitan brand element (CSS `::before` diamonds) |
| **ContactLead + honeypot** | Specific form implementation — adapt per project |
| **Print styles** | Bitan-specific print optimization |
| **GA4 event types** (12 events) | Bitan's tracking plan — Tetra needs its own |
| **OG image generation script** | Uses Bitan's logo — needs brand swap |

### Extraction Recommendations for Tetra

1. **Copy verbatim**: `motion.ts`, `useInView.ts`, `RevealSection.tsx`, `RevealGroup.tsx`, `RevealItem.tsx`, `PageTransition.tsx`, `FadeIn.tsx`, `AnimatedCounter.tsx`
2. **Copy and adapt colors/font**: `bitan-tokens.css` structure, `tailwind.config.ts` token integration
3. **Copy CSS keyframes**: `page-enter`, `hero-fade-up`, `hero-underline-grow`, `whatsapp-pulse`, reduced motion override, `scroll-left`/`scroll-right`
4. **Copy pattern, rewrite content**: Header (logo crossfade + mobile menu + sticky CTA), ISR webhook, WhatsAppButton
5. **Do not copy**: WP redirects, category hierarchy, knowledge center filtering, print styles, Elfsight integration

---

## 9. Technical Debt & Warnings

### Critical

| Issue | Impact | Remediation |
|-------|--------|-------------|
| No `sitemap.ts` | SEO — search engines can't discover all pages | Add Next.js `app/sitemap.ts` with dynamic article/service URLs |
| No `robots.ts` | SEO — no crawl directives | Add Next.js `app/robots.ts` allowing all, disallowing `/studio` |
| Contact form email disabled | Leads stored in Sanity but no notification sent | Set `RESEND_API_KEY` + `CONTACT_EMAIL_TO` env vars on Railway |

### Moderate

| Issue | Impact | Remediation |
|-------|--------|-------------|
| No test suite | No regression safety net | Add Vitest + React Testing Library |
| No CI/CD pipeline | Manual deploy only (Railway auto-deploy on push) | Add GitHub Actions for lint + type-check + test |
| WhatsApp button uses `left-6` | Not RTL-safe (should be `start-6`) | Replace with `inset-inline-start: 1.5rem` or `start-6` |
| Google Maps may be misconfigured | `/contact` page map may show rejection | Verify API key referrer whitelist includes production domain |
| Elfsight testimonials (external) | Third-party dependency with no fallback | 14 testimonial docs exist in Sanity — build native component |
| Font via Tailwind config (not `next/font`) | Misses Next.js font optimization (preload, size-adjust) | Migrate to `next/font/google` with Heebo |

### Low

| Issue | Impact | Remediation |
|-------|--------|-------------|
| Newsletter stored in Sanity only | No email service integration | Phase 2: Resend API for automated sends |
| Partner photos are placeholders | Waiting on founders | Non-blocking — swap when provided |
| Client logos section hidden | Returns null when no logos | Non-blocking — appears when logos uploaded |
| Missing `FAQPage` JSON-LD | SEO — FAQ rich results not eligible | Add JSON-LD to `/faq` page |
| Missing `BreadcrumbList` JSON-LD | SEO — no breadcrumb rich results | Add to article + service detail pages |

---

*End of report. Last updated: March 15, 2026.*
