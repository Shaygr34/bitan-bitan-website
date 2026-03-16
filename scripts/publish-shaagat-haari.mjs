#!/usr/bin/env node
/**
 * Publish "שאגת הארי" grants article — OG image generation + Sanity creation.
 *
 * Usage:
 *   node scripts/publish-shaagat-haari.mjs
 *
 * Env vars (from .env.local):
 *   SANITY_API_TOKEN — Sanity write token
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── Config ──────────────────────────────────────────────────────────────────
const SANITY_PROJECT_ID = 'ul4uwnp7'
const SANITY_DATASET = 'production'
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || ''

if (!SANITY_API_TOKEN) {
  console.error('ERROR: SANITY_API_TOKEN env var not set')
  process.exit(1)
}

// ── Brand colors ────────────────────────────────────────────────────────────
const NAVY = '#102040'
const GOLD = '#C5A572'

// ── IDs from Sanity ─────────────────────────────────────────────────────────
const CATEGORY_ID = '20e1c937-92ae-4bfd-aed7-eb8074a8d51c' // מענקים ופיצויים
const AUTHOR_ID = 'author-avi' // אבי ביטן

// ── Sanity helpers ──────────────────────────────────────────────────────────
const sanityHeaders = () => ({
  Authorization: `Bearer ${SANITY_API_TOKEN}`,
  'Content-Type': 'application/json',
})

async function sanityMutate(mutations) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: sanityHeaders(),
    body: JSON.stringify({ mutations }),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Sanity mutate failed: ${resp.status} ${text.slice(0, 500)}`)
  }
  return resp.json()
}

async function uploadImageToSanity(buffer, filename, contentType = 'image/jpeg') {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${SANITY_DATASET}?filename=${filename}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_API_TOKEN}`,
      'Content-Type': contentType,
    },
    body: buffer,
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Upload failed: ${resp.status} ${text.slice(0, 300)}`)
  }
  const data = await resp.json()
  return data.document._id
}

// ── Portable Text helpers ───────────────────────────────────────────────────
let keyCounter = 0
function key() {
  return `k${++keyCounter}`
}

function heading(text, style = 'h2') {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function paragraph(text) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

/** Paragraph with mixed bold/normal spans */
function richParagraph(spans) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: spans.map((s) => ({
      _type: 'span',
      _key: key(),
      text: s.text,
      marks: s.bold ? ['strong'] : [],
    })),
  }
}

function bullet(text, level = 1) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: 'bullet',
    level,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

/** Bullet with mixed bold/normal spans */
function richBullet(spans, level = 1) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: 'bullet',
    level,
    markDefs: [],
    children: spans.map((s) => ({
      _type: 'span',
      _key: key(),
      text: s.text,
      marks: s.bold ? ['strong'] : [],
    })),
  }
}

function blockquote(text) {
  return {
    _type: 'block',
    _key: key(),
    style: 'blockquote',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

// ── Build article body ──────────────────────────────────────────────────────
function buildBody() {
  const body = []

  // Status line (as blockquote for visual prominence)
  body.push(blockquote('עדכון: מרץ 2026 | המתווה פורסם על ידי משרד האוצר, טרם אושר בכנסת נכון לתאריך 15/03/2026 — ייתכנו שינויים.'))

  // Intro
  body.push(paragraph('משרד האוצר פרסם את מתווה הפיצויים לעסקים שנפגעו במבצע "שאגת הארי". המתווה מבוסס על מנגנונים מוכרים ממבצעי "חרבות ברזל" ו"עם כלביא", עם התאמות בתקופות ההשוואה. להלן סקירה מעשית של עיקרי המתווה — מי זכאי, כמה כסף על השולחן, ואיך להיערך.'))

  // ── מי זכאי למענק ──
  body.push(heading('מי זכאי למענק'))
  body.push(paragraph('שני תנאים עיקריים:'))
  body.push(richBullet([
    { text: 'ירידה במחזור: ', bold: true },
    { text: '25% לפחות בין מחזור 03/2025 ל-03/2026 (חד חודשי), או 12.5% בין 3-4/2025 ל-3-4/2026 (דו חודשי).' },
  ]))
  body.push(richBullet([
    { text: 'מחזור שנתי: ', bold: true },
    { text: 'מעל 12,000 ש"ח ועד 400 מיליון ש"ח.' },
  ]))
  body.push(richParagraph([
    { text: 'חובה: ', bold: true },
    { text: 'הגשת דוח מע"מ 03/2026 (חד חודשי) או 03-04/2026 (דו חודשי) לפני הגשת הבקשה.' },
  ]))
  body.push(paragraph('המחזור השנתי לצורך קביעת מסלול הפיצוי נקבע לפי מועד פתיחת העסק: עסקים שפתחו עד סוף 2024 נמדדים לפי מחזור 2025. עסקים חדשים שנפתחו ב-2025 נמדדים לפי תקופות מותאמות (פירוט בהמשך).'))

  // ── מי לא זכאי ──
  body.push(heading('מי לא זכאי'))
  body.push(paragraph('מוסדות פיננסיים, בנקים, חברות ביטוח, חברות ממשלתיות, גופים מתוקצבים, סוחרי מקרקעין (כמלאי עסקי), יהלומנים וחקלאות. כמו כן, עסק שפנקסיו נקבעו כבלתי קבילים ל-2025 או שדיווח על סגירה לפני 12.6.2025.'))

  // ── מענקים לעסקים קטנים ──
  body.push(heading('מענקים לעסקים עד 300,000 ש"ח מחזור שנתי'))
  body.push(paragraph('עסקים קטנים מקבלים מענק בסכום קבוע — ללא צורך בהוכחת הוצאות. הסכום נקבע לפי גובה המחזור ושיעור הירידה:'))

  // Table 1: Small business grants — as structured bullets
  body.push(richParagraph([{ text: 'טבלת סכומי מענק (בש"ח) לפי מחזור שנתי ושיעור ירידה:', bold: true }]))
  body.push(richBullet([
    { text: 'מחזור 12-50 אלף: ', bold: true },
    { text: '1,833 ש"ח (בכל שיעורי הירידה)' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 50-90 אלף: ', bold: true },
    { text: '3,300 ש"ח (בכל שיעורי הירידה)' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 90-120 אלף: ', bold: true },
    { text: '4,400 ש"ח (בכל שיעורי הירידה)' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 120-150 אלף: ', bold: true },
    { text: '2,776 / 4,164 / 6,662 / 8,328 ש"ח (לפי 25%-40% / 40%-60% / 60%-80% / 80%-100%)' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 150-200 אלף: ', bold: true },
    { text: '3,273 / 4,910 / 7,855 / 9,819 ש"ח' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 200-250 אלף: ', bold: true },
    { text: '4,190 / 6,285 / 10,056 / 12,570 ש"ח' },
  ]))
  body.push(richBullet([
    { text: 'מחזור 250-300 אלף: ', bold: true },
    { text: '4,897 / 7,346 / 11,752 / 14,691 ש"ח' },
  ]))
  body.push(paragraph('אחוזי הירידה הם למדווחי חד חודשי.'))

  // ── מענקים מעל 300,000 ──
  body.push(heading('מענקים לעסקים עם מחזור מעל 300,000 ש"ח'))
  body.push(paragraph('המענק מורכב משני רכיבים שמחוברים יחד:'))

  // רכיב א — הוצאות קבועות
  body.push(heading('רכיב א\' — הוצאות קבועות', 'h3'))
  body.push(paragraph('ממוצע ההוצאות/התשומות החודשיות ב-2025 (כפי שדווחו למע"מ) מוכפל במקדם פיצוי:'))

  // Table 2: Compensation coefficients
  body.push(richParagraph([{ text: 'מקדמי פיצוי לפי שיעור ירידה:', bold: true }]))
  body.push(richBullet([
    { text: 'ירידה 25%-40% (חד) / 12.5%-20% (דו): ', bold: true },
    { text: 'מקדם פיצוי 7%' },
  ]))
  body.push(richBullet([
    { text: 'ירידה 40%-60% (חד) / 20%-30% (דו): ', bold: true },
    { text: 'מקדם פיצוי 11%' },
  ]))
  body.push(richBullet([
    { text: 'ירידה 60%-80% (חד) / 30%-40% (דו): ', bold: true },
    { text: 'מקדם פיצוי 15%' },
  ]))
  body.push(richBullet([
    { text: 'ירידה 80%-100% (חד) / 40%-50% (דו): ', bold: true },
    { text: 'מקדם פיצוי 22%' },
  ]))
  body.push(paragraph('ניתן להגדיל את המקדם עד פי 1.5, בתנאי שמוכחות הוצאות קבועות גבוהות מהתחשיב הסטנדרטי.'))

  // רכיב ב — הוצאות שכר
  body.push(heading('רכיב ב\' — הוצאות שכר', 'h3'))
  body.push(paragraph('השכר ששולם בחודש 03/2026 לפי טופס 102, מוכפל ב-1.25 (עלות מעביד), ב-0.75, ובשיעור ירידת המחזורים. יש להפחית שכר עובדים שניצלו חופשה, יצאו לחל"ת, או שהמעסיק קיבל עבורם תקבולי מילואים.'))
  body.push(paragraph('תקרת שכר לעובד: 13,773 ש"ח (השכר הממוצע במשק) × 1.25. עמותות ומלכ"רים: מקדם 1.325.'))

  // תקרות
  body.push(heading('תקרות המענק הכולל', 'h3'))
  body.push(richBullet([
    { text: 'עד 100 מיליון ש"ח מחזור: ', bold: true },
    { text: 'תקרה 600,000 ש"ח.' },
  ]))
  body.push(richBullet([
    { text: '100-300 מיליון: ', bold: true },
    { text: 'תקרה עולה ליניארית עד 1.2 מיליון ש"ח.' },
  ]))
  body.push(richBullet([
    { text: '300-400 מיליון: ', bold: true },
    { text: 'תקרה קבועה של 1.2 מיליון ש"ח.' },
  ]))
  body.push(richParagraph([
    { text: 'הגנת מינימום: ', bold: true },
    { text: 'עסק עם מחזור מעל 300 אלף שתוצאת החישוב נמוכה מהמענק שהיה מקבל כעסק קטן — יקבל את הגבוה מבין השניים.' },
  ]))

  // ── מסלולים מיוחדים ──
  body.push(heading('מסלולים מיוחדים'))

  body.push(heading('עסקים בצפון (מסלול אדום)', 'h3'))
  body.push(paragraph('עסקים הזכאים למסלול אדום עד 04/2025 נמדדים מול תקופות בסיס ב-2023 (ולא 2025), בהכרה בפגיעה ממושכת עקב הפינויים. מחזור בסיס: 03/2023 (חד חודשי) או 03-04/2023 (דו חודשי). תשומות: ממוצע 09/2022 עד 08/2023.'))

  body.push(heading('עסקים על בסיס מזומן', 'h3'))
  body.push(paragraph('עסקים המתחייבים במע"מ בעת קבלת תשלום ושיעור הירידה שלהם במרץ נמוך מ-40% — נמדדים לפי תקופות מוסטות בחודש: 04/2025 מול 04/2026 או לחלופין למדווחים במתכונת דו-חודשי, 5-6/2026 למול 5-6/2025.'))

  body.push(heading('קבלני ביצוע', 'h3'))
  body.push(paragraph('מחזור זכאות: 04/2026. מקדם פיצוי מוכפל ב-0.68. תקופת בסיס: ממוצע 07/2025 עד 02/2026.'))

  body.push(heading('עסקים חדשים (נפתחו מ-01.01.2025)', 'h3'))
  body.push(paragraph('עסקים שנפתחו בינואר-פברואר 2025 — מחזור בסיס מ-1.3.2025 עד 28.2.2026. עסקים שנפתחו מ-1.3.2025 — מתקופת הדיווח העוקבת לראשונה ועד 28.2.2026, בהתאמה שנתית.'))

  // ── פיצוי נזק ישיר ──
  body.push(heading('פיצוי לנפגעי נזק ישיר ולמשכירי דירות'))
  body.push(paragraph('עסקים שמקום העסק ניזוק ולא ניתן להשתמש בו עד 30.4.2026 — זכאים ל-6 חודשי זכאות נוספים, כולל מענק הוצאות מזכות ומענק נוסף בגובה ההכנסה החייבת. בעלי נכסים מושכרים שניזוקו זכאים לפיצוי בגובה שכר הדירה האחרון לאורך תקופת השיקום.'))

  // ── מועדים והליכי הגשה ──
  body.push(heading('מועדים והליכי הגשה'))
  body.push(richBullet([
    { text: 'הגשת בקשה + מסמכים: ', bold: true },
    { text: 'תוך 30 יום ממועד פתיחת ההגשה.' },
  ]))
  body.push(richBullet([
    { text: 'מקדמה ראשונה (60%): ', bold: true },
    { text: 'תוך 21 יום מהגשת הבקשה.' },
  ]))
  body.push(richBullet([
    { text: 'תשלום נוסף (10%): ', bold: true },
    { text: 'לאחר 150 יום, אם לא נקבעה זכאות.' },
  ]))
  body.push(richBullet([
    { text: 'קביעת זכאות סופית: ', bold: true },
    { text: 'תוך 8 חודשים. אם לא נקבעה — הבקשה מתקבלת במלואה.' },
  ]))
  body.push(richBullet([
    { text: 'השגה: ', bold: true },
    { text: 'תוך 90 יום ממכתב ההחלטה. אם לא טופלה תוך 8 חודשים — מתקבלת.' },
  ]))
  body.push(richBullet([
    { text: 'תשלום לאחר אישור: ', bold: true },
    { text: 'תוך 14 יום.' },
  ]))

  // ── מיסוי המענק ──
  body.push(heading('מיסוי המענק — מה חשוב לדעת'))
  body.push(bullet('המענק פטור ממע"מ.'))
  body.push(bullet('חייב בדמי ביטוח לאומי.'))
  body.push(bullet('נחשב הכנסה חייבת לעניין מס הכנסה.'))
  body.push(richBullet([
    { text: 'חשוב: ', bold: true },
    { text: 'יש לוודא פטור מניכוי מס במקור לפני הגשה. ללא פטור — ינוכה 20% באופן אוטומטי.' },
  ]))

  // ── המלצות מעשיות ──
  body.push(heading('מה לעשות עכשיו — המלצות מעשיות'))
  body.push(bullet('לוודא שדוח מע"מ 03/2026 הוגש — תנאי מקדים.'))
  body.push(bullet('לוודא שקיים פטור ניכוי מס במקור ולהסדיר, אם נדרש.'))
  body.push(bullet('לוודא שבוצע דיווח שכר חודש 3/2026 כולל פירוט עובדים שיצאו לחל"ת.'))
  body.push(bullet('למדווחי דו חודשי — לזכור שמועד הגשת המענק הינו לאחר הגשת דוח מע"מ 3-4/2026.'))
  body.push(bullet('למדווחים במתכונת בסיס מזומן, ההגשה הינה לאחר הגשת דוח מע"מ 4/2026 (חד חודשי) או 5-6/2026 (דו-חודשי).'))
  body.push(bullet('לא לחכות: מועד ההגשה מוגבל. רצוי לעקוב אחרי עדכוני המשרד בדבר מלחמת שאגת הארי.'))

  // ── CTA ──
  body.push(richParagraph([
    { text: 'משרד ביטן את ביטן מלווה את לקוחותיו בבדיקת זכאות, חישוב המענק, הגשת הבקשות וייצוג מול רשות המיסים.', bold: true },
  ]))
  body.push(paragraph('לבדיקת זכאות ולהגשת בקשה — צרו קשר:'))
  body.push(richParagraph([
    { text: '03-5174295 | הרכבת 58, מגדל אלקטרה סיטי, תל אביב', bold: true },
  ]))

  return body
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1: Generate OG Image
// ══════════════════════════════════════════════════════════════════════════════
async function generateOgImage() {
  console.log('='.repeat(60))
  console.log('STEP 1: Generating OG image (1200x630)')
  console.log('='.repeat(60))

  const WIDTH = 1200
  const HEIGHT = 630

  // Load Heebo font
  const fontPath = '/tmp/Heebo.ttf'
  if (!existsSync(fontPath)) {
    throw new Error('Heebo font not found at /tmp/Heebo.ttf')
  }
  const fontBase64 = readFileSync(fontPath).toString('base64')

  // Load & resize logo
  const logoPath = resolve(ROOT, 'public/logo-light.png')
  const logoCropped = await sharp(logoPath).trim({ threshold: 10 }).toBuffer()
  const LOGO_WIDTH = 120
  const logoResized = await sharp(logoCropped)
    .resize(LOGO_WIDTH, null, { fit: 'inside' })
    .toBuffer()
  const logoMeta = await sharp(logoResized).metadata()
  const LOGO_HEIGHT = logoMeta.height
  const logoBase64 = logoResized.toString('base64')

  // Logo position: top-right with padding
  const LOGO_X = WIDTH - LOGO_WIDTH - 50
  const LOGO_Y = 40

  // Title position: right-aligned, centered vertically
  const TITLE_Y1 = 210
  const TITLE_Y2 = 280
  const LINE_Y = TITLE_Y2 + 50
  const SUBTITLE_Y = LINE_Y + 45
  const FOOTER_LINE_Y = HEIGHT - 70
  const FOOTER_TEXT_Y = HEIGHT - 38

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <style>
        @font-face {
          font-family: 'Heebo';
          src: url(data:font/truetype;base64,${fontBase64});
          font-weight: 100 900;
        }
      </style>
    </defs>

    <!-- Logo top-right -->
    <image
      href="data:image/png;base64,${logoBase64}"
      x="${LOGO_X}" y="${LOGO_Y}"
      width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}"
    />

    <!-- Title line 1 -->
    <text
      x="${WIDTH - 60}" y="${TITLE_Y1}"
      text-anchor="end"
      font-family="Heebo, sans-serif"
      font-weight="700"
      font-size="58"
      fill="white"
    >מענקים לעסקים</text>

    <!-- Title line 2 -->
    <text
      x="${WIDTH - 60}" y="${TITLE_Y2}"
      text-anchor="end"
      font-family="Heebo, sans-serif"
      font-weight="700"
      font-size="58"
      fill="white"
    >במבצע שאגת הארי</text>

    <!-- Gold accent line -->
    <line
      x1="${WIDTH - 60}" y1="${LINE_Y}"
      x2="${WIDTH - 260}" y2="${LINE_Y}"
      stroke="${GOLD}" stroke-width="3"
    />

    <!-- Subtitle -->
    <text
      x="${WIDTH - 60}" y="${SUBTITLE_Y}"
      text-anchor="end"
      font-family="Heebo, sans-serif"
      font-weight="400"
      font-size="26"
      fill="${GOLD}"
    >מרץ 2026 | חוזר מקצועי</text>

    <!-- Bottom gold line -->
    <line
      x1="40" y1="${FOOTER_LINE_Y}"
      x2="${WIDTH - 40}" y2="${FOOTER_LINE_Y}"
      stroke="${GOLD}" stroke-width="1" opacity="0.5"
    />

    <!-- Footer text -->
    <text
      x="${WIDTH / 2}" y="${FOOTER_TEXT_Y}"
      text-anchor="middle"
      font-family="Heebo, sans-serif"
      font-weight="400"
      font-size="18"
      fill="white"
      opacity="0.7"
    >bitancpa.com | ביטן את ביטן — רואי חשבון</text>
  </svg>`

  // Generate image
  const outputPath = resolve(ROOT, 'public/og/shaagat-haari-2026.jpg')
  const imageBuffer = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: NAVY,
    },
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer()

  // Save locally
  const { writeFileSync: writeFile } = await import('fs')
  writeFile(outputPath, imageBuffer)
  console.log(`✓ OG image saved: ${outputPath}`)

  return imageBuffer
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2: Upload image + Create article + Publish
// ══════════════════════════════════════════════════════════════════════════════
async function createAndPublishArticle(imageBuffer) {
  console.log('\n' + '='.repeat(60))
  console.log('STEP 2: Uploading image to Sanity')
  console.log('='.repeat(60))

  const assetId = await uploadImageToSanity(imageBuffer, 'shaagat-haari-2026.jpg')
  console.log(`✓ Image uploaded: ${assetId}`)

  console.log('\n' + '='.repeat(60))
  console.log('STEP 3: Creating article document')
  console.log('='.repeat(60))

  const body = buildBody()
  console.log(`  Body blocks: ${body.length}`)

  const article = {
    _type: 'article',
    title: 'מענקים לעסקים במבצע "שאגת הארי" — מי זכאי, כמה מקבלים, ואיך מגישים',
    slug: { _type: 'slug', current: 'business-grants-operation-shaagat-haari-2026' },
    category: { _type: 'reference', _ref: CATEGORY_ID },
    author: { _type: 'reference', _ref: AUTHOR_ID },
    publishedAt: new Date().toISOString(),
    contentType: 'circular',
    excerpt: 'מדריך מקצועי למענקי ההמשכיות העסקית במבצע שאגת הארי: תנאי זכאות, טבלאות סכומים, נוסחת חישוב ומועדי הגשה.',
    mainImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: 'מענקים לעסקים במבצע שאגת הארי 2026 — חוזר מקצועי',
    },
    seoTitle: 'מענקים לעסקים במבצע שאגת הארי 2026 — תנאי זכאות, סכומים ומועדים | ביטן את ביטן',
    seoDescription: 'מדריך מקצועי למענקי ההמשכיות העסקית במבצע שאגת הארי: מי זכאי, כמה מקבלים, איך מחשבים ומתי מגישים. ביטן את ביטן, רואי חשבון.',
    difficulty: 'intermediate',
    tldr: 'משרד האוצר פרסם מתווה פיצויים לעסקים שנפגעו במבצע שאגת הארי. עסקים עם ירידה של 25% ומעלה במחזור זכאים למענקים — עד 600 אלף ש"ח לעסקים בינוניים ועד 1.2 מיליון לגדולים. חובה להגיש דוח מע"מ 03/2026 לפני הגשת הבקשה.',
    checklist: [
      'לוודא שדוח מע"מ 03/2026 הוגש — תנאי מקדים',
      'לוודא שקיים פטור ניכוי מס במקור ולהסדיר אם נדרש',
      'לוודא שבוצע דיווח שכר חודש 3/2026 כולל פירוט חל"ת',
      'למדווחי דו חודשי — ההגשה לאחר דוח מע"מ 3-4/2026',
      'לא לחכות — מועד ההגשה מוגבל',
    ],
    disclaimer: 'המידע במאמר זה אינו מהווה תחליף לייעוץ מקצועי פרטני. המתווה טרם אושר בכנסת וייתכנו שינויים בנוסח הסופי. יש לפנות לרואה חשבון לבחינת המקרה הספציפי.',
    body,
  }

  const result = await sanityMutate([{ create: article }])
  const docId = result.results?.[0]?.id
  console.log(`✓ Article created: ${docId}`)

  // Publish
  console.log('\n' + '='.repeat(60))
  console.log('STEP 4: Publishing article')
  console.log('='.repeat(60))

  await sanityMutate([
    {
      patch: {
        id: docId,
        // Move from draft to published by removing the drafts. prefix
        ifRevisionID: result.results[0].document?._rev,
      },
    },
  ])

  // Actually, to publish we need to create the published version directly
  // The create mutation creates a draft (drafts.xxx). We need to publish it.
  // Sanity HTTP API: create a document with the non-draft ID
  const publishResult = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`,
    {
      method: 'POST',
      headers: sanityHeaders(),
      body: JSON.stringify({
        mutations: [
          {
            patch: {
              id: `drafts.${docId}`,
              set: { _id: docId },
            },
          },
        ],
      }),
    }
  )

  // Alternative approach: use the publish action
  const publishActionResult = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/actions/${SANITY_DATASET}`,
    {
      method: 'POST',
      headers: sanityHeaders(),
      body: JSON.stringify({
        actions: [
          {
            actionType: 'sanity.action.document.publish',
            draftId: `drafts.${docId}`,
            publishedId: docId,
          },
        ],
      }),
    }
  )

  if (publishActionResult.ok) {
    console.log(`✓ Article published!`)
  } else {
    const text = await publishActionResult.text()
    console.log(`⚠ Publish action response: ${text.slice(0, 300)}`)
    console.log('  You may need to publish manually from Sanity Studio.')
  }

  console.log(`\n✓ Article ID: ${docId}`)
  console.log(`✓ URL: https://bitancpa.com/knowledge/business-grants-operation-shaagat-haari-2026`)

  return docId
}

// ══════════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('Publishing שאגת הארי article...\n')

  const imageBuffer = await generateOgImage()
  const docId = await createAndPublishArticle(imageBuffer)

  console.log('\n' + '='.repeat(60))
  console.log('DONE!')
  console.log('='.repeat(60))
  console.log(`Article ID: ${docId}`)
  console.log(`Live URL: https://bitancpa.com/knowledge/business-grants-operation-shaagat-haari-2026`)
  console.log('\nNext steps:')
  console.log('  1. Verify the article renders at the URL above')
  console.log('  2. Check OG image at public/og/shaagat-haari-2026.jpg')
  console.log('  3. Send newsletter linking to this article')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
