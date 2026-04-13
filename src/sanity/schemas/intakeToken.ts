import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'intakeToken',
  title: 'טוקן קליטה',
  type: 'document',
  fields: [
    defineField({
      name: 'token',
      title: 'Token',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: {
        list: [
          { title: 'ממתין', value: 'pending' },
          { title: 'הושלם', value: 'completed' },
          { title: 'פג תוקף', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'mode',
      title: 'מצב',
      type: 'string',
      options: {
        list: [
          { title: 'לקוח חדש', value: 'new' },
          { title: 'השלמת נתונים', value: 'update' },
        ],
      },
      initialValue: 'new',
      description: 'חדש = קליטה ראשונה, השלמת נתונים = לקוח קיים שמשלים מידע חסר',
    }),
    defineField({
      name: 'createdBy',
      title: 'נוצר על ידי',
      type: 'string',
    }),
    defineField({
      name: 'clientName',
      title: 'שם לקוח (רמז)',
      type: 'string',
      description: 'שם הלקוח למעקב — לא מוצג בטופס',
    }),
    defineField({
      name: 'completedAt',
      title: 'תאריך השלמה',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'summitEntityId',
      title: 'Summit Entity ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'submittedData',
      title: 'נתונים שהוגשו',
      type: 'text',
      readOnly: true,
      description: 'JSON של הנתונים שהלקוח מילא',
    }),
  ],
  preview: {
    select: { title: 'clientName', status: 'status', date: '_createdAt' },
    prepare({ title, status, date }) {
      const statusMap: Record<string, string> = { pending: 'ממתין', completed: 'הושלם', expired: 'פג תוקף' }
      const d = date ? new Date(date).toLocaleDateString('he-IL') : ''
      return {
        title: title || 'ללא שם',
        subtitle: `${statusMap[status] || status} • ${d}`,
      }
    },
  },
})
