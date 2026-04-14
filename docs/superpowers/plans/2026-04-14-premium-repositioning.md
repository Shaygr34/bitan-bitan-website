# Premium Repositioning Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the Bitan & Bitan website from "accessible SMB accounting firm" to "premium prestige CPA practice" by removing aggressive CTAs, WhatsApp-forward contact patterns, and over-explained process sections — while keeping the design system, content engine, and tools intact.

**Architecture:** Surgical changes across ~15 files. No new pages, no schema changes, no new dependencies. We remove/replace CTA components, rewrite copy, simplify the homepage section order, and refine the contact flow. The Elfsight widget stays for now (logo/testimonial replacement is a separate future task).

**Tech Stack:** Next.js 15, React 19, Tailwind 3, Framer Motion, Sanity v3 (no schema changes)

---

## Chunk 1: Remove Global WhatsApp & Mobile CTA Bar

### Task 1: Remove floating WhatsApp button from layout

**Files:**
- Modify: `src/app/(site)/layout.tsx`
- No deletion of `WhatsAppButton.tsx` yet (keep file, just remove usage)

- [ ] **Step 1: Remove WhatsApp import and component from layout**

In `src/app/(site)/layout.tsx`, remove the import:
```tsx
import { WhatsAppButton } from '@/components/WhatsAppButton'
```
And remove `<WhatsAppButton />` from the JSX (appears after `<Footer />`).

- [ ] **Step 2: Remove pulse animation CSS**

In `src/app/globals.css`, remove the `.whatsapp-pulse` keyframe and class (around line 138).

- [ ] **Step 3: Verify locally**

Run: `npm run dev` — confirm no green pulsing button on any page.

- [ ] **Step 4: Commit**

```bash
git add src/app/(site)/layout.tsx src/app/globals.css
git commit -m "Remove floating WhatsApp button from all pages"
```

### Task 2: Remove sticky mobile CTA bar from Header

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Remove the mobile sticky CTA bar**

In `src/components/Header.tsx`, find the section around lines 213-243 that renders the fixed-bottom mobile CTA bar (two buttons: WhatsApp + Phone). Remove the entire block. Also remove the scroll state (`showMobileCTA`) and its `useEffect` if they become unused.

- [ ] **Step 2: Verify on mobile viewport**

Dev tools → mobile viewport → scroll down. No sticky bar should appear.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "Remove sticky mobile CTA bar from header"
```

---

## Chunk 2: Rewrite Homepage CTAs & Sections

### Task 3: Rewrite HeroSection — remove WhatsApp, add single premium CTA

**Files:**
- Modify: `src/components/homepage/HeroSection.tsx`

- [ ] **Step 1: Replace CTA buttons with single contact link**

Replace the WhatsAppCTA + PhoneCTA block with a single, understated button:
```tsx
<motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-space-7">
  <a
    href="/contact"
    className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-accent/90 transition-colors"
  >
    לתיאום פגישה
  </a>
</motion.div>
```

- [ ] **Step 2: Update default footer note**

Change the default footerNote from:
```
'רואי חשבון ומשפטנים · ייעוץ מיסוי וליווי עסקי · תל אביב'
```
To:
```
'רואי חשבון ומשפטנים · דור שני · תל אביב'
```

- [ ] **Step 3: Remove WhatsAppCTA and PhoneCTA imports**

Remove unused imports from the file.

- [ ] **Step 4: Commit**

```bash
git add src/components/homepage/HeroSection.tsx
git commit -m "Rewrite hero CTA — single premium contact button"
```

### Task 4: Rewrite CTASection — premium tone

**Files:**
- Modify: `src/components/homepage/CTASection.tsx`

- [ ] **Step 1: Replace content and CTAs**

Replace the WhatsApp+Phone buttons with a single contact link. Update default copy:
- headline: `'ביטן את ביטן — לשירותכם'`
- subtitle: `'נשמח להכיר את העסק שלכם ולבחון כיצד נוכל לסייע.'`
- Remove the `footerNote` entirely (the "ללא התחייבות · תשובה תוך 24 שעות · שיחה חינם" line).

```tsx
<motion.div
  variants={fadeUp}
  className="flex flex-wrap justify-center gap-4 mt-space-7"
>
  <a
    href="/contact"
    className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-accent/90 transition-colors"
  >
    לתיאום פגישה
  </a>
  <a
    href="tel:+97235174295"
    className="inline-flex items-center gap-2 px-8 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
  >
    03-5174295
  </a>
</motion.div>
```

- [ ] **Step 2: Remove WhatsAppCTA/PhoneCTA imports**

- [ ] **Step 3: Commit**

```bash
git add src/components/homepage/CTASection.tsx
git commit -m "Rewrite CTA section — premium tone, remove anxiety language"
```

### Task 5: Remove ProcessSection from homepage

**Files:**
- Modify: `src/app/(site)/page.tsx`

- [ ] **Step 1: Remove ProcessSection from homepage render**

In the homepage, remove the `<ProcessSection>` component. The process is explained enough via service pages. Keep the import cleanup too.

The homepage section order becomes:
1. HeroSection
2. TrustBar
3. ServicesSection
4. AboutSection
5. TestimonialsSection (Elfsight — stays for now)
6. ClientLogosSection (hidden until logos exist — stays)
7. KnowledgePreview
8. TrustModule (with showProcess=false, showPrepare=false, showCTA=false — already configured)
9. FAQSection
10. CTASection (rewritten)

- [ ] **Step 2: Commit**

```bash
git add src/app/(site)/page.tsx
git commit -m "Remove process section from homepage — reduce over-explanation"
```

---

## Chunk 3: Rewrite Page-Level CTAs

### Task 6: Rewrite About page CTA

**Files:**
- Modify: `src/app/(site)/about/page.tsx`

- [ ] **Step 1: Find the bottom CTA section** (~lines 286-316)

Replace "רוצים להכיר אותנו?" + "נשמח לשבת איתכם לפגישת היכרות ללא עלות" with:
- Heading: `"לתיאום פגישה"`
- Subtitle: `"נשמח להכיר את העסק שלכם."`
- Single button: `<a href="/contact">פנו אלינו</a>` (styled like hero CTA)
- Remove WhatsAppCTA + PhoneCTA imports if now unused.

- [ ] **Step 2: Remove defensive differentiator language**

Find `FALLBACK_DIFFERENTIATORS` or similar. Rewrite:
- "תמיד תדברו ישירות עם רואה חשבון, לא עם מזכירה" → "מענה ישיר מצוות המשרד"
- "זמינות גבוהה וחזרה מהירה — כי אנחנו יודעים שזמן שלכם שווה כסף" → "זמינות ומענה מקצועי"

- [ ] **Step 3: Commit**

```bash
git add src/app/(site)/about/page.tsx
git commit -m "Rewrite about page CTA — premium tone, remove defensive language"
```

### Task 7: Rewrite Services pages CTAs

**Files:**
- Modify: `src/app/(site)/services/page.tsx`
- Modify: `src/app/(site)/services/[slug]/page.tsx`

- [ ] **Step 1: Services listing page** — replace bottom CTA

Replace "צריכים שירות מקצועי?" + WhatsApp/Phone with:
- Heading: `"לפרטים נוספים"`
- Button: `<a href="/contact">פנו למשרד</a>`

- [ ] **Step 2: Service detail page** — replace bottom CTA

Replace "בואו נדבר" + WhatsApp/Phone with:
- Heading: `"מעוניינים בשירות זה?"`
- Button: `<a href="/contact">לתיאום פגישה</a>`

- [ ] **Step 3: Remove process steps from services listing** (~lines 160-186)

The 4-step accordion "איך התהליך עובד" on the services listing page. Remove it.

- [ ] **Step 4: Remove WhatsAppCTA/PhoneCTA imports from both files**

- [ ] **Step 5: Commit**

```bash
git add src/app/(site)/services/page.tsx src/app/(site)/services/[slug]/page.tsx
git commit -m "Rewrite service page CTAs — premium, remove process accordion"
```

### Task 8: Rewrite Knowledge article CTA

**Files:**
- Modify: `src/app/(site)/knowledge/[slug]/page.tsx`

- [ ] **Step 1: Replace bottom CTA**

Replace "צריכים ייעוץ מקצועי?" + WhatsApp-only CTA with:
- Subtitle: `"לשאלות בנושא — 03-5174295"`
- One subtle link: `<a href="/contact">או פנו אלינו</a>`
- Remove WhatsAppCTA import.

- [ ] **Step 2: Commit**

```bash
git add src/app/(site)/knowledge/[slug]/page.tsx
git commit -m "Rewrite knowledge article CTA — phone + subtle contact link"
```

### Task 9: Rewrite Tools page CTA

**Files:**
- Modify: `src/app/(site)/tools/page.tsx`

- [ ] **Step 1: Replace bottom CTA**

Replace "צריכים ייעוץ אישי?" + WhatsApp/Phone with:
- Heading: `"לחישוב מדויק המותאם למצב שלכם"`
- Button: `<a href="/contact">פנו למשרד</a>` + phone text `03-5174295`

- [ ] **Step 2: Remove WhatsAppCTA/PhoneCTA imports**

- [ ] **Step 3: Commit**

```bash
git add src/app/(site)/tools/page.tsx
git commit -m "Rewrite tools CTA — professional inquiry, remove WhatsApp"
```

### Task 10: Rewrite FAQ page CTA (if present)

**Files:**
- Modify: `src/app/(site)/faq/page.tsx`

- [ ] **Step 1: Check for CTA section and rewrite if present**

Same pattern: remove WhatsApp, replace with contact page link + phone.

- [ ] **Step 2: Commit**

```bash
git add src/app/(site)/faq/page.tsx
git commit -m "Rewrite FAQ page CTA — consistent premium tone"
```

---

## Chunk 4: Simplify Contact Page & Footer

### Task 11: Refactor contact page

**Files:**
- Modify: `src/app/(site)/contact/page.tsx`

- [ ] **Step 1: Remove WhatsApp from contact methods**

Remove the WhatsApp link from the contact methods list. Keep: Phone, Email, Address.

- [ ] **Step 2: Remove the triple CTA buttons**

Remove the 3 buttons (WhatsApp + Phone + Email). The form IS the CTA.

- [ ] **Step 3: Rewrite form heading**

Change "השאירו פרטים" to "פנייה למשרד"

- [ ] **Step 4: Remove TrustModule process/prepare sections if shown**

If TrustModule is rendered with showProcess/showPrepare on contact page, set both to false or remove.

- [ ] **Step 5: Remove Waze/Google Maps branded buttons**

Replace with a simple text link: "הגעה למשרד" linking to Google Maps.

- [ ] **Step 6: Commit**

```bash
git add src/app/(site)/contact/page.tsx
git commit -m "Simplify contact page — form-focused, remove WhatsApp and branded buttons"
```

### Task 12: Simplify Footer

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Remove WhatsApp link from footer**

Remove the WhatsApp wa.me link. Keep: phone, email, address.

- [ ] **Step 2: Remove fax number**

Fax is dated. Remove from display.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "Simplify footer — remove WhatsApp and fax"
```

---

## Chunk 5: TrustModule Cleanup & Final Polish

### Task 13: Simplify TrustModule

**Files:**
- Modify: `src/components/TrustModule.tsx`

- [ ] **Step 1: Remove "איך זה עובד בפועל?" process section**

The process steps in TrustModule are the 5th redundant explanation. Remove Section 1 entirely or gate it behind `showProcess` prop (already exists, just ensure it's false everywhere).

- [ ] **Step 2: Remove "מה צריך להכין?" section**

Same — gate behind `showPrepare` prop or remove.

- [ ] **Step 3: Rewrite soft CTA**

Change "יש שאלות? נשמח לעזור — בלי התחייבות" to:
"ביטן את ביטן · 03-5174295" — just the brand name and phone number.

- [ ] **Step 4: Remove WhatsAppCTA/PhoneCTA imports if now unused**

- [ ] **Step 5: Commit**

```bash
git add src/components/TrustModule.tsx
git commit -m "Simplify TrustModule — remove process/prepare, rewrite CTA"
```

### Task 14: Final verification + push

- [ ] **Step 1: Run dev server and audit every page**

Check: homepage, about, services, service detail, knowledge, article detail, tools, tool detail, contact, FAQ. Ensure:
- No WhatsApp buttons/links anywhere (except maybe raw phone in footer)
- No "ללא התחייבות" or "חינם" or "מוכנים להתחיל?" language
- All CTAs route to /contact or show phone number
- No broken imports or missing components

- [ ] **Step 2: Run build**

```bash
npm run build
```
Expected: clean build, no errors.

- [ ] **Step 3: Push to main**

```bash
git push origin main
```
Railway auto-deploys.

- [ ] **Step 4: Verify on bitancpa.com**

Open every page in browser and confirm changes are live.

- [ ] **Step 5: Final commit if any cleanup needed**

---

## Summary of Changes

| File | Change |
|------|--------|
| `layout.tsx` | Remove WhatsAppButton |
| `globals.css` | Remove pulse animation |
| `Header.tsx` | Remove mobile CTA bar |
| `HeroSection.tsx` | Single "לתיאום פגישה" button |
| `CTASection.tsx` | Premium tone, remove anxiety text |
| `page.tsx` (homepage) | Remove ProcessSection |
| `about/page.tsx` | Rewrite CTA + differentiators |
| `services/page.tsx` | Rewrite CTA, remove process accordion |
| `services/[slug]/page.tsx` | Rewrite CTA |
| `knowledge/[slug]/page.tsx` | Phone + subtle link instead of WhatsApp |
| `tools/page.tsx` | Rewrite CTA |
| `faq/page.tsx` | Rewrite CTA |
| `contact/page.tsx` | Simplify, remove WhatsApp + branded buttons |
| `Footer.tsx` | Remove WhatsApp + fax |
| `TrustModule.tsx` | Simplify, rewrite CTA |

**Files NOT touched:** All calculator/tool components, content factory, Sanity schemas, newsletter, analytics, intake system, scripts, CI/CD.
