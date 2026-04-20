# Accessibility Compliance (SI 5568 / WCAG 2.0 AA) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Bitan & Bitan website legally compliant with Israeli accessibility law (תקנות שוויון זכויות לאנשים עם מוגבלות) by implementing SI 5568 / WCAG 2.0 AA requirements.

**Architecture:** 6 surgical tasks — 1 new page (הצהרת נגישות), 5 code fixes across existing files. No schema changes, no new dependencies. Footer gets a new link. All changes are HTML/ARIA hygiene.

**Tech Stack:** Next.js 15, React 19, Tailwind 3, TypeScript

---

## Chunk 1: Core Compliance

### Task 1: Add skip-to-content link

**Files:**
- Modify: `src/app/(site)/layout.tsx`

- [ ] **Step 1: Add visually-hidden skip link before Header**

Add as the first child inside `<SiteSettingsProvider>`:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:bg-gold focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium focus:shadow-lg"
>
  דלג לתוכן
</a>
```

Add `id="main-content"` to the `<main>` element.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(site)/layout.tsx"
git commit -m "a11y: add skip-to-content link"
```

### Task 2: Create accessibility statement page (הצהרת נגישות)

**Files:**
- Create: `src/app/(site)/accessibility/page.tsx`
- Modify: `src/components/Footer.tsx` (add link)

- [ ] **Step 1: Create the accessibility page**

Create `src/app/(site)/accessibility/page.tsx` with:
- Metadata: title "הצהרת נגישות", description about accessibility commitment
- Content sections:
  - כללי: statement that site strives for SI 5568 / WCAG 2.0 AA compliance
  - סטטוס נגישות: "האתר עומד בדרישות תקן SI 5568 ברמת AA"
  - תאריך עדכון אחרון: April 2026
  - מגבלות ידועות: "ייתכנו תכנים שטרם הונגשו במלואם. אנו עובדים על שיפור מתמיד."
  - פרטי רכז/ת נגישות: name = "משרד ביטן את ביטן", phone = "03-5174295", email = "office@bitancpa.com"
  - הגשת תלונה: "ניתן לפנות אלינו בטלפון או בדוא״ל. פניות נגישות יטופלו תוך 14 ימי עסקים."
  - קישור לנציבות: link to https://www.gov.il/he/departments/topics/accessibility

- [ ] **Step 2: Add footer link**

In `src/components/Footer.tsx`, add "הצהרת נגישות" link in the legal column (next to מדיניות פרטיות and תנאי שימוש).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/accessibility/page.tsx" src/components/Footer.tsx
git commit -m "a11y: add accessibility statement page + footer link"
```

### Task 3: Fix contact form ARIA

**Files:**
- Modify: `src/app/(site)/contact/ContactForm.tsx`

- [ ] **Step 1: Add aria attributes to form inputs**

For each input field (name, phone, email, message):
- Add `aria-invalid={!!errors.fieldName}` when field has error
- Add `aria-describedby={errors.fieldName ? 'fieldName-error' : undefined}`
- Add `id="fieldName-error"` to each error `<p>` element
- Add `role="alert"` to error messages

For the global error banner:
- Add `role="alert"` to the error div

For the success message:
- Add `role="status"` to the success div

- [ ] **Step 2: Commit**

```bash
git add "src/app/(site)/contact/ContactForm.tsx"
git commit -m "a11y: add ARIA attributes to contact form"
```

### Task 4: Fix gold text contrast

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add a dark gold variant for text usage**

Add to the gold color config:
```ts
gold: {
  DEFAULT: "#C5A572",
  hover: "#B8955F",
  dark: "#8B7342",  // ~4.7:1 on white — passes WCAG AA
},
```

- [ ] **Step 2: Replace gold text on white backgrounds**

Search for `text-gold` used on white/light backgrounds. Replace with `text-gold-dark` where the background is white/surface. Gold on navy (`bg-primary`) is fine (4.8:1).

Key locations to check:
- Any `text-gold` inside cards or on `bg-white`/`bg-surface` sections
- Footer gold bullets are decorative (OK)
- Gold underline accents are decorative (OK)

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/
git commit -m "a11y: fix gold text contrast ratio (2.6:1 → 4.7:1 on white)"
```

### Task 5: Fix focus indicators

**Files:**
- Modify: `src/components/KnowledgeSearch.tsx`
- Modify: `src/components/tools/employer/EmployerCalculator.tsx`
- Modify: `src/components/tools/calculator/SliderInput.tsx`
- Modify: `src/components/tools/calculator/InputGroup.tsx`
- Modify: `src/app/(site)/faq/FAQFilterable.tsx`

- [ ] **Step 1: Replace bare `outline-none` with `outline-none focus-visible:ring-2 focus-visible:ring-gold`**

In each file, find `outline-none` or `focus:outline-none` and add a visible focus-visible replacement:
- `outline-none` → `outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1`

The key principle: we suppress the default outline but provide a visible gold ring on `:focus-visible` (keyboard nav only, not clicks).

- [ ] **Step 2: Commit**

```bash
git add src/components/ src/app/
git commit -m "a11y: restore focus indicators on all interactive elements"
```

### Task 6: Fix mobile menu semantics

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add dialog semantics to mobile menu**

On the outer `<div>` wrapping the mobile overlay (the `fixed inset-0` div):
- Add `role="dialog"`
- Add `aria-modal="true"`
- Add `aria-label="תפריט ראשי"`

On the `<motion.nav>` inside:
- Add `aria-label="ניווט ראשי"`

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "a11y: add dialog semantics to mobile menu"
```

---

## Summary

| Task | Files | What |
|------|-------|------|
| 1 | layout.tsx | Skip-to-content link |
| 2 | NEW accessibility/page.tsx + Footer.tsx | הצהרת נגישות page |
| 3 | ContactForm.tsx | ARIA on form errors |
| 4 | tailwind.config.ts + components | Gold contrast fix |
| 5 | 5 component files | Focus indicators |
| 6 | Header.tsx | Mobile menu dialog semantics |
