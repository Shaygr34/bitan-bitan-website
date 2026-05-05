/**
 * Migration script: copy singular `category` → `categories[0]` for all articles.
 *
 * This preserves existing category assignments when moving from single ref to array.
 * Safe to run multiple times — skips articles that already have categories populated.
 *
 * Usage: node scripts/migrate-categories.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'ul4uwnp7',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function migrate() {
  // Find all articles that have a category but no categories array (or empty)
  const articles = await client.fetch(`*[_type == "article" && defined(category) && (!defined(categories) || length(categories) == 0)]{
    _id,
    title,
    category
  }`)

  console.log(`Found ${articles.length} articles to migrate`)

  if (articles.length === 0) {
    console.log('Nothing to migrate — all articles already have categories populated.')
    return
  }

  let success = 0
  let failed = 0

  for (const article of articles) {
    try {
      await client
        .patch(article._id)
        .set({
          categories: [{ _type: 'reference', _ref: article.category._ref, _key: article.category._ref.slice(0, 12) }],
        })
        .commit()

      console.log(`✓ ${article.title}`)
      success++
    } catch (err) {
      console.error(`✗ ${article.title}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${success} migrated, ${failed} failed`)
}

migrate().catch(console.error)
