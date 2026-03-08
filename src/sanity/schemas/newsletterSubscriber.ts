import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'newsletterSubscriber',
  title: 'מנוי לעדכונים',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'דוא"ל',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'name',
      title: 'שם',
      type: 'string',
    }),
    defineField({
      name: 'subscribedCategories',
      title: 'נושאים',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'isActive',
      title: 'פעיל',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'subscribedAt',
      title: 'תאריך הרשמה',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'name' },
  },
})
