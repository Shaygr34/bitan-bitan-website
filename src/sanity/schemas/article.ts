import { defineField, defineType } from 'sanity'
import { createElement, type ReactNode } from 'react'

/* ─── Color decorator components for Studio preview ─── */
function colorDecorator(color: string, displayName: string) {
  const Component = ({ children }: { children: ReactNode }) =>
    createElement('span', { style: { color } }, children)
  Component.displayName = displayName
  return Component
}
const RedText = colorDecorator('#DC2626', 'RedText')
const GoldText = colorDecorator('#C5A572', 'GoldText')
const BlueText = colorDecorator('#2563EB', 'BlueText')
const GreenText = colorDecorator('#16A34A', 'GreenText')

export default defineType({
  name: 'article',
  title: 'מאמר',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'כתובת URL',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '')
            .slice(0, 96),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authors',
      title: 'כותבים',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'author' }] }],
      validation: (rule) => rule.min(1).error('נדרש לפחות כותב אחד'),
    }),
    /* Deprecated — kept for backward compatibility with old articles */
    defineField({
      name: 'author',
      title: 'כותב (ישן)',
      type: 'reference',
      to: [{ type: 'author' }],
      hidden: true,
    }),
    defineField({
      name: 'category',
      title: 'קטגוריה',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'tags',
      title: 'תגיות',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'תאריך פרסום',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'תקציר',
      type: 'text',
      rows: 3,
      description: 'תקציר קצר לרשימת מאמרים ו-SEO',
    }),
    defineField({
      name: 'mainImage',
      title: 'תמונה ראשית',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'טקסט חלופי',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'תוכן',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'אדום', value: 'redText', icon: () => 'א', component: RedText },
              { title: 'זהב', value: 'goldText', icon: () => 'ז', component: GoldText },
              { title: 'כחול', value: 'blueText', icon: () => 'כ', component: BlueText },
              { title: 'ירוק', value: 'greenText', icon: () => 'י', component: GreenText },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'טקסט חלופי',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'כיתוב',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'tldr',
      title: 'תקציר מהיר (TL;DR)',
      type: 'text',
      rows: 3,
      description: 'סיכום קצר של 2-3 משפטים — מוצג בתחילת המאמר בתיבה בולטת',
    }),
    defineField({
      name: 'difficulty',
      title: 'רמת קושי',
      type: 'string',
      options: {
        list: [
          { title: 'בסיסי — מתאים לכולם', value: 'basic' },
          { title: 'בינוני — דורש ידע מוקדם', value: 'intermediate' },
          { title: 'מתקדם — לבעלי ניסיון', value: 'advanced' },
        ],
        layout: 'radio',
      },
      description: 'עוזר לקורא לדעת אם התוכן מתאים לו',
    }),
    defineField({
      name: 'checklist',
      title: 'רשימת משימות',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'צעדים מעשיים שהקורא יכול לבצע (מוצגים כרשימת ✓)',
    }),
    defineField({
      name: 'disclaimer',
      title: 'הערת דיסקליימר',
      type: 'text',
      rows: 2,
      description: 'הערה משפטית (ברירת מחדל: "המידע במאמר זה הינו כללי...")',
    }),
    defineField({
      name: 'downloadableFile',
      title: 'קובץ להורדה',
      type: 'file',
      description: 'PDF or document available for download',
      options: {
        accept: '.pdf,.doc,.docx',
      },
    }),
    defineField({
      name: 'contentType',
      title: 'סוג תוכן',
      type: 'string',
      options: {
        list: [
          { title: 'מאמר', value: 'article' },
          { title: 'מדריך + PDF', value: 'guide' },
          { title: 'חוזר מקצועי', value: 'circular' },
        ],
      },
      initialValue: 'article',
    }),
    defineField({
      name: 'seoTitle',
      title: 'כותרת SEO',
      type: 'string',
      description: 'כותרת מותאמת למנועי חיפוש (אם שונה מהכותרת הראשית)',
    }),
    defineField({
      name: 'seoDescription',
      title: 'תיאור SEO',
      type: 'text',
      rows: 2,
      description: 'תיאור מטא למנועי חיפוש',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author0: 'authors.0.name',
      author1: 'authors.1.name',
      legacyAuthor: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, author0, author1, legacyAuthor, media } = selection
      const authorName = author0 || legacyAuthor
      const subtitle = authorName
        ? `מאת ${authorName}${author1 ? ` ועוד` : ''}`
        : undefined
      return { title, subtitle, media }
    },
  },
})
