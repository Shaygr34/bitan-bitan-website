import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'כותב',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'שם מלא',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'כתובת URL',
      type: 'slug',
      options: {
        source: 'name',
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
      name: 'role',
      title: 'תפקיד',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'ביוגרפיה',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
})
