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
      options: { source: 'title', maxLength: 96 },
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
