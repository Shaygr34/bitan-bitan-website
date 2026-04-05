# תחום עיסוק — Taxonomy (25 Categories)

Consolidation of ~470 raw Summit CRM business sectors into 25 canonical categories.
Used for: client onboarding form dropdown, Summit CRM cleanup, analytics.

## Categories

| # | Category (Hebrew) | English | Examples from Summit data |
|---|-------------------|---------|--------------------------|
| 1 | **נדל"ן ושכירות** | Real Estate & Rental | נדל"ן, שכירות, תיווך, השכרת נכסים, יזמות בנייה, Airbnb |
| 2 | **בנייה ושיפוצים** | Construction & Renovation | שיפוצים, אלומיניום, חשמל, אינסטלציה, דלתות, מעליות, איטום, פחחות |
| 3 | **ייעוץ וניהול** | Consulting & Management | ייעוץ, ייעוץ עסקי, ייעוץ פיננסי, ניהול, אחזקות, דירקטורית |
| 4 | **טכנולוגיה ודיגיטל** | Technology & Digital | פיתוח תוכנה, קידום אתרים, שיווק דיגיטלי, אפליקציות, מיחשוב, סטארט-אפ |
| 5 | **מזון ומסעדנות** | Food & Hospitality | מסעדה, מאפייה, קונדיטוריה, קייטרינג, בתי קפה, בר |
| 6 | **אופנה וטקסטיל** | Fashion & Textile | בגדים, טקסטיל, הלבשה, נעליים, ביגוד, תפירה |
| 7 | **ביטוח ופיננסים** | Insurance & Finance | ביטוח, סוכנות ביטוח, משכנתאות, השקעות, שירותים פיננסיים |
| 8 | **עריכת דין** | Legal | עו"ד, עורכי דין, משרד עורכי דין |
| 9 | **ראיית חשבון** | Accounting | רו"ח, הנהלת חשבונות, רואה חשבון |
| 10 | **בריאות ורפואה** | Health & Medicine | רופא, רפואת שיניים, פיזיוטרפיה, וטרינר, אופטיקה, בדיקות שמיעה |
| 11 | **טיפול ופסיכולוגיה** | Therapy & Psychology | פסיכולוגיה, עבודה סוציאלית, דולה, טיפול, תרפיה, אימון אישי |
| 12 | **חינוך והדרכה** | Education & Training | חינוך, הדרכה, הוראה, לימוד, גננת, פעוטון, הצהרון, שיעורים פרטיים |
| 13 | **עיצוב ויצירה** | Design & Creative | עיצוב גרפי, עיצוב פנים, אנימציה, מיתוג, אומנות, יצירה, שרטוט |
| 14 | **צילום ומדיה** | Photography & Media | צילום, עריכת וידאו, הפקות, פוסט-פרודקשן, תוכן |
| 15 | **מוזיקה ובידור** | Music & Entertainment | מוזיקאי, זמר, DJ, תקליטן, שחקן, סטנד-אפ, הפקות אירועים |
| 16 | **יבוא וסחר** | Import & Trade | יבוא, סחר, סיטונאות, מסחר, הפצה |
| 17 | **קמעונאות** | Retail | חנות, מכולת, מינימרקט, סופר, מכירה קמעונאית |
| 18 | **הובלות ושליחויות** | Transport & Delivery | הובלות, שליחויות, בלדרות, מונית, הסעות |
| 19 | **כושר וספורט** | Fitness & Sports | מאמן כושר, ספורט, כושר ותזונה, טניס, פארקור |
| 20 | **יופי וטיפוח** | Beauty & Cosmetics | קוסמטיקה, מספרה, שיער, ציפורניים, קעקועים |
| 21 | **רכב ומוסכים** | Automotive | מוסך, חלפים לרכבים, רכב |
| 22 | **ניקיון ותחזוקה** | Cleaning & Maintenance | ניקיון, כביסה, מכבסה, אחזקה, תחזוקת מבנים |
| 23 | **תעשייה וייצור** | Industry & Manufacturing | ייצור, עיבוד מתכות, בניית מכונות, מפעל, ייצור שקיות |
| 24 | **חקלאות ובעלי חיים** | Agriculture & Animals | חקלאות, גינון, סוסים, חיות מחמד, אילוף כלבים |
| 25 | **אחר** | Other | לא מתאים לאף קטגוריה |

## Special Statuses (not business sectors — handle separately)

These exist in the current data but are NOT business sectors. They describe client status:
- מנהל חברה (+ variants: + שכירות, + השקעה, + פטור)
- שכיר (+ variants: + שכירות נכס, + מטבעות)
- שכיר חייב בהגשת דוח
- לא פעיל / חברה לא פעילה
- פנסיונר + השכרת נכס
- שנתי
- הכנסות גבוהות
- הכנסות חו"ל

**Recommendation:** These should be a SEPARATE field (e.g., "סטטוס לקוח" or "סוג הכנסה"), not mixed into תחום עיסוק.

## Usage

### Onboarding Form
- Show these 25 categories as a searchable dropdown
- User types → filtered results (Hebrew fuzzy search)
- "אחר" at the bottom with free-text input option
- If client selects "אחר" → free text saved for manual classification later

### Summit CRM Cleanup
- Map all 469 existing values to these 25 categories
- Can be done via script using the mapping below
- Preserves original value in a "תחום עיסוק מקורי" field if needed

## Full Mapping (469 → 25)

See `/Users/shay/summit-mcp/taxonomy_cleanup_map_v2.json` for the complete programmatic mapping.
