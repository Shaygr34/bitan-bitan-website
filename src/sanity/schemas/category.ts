import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'קטגוריה',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם הקטגוריה',
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
      name: 'description',
      title: 'תיאור',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
