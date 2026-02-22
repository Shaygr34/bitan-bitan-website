import type { Metadata } from "next";
import {
  SectionHeader,
  Card,
  CardBody,
  CardFooter,
  WhatsAppCTA,
} from "@/components/ui";
import { FileText, Building2, Receipt, Shield, Banknote, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "מרכז ידע — ביטן את ביטן רואי חשבון",
  description:
    "מאמרים, מדריכים ומידע מקצועי בנושאי מס, חשבונאות וניהול פיננסי — מרכז הידע של ביטן את ביטן.",
};

const CATEGORIES = [
  "הכל",
  "מס הכנסה",
  "מע\"מ",
  "חברות",
  "ביטוח לאומי",
  "שכר",
] as const;

/* Category → visual config for card banners */
const CATEGORY_VISUALS: Record<string, { gradient: string; icon: typeof FileText }> = {
  "מס הכנסה": { gradient: "from-primary to-primary-light", icon: FileText },
  "חברות":    { gradient: "from-[#1a3a5c] to-[#2d5a87]", icon: Building2 },
  "מע\"מ":    { gradient: "from-[#2c3e50] to-[#3d566e]", icon: Receipt },
  "ביטוח לאומי": { gradient: "from-[#1e3a5f] to-[#2a4a6b]", icon: Shield },
  "שכר":      { gradient: "from-[#2d4a3e] to-[#3d6b56]", icon: Banknote },
};
const DEFAULT_VISUAL = { gradient: "from-primary to-primary-light", icon: BookOpen };

const ARTICLES = [
  {
    category: "מס הכנסה",
    title: "מדריך להגשת דוח שנתי למס הכנסה",
    excerpt:
      "כל מה שצריך לדעת על הגשת הדוח השנתי — לוחות זמנים, מסמכים נדרשים וטיפים לחיסכון במס.",
    date: "15 בינואר 2026",
  },
  {
    category: "חברות",
    title: "הקמת חברה בע\"מ — המדריך המלא",
    excerpt:
      "שלב אחר שלב: רישום חברה, פתיחת תיקים ברשויות, ותכנון מס נכון מהיום הראשון.",
    date: "8 בינואר 2026",
  },
  {
    category: "מע\"מ",
    title: "ניהול מע\"מ לעסקים קטנים ובינוניים",
    excerpt:
      "טיפים פרקטיים לניהול חשבוניות, דיווחים תקופתיים וזכויות לניכוי מע\"מ תשומות.",
    date: "2 בינואר 2026",
  },
  {
    category: "ביטוח לאומי",
    title: "מדריך לעצמאים: תשלומי ביטוח לאומי",
    excerpt:
      "כל מה שעצמאים צריכים לדעת על חובת התשלום, שיעורי ההפרשות ודרכים לחסוך.",
    date: "25 בדצמבר 2025",
  },
  {
    category: "מס הכנסה",
    title: "זיכויים ופטורים ממס — האם אתם מנצלים את מה שמגיע לכם?",
    excerpt:
      "סקירת הזיכויים והפטורים הנפוצים שרבים לא מודעים אליהם — ואיך לממש אותם.",
    date: "18 בדצמבר 2025",
  },
  {
    category: "שכר",
    title: "חישוב פיצויי פיטורין — מדריך למעסיקים ולעובדים",
    excerpt:
      "איך מחשבים פיצויים? מתי חייבים לשלם? ומה קורה כשיש קרן פנסיה? המדריך המלא.",
    date: "10 בדצמבר 2025",
  },
] as const;

export default function KnowledgePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">מרכז ידע</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            מאמרים, מדריכים ומידע מקצועי שיעזרו לכם לקבל החלטות פיננסיות
            נכונות.
          </p>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b border-border bg-white sticky top-[56px] md:top-[72px] z-30 px-6">
        <div className="max-w-content mx-auto py-space-3 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat}
              className={[
                "shrink-0 px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors cursor-pointer",
                i === 0
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-callout",
              ].join(" ")}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5">
            {ARTICLES.map(({ category, title, excerpt, date }) => {
              const visual = CATEGORY_VISUALS[category] ?? DEFAULT_VISUAL;
              const Icon = visual.icon;
              return (
                <Card key={title} className="!p-0 overflow-hidden">
                  {/* Visual banner */}
                  <div className={`relative h-36 bg-gradient-to-bl ${visual.gradient} flex items-center justify-center overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/5" />
                    <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5" />
                    {/* Icon */}
                    <Icon className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                    {/* Category pill */}
                    <span className="absolute top-3 start-3 px-3 py-1 text-caption font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                      {category}
                    </span>
                  </div>

                  <CardBody className="px-space-5 pt-space-4">
                    <h2 className="text-h4 font-semibold text-primary">
                      {title}
                    </h2>
                    <p className="text-text-secondary text-body mt-2">
                      {excerpt}
                    </p>
                  </CardBody>
                  <CardFooter className="flex items-center justify-between mx-space-5 mb-space-4">
                    <span className="text-text-muted text-caption">{date}</span>
                    <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors cursor-pointer">
                      קראו עוד
                    </span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <SectionHeader
            centered
            subtitle="יש לכם שאלה שלא מצאתם לה תשובה? אנחנו כאן בשבילכם."
          >
            צריכים ייעוץ אישי?
          </SectionHeader>
          <div className="mt-space-7">
            <WhatsAppCTA
              label="שלחו לנו שאלה בוואטסאפ"
              size="lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
