import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'עמוד אודות',
  type: 'document',
  fields: [
    /* ─── Hero / Story ─── */
    defineField({
      name: 'storyHeadline',
      title: 'כותרת ראשית',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'storyBody',
      title: 'טקסט הסיפור',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),

    /* ─── Differentiators ─── */
    defineField({
      name: 'differentiators',
      title: 'מה מייחד אותנו',
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
      name: 'audienceCards',
      title: 'למי אנחנו מתאימים',
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
      name: 'processSteps',
      title: 'איך מתחילים?',
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
      name: 'values',
      title: 'הערכים שלנו',
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
