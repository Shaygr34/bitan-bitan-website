# Ron Tools Feedback V3 — Phase 2 Implementation Plan

**Date:** 2026-05-05
**Source:** Ron's docx (April 30, 2026 employer + booklet attachment) — fully extracted
**Predecessor:** `2026-05-05-ron-tools-feedback-v3.md` (Phase 1 already shipped)

## What's Already Shipped (Phase 1)
- Severance cap 45,600, VAT 2/3, Mas Yasaf separated, NII 4-category dropdown,
  display restructure with scenario tabs, dual-scenario URL share, electric km/₪
  bidirectional sliders, 2-page comparison print.

## What This Phase Covers (Tasks #38, #40, #42, #43, #44 engine, #45)

### Sub-Phase A — Engine fix: travel in tax/NII calc base (#44 engine, #45)
Ron #14: "מחושב מסה"כ שכר עבודה חייב במס - זה כולל שכר ברוטו, נסיעות וכל סוג של שווי מס"
Ron #15 display: "נסיעות לא מופיעות בסיכום של סה"כ שכר עבודה חייב במס"

Reconciliation: travel IS in calc base, NOT in displayed "totalTaxableIncome" row.

**Engine change:** Add `taxCalcBase = totalTaxableWithShvui + travelAllowance`.
incomeTax + NII use `taxCalcBase`. Displayed `totalTaxableIncome` unchanged.

**Existing tests will break** — they pre-included travel in `grossSalary`. Update:
- Ron 30,315 → split as grossSalary 30,000 + travel 315
- Ron controllingShareholder 30,315 → split same
- Ron foreignResident 30,315 → split same
- Snapshot tests recalculated for new tax base

**Verify Ron's exact example** (#45):
- grossSalary 30,000, travel 315 (default), default profile (male, no kids, has pension+edu)
- Brackets: 7010@10% + 3050@14% + 8940@20% + 6100@31% + 5215@35% = 6632.25
- minus credits 544.5 (2.25 nz) + 237.65 (pension credit) = 5850.10 → 5850 ✓
- NII employee: 328.91 + (30315-7703)×12.17% = 328.91 + 2751.88 = 3081 ✓
- NII employer: 347.40 + 22612×7.6% = 347.40 + 1718.51 = 2066 ✓

### Sub-Phase B — Yishuv Mutav (#42, #43)
**Data:** 488 settlements with rate (7%/10%/12%/14%/18%/20%) and annual cap.
Source: `לוח ניכויים חודשי 2026` pages 20-32 (extracted as `yishuv-mutav-2026.json`).

**Inputs:**
- `yishuvName: string | null` — null = no yishuv credit
- Default null

**Engine logic (per Ron):**
- monthlyCap = annualCap / 12
- eligibleSalary = min(grossSalary, monthlyCap)
- yishuvCredit = eligibleSalary × ratePct%

**UI:** searchable dropdown (488 entries), default "ללא יישוב מוטב". Optional step on personal details.

### Sub-Phase C — Degree Credits (#40, #43)
**Inputs:**
- `degrees: { type, year, deferred? }[]` — multi-select, mutual exclusion rules
- Types: `none | bachelor | master | phdRegular | phdDirect | phdMedicine | professional`

**Window logic per type** (eval year = `evaluationDate.year`):
- **bachelor**: 1 nz, 3-yr window from `year`. If `deferred=true`, window starts year+1.
- **master**: 0.5 nz, 1-yr window = `year` only.
- **phdRegular**: 0.5 nz, 3-yr window from `year`. Deferral → year+1.
- **phdDirect**: combined — bachelorYear (3-yr → 1 nz) + phdYear (2-yr → 0.5 nz).
- **phdMedicine**: 2-yr window from `year`. Year 1: 1 nz. Year 2: 0.5 nz.
- **professional**: 1 nz for `year` only. EXCLUSIVE with bachelor/master same year.

**Result:** `degreeCredit: number` (annual nz), added to total.

### Sub-Phase D — NII Full 6-category Table (#38)
Ron's spec table (13 rate rows). Replace current 4-category enum with:

```
NIICategoryV2 = '18_pension' | 'disability' | 'noElderly' | 'under18' | 'elderly' | 'soldierForeign'
NIICalcType   = 'regular' | 'controlling' | 'female67' | 'age67_70'
```

Build `NII_TABLE_V2_2026: Record<{cat,calcType}, NIIRates>` with all 13 rows.

**UI:** two cascading dropdowns (category → calcType), rendered alongside existing `niiCategory` dropdown for backwards compat.

**Migration:** map old `niiCategory` → new pair on engine call.

### Sub-Phase E — Display Restructure (#43)
Per Ron's templates:
- "4.75 נ.ז (1,150 ₪/חודש) + זיכוי פנסיה 238 ₪, סה"כ זיכוי מס: 1,388 ₪"
- + יישוב מוטב line if present
- + תואר line if present (separate from total nz)

Build credit string composer in `EmployerResults.tsx`.

### Sub-Phase F — Mandatory child age (#16)
If `childrenAges.length > 0` and any age is null/-1, block the calculation OR clamp to 0 with visible warning. Per Ron: don't proceed without ages entered.

**Implementation:** UI validation (no engine change needed since engine already filters age sentinels via lookup).

### Sub-Phase G — NII Bracket Display (#45)
Show calculation breakdown in results (e.g., "7,703 × 4.27% = 329 / (X − 7,703) × 12.17% = Y").

## Test Strategy (TDD)

**Phase A:** Update 4 existing tests' expected values + add Ron 30,315 + 70,000 verifier tests.
**Phase B:** Yishuv calc unit tests (אשקלון 7%/146,640, edge cases).
**Phase C:** Degree windows — 8+ tests for each type's window math.
**Phase D:** Re-test NII for all 13 calc-type rows.
**Phase E-G:** Component snapshot tests (visual regression).

## Out of Scope

- Sanity CMS for yishuv/NII tables (use static JSON; CMS migration follow-up)
- File upload for yishuv list (Ron mentioned future capability)
- Annual update tooling (manual edit of JSON for now)
- Component-level Storybook tests (defer to design polish session)

## Commit Strategy

One commit per sub-phase. Each lands behind `npm test` green.
