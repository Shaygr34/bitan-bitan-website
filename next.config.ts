import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  async redirects() {
    return [
      // ── Existing service page redirects (Hebrew → English) ──────────
      { source: '/services/החזר-מס-שבח', destination: '/services/real-estate-tax', permanent: true },
      { source: '/services/ניהול-דיונים-מול-רשויות-המס', destination: '/services/tax-representation', permanent: true },
      { source: '/services/החזרי-מס', destination: '/services/tax-refunds', permanent: true },
      { source: '/services/מענקים', destination: '/services/grants', permanent: true },

      // ── Structural pages ────────────────────────────────────────────
      { source: '/אודות', destination: '/about', permanent: true },
      { source: '/צור-קשר', destination: '/contact', permanent: true },

      // ── P1 articles: old WP Hebrew URL → new /knowledge/[slug] ─────
      { source: '/בעלי-הכנס-מעבודה-בחול', destination: '/knowledge/income-from-work-abroad', permanent: true },
      { source: '/דירת-מגורים-מזכה', destination: '/knowledge/qualifying-residential-apartment', permanent: true },
      { source: '/הוצאות-נלוות', destination: '/knowledge/ancillary-expenses', permanent: true },
      { source: '/הוצאות-נסיעות-לחול-מוכרות-למס-הכנסה', destination: '/knowledge/deductible-travel-expenses-abroad', permanent: true },
      { source: '/היערכות-חברות-לתום-שנת-מס-2016', destination: '/knowledge/year-end-prep-companies-2016', permanent: true },
      { source: '/הערכות-חברה-לתום-שנת-2018', destination: '/knowledge/year-end-prep-companies-2019', permanent: true },
      { source: '/הקשר-בין-סעיף-174-לפקודת-מס-הכנסה-להודעת-ז', destination: '/knowledge/section-17-4-credit-note-connection', permanent: true },
      { source: '/זכאות-לשיעור-מס-מופחת-אזרחים-מעל-גיל-60', destination: '/knowledge/reduced-tax-rate-over-60', permanent: true },
      { source: '/חוזר-מקצועי-שינויים-בשכר-החל-מיום-1-בי', destination: '/knowledge/salary-changes-january-2017', permanent: true },
      { source: '/חישוב-גידול-קיטון-בהון-מקורות-ושימוש', destination: '/knowledge/wealth-increase-decrease-sources-uses', permanent: true },
      { source: '/כללים-להוצאת-הודעת-זיכוי-חשבונית-זיכו', destination: '/knowledge/credit-note-rules', permanent: true },
      { source: '/מענק-עבודה', destination: '/knowledge/work-grant-negative-income-tax', permanent: true },
      { source: '/סוגי-תשלומים-שהעברתם-לתושב-חוץ-פטורה-מ', destination: '/knowledge/payments-to-foreign-residents-withholding-exempt', permanent: true },
      { source: '/פטור-חד-פעמי-ממס-שבח-על-2-דירות', destination: '/knowledge/one-time-betterment-tax-exemption-two-apartments', permanent: true },
      { source: '/פטור-ממס-שבח', destination: '/knowledge/betterment-tax-exemption', permanent: true },
      { source: '/פטור-ממשיכת-כספי-תגמולים-החייבים-ב-35-מס', destination: '/knowledge/severance-fund-withdrawal-35-percent-exemption', permanent: true },
      { source: '/פריסת-מס-שבח', destination: '/knowledge/betterment-tax-spreading', permanent: true },
      { source: '/ריכוז-טבלת-שיעורי-המס-החלים-על-הכנסות-ו', destination: '/knowledge/tax-rate-table-summary', permanent: true },
      { source: '/שאלות-ותשובות-בנושא-דברים-שחובה-בחשבו', destination: '/knowledge/invoice-requirements-faq', permanent: true },
      { source: '/תיקון-190', destination: '/knowledge/amendment-190', permanent: true },
      { source: '/תשלום-מס-שבח', destination: '/knowledge/betterment-tax-payment', permanent: true },

      // ── P2 bumped articles (published) ──────────────────────────────
      { source: '/הקפאת-עדכוני-מס-ומס-יסף', destination: '/knowledge/tax-bracket-freeze-surcharge-2025', permanent: true },
      { source: '/חברת-מעטים', destination: '/knowledge/closely-held-company', permanent: true },
      { source: '/עדכון-חקיקה-מעמ-18', destination: '/knowledge/vat-18-percent-update-2025', permanent: true },
      { source: '/רווחים-כלואים', destination: '/knowledge/trapped-profits', permanent: true },

      // ── P1 articles not republished → knowledge hub ─────────────────
      { source: '/בלוק-בדף-הבית', destination: '/knowledge', permanent: true },
      { source: '/איחוד-עוסקים-דוחות-ודיווחים-לרשויות', destination: '/knowledge', permanent: true },

      // ── P2 articles not republished → knowledge hub ─────────────────
      { source: '/היערכות-עוסקים-פטורים-לתום-שנת-המס-2016', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-בגין-ילדים-קטנים', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-בגין-סיום-תואר-אקדמי', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-בעד-ילדים-נטולי-יכולת', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-הורה-גרוש-מזונות-2', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-הנצחת-בן-משפחה-חיל-שוטר-פעולות-אי', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-ליחיד-במשפחה-חד-הורית', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-לתושבים-ביישובים-מזכים', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-ממס-הכנסה-לעולה-חדש', destination: '/knowledge', permanent: true },
      { source: '/זיכוי-מס-בגין-תרומה', destination: '/knowledge', permanent: true },
      { source: '/מדרגות-מס-2006-2017', destination: '/knowledge', permanent: true },
      { source: '/מספר-עובדות-מדרגות-מס', destination: '/knowledge', permanent: true },
      { source: '/סעיף-45א-נקודות-זיכוי-בגין-ילד-נטול-יכול', destination: '/knowledge', permanent: true },
      { source: '/ריבית-סעיף-3ט-לפקודה', destination: '/knowledge', permanent: true },

      // ── P3 articles → knowledge hub ─────────────────────────────────
      { source: '/אאא', destination: '/knowledge', permanent: true },
      { source: '/אופן-העברת-מידע-למנהל-מס-ערך-מוסף-האיזו', destination: '/knowledge', permanent: true },
      { source: '/אופן-חישוב-שכירות-הכנסה-מדירת-מגורים', destination: '/knowledge', permanent: true },
      { source: '/בדיקת-זכאות-לסטודנטים', destination: '/knowledge', permanent: true },
      { source: '/במסגרת-חוק-צמצום-שימוש-מזומן-דין-עסקאו', destination: '/knowledge', permanent: true },
      { source: '/גיוס-מנהלת-חשבונות', destination: '/knowledge', permanent: true },
      { source: '/דרישת-הצהרת-הון-מתושב-חוץ', destination: '/knowledge', permanent: true },
      { source: '/companytax', destination: '/knowledge', permanent: true },
      { source: '/compensation', destination: '/knowledge', permanent: true },
      { source: '/האם-פיצוי-בגין-הפרת-הסכם-מחוייב-במעמ', destination: '/knowledge', permanent: true },
      { source: '/הגבלות-מקרקעין-2019', destination: '/knowledge', permanent: true },
      { source: '/הודעה-על-דחיית-מועד-הגשת-דיווח-בגין-עמ', destination: '/knowledge', permanent: true },
      { source: '/היבטים-פליליים-בהגשת-הצהרת-הון', destination: '/knowledge', permanent: true },
      { source: '/הסבר-על-מסלול-מקוצר-להוצאה-לפועל-בהתאם', destination: '/knowledge', permanent: true },
      { source: '/הערכות-הגשה-דוחות-שנת-2017', destination: '/knowledge', permanent: true },
      { source: '/הערכות-הגשת-דוחות', destination: '/knowledge', permanent: true },
      { source: '/הפחתת-מס-חברות', destination: '/knowledge', permanent: true },
      { source: '/הפרשה-חשבונאית-באילו-מצבים-ניתן-להכיר', destination: '/knowledge', permanent: true },
      { source: '/תיקון-חוק-הטבות-וייעוץ-מס', destination: '/knowledge', permanent: true },
      { source: '/חוק-חופשה-תוספת-לחוק-יום-בחירה-עובד', destination: '/knowledge', permanent: true },
      { source: '/טיפים-למלצרים-יחוייבו-במעמ', destination: '/knowledge', permanent: true },
      { source: '/check-your-rights', destination: '/knowledge', permanent: true },
      { source: '/כמה-נקודות-שחשוב-להכיר-לגבי-העסקת-נערי', destination: '/knowledge', permanent: true },
      { source: '/מבחנים-להכרה-בחוב-אבוד', destination: '/knowledge', permanent: true },
      { source: '/מחזיקים-בחוב-אבוד-עקב-אי-תשלום-רעיון-נו', destination: '/knowledge', permanent: true },
      { source: '/מעמ-בגין-שכט-לשירותי-ייעוץ-לחברה-בחול', destination: '/knowledge', permanent: true },
      { source: '/מעמ-על-רכב-להסעת-נוסעים', destination: '/knowledge', permanent: true },
      { source: '/הפרשה-חשבונאית', destination: '/knowledge', permanent: true },
      { source: '/מקרים-בהם-יש-לדווח-למעמ-דיווח-מפורט', destination: '/knowledge', permanent: true },
      { source: '/ניהול-תזרים-מזומנים', destination: '/knowledge', permanent: true },
      { source: '/נכסים-והתחייבויות-בהצהרת-הון', destination: '/knowledge', permanent: true },
      { source: '/birthandtax', destination: '/knowledge', permanent: true },
      { source: '/רווחים-כלואים-וחברת-מעטים', destination: '/knowledge', permanent: true },
      { source: '/עקרון-התא-המשפחתי', destination: '/knowledge', permanent: true },
      { source: '/פחת-על-אתר-אינטרנט', destination: '/knowledge', permanent: true },
      { source: '/פינת-ההשראה-אין-גיל-צעיר-מדי-להגשים-חלו', destination: '/knowledge', permanent: true },
      { source: '/פריסת-מס-פיצויים-חייבים-במס', destination: '/knowledge', permanent: true },
      { source: '/קיבוע-זכויות-פנסיה', destination: '/knowledge', permanent: true },
      { source: '/קיזוז-הפסדים-מס-שבח-2', destination: '/knowledge', permanent: true },
      { source: '/קצבת-נכות-פטורה-ממס', destination: '/knowledge', permanent: true },
      { source: '/car-tex', destination: '/knowledge', permanent: true },
      { source: '/רעידת-אדמה-בעולם-התיירות-2', destination: '/knowledge', permanent: true },
      { source: '/שימוש-מס-ופטור-לחברה-זרה-שמחזיקה-בחברה', destination: '/knowledge', permanent: true },
      { source: '/שיעור-מס-על-דיבידנד-עפי-סעיף-125ב-לפקודת-מ', destination: '/knowledge', permanent: true },
      { source: '/cash-low', destination: '/knowledge', permanent: true },
      { source: '/תיאום-מס-לא-מסובך-כמו-שזה-נשמע-2', destination: '/knowledge', permanent: true },
      { source: '/תשלום-אגרה-מופחתת-לרשם-החברות-עד-תאריך-2', destination: '/knowledge', permanent: true },
      { source: '/תשלום-מס-במקרה-של-דירת-ירושה-אותה-מחזיק', destination: '/knowledge', permanent: true },

      // ── Skip articles → knowledge hub ───────────────────────────────
      { source: '/change-address', destination: '/knowledge', permanent: true },
      { source: '/בקשה-לדחיית-נקודת-זיכוי-שנדחתה-בגין-יל', destination: '/knowledge', permanent: true },
      { source: '/change-your-company-name', destination: '/knowledge', permanent: true },
      { source: '/חישוב-הכנסה-משכירות-תושב-חוץ', destination: '/knowledge', permanent: true },
      { source: '/תושב-ישראל-בעל-חברה-ישראלית-מחזיק-בחבר', destination: '/knowledge', permanent: true },

      // ── Catch-all patterns for old WP URL structures ────────────────
      { source: '/category/:path*', destination: '/knowledge', permanent: true },
      { source: '/tag/:path*', destination: '/knowledge', permanent: true },
      { source: '/page/:path*', destination: '/', permanent: true },
      { source: '/wp-content/uploads/:path*', destination: '/', permanent: true },
    ]
  },
};

export default nextConfig;
