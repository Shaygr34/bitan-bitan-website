import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description:
    'הצהרת הנגישות של אתר משרד רואי חשבון ביטן את ביטן — מחויבות לנגישות דיגיטלית בהתאם לתקן SI 5568.',
  alternates: { canonical: '/accessibility' },
}

export default function AccessibilityPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'הצהרת נגישות' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">הצהרת נגישות</h1>
          <span className="gold-underline mt-4" />
        </div>
      </section>

      {/* Content */}
      <section className="py-space-9 px-6">
        <div className="max-w-narrow mx-auto prose-bitan">
          <h2>כללי</h2>
          <p>
            משרד רואי חשבון ביטן את ביטן מחויב להנגשת האתר לאנשים עם מוגבלות,
            בהתאם לתקן הישראלי SI 5568 ולהנחיות WCAG 2.0 ברמת AA.
          </p>
          <p>
            אנו פועלים לשפר באופן מתמיד את נגישות האתר ולהבטיח חוויית גלישה
            שוויונית לכלל המשתמשים.
          </p>

          <h2>סטטוס נגישות</h2>
          <p>
            האתר עומד בדרישות תקן SI 5568 ברמת AA. ההנגשה כוללת בין היתר:
          </p>
          <ul>
            <li>מבנה כותרות היררכי ותקני</li>
            <li>תיאורי תמונות (alt text) לכלל התמונות</li>
            <li>ניווט מלא באמצעות מקלדת</li>
            <li>ניגודיות צבעים בהתאם לדרישות התקן</li>
            <li>טפסים נגישים עם תוויות ושגיאות מזוהות</li>
            <li>תמיכה בקוראי מסך</li>
            <li>התאמה למכשירים ניידים</li>
          </ul>

          <h2>מגבלות ידועות</h2>
          <p>
            ייתכנו תכנים שטרם הונגשו במלואם, לרבות מסמכי PDF חיצוניים
            ותכנים המוטמעים משירותי צד שלישי. אנו עובדים על שיפור מתמיד.
          </p>

          <h2>פרטי רכז נגישות</h2>
          <p>לפניות בנושא נגישות האתר:</p>
          <ul>
            <li>
              <strong>גוף:</strong> משרד רואי חשבון ביטן את ביטן
            </li>
            <li>
              <strong>טלפון:</strong>{' '}
              <a href="tel:+97235174295" dir="ltr">
                03-5174295
              </a>
            </li>
            <li>
              <strong>דוא״ל:</strong>{' '}
              <a href="mailto:office@bitancpa.com">office@bitancpa.com</a>
            </li>
            <li>
              <strong>כתובת:</strong> הרכבת 58, מגדל אלקטרה סיטי, קומה 11,
              תל אביב
            </li>
          </ul>

          <h2>הגשת תלונה</h2>
          <p>
            אם נתקלתם בבעיית נגישות באתר, נשמח לשמוע ולטפל בהקדם. ניתן
            לפנות אלינו בטלפון או בדוא״ל. פניות נגישות יטופלו תוך 14 ימי
            עסקים.
          </p>
          <p>
            כמו כן, ניתן לפנות לנציבות שוויון זכויות לאנשים עם מוגבלות:{' '}
            <a
              href="https://www.gov.il/he/departments/topics/accessibility"
              target="_blank"
              rel="noopener noreferrer"
            >
              אתר הנציבות
            </a>
          </p>

          <h2>תאריך עדכון אחרון</h2>
          <p>הצהרת נגישות זו עודכנה לאחרונה באפריל 2026.</p>
        </div>
      </section>
    </div>
  )
}
