import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { getLegalPage } from '@/sanity/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי השימוש של אתר ביטן את ביטן רואי חשבון.',
  alternates: { canonical: '/terms' },
}

export default async function TermsPage() {
  const page = await getLegalPage('terms')

  return (
    <div>
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">
            {page?.title ?? 'תנאי שימוש'}
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
            <FallbackTerms />
          )}
        </div>
      </section>
    </div>
  )
}

function FallbackTerms() {
  return (
    <>
      <h2>כללי</h2>
      <p>
        ברוכים הבאים לאתר של ביטן את ביטן — רואי חשבון (&quot;המשרד&quot;).
        השימוש באתר זה כפוף לתנאים המפורטים להלן. גלישה באתר או שימוש בו מהווים
        הסכמה לתנאים אלה.
      </p>

      <h2>תוכן האתר — הגבלת אחריות</h2>
      <p>
        המידע באתר, לרבות מאמרים, מדריכים ותכנים מקצועיים, מוצג למטרות
        אינפורמטיביות בלבד ואינו מהווה ייעוץ מקצועי, ייעוץ מס, ייעוץ משפטי או
        תחליף להתייעצות אישית עם רואה חשבון או יועץ מס מוסמך.
      </p>
      <p>
        המשרד אינו אחראי לכל נזק, הפסד או הוצאה שייגרמו בשל הסתמכות על המידע
        באתר ללא ייעוץ מקצועי פרטני. המידע באתר עשוי שלא לשקף שינויי חקיקה או
        פסיקה עדכניים.
      </p>

      <h2>קניין רוחני</h2>
      <p>
        כל התכנים באתר — טקסטים, עיצוב, לוגו, תמונות וסימנים מסחריים — הם
        רכושו של המשרד ומוגנים בדיני קניין רוחני. אין להעתיק, לשכפל, להפיץ או
        לעשות שימוש מסחרי בתכנים ללא אישור בכתב מראש.
      </p>

      <h2>טופס יצירת קשר</h2>
      <p>
        שליחת פנייה באמצעות טופס יצירת הקשר אינה יוצרת יחסי לקוח–רואה חשבון.
        המידע שנשלח באמצעות הטופס מטופל בהתאם למדיניות הפרטיות שלנו.
      </p>

      <h2>קישורים לאתרים חיצוניים</h2>
      <p>
        האתר עשוי לכלול קישורים לאתרים חיצוניים. המשרד אינו אחראי לתוכן, לזמינות
        או למדיניות הפרטיות של אתרים אלה.
      </p>

      <h2>זמינות האתר</h2>
      <p>
        המשרד שואף לשמור על זמינות האתר אך אינו מתחייב לפעילות רצופה וללא
        הפרעות. המשרד רשאי לשנות, להשעות או להפסיק את האתר או חלקים ממנו בכל עת.
      </p>

      <h2>שינויים בתנאי השימוש</h2>
      <p>
        המשרד רשאי לעדכן תנאים אלה מעת לעת. הגרסה העדכנית תפורסם תמיד בעמוד זה.
        המשך השימוש באתר לאחר עדכון מהווה הסכמה לתנאים המעודכנים.
      </p>

      <h2>דין חל וסמכות שיפוט</h2>
      <p>
        על תנאי שימוש אלה יחולו דיני מדינת ישראל בלבד. כל סכסוך ידון בבתי המשפט
        המוסמכים בתל אביב-יפו.
      </p>

      <h2>יצירת קשר</h2>
      <p>
        לכל שאלה בנוגע לתנאי השימוש, ניתן לפנות אלינו בדוא&quot;ל{' '}
        <span dir="ltr">office@bitancpa.com</span> או בטלפון{' '}
        <span dir="ltr">03-5174295</span>.
      </p>
    </>
  )
}
