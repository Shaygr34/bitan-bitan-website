import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { getLegalPage } from '@/sanity/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של אתר ביטן את ביטן רואי חשבון.',
  alternates: { canonical: '/privacy' },
}

export default async function PrivacyPage() {
  const page = await getLegalPage('privacy')

  return (
    <div>
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">
            {page?.title ?? 'מדיניות פרטיות'}
          </h1>
          <span className="gold-underline mt-4" />
          {page?.lastUpdated && (
            <p className="text-white/60 text-body-sm mt-space-3">
              עודכן לאחרונה: {page.lastUpdated}
            </p>
          )}
        </div>
      </section>

      <section className="py-space-9 px-6">
        <div className="max-w-narrow mx-auto prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-space-8 [&_h2]:mb-space-4 [&_h3]:text-h4 [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-space-6 [&_h3]:mb-space-3 [&_ul]:space-y-2 [&_ul]:ps-5 [&_li]:text-body [&_strong]:text-primary">
          {page?.body ? (
            <PortableText value={page.body} />
          ) : (
            <FallbackPrivacy />
          )}
        </div>
      </section>
    </div>
  )
}

function FallbackPrivacy() {
  return (
    <>
      <h2>כללי</h2>
      <p>
        ביטן את ביטן — רואי חשבון (&quot;המשרד&quot;) מכבד את פרטיות המשתמשים
        באתר. מדיניות פרטיות זו מפרטת כיצד אנו אוספים, משתמשים ומגנים על מידע
        אישי הנאסף באמצעות האתר.
      </p>

      <h2>מידע שאנו אוספים</h2>
      <ul>
        <li>
          <strong>פרטי קשר</strong> — שם, טלפון, דוא&quot;ל והודעה חופשית,
          כפי שנמסרים בטופס יצירת הקשר באתר.
        </li>
        <li>
          <strong>נתוני שימוש</strong> — האתר עשוי לאסוף מידע טכני כגון כתובת
          IP, סוג דפדפן, עמודים שנצפו ומשך השהייה, באמצעות כלי אנליטיקה (כגון
          Google Analytics) — אם וכאשר יופעלו.
        </li>
      </ul>

      <h2>מטרות השימוש במידע</h2>
      <ul>
        <li>חזרה אליכם בעקבות פנייה באתר.</li>
        <li>שיפור חוויית השימוש והתכנים באתר.</li>
        <li>עמידה בדרישות חוקיות ורגולטוריות.</li>
      </ul>

      <h2>אחסון ואבטחת מידע</h2>
      <p>
        המידע מאוחסן בשרתים מאובטחים. אנו נוקטים באמצעים סבירים לשמירה על אבטחת
        המידע, אך לא ניתן להבטיח אבטחה מוחלטת בסביבת אינטרנט.
      </p>

      <h2>שיתוף עם צדדים שלישיים</h2>
      <p>
        לא נמסור מידע אישי לצדדים שלישיים, למעט ספקי שירות הנדרשים להפעלת האתר
        (אחסון, אנליטיקה) או כנדרש על פי דין.
      </p>

      <h2>עוגיות (Cookies) ואנליטיקה</h2>
      <p>
        האתר עשוי להשתמש בעוגיות ובכלי אנליטיקה לצורך מעקב אחר דפוסי שימוש
        ושיפור התכנים. ניתן להגדיר את הדפדפן לסרב לעוגיות, אם כי הדבר עלול
        לפגוע בחוויית הגלישה.
      </p>

      <h2>זכויות המשתמשים</h2>
      <p>
        בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, אתם רשאים לפנות אלינו בבקשה
        לעיין במידע השמור אודותיכם, לתקנו או למחקו. ניתן לפנות בדוא&quot;ל:{' '}
        <span dir="ltr">office@bitancpa.com</span>.
      </p>

      <h2>שינויים במדיניות</h2>
      <p>
        המשרד רשאי לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו בעמוד זה.
        המשך השימוש באתר לאחר עדכון מהווה הסכמה למדיניות המעודכנת.
      </p>

      <h2>יצירת קשר</h2>
      <p>
        לכל שאלה בנושא מדיניות הפרטיות, ניתן לפנות אלינו בדוא&quot;ל{' '}
        <span dir="ltr">office@bitancpa.com</span> או בטלפון{' '}
        <span dir="ltr">03-5174295</span>.
      </p>
    </>
  )
}
