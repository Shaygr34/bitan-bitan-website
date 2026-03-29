import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'weeklyMetrics',
  title: 'דוח שבועי',
  type: 'document',
  fields: [
    defineField({
      name: 'periodStart',
      title: 'תחילת תקופה',
      type: 'date',
    }),
    defineField({
      name: 'periodEnd',
      title: 'סוף תקופה',
      type: 'date',
    }),
    defineField({
      name: 'totalUsers',
      title: 'סה"כ מבקרים',
      type: 'number',
    }),
    defineField({
      name: 'totalPageviews',
      title: 'סה"כ צפיות',
      type: 'number',
    }),
    defineField({
      name: 'totalClicks',
      title: 'הקלקות (גוגל)',
      type: 'number',
    }),
    defineField({
      name: 'totalImpressions',
      title: 'חשיפות (גוגל)',
      type: 'number',
    }),
    defineField({
      name: 'metricsJson',
      title: 'Raw Metrics (JSON)',
      type: 'text',
      description: 'Full metrics data — used by automated report generator',
    }),
  ],
  preview: {
    select: {
      start: 'periodStart',
      end: 'periodEnd',
      users: 'totalUsers',
    },
    prepare({start, end, users}) {
      return {
        title: `${start || '?'} — ${end || '?'}`,
        subtitle: users ? `${users} מבקרים` : '',
      }
    },
  },
})
