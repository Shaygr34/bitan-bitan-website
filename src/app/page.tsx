/**
 * Homepage — M1 scaffold.
 * Displays a verification section confirming RTL, Heebo font,
 * and design tokens are working correctly.
 * Full homepage scroll journey (9 sections) will be implemented in M5.
 */
export default function Home() {
  return (
    <div>
      {/* Hero placeholder — navy background per brand */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">
            המומחים הפיננסיים של העסק שלכם
          </h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            משרד רואי חשבון ביטן את ביטן — דור שני של מומחיות פיננסית, ייעוץ מס
            וליווי עסקי מקצועי.
          </p>

          {/* CTA buttons placeholder */}
          <div className="flex flex-wrap gap-4 mt-space-7">
            <a
              href="https://wa.me/972527221111"
              className="inline-flex items-center px-8 py-3 bg-gold text-primary font-medium text-nav rounded-md hover:bg-gold-hover transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              שלחו הודעה בוואטסאפ
            </a>
            <a
              href="tel:03-5174295"
              className="inline-flex items-center px-8 py-3 border-[1.5px] border-white text-white font-medium text-nav rounded-md hover:bg-white/10 transition-colors"
            >
              חייגו אלינו
            </a>
          </div>

          {/* Trust micro-signals */}
          <p className="text-white/60 text-body-sm mt-space-5">
            <span dir="ltr">30+</span> שנות ניסיון · דור שני של רואי חשבון · תל
            אביב
          </p>
        </div>
      </section>

      {/* M1 verification section */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="text-primary text-h2 font-bold">M1 — אימות הגדרות</h2>
          <span className="gold-underline" />

          <div className="grid md:grid-cols-3 gap-space-5 mt-space-7">
            {/* RTL check */}
            <div className="bg-white rounded-lg p-space-5 shadow-sm border border-border">
              <h3 className="text-primary text-h4 font-semibold">כיוון RTL</h3>
              <p className="text-text-secondary text-body mt-2">
                הטקסט הזה צריך להיות מיושר לימין. אם הוא מיושר לימין — הגדרת RTL
                עובדת כראוי.
              </p>
            </div>

            {/* Font check */}
            <div className="bg-white rounded-lg p-space-5 shadow-sm border border-border">
              <h3 className="text-primary text-h4 font-semibold">פונט Heebo</h3>
              <p className="text-text-secondary text-body mt-2">
                הטקסט הזה מוצג בפונט Heebo. הפונט נטען עם{" "}
                <code className="bg-surface px-1 rounded text-body-sm" dir="ltr">
                  font-display: swap
                </code>
                .
              </p>
            </div>

            {/* Tokens check */}
            <div className="bg-white rounded-lg p-space-5 shadow-sm border border-border">
              <h3 className="text-primary text-h4 font-semibold">
                טוקנים עיצוביים
              </h3>
              <p className="text-text-secondary text-body mt-2">
                צבע ראשי (Navy), זהב (Gold), רדיוסים, צלליות — הכל מוגדר דרך
                CSS custom properties ו-Tailwind.
              </p>
            </div>
          </div>

          {/* LTR content verification */}
          <div className="mt-space-7 bg-white rounded-lg p-space-5 shadow-sm border border-border">
            <h3 className="text-primary text-h4 font-semibold">
              תוכן מעורב (עברית + LTR)
            </h3>
            <p className="text-text-secondary text-body mt-2">
              טלפון: <span dir="ltr">03-5174295</span> · פקס:{" "}
              <span dir="ltr">03-5174298</span> · דוא״ל:{" "}
              <span dir="ltr">office@bitancpa.com</span>
            </p>
            <p className="text-text-secondary text-body mt-1">
              WhatsApp: <span dir="ltr">+972-52-722-1111</span>
            </p>
          </div>
        </div>
      </section>

      {/* Sections placeholder — full scroll journey in M5 */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <p className="text-text-muted text-body">
            שאר מקטעי דף הבית (שירותים, תהליך עבודה, אודות, מרכז ידע, שאלות
            נפוצות, CTA) ייבנו ב-M5.
          </p>
        </div>
      </section>
    </div>
  );
}
