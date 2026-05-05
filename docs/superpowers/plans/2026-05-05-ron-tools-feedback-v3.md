# Ron Tools Feedback V3 — Implementation Plan

**Date:** 2026-05-05
**Source:** Ron's feedback docs (April 30 employer + May 2 leasing)
**Reconciliation:** see session memory `bitan-tools-ron-v3-reconciliation`

## Phasing

### Phase 1 — Constants + Formula Bugs (THIS SESSION)
Goal: every existing scenario produces Ron-verified numbers. No new features. No UI rebuild. Only data and arithmetic.

1. **Failing tests** (TDD red): add Ron's exact numeric examples as new test cases.
2. **Tax tables**:
   - Severance cap 34,900 → **45,600**
   - Split 47% top bracket from 3% Mas Yasaf (currently combined as 50%)
   - VAT recovery `0.67` → **`2/3`** (exact fraction)
3. **Engine logic**:
   - Employer: dedicated `calculateMasYasaf()` step, applied AFTER regular brackets, BEFORE credits (so credits offset regular tax only — Mas Yasaf added on top)
   - Leasing: `totalAnnualExpenses = monthlyCashflowRaw × 12` (not rounded monthly × 12)
   - Leasing commercial: loan principal + depreciation use `carPrice / 1.18`
4. **Watermark fix**: replace tiny print-only caption with proper diagonal faded watermark (CSS `position:fixed`, `transform:rotate(-30deg)`, `opacity:0.15`, large font, print-only)
5. **UI labels**:
   - "ביטוחים + רישיון (לשנה, כולל מע"מ)" → "ביטוחים + רישיון (לשנה)"
   - "ריבית הלוואה" → "ריבית הלוואה ממוצעת"
6. **Verify**: 32 baseline tests + new tests pass; visual check in browser.

### Phase 2 — Display Restructure (next session)
- Right/left 2-column layout per Ron spec for each scenario × user type
- Electric km display (1,500 km / 200₪ stacked)
- Conditional pension/השתלמות step UI in employer
- Salary slider max 100K (was 55K)
- Mandatory child age validation
- Credits display row restructure with explicit labels

### Phase 3 — Comparison UX (next session)
- Tab navigation between scenario A/B (preserves last step per scenario)
- Comparison print: page 1 verdict, page 2 preferred, page 3 other
- Share with comparison: encode both scenarios in URL
- Email share subject formatted: "ביטן את ביטן רו"ח - סימולציית X מיום DD/MM/YY"

### Phase 4 — NII Category Overhaul (parallel-able with 2/3)
- New `NII_TABLE_2026` keyed by `(category, calcType)` — 7 categories × 2-3 calcs
- Pull rates from ביטוח לאומי site (fallback: Ron's table)
- Sanity `taxConfig` extension: `niiTable` array
- New UI: 2 dropdowns under gender (category, calcType)
- Engine refactor: `calculateNII` takes (income, role, category, calcType) → looks up rates
- Leasing עצמאי: replace simple NII savings with quarterly formula `x = (y + m × 3 × 0.52 × (t2 − t1)) / (1 + t2 × 0.52)`

### Phase 5 — Net-New Features (after 2/3/4)
- Evaluation date input (drives service window + degree window)
- Service eligibility 36-month window math
- Reserve duty (מילואים) credit: bracket lookup + linear top-up
- Yishuv mutav: settlement dropdown + per-settlement cap+rate, file upload import
- Degree credits (תואר): 4 sub-forms with year-window logic — biggest UI build

## Test Strategy

**Phase 1 specific assertions to add:**

```ts
// Employer: Ron's exact examples
test('salary 30,315 → income tax gross = 6,632.25', () => {
  // expected pre-credit: 6,632.25 (within 1 shekel rounding)
})

test('salary 30,315 → NII employee total = 3,081 (±1)', () => {
  // 7,703×4.27% + (30,315-7,703)×12.17% = 328.91 + 2,751.88
})

test('salary 70,000 → NII employee total = 5,709 (±1)', () => {
  // capped at 51,910: 7,703×4.27% + (51,910-7,703)×12.17%
})

test('severance cap 45,600: 50K × 6% = 3,000 → no imputed', () => {
  // 45,600 × 8.33% = 3,798 cap; 50K × 6% = 3,000 < 3,798
})

test('Mas Yasaf separately calculated for high earners', () => {
  // salary 100K: regular brackets up to 47% + 3% above 60,130
})

// Leasing
test('VAT recovery uses exact 2/3 (not 0.67)', () => {
  // private fuel 1500/yr → recovery 1500/1.18×0.18×2/3 = 152.54
})

test('total annual expenses = unrounded monthly × 12', () => {
  // no shekel-level rounding mismatch
})

test('commercial vehicle loan = (carPrice/1.18) - downPayment', () => {
  // 150K/1.18 - 37,500 = 89,619
})

test('commercial vehicle depreciation = carPrice/1.18 × rate', () => {
  // 150,000/1.18 × 0.15 = 19,067.80/yr
})
```

## Risk Notes

- Severance cap change might affect existing test #3 (employer full calc) — re-verify expected.
- Mas Yasaf separation must produce same TOTAL tax for incomes ≤ 60,130 (no behavior change). Above 60,130 must equal old combined 50% calc to maintain regression.
- VAT 0.67 → 2/3 (= 0.6667) shifts ALL leasing private-vehicle expense calcs upward by ~0.1%. Existing tests need expected values updated.

## Out of Scope (Phase 1)
- NII category dropdown
- New credits (degree, reserve, yishuv)
- Comparison UX rebuild
- Display layout rebuild
