import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'clientLogo',
  title: 'לוגו לקוח',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'שם החברה',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'לוגו',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'קישור לאתר החברה',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'הצג בקרוסלה',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'סדר תצוגה',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'companyName', media: 'logo' },
  },
})
