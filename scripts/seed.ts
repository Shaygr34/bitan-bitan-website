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

// ─── Helpers ──────────────────────────────────────────────
/** Shorthand for a Portable Text block with plain text */
function textBlock(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  }
}

/** Shorthand for a Portable Text h2 heading */
function h2Block(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'h2',
    markDefs: [],
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  }
}

/** Shorthand for a Portable Text h3 heading */
function h3Block(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'h3',
    markDefs: [],
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  }
}

/** Shorthand for a bullet list item */
function bulletBlock(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  }
}

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

// ─── Tags ──────────────────────────────────────────────────
const tags = [
  { _id: 'tag-freelancers', _type: 'tag', title: 'עצמאים', slug: { _type: 'slug', current: 'freelancers' } },
  { _id: 'tag-companies', _type: 'tag', title: 'חברות', slug: { _type: 'slug', current: 'companies' } },
  { _id: 'tag-employees', _type: 'tag', title: 'שכירים', slug: { _type: 'slug', current: 'employees' } },
  { _id: 'tag-planning', _type: 'tag', title: 'תכנון מס', slug: { _type: 'slug', current: 'tax-planning' } },
  { _id: 'tag-reporting', _type: 'tag', title: 'דיווח', slug: { _type: 'slug', current: 'reporting' } },
  { _id: 'tag-guide', _type: 'tag', title: 'מדריך', slug: { _type: 'slug', current: 'guide' } },
  { _id: 'tag-intl', _type: 'tag', title: 'בינלאומי', slug: { _type: 'slug', current: 'international' } },
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

// ─── Services (7 top-level with body content) ──────────────
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
    body: [
      textBlock('שירותי ייעוץ המס שלנו כוללים:'),
      bulletBlock('תכנון מס שנתי ורב-שנתי'),
      bulletBlock('ייעוץ בעסקאות מורכבות'),
      bulletBlock('תכנון מס לפני מכירת נכסים או עסק'),
      bulletBlock('ייצוג מול רשויות המס'),
      bulletBlock('החזרי מס לשכירים'),
    ],
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
    body: [
      textBlock('שירותי הנהלת החשבונות שלנו כוללים:'),
      bulletBlock('הנהלת חשבונות חד-צידית ודו-צידית'),
      bulletBlock('דיווחים חודשיים למע"מ ומס הכנסה'),
      bulletBlock('ניהול חשבוניות ותשלומים'),
      bulletBlock('התאמות בנקים'),
      bulletBlock('הכנת דוחות ניהוליים שוטפים'),
    ],
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
    body: [
      textBlock('שירותי הדוחות הכספיים שלנו כוללים:'),
      bulletBlock('דוחות כספיים שנתיים מבוקרים וסקורים'),
      bulletBlock('דוחות מס הכנסה ליחידים ולחברות'),
      bulletBlock('דוחות לבנקים ולגופים מוסדיים'),
      bulletBlock('דוחות מיוחדים לפי דרישה'),
    ],
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
    body: [
      textBlock('שירותי הביקורת שלנו כוללים:'),
      bulletBlock('ביקורת דוחות כספיים'),
      bulletBlock('ביקורת פנימית'),
      bulletBlock('בדיקת נאותות (Due Diligence)'),
      bulletBlock('חוות דעת מקצועיות'),
    ],
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
    body: [
      textBlock('שירותי הליווי העסקי שלנו כוללים:'),
      bulletBlock('הקמת עסק חדש — בחירת מבנה משפטי ומס'),
      bulletBlock('תוכנית עסקית ותחזיות פיננסיות'),
      bulletBlock('ליווי בגיוסי הון ומימון'),
      bulletBlock('ייעוץ לפני ובמהלך עסקאות'),
      bulletBlock('ייעוץ לשיפור רווחיות'),
    ],
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
    body: [
      textBlock('שירותי המיסוי הבינלאומי שלנו כוללים:'),
      bulletBlock('אמנות למניעת כפל מס'),
      bulletBlock('מיסוי עולים חדשים ותושבים חוזרים'),
      bulletBlock('מבנים בינלאומיים לחברות'),
      bulletBlock('דיווחים לרשויות מס בחו"ל'),
    ],
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
    body: [
      textBlock('שירותי השכר שלנו כוללים:'),
      bulletBlock('הפקת תלושי שכר'),
      bulletBlock('דיווחים לביטוח לאומי ומס הכנסה'),
      bulletBlock('חישובי פיצויים וזכויות עובדים'),
      bulletBlock('ייעוץ בנושאי דיני עבודה'),
    ],
  },
]

// ─── FAQs ──────────────────────────────────────────────────
const faqs = [
  {
    _id: 'faq-who',
    _type: 'faq',
    question: 'למי מתאימים השירותים של המשרד?',
    answer: [
      textBlock('המשרד מעניק שירות לעצמאים, שכירים עם הכנסות נוספות, חברות בע"מ, עמותות ועסקים בכל גודל. אנחנו מתאימים את השירות לצרכים הייחודיים של כל לקוח.'),
    ],
    order: 1,
  },
  {
    _id: 'faq-price',
    _type: 'faq',
    question: 'כמה עולים השירותים?',
    answer: [
      textBlock('המחיר משתנה בהתאם להיקף השירות ולמורכבות. אנחנו מאמינים בשקיפות מלאה — בפגישת ההיכרות נציג הצעת מחיר מפורטת וללא התחייבות.'),
    ],
    order: 2,
  },
  {
    _id: 'faq-start',
    _type: 'faq',
    question: 'איך מתחילים לעבוד איתכם?',
    answer: [
      textBlock('צרו קשר בטלפון, בוואטסאפ או דרך האתר. נקבע פגישת היכרות (ללא עלות), נבין את הצרכים שלכם ונבנה תוכנית עבודה מותאמת.'),
    ],
    order: 3,
  },
  {
    _id: 'faq-software',
    _type: 'faq',
    question: 'האם המשרד עובד עם תוכנות חשבונאות מסוימות?',
    answer: [
      textBlock('אנחנו עובדים עם כל התוכנות המובילות בשוק ויכולים להתאים את העבודה למערכת שכבר קיימת אצלכם, או להמליץ על פתרון מתאים.'),
    ],
    order: 4,
  },
  {
    _id: 'faq-hours',
    _type: 'faq',
    question: 'מה שעות הפעילות של המשרד?',
    answer: [
      textBlock('המשרד פתוח ימים ראשון עד חמישי, 08:30–17:00. ניתן לתאם פגישות גם מחוץ לשעות אלו בתיאום מראש.'),
    ],
    order: 5,
  },
]

// ─── Testimonials ──────────────────────────────────────────
const testimonials = [
  {
    _id: 'testimonial-1',
    _type: 'testimonial',
    clientName: 'יוסי כהן',
    clientRole: 'מנכ"ל, חברת טכנולוגיה',
    quote: 'משרד ביטן את ביטן מלווה אותנו כבר שנים. השירות מקצועי, אישי ותמיד זמין. ממליץ בחום!',
    order: 1,
  },
  {
    _id: 'testimonial-2',
    _type: 'testimonial',
    clientName: 'רונית לוי',
    clientRole: 'עצמאית, מעצבת פנים',
    quote: 'מאז שהתחלתי לעבוד עם ביטן את ביטן, ההתנהלות הכספית של העסק שלי הפכה לפשוטה ומסודרת. הם תמיד פרואקטיביים ודואגים שלא אפספס שום דבר.',
    order: 2,
  },
  {
    _id: 'testimonial-3',
    _type: 'testimonial',
    clientName: 'דני אברהם',
    clientRole: 'שותף, משרד עורכי דין',
    quote: 'הידע המקצועי של הצוות, במיוחד בתחום המיסוי הבינלאומי, חסך לנו כסף רב ומנע בעיות מול רשויות המס.',
    order: 3,
  },
]

// ─── Articles (Knowledge Hub) ──────────────────────────────
const articles = [
  {
    _id: 'article-annual-report',
    _type: 'article',
    title: 'מדריך להגשת דוח שנתי למס הכנסה',
    slug: { _type: 'slug', current: 'annual-tax-report-guide' },
    excerpt: 'כל מה שצריך לדעת על הגשת הדוח השנתי — לוחות זמנים, מסמכים נדרשים וטיפים לחיסכון.',
    publishedAt: '2025-01-15',
    author: { _type: 'reference', _ref: 'author-avi' },
    category: { _type: 'reference', _ref: 'cat-income-tax' },
    tags: [
      { _type: 'reference', _ref: 'tag-freelancers', _key: 't1' },
      { _type: 'reference', _ref: 'tag-guide', _key: 't2' },
      { _type: 'reference', _ref: 'tag-reporting', _key: 't3' },
    ],
    body: [
      h2Block('מי חייב להגיש דוח שנתי?'),
      textBlock('כל עצמאי בישראל חייב להגיש דוח שנתי למס הכנסה. בנוסף, שכירים עם הכנסה שנתית מעל תקרה מסוימת, או שיש להם הכנסות נוספות (כגון השכרת דירה, רווחי הון, או הכנסות מחו"ל), עשויים להיות חייבים בדיווח.'),
      h2Block('לוחות זמנים חשובים'),
      textBlock('המועד האחרון להגשת דוח שנתי למס הכנסה הוא בדרך כלל 30 באפריל עבור דוח ידני, ו-31 במאי עבור דוח מקוון. רואי חשבון מקבלים ארכות הגשה — לכן עבודה עם רו"ח מאפשרת גמישות בלוחות הזמנים.'),
      h2Block('מסמכים נדרשים'),
      bulletBlock('טופסי 106 מכל המעסיקים'),
      bulletBlock('אישורים על הפקדות לקרנות פנסיה וקופות גמל'),
      bulletBlock('אישורי תרומות מוכרות'),
      bulletBlock('אישורים על הכנסות מריבית, דיבידנד ורווחי הון'),
      bulletBlock('קבלות על הוצאות מוכרות (לעצמאים)'),
      h2Block('טיפים לחיסכון במס'),
      textBlock('תכנון מס נכון יכול לחסוך אלפי שקלים בשנה. מומלץ להתייעץ עם רואה חשבון לפני סוף שנת המס כדי למקסם הטבות ולתכנן את ההכנסות וההוצאות בצורה אופטימלית.'),
    ],
  },
  {
    _id: 'article-ltd-company',
    _type: 'article',
    title: 'הקמת חברה בע"מ — המדריך המלא',
    slug: { _type: 'slug', current: 'setting-up-ltd-company' },
    excerpt: 'שלב אחר שלב: רישום חברה, פתיחת תיקים ברשויות, ותכנון מס נכון מהיום הראשון.',
    publishedAt: '2025-02-20',
    author: { _type: 'reference', _ref: 'author-ron' },
    category: { _type: 'reference', _ref: 'cat-companies' },
    tags: [
      { _type: 'reference', _ref: 'tag-companies', _key: 't1' },
      { _type: 'reference', _ref: 'tag-guide', _key: 't2' },
      { _type: 'reference', _ref: 'tag-planning', _key: 't3' },
    ],
    body: [
      h2Block('למה להקים חברה בע"מ?'),
      textBlock('הקמת חברה בע"מ מציעה מספר יתרונות משמעותיים: הגנה על נכסים אישיים (אחריות מוגבלת), שיעור מס חברות נמוך יחסית (23%), גמישות בתכנון מס, ואפשרות לגיוס הון ממשקיעים.'),
      h2Block('שלבי ההקמה'),
      h3Block('1. בחירת שם ורישום'),
      textBlock('יש לבחור שם לחברה ולרשום אותה ברשם החברות. התהליך כולל הגשת תקנון, מינוי דירקטורים ותשלום אגרה.'),
      h3Block('2. פתיחת תיקים ברשויות'),
      bulletBlock('פתיחת תיק במס הכנסה'),
      bulletBlock('פתיחת תיק ניכויים'),
      bulletBlock('רישום במע"מ'),
      bulletBlock('פתיחת תיק בביטוח לאומי'),
      h3Block('3. פתיחת חשבון בנק'),
      textBlock('לאחר קבלת תעודת ההתאגדות, יש לפתוח חשבון בנק על שם החברה. מומלץ להפריד לחלוטין בין חשבון החברה לחשבון האישי.'),
      h2Block('תכנון מס מהיום הראשון'),
      textBlock('תכנון מס נכון בשלב ההקמה חוסך כסף רב בהמשך. כדאי להתייעץ עם רואה חשבון לפני ההקמה כדי לבחור את המבנה המשפטי והמיסויי האופטימלי.'),
    ],
  },
  {
    _id: 'article-vat-smb',
    _type: 'article',
    title: 'ניהול מע"מ לעסקים קטנים ובינוניים',
    slug: { _type: 'slug', current: 'vat-for-small-businesses' },
    excerpt: 'טיפים פרקטיים לניהול חשבוניות, דיווחים תקופתיים וזכויות לניכוי מע"מ תשומות.',
    publishedAt: '2025-03-10',
    author: { _type: 'reference', _ref: 'author-avi' },
    category: { _type: 'reference', _ref: 'cat-vat' },
    tags: [
      { _type: 'reference', _ref: 'tag-freelancers', _key: 't1' },
      { _type: 'reference', _ref: 'tag-reporting', _key: 't2' },
      { _type: 'reference', _ref: 'tag-guide', _key: 't3' },
    ],
    body: [
      h2Block('מה זה מע"מ?'),
      textBlock('מס ערך מוסף (מע"מ) הוא מס עקיף בשיעור 17% המוטל על מכירת סחורות ושירותים. עוסקים מורשים גובים מע"מ מלקוחותיהם ומעבירים אותו לרשויות, כשהם מקזזים את המע"מ ששילמו על תשומותיהם.'),
      h2Block('עוסק מורשה מול עוסק פטור'),
      textBlock('עוסק פטור הוא מי שמחזור עסקאותיו השנתי נמוך מהתקרה הקבועה בחוק. עוסק פטור אינו גובה מע"מ מלקוחותיו, אך גם אינו יכול לקזז מע"מ תשומות. עוסק מורשה חייב בגביית מע"מ ובדיווח תקופתי.'),
      h2Block('דיווח תקופתי'),
      textBlock('עוסקים מורשים נדרשים להגיש דוח מע"מ (טופס 874) כל חודש או חודשיים, בהתאם למחזור. הדוח כולל את סכום העסקאות וסכום התשומות, וההפרש הוא המע"מ לתשלום או להחזר.'),
      h2Block('טיפים לניהול מע"מ חכם'),
      bulletBlock('שמרו על כל חשבוניות המס — קבלות רגילות אינן מספיקות לניכוי תשומות'),
      bulletBlock('דווחו בזמן כדי להימנע מקנסות והצמדה'),
      bulletBlock('בדקו אם אתם זכאים למע"מ אפס על שירותים לתושבי חוץ'),
      bulletBlock('שקלו מעבר מעוסק פטור למורשה אם המחזור עולה'),
    ],
  },
  {
    _id: 'article-national-insurance',
    _type: 'article',
    title: 'ביטוח לאומי לעצמאים — מה חשוב לדעת',
    slug: { _type: 'slug', current: 'national-insurance-freelancers' },
    excerpt: 'שיעורי הביטוח הלאומי, הטבות, פטורים וכיצד לתכנן את התשלומים בצורה חכמה.',
    publishedAt: '2025-04-05',
    author: { _type: 'reference', _ref: 'author-ron' },
    category: { _type: 'reference', _ref: 'cat-national-insurance' },
    tags: [
      { _type: 'reference', _ref: 'tag-freelancers', _key: 't1' },
      { _type: 'reference', _ref: 'tag-planning', _key: 't2' },
    ],
    body: [
      h2Block('חובת תשלום ביטוח לאומי'),
      textBlock('כל עצמאי בישראל חייב בתשלום דמי ביטוח לאומי ודמי ביטוח בריאות. שיעור התשלום נקבע לפי גובה ההכנסה ומחושב בשני מדרגות.'),
      h2Block('שיעורי הביטוח'),
      textBlock('על חלק ההכנסה שעד 60% מהשכר הממוצע — השיעור המופחת הוא כ-5.97%. על חלק ההכנסה שמעל 60% ועד התקרה — השיעור המלא הוא כ-17.83% (כולל ביטוח בריאות).'),
      h2Block('מקדמות ושומה'),
      textBlock('הביטוח הלאומי גובה מקדמות חודשיות על בסיס השומה האחרונה. חשוב לעדכן את המקדמות כשמתחילים — אחרת ייתכנו הפרשי שומה משמעותיים.'),
      h2Block('הטבות וזכויות'),
      bulletBlock('דמי לידה ושמירת הריון'),
      bulletBlock('דמי אבטלה (בתנאים מסוימים)'),
      bulletBlock('קצבת נכות כללית'),
      bulletBlock('קצבת זקנה'),
      bulletBlock('מילואים — פיצוי מלא'),
    ],
  },
  {
    _id: 'article-payroll-rights',
    _type: 'article',
    title: 'זכויות עובדים — מדריך למעסיקים',
    slug: { _type: 'slug', current: 'employee-rights-guide' },
    excerpt: 'סקירה של זכויות העובדים העיקריות שכל מעסיק חייב להכיר: חופשה, מחלה, פנסיה ועוד.',
    publishedAt: '2025-05-12',
    author: { _type: 'reference', _ref: 'author-avi' },
    category: { _type: 'reference', _ref: 'cat-payroll' },
    tags: [
      { _type: 'reference', _ref: 'tag-employees', _key: 't1' },
      { _type: 'reference', _ref: 'tag-guide', _key: 't2' },
    ],
    body: [
      h2Block('חובת הפרשה לפנסיה'),
      textBlock('כל מעסיק חייב להפריש לפנסיה עבור עובדיו. שיעור ההפרשה הנוכחי הוא 6.5% על חשבון המעסיק ו-6% על חשבון העובד, בתוספת 6% פיצויים.'),
      h2Block('ימי חופשה שנתית'),
      textBlock('עובד זכאי לימי חופשה שנתית בהתאם לוותק. בשנה הראשונה — 12 ימי חופשה (כולל שבתות). מספר הימים עולה עם הוותק, עד 28 ימים לאחר 14 שנות עבודה.'),
      h2Block('ימי מחלה'),
      textBlock('עובד צובר 1.5 ימי מחלה לכל חודש עבודה, עד מקסימום 90 ימים. היום הראשון — ללא תשלום, הימים 2-3 — 50% שכר, מהיום הרביעי — שכר מלא.'),
      h2Block('זכויות נוספות'),
      bulletBlock('דמי הבראה — לפי ותק ותעריף מעודכן'),
      bulletBlock('דמי נסיעות — עד תקרת החזר חודשית'),
      bulletBlock('חופשת לידה — 26 שבועות (15 בתשלום)'),
      bulletBlock('הודעה מוקדמת — לפי ותק העובד'),
    ],
  },
  {
    _id: 'article-international-tax',
    _type: 'article',
    title: 'מיסוי בינלאומי — מה כל בעל עסק צריך לדעת',
    slug: { _type: 'slug', current: 'international-tax-basics' },
    excerpt: 'אמנות למניעת כפל מס, חובות דיווח על הכנסות מחו"ל, ותכנון מס בינלאומי.',
    publishedAt: '2025-06-18',
    author: { _type: 'reference', _ref: 'author-ron' },
    category: { _type: 'reference', _ref: 'cat-income-tax' },
    tags: [
      { _type: 'reference', _ref: 'tag-intl', _key: 't1' },
      { _type: 'reference', _ref: 'tag-companies', _key: 't2' },
      { _type: 'reference', _ref: 'tag-planning', _key: 't3' },
    ],
    body: [
      h2Block('עקרון המיסוי הפרסונלי'),
      textBlock('ישראל ממסה את תושביה על הכנסותיהם ממקור בישראל ומחוץ לישראל כאחד. המשמעות: אם אתם תושבי ישראל, כל הכנסה שלכם — גם מחו"ל — חייבת בדיווח.'),
      h2Block('אמנות למניעת כפל מס'),
      textBlock('לישראל אמנות מס עם למעלה מ-50 מדינות. אמנות אלו קובעות באיזו מדינה ימוסו סוגי הכנסה שונים, ומונעות מצב שבו אותה הכנסה ממוסה פעמיים.'),
      h2Block('חובות דיווח'),
      bulletBlock('טופס 150 — הצהרת הון (כולל נכסים בחו"ל)'),
      bulletBlock('טופס 1135 — פירוט הכנסות מחו"ל'),
      bulletBlock('דיווח FATCA — לבעלי חשבונות בארה"ב'),
      bulletBlock('דיווח CRS — חילופי מידע אוטומטיים'),
      h2Block('תכנון מס בינלאומי'),
      textBlock('תכנון מס בינלאומי נכון יכול לחסוך סכומים משמעותיים. חשוב לעבוד עם רואה חשבון המתמחה בתחום כדי לנצל אמנות מס, זיכויים ופטורים הקיימים בחוק.'),
    ],
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

  const allDocs = [
    ...authors,
    ...tags,
    ...categories,
    ...services,
    ...faqs,
    ...testimonials,
    ...articles,
    siteSettings,
  ]

  const transaction = client.transaction()
  for (const doc of allDocs) {
    transaction.createOrReplace(doc)
  }

  const result = await transaction.commit()
  console.log(`✅  Seeded ${allDocs.length} documents.`)
  console.log(`    Transaction ID: ${result.transactionId}\n`)

  console.log('   Authors:       ', authors.map((a) => a.name).join(', '))
  console.log('   Tags:          ', tags.map((t) => t.title).join(', '))
  console.log('   Categories:    ', categories.map((c) => c.title).join(', '))
  console.log('   Services:      ', services.map((s) => s.title).join(', '))
  console.log('   FAQs:          ', faqs.length)
  console.log('   Testimonials:  ', testimonials.length)
  console.log('   Articles:      ', articles.map((a) => a.title).join(', '))
  console.log('   SiteSettings:  ', siteSettings.siteName)
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})
