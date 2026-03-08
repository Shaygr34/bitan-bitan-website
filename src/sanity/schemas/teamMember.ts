import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'חבר צוות',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'שם',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'תפקיד',
      type: 'string',
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
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
})
