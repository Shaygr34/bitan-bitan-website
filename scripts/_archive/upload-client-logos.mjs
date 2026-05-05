/**
 * Upload logo images to Sanity and patch clientLogo documents.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/upload-client-logos.mjs
 *   SANITY_API_TOKEN=<token> node scripts/upload-client-logos.mjs --dry-run
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import path from 'path'

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')

const client = createClient({
  projectId: 'ul4uwnp7',
  dataset: 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Map: local file → Sanity document ID
const LOGO_MAP = [
  { file: 'beit-hanna.svg',   docId: 'ff4f33fa-6544-437c-835e-4409ab2d97bd', name: 'בית חנה' },
  { file: 'sela.svg',         docId: 'd41a9685-6fd8-4469-a4b2-7f7860798168', name: 'א.י.ל. סלע' },
  { file: 'tapuz.png',        docId: 'fa0eafab-5f5e-4a53-99ed-a7c35f9473f7', name: 'TAPUZ' },
  { file: 'alchemist-new.png', docId: 'faf31544-7d10-45ca-a9ab-536e168aa61d', name: 'The Alchemist' },
]

const LOGOS_DIR = path.resolve('public/logos')

const MIME_TYPES = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

async function run() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Uploading ${LOGO_MAP.length} logos to Sanity...\n`)

  for (const { file, docId, name } of LOGO_MAP) {
    const filePath = path.join(LOGOS_DIR, file)
    const ext = path.extname(file).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    console.log(`→ ${name} (${file})`)

    if (dryRun) {
      console.log(`  Would upload ${filePath} and patch ${docId}\n`)
      continue
    }

    try {
      // Upload image asset to Sanity
      const imageAsset = await client.assets.upload('image', readFileSync(filePath), {
        filename: file,
        contentType,
      })

      console.log(`  Uploaded → ${imageAsset._id}`)

      // Patch the clientLogo document with the image reference
      await client.patch(docId).set({
        logo: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        },
      }).commit()

      console.log(`  Patched ${docId} ✓\n`)
    } catch (err) {
      console.error(`  ERROR: ${err.message}\n`)
    }
  }

  console.log('Done.')
}

run()
