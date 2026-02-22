import type { Metadata } from "next";
import {
  SectionHeader,
  Card,
  CardBody,
  WhatsAppCTA,
  PhoneCTA,
  LTR,
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
  { year: "1992", text: "הקמת המשרד על ידי אבי ביטן, רו\"ח" },
  { year: "2005", text: "הרחבת שירותי המיסוי הבינלאומי" },
  { year: "2015", text: "הצטרפות הדור השני — רון ביטן, רו\"ח" },
  { year: "2020", text: "מעבר למשרדים החדשים במגדל אלקטרה סיטי" },
  { year: "היום", text: "מעל 500 לקוחות מרוצים ושירות מקיף לעסקים בכל גודל" },
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
            משרד רואי חשבון ביטן את ביטן פועל בתל אביב מזה למעלה מ-30 שנה.
            דור שני של מומחיות פיננסית, שירות אישי וליווי מקצועי שלא מתפשר.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid md:grid-cols-2 gap-space-8 items-start">
            <div>
              <SectionHeader>הסיפור שלנו</SectionHeader>
              <div className="mt-space-5 space-y-4 text-text-secondary text-body leading-relaxed">
                <p>
                  המשרד הוקם בשנת 1992 על ידי אבי ביטן, רואה חשבון, מתוך חזון
                  לספק שירות חשבונאי מקצועי ואישי לעסקים ויחידים. לאורך השנים,
                  המשרד צמח והתפתח תוך שמירה על הערכים המייסדים — מקצועיות,
                  אמינות ויחס אישי.
                </p>
                <p>
                  בשנת 2015 הצטרף רון ביטן, רו&quot;ח, לצוות המשרד והביא עימו
                  גישה חדשנית ומענה טכנולוגי מתקדם. השילוב בין ניסיון עשיר
                  ופרספקטיבה חדשה מאפשר לנו לתת ללקוחותינו שירות ייחודי — דור
                  שני של מומחיות.
                </p>
                <p>
                  היום, המשרד ממוקם במגדל אלקטרה סיטי בתל אביב ומשרת למעלה מ-500
                  לקוחות — מעצמאים ועסקים קטנים ועד חברות וסטארטאפים.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-h3 font-bold text-primary mb-space-5">
                ציוני דרך
              </h3>
              <div className="space-y-space-4">
                {TIMELINE.map(({ year, text }) => (
                  <div key={year} className="flex gap-space-4">
                    <div className="shrink-0 w-16 text-gold font-bold text-body-lg" dir="ltr">
                      {year}
                    </div>
                    <div className="border-s-2 border-border-light ps-space-4">
                      <p className="text-text-secondary text-body">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface py-space-9 px-6">
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
      <section className="bg-primary py-space-9 px-6">
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
