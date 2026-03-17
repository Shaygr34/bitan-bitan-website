/**
 * Recovery script: Scrape חרבות ברזל articles from Wayback Machine,
 * extract content, create Sanity articles, and generate images.
 *
 * Usage:
 *   SANITY_API_TOKEN=... node scripts/recover-iron-swords.mjs
 *   SANITY_API_TOKEN=... GOOGLE_AI_API_KEY=... node scripts/recover-iron-swords.mjs --with-images
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'ul4uwnp7',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const WAYBACK_PAGES = [
  {
    timestamp: '20231129053605',
    wpSlug: 'מענק-חרבות-ברזל',
    slug: 'iron-swords-business-grant',
    title: 'מענק החזר הוצאות לעסקים — חרבות ברזל',
    categorySlug: 'tax-benefits',
    imagePrompt: 'Professional illustration of Israeli business financial aid concept, government building with Israeli flag, stack of official documents with stamps, calculator and coins, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129062623',
    wpSlug: 'מענק-חברה-חרבות-ברזל',
    slug: 'iron-swords-company-grant',
    title: 'מענק חרבות ברזל לחברות בע"מ',
    categorySlug: 'companies',
    imagePrompt: 'Professional illustration of corporate building with Israeli flag, briefcase with official seal, corporate entity documents, financial charts showing recovery, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129062703',
    wpSlug: 'מענק-עוסק-מורשה-חרבות-ברזל',
    slug: 'iron-swords-licensed-dealer-grant',
    title: 'מענק חרבות ברזל לעוסק מורשה',
    categorySlug: 'self-employed',
    imagePrompt: 'Professional illustration of small business owner at desk with official documents, Israeli tax authority seal, invoice book and receipts, warm office setting, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129052005',
    wpSlug: 'מענק-עוסק-פטור-חרבות-ברזל',
    slug: 'iron-swords-exempt-dealer-grant',
    title: 'מענק חרבות ברזל לעוסק פטור',
    categorySlug: 'self-employed',
    imagePrompt: 'Professional illustration of micro business concept, simple shop front with official government aid envelope, small business tools, supportive hands motif, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129043624',
    wpSlug: 'מענק-עוסק-פטור-שהפך-למורשה-חרבות-ברזל',
    slug: 'iron-swords-exempt-to-licensed-grant',
    title: 'מענק חרבות ברזל לעוסק פטור שהפך למורשה',
    categorySlug: 'self-employed',
    imagePrompt: 'Professional illustration of business growth transition concept, small shop transforming into larger establishment, ascending steps with official documents, progression arrows, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129052932',
    wpSlug: 'מענק-שכר-עבודה-חרבות-ברזל',
    slug: 'iron-swords-salary-grant',
    title: 'מענק השתתפות בשכר עבודה — חרבות ברזל',
    categorySlug: 'payroll',
    imagePrompt: 'Professional illustration of employer and employees concept, payroll documents with protective shield, group of worker silhouettes, salary calculation symbols, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20240222204248',
    wpSlug: 'מענק-עובדים-עם-ילד-מתחת-לגיל-14-חרבות-ברז',
    slug: 'iron-swords-parents-young-children-grant',
    title: 'מענק לעובדים עם ילד מתחת לגיל 14 — חרבות ברזל',
    categorySlug: 'payroll',
    imagePrompt: 'Professional illustration of family and work balance concept, parent figure with child silhouette, workplace and home imagery, protective umbrella motif, warm supportive colors, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20240226005932',
    wpSlug: 'אבטלה-עצמאי-ושכיר-ביטוח-לאומי-חרבות-בר',
    slug: 'iron-swords-unemployment-self-employed-salaried',
    title: 'דמי אבטלה לעצמאי ושכיר — ביטוח לאומי חרבות ברזל',
    categorySlug: 'national-insurance',
    imagePrompt: 'Professional illustration of unemployment insurance concept, safety net beneath worker figures, National Insurance Institute building silhouette, protective financial shield, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20240222181737',
    wpSlug: 'אבטלה-שכיר-ביטוח-לאומי-חרבות-ברזל',
    slug: 'iron-swords-unemployment-salaried',
    title: 'דמי אבטלה לשכיר — ביטוח לאומי חרבות ברזל',
    categorySlug: 'national-insurance',
    imagePrompt: 'Professional illustration of employee unemployment benefits, office worker with safety cushion concept, government support envelope, institutional building, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
  {
    timestamp: '20231129045622',
    wpSlug: 'פיצוי-החזר-הוצאות-מענק-חרבות-ברזל-סכום',
    slug: 'iron-swords-compensation-amounts',
    title: 'פיצוי והחזר הוצאות — סכומי מענק חרבות ברזל',
    categorySlug: 'tax-benefits',
    imagePrompt: 'Professional illustration of financial compensation calculation, stacked coins in ascending order, official government stamp, calculator with financial tables concept, golden accents, deep navy blue background (#102040), clean corporate style, NO text NO letters NO numbers NO Hebrew',
  },
]

/** Fetch a Wayback snapshot and extract Hebrew text content */
async function scrapeWayback(timestamp, wpSlug) {
  const encodedSlug = encodeURIComponent(wpSlug)
  const url = `https://web.archive.org/web/${timestamp}/https://www.bitancpa.com/${encodedSlug}/`
  console.log(`  Fetching: ${url}`)

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) {
    console.log(`  ⚠ HTTP ${res.status}`)
    return null
  }
  const html = await res.text()

  // Extract Hebrew text blocks (content between tags, >50 chars, contains Hebrew)
  const textBlocks = []
  const matches = html.matchAll(/>([^<]{30,})</g)
  for (const m of matches) {
    const text = m[1].trim()
      .replace(/&#8221;/g, '"')
      .replace(/&#8220;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8217;/g, "'")
      .replace(/&#160;/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#8243;/g, '"')
      .trim()

    // Must contain Hebrew
    if (/[\u0590-\u05FF]/.test(text) && text.length > 20) {
      // Skip navigation/menu items
      if (text.includes('תפריט') && text.includes('אודות')) continue
      if (text.includes('כל הזכויות שמורות')) continue
      if (text.includes('WhatsApp')) continue
      textBlocks.push(text)
    }
  }

  return textBlocks
}

/** Convert text blocks to Portable Text blocks */
function textToPortableText(blocks) {
  // Skip the first block if it's just the page title
  const contentBlocks = blocks.filter(b => b.length > 30)

  return contentBlocks.map((text, i) => {
    // Detect headers (short blocks that look like section titles)
    const isHeader = text.length < 100 && (
      text.endsWith(':') ||
      text.startsWith('מה ') ||
      text.startsWith('מי ') ||
      text.startsWith('איך ') ||
      text.startsWith('א.') ||
      text.startsWith('ב.') ||
      /^[\u0590-\u05FF\s]{5,60}$/.test(text)
    )

    if (isHeader && text.length < 80) {
      return {
        _type: 'block',
        _key: `h${i}`,
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
      }
    }

    return {
      _type: 'block',
      _key: `b${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
    }
  })
}

/** Find category ID by slug */
async function getCategoryId(slug) {
  const cats = await client.fetch(`*[_type == "category" && slug.current == $slug][0]{ _id }`, { slug })
  return cats?._id || null
}

/** Find default author */
async function getDefaultAuthor() {
  const author = await client.fetch(`*[_type == "author"][0]{ _id }`)
  return author?._id || null
}

async function main() {
  const withImages = process.argv.includes('--with-images')

  console.log('=== חרבות ברזל Article Recovery ===\n')

  // Get default author
  const authorId = await getDefaultAuthor()
  console.log(`Default author: ${authorId}\n`)

  // Cache category lookups
  const categoryCache = {}

  let created = 0
  let skipped = 0
  let failed = 0

  for (const page of WAYBACK_PAGES) {
    console.log(`\n[${page.slug}] ${page.title}`)

    // Check if already exists
    const existing = await client.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug: page.slug }
    )
    if (existing) {
      console.log('  → Already exists, skipping')
      skipped++
      continue
    }

    // Scrape from Wayback
    const textBlocks = await scrapeWayback(page.timestamp, page.wpSlug)
    if (!textBlocks || textBlocks.length === 0) {
      console.log('  ✗ No content extracted')
      failed++
      continue
    }
    console.log(`  Extracted ${textBlocks.length} text blocks`)

    // Get category
    if (!categoryCache[page.categorySlug]) {
      categoryCache[page.categorySlug] = await getCategoryId(page.categorySlug)
    }
    const categoryId = categoryCache[page.categorySlug]

    // Build Portable Text body
    const body = textToPortableText(textBlocks)

    // Build excerpt from first substantive paragraph
    const firstParagraph = textBlocks.find(b => b.length > 50 && b.length < 300)
    const excerpt = firstParagraph
      ? firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '')
      : page.title

    // Create document
    const doc = {
      _type: 'article',
      title: page.title,
      slug: { _type: 'slug', current: page.slug },
      body,
      excerpt,
      publishedAt: new Date(`2023-11-01T12:00:00Z`).toISOString(),
      contentType: 'article',
      difficulty: 'intermediate',
      disclaimer: 'המידע במאמר זה מבוסס על חקיקת חירום ותקנות שהותקנו בעקבות מלחמת חרבות ברזל. ייתכנו שינויים ועדכונים — מומלץ להתייעץ עם רואה חשבון לפני הגשת בקשה.',
    }

    try {
      const result = await client.create(doc)
      console.log(`  ✓ Created: ${result._id}`)

      // Patch in category + author references
      const patches = {}
      if (categoryId) {
        patches.categories = [{ _type: 'reference', _ref: categoryId, _key: categoryId.slice(0, 12) }]
      }
      if (authorId) {
        patches.authors = [{ _type: 'reference', _ref: authorId, _key: authorId.slice(0, 12) }]
      }
      if (Object.keys(patches).length > 0) {
        await client.patch(result._id).set(patches).commit()
        console.log(`  ✓ Patched references`)
      }

      created++
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
      failed++
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n=== Done: ${created} created, ${skipped} skipped, ${failed} failed ===`)

  // Image generation phase
  if (withImages && process.env.GOOGLE_AI_API_KEY) {
    console.log('\n=== Generating images ===\n')
    await generateImages()
  } else if (withImages) {
    console.log('\n⚠ GOOGLE_AI_API_KEY not set — skipping image generation')
    console.log('Run: GOOGLE_AI_API_KEY=... SANITY_API_TOKEN=... node scripts/recover-iron-swords.mjs --with-images')
  }
}

async function generateImages() {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

  for (const page of WAYBACK_PAGES) {
    const article = await client.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id, title, mainImage }`,
      { slug: page.slug }
    )
    if (!article) continue
    if (article.mainImage) {
      console.log(`[${page.slug}] Already has image, skipping`)
      continue
    }

    console.log(`[${page.slug}] Generating image...`)

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-fast-generate-001',
        prompt: page.imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
        },
      })

      if (!response.generatedImages?.[0]?.image?.imageBytes) {
        console.log(`  ⚠ No image generated`)
        continue
      }

      const imageBytes = response.generatedImages[0].image.imageBytes
      const buffer = Buffer.from(imageBytes, 'base64')

      // Upload to Sanity
      const asset = await client.assets.upload('image', buffer, {
        filename: `${page.slug}.png`,
        contentType: 'image/png',
      })

      // Patch article
      await client.patch(article._id).set({
        mainImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: page.title,
        },
      }).commit()

      console.log(`  ✓ Image uploaded and attached`)
    } catch (err) {
      console.error(`  ✗ Image failed: ${err.message}`)
    }

    // Delay between image generations
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log('\n=== Image generation complete ===')
}

main().catch(console.error)
