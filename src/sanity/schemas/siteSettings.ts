import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'הגדרות האתר',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'שם האתר',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'תיאור האתר',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'phone',
      title: 'טלפון',
      type: 'string',
    }),
    defineField({
      name: 'fax',
      title: 'פקס',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
      description: 'מספר בפורמט בינלאומי, למשל: +972527221111',
    }),
    defineField({
      name: 'email',
      title: 'דוא"ל',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'כתובת',
      type: 'string',
    }),
    defineField({
      name: 'officeHours',
      title: 'שעות פעילות',
      type: 'string',
      description: 'למשל: א׳-ה׳ 09:00-17:00',
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'קישור Google Maps',
      type: 'url',
    }),
    defineField({
      name: 'logo',
      title: 'לוגו',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ogImage',
      title: 'תמונת שיתוף (OG Image)',
      type: 'image',
      description: 'תמונה שתוצג בשיתוף ברשתות חברתיות',
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
