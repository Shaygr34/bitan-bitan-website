/**
 * Seed script for Sanity CMS — ביטן את ביטן
 *
 * Usage:
 *   SANITY_API_TOKEN=<your-write-token> npm run seed
 *
 * Or with env vars already set:
 *   npm run seed
 *
 * This script is idempotent — it uses deterministic _id values,
 * so re-running it will update existing documents rather than create duplicates.
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ul4uwnp7'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error(
    '❌  Missing SANITY_API_TOKEN. Run with:\n' +
      '    SANITY_API_TOKEN=<your-write-token> npm run seed\n'
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ─── Authors ───────────────────────────────────────────────
const authors = [
  {
    _id: 'author-avi',
    _type: 'author',
    name: 'אבי ביטן',
    slug: { _type: 'slug', current: 'avi-bitan' },
    role: 'רואה חשבון, שותף מייסד',
    bio: 'רואה חשבון עם ניסיון של למעלה מ-30 שנה בייעוץ מס, ביקורת ודוחות כספיים.',
  },
  {
    _id: 'author-ron',
    _type: 'author',
    name: 'רון ביטן',
    slug: { _type: 'slug', current: 'ron-bitan' },
    role: 'רואה חשבון, שותף',
    bio: 'רואה חשבון מהדור השני של המשרד, מתמחה בליווי עסקי, מיסוי בינלאומי וחברות הייטק.',
  },
]

// ─── Categories ────────────────────────────────────────────
const categories = [
  {
    _id: 'cat-income-tax',
    _type: 'category',
    title: 'מס הכנסה',
    slug: { _type: 'slug', current: 'income-tax' },
    description: 'מאמרים ומדריכים בנושא מס הכנסה לעצמאים, שכירים וחברות.',
    order: 1,
  },
  {
    _id: 'cat-vat',
    _type: 'category',
    title: 'מע"מ',
    slug: { _type: 'slug', current: 'vat' },
    description: 'מדריכים בנושא מס ערך מוסף, דיווח ותכנון מע"מ.',
    order: 2,
  },
  {
    _id: 'cat-national-insurance',
    _type: 'category',
    title: 'ביטוח לאומי',
    slug: { _type: 'slug', current: 'national-insurance' },
    description: 'מידע על דמי ביטוח לאומי, זכויות וחובות.',
    order: 3,
  },
  {
    _id: 'cat-companies',
    _type: 'category',
    title: 'חברות',
    slug: { _type: 'slug', current: 'companies' },
    description: 'הקמת חברות, מיסוי חברות, דירקטורים ודיווח.',
    order: 4,
  },
  {
    _id: 'cat-payroll',
    _type: 'category',
    title: 'שכר',
    slug: { _type: 'slug', current: 'payroll' },
    description: 'ניהול שכר, תלושים, זכויות עובדים ותנאים סוציאליים.',
    order: 5,
  },
]

// ─── Services (7 top-level) ────────────────────────────────
const services = [
  {
    _id: 'svc-tax-advisory',
    _type: 'service',
    title: 'ייעוץ מס',
    slug: { _type: 'slug', current: 'tax-advisory' },
    shortDescription:
      'תכנון מס אסטרטגי לעצמאים, חברות ושכירים — חיסכון מקסימלי בהתאם לחוק.',
    icon: 'calculator',
    order: 1,
  },
  {
    _id: 'svc-bookkeeping',
    _type: 'service',
    title: 'הנהלת חשבונות',
    slug: { _type: 'slug', current: 'bookkeeping' },
    shortDescription:
      'ניהול ספרים שוטף, רישום תנועות, התאמות בנקים ודיווח לרשויות.',
    icon: 'ledger',
    order: 2,
  },
  {
    _id: 'svc-financial-statements',
    _type: 'service',
    title: 'דוחות כספיים',
    slug: { _type: 'slug', current: 'financial-statements' },
    shortDescription:
      'הכנת דוחות כספיים שנתיים, מאזנים ודוח רווח והפסד בהתאם לתקנים.',
    icon: 'chart',
    order: 3,
  },
  {
    _id: 'svc-audit',
    _type: 'service',
    title: 'ביקורת חשבונות',
    slug: { _type: 'slug', current: 'audit' },
    shortDescription:
      'ביקורת חשבונות חיצונית ופנימית, חוות דעת רואה חשבון מבקר.',
    icon: 'shield',
    order: 4,
  },
  {
    _id: 'svc-business-advisory',
    _type: 'service',
    title: 'ליווי עסקי',
    slug: { _type: 'slug', current: 'business-advisory' },
    shortDescription:
      'ליווי פיננסי לעסקים בצמיחה — תקצוב, תזרים מזומנים, אסטרטגיה עסקית.',
    icon: 'briefcase',
    order: 5,
  },
  {
    _id: 'svc-international-tax',
    _type: 'service',
    title: 'מיסוי בינלאומי',
    slug: { _type: 'slug', current: 'international-tax' },
    shortDescription:
      'מיסוי חברות בינלאומיות, אמנות מס, דיווח FATCA/CRS ותושבות מס.',
    icon: 'globe',
    order: 6,
  },
  {
    _id: 'svc-payroll',
    _type: 'service',
    title: 'שכר ותנאים סוציאליים',
    slug: { _type: 'slug', current: 'payroll-services' },
    shortDescription:
      'הפקת תלושי שכר, ניהול תנאים סוציאליים, דיווח לביטוח לאומי ומס הכנסה.',
    icon: 'users',
    order: 7,
  },
]

// ─── Site Settings ─────────────────────────────────────────
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'ביטן את ביטן — רואי חשבון',
  siteDescription:
    'משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי. דור שני של רואי חשבון בתל אביב.',
  phone: '03-5174295',
  fax: '03-5174298',
  whatsapp: '+972527221111',
  email: 'office@bitancpa.com',
  address: 'הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב',
  officeHours: 'א׳-ה׳ 09:00-17:00',
}

// ─── Run ───────────────────────────────────────────────────
async function seed() {
  console.log(`🌱 Seeding Sanity [${projectId} / ${dataset}] ...\n`)

  const allDocs = [...authors, ...categories, ...services, siteSettings]

  const transaction = client.transaction()
  for (const doc of allDocs) {
    transaction.createOrReplace(doc)
  }

  const result = await transaction.commit()
  console.log(`✅  Seeded ${allDocs.length} documents.`)
  console.log(`    Transaction ID: ${result.transactionId}\n`)

  console.log('   Authors:      ', authors.map((a) => a.name).join(', '))
  console.log('   Categories:   ', categories.map((c) => c.title).join(', '))
  console.log('   Services:     ', services.map((s) => s.title).join(', '))
  console.log('   SiteSettings: ', siteSettings.siteName)
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})
