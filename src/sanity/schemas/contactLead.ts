import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contactLead',
  title: 'פנייה מהאתר',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'שם',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'phone',
      title: 'טלפון',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'דוא"ל',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'message',
      title: 'הודעה',
      type: 'text',
      readOnly: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'תאריך שליחה',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: {
        list: [
          { title: 'חדש', value: 'new' },
          { title: 'טופל', value: 'handled' },
          { title: 'לא רלוונטי', value: 'dismissed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'phone', date: 'submittedAt' },
    prepare({ title, subtitle, date }) {
      const d = date ? new Date(date).toLocaleDateString('he-IL') : ''
      return { title: title ?? 'ללא שם', subtitle: `${subtitle ?? ''} • ${d}` }
    },
  },
  orderings: [
    {
      title: 'תאריך (חדש ← ישן)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
})
