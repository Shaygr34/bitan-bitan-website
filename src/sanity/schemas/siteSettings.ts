import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'הגדרות האתר',
  type: 'document',
  groups: [
    { name: 'contact', title: 'פרטי התקשרות', default: true },
    { name: 'social', title: 'רשתות חברתיות' },
    { name: 'cta', title: 'כפתורי פעולה (CTA)' },
    { name: 'footer', title: 'פוטר ומשפטי' },
    { name: 'branding', title: 'מיתוג ו-SEO' },
  ],
  fields: [
    /* ─── Contact ─── */
    defineField({
      name: 'phone',
      title: 'טלפון ראשי',
      type: 'string',
      group: 'contact',
      description: 'מוצג בהדר, בפוטר, בדף יצירת קשר ובכפתורי חיוג.',
    }),
    defineField({
      name: 'fax',
      title: 'פקס',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
      group: 'contact',
      description: 'מספר בפורמט בינלאומי, למשל: +972527221111. משמש את כל כפתורי WhatsApp באתר.',
    }),
    defineField({
      name: 'email',
      title: 'דוא"ל',
      type: 'string',
      group: 'contact',
      description: 'כתובת מייל ראשית — מוצגת בפוטר ובדף יצירת קשר.',
    }),
    defineField({
      name: 'address',
      title: 'כתובת מלאה',
      type: 'string',
      group: 'contact',
      description: 'כתובת המשרד כולל קומה ועיר.',
    }),
    defineField({
      name: 'officeHours',
      title: 'שעות פעילות',
      type: 'string',
      group: 'contact',
      description: 'למשל: ראשון–חמישי 08:30–17:00',
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'קישור Google Maps',
      type: 'url',
      group: 'contact',
      description: 'קישור ניווט ב-Google Maps.',
    }),
    defineField({
      name: 'wazeUrl',
      title: 'קישור Waze',
      type: 'url',
      group: 'contact',
      description: 'קישור ניווט ב-Waze.',
    }),
    defineField({
      name: 'googleMapsEmbedUrl',
      title: 'קישור הטמעת מפה',
      type: 'url',
      group: 'contact',
      description: 'כתובת iframe להצגת מפה בדף יצירת קשר.',
    }),

    /* ─── Social ─── */
    defineField({
      name: 'facebookUrl',
      title: 'Facebook',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram',
      type: 'url',
      group: 'social',
    }),

    /* ─── CTA Labels ─── */
    defineField({
      name: 'ctaWhatsAppLabel',
      title: 'טקסט כפתור WhatsApp',
      type: 'string',
      group: 'cta',
      description: 'ברירת מחדל: "שלחו לנו WhatsApp"',
    }),
    defineField({
      name: 'ctaPhoneLabel',
      title: 'טקסט כפתור טלפון',
      type: 'string',
      group: 'cta',
      description: 'אם ריק — מוצג מספר הטלפון עצמו.',
    }),
    defineField({
      name: 'ctaWhatsAppMessage',
      title: 'הודעת ברירת מחדל ל-WhatsApp',
      type: 'string',
      group: 'cta',
      description: 'הודעה שתמולא אוטומטית בפתיחת WhatsApp.',
    }),

    /* ─── Footer ─── */
    defineField({
      name: 'footerDisclaimer',
      title: 'כיתוב משפטי (דיסקליימר)',
      type: 'string',
      group: 'footer',
      description: 'מוצג בתחתית הפוטר.',
    }),

    /* ─── Branding ─── */
    defineField({
      name: 'siteName',
      title: 'שם האתר',
      type: 'string',
      group: 'branding',
      validation: (rule) => rule.required(),
      description: 'מוצג בפוטר, בכותרת הדפדפן ובתוצאות חיפוש.',
    }),
    defineField({
      name: 'siteDescription',
      title: 'תיאור האתר',
      type: 'text',
      rows: 3,
      group: 'branding',
      description: 'תיאור מטא לגוגל — עד 160 תווים.',
    }),
    defineField({
      name: 'logo',
      title: 'לוגו',
      type: 'image',
      group: 'branding',
      options: { hotspot: true },
      description: 'לוגו המשרד — מוצג בהדר ובתפריט נייד.',
    }),
    defineField({
      name: 'ogImage',
      title: 'תמונת שיתוף (OG Image)',
      type: 'image',
      group: 'branding',
      description: 'תמונה לשיתוף ברשתות חברתיות — מומלץ 1200×630.',
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
