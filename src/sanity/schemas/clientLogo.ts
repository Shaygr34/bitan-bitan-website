import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'clientLogo',
  title: 'לוגו לקוח',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'שם החברה',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'תחום / תיאור קצר',
      type: 'string',
      description: 'למשל: "בנייה ותשתית", "Technology"',
    }),
    defineField({
      name: 'logo',
      title: 'לוגו (לבן על שקוף)',
      type: 'image',
      options: { hotspot: true },
      description: 'PNG/SVG לבן על רקע שקוף. אם ריק — יוצג כטקסט',
    }),
    defineField({
      name: 'logoSize',
      title: 'גודל לוגו',
      type: 'string',
      options: {
        list: [
          { title: 'רגיל', value: 'normal' },
          { title: 'גדול (מוצרט)', value: 'large' },
          { title: 'קטן (ZAMSH)', value: 'small' },
        ],
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'row',
      title: 'שורה',
      type: 'number',
      options: {
        list: [
          { title: 'שורה 1 (עליונה)', value: 1 },
          { title: 'שורה 2 (תחתונה)', value: 2 },
        ],
      },
      initialValue: 1,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'קישור לאתר החברה',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'הצג בקרוסלה',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
      description: 'מספר נמוך = מוצג קודם',
    }),
  ],
  orderings: [
    {
      title: 'סדר תצוגה',
      name: 'sortOrderAsc',
      by: [
        { field: 'row', direction: 'asc' },
        { field: 'sortOrder', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'companyName', subtitle: 'subtitle', media: 'logo' },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle || '',
        media,
      }
    },
  },
})
