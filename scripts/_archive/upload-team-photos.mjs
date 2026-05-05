#!/usr/bin/env node
/**
 * Upload team headshot photos to Sanity and update teamMember/author documents.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/upload-team-photos.mjs
 *
 * Or with .env.local already set:
 *   node scripts/upload-team-photos.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── Config ──────────────────────────────────────────────────────────────────
const SANITY_PROJECT_ID = 'ul4uwnp7'
const SANITY_DATASET = 'production'
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || ''

if (!SANITY_API_TOKEN) {
  console.error('ERROR: SANITY_API_TOKEN is required')
  process.exit(1)
}

// Map: filename (without .png) → Hebrew name to match in Sanity
const TEAM_MAP = [
  { file: 'avi',    name: 'אבי ביטן',       type: 'author' },
  { file: 'ron',    name: 'רון ביטן',        type: 'author' },
  { file: 'carmit', name: 'כרמית אבשלום',    type: 'teamMember' },
  { file: 'golan',  name: 'גולן קלדרון',     type: 'teamMember' },
  { file: 'guy',    name: 'גיא מחאני',       type: 'teamMember' },
  { file: 'haim',   name: 'חיים שיינגרטן',   type: 'teamMember' },
  { file: 'heli',   name: 'חלי עזוז',        type: 'teamMember' },
  { file: 'itzik',  name: 'איציק ביטן',      type: 'teamMember' },
]

// ── Sanity helpers ──────────────────────────────────────────────────────────
function sanityHeaders() {
  return {
    Authorization: `Bearer ${SANITY_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function sanityQuery(query) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  const resp = await fetch(url, { headers: sanityHeaders() })
  if (!resp.ok) throw new Error(`Query failed: ${resp.status} ${await resp.text()}`)
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
    throw new Error(`Mutate failed: ${resp.status} ${text.slice(0, 300)}`)
  }
  return resp.json()
}

async function uploadImage(imagePath, filename) {
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
    throw new Error(`Upload failed (${resp.status}): ${text.slice(0, 200)}`)
  }
  const data = await resp.json()
  return data.document // full asset document
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching all authors and team members from Sanity...\n')

  const authors = await sanityQuery(`*[_type == "author"]{ _id, name }`)
  const teamMembers = await sanityQuery(`*[_type == "teamMember"]{ _id, name }`)
  const allDocs = [...authors, ...teamMembers]

  console.log(`Found ${authors.length} authors, ${teamMembers.length} team members\n`)

  const results = []

  for (const entry of TEAM_MAP) {
    const imagePath = resolve(ROOT, 'public', 'team', `${entry.file}.png`)
    console.log(`── ${entry.file} (${entry.name}) ──`)

    // Find matching document
    const doc = allDocs.find(d => d.name === entry.name)
    if (!doc) {
      console.log(`  SKIP: No document found for "${entry.name}"\n`)
      results.push({ file: entry.file, name: entry.name, status: 'NOT FOUND' })
      continue
    }
    console.log(`  Document: ${doc._id}`)

    // Upload image
    console.log(`  Uploading ${entry.file}.png...`)
    const asset = await uploadImage(imagePath, `${entry.file}-headshot.png`)
    console.log(`  Asset: ${asset._id}`)

    // Patch document with image reference
    const imageRef = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    }

    await sanityMutate([
      {
        patch: {
          id: doc._id,
          set: { image: imageRef },
        },
      },
    ])
    console.log(`  Patched image field`)

    // Publish: create/overwrite the published doc from the draft
    // For documents that may have drafts, we patch both the draft and published ID
    const publishedId = doc._id.replace(/^drafts\./, '')
    const draftId = `drafts.${publishedId}`

    // Check if draft exists
    const drafts = await sanityQuery(`*[_id == "${draftId}"]{ _id }`)
    if (drafts.length > 0) {
      // Also patch the draft
      await sanityMutate([
        {
          patch: {
            id: draftId,
            set: { image: imageRef },
          },
        },
      ])
      console.log(`  Also patched draft`)
    }

    console.log(`  DONE\n`)
    results.push({ file: entry.file, name: entry.name, docId: doc._id, assetId: asset._id, status: 'OK' })
  }

  // Summary
  console.log('\n═══ RESULTS ═══')
  for (const r of results) {
    const status = r.status === 'OK' ? `✓ ${r.docId} → ${r.assetId}` : `✗ ${r.status}`
    console.log(`  ${r.file.padEnd(8)} ${r.name.padEnd(16)} ${status}`)
  }
  console.log(`\nDone: ${results.filter(r => r.status === 'OK').length}/${TEAM_MAP.length} updated`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
