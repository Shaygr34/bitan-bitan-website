/**
 * Israeli Tax Tables — 2026
 *
 * Canonical reference for all tax constants used across calculator engines.
 * Both calculator/config.ts and employer/config.ts currently hardcode these
 * values independently. This file is the SINGLE SOURCE OF TRUTH for future
 * rate updates (e.g. when 2027 brackets are published).
 *
 * TO UPDATE FOR A NEW TAX YEAR:
 * 1. Copy this file to tax-tables-YYYY.ts
 * 2. Update all values below from official sources (רשות המיסים, כל-זכות, malam-payroll)
 * 3. Update calculator/config.ts and employer/config.ts to match
 * 4. Run tests to verify nothing breaks: npx tsx --test src/components/tools/__tests__/*.test.ts
 *
 * Sources (2026):
 * - Tax brackets: כל-זכות, malam-payroll, CWS Israel (April 2026)
 * - NII rates: ביטוח לאומי official tables
 * - שווי מס: רשות המיסים circular
 * - Ron Bitan confirmation: April 6, 2026
 */

// ─── Income Tax Brackets (6 brackets) ───────────────────────────────────────
// Ron's spec (April 30, 2026): regular brackets cap at 47%. Mas Yasaf (3% surtax)
// is calculated SEPARATELY and added on top — see MAS_YASAF_2026 below.

export const TAX_BRACKETS_2026 = {
  annual: [
    { ceiling:  84_120, rate: 0.10 },
    { ceiling: 120_720, rate: 0.14 },
    { ceiling: 228_000, rate: 0.20 },  // expanded from 193,800 in 2025
    { ceiling: 301_200, rate: 0.31 },  // expanded from 269,280 in 2025
    { ceiling: 560_280, rate: 0.35 },
    { ceiling: Infinity, rate: 0.47 },
  ],
  monthly: [
    { upTo:  7_010, rate: 0.10 },
    { upTo: 10_060, rate: 0.14 },
    { upTo: 19_000, rate: 0.20 },
    { upTo: 25_100, rate: 0.31 },
    { upTo: 46_690, rate: 0.35 },
    { upTo: Infinity, rate: 0.47 },
  ],
} as const

// ─── מס יסף (Mas Yasaf — 3% surtax above threshold) ─────────────────────────

export const MAS_YASAF_2026 = {
  monthly: { threshold: 60_130, rate: 0.03 },
  annual:  { threshold: 721_560, rate: 0.03 },
} as const

// ─── National Insurance (ביטוח לאומי) ──────────────────────────────────────
// Source: BTL Circular 1522 (חוזר מעסיקים), January 1, 2026.
// Rates are %; lowThreshold/highThreshold are monthly ₪ ceilings.

export const NII_2026 = {
  // Thresholds (monthly)
  lowThreshold: 7_703,
  highThreshold: 51_910,

  // Employee rates — default category (standard / טור 1)
  employeeLow: 0.0427,
  employeeHigh: 0.1217,

  // Employer rates — default category (standard / טור 1)
  employerLow: 0.0451,
  employerHigh: 0.076,

  // Self-employed simplified (leasing calc uses these)
  selfEmployedSavingsRateAboveThreshold: 0.18,
  selfEmployedSavingsRateBelowThreshold: 0.077,

  // Self-employed actual NII rates paid (used for back-calc helpers).
  // 4.47% below threshold, 12.83% above. Source: BTL 2026.
  selfEmployedRateBelowThreshold: 0.0447,
  selfEmployedRateAboveThreshold: 0.1283,
} as const

/**
 * NII category — determines which BTL rate column applies.
 * 'standard' is טור 1 (resident 18-retirement age, the default for ~95% of cases).
 */
export type NIICategory =
  | 'standard'              // טור 1 — תושב ישראל בגיל העבודה (default)
  | 'controllingShareholder' // טור 2 — בעל שליטה בחברת מעטים
  | 'retiree'               // טור 3 — מקבל קצבה לאחר גיל פרישה (קצבת זקנה)
  | 'foreignResident'       // תושב זר (עובד זר)

export type NIIRates = {
  employeeLow: number
  employeeHigh: number
  employerLow: number
  employerHigh: number
}

/**
 * NII rate table — each category maps to (employee, employer) × (low, high) rates.
 * Source: BTL Circular 1522 (January 2026), pages 5-8.
 *
 * Notes:
 * - 'retiree' uses טור 3 ages 67-70 row (5.97% high) as a representative rate.
 *   Real implementation may need finer age sub-categories.
 * - 'foreignResident' and 'territoriesResident' rates are flat across the
 *   threshold in BTL tables but follow the same low/high split structure here.
 */
export const NII_TABLE_2026: Record<NIICategory, NIIRates> = {
  standard: {
    employeeLow: 0.0427,
    employeeHigh: 0.1217,
    employerLow: 0.0451,
    employerHigh: 0.076,
  },
  controllingShareholder: {
    employeeLow: 0.0425,
    employeeHigh: 0.1196,
    employerLow: 0.0446,
    employerHigh: 0.0738,
  },
  retiree: {
    employeeLow: 0.0517,
    employeeHigh: 0.0597,
    employerLow: 0.0451,
    employerHigh: 0.076,
  },
  foreignResident: {
    employeeLow: 0.0085,
    employeeHigh: 0.0352,
    employerLow: 0.0059,
    employerHigh: 0.0259,
  },
} as const

/** UI labels (Hebrew) for each NII category. */
export const NII_CATEGORY_LABELS: Record<NIICategory, string> = {
  standard: 'תושב ישראל (ברירת מחדל)',
  controllingShareholder: 'בעל שליטה בחברת מעטים',
  retiree: 'פנסיונר (לאחר גיל פרישה)',
  foreignResident: 'תושב זר/אמנת מס',
}

// ─── NII v2 (Ron May 5, 2026) — Full 6-category × calc-type table ──────────
// Source: Ron's docx (April 30, 2026, item 19) + BTL Circular 1522.
// Replaces the 4-entry NII_TABLE_2026 with the full 13-row authoritative matrix.
// UI: cascading dropdowns (category → calc-type). Engine: rates lookup by pair.

export type NIICategoryV2 =
  | '18-retirement'    // 18 - גיל פרישה
  | 'pensioner'        // מקבל קצבת אזרח ותיק
  | 'non-pensioner'    // לא מקבל קצבת אזרח ותיק
  | 'disability'       // מקבל קצבת נכות עבודה / נכות כללית
  | 'under-18'         // מתחת לגיל 18
  | 'soldier-foreign'  // חייל סדיר / תושב זר מדינת אמנה

export type NIICalcType =
  | 'regular'      // חישוב רגיל
  | 'controlling'  // בעל שליטה
  | 'female-67'    // אישה בין גיל פרישה לגבר (only for non-pensioner)
  | 'age-67-70'    // נשים וגברים בין 67 ל-70 (only for non-pensioner)

export const NII_CATEGORY_V2_LABELS: Record<NIICategoryV2, string> = {
  '18-retirement': 'מגיל 18 עד גיל פרישה',
  'pensioner': 'מקבל קצבת אזרח ותיק',
  'non-pensioner': 'לא מקבל קצבת אזרח ותיק',
  'disability': 'מקבל קצבת נכות עבודה / נכות כללית',
  'under-18': 'מתחת לגיל 18',
  'soldier-foreign': 'חייל סדיר / תושב זר מדינת אמנה',
}

export const NII_CALCTYPE_LABELS: Record<NIICalcType, string> = {
  'regular': 'חישוב רגיל',
  'controlling': 'בעל שליטה',
  'female-67': 'אישה גיל פרישה - 67',
  'age-67-70': 'גיל 67 - 70',
}

/**
 * Allowed calc-types per category. UI second dropdown filters by this.
 */
export const NII_CALCTYPES_BY_CATEGORY: Record<NIICategoryV2, NIICalcType[]> = {
  '18-retirement': ['regular', 'controlling'],
  'pensioner': ['regular', 'controlling'],
  'non-pensioner': ['female-67', 'age-67-70', 'controlling'],
  'disability': ['regular', 'controlling'],
  'under-18': ['regular', 'controlling'],
  'soldier-foreign': ['regular', 'controlling'],
}

/**
 * Full NII rate matrix (Ron's docx, item 19; BTL Circular 1522).
 * Key format: `${category}::${calcType}`. Values are decimal rates (0.0427 = 4.27%).
 */
export const NII_TABLE_V2_2026: Record<string, NIIRates> = {
  '18-retirement::regular':      { employeeLow: 0.0427, employeeHigh: 0.1217, employerLow: 0.0451, employerHigh: 0.0760 },
  '18-retirement::controlling':  { employeeLow: 0.0425, employeeHigh: 0.1196, employerLow: 0.0460, employerHigh: 0.0738 },

  'pensioner::regular':          { employeeLow: 0.0000, employeeHigh: 0.0000, employerLow: 0.0061, employerHigh: 0.0212 },
  'pensioner::controlling':      { employeeLow: 0.0000, employeeHigh: 0.0000, employerLow: 0.0060, employerHigh: 0.0206 },

  'non-pensioner::female-67':    { employeeLow: 0.0950, employeeHigh: 0.1024, employerLow: 0.0417, employerHigh: 0.0712 },
  'non-pensioner::age-67-70':    { employeeLow: 0.0393, employeeHigh: 0.1003, employerLow: 0.0413, employerHigh: 0.0696 },
  'non-pensioner::controlling':  { employeeLow: 0.0393, employeeHigh: 0.1003, employerLow: 0.0412, employerHigh: 0.0690 },

  'disability::regular':         { employeeLow: 0.0323, employeeHigh: 0.0517, employerLow: 0.0061, employerHigh: 0.0212 },
  'disability::controlling':     { employeeLow: 0.0323, employeeHigh: 0.0517, employerLow: 0.0060, employerHigh: 0.0206 },

  'under-18::regular':           { employeeLow: 0.0000, employeeHigh: 0.0000, employerLow: 0.0061, employerHigh: 0.0212 },
  'under-18::controlling':       { employeeLow: 0.0000, employeeHigh: 0.0000, employerLow: 0.0060, employerHigh: 0.0206 },

  'soldier-foreign::regular':     { employeeLow: 0.0104, employeeHigh: 0.0700, employerLow: 0.0451, employerHigh: 0.0760 },
  'soldier-foreign::controlling': { employeeLow: 0.0102, employeeHigh: 0.0679, employerLow: 0.0446, employerHigh: 0.0738 },
}

/**
 * Helper: lookup NII rates by (category, calcType) pair.
 * Falls back to '18-retirement::regular' if pair is unknown (defensive).
 */
export function getNIIRatesV2(category: NIICategoryV2, calcType: NIICalcType): NIIRates {
  const key = `${category}::${calcType}`
  return NII_TABLE_V2_2026[key] ?? NII_TABLE_V2_2026['18-retirement::regular']
}

/**
 * Migration: map legacy 4-value `niiCategory` to new (category, calcType) pair.
 * Used for backwards compat with old share-URLs.
 */
export function migrateLegacyNIICategory(legacy: NIICategory): { category: NIICategoryV2; calcType: NIICalcType } {
  switch (legacy) {
    case 'standard':                return { category: '18-retirement', calcType: 'regular' }
    case 'controllingShareholder': return { category: '18-retirement', calcType: 'controlling' }
    case 'retiree':                 return { category: 'pensioner', calcType: 'regular' }
    case 'foreignResident':         return { category: 'soldier-foreign', calcType: 'regular' }
  }
}

// ─── Credit Points ─────────────────────────────────────────────────────────

export const CREDIT_POINTS_2026 = {
  valuePerYear: 2_904,  // ₪/year per point

  base: {
    male: 2.25,
    female: 2.75,
  },

  childAgeCredits: [
    { minAge: 0, maxAge: 0, points: 2.5 },
    { minAge: 1, maxAge: 2, points: 4.5 },
    { minAge: 3, maxAge: 3, points: 3.5 },
    { minAge: 4, maxAge: 5, points: 2.5 },
    { minAge: 6, maxAge: 17, points: 1 },
    { minAge: 18, maxAge: 18, points: 0 },
  ],

  childAllowanceBonusAges: { minAge: 6, maxAge: 17, multiplier: 2 },

  service: {
    military: { full: 2, partial: 1, fullThresholdMale: 23, fullThresholdFemale: 22 },
    national: { full: 2, partial: 1, fullThreshold: 24 },
  },

  disabledChildPointsEach: 2,
} as const

// ─── Salary & Pension Caps ─────────────────────────────────────────────────

export const SALARY_CAPS_2026 = {
  averageSalary: 13_769,        // שכר ממוצע במשק
  severanceCap: 45_600,         // תקרת פיצויים (Ron: April 30, 2026 — was 34,900)
  educationFundCap: 15_712,     // תקרת קרן השתלמות

  pensionCredit: {
    salaryCap: 9_700,           // תקרת שכר מבוטח קצבה מזכה
    rate: 0.07,                 // 7%
    taxRate: 0.35,              // 35%
  },
} as const

// ─── Vehicle שווי מס ───────────────────────────────────────────────────────

export const VEHICLE_TAX_2026 = {
  benefitRate: 0.0248,          // 2.48% of manufacturer price
  manufacturerPriceCap: 596_860,

  // Monthly reductions by fuel type
  reductions: {
    petrol: 0,
    electric: 1_350,
    plugIn: 1_130,
    hybrid: 560,
    commercial: 0,              // no שווי מס for commercial
  },

  // Depreciation rates (annual)
  depreciation: {
    petrol: 0.15,
    electric: 0.20,
  },

  // VAT recovery rates
  vatRecovery: {
    private: 2 / 3,             // 2/3 exact (Ron: April 30, 2026 — was 0.67 approx)
    commercial: 1.0,            // 100%
  },

  // Tax deduction multiplier
  deductionMultiplier: {
    private: 0.45,              // 45% of deductible expenses
    commercial: 1.0,            // 100%
  },
} as const

// ─── Corporate & General ───────────────────────────────────────────────────

export const GENERAL_2026 = {
  companyTaxRate: 0.23,         // מס חברות 23%
  vatRate: 0.18,                // מע"מ 18%
  primeRate: 5.5,               // ריבית פריים (Bank of Israel, April 2026)
  surchargeThreshold: 60_130,   // מס יסף — monthly threshold
  defaultTravelAllowance: 315,  // נסיעות default
} as const
