# Ron's Employer Calculator Feedback — April 12, 2026

Source: תיקונים מחשבון שכיר מעסיק 12.04.2026.docx (6 annotated screenshots included)

## Pre-existing: Separate tool already at `/tools/employer-cost` — no structural change needed

---

## 1. Input fields — Step 1

### 1.א נסיעות (travel allowance) — NEW FIELD
- Default: 315
- Range: 0-1,500 with manual entry option
- Slider or input

### 1.ב שכר ברוטו label fix
- Add "(ללא נסיעות)" in parentheses after "שכר ברוטו חודשי"

### 1.ג Replace "רכב צמוד" terminology
- Everywhere it says "רכב צמוד" → replace with "שווי מס (רכב / ארוחות / שווי מס נוסף)"

## 2. Title change
- "נתוני שכר ורכב" → "מחשבון שכר עלות מעסיק"

## 3. Subtitle change
- "שכר ברוטו של העובד ופרטי רכב צמוד (אם קיים)" → "נתוני שכר עובד לחישוב"

## 4. Vehicle benefit — conditional toggle (LOGIC FIX)
- Question: "האם לעובד קיים רכב צמוד / שווי רכב?" כן/לא
- Default: לא
- If כן → show vehicle fields (manufacturer price, vehicle type)
- If לא → hide completely AND do NOT calculate behind the scenes
- **Critical**: Currently defaults calculate שווי רכב even when user doesn't need it

## 5. שווי ארוחות / תן ביס — NEW FIELD
- Question: "האם לעובד קיים שווי ארוחות (תן ביס/סיבוס וכדומה)?" כן/לא
- If כן → slider: default 1,000, range 500-2,000, manual entry option
- Adds to total שווי מס in calculation

## 6. שווי מס נוסף — NEW FIELD
- Question: "האם העובד מקבל הטבות נוספות (שווי מס נוסף מכל סוג)?" כן/לא
- If כן → slider: default 1,000, range 500-3,000, manual entry option
- Adds to total שווי מס in calculation

## 7. Step 2 (pension/benefits) display changes
*Reference: Screenshot img1.png — current pension step layout*

- **Remove** אובדן כושר עבודה from its position (it's duplicated — already above)
- **Keep** the red warning text: "אחוז א.כ.ע + תגמולים מעסיק לא יכול לעבור 7.5%"
- **Move** קרן השתלמות UP to where אובדן כושר עבודה was removed
- **Step indicators**: Make bigger and more prominent (numbers + labels)
- **Rename header**: "פנסיה והפרשות" → "פנסיה / ביטוח מנהלים וקרן השתלמות"

## 8. Personal data — Step 3 changes
*Reference: Screenshots img2.png (current with 0 children) + img3.png (with 2 children, ages, קצבת ילדים)*

### 8.א Children ages
- Default: **EMPTY** (not 0!) — currently 0 which triggers calculation
- Range: 0-18 only. Block negative and 19+
- Empty = forces user to enter a value

### 8.ב Legend (מקרא)
- Add period (.) at end of each line in the age legend (0 through 18)

### 8.ג מי מקבל קצבת ילדים — gender-aware defaults
- Male (זכר) selected → default to "בן/בת זוג"
- Female (נקבה) selected → default to "העובד/ת"
- Can be changed manually by user

### 8.ג (continued) נטול יכולת — NEW FIELD (disabled children)
- Only visible when children > 0
- Number input: cannot exceed total children count
- Not a required field
- **Tax impact**: Each disabled child = 2 credit points annually
- Monthly credit: count × שווי נקודת זיכוי × 2 / 12
- Must look aesthetic and clear

### 8.ד שירות צבאי / לאומי — NEW FIELD
- Toggle: שירות צבאי (default) / שירות לאומי
- Display TWO options (no month entry needed):
  - שירות מלא
  - שירות חלקי

**Credit point rules — Military (שירות צבאי):**
| Gender | Full service | Partial | None |
|--------|-------------|---------|------|
| Male | ≥23 months → 2 pts/year | 12-23 → 1 pt/year | <12 → 0 |
| Female | ≥22 months → 2 pts/year | 12-22 → 1 pt/year | <12 → 0 |

**Credit point rules — National (שירות לאומי):**
| Gender | Full service | Partial | None |
|--------|-------------|---------|------|
| Both | ≥24 months → 2 pts/year | 12-24 → 1 pt/year | <12 → 0 |

Display shows: "שירות מלא (23 ומעלה)" / "שירות חלקי (12-23)" with gender-appropriate thresholds.

## 9. Results display overhaul
*Reference: Screenshots img4.png (summary cards), img5.png (full results breakdown), img6.png (restart button position)*

### 9.א Separate identity
This is a salary cost calculator, NOT a vehicle calculator. Display must look different.

### 9.ב Top summary section
- Title: "מחשבון שכר עלות מעסיק"
- "חזור לשלב הקודם" — bigger font, applies to ALL steps
- **Summary cards** (replace current layout with):
  - שכר ברוטו + שווי מס = סה"כ שכר ברוטו (show both: with and without שווי מס)
  - שווי מס breakdown: שווי רכב, שווי ארוחות, שווי מס נוסף, סה"כ שווי מס
  - **שכר נטו: TWO numbers** — with שווי מס and without (requires dual calculations behind the scenes)
  - **עלות מעסיק: TWO numbers** — with שווי מס and without

### 9.ג Employee section ("עובד")
- Replace "נתוני הזנה" → "נתונים לחישוב שכר"
- Show: שכר ברוטו, נסיעות
- Conditionally show: שווי רכב, שווי ארוחות, שווי מס נוסף (only if values exist)
- סה"כ שווי מס (visual subtotal)
- סה"כ שכר עבודה חייב במס

### 9.ג — TAX CALCULATION FIX (CRITICAL)
**Employee pension tax credit is DIFFERENT from self-employed:**
- שכר קצבה מזכה מקסימאלי = 9,700 (or insured salary, whichever is lower)
- Max monthly pension deposit: 9,700 × 7% = 679
- Tax credit: 679 × 35% = **237.58 max monthly**
- **New configurable field needed**: "שכר מבוטח קצבה מזכה שכיר" = 9,700 (editable)

**Credit points display:**
- Format: "X.XX נקודות זיכוי (X,XXX ₪/חודש) + זיכויים נוספים X ₪, סה"כ זיכוי מס: X ₪"
- "זיכויים נוספים" includes (don't itemize to user at this stage):
  - Pension credit: max 237.58/month
  - Military/national service credit
  - Disabled children credit: count × creditPointValue × 2 / 12

### 9.ג — Net summary (employee)
Same visual design as employer cost summary cards:
- Header: "סיכום נטו עובד"
- נטו עובד **כולל** שווי מס (bold "כולל")
- נטו עובד **ללא** שווי מס (bold "ללא")
- פער שכר נטו (השפעת שווי מס)
- **Remove** נקודות זיכוי from here (already shown above)

### 9.ד Employer cost breakdown
- Move ביטוח לאומי מעסיק directly below שכר ברוטו (reorder)
- No need to separate נסיעות from employer perspective (gross is gross)

### 9.ה Employer cost summary labels
- "כולל שווי רכב" → "כולל שווי מס"
- "הפרש עלות מעסיק (השפעת רכב)" → "הפרש עלות מעסיק (השפעה שווי מס)"

### 9.ו Restart button position
*Reference: img6.png — Ron drew arrow showing "התחל מחדש" should be moved up, right after סיכום עלות מעסיק, before the CTA section*

## 10. Comparison feature
- Add comparison button (like שווי רכב calculator)
- After all fixes implemented, enable comparing two salary scenarios
- For now: שכיר vs שכיר only (not עצמאי — future)

## 11. Print / Share — NEW FEATURE
- PDF export button
- Share button
- **Mandatory disclaimer**: watermark "נתוני שכר להמחשה בלבד"
- "אין לנו אחריות" text
- Print only the calculation data, NOT the full page (like אשף הנטו does)
