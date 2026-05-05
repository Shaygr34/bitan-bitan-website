#!/usr/bin/env node
/**
 * Migrate checklist items from plain strings to Portable Text blocks.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/migrate-checklist.mjs
 *   SANITY_API_TOKEN=<token> node scripts/migrate-checklist.mjs --dry-run
 */

import { createClient } from '@sanity/client'
import crypto from 'crypto'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ul4uwnp7'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error('Missing SANITY_API_TOKEN')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

function randomKey() {
  return crypto.randomBytes(6).toString('hex')
}

function stringToBlock(text) {
  return {
    _type: 'block',
    _key: randomKey(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: randomKey(), text, marks: [] }],
  }
}

async function main() {
  const articles = await client.fetch(
    `*[_type == "article" && defined(checklist) && count(checklist) > 0]{_id, title, checklist}`
  )

  console.log(`Found ${articles.length} articles with checklists`)

  for (const article of articles) {
    const needsMigration = article.checklist.some((item) => typeof item === 'string')
    if (!needsMigration) {
      console.log(`  ✓ ${article.title} — already migrated`)
      continue
    }

    const migrated = article.checklist.map((item) =>
      typeof item === 'string' ? stringToBlock(item) : item
    )

    console.log(`  → ${article.title} — ${migrated.length} items`)

    if (!dryRun) {
      await client.patch(article._id).set({ checklist: migrated }).commit()
      console.log(`    ✅ Patched`)
    } else {
      console.log(`    (dry-run, skipped)`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
