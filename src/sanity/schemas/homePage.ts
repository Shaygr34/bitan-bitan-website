import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'עמוד הבית',
  type: 'document',
  fields: [
    /* ─── Hero ─── */
    defineField({
      name: 'heroHeadline',
      title: 'כותרת ראשית (Hero)',
      type: 'string',
      description: 'למשל: "המומחים הפיננסיים של העסק שלכם"',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'תת-כותרת (Hero)',
      type: 'text',
      rows: 3,
      description: 'טקסט מתחת לכותרת הראשית.',
    }),
    defineField({
      name: 'heroFooterNote',
      title: 'שורת מידע (Hero)',
      type: 'string',
      description: 'שורה קצרה בתחתית ההירו, למשל: "רואי חשבון ומשפטנים · ייעוץ מיסוי וליווי עסקי · תל אביב"',
    }),

    /* ─── Trust Bar ─── */
    defineField({
      name: 'trustPoints',
      title: 'נקודות אמון',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'string', validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'description' },
          },
        },
      ],
      description: 'ארבע נקודות אמון שמוצגות מתחת להירו.',
    }),

    /* ─── About ("Why Us") ─── */
    defineField({
      name: 'aboutHeading',
      title: 'כותרת — למה אנחנו',
      type: 'string',
      description: 'למשל: "למה ביטן את ביטן?"',
    }),
    defineField({
      name: 'aboutSubtitle',
      title: 'תת-כותרת — למה אנחנו',
      type: 'text',
      rows: 4,
      description: 'פסקה קצרה שמתארת את המשרד.',
    }),
    defineField({
      name: 'aboutLinkText',
      title: 'טקסט קישור לעמוד אודות',
      type: 'string',
      description: 'למשל: "קראו עוד עלינו ←"',
    }),
    defineField({
      name: 'aboutDifferentiators',
      title: 'יתרונות (למה אנחנו)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
      description: 'שלושה יתרונות שמוצגים ליד הטקסט.',
    }),

    /* ─── Process Steps ─── */
    defineField({
      name: 'processHeading',
      title: 'כותרת — תהליך עבודה',
      type: 'string',
    }),
    defineField({
      name: 'processSubtitle',
      title: 'תת-כותרת — תהליך עבודה',
      type: 'string',
    }),
    defineField({
      name: 'processSteps',
      title: 'שלבי התהליך',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'stepNumber', title: 'מספר שלב', type: 'number', validation: (r) => r.required() }),
            defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'title', step: 'stepNumber' },
            prepare(selection: Record<string, unknown>) {
              return { title: `${selection.step}. ${selection.title}` }
            },
          },
        },
      ],
    }),

    /* ─── CTA ─── */
    defineField({
      name: 'ctaHeadline',
      title: 'כותרת CTA',
      type: 'string',
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'תת-כותרת CTA',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ctaFooterNote',
      title: 'שורת מידע CTA',
      type: 'string',
      description: 'למשל: "ללא התחייבות · תשובה תוך 24 שעות · שיחה חינם"',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'עמוד הבית' }
    },
  },
})
