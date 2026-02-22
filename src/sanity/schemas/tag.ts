import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tag',
  title: 'תגית',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם התגית',
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
  ],
  preview: {
    select: { title: 'title' },
  },
})
