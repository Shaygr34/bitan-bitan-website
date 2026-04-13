# Employer Calculator V2 — Ron's Feedback Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 11 items from Ron's April 12, 2026 feedback doc — new input fields (נסיעות, שווי ארוחות, שווי מס נוסף, נטול יכולת, military service), conditional toggles, employee-specific pension tax credit fix, dual calculations, results display overhaul, comparison feature, and print/PDF.

**Architecture:** The employer calculator already exists at `/tools/employer-cost` as a 4-phase wizard. Changes touch all layers: types (new fields), config (new constants), engine (dual calc, pension credit fix, new credit point sources), wizard UI (3 new conditional sections, reordered pension step, new personal fields), and results display (complete overhaul with dual with/without שווי מס numbers).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, pure calculation engine (no deps)

**Spec:** `docs/ron-employer-calc-feedback-2026-04-12.md`

---

## Chunk 1: Types, Config, and Engine Updates

### Task 1: Update types with new input fields

**Files:**
- Modify: `src/components/tools/employer/types.ts`

- [ ] **Step 1: Add new fields to EmployerInputs**

Add to EmployerInputs type:
```typescript
// New fields from Ron's feedback
travelAllowance: number         // נסיעות — default 315, range 0-1500
hasVehicle: boolean              // Toggle: כן/לא for vehicle (default false)
hasMealBenefit: boolean          // שווי ארוחות toggle
mealBenefitAmount: number        // 500-2000, default 1000
hasOtherBenefit: boolean         // שווי מס נוסף toggle
otherBenefitAmount: number       // 500-3000, default 1000
disabledChildrenCount: number    // נטול יכולת — 0 to childrenCount
serviceType: 'military' | 'national' | 'none'  // שירות צבאי/לאומי/אין
serviceLevel: 'full' | 'partial' | 'none'      // שירות מלא/חלקי/אין
pensionCreditSalary: number     // שכר מבוטח קצבה מזכה — default 9700, editable
```

- [ ] **Step 2: Update EmployerCalcResult for dual שווי מס**

Update result type to generalize "vehicle" → "שווי מס":
```typescript
// In employee section:
totalShvuiMas: number           // total שווי מס (vehicle + meals + other)
vehicleTaxBenefit: number       // שווי רכב component
mealBenefit: number             // שווי ארוחות component
otherBenefit: number            // שווי מס נוסף component
netWithShvui: number            // net WITH all שווי מס (replaces netWithVehicle)
netWithoutShvui: number         // net WITHOUT שווי מס (replaces netWithoutVehicle)
netDifference: number           // gap
creditPointsBreakdown: {        // detailed credit points
  base: number
  marital: number
  children: number
  disabledChildren: number
  militaryService: number
  pension: number               // pension tax credit (max 237.58)
  total: number
  monthlyValue: number
}

// In employer section:
totalWithShvui: number          // replaces totalWithVehicle
totalWithoutShvui: number       // replaces totalWithoutVehicle
costDifference: number
```

- [ ] **Step 3: Add new config fields**

```typescript
// In EmployerCalcConfig:
pensionCreditSalaryCap: number  // 9,700 — שכר קצבה מזכה מקסימאלי
pensionCreditRate: number       // 0.07 — 7% max pension deposit
pensionCreditTaxRate: number    // 0.35 — 35% credit on pension
defaultTravelAllowance: number  // 315
```

- [ ] **Step 4: Commit**
```
git commit -m "feat(employer): add new types for שווי מס fields, service credits, pension credit"
```

### Task 2: Update config with new constants and defaults

**Files:**
- Modify: `src/components/tools/employer/config.ts`

- [ ] **Step 1: Add new config defaults**

```typescript
// Add to DEFAULT_EMPLOYER_CONFIG:
pensionCreditSalaryCap: 9700,
pensionCreditRate: 0.07,
pensionCreditTaxRate: 0.35,
defaultTravelAllowance: 315,
```

- [ ] **Step 2: Add service credit point rules**

```typescript
export function getServiceCreditPoints(
  gender: 'male' | 'female',
  serviceType: 'military' | 'national' | 'none',
  serviceLevel: 'full' | 'partial' | 'none'
): number {
  if (serviceType === 'none' || serviceLevel === 'none') return 0
  if (serviceLevel === 'full') return 2
  if (serviceLevel === 'partial') return 1
  return 0
}

// For display labels:
export function getServiceThresholds(
  gender: 'male' | 'female',
  serviceType: 'military' | 'national'
): { full: string; partial: string } {
  if (serviceType === 'national') {
    return { full: '24 ומעלה', partial: '12-24' }
  }
  // Military
  if (gender === 'female') {
    return { full: '22 ומעלה', partial: '12-22' }
  }
  return { full: '23 ומעלה', partial: '12-23' }
}
```

- [ ] **Step 3: Commit**
```
git commit -m "feat(employer): add service credit rules, pension credit config constants"
```

### Task 3: Update calculation engine

**Files:**
- Modify: `src/components/tools/employer/engine.ts`

- [ ] **Step 1: Generalize vehicle → total שווי מס**

In `calculateEmployerCost()`:
- Compute `totalShvuiMas = vehicleTaxBenefit + mealBenefitAmount + otherBenefitAmount`
- Only include vehicleTaxBenefit if `hasVehicle === true`
- Only include mealBenefitAmount if `hasMealBenefit === true`
- Only include otherBenefitAmount if `hasOtherBenefit === true`
- Replace all `vehicleTaxBenefit` references in taxable income with `totalShvuiMas`

- [ ] **Step 2: Fix employee pension tax credit**

Replace the current `calculatePensionTaxBenefits()` with employee-specific logic:
```typescript
export function calculateEmployeePensionCredit(
  grossSalary: number,
  employeePensionRate: number,
  config: EmployerCalcConfig
): { deduction: number; credit: number } {
  // Employee pension credit: min(salary, cap) × 7% × 35%
  const insuredSalary = Math.min(grossSalary, config.pensionCreditSalaryCap)
  const maxDeposit = insuredSalary * config.pensionCreditRate
  const credit = Math.round(maxDeposit * config.pensionCreditTaxRate)

  // Pension deduction (reduces taxable income): avg salary × 2%
  const deduction = Math.round(Math.min(
    grossSalary * 0.02,
    config.averageSalary * 0.02
  ))

  return { deduction, credit }
}
```

- [ ] **Step 3: Add disabled children + service credit points**

Update `calculateCreditPoints()` to:
- Accept `disabledChildrenCount` and `serviceType`/`serviceLevel`
- Add disabled children: `disabledChildrenCount × 2` annual points (÷12 for monthly)
- Add service: call `getServiceCreditPoints(gender, serviceType, serviceLevel)`
- Return breakdown object (base, marital, children, disabled, service, total)

- [ ] **Step 4: Add נסיעות to gross for employer cost**

In employer cost calculation:
- Employer total = grossSalary + travelAllowance + pension + severance + education + NII
- Employee taxable income = grossSalary + totalShvuiMas + imputed benefits (נסיעות is NOT taxable income — it's a reimbursement)
- Note: נסיעות affects employer cost but not employee tax calculation

- [ ] **Step 5: Dual calculation path**

The engine already does dual calc (with/without vehicle). Generalize to with/without שווי מס:
- Path A: taxableIncome = gross + totalShvuiMas + imputed
- Path B: taxableIncome = gross + imputed (no שווי מס)
- Both paths: calculate NII, tax, deductions, net independently
- Update result object field names

- [ ] **Step 6: Commit**
```
git commit -m "feat(employer): generalize שווי מס, fix pension credit, add service/disabled credits"
```

---

## Chunk 2: Wizard UI Updates (Steps 1-3)

### Task 4: Update Phase 1 — Salary & Benefits

**Files:**
- Modify: `src/components/tools/employer/EmployerCalculator.tsx`

- [ ] **Step 1: Add נסיעות slider**

After gross salary slider, add:
- Label: "נסיעות"
- Default: 315
- Range: 0-1,500
- Slider with manual entry option

- [ ] **Step 2: Update salary label**

Change "שכר ברוטו חודשי" → "שכר ברוטו חודשי (ללא נסיעות)"

- [ ] **Step 3: Replace vehicle section with conditional toggle**

Replace direct vehicle inputs with:
```
"האם לעובד קיים רכב צמוד / שווי רכב?" [כן] [לא]
→ If כן: show manufacturer price + fuel type (existing fields)
→ If לא: hide, set hasVehicle=false
Default: לא
```

- [ ] **Step 4: Add שווי ארוחות toggle**

```
"האם לעובד קיים שווי ארוחות (תן ביס/סיבוס וכדומה)?" [כן] [לא]
→ If כן: slider 500-2000, default 1000, manual entry
→ If לא: hide
```

- [ ] **Step 5: Add שווי מס נוסף toggle**

```
"האם העובד מקבל הטבות נוספות (שווי מס נוסף מכל סוג)?" [כן] [לא]
→ If כן: slider 500-3000, default 1000, manual entry
→ If לא: hide
```

- [ ] **Step 6: Update titles**

- Main title: "מחשבון שכר עלות מעסיק"
- Subtitle: "נתוני שכר עובד לחישוב"

- [ ] **Step 7: Commit**
```
git commit -m "feat(employer): add נסיעות, conditional שווי מס toggles, update labels"
```

### Task 5: Update Phase 2 — Pension & Benefits

**Files:**
- Modify: `src/components/tools/employer/EmployerCalculator.tsx`

- [ ] **Step 1: Reorder pension section**

Per Ron's screenshot (img1.png):
- Remove duplicate א.כ.ע from lower position
- Move קרן השתלמות UP to where א.כ.ע was
- Keep red warning: "אחוז א.כ.ע + תגמולים מעסיק לא יכול לעבור 7.5%"

- [ ] **Step 2: Rename header**

"פנסיה והפרשות" → "פנסיה / ביטוח מנהלים וקרן השתלמות"

- [ ] **Step 3: Make step indicators bigger**

Increase font size and visual weight of phase numbers and labels in progress indicator.

- [ ] **Step 4: Add pension credit salary field**

Add editable field: "שכר מבוטח קצבה מזכה שכיר" with default 9,700

- [ ] **Step 5: Commit**
```
git commit -m "feat(employer): reorder pension step, bigger step labels, pension credit salary"
```

### Task 6: Update Phase 3 — Personal Details

**Files:**
- Modify: `src/components/tools/employer/EmployerCalculator.tsx`

- [ ] **Step 1: Fix children ages default**

Change default from 0 to EMPTY. Input must enforce 0-18 range. No negative, no 19+.

- [ ] **Step 2: Add periods to legend**

Add "." at end of each line in the age legend (0 through 18).

- [ ] **Step 3: Gender-aware קצבת ילדים default**

When gender changes:
- Male → auto-set childAllowanceRecipient to "spouse"
- Female → auto-set to "employee"
- User can still override

- [ ] **Step 4: Add נטול יכולת field**

- Only visible when childrenAges.length > 0
- Number input: 0 to childrenAges.length
- Label: "ילדים נטולי יכולת"
- Each child = 2 annual credit points

- [ ] **Step 5: Add military/national service section**

Toggle: שירות צבאי (default) / שירות לאומי
Then: שירות מלא / שירות חלקי (with gender-appropriate threshold labels)
Display: "(23 ומעלה)" / "(12-23)" for male military, etc.

- [ ] **Step 6: Bigger "חזור לשלב הקודם" button**

Increase font-size and padding on back button across all phases.

- [ ] **Step 7: Commit**
```
git commit -m "feat(employer): personal details — נטול יכולת, service credits, gender defaults"
```

---

## Chunk 3: Results Display Overhaul

### Task 7: Redesign results top section

**Files:**
- Modify: `src/components/tools/employer/EmployerResults.tsx`

- [ ] **Step 1: Update summary cards**

Replace current 4-card layout with:
- Card 1 (gold): "עלות מעסיק כולל שווי מס" → `empr.totalWithShvui`
- Card 2: "עלות מעסיק ללא שווי מס" → `empr.totalWithoutShvui`
- Card 3: "הפרש עלות מעסיק (השפעה שווי מס)" → `empr.costDifference`
- Card 4: "פער נטו עובד (שווי מס)" → `emp.netDifference`

- [ ] **Step 2: Add שווי מס breakdown**

New section between summary cards and employee breakdown:
- שווי רכב: X ₪ (only if hasVehicle)
- שווי ארוחות: X ₪ (only if hasMealBenefit)
- שווי מס נוסף: X ₪ (only if hasOtherBenefit)
- **סה"כ שווי מס: X ₪**

- [ ] **Step 3: Commit**
```
git commit -m "feat(employer): redesign results summary cards for שווי מס"
```

### Task 8: Redesign employee breakdown

**Files:**
- Modify: `src/components/tools/employer/EmployerResults.tsx`

- [ ] **Step 1: Update input data section**

Rename "נתוני הזנה" → "נתונים לחישוב שכר"
Show:
- שכר ברוטו, נסיעות
- שווי רכב (conditional), שווי ארוחות (conditional), שווי מס נוסף (conditional)
- סה"כ שווי מס
- סה"כ שכר עבודה חייב במס

- [ ] **Step 2: Fix tax display with pension credit**

Show credit points as:
"X.XX נקודות זיכוי (X,XXX ₪/חודש) + זיכויים נוספים X ₪, סה"כ זיכוי מס: X ₪"

- [ ] **Step 3: Redesign net summary**

Same visual style as employer cost summary:
- Header: "סיכום נטו עובד"
- "נטו עובד **כולל** שווי מס" (bold כולל)
- "נטו עובד **ללא** שווי מס" (bold ללא)
- "פער שכר נטו (השפעת שווי מס)"
- Remove נקודות זיכוי from here

- [ ] **Step 4: Commit**
```
git commit -m "feat(employer): employee breakdown — net summary, pension credit display"
```

### Task 9: Redesign employer breakdown

**Files:**
- Modify: `src/components/tools/employer/EmployerResults.tsx`

- [ ] **Step 1: Reorder employer cost items**

Move ביטוח לאומי מעסיק directly below שכר ברוטו (before pension/severance/education).

- [ ] **Step 2: Update labels**

- "כולל שווי רכב" → "כולל שווי מס"
- "ללא שווי רכב" → "ללא שווי מס"
- "הפרש עלות מעסיק (השפעת רכב)" → "הפרש עלות מעסיק (השפעה שווי מס)"

- [ ] **Step 3: Move restart button**

Move "התחל מחדש" up to right after סיכום עלות מעסיק, before the CTA section.

- [ ] **Step 4: Commit**
```
git commit -m "feat(employer): employer breakdown reorder, label updates, button position"
```

---

## Chunk 4: Comparison + Print/PDF

### Task 10: Add comparison feature

**Files:**
- Modify: `src/components/tools/employer/EmployerCalculator.tsx`
- Modify: `src/components/tools/employer/EmployerResults.tsx`

- [ ] **Step 1: Add wizard state for comparison**

Add to state: `comparisonResult`, `showComparison`, `comparisonInputs`
Add "השווה מול תרחיש נוסף" button in results.

- [ ] **Step 2: Comparison flow**

When user clicks compare:
- Save current result as primary
- Reset wizard to Phase 1 with current inputs as starting point
- On second calculation, show side-by-side results
- Add "הסר השוואה" to reset

- [ ] **Step 3: Side-by-side comparison display**

Two-column layout:
- תרחיש א (primary) | תרחיש ב (comparison)
- Key metrics: עלות מעסיק, נטו עובד, פער
- Verdict: which scenario is cheaper for employer / better for employee

- [ ] **Step 4: Commit**
```
git commit -m "feat(employer): add comparison feature — two salary scenarios"
```

### Task 11: Print/PDF + Share

**Files:**
- Modify: `src/components/tools/employer/EmployerResults.tsx`

- [ ] **Step 1: Add print button**

Button: "הדפסה / PDF"
On click: `window.print()` with `@media print` CSS that:
- Hides nav, footer, CTA, buttons
- Shows only the calculation data
- Adds watermark: "נתוני שכר להמחשה בלבד"
- Adds disclaimer: "אין לנו אחריות. המידע להמחשה בלבד ואינו מהווה ייעוץ מקצועי."

- [ ] **Step 2: Add share button**

Button: "שיתוף"
On click: use `navigator.share()` API (mobile) or copy URL to clipboard (desktop).

- [ ] **Step 3: Add print CSS**

In the component or global CSS:
```css
@media print {
  .no-print { display: none !important; }
  .print-watermark { display: block !important; }
}
```

- [ ] **Step 4: Commit**
```
git commit -m "feat(employer): print/PDF with disclaimer watermark + share button"
```

---

## Chunk 5: Build verification + final commit

### Task 12: Build, verify, push

- [ ] **Step 1: Run build**
```bash
cd /Users/shay/bitan-bitan-website && npm run build
```

- [ ] **Step 2: Fix any build errors**

- [ ] **Step 3: Final commit with all changes**
```
git commit -m "feat: employer calculator V2 — Ron's full feedback (11 items)"
git push
```

- [ ] **Step 4: Update CLAUDE.md**

Add employer calc V2 session notes to CLAUDE.md.
