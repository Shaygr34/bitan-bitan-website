import type { Metadata } from "next";
import {
  SectionHeader,
  WhatsAppCTA,
} from "@/components/ui";
import {
  getArticles,
  getCategories,
  getFilteredArticles,
  getArticleCount,
} from "@/sanity/queries";
import {
  ArticleCardComponent,
  FallbackCard,
  CategoryPills,
} from "./CategoryFilter";
import { Pagination } from "./Pagination";
import { KnowledgeSearch } from "@/components/KnowledgeSearch";
import { warnFallback } from "@/lib/fallback-warning";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 300 // ISR — revalidate every 5 min

const PAGE_SIZE = 12

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

interface KnowledgePageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const params = await searchParams
  const activeCategory = params.category ?? ''
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const [categories, articles, totalCount, allArticles] = await Promise.all([
    getCategories(),
    getFilteredArticles(activeCategory, start, end),
    getArticleCount(activeCategory),
    getArticles(),
  ])

  if (!allArticles || allArticles.length === 0) warnFallback('KnowledgePage');
  const hasArticles = articles && articles.length > 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Lightweight search data — only what search needs
  const searchArticles = (allArticles ?? []).map((a) => ({
    title: a.title,
    slug: a.slug?.current ?? '',
    excerpt: a.excerpt ?? '',
    categoryTitle: a.category?.title ?? '',
  }))

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

      {/* Search bar */}
      <section className="bg-white px-6 pt-space-5 pb-space-3">
        <div className="max-w-content mx-auto">
          <KnowledgeSearch articles={searchArticles} />
        </div>
      </section>

      {/* Category pills (parent + subcategory rows) */}
      <CategoryPills
        categories={categories ?? []}
        activeCategory={activeCategory}
      />

      {/* Articles grid */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          {(allArticles ?? []).length > 0 ? (
            hasArticles ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5">
                  {articles.map((article) => (
                    <ArticleCardComponent key={article._id} article={article} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  activeCategory={activeCategory}
                />
              </>
            ) : (
              <p className="text-text-muted text-body text-center py-space-8">
                אין מאמרים בקטגוריה זו כרגע.
              </p>
            )
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5">
              {FALLBACK_ARTICLES.map((fa) => (
                <FallbackCard key={fa.title} {...fa} />
              ))}
            </div>
          )}
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
