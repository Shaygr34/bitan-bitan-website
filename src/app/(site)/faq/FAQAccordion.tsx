'use client'

import { PortableText } from 'next-sanity'
import { Accordion, AccordionItem } from '@/components/ui'
import type { FAQ } from '@/sanity/types'

type Props = {
  faqs?: FAQ[]
  fallbackItems?: { q: string; a: string }[]
}

export function FAQAccordion({ faqs, fallbackItems }: Props) {
  if (faqs && faqs.length > 0) {
    return (
      <Accordion>
        {faqs.map((faq) => (
          <AccordionItem key={faq._id} title={faq.question}>
            <div className="prose-sm text-text-secondary">
              <PortableText value={faq.answer} />
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  if (fallbackItems) {
    return (
      <Accordion>
        {fallbackItems.map(({ q, a }) => (
          <AccordionItem key={q} title={q}>
            {a}
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  return null
}
