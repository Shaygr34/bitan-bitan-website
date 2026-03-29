import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'contentOpportunity',
  title: 'הזדמנות תוכן',
  type: 'document',
  fields: [
    defineField({
      name: 'keyword',
      title: 'מילת מפתח',
      type: 'string',
    }),
    defineField({
      name: 'opportunityType',
      title: 'סוג',
      type: 'string',
      options: {
        list: [
          {title: 'מאמר חדש', value: 'new'},
          {title: 'עדכון מאמר', value: 'update'},
          {title: 'תוכן מיושן', value: 'stale'},
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: {
        list: [
          {title: 'הזדמנות', value: 'opportunity'},
          {title: 'בטיוטה', value: 'drafting'},
          {title: 'מוכן', value: 'ready'},
          {title: 'פורסם', value: 'published'},
          {title: 'נדחה', value: 'dismissed'},
        ],
      },
      initialValue: 'opportunity',
    }),
    defineField({
      name: 'score',
      title: 'ציון',
      type: 'number',
    }),
    defineField({
      name: 'weeklyImpressions',
      title: 'חשיפות שבועיות',
      type: 'number',
    }),
    defineField({
      name: 'currentPosition',
      title: 'מיקום נוכחי',
      type: 'number',
    }),
    defineField({
      name: 'currentCtr',
      title: 'CTR נוכחי',
      type: 'number',
    }),
    defineField({
      name: 'weeklyClicks',
      title: 'הקלקות שבועיות',
      type: 'number',
    }),
    defineField({
      name: 'relatedQueries',
      title: 'ביטויי חיפוש קשורים',
      type: 'text',
      description: 'ביטויים נוספים שמובילים לאותו נושא',
    }),
    defineField({
      name: 'recommendation',
      title: 'המלצה',
      type: 'text',
    }),
    defineField({
      name: 'existingArticle',
      title: 'מאמר קיים',
      type: 'reference',
      to: [{type: 'article'}],
    }),
    defineField({
      name: 'articleAgeMonths',
      title: 'גיל מאמר (חודשים)',
      type: 'number',
      description: 'חודשים מאז העדכון האחרון של המאמר הקיים',
    }),
    defineField({
      name: 'detectedAt',
      title: 'תאריך זיהוי',
      type: 'date',
    }),
    defineField({
      name: 'dataJson',
      title: 'Raw Data (JSON)',
      type: 'text',
      description: 'Full query data — used by automation',
    }),
  ],
  orderings: [
    {
      title: 'ציון (גבוה לנמוך)',
      name: 'scoreDesc',
      by: [{field: 'score', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'keyword',
      score: 'score',
      type: 'opportunityType',
      status: 'status',
    },
    prepare({title, score, type, status}) {
      const typeLabel = type === 'new' ? 'חדש' : type === 'stale' ? 'מיושן' : 'עדכון'
      const statusEmoji = status === 'opportunity' ? '🔴' : status === 'drafting' ? '🟡' : status === 'published' ? '🟢' : '⚪'
      return {
        title: `${statusEmoji} ${title || '?'}`,
        subtitle: `ציון: ${score || '?'} · ${typeLabel}`,
      }
    },
  },
})
