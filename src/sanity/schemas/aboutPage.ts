import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'עמוד אודות',
  type: 'document',
  fields: [
    /* ─── Hero ─── */
    defineField({
      name: 'heroTitle',
      title: 'כותרת העמוד',
      type: 'string',
      description: 'כותרת ראשית בהירו (למשל: "אודות המשרד")',
    }),
    defineField({
      name: 'storyHeadline',
      title: 'תת-כותרת הירו',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credentialsNote',
      title: 'שורת הסמכות',
      type: 'string',
      description: 'למשל: "רואי חשבון ויועצי מס מוסמכים — וגם משפטנים."',
    }),

    /* ─── Story ─── */
    defineField({
      name: 'storyBody',
      title: 'טקסט הסיפור',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),

    /* ─── Partners ─── */
    defineField({
      name: 'partnersTitle',
      title: 'כותרת שותפים',
      type: 'string',
      description: 'כותרת סקשן השותפים (למשל: "השותפים")',
    }),

    /* ─── Team ─── */
    defineField({
      name: 'teamTitle',
      title: 'כותרת צוות',
      type: 'string',
      description: 'כותרת סקשן הצוות (למשל: "הצוות שלנו")',
    }),
    defineField({
      name: 'teamSubtitle',
      title: 'תת-כותרת צוות',
      type: 'string',
      description: 'תת-כותרת סקשן הצוות',
    }),

    /* ─── Differentiators ─── */
    defineField({
      name: 'differentiatorsTitle',
      title: 'כותרת מה מייחד אותנו',
      type: 'string',
    }),
    defineField({
      name: 'differentiatorsSubtitle',
      title: 'תת-כותרת מה מייחד אותנו',
      type: 'string',
    }),
    defineField({
      name: 'differentiators',
      title: 'מה מייחד אותנו — כרטיסים',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({ name: 'icon', title: 'אייקון', type: 'string', description: 'שם אייקון (shield, users, trending-up, headphones)' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
    }),

    /* ─── Audience Cards ─── */
    defineField({
      name: 'audienceTitle',
      title: 'כותרת קהל יעד',
      type: 'string',
    }),
    defineField({
      name: 'audienceSubtitle',
      title: 'תת-כותרת קהל יעד',
      type: 'string',
    }),
    defineField({
      name: 'audienceCards',
      title: 'למי אנחנו מתאימים — כרטיסים',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({ name: 'icon', title: 'אייקון', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
    }),

    /* ─── Process Steps ─── */
    defineField({
      name: 'processTitle',
      title: 'כותרת תהליך',
      type: 'string',
    }),
    defineField({
      name: 'processSubtitle',
      title: 'תת-כותרת תהליך',
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
            prepare({ title, step }) {
              return { title: `${step}. ${title}` }
            },
          },
        },
      ],
    }),

    /* ─── Values ─── */
    defineField({
      name: 'valuesTitle',
      title: 'כותרת ערכים',
      type: 'string',
    }),
    defineField({
      name: 'valuesSubtitle',
      title: 'תת-כותרת ערכים',
      type: 'string',
    }),
    defineField({
      name: 'values',
      title: 'הערכים שלנו — כרטיסים',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'תיאור', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({ name: 'icon', title: 'אייקון', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
    }),

    /* ─── Office Note ─── */
    defineField({
      name: 'officeNote',
      title: 'הערת משרד',
      type: 'text',
      rows: 3,
      description: 'טקסט קצר על המשרד (מיקום, אווירה)',
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
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'עמוד אודות' }
    },
  },
})
