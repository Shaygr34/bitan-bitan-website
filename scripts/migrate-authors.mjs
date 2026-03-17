/**
 * Migration script: copy singular `author` → `authors[0]` for all articles.
 * Safe to run multiple times — skips articles that already have authors populated.
 *
 * Usage: node scripts/migrate-authors.mjs
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
  const articles = await client.fetch(`*[_type == "article" && defined(author) && (!defined(authors) || length(authors) == 0)]{
    _id,
    title,
    author
  }`)

  console.log(`Found ${articles.length} articles to migrate`)

  if (articles.length === 0) {
    console.log('Nothing to migrate — all articles already have authors populated.')
    return
  }

  let success = 0
  let failed = 0

  for (const article of articles) {
    try {
      await client
        .patch(article._id)
        .set({
          authors: [{ _type: 'reference', _ref: article.author._ref, _key: article.author._ref.slice(0, 12) }],
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
