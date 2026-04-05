# שאגת הארי (Operation Lion's Roar) — Grant Program Research
## Comprehensive Reference for Building an Eligibility Simulator

**Research date:** April 5, 2026
**Program status:** חל"ת law approved (Knesset, March 31, 2026). Business compensation framework published by Ministry of Finance — law draft (תזכיר חוק) circulated, pending final Knesset legislation as of this date.
**Official law name:** חוק התוכנית לסיוע כלכלי (פיצויים בעד נזק עקיף) (הוראת שעה), התשפ"ו–2026

---

## 1. Program Overview

**What is it?** A government compensation framework for businesses and employees hurt by Operation שאגת הארי (Israel's military operation against Iran, starting ~February 28, 2026). Modeled on the חרבות ברזל (Iron Swords, Oct 2023) and עם כלביא frameworks with adjusted comparison periods.

**Two separate tracks:**
1. **Business grants (מענקי המשכיות עסקית)** — for self-employed and businesses experiencing revenue decline
2. **חל"ת (unpaid leave) unemployment benefits** — for salaried employees placed on furlough

**Who administers:**
- Business grants: רשות המסים (Israel Tax Authority)
- חל"ת benefits: ביטוח לאומי (National Insurance Institute) via שירות התעסוקה (Employment Service)

---

## 2. Business Grant — Eligibility Criteria

### 2.1 Core Eligibility (ALL must be met)

| Condition | Detail |
|---|---|
| **Annual turnover** | Between 12,000 and 400,000,000 NIS |
| **Revenue decline** | >= 25% for monthly VAT reporters; >= 12.5% for bi-monthly reporters |
| **Comparison periods** | March 2026 vs. March 2025 (monthly); March-April 2026 vs. March-April 2025 (bi-monthly) |
| **VAT report filed** | Must file VAT report for 03/2026 (monthly) or 03-04/2026 (bi-monthly) BEFORE submitting grant application |
| **Books acceptable** | Business books (פנקסים) must NOT be deemed unacceptable for 2025 |
| **Business active** | Must not have reported closure before June 12, 2025 |

### 2.2 Annual Turnover Determination

- **Businesses opened before end of 2024:** Based on 2025 annual turnover
- **Businesses opened Jan-Feb 2025:** Base period is March 1, 2025 through Feb 28, 2026, annualized
- **Businesses opened from March 1, 2025:** From first reporting period after opening through Feb 28, 2026, annualized

### 2.3 Excluded Entities (מי לא זכאי)

- Financial institutions (מוסדות פיננסיים)
- Banks (בנקים)
- Insurance companies (חברות ביטוח)
- Government companies (חברות ממשלתיות)
- Budgeted institutions (גופים מתוקצבים)
- Real estate dealers (trading real estate as business inventory — סוחרי מקרקעין כמלאי עסקי)
- Diamond dealers (יהלומנים)
- Agriculture (חקלאות)
- Health maintenance organizations (קופות חולים)
- Public institutions (מוסדות ציבוריים)
- The State itself (המדינה)
- Businesses with unacceptable books for 2025
- Businesses that reported closure before June 12, 2025

---

## 3. Business Types Covered

All of the following are eligible (affects calculation, not eligibility per se):

| Business Type (Hebrew) | Notes |
|---|---|
| עוסק פטור (Exempt dealer) | Small business table only (no inputs/salary component) |
| עוסק מורשה (Licensed dealer) | Full formula applies |
| חברה בע"מ (Ltd company) | Full formula applies |
| שותפות (Partnership) | Full formula applies |
| עמותה / מלכ"ר (Association/Non-profit) | Employer cost multiplier = 1.325 (instead of 1.25) |
| קבלן ביצוע (Execution contractor) | Special track — see Section 6.3 |

---

## 4. Grant Calculation — Small Businesses (turnover up to 300,000 NIS)

Fixed amounts from lookup table — NO formula needed, no need to prove expenses.

### 4.1 Full Grant Table (NIS)

| Annual Turnover Range | 25%-40% decline | 40%-60% decline | 60%-80% decline | 80%-100% decline |
|---|---|---|---|---|
| 12,000 – 50,000 | 1,833 | 1,833 | 1,833 | 1,833 |
| 50,000 – 90,000 | 3,300 | 3,300 | 3,300 | 3,300 |
| 90,000 – 120,000 | 4,400 | 4,400 | 4,400 | 4,400 |
| 120,000 – 150,000 | 2,776 | 4,164 | 6,662 | 8,328 |
| 150,000 – 200,000 | 3,273 | 4,910 | 7,855 | 9,819 |
| 200,000 – 250,000 | 4,190 | 6,285 | 10,056 | 12,570 |
| 250,000 – 300,000 | 4,897 | 7,346 | 11,752 | 14,691 |

**Notes:**
- For turnovers 12K-120K, the amount is the same regardless of decline percentage
- For turnovers 120K-300K, the amount varies by decline severity
- The decline percentages above are for **monthly (חד חודשי)** reporters
- For **bi-monthly (דו חודשי)** reporters, the equivalent thresholds are: 12.5%-20%, 20%-30%, 30%-40%, 40%-50%

### 4.2 Minimum Protection (הגנת מינימום)

A business with turnover above 300,000 NIS whose formula-based calculation yields LESS than what it would get from the small business table — receives the higher of the two amounts.

---

## 5. Grant Calculation — Larger Businesses (turnover 300,000 – 400,000,000 NIS)

The grant consists of **two components added together:**

### 5.1 Component A: Fixed Expenses (רכיב הוצאות קבועות)

```
Grant_A = Average_Monthly_Inputs × Compensation_Coefficient
```

Where:
- **Average_Monthly_Inputs** = Total inputs/expenses reported to VAT in 2025 ÷ 12
- **Compensation_Coefficient** is determined by the decline rate:

| Revenue Decline (Monthly) | Revenue Decline (Bi-monthly) | Coefficient |
|---|---|---|
| 25% – 40% | 12.5% – 20% | 7% |
| 40% – 60% | 20% – 30% | 11% |
| 60% – 80% | 30% – 40% | 15% |
| 80% – 100% | 40% – 50% | 22% |

**Enhancement option (הגדלת מקדם):** The coefficient can be increased up to **1.5x** (e.g., 7% becomes 10.5%) if the business proves its actual fixed expenses exceed the standard calculation. Requires Tax Authority approval and documentation of: rent (שכירות), municipal tax (ארנונה), insurance (ביטוח), water/electricity/gas.

### 5.2 Component B: Salary Expenses (רכיב הוצאות שכר)

```
Grant_B = Salary_March_2026 × 1.25 × 0.75 × Decline_Rate
```

Where:
- **Salary_March_2026** = Total salary paid in March 2026 per Form 102 (טופס 102)
- **1.25** = Employer cost multiplier (עלות מעביד) — covers social benefits, pension, NII contributions
- **0.75** = Fixed coefficient
- **Decline_Rate** = The actual percentage of revenue decline (not the bracket)

**Important deductions from salary base:**
- Subtract salary of employees who used vacation days during the period
- Subtract salary of employees on חל"ת (unpaid leave)
- Subtract reserve duty (מילואים) reimbursements received for employees

**Per-employee salary cap:** 13,773 NIS (average national wage, שכר ממוצע במשק) × 1.25 = **17,216 NIS** per employee

**Associations/Non-profits (עמותות/מלכ"רים):** Use multiplier of **1.325** instead of 1.25

### 5.3 Total Grant = Component A + Component B

### 5.4 Grant Caps (תקרות)

| Annual Turnover | Maximum Total Grant |
|---|---|
| Up to 100,000,000 NIS | 600,000 NIS |
| 100,000,000 – 300,000,000 NIS | Linear scale from 600,000 to 1,200,000 NIS |
| 300,000,000 – 400,000,000 NIS | 1,200,000 NIS |

**Linear interpolation formula for 100M-300M range:**
```
Cap = 600,000 + (Turnover - 100,000,000) / 200,000,000 × 600,000
```

---

## 6. Special Tracks (מסלולים מיוחדים)

### 6.1 Northern Businesses — Red Track (מסלול אדום)

**Who qualifies:** Businesses eligible for the Red Track through April 2025 (border communities evacuated during Iron Swords)

**Key difference:** Comparison periods use **2023** data instead of 2025, recognizing prolonged damage from evacuations:
- Revenue comparison: March 2023 (monthly) or March-April 2023 (bi-monthly)
- Inputs base: Average of September 2022 through August 2023

**Additional benefits:**
- Full compensation for revenue differential (not just fixed expenses)
- No minimum decline threshold required
- No grant cap (unlimited)
- Individual assessment by Tax Authority

### 6.2 Cash-Basis Businesses (עסקים על בסיס מזומן)

**Who:** Businesses that report VAT on cash receipt basis (rather than accrual)

**Rule:** If their March decline is **below 40%**, they use shifted comparison periods:
- Monthly reporters: April 2026 vs. April 2025
- Bi-monthly reporters: May-June 2026 vs. May-June 2025

**Rationale:** Cash-basis businesses may show delayed impact since revenue is recognized on payment receipt.

### 6.3 Execution Contractors (קבלני ביצוע)

- **Eligibility month:** April 2026 (not March)
- **Compensation coefficient multiplied by:** 0.68
- **Input base period:** Average of July 2025 through February 2026

### 6.4 New Businesses (עסקים חדשים — opened from January 1, 2025)

- **Opened January-February 2025:** Base turnover = period from March 1, 2025 to February 28, 2026
- **Opened from March 1, 2025:** Base turnover = first reporting period after opening through February 28, 2026, with annual adjustment (annualized pro-rata)

---

## 7. Direct Damage Track (פיצוי נזק ישיר)

Separate from the indirect damage grant above. For businesses whose physical premises were damaged:

- **Fast track:** Up to 30,000 NIS within 7 business days, no surveyor needed
- **Standard track:** Above 30,000 NIS, requires surveyor assessment
- **Extended eligibility:** Businesses unable to use premises through April 30, 2026 get 6 additional months of eligibility (through October 2026)
- Includes a grant covering lost income (הכנסה חייבת) during the repair period

**Rental property owners:** If rental unit became uninhabitable for 30+ days, compensation = last monthly rent × months of rehabilitation period

---

## 8. חל"ת (Unpaid Leave) — Unemployment Benefits Track

### 8.1 Eligibility

| Condition | Requirement |
|---|---|
| **Minimum leave period** | 10 consecutive days (reduced from standard 30) |
| **Work history** | 6 months insured employment in past 18 months (reduced from 12) |
| **Special populations** | Only 3 months required: evacuees, disabled persons, IDF casualties/disabled, reservist spouses (90+ days), recently discharged soldiers, pregnant workers who gave birth during operation |
| **Registration** | Must register with Employment Service (שירות התעסוקה) |
| **NII claim** | Must file unemployment benefits claim with Bituach Leumi |

### 8.2 Benefit Amount

- **30% to 70% of salary** based on wage tables (standard unemployment benefit calculation)
- **No 5-day waiting period** — full payment from day 1
- **No vacation day deduction** — accrued vacation days not consumed first
- **Ages 67+:** 75% of average salary (from 3 of last 6 months), capped at 137 NIS/day

### 8.3 Employer Obligations

- Report via Form 100 (הודעה על הפסקת עבודה) to NII
- Consolidated Excel reporting to Employment Service
- **Paying wages during חל"ת voids eligibility** for unemployment benefits
- Employer receives 20% compensation for social security contributions during reserve duty in March 2026

### 8.4 Timeline

- **Law validity:** Retroactive from operation start through April 14, 2026 (extendable one month by Finance Minister)
- **Payment timeline:** Expected April-May 2026
- **Future framework:** Fixed through end of 2027 for future emergencies

### 8.5 Self-Employed (עצמאים)

Self-employed persons whose work stopped due to the operation may also be eligible for unemployment benefits, calculated based on accountant certification of earnings (not Form 102).

---

## 9. Tax Treatment of the Grant

| Aspect | Treatment |
|---|---|
| **VAT (מע"מ)** | Exempt — no VAT on grant |
| **National Insurance (ביטוח לאומי)** | Subject to NII contributions |
| **Income Tax (מס הכנסה)** | Taxable income |
| **Withholding tax (ניכוי מס במקור)** | If no valid exemption certificate — **20% withheld automatically** |

**Critical action item:** Business owners must verify/obtain withholding tax exemption (פטור ניכוי מס במקור) BEFORE applying. Without it, 20% is deducted at source.

---

## 10. Application Process & Deadlines

| Stage | Timeline |
|---|---|
| **Application window** | 30 days from system opening |
| **Prerequisite** | VAT report for 03/2026 (monthly) or 03-04/2026 (bi-monthly) must be filed first |
| **First advance (60%)** | Within 21 days of application submission |
| **Second payment (10%)** | After 150 days, if final eligibility not yet determined |
| **Final determination** | Within 8 months; if not determined — application approved in full |
| **Appeal (השגה)** | Within 90 days of decision letter |
| **Appeal resolution** | If not resolved within 8 months — appeal accepted |
| **Payment after approval** | Within 14 days |

---

## 11. Documentation Needed

For the grant application:
1. **VAT reports** — 03/2026 and comparison period (03/2025 or equivalent)
2. **Form 102** (salary report) for March 2026
3. **Withholding tax exemption certificate** (פטור ניכוי מס במקור)
4. **Business registration details** (עוסק מורשה/פטור/חברה)
5. **Bank account details** for payment
6. **For enhanced coefficient (1.5x):** Documentation of fixed expenses (lease agreements, ארנונה bills, insurance policies, utility bills)
7. **For northern track:** Proof of Red Track eligibility from previous operations
8. **For new businesses:** Opening date documentation

---

## 12. Simulator Design — Required User Inputs

Based on all the rules above, a simulator needs to collect:

### Step 1: Business Profile
- **Business type:** עוסק פטור / עוסק מורשה / חברה בע"מ / שותפות / עמותה-מלכ"ר / קבלן ביצוע
- **VAT reporting frequency:** חד חודשי (monthly) / דו חודשי (bi-monthly)
- **Business opening date:** Before 2025 / Jan-Feb 2025 / March 2025 or later
- **Location:** Northern Red Track eligible? Yes/No
- **Revenue recognition:** Accrual basis / Cash basis (בסיס מזומן)

### Step 2: Revenue Data
- **Annual turnover (2025):** In NIS
- **March 2025 turnover (or March-April 2025 for bi-monthly):** For decline calculation
- **March 2026 turnover (or March-April 2026 for bi-monthly):** Current period

### Step 3: Expense Data (only if turnover > 300,000)
- **Average monthly inputs/expenses in 2025** (from VAT reports)
- **Total salary paid in March 2026** (from Form 102)
- **Number of employees**
- **Any employees on חל"ת during March?** (amount to deduct)
- **Any employees on reserve duty?** (reimbursements to deduct)
- **Any employees who used vacation?** (amount to deduct)

### Step 4: Optional Enhancement
- **Request enhanced coefficient (1.5x)?** Yes/No
- If yes: **Documented fixed expenses amount** (rent + ארנונה + insurance + utilities)

### Derived Calculations (automatic)
1. Calculate decline rate: `(Revenue_Base - Revenue_Current) / Revenue_Base × 100`
2. Check eligibility: decline >= 25% (monthly) or >= 12.5% (bi-monthly)
3. Determine track: small business table vs. formula
4. If small business: lookup table value
5. If large business: calculate Component A + Component B
6. Apply caps
7. Apply minimum protection (compare formula result to table value)
8. Display estimated grant amount

---

## 13. Edge Cases & Gotchas

1. **Bi-monthly reporters cannot apply until after filing 03-04/2026 VAT** — they're delayed ~6 weeks compared to monthly reporters
2. **Cash-basis businesses with < 40% March decline** use April comparison, further delaying their application
3. **Contractors use April 2026** as their eligibility month, not March
4. **Exempt dealers (עוסק פטור)** can only get the small business table amounts (they don't file VAT inputs)
5. **Businesses exactly at the 300,000 threshold** — the minimum protection rule applies (they get the higher of table or formula)
6. **Northern businesses** use 2023 comparison data — substantially different calculation
7. **The 1.5x enhancement** requires Tax Authority approval — it's not automatic. Simulator should show both scenarios
8. **Per-employee salary cap** (17,216 NIS) means high earners don't increase the grant proportionally
9. **20% withholding** is deducted if no exemption — affects net received amount (though not the grant entitlement itself)
10. **New businesses (2025)** have annualized turnover which may push them into a different bracket than their actual revenue
11. **Grant is per "business entity"** — a person with multiple businesses files separately for each
12. **Turnover includes ALL transactions** reported to VAT, not just the main business activity
13. **The law is not yet final** — as of April 5, 2026, the business compensation framework is based on the published תזכיר חוק (law draft) and Ministry of Finance announcements. Changes possible during Knesset legislation.

---

## 14. Comparison with Previous Programs

| Feature | חרבות ברזל (2023) | עם כלביא (2024) | שאגת הארי (2026) |
|---|---|---|---|
| Decline threshold | 25% / 12.5% | 25% / 12.5% | 25% / 12.5% |
| Comparison period | vs. 2022 | vs. 2023 | vs. 2025 |
| Max turnover | 400M NIS | 400M NIS | 400M NIS |
| Small biz table | Same structure | Same structure | Same amounts |
| Coefficients | 7/11/15/22% | 7/11/15/22% | 7/11/15/22% |
| Grant cap | 600K / 1.2M | 600K / 1.2M | 600K / 1.2M |
| חל"ת minimum days | 14 | 14 | 10 |

The framework is intentionally consistent across operations to provide predictability.

---

## 15. Sources

- [Bitan & Bitan — מענקים לעסקים במבצע שאגת הארי](https://bitancpa.com/knowledge/business-grants-operation-shaagat-haari-2026) — existing article on the Bitan website
- [Ynet — גובש מתווה הסיוע למשק בשאגת הארי](https://www.ynet.co.il/economy/article/rjjq3rrt11g)
- [N12/Mako — מתווה הפיצויים של מבצע שאגת הארי](https://www.mako.co.il/news-money/2026_q1/Article-79d26c770b1ec91027.htm)
- [Calcalist — האוצר חשף את מתווה הסיוע לעסקים](https://www.calcalist.co.il/local_news/article/byg003bkc11l)
- [Globes — מתווה הסיוע לעסקים נחשף](https://www.globes.co.il/news/article.aspx?did=1001537264)
- [Kol Zchut — מדריך לעצמאים ובעלי עסקים](https://www.kolzchut.org.il/he/%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%A2%D7%A6%D7%9E%D7%90%D7%99%D7%9D_%D7%95%D7%91%D7%A2%D7%9C%D7%99_%D7%A2%D7%A1%D7%A7%D7%99%D7%9D_%D7%91%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%9E%D7%9C%D7%97%D7%9E%D7%94_%D7%9E%D7%95%D7%9C_%D7%90%D7%99%D7%A8%D7%90%D7%9F_(%D7%9E%D7%91%D7%A6%D7%A2_%D7%A9%D7%90%D7%92%D7%AA_%D7%94%D7%90%D7%A8%D7%99))
- [EY Israel — מתווה הפיצויים לשאגת הארי](https://ey.co.il/%D7%9E%D7%AA%D7%95%D7%95%D7%94-%D7%94%D7%A4%D7%99%D7%A6%D7%95%D7%99%D7%99%D7%9D-%D7%9C%D7%A9%D7%90%D7%92%D7%AA-%D7%94%D7%90%D7%A8%D7%99-%D7%9E%D7%94-%D7%94%D7%96%D7%9B%D7%95%D7%99%D7%95/)
- [Bituach Leumi — עדכונים שוטפים שאגת הארי](https://www.btl.gov.il/About/news/Pages/hadasa2026saagathaaryiran.aspx)
- [Bituach Leumi — מתווה התגמולים לחל"ת](https://www.btl.gov.il/StateOfEmergency/ShaagatHari/Pages/halat-shaagatHari1.aspx)
- [Gornitzky — ניוזלטר למעסיקים חל"ת ודמי אבטלה](https://www.gornitzky.co.il/%D7%A0%D7%99%D7%95%D7%96%D7%9C%D7%98%D7%A8-%D7%9C%D7%9E%D7%A2%D7%A1%D7%99%D7%A7%D7%99%D7%9D-%D7%9E%D7%AA%D7%95%D7%95%D7%94-%D7%97%D7%9C%D7%AA-%D7%95%D7%93%D7%9E%D7%99-%D7%90%D7%91%D7%98%D7%9C/)
- [Srugim — מתווה הפיצויים אושר בכנסת](https://www.srugim.co.il/1301099)
- [Maariv — מתווה החל"ת אושר סופית בכנסת](https://www.maariv.co.il/breaking-news/article-1303333)
- [Green Invoice — מבצע שאגת הארי מתווה פיצויים](https://www.greeninvoice.co.il/magazine/%D7%A9%D7%90%D7%92%D7%AA-%D7%94%D7%90%D7%A8%D7%99/)
- [Hyp — פיצוי לעסקים ועצמאים במלחמה](https://hyp.co.il/blog/compensation-businesses-war/)
- [Amir CPA — שאגת הארי פיצויי נזק עקיף תזכיר חוק](https://www.amir-cpa.net/post/%D7%A9%D7%90%D7%92%D7%AA-%D7%94%D7%90%D7%A8%D7%99-%D7%A4%D7%99%D7%A6%D7%95%D7%99%D7%99%D7%9D-%D7%9C%D7%A2%D7%A1%D7%A7%D7%99%D7%9D-%D7%92%D7%9D-%D7%A2%D7%9C-%D7%A0%D7%96%D7%A7-%D7%A2%D7%A7%D7%99%D7%A3)
- [CPA Dray — מענק עם כלביא סימולטור (predecessor)](https://cpa-dray.com/he/blog/%D7%9E%D7%A2%D7%A0%D7%A7-%D7%A2%D7%9D-%D7%9B%D7%9C%D7%91%D7%99%D7%90-%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%94%D7%9E%D7%9C%D7%90-%D7%9C%D7%A2%D7%A1%D7%A7%D7%99%D7%9D/)
- [התאחדות מעונות היום — מחשבון פיצויים שאגת הארי](https://hmeonot.org.il/%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%9F-%D7%A4%D7%99%D7%A6%D7%95%D7%99%D7%99%D7%9D-%D7%A9%D7%90%D7%92%D7%AA-%D7%94%D7%90%D7%A8%D7%99-2026/)
- Existing Bitan website publish script: `/Users/shay/bitan-bitan-website/scripts/publish-shaagat-haari.mjs`

---

## 16. Existing Competitors / Reference Simulators

1. **התאחדות מעונות היום** — https://hmeonot.org.il/מחשבון-פיצויים-שאגת-הארי-2026/
   - Based on presentation by ירון גינדי (President of Tax Advisors Association)
   - Covers all business types including עמותות and קבלני ביצוע
   - Asks: business type, turnover, decline %, expenses, salary data

2. **CPA Dray** — https://cpa-dray.com — Had an עם כלביא simulator (same formula structure)
   - Inputs: annual turnover, decline %, reporting frequency, expenses, salary
   - Dynamically shows/hides fields based on turnover bracket

3. **Gov.il Tax Authority** — Has a generic "מענק עבודה" simulator but not yet a specific שאגת הארי calculator

### What Bitan's simulator should do better:
- Clearer Hebrew UX (no jargon without explanation)
- Show both scenarios when relevant (e.g., with/without 1.5x enhancement)
- Explain the result ("you're in the small business track because...")
- Cross-link to the existing שאגת הארי article
- CTA to contact Bitan for filing assistance
- Add disclaimer about law not being finalized
