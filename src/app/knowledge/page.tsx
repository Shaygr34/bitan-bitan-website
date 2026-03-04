import type { Metadata } from "next";
import {
  SectionHeader,
  WhatsAppCTA,
} from "@/components/ui";
import { getArticles, getCategories } from "@/sanity/queries";
import { KnowledgeFilterable } from "./CategoryFilter";
import { warnFallback } from "@/lib/fallback-warning";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 300 // ISR — revalidate every 5 min

export const metadata: Metadata = {
  title: 'מרכז ידע',
  description:
    'מאמרים, מדריכים ומידע מקצועי בנושאי מס, חשבונאות וניהול פיננסי — מרכז הידע של ביטן את ביטן.',
  alternates: { canonical: '/knowledge' },
  openGraph: {
    title: 'מרכז ידע — ביטן את ביטן רואי חשבון',
    description:
      'מאמרים, מדריכים ומידע מקצועי בנושאי מס, חשבונאות וניהול פיננסי.',
  },
};

/* Fallback articles when Sanity has no data */
const FALLBACK_ARTICLES = [
  { category: "מס הכנסה", title: "מדריך להגשת דוח שנתי למס הכנסה", excerpt: "כל מה שצריך לדעת על הגשת הדוח השנתי — לוחות זמנים, מסמכים נדרשים וטיפים לחיסכון במס.", date: "15 בינואר 2026" },
  { category: "חברות", title: "הקמת חברה בע\"מ — המדריך המלא", excerpt: "שלב אחר שלב: רישום חברה, פתיחת תיקים ברשויות, ותכנון מס נכון מהיום הראשון.", date: "8 בינואר 2026" },
  { category: "מע\"מ", title: "ניהול מע\"מ לעסקים קטנים ובינוניים", excerpt: "טיפים פרקטיים לניהול חשבוניות, דיווחים תקופתיים וזכויות לניכוי מע\"מ תשומות.", date: "2 בינואר 2026" },
  { category: "ביטוח לאומי", title: "מדריך לעצמאים: תשלומי ביטוח לאומי", excerpt: "כל מה שעצמאים צריכים לדעת על חובת התשלום, שיעורי ההפרשות ודרכים לחסוך.", date: "25 בדצמבר 2025" },
  { category: "מס הכנסה", title: "זיכויים ופטורים ממס — האם אתם מנצלים את מה שמגיע לכם?", excerpt: "סקירת הזיכויים והפטורים הנפוצים שרבים לא מודעים אליהם — ואיך לממש אותם.", date: "18 בדצמבר 2025" },
  { category: "שכר", title: "חישוב פיצויי פיטורין — מדריך למעסיקים ולעובדים", excerpt: "איך מחשבים פיצויים? מתי חייבים לשלם? ומה קורה כשיש קרן פנסיה? המדריך המלא.", date: "10 בדצמבר 2025" },
] as const;

export default async function KnowledgePage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories(),
  ]);

  if (!articles || articles.length === 0) warnFallback('KnowledgePage');
  const hasCategories = categories && categories.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'מרכז ידע' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">מרכז ידע</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            מאמרים, מדריכים ומידע מקצועי שיעזרו לכם לקבל החלטות פיננסיות
            נכונות.
          </p>
        </div>
      </section>

      {/* Category filter + Articles grid (client-side filtering) */}
      <KnowledgeFilterable
        categories={hasCategories ? categories : []}
        articles={articles ?? []}
        fallbackArticles={FALLBACK_ARTICLES as unknown as { category: string; title: string; excerpt: string; date: string }[]}
      />

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
