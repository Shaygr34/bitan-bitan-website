import type { Metadata } from "next";
import {
  SectionHeader,
  Card,
  CardBody,
  WhatsAppCTA,
  PhoneCTA,
} from "@/components/ui";
import { Users, Award, Handshake, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "אודות — ביטן את ביטן רואי חשבון",
  description:
    "הכירו את משרד רואי חשבון ביטן את ביטן — דור שני של מומחיות פיננסית בתל אביב. למעלה מ-30 שנות ניסיון בייעוץ מס וליווי עסקי.",
};

const VALUES = [
  {
    icon: Award,
    title: "מקצועיות",
    description:
      "צוות המשרד כולל רואי חשבון בעלי הסמכה מלאה, עם ידע מעמיק ועדכני בדיני מס וחשבונאות.",
  },
  {
    icon: Handshake,
    title: "אמינות",
    description:
      "שקיפות מלאה, עמידה בלוחות זמנים ומחויבות לטובת הלקוח — בכל פרויקט ובכל שלב.",
  },
  {
    icon: Users,
    title: "יחס אישי",
    description:
      "כל לקוח מקבל ליווי צמוד וזמינות גבוהה. אנחנו מכירים כל לקוח בשם ומבינים את הצרכים שלו.",
  },
  {
    icon: Building,
    title: "יציבות",
    description:
      "משרד עם ותק של למעלה מ-30 שנה — יציבות שמעניקה שקט נפשי ללקוחותינו.",
  },
] as const;

const TIMELINE = [
  {
    year: "1990",
    title: "ההתחלה",
    text: "שלמה ביטן, רו\"ח, מייסד את המשרד ומניח את היסודות — שירות אישי, מקצועיות ואמינות.",
  },
  {
    year: "2000",
    title: "צמיחה והתרחבות",
    text: "המשרד מרחיב את מעגל הלקוחות ואת מגוון שירותי המיסוי, כולל ייעוץ בינלאומי.",
  },
  {
    year: "2015",
    title: "הדור השני",
    text: "אבי ורון ביטן, בניו של שלמה, מקימים את ביטן את ביטן — דור שני שממשיך את המסורת עם גישה חדשנית.",
  },
  {
    year: "2020",
    title: "בית חדש",
    text: "המשרד עובר למגדל אלקטרה סיטי בתל אביב — סביבת עבודה מודרנית ונגישה.",
  },
  {
    year: "היום",
    title: "מעל 500 לקוחות",
    text: "מעצמאים ועסקים קטנים ועד חברות וסטארטאפים — שירות מקיף ומותאם אישית.",
  },
] as const;

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">אודות המשרד</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            דור שני של מומחיות פיננסית. המשרד הוקם על ידי שלמה ביטן,
            רו&quot;ח, וממשיך להוביל בידי בניו — אבי ורון — עם אותם ערכים
            ושירות שלא מתפשר.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader subtitle="מסורת משפחתית של מצוינות מקצועית.">
            הסיפור שלנו
          </SectionHeader>

          <div className="mt-space-8 max-w-narrow space-y-6 text-text-secondary text-body leading-relaxed">
            <p className="text-body-lg">
              את הבסיס הניח <strong className="text-primary">שלמה ביטן, רו&quot;ח</strong> —
              שהקים את המשרד המקורי בשנות ה-90 מתוך אמונה פשוטה: שירות חשבונאי
              צריך להיות מקצועי, אמין ואישי. שלמה בנה מוניטין של יושרה ומומחיות
              שליווה מאות לקוחות לאורך עשרות שנים.
            </p>
            <p>
              בשנת 2015 הקימו בניו, <strong className="text-primary">אבי ורון ביטן</strong>,
              את משרד <strong className="text-primary">ביטן את ביטן — רואי חשבון</strong>.
              הם הביאו עימם את הערכים שספגו מאביהם, יחד עם גישה חדשנית ומענה
              טכנולוגי מתקדם. השילוב בין מסורת של מצוינות לפרספקטיבה עכשווית
              מאפשר למשרד לתת ללקוחותיו שירות ייחודי.
            </p>
            <p>
              היום, המשרד ממוקם במגדל אלקטרה סיטי בתל אביב ומשרת למעלה מ-500
              לקוחות — מעצמאים ועסקים קטנים ועד חברות וסטארטאפים. אנחנו מאמינים
              שכל לקוח ראוי ליחס אישי ולליווי צמוד, ללא תלות בגודל העסק.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline — full-width, breathing room */}
      <section className="bg-surface py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered>
            ציוני דרך
          </SectionHeader>

          <div className="mt-space-9 max-w-narrow mx-auto relative">
            {/* Vertical line */}
            <div className="absolute start-[39px] top-0 bottom-0 w-px bg-border-light hidden md:block" />

            <div className="space-y-space-8">
              {TIMELINE.map(({ year, title, text }, i) => (
                <div key={year} className="flex gap-space-5 md:gap-space-6 items-start">
                  {/* Year badge */}
                  <div className="shrink-0 relative">
                    <div className="w-20 h-20 rounded-xl bg-primary flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-gold font-bold text-body-lg leading-none" dir="ltr">
                        {year}
                      </span>
                    </div>
                    {/* Connector dot on the vertical line */}
                    {i < TIMELINE.length - 1 && (
                      <div className="hidden md:block absolute start-[39px] -bottom-[calc(var(--space-8)/2)] w-px" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <h3 className="text-h4 font-bold text-primary">
                      {title}
                    </h3>
                    <p className="text-text-secondary text-body mt-2 leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered subtitle="הערכים שמנחים אותנו בכל יום עבודה.">
            הערכים שלנו
          </SectionHeader>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardBody>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-space-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-h4 font-semibold text-primary">
                    {title}
                  </h3>
                  <p className="text-text-secondary text-body mt-2">
                    {description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-space-10 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-white text-h2 font-bold">רוצים להכיר אותנו?</h2>
          <span className="gold-underline mt-3 mx-auto" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
            נשמח לשבת איתכם לפגישת היכרות ללא עלות ולהבין איך נוכל לעזור.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-space-7">
            <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
            <PhoneCTA
              label="חייגו אלינו"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
