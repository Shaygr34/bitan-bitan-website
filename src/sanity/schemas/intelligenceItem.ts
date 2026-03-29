import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'intelligenceItem',
  title: 'עדכון מודיעין',
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      title: 'מקור (מזהה)',
      type: 'string',
    }),
    defineField({
      name: 'sourceLabel',
      title: 'מקור',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'קישור',
      type: 'url',
    }),
    defineField({
      name: 'itemType',
      title: 'סוג',
      type: 'string',
      options: {
        list: [
          {title: 'חוזר מקצועי', value: 'tax_alert'},
          {title: 'עדכון רשמי', value: 'official_update'},
          {title: 'חדשות', value: 'news'},
          {title: 'חקיקה', value: 'legislation'},
        ],
      },
    }),
    defineField({
      name: 'detectedAt',
      title: 'תאריך זיהוי',
      type: 'datetime',
    }),
    defineField({
      name: 'dataJson',
      title: 'Raw Data (JSON)',
      type: 'text',
    }),
  ],
  orderings: [
    {
      title: 'תאריך (חדש לישן)',
      name: 'detectedDesc',
      by: [{field: 'detectedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      source: 'sourceLabel',
      type: 'itemType',
    },
    prepare({title, source, type}) {
      const icons: Record<string, string> = {
        tax_alert: '📋',
        official_update: '📢',
        news: '📰',
        legislation: '⚖️',
      }
      return {
        title: `${icons[type || ''] || '📌'} ${title || '?'}`,
        subtitle: source || '',
      }
    },
  },
})
