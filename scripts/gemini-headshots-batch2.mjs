#!/usr/bin/env node
/**
 * Generate polished headshots from transparent cutouts using Gemini.
 * Usage: GOOGLE_AI_API_KEY=xxx node scripts/gemini-headshots-batch2.mjs
 */

import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync } from 'fs'

const API_KEY = process.env.GOOGLE_AI_API_KEY
if (!API_KEY) { console.error('GOOGLE_AI_API_KEY not set'); process.exit(1) }

const ai = new GoogleGenAI({ apiKey: API_KEY })

const TRANSPARENT_DIR = '/Users/shay/Library/CloudStorage/GoogleDrive-shaygriever34@gmail.com/Shared drives/Bitan & Bitan/Projects/Website/team pics/transparent'
const FINAL_DIR = '/Users/shay/Library/CloudStorage/GoogleDrive-shaygriever34@gmail.com/Shared drives/Bitan & Bitan/Projects/Website/team pics/final'
const PUBLIC_DIR = '/Users/shay/bitan-bitan-website/public/team'

const PROMPT = `Transform this transparent-background headshot into a polished, professional corporate portrait photo.

Requirements:
- Add a smooth, neutral grey gradient background — medium grey center fading to slightly darker grey edges, like a classic studio backdrop
- Apply subtle, natural studio lighting — soft key light from the upper right, gentle fill light
- Add very subtle warm color correction for healthy, natural skin tones
- Keep the person exactly as they are — do NOT alter facial features, hair, or expression
- Output should look like it was shot in a professional portrait studio
- Square 1:1 crop, the person centered and well-framed with appropriate headroom
- Clean, corporate, premium aesthetic — suitable for a CPA firm website`

const PEOPLE = [
  { name: 'haya', file: 'haya.png' },
  { name: 'meshi', file: 'meshi.png' },
]

async function processHeadshot(person) {
  console.log(`\n── ${person.name} ──`)
  const inputPath = `${TRANSPARENT_DIR}/${person.file}`
  const imageData = readFileSync(inputPath)
  const base64 = imageData.toString('base64')

  console.log('  Sending to Gemini...')
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64,
            },
          },
          { text: PROMPT },
        ],
      },
    ],
    config: {
      responseModalities: ['image', 'text'],
    },
  })

  // Extract image from response
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imgBuffer = Buffer.from(part.inlineData.data, 'base64')

      // Save to final dir
      const finalPath = `${FINAL_DIR}/${person.name}-headshot-final.png`
      writeFileSync(finalPath, imgBuffer)
      console.log(`  Final: ${finalPath} (${(imgBuffer.length / 1024).toFixed(0)}KB)`)

      // Copy to public/team/
      const publicPath = `${PUBLIC_DIR}/${person.name}.png`
      writeFileSync(publicPath, imgBuffer)
      console.log(`  Public: ${publicPath}`)

      return true
    }
  }

  console.log('  WARNING: No image in response')
  if (response.candidates[0].content.parts[0]?.text) {
    console.log('  Text:', response.candidates[0].content.parts[0].text)
  }
  return false
}

async function main() {
  console.log('Gemini Headshot Generator — Batch 2 (haya + meshi)')

  for (const person of PEOPLE) {
    try {
      await processHeadshot(person)
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    }
  }

  console.log('\nDone!')
}

main()
