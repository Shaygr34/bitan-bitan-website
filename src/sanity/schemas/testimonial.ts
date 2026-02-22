import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'המלצה',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'שם הלקוח',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clientRole',
      title: 'תפקיד / חברה',
      type: 'string',
    }),
    defineField({
      name: 'quote',
      title: 'ציטוט',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
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
    select: { title: 'clientName', subtitle: 'clientRole' },
  },
})
