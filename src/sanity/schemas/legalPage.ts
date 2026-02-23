import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'legalPage',
  title: 'עמוד משפטי',
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
      name: 'lastUpdated',
      title: 'עודכן לאחרונה',
      type: 'date',
      description: 'תאריך העדכון האחרון של המסמך',
    }),
    defineField({
      name: 'body',
      title: 'תוכן',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
