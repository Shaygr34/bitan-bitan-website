#!/usr/bin/env node
/**
 * Article Image Generator for Bitan & Bitan website.
 * Generates branded illustrations using Google Gemini, then uploads to Sanity CDN.
 *
 * Usage:
 *   node scripts/generate-article-images.mjs                     # Generate images only
 *   node scripts/generate-article-images.mjs --upload             # Generate + upload to Sanity
 *   node scripts/generate-article-images.mjs --upload-only        # Upload already-generated images
 *   node scripts/generate-article-images.mjs --clear              # Delete all article mainImages from Sanity
 *   node scripts/generate-article-images.mjs --clear --upload     # Clear old, generate new, upload
 *
 * Env vars:
 *   GOOGLE_AI_API_KEY  — Google AI Studio API key
 *   SANITY_API_TOKEN   — Sanity write token
 */

import { GoogleGenAI } from '@google/genai'
import { writeFileSync, readFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── Config ──────────────────────────────────────────────────────────────────
const SANITY_PROJECT_ID = 'ul4uwnp7'
const SANITY_DATASET = 'production'
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || ''
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || ''

const MODEL = 'gemini-3.1-flash-image-preview'
const OUTPUT_DIR = resolve(ROOT, 'generated-images', 'nano-banana')
const DELAY_MS = 3000
const RATE_LIMIT_BACKOFF_MS = 60000

// ── Category-specific visual elements ───────────────────────────────────────
const CATEGORY_VISUALS = {
  'real-estate-tax': 'buildings, property outlines, house silhouettes, land plots, keys, property deeds',
  'tax-planning': 'calendar pages, planning charts, timeline arrows, strategy diagrams, chess pieces',
  'corporate-tax': 'office towers, corporate buildings, boardroom table, business charts, pie graphs',
  'employee-tax': 'payroll documents, office workspace items, salary slips, employment contracts',
  'vat': 'receipt rolls, cash register, shopping bags, invoice documents, barcode scanners',
  'tax-credits': 'coins flowing, credit cards, money returning arrows, piggy bank, savings jar',
  'wealth-declaration': 'balance scales, asset icons, property + car + bank symbols, vault door',
  'legislation-updates': 'gavel, law books, parliament building, newspaper headlines, legal scrolls',
  'bookkeeping': 'ledger books, calculator, spreadsheet grids, organized filing cabinets, abacus',
  'grants': 'hands receiving, gift box, government building, upward arrows, growth seedlings',
  'tax-refunds': 'money returning, refund arrows, coins flowing back, wallet with bills',
  'severance-pay': 'handshake, employment contract, calculator, coins stacking, briefcase',
  'mortgage': 'house with key, bank building, loan documents, percentage symbols, family home',
}
const DEFAULT_VISUALS = 'documents, calculator, pen, coins, abstract geometric financial shapes'

// ── Sanity API helpers ──────────────────────────────────────────────────────
const sanityHeaders = () => ({
  Authorization: `Bearer ${SANITY_API_TOKEN}`,
  'Content-Type': 'application/json',
})

async function sanityQuery(query) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  const resp = await fetch(url, { headers: sanityHeaders() })
  if (!resp.ok) throw new Error(`Sanity query failed: ${resp.status} ${await resp.text()}`)
  const data = await resp.json()
  return data.result
}

async function sanityMutate(mutations) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: sanityHeaders(),
    body: JSON.stringify({ mutations }),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Sanity mutate failed: ${resp.status} ${text.slice(0, 300)}`)
  }
  return resp.json()
}

async function uploadToSanity(imagePath, filename) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${SANITY_DATASET}?filename=${filename}`
  const imageData = readFileSync(imagePath)
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_API_TOKEN}`,
      'Content-Type': 'image/png',
    },
    body: imageData,
  })
  if (!resp.ok) {
    const text = await resp.text()
    console.error(`  Upload failed (${resp.status}): ${text.slice(0, 200)}`)
    return null
  }
  const data = await resp.json()
  return data.document?._id || null
}

// ── Image generation ────────────────────────────────────────────────────────
function buildPrompt(title, catSlug) {
  const visuals = CATEGORY_VISUALS[catSlug] || DEFAULT_VISUALS
  return `Professional financial illustration for a Hebrew CPA firm website. Clean, modern isometric style with rich depth, dimension and detailed textures. Color palette: deep navy blue (#102040) dominant, gold (#C5A572) accents and highlights, white and light elements for contrast. Topic: ${title}. Include: ${visuals}. Wide format 16:9. Premium, corporate, trustworthy aesthetic. No photographs, no people, no text, no letters, no words in any language. Detailed, layered composition with subtle shadows and depth.`
}

async function generateImage(ai, prompt, slug) {
  const outputPath = resolve(OUTPUT_DIR, `${slug}.png`)

  // Skip if already generated
  if (existsSync(outputPath) && statSync(outputPath).size > 10000) {
    return outputPath
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseModalities: ['image'],
      },
    })

    const parts = response.candidates?.[0]?.content?.parts
    if (!parts) {
      console.error('  No parts in response')
      return null
    }

    for (const part of parts) {
      if (part.inlineData) {
        const imageBuffer = Buffer.from(part.inlineData.data, 'base64')
        writeFileSync(outputPath, imageBuffer)
        return outputPath
      }
    }

    console.error('  No image data in response parts')
    return null
  } catch (err) {
    if (err.status === 429 || err.message?.includes('429')) {
      console.log(`  Rate limited. Waiting ${RATE_LIMIT_BACKOFF_MS / 1000}s...`)
      await sleep(RATE_LIMIT_BACKOFF_MS)
      // Retry once
      try {
        const response = await ai.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: { responseModalities: ['image'] },
        })
        const parts = response.candidates?.[0]?.content?.parts
        for (const part of parts || []) {
          if (part.inlineData) {
            writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'))
            return outputPath
          }
        }
      } catch (retryErr) {
        console.error(`  Retry failed: ${retryErr.message}`)
        return null
      }
    }
    console.error(`  Error: ${err.message}`)
    return null
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const doUpload = args.includes('--upload')
  const uploadOnly = args.includes('--upload-only')
  const doClear = args.includes('--clear')

  if (!SANITY_API_TOKEN) {
    console.error('ERROR: SANITY_API_TOKEN env var not set')
    process.exit(1)
  }
  if (!uploadOnly && !doClear && !GOOGLE_AI_API_KEY) {
    console.error('ERROR: GOOGLE_AI_API_KEY env var not set')
    process.exit(1)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })

  // ── Phase 0: Clear existing images ──────────────────────────────────────
  if (doClear) {
    console.log('='.repeat(60))
    console.log('PHASE 0: Clearing existing article mainImages from Sanity')
    console.log('='.repeat(60))

    const articlesWithImages = await sanityQuery(
      '*[_type == "article" && defined(mainImage)]{ _id, title, "assetRef": mainImage.asset._ref }'
    )
    console.log(`Found ${articlesWithImages.length} articles with mainImage.\n`)

    let cleared = 0
    for (const article of articlesWithImages) {
      process.stdout.write(`  Clearing: ${article._id}...`)
      try {
        // Unset mainImage from article
        await sanityMutate([{ patch: { id: article._id, unset: ['mainImage'] } }])

        // Delete the image asset if we have a ref
        if (article.assetRef) {
          try {
            await sanityMutate([{ delete: { id: article.assetRef } }])
          } catch {
            // Asset might be referenced elsewhere, skip silently
          }
        }
        console.log(' done')
        cleared++
      } catch (err) {
        console.log(` failed: ${err.message}`)
      }
      await sleep(300)
    }
    console.log(`\nCleared ${cleared}/${articlesWithImages.length} articles.\n`)
  }

  // Fetch all articles for generation/upload
  console.log('Fetching all articles from Sanity...')
  const allArticles = await sanityQuery(
    '*[_type == "article"] | order(publishedAt desc){ _id, title, slug, "catSlug": category->slug.current, "hasImage": defined(mainImage) }'
  )
  console.log(`Found ${allArticles.length} articles total.\n`)

  // For generation: target articles without images (or all if just cleared)
  const targetArticles = doClear
    ? allArticles
    : allArticles.filter((a) => !a.hasImage)

  if (!uploadOnly && targetArticles.length === 0 && !doClear) {
    console.log('All articles already have images! Use --clear to regenerate.')
    return
  }

  // ── Phase 1: Generate images ────────────────────────────────────────────
  if (!uploadOnly) {
    const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

    console.log('='.repeat(60))
    console.log(`PHASE 1: Generating images with Gemini (${MODEL})`)
    console.log('='.repeat(60))

    let generated = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < targetArticles.length; i++) {
      const article = targetArticles[i]
      const slug = article.slug.current
      const title = article.title
      const catSlug = article.catSlug
      const outputPath = resolve(OUTPUT_DIR, `${slug}.png`)

      if (existsSync(outputPath) && statSync(outputPath).size > 10000) {
        console.log(`[${i + 1}/${targetArticles.length}] SKIP (exists): ${slug}`)
        skipped++
        continue
      }

      console.log(`[${i + 1}/${targetArticles.length}] Generating: ${slug}`)
      console.log(`  Title: ${title}`)
      console.log(`  Category: ${catSlug || 'none'}`)

      const prompt = buildPrompt(title, catSlug)
      const result = await generateImage(ai, prompt, slug)

      if (result) {
        const sizeKb = statSync(result).size / 1024
        console.log(`  Saved: ${slug}.png (${sizeKb.toFixed(0)} KB)`)
        generated++
      } else {
        console.log('  FAILED to generate')
        failed++
      }

      if (i < targetArticles.length - 1) {
        await sleep(DELAY_MS)
      }
    }

    console.log(`\nGeneration complete: ${generated} new, ${skipped} skipped, ${failed} failed`)
  }

  // ── Phase 2: Upload to Sanity ───────────────────────────────────────────
  if (doUpload || uploadOnly) {
    const uploadTargets = uploadOnly ? allArticles.filter((a) => !a.hasImage) : targetArticles

    console.log('\n' + '='.repeat(60))
    console.log('PHASE 2: Uploading to Sanity + patching articles')
    console.log('='.repeat(60))

    let uploaded = 0
    let uploadFailed = 0

    for (let i = 0; i < uploadTargets.length; i++) {
      const article = uploadTargets[i]
      const slug = article.slug.current
      const imagePath = resolve(OUTPUT_DIR, `${slug}.png`)

      if (!existsSync(imagePath)) {
        console.log(`[${i + 1}/${uploadTargets.length}] NO IMAGE: ${slug}`)
        uploadFailed++
        continue
      }

      console.log(`[${i + 1}/${uploadTargets.length}] Uploading: ${slug}`)

      const assetId = await uploadToSanity(imagePath, `${slug}.png`)
      if (!assetId) {
        uploadFailed++
        continue
      }
      console.log(`  Asset ID: ${assetId}`)

      try {
        await sanityMutate([
          {
            patch: {
              id: article._id,
              set: {
                mainImage: {
                  _type: 'image',
                  asset: { _type: 'reference', _ref: assetId },
                  hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
                  alt: article.title,
                },
              },
            },
          },
        ])
        console.log(`  Patched: ${article._id}`)
        uploaded++
      } catch (err) {
        console.log(`  Patch failed: ${err.message}`)
        uploadFailed++
      }

      await sleep(500)
    }

    console.log(`\nUpload complete: ${uploaded} patched, ${uploadFailed} failed`)
  }

  console.log('\nDone!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
