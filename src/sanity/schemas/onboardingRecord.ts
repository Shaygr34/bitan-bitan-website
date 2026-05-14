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
    defineField({
      name: 'nationalInsuranceRepLink',
      title: 'קישור ב"ל מיוצגים',
      description: 'קישור שהמשרד מקבל לאחר רישום הלקוח באתר meyutzagim.btl.gov.il. נדבק כאן ידנית על ידי אבי/רון ונשלח ללקוח בעת ייפוי הכוח של ב"ל מיוצגים.',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'otherDocs',
      title: 'מסמכים אחרים (אופיס)',
      description: 'מסמכים נוספים שהועלו דרך ה-OS שלא נכללים בתבנית. מקור האמת לרשימה — סאמיט שומר רק את הקובץ האחרון בשדה "קבצים אחרים" (multi-file overwrites). כאן נשמרים כל הקבצים כקישורי Sanity.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'תיוג', type: 'string' }),
            defineField({ name: 'filename', title: 'שם הקובץ', type: 'string' }),
            defineField({ name: 'url', title: 'קישור Sanity', type: 'url' }),
            defineField({ name: 'uploadedAt', title: 'תאריך העלאה', type: 'datetime' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'filename' },
          },
        },
      ],
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
