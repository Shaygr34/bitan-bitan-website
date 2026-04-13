import { defineField, defineType } from 'sanity'

/**
 * clientDocument — Tracks uploaded documents per Summit client.
 *
 * Each document maps a Summit entity to a specific document type
 * (ת.ז, אישור ניהול חשבון, etc.) with the file stored in Sanity CDN.
 * This replaces the old pattern of dumping file URLs into Summit's הערות field.
 *
 * Used by: intake form (website), OS dashboard (bitan-bitan-os)
 */

const DOC_TYPES = [
  { title: 'צילום ת.ז + ספח', value: 'idCard' },
  { title: 'צילום רישיון נהיגה', value: 'driverLicense' },
  { title: 'אישור ניהול חשבון / שיק מבוטל', value: 'bankApproval' },
  { title: 'תעודת עוסק מורשה', value: 'osekMurshe' },
  { title: 'פתיחת תיק מע"מ', value: 'ptihaTikMaam' },
  { title: 'תעודת התאגדות', value: 'teudatHitagdut' },
  { title: 'תקנון חברה', value: 'takanonHevra' },
  { title: 'פרוטוקול מורשה חתימה', value: 'protokolMurshe' },
  { title: 'נסח חברה', value: 'nesahHevra' },
  { title: 'חוזה שכירות', value: 'rentalContract' },
  { title: 'ייפוי כח / פתיחת תיק', value: 'powerOfAttorney' },
  { title: 'אחר', value: 'other' },
]

export default defineType({
  name: 'clientDocument',
  title: 'מסמך לקוח',
  type: 'document',
  fields: [
    defineField({
      name: 'summitEntityId',
      title: 'Summit Entity ID',
      type: 'string',
      validation: (r) => r.required(),
      description: 'מזהה הלקוח בסאמיט',
    }),
    defineField({
      name: 'clientName',
      title: 'שם לקוח',
      type: 'string',
      description: 'לנוחות — מוצג ברשימות',
    }),
    defineField({
      name: 'docType',
      title: 'סוג מסמך',
      type: 'string',
      options: { list: DOC_TYPES },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'file',
      title: 'קובץ',
      type: 'file',
      options: { accept: '.pdf,.jpg,.jpeg,.png,.webp' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'uploadedBy',
      title: 'הועלה על ידי',
      type: 'string',
      options: {
        list: [
          { title: 'לקוח', value: 'client' },
          { title: 'צוות', value: 'staff' },
        ],
      },
      initialValue: 'client',
    }),
    defineField({
      name: 'note',
      title: 'הערה',
      type: 'string',
      description: 'הערה חופשית (אופציונלי)',
    }),
  ],
  preview: {
    select: {
      clientName: 'clientName',
      docType: 'docType',
      uploadedAt: '_createdAt',
    },
    prepare({ clientName, docType, uploadedAt }) {
      const docLabel = DOC_TYPES.find((d) => d.value === docType)?.title || docType
      const date = uploadedAt ? new Date(uploadedAt).toLocaleDateString('he-IL') : ''
      return {
        title: `${clientName || 'לקוח'} — ${docLabel}`,
        subtitle: date,
      }
    },
  },
  orderings: [
    {
      title: 'לפי לקוח',
      name: 'clientAsc',
      by: [{ field: 'summitEntityId', direction: 'asc' }],
    },
    {
      title: 'לפי תאריך',
      name: 'dateDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})
