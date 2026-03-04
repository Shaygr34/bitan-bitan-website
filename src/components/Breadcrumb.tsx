import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site-url'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

/**
 * RTL breadcrumb with BreadcrumbList JSON-LD.
 * Last item is the current page (no link).
 */
export function Breadcrumb({ items }: Props) {
  const allItems: BreadcrumbItem[] = [{ label: 'דף הבית', href: '/' }, ...items]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="שבילי ניווט" className="text-body-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1
            return (
              <li key={item.label} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft className="h-3.5 w-3.5 shrink-0" />}
                {isLast || !item.href ? (
                  <span className={isLast ? 'text-primary font-medium' : ''}>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
