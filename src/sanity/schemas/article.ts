import { defineField, defineType } from 'sanity'

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
      name: 'author',
      title: 'כותב',
      type: 'reference',
      to: [{ type: 'author' }],
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
        { type: 'block' },
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
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `מאת ${author}` }
    },
  },
})
