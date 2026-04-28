# Tax Tables Reference + Calculator Regression Tests

**Date:** 2026-04-28
**Status:** Approved
**Scope:** Data extraction + test suite. Zero refactoring of existing engine code.

## Problem

Two calculator engines (leasing + employer cost) independently hardcode the same Israeli tax constants (brackets, NII rates, שווי מס caps). When 2027 rates arrive, an agent must find and update values in 4+ files. No tests exist to catch regressions.

## Solution

### 1. `src/lib/tax-tables-2026.ts` — Canonical Reference

Single file containing all Israeli tax constants for 2026. Does NOT replace existing engine configs — serves as the documented source of truth for future agents updating rates.

Contents:
- Income tax brackets (annual ceilings + rates, 7 brackets)
- NII rates (employee low/high, employer low/high, thresholds)
- Credit point value (₪2,904/year)
- Average salary (₪13,769)
- שווי מס vehicle rates (2.48%, cap ₪596,860, electric/hybrid/plug-in reductions)
- Company tax rate (23%)
- VAT rate (18%)
- Severance cap (₪34,900), education fund cap (₪15,712)
- Pension credit config (cap ₪9,700, 7% rate, 35% tax rate)

### 2. `src/components/tools/calculator/__tests__/engine.test.ts`

~15 snapshot-style tests. Each test calls an engine function with fixed inputs and asserts the output matches a known-good result. Results are captured from the current engine (not hand-calculated).

Coverage:
- `calculatePurchase`: selfEmployed/privatePetrol, company/privateElectric, employee/privatePetrol
- `calculateFinancialLeasing`: with trade-in, standard, employee mode
- `calculateOperationalLeasing`: private, commercial
- `calculateAmortization`: standard, zero-rate, single month
- `solveEffectiveRate`: known IRR scenarios
- `calculateTaxSavings`: bracket boundary (income at each bracket edge)
- `calculateVehicleTaxBenefit`: at cap, below cap, electric reduction

### 3. `src/components/tools/employer/__tests__/engine.test.ts`

~10 snapshot-style tests.

Coverage:
- `calculateEmployerCost`: 15K salary basic, 25K with vehicle, 40K with all benefits
- `calculateEmployerCost`: with/without pension, with/without education fund
- `calculateVehicleBenefit`: petrol, electric, commercial, at cap
- `calculateCreditPoints`: male married 2 kids, female single parent with service
- `calculateNII` (via full calc): at threshold boundary

### Test runner

Uses Node.js built-in test runner (`node --test`). No new dependencies. Script in package.json:
```
"test": "node --test src/components/tools/*/__tests__/*.test.ts"
```
Requires `tsx` or `ts-node` for TypeScript — will use `npx tsx` to avoid adding deps.

## What does NOT change

- `calculator/engine.ts`, `calculator/config.ts`, `calculator/types.ts`
- `employer/engine.ts`, `employer/config.ts`, `employer/types.ts`
- Any React components
- Any Sanity schemas

## Future work (not in scope)

- Engines importing from shared `tax-tables-2026.ts` instead of hardcoding
- Unifying `calculateVehicleTaxBenefit` across both engines
- Building a shared `lib/tax-engine/` module
- Adding the שאגת הארי grant simulator as a third consumer
