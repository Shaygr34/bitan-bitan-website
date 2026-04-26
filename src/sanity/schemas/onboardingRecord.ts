import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'onboardingRecord',
  title: 'רשומת קליטה',
  type: 'document',
  fields: [
    defineField({
      name: 'summitEntityId',
      title: 'Summit Entity ID',
      type: 'string',
      description: 'מזהה הלקוח בסאמיט',
    }),
    defineField({
      name: 'clientName',
      title: 'שם לקוח',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'clientType',
      title: 'סוג לקוח',
      type: 'string',
    }),
    defineField({
      name: 'accountManager',
      title: 'מנהל תיק',
      type: 'string',
    }),
    defineField({
      name: 'intakeToken',
      title: 'טוקן קליטה',
      type: 'string',
      description: 'מזהה הטוקן (cross-queried)',
    }),
    defineField({
      name: 'startDate',
      title: 'תאריך התחלה',
      type: 'datetime',
    }),
    defineField({
      name: 'checklistItems',
      title: 'צ\'קליסט',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'key', title: 'מזהה', type: 'string' }),
            defineField({ name: 'label', title: 'תיאור', type: 'string' }),
            defineField({ name: 'completed', title: 'הושלם', type: 'boolean', initialValue: false }),
            defineField({ name: 'completedAt', title: 'תאריך השלמה', type: 'datetime' }),
            defineField({ name: 'stageRelevance', title: 'שלב רלוונטי', type: 'number' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'הערות',
      type: 'text',
    }),
  ],
  preview: {
    select: { title: 'clientName', type: 'clientType', date: 'startDate' },
    prepare({ title, type, date }) {
      const d = date ? new Date(date).toLocaleDateString('he-IL') : ''
      return { title: title || 'ללא שם', subtitle: `${type || ''} · ${d}` }
    },
  },
})
