# Leasing Calculator V2 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing 5-step recommendation quiz with a professional vehicle cost calculator based on Ron's spec — real amortization math, Israeli tax rules, side-by-side comparison.

**Architecture:** 4-phase wizard (base info → pick option → option details → results). Pure TypeScript engine handles all calculations (loan amortization, VAT recovery, tax deductions). Config stored in Sanity with dedicated fields for prime rate and VAT rate. The wizard flow is designed for end-users (existing CPA clients), not accountants — smart defaults, minimal required inputs, progressive disclosure.

**Tech Stack:** Next.js 15, React 19, Tailwind 3, TypeScript, Sanity v3 (existing stack). No new dependencies.

**Source spec:** Ron's PDF at `~/Library/CloudStorage/GoogleDrive-shaygriever34@gmail.com/My Drive/Work_06/Bitan & Bitan/ליסינג מחשבון.pdf` (21 pages)

---

## UX Flow Design

### Phase 1: פרטים בסיסיים (Basic Info) — 1 screen
- **User type**: עצמאי (active) / שכיר (greyed, "בקרוב")
- **Vehicle type**: 4 pills — פרטי (בנזין) / פרטי (חשמלי) / מסחרי (בנזין) / מסחרי (חשמלי)
  - Note below מסחרי: "רכב מעל 3.5 טון, מונית, אוטובוס"
- **Car price**: preset pills (100K, 150K, 200K, 250K, 300K) + manual input
- **Monthly income** (gross): pills (15K, 20K, 25K, 30K, 35K, 40K) + manual input
  - Subtitle: "הכנסות בניכוי הוצאות, כולל שכ"ע שאתה מקבל בחודש — ברוטו"

### Phase 2: בחירת אפשרות (Pick Option) — 1 screen
- 3 cards: רכישה יד 2 / ליסינג מימוני / ליסינג תפעולי
- Each card has icon + 1-line description
- User picks ONE to calculate first

### Phase 3: פרטי האפשרות (Option Details) — 1 screen, adapts per option

**רכישה יד 2:**
- הון עצמי: pills (25%, 50%, 75%, 100%) + manual → shows loan amount as delta
- ריבית: pills (P-1% through P+2%) + manual → display actual rate based on prime
- תקופה: pills (24, 36, 48, 60 months)
- Running costs section: fuel (pills + manual), maintenance/yr, insurance+license/yr

**ליסינג מימוני:**
- מקדמה: pills (15%, 20%, 30%, 40%) + manual
- יתרה סוף תקופה: pills (30%, 35%, 40%, 50%) + manual
- טרייד אין: yes/no toggle, if yes → amount input
- ריבית: pills (P+1% through P+3%) + manual
- תקופה: pills (24, 36, 48, 60 months)
- Running costs section (ask if changed from previous if comparing)

**ליסינג תפעולי:**
- מקדמה: pills (5%, 10%, 15%, 20%) + manual
- Monthly leasing: auto-suggested by car price range, editable
- Fuel only (maintenance/insurance included in leasing)
- For electric: km/month selector → auto-calculate electricity cost

### Phase 4: תוצאות (Results) — 1 screen
- Full results table with Ron's fields (a-z)
- "השווה מול אפשרות נוספת" button → Phase 2 → Phase 3 → side-by-side comparison
- CTA: WhatsApp + Phone

---

## File Structure

### New files:
- `src/components/tools/calculator/types.ts` — all types and interfaces
- `src/components/tools/calculator/config.ts` — defaults, constants, presets
- `src/components/tools/calculator/engine.ts` — pure calculation engine
- `src/components/tools/calculator/LeasingCalculator.tsx` — main wizard orchestrator
- `src/components/tools/calculator/StepBase.tsx` — Phase 1 (base info inputs)
- `src/components/tools/calculator/StepPickOption.tsx` — Phase 2 (option picker)
- `src/components/tools/calculator/StepDetails.tsx` — Phase 3 (option-specific inputs)
- `src/components/tools/calculator/ResultsView.tsx` — Phase 4 (results + comparison)
- `src/components/tools/calculator/InputGroup.tsx` — reusable preset-pills + manual input component

### Modified files:
- `src/sanity/schemas/tool.ts` — add `primeRate`, `vatRate` number fields
- `src/app/(site)/tools/[slug]/page.tsx` — import new LeasingCalculator, pass config
- `src/sanity/queries.ts` — add primeRate, vatRate to tool query projection

### Kept (not deleted):
- Old files (`LeasingSimulator.tsx`, `leasing-logic.ts`, `SimulatorStep.tsx`, `SimulatorResult.tsx`) — kept until V2 is verified, then deleted in cleanup task

---

## Chunk 1: Engine + Types + Config

### Task 1: Types and Config

**Files:**
- Create: `src/components/tools/calculator/types.ts`
- Create: `src/components/tools/calculator/config.ts`

- [ ] **Step 1: Create types.ts with all type definitions**

```typescript
// Types for the V2 leasing calculator

export type UserType = 'selfEmployed' | 'employee'

export type VehicleType = 'privatePetrol' | 'privateElectric' | 'commercialPetrol' | 'commercialElectric'

export type OptionType = 'purchase' | 'financialLeasing' | 'operationalLeasing'

export type BaseInputs = {
  userType: UserType
  vehicleType: VehicleType
  carPrice: number        // ₪, including VAT
  monthlyIncome: number   // gross monthly, ₪
}

export type PurchaseInputs = {
  equityPercent: number          // 0-100
  interestSpread: number         // spread over prime, e.g. 1 means P+1%
  periodMonths: number           // 24, 36, 48, 60
  fuelMonthly: number            // ₪/month incl VAT (petrol) or ₪/month (electric)
  maintenanceYearly: number      // ₪/year
  insuranceYearly: number        // ₪/year incl license
}

export type FinancialLeasingInputs = {
  downPaymentPercent: number     // percentage of car price
  residualPercent: number        // end-of-term residual as % of car price
  tradeIn: boolean
  tradeInAmount: number          // ₪ received for old car
  interestSpread: number         // spread over prime
  periodMonths: number
  fuelMonthly: number
  maintenanceYearly: number
  insuranceYearly: number
}

export type OperationalLeasingInputs = {
  downPaymentPercent: number
  monthlyLeasingPayment: number  // ₪/month incl VAT
  fuelMonthly: number            // ₪/month
  kmPerMonth?: number            // for electric vehicles
}

export type OptionInputs = PurchaseInputs | FinancialLeasingInputs | OperationalLeasingInputs

// Results per Ron's spec (fields a-z)
export type CalculationResult = {
  optionType: OptionType
  vehicleType: VehicleType
  carPrice: number                    // what user entered
  vatOnPurchase: number | null        // null = not deductible, number = deductible amount
  equity: number                      // ₪ down payment / equity
  monthlyLeasingPayment: number | null // null for purchase
  loan: { amount: number; rate: number; periodMonths: number } | null
  depreciation: number                // annual ₪
  fuelMonthly: number
  maintenanceYearly: number | null    // null for operational
  insuranceYearly: number | null      // null for operational
  loanInterest: number                // total interest over period (a)
  totalCarExpenses: number            // annual (z)
  loanBalance: number[]               // year-end balances (d)
  residualPayment: number | null      // end-of-term payment
  vatRecoverable: number              // annual (b)
  deductibleExpenses: number          // annual (c)
  monthlyCashflow: number             // average monthly out-of-pocket (e)
  residualCarValue: number | null     // value after 5 years (f)
  taxSavings: number                  // annual tax savings based on income
}

export type CalculatorConfig = {
  primeRate: number      // e.g. 4.75
  vatRate: number        // e.g. 0.18
  updatedAt: string
}

export type WizardState = {
  phase: 'base' | 'pickOption' | 'details' | 'results'
  base: Partial<BaseInputs>
  primaryOption: OptionType | null
  primaryInputs: Partial<OptionInputs>
  primaryResult: CalculationResult | null
  comparisonOption: OptionType | null
  comparisonInputs: Partial<OptionInputs>
  comparisonResult: CalculationResult | null
}
```

- [ ] **Step 2: Create config.ts with defaults and presets**

```typescript
import type { CalculatorConfig, VehicleType, OptionType } from './types'

export const DEFAULT_CONFIG: CalculatorConfig = {
  primeRate: 4.75,
  vatRate: 0.18,
  updatedAt: '2026-04-01',
}

// Ron's spec: residual car values after 5 years
export const RESIDUAL_VALUES: Record<number, number> = {
  100_000: 50_000,
  150_000: 75_000,
  200_000: 100_000,
  250_000: 125_000,
  300_000: 150_000,
}

// Interpolate residual value for any price
export function getResidualValue(carPrice: number): number {
  // ~50% after 5 years (from Ron's mapping)
  return Math.round(carPrice * 0.5)
}

// Depreciation rates by vehicle fuel type
export function getDepreciationRate(vehicleType: VehicleType): number {
  return vehicleType.includes('Electric') ? 0.20 : 0.15
}

// VAT recovery rate by vehicle type
// Private: 67% on fuel+maintenance. Commercial: 100%
export function getVatRecoveryRate(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial') ? 1.0 : 0.67
}

// Tax deduction multiplier by vehicle type
// Private: 45%. Commercial: 100%
export function getTaxDeductionMultiplier(vehicleType: VehicleType): number {
  return vehicleType.startsWith('commercial') ? 1.0 : 0.45
}

// Default interest spreads
export const DEFAULT_SPREADS: Record<OptionType, number> = {
  purchase: 1.0,           // P+1%
  financialLeasing: 2.0,   // P+2%
  operationalLeasing: 0,   // N/A
}

// Operational leasing monthly rates by car price range (Ron's spec)
export const OPERATIONAL_MONTHLY_RATES: { min: number; max: number; default: number; options: number[] }[] = [
  { min: 0, max: 100_000, default: 2000, options: [1800, 2000, 2250, 2500] },
  { min: 100_000, max: 150_000, default: 2700, options: [2500, 2700, 2900, 3100] },
  { min: 150_000, max: 200_000, default: 3800, options: [3600, 3800, 4000, 4200] },
  { min: 200_000, max: 250_000, default: 4800, options: [4600, 4800, 5000, 5200] },
  { min: 250_000, max: 300_000, default: 5800, options: [5500, 5800, 6200, 6500] },
]

export function getOperationalRate(carPrice: number) {
  const bracket = OPERATIONAL_MONTHLY_RATES.find(
    (b) => carPrice >= b.min && carPrice < b.max
  ) || OPERATIONAL_MONTHLY_RATES[OPERATIONAL_MONTHLY_RATES.length - 1]
  return bracket
}

// Electric vehicle monthly cost by km
export const ELECTRIC_COST_BY_KM: { km: number; cost: number }[] = [
  { km: 1000, cost: 150 },
  { km: 1500, cost: 200 },
  { km: 2000, cost: 250 },
  { km: 2500, cost: 350 },
]

// Default running costs
export const DEFAULT_FUEL_MONTHLY = 1500        // ₪/month incl VAT
export const DEFAULT_MAINTENANCE_YEARLY = 5000   // ₪/year
export const DEFAULT_INSURANCE_YEARLY = 7000     // ₪/year incl license
```

- [ ] **Step 3: Commit types and config**

---

### Task 2: Calculation Engine

**Files:**
- Create: `src/components/tools/calculator/engine.ts`

- [ ] **Step 1: Create engine.ts with all calculation functions**

Key calculations per Ron's spec:
1. Loan amortization (monthly payment, interest per year, principal per year, balance per year)
2. VAT recovery (67% private / 100% commercial on applicable expenses)
3. Tax-deductible expenses (all expenses annualized, minus recovered VAT, × deduction multiplier)
4. Tax savings (deductible expenses × marginal tax rate based on income bracket)
5. Monthly cashflow (loan payment + fuel + maintenance/12 + insurance/12)
6. Total annual car expenses

The engine must handle all 3 option types × 4 vehicle types = 12 calculation paths.

Core functions:
- `calculateLoanAmortization(principal, annualRate, months)` → { monthlyPayment, yearlyBreakdown[], totalInterest }
- `calculatePurchase(base, inputs, config)` → CalculationResult
- `calculateFinancialLeasing(base, inputs, config)` → CalculationResult
- `calculateOperationalLeasing(base, inputs, config)` → CalculationResult
- `calculateOption(optionType, base, inputs, config)` → CalculationResult (dispatcher)

Tax bracket logic for income question:
- Map monthly income to marginal tax rate
- Deductible expenses × marginal rate = annual tax savings

- [ ] **Step 2: Commit engine**

---

## Chunk 2: UI Components

### Task 3: InputGroup — Reusable Input Component

**Files:**
- Create: `src/components/tools/calculator/InputGroup.tsx`

- [ ] **Step 1: Create InputGroup component**

A reusable component that shows:
- Label + subtitle
- Preset pills (buttons with predefined values)
- Optional manual input field
- Selected state highlighting
- Computed display value (e.g., showing ₪ amount when percentage selected)

Props: `{ label, subtitle?, presets: {value, label, sublabel?}[], value, onChange, allowManual?, manualPlaceholder?, formatDisplay?, suffix? }`

Uses existing design tokens: `border-gold`, `bg-gold/10`, `text-primary`, pill buttons matching SimulatorStep style.

- [ ] **Step 2: Commit InputGroup**

---

### Task 4: Wizard Step Components

**Files:**
- Create: `src/components/tools/calculator/StepBase.tsx`
- Create: `src/components/tools/calculator/StepPickOption.tsx`
- Create: `src/components/tools/calculator/StepDetails.tsx`

- [ ] **Step 1: Create StepBase.tsx (Phase 1)**

Shows:
- User type toggle (עצמאי active, שכיר greyed with badge)
- Vehicle type 4-pill selector
- Car price presets + manual
- Monthly income presets + manual

All inputs on ONE screen, vertically stacked sections. Each section has a label.

- [ ] **Step 2: Create StepPickOption.tsx (Phase 2)**

Three cards in a row (stack on mobile):
- רכישה יד 2 — icon: Car, description: "רכישת רכב עם הלוואה או מזומן"
- ליסינג מימוני — icon: CreditCard, description: "ליסינג עם אפשרות רכישה בסוף"
- ליסינג תפעולי — icon: RefreshCw, description: "שכירות חודשית, הכל כלול"

- [ ] **Step 3: Create StepDetails.tsx (Phase 3)**

Dynamic form that adapts based on selected option type.
Uses InputGroup components for each field.
Shows computed values inline (e.g., "סכום ההלוואה: ₪XX,XXX" after equity selection).

Sections:
1. Financial terms (equity/down payment, interest, period)
2. Running costs (fuel, maintenance, insurance) — skip maintenance+insurance for operational

For operational leasing: show suggested monthly rate from config based on car price range.

- [ ] **Step 4: Commit step components**

---

### Task 5: Results View

**Files:**
- Create: `src/components/tools/calculator/ResultsView.tsx`

- [ ] **Step 1: Create ResultsView.tsx**

Shows a results card with all of Ron's calculated fields:
- עלות רכב
- מע"מ רכישת רכב (מוכר/לא מוכר)
- הון עצמי
- תשלום חודשי ליסינג (if applicable)
- הלוואה (amount, rate, period)
- ירידת ערך (פחת)
- דלק/חשמל
- אחזקת רכב (if applicable)
- ביטוחים ורישוי (if applicable)
- ריבית הלוואה (א)
- סה"כ הוצאות רכב שנתי (ז)
- יתרת הלוואה (ד)
- יתרת תשלום סוף תקופה
- מע"מ מוכר (ב)
- הוצאות מוכרות לצרכי מס (ג)
- חיסכון מס שנתי (from income question)
- תשלום חודשי ממוצע (תזרים) (ה)
- שווי רכב לאחר 5 שנים (ו)

When comparison exists, show side-by-side table (desktop) or stacked cards (mobile).

Bottom CTA section: WhatsApp + Phone + "התחל מחדש" + "השווה מול אפשרות נוספת"

- [ ] **Step 2: Commit results view**

---

### Task 6: Main Wizard + Integration

**Files:**
- Create: `src/components/tools/calculator/LeasingCalculator.tsx`
- Modify: `src/app/(site)/tools/[slug]/page.tsx`
- Modify: `src/sanity/schemas/tool.ts`
- Modify: `src/sanity/queries.ts`

- [ ] **Step 1: Create LeasingCalculator.tsx**

Main orchestrator component managing WizardState.
- Progress bar showing current phase
- Back button
- Phase transitions with fadeIn animation
- Calls engine functions when transitioning to results phase

- [ ] **Step 2: Update Sanity tool schema — add primeRate and vatRate fields**

Add two number fields to tool.ts:
```typescript
defineField({
  name: 'primeRate',
  title: 'ריבית פריים (%)',
  type: 'number',
  description: 'ריבית הפריים הנוכחית. עדכון ידני — בעתיד יתעדכן אוטומטית.',
  initialValue: 4.75,
}),
defineField({
  name: 'vatRate',
  title: 'אחוז מע"מ (%)',
  type: 'number',
  description: 'אחוז מע"מ נוכחי. 18 = 18%',
  initialValue: 18,
}),
```

- [ ] **Step 3: Update tool query in queries.ts to include new fields**

- [ ] **Step 4: Update tool page to use LeasingCalculator**

Wire up: parse primeRate/vatRate from tool document, pass as config to LeasingCalculator.
Keep old LeasingSimulator import as fallback (remove in cleanup).

- [ ] **Step 5: Commit integration**

---

## Chunk 3: Cleanup + Polish

### Task 7: Testing + Polish

- [ ] **Step 1: Manual testing — verify all 12 calculation paths**

Test matrix (עצמאי only):
- פרטי בנזין × (purchase, financial, operational)
- פרטי חשמלי × (purchase, financial, operational)
- מסחרי בנזין × (purchase, financial, operational)
- מסחרי חשמלי × (purchase, financial, operational)

For each: verify VAT recovery, tax deduction multiplier, depreciation rate are correct.

- [ ] **Step 2: Mobile responsiveness check**

- [ ] **Step 3: Update Sanity tool document with primeRate and vatRate values**

Via Sanity Studio or MCP: patch the leasing-simulator tool document with primeRate=4.75, vatRate=18.

- [ ] **Step 4: Delete old simulator files**

Remove:
- `src/components/tools/LeasingSimulator.tsx`
- `src/components/tools/leasing-logic.ts`
- `src/components/tools/SimulatorStep.tsx`
- `src/components/tools/SimulatorResult.tsx`

- [ ] **Step 5: Final commit + push**
