'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'
import type { ArticleCard } from '@/sanity/types'
import { urlFor } from '@/sanity/image'
import { formatHebrewDate } from '@/lib/format-date'

const FALLBACK_ARTICLES = [
  { tag: 'מס הכנסה', title: 'מדריך להגשת דוח שנתי למס הכנסה', excerpt: 'כל מה שצריך לדעת על הגשת הדוח השנתי — לוחות זמנים, מסמכים נדרשים וטיפים לחיסכון.' },
  { tag: 'חברות', title: 'הקמת חברה בע"מ — המדריך המלא', excerpt: 'שלב אחר שלב: רישום חברה, פתיחת תיקים ברשויות, ותכנון מס נכון מהיום הראשון.' },
  { tag: 'מע"מ', title: 'ניהול מע"מ לעסקים קטנים ובינוניים', excerpt: 'טיפים פרקטיים לניהול חשבוניות, דיווחים תקופתיים וזכויות לניכוי מע"מ תשומות.' },
] as const

function ArticlePreviewCard({ article }: { article: ArticleCard }) {
  const imgUrl = urlFor(article.mainImage, 400)
  const dateLabel = formatHebrewDate(article.publishedAt)
  return (
    <Link href={`/knowledge/${article.slug?.current ?? ''}`}>
      <Card className={imgUrl ? '!p-0 overflow-hidden' : ''}>
        {imgUrl && (
          <div className="relative h-36 overflow-hidden">
            <Image
              src={imgUrl}
              alt={article.mainImage?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <CardHeader className={imgUrl ? 'px-space-5 pt-space-4' : ''}>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block px-3 py-1 text-caption font-medium bg-primary/10 text-primary rounded-full">
              {article.categories?.[0]?.title ?? 'כללי'}
            </span>
            {dateLabel && (
              <time
                dateTime={article.publishedAt}
                className="text-caption text-text-secondary tabular-nums"
              >
                {dateLabel}
              </time>
            )}
          </div>
        </CardHeader>
        <CardBody className={imgUrl ? 'px-space-5' : ''}>
          <h3 className="text-h4 font-semibold text-primary">{article.title}</h3>
          {article.excerpt && (
            <p className="text-text-secondary text-body mt-2">{article.excerpt}</p>
          )}
        </CardBody>
        <CardFooter className={imgUrl ? 'px-space-5 pb-space-4' : ''}>
          <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors">
            קראו עוד ←
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

type Props = { articles?: ArticleCard[] }

export function KnowledgePreview({ articles }: Props) {
  const hasData = articles && articles.length > 0
  // Show only the 3 most recent
  const displayArticles = hasData ? articles.slice(0, 3) : null

  return (
    <RevealSection className="bg-surface py-space-7 px-6 border-t border-gold/10">
      <div className="max-w-content mx-auto">
        <SectionHeader centered>
          מאמרים אחרונים
        </SectionHeader>

        <RevealGroup className="grid md:grid-cols-3 gap-space-5 mt-space-6">
          {displayArticles
            ? displayArticles.map((article) => (
                <RevealItem key={article._id}>
                  <ArticlePreviewCard article={article} />
                </RevealItem>
              ))
            : FALLBACK_ARTICLES.map(({ tag, title, excerpt }) => (
                <RevealItem key={title}>
                  <Card>
                    <CardHeader>
                      <span className="inline-block px-3 py-1 text-caption font-medium bg-primary/10 text-primary rounded-full">
                        {tag}
                      </span>
                    </CardHeader>
                    <CardBody>
                      <h3 className="text-h4 font-semibold text-primary">{title}</h3>
                      <p className="text-text-secondary text-body mt-2">{excerpt}</p>
                    </CardBody>
                    <CardFooter>
                      <span className="text-body-sm font-medium text-gold hover:text-gold-hover transition-colors cursor-pointer">
                        קראו עוד ←
                      </span>
                    </CardFooter>
                  </Card>
                </RevealItem>
              ))}
        </RevealGroup>

        <div className="text-center mt-space-6">
          <Link
            href="/knowledge"
            className="inline-flex items-center text-body-sm font-medium text-gold hover:text-gold-hover transition-colors duration-fast"
          >
            לכל המאמרים ←
          </Link>
        </div>
      </div>
    </RevealSection>
  )
}
