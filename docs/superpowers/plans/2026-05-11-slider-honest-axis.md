# Slider Honest Axis — Recurring Scale-Mismatch Fix

**Date**: 2026-05-11
**Trigger**: Ron + Haya feedback session (May 10-11). Recurring bug across both calculators: slider tick labels don't cover the actual `[min, max]` range, so the thumb sits past the leftmost label and the displayed value contradicts the visible axis.
**Scope**: Structural fix that makes this bug class extinct, plus per-slider range bumps Ron called out.

## Root cause

`SliderInput` accepts a `nodes` prop — hardcoded `[{value, label}]` arrays passed by each caller. Two failure modes compounded:

1. **Values drift from `[min, max]`**: caller passes nodes with `value` range narrower than the slider's true `min`/`max`. Thumb can move past the leftmost label.
2. **Visual position is fake**: existing layout uses `flex justify-between`, so 5 labels are evenly distributed *visually* regardless of their actual `value`. The axis is positionally meaningless.

Combined, the axis lies twice: wrong values AND wrong positions. "Fix some, others appear" was inevitable — every new slider became a new opportunity for drift.

## Decision

**Option A — Honest axis.** Remove the `nodes` prop entirely. Slider auto-generates 5 evenly-spaced tick values across `[min, max]` using a "nice numbers" rounding algorithm. Layout stays flexbox; the difference is the values are now genuinely evenly distributed so visual position = real value.

Trade-offs considered:
- **A** (chosen): structural; cures bug class permanently; 0 per-slider tick config.
- **B**: keep curated tick labels but clamp slider max to leftmost label. Rejected — drifts as Ron raises ranges; high-maintenance.
- **C**: hybrid (auto-extend but anchor at "meaningful" breakpoints). Rejected — adds caller burden.

Handoff-readiness lens (per `bitan-handoff-consolidation-2026-05-04.md`, successor = IT shop maintain-not-evolve): Option A removes ~20 magic-number arrays from the codebase. Successor maintains nothing per-slider.

## Two-layer implementation

### Layer 1 — Structural (one fix)

**`src/lib/nice-ticks.ts`** (new): pure utility `generateNiceTicks(min, max, count=5): number[]`.
- For currency-scale ranges: round to nice 10^n increments (e.g., 50,000 → 596,860 returns `[50000, 150000, 300000, 450000, 600000]`).
- For integer ranges (children, months, days): evenly spaced rounded to clean steps.
- For percentages (0-100): clean 25% increments where possible.
- For sub-unit ranges (e.g. interest offset -1 to 4.5): finer rounding (0.5 increments).
- Edge cases: `max ≤ min` returns `[min]`, `count ≤ 1` returns `[max]`.

**`src/components/tools/calculator/SliderInput.tsx`** (modified):
- Drop `nodes` prop from `SliderInputProps` and signature.
- Internally call `generateNiceTicks(min, max)` → derive label values.
- Add optional `tickFormat?: (v: number) => string` (defaults to `format`).
- Render unchanged: `flex justify-between` with 5 labels.

**Tests** (new): `src/lib/__tests__/nice-ticks.test.ts` covering currency, percentages, integers, offsets, edge cases.

### Layer 2 — Range bumps Ron explicitly called out

| File | Slider | Change |
|---|---|---|
| `StepDetails.tsx` (purchase) | ריבית | `max: 3 → 4.5` (effective rate ceiling = P+4.5 = 10%) |
| `StepDetails.tsx` (operational דלק) | דלק לחודש | `max: 3000 → 5000` |
| `StepDetails.tsx` (running costs דלק) | דלק לחודש | `max: 3000 → 5000` |

All other sliders' `min`/`max` already cover the requested range — only the hardcoded `nodes` array was lying. Removing the `nodes` prop fixes them automatically.

## Domain question NOT addressed

Ron asked whether `מקדמה + יתרה בסוף תקופה` should sum to ≤ 100% in leasing מימוני. This is **a separate domain/UX question**, not a scale-axis bug. Flagging for the next Avi/Ron consult rather than guessing.

## Not in scope

- No engine math changes. 114 existing tests must stay green.
- No new features.
- No refactor of unrelated slider behaviors (`goldFormat`, `compact`, `subtitle`, manual input).

## Validation order

1. TDD `niceTicks` utility — write tests first, then implementation.
2. Refactor `SliderInput` — drop `nodes`, wire `tickFormat`.
3. Update each caller — remove `nodes` prop, apply 3 range bumps, add `tickFormat` for currency sliders.
4. `npm test` — new `niceTicks` tests + all 114 existing must pass.
5. `npm run build` locally — catches Hebrew JSX quote lint trap that `tsc` misses (per CLAUDE.md gotcha).
6. Commit + push.
7. Browser verification on bitancpa.com — `/tools/leasing-simulator` + `/tools/employer-cost`. Screenshot every slider. Confirm leftmost tick = `max` (RTL).
8. Surface to Shay for Ron sign-off.

## Files touched

- `src/lib/nice-ticks.ts` (new)
- `src/lib/__tests__/nice-ticks.test.ts` (new)
- `src/components/tools/calculator/SliderInput.tsx`
- `src/components/tools/calculator/StepBase.tsx`
- `src/components/tools/calculator/StepDetails.tsx`
- `src/components/tools/employer/EmployerCalculator.tsx`
