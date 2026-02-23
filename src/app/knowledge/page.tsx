import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  SectionHeader,
  Card,
  CardBody,
  CardFooter,
  WhatsAppCTA,
} from "@/components/ui";
import { FileText, Building2, Receipt, Shield, Banknote, BookOpen } from "lucide-react";
import { getArticles, getCategories } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { ArticleCard } from "@/sanity/types";
import { KnowledgeFilterable } from "./CategoryFilter";

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

/* Category → visual config for card banners */
const CATEGORY_VISUALS: Record<string, { gradient: string; icon: typeof FileText }> = {
  "מס הכנסה": { gradient: "from-primary to-primary-light", icon: FileText },
  "חברות":    { gradient: "from-[#1a3a5c] to-[#2d5a87]", icon: Building2 },
  "מע\"מ":    { gradient: "from-[#2c3e50] to-[#3d566e]", icon: Receipt },
  "ביטוח לאומי": { gradient: "from-[#1e3a5f] to-[#2a4a6b]", icon: Shield },
  "שכר":      { gradient: "from-[#2d4a3e] to-[#3d6b56]", icon: Banknote },
};
const DEFAULT_VISUAL = { gradient: "from-primary to-primary-light", icon: BookOpen };

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function ArticleCardComponent({ article }: { article: ArticleCard }) {
  const catTitle = article.category?.title ?? 'כללי';
  const visual = CATEGORY_VISUALS[catTitle] ?? DEFAULT_VISUAL;
  const Icon = visual.icon;
  const imageUrl = urlFor(article.mainImage, 600);

  return (
    <Link href={`/knowledge/${article.slug?.current ?? ''}`}>
      <Card className="!p-0 overflow-hidden">
        {/* Visual banner */}
        <div className={`relative h-36 bg-gradient-to-bl ${visual.gradient} flex items-center justify-center overflow-hidden`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.mainImage?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5" />
              <Icon className="h-12 w-12 text-white/30" strokeWidth={1.5} />
            </>
          )}
          <span className="absolute top-3 start-3 px-3 py-1 text-caption font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
            {catTitle}
          </span>
        </div>
        <CardBody className="px-space-5 pt-space-4">
          <h2 className="text-h4 font-semibold text-primary">{article.title}</h2>
          {article.excerpt && (
            <p className="text-text-secondary text-body mt-2">{article.excerpt}</p>
          )}
        </CardBody>
        <CardFooter className="flex items-center justify-between mx-space-5 mb-space-4">
          <span className="text-text-muted text-caption">{formatDate(article.publishedAt)}</span>
          <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors">
            קראו עוד
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

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

  const hasCategories = categories && categories.length > 0;

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

      {/* Category filter + Articles grid (client-side filtering) */}
      <KnowledgeFilterable
        categories={hasCategories ? categories : []}
        articles={articles ?? []}
        renderArticle={(article) => (
          <ArticleCardComponent key={article._id} article={article} />
        )}
        renderFallback={() => (
          <>
            {FALLBACK_ARTICLES.map(({ category, title, excerpt, date }) => {
              const visual = CATEGORY_VISUALS[category] ?? DEFAULT_VISUAL;
              const Icon = visual.icon;
              return (
                <Card key={title} className="!p-0 overflow-hidden">
                  <div className={`relative h-36 bg-gradient-to-bl ${visual.gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/5" />
                    <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5" />
                    <Icon className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                    <span className="absolute top-3 start-3 px-3 py-1 text-caption font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                      {category}
                    </span>
                  </div>
                  <CardBody className="px-space-5 pt-space-4">
                    <h2 className="text-h4 font-semibold text-primary">{title}</h2>
                    <p className="text-text-secondary text-body mt-2">{excerpt}</p>
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
          </>
        )}
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
