import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'שירות',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם השירות',
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
      name: 'shortDescription',
      title: 'תיאור קצר',
      type: 'text',
      rows: 2,
      description: 'תיאור קצר לכרטיס השירות בדף הבית',
    }),
    defineField({
      name: 'body',
      title: 'תוכן מלא',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'icon',
      title: 'אייקון',
      type: 'string',
      description: 'שם אייקון (למשל: calculator, briefcase, chart)',
    }),
    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'סדר תצוגה',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'shortDescription' },
  },
})
