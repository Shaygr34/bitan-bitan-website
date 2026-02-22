import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'faq',
  title: 'שאלה נפוצה',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'שאלה',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'תשובה',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'קטגוריה',
      type: 'reference',
      to: [{ type: 'category' }],
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
    select: { title: 'question' },
  },
})
