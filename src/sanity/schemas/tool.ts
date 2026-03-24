import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tool',
  title: 'כלי אינטראקטיבי',
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
      name: 'toolType',
      title: 'סוג כלי',
      type: 'string',
      description: 'מזהה טכני — קובע איזה קומפוננט React יוצג',
      options: {
        list: [
          { title: 'סימולטור ליסינג', value: 'leasing-simulator' },
          { title: 'סימולטור מענקים', value: 'grants-simulator' },
          { title: 'מחשבון עלות מעסיק', value: 'employer-cost-calculator' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'תיאור קצר',
      type: 'text',
      rows: 3,
      description: 'מוצג בכרטיס בעמוד הכלים ו-SEO',
    }),
    defineField({
      name: 'mainImage',
      title: 'תמונה ראשית',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'configJson',
      title: 'הגדרות (JSON)',
      type: 'text',
      rows: 20,
      description: 'JSON עם שיעורי מס, עלויות ממוצעות ופרמטרים — ניתן לעדכון ללא שינוי קוד.',
    }),
    defineField({
      name: 'introBody',
      title: 'תוכן SEO (מתחת לכלי)',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                title: 'קישור',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'כתובת URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'פתח בלשונית חדשה',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'disclaimer',
      title: 'הערת דיסקליימר',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'seoTitle',
      title: 'כותרת SEO',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'תיאור SEO',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'toolType' },
  },
})
