import { defineField, defineType } from 'sanity'

/**
 * Signing template — captured signature/date placements per ייפוי כוח form.
 *
 * Replaces the hardcoded FORM_POSITIONS const in apps/os-hub/src/lib/onboarding/pdf-marker.ts.
 * Office staff can upload a sample PDF, click-place the 4 markers (client sig, client date,
 * office sig, office date), and the OS reads coordinates from here when stamping new PDFs.
 *
 * Coordinate convention: yFromTop = distance from top of page in PDF points.
 */
export default defineType({
  name: 'signingTemplate',
  title: 'תבנית חתימה',
  type: 'document',
  fieldsets: [
    { name: 'meta', title: 'פרטי טופס', options: { collapsible: false } },
    { name: 'page', title: 'מימדי דף', options: { collapsible: true, collapsed: false } },
    { name: 'positions', title: 'מיקומי חתימה', options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: 'formType',
      title: 'מזהה טופס (formType)',
      type: 'string',
      description: 'slug ייחודי, למשל: poa-tax-authority. חייב להתאים למזהה ב-OS.',
      validation: (r) => r.required().regex(/^[a-z0-9-]+$/, { name: 'formType slug' }),
      fieldset: 'meta',
    }),
    defineField({
      name: 'title',
      title: 'שם הטופס',
      type: 'string',
      description: 'תצוגה לעובדי המשרד, למשל: ייפוי כוח רשות המיסים',
      validation: (r) => r.required(),
      fieldset: 'meta',
    }),
    defineField({
      name: 'description',
      title: 'תיאור / הערות',
      type: 'text',
      rows: 2,
      fieldset: 'meta',
    }),
    defineField({
      name: 'sampleFile',
      title: 'קובץ דוגמה (PDF)',
      type: 'file',
      options: { accept: 'application/pdf' },
      description: 'PDF ריק לדוגמה — משמש כקנבס לסימון מיקומים',
      validation: (r) => r.required(),
      fieldset: 'meta',
    }),
    defineField({
      name: 'requiresCounterSign',
      title: 'דורש חתימה נגדית של המשרד',
      type: 'boolean',
      initialValue: false,
      fieldset: 'meta',
    }),
    defineField({
      name: 'isActive',
      title: 'פעיל',
      type: 'boolean',
      initialValue: true,
      description: 'כיבוי = הטופס לא יופיע ב-OS (soft delete)',
      fieldset: 'meta',
    }),
    defineField({
      name: 'pageWidth',
      title: 'רוחב דף (points)',
      type: 'number',
      description: 'מימדי PDF בנקודות — נקראים מהקובץ אוטומטית',
      validation: (r) => r.required().positive(),
      fieldset: 'page',
    }),
    defineField({
      name: 'pageHeight',
      title: 'גובה דף (points)',
      type: 'number',
      validation: (r) => r.required().positive(),
      fieldset: 'page',
    }),
    defineField({
      name: 'clientPosition',
      title: 'מיקום חתימת לקוח',
      type: 'object',
      fieldset: 'positions',
      validation: (r) => r.required(),
      fields: [
        defineField({ name: 'x', title: 'X', type: 'number', validation: (r) => r.required() }),
        defineField({
          name: 'yFromTop',
          title: 'Y מהראש',
          type: 'number',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'clientDatePosition',
      title: 'מיקום תאריך לקוח (אופציונלי)',
      type: 'object',
      fieldset: 'positions',
      description: 'תיבת תאריך — מתמלאת אוטומטית בעת חתימה',
      fields: [
        defineField({ name: 'x', title: 'X', type: 'number' }),
        defineField({ name: 'yFromTop', title: 'Y מהראש', type: 'number' }),
        defineField({ name: 'width', title: 'רוחב', type: 'number' }),
        defineField({ name: 'height', title: 'גובה', type: 'number' }),
      ],
    }),
    defineField({
      name: 'officePosition',
      title: 'מיקום חתימת משרד (אופציונלי)',
      type: 'object',
      fieldset: 'positions',
      description: 'נדרש רק אם requiresCounterSign=true',
      fields: [
        defineField({ name: 'x', title: 'X', type: 'number' }),
        defineField({ name: 'yFromTop', title: 'Y מהראש', type: 'number' }),
      ],
    }),
    defineField({
      name: 'officeDatePosition',
      title: 'מיקום תאריך משרד (אופציונלי)',
      type: 'object',
      fieldset: 'positions',
      fields: [
        defineField({ name: 'x', title: 'X', type: 'number' }),
        defineField({ name: 'yFromTop', title: 'Y מהראש', type: 'number' }),
        defineField({ name: 'width', title: 'רוחב', type: 'number' }),
        defineField({ name: 'height', title: 'גובה', type: 'number' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      formType: 'formType',
      counter: 'requiresCounterSign',
      active: 'isActive',
    },
    prepare({ title, formType, counter, active }) {
      const flags = [
        counter ? 'חתימה נגדית' : null,
        !active ? 'כבוי' : null,
      ].filter(Boolean).join(' · ')
      return {
        title: title || 'ללא שם',
        subtitle: `${formType || ''}${flags ? ` · ${flags}` : ''}`,
      }
    },
  },
})
