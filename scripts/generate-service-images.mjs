/**
 * Generate service header images using Gemini and upload to Sanity.
 * Usage: GOOGLE_AI_API_KEY=xxx node scripts/generate-service-images.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

// Parse .env.local
const envContent = readFileSync('.env.local', 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const API_KEY = process.env.GOOGLE_AI_API_KEY
if (!API_KEY) { console.error('GOOGLE_AI_API_KEY not set'); process.exit(1) }

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

mkdirSync('generated-images', { recursive: true })

const SERVICES = [
  {
    id: 'svc-bookkeeping',
    slug: 'bookkeeping',
    topic: 'bookkeeping and accounting',
    elements: 'ledger books, receipts, organized folders, pen, filing cabinet',
  },
  {
    id: 'svc-financial-statements',
    slug: 'financial-statements',
    topic: 'financial reports and statements',
    elements: 'balance sheet document, pie charts, bar graphs, official stamp',
  },
  {
    id: 'svc-audit',
    slug: 'audit',
    topic: 'financial auditing',
    elements: 'magnifying glass over financial documents, checkmark shield, clipboard',
  },
  {
    id: 'svc-business-advisory',
    slug: 'business-advisory',
    topic: 'business consulting and advisory',
    elements: 'briefcase, growth chart, compass, strategy board',
  },
  {
    id: 'svc-international-tax',
    slug: 'international-tax',
    topic: 'international taxation',
    elements: 'globe, airplane, multiple currency symbols (dollar, euro, shekel), treaty document',
  },
  {
    id: 'svc-payroll',
    slug: 'payroll-services',
    topic: 'payroll and employee benefits',
    elements: 'payslip document, calendar, coins stack, employee badge',
  },
  {
    id: '207d2467-d0ed-475f-b0d7-e795ce5bbfba',
    slug: 'real-estate-tax',
    topic: 'real estate taxation',
    elements: 'building with key, tax document, coins, property deed',
  },
  {
    id: '3bede2bb-3480-4368-8561-b3ee95250bcb',
    slug: 'tax-representation',
    topic: 'tax authority representation and disputes',
    elements: 'scale of justice, official government building, gavel, legal documents',
  },
  {
    id: '55193f50-019d-44c1-ac5a-c7b3cb396a6a',
    slug: 'tax-refunds',
    topic: 'tax refunds and returns',
    elements: 'arrow returning coins, tax form, calculator, refund check',
  },
  {
    id: 'af3b97b3-aff4-4f64-b370-0ea678a07178',
    slug: 'grants',
    topic: 'government grants and state loans',
    elements: 'official government building, money bag, approved stamp, growth plant',
  },
]

async function generateImage(topic, elements) {
  const prompt = `Generate an image: Professional financial illustration for a Hebrew CPA firm. Clean, modern isometric style with rich depth, dimension and detailed textures. Color palette: deep navy blue (#102040) dominant, gold (#C5A572) accents and highlights, white and light elements for contrast. Topic: ${topic}. Include: ${elements}. Wide format 16:9. Premium, corporate, trustworthy aesthetic. No photographs, no people. No text, no labels, no writing, no letters.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0 },
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gemini API ${resp.status}: ${err.slice(0, 300)}`)
  }

  const result = await resp.json()
  const parts = result.candidates?.[0]?.content?.parts ?? []

  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, 'base64')
    }
  }
  throw new Error('No image data in response')
}

async function processService(service, index) {
  const label = `[${index + 1}/10] ${service.slug}`

  console.log(`${label} — generating image...`)
  const imageBuffer = await generateImage(service.topic, service.elements)

  const localPath = `generated-images/service-${service.slug}.png`
  writeFileSync(localPath, imageBuffer)
  console.log(`${label} — saved ${localPath} (${(imageBuffer.length / 1024).toFixed(0)} KB)`)

  console.log(`${label} — uploading to Sanity...`)
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: `service-${service.slug}.png`,
    contentType: 'image/png',
  })

  await client.patch(service.id).set({
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
    },
  }).commit()

  console.log(`${label} — done ✓`)
}

console.log('Starting service image generation (10 services)...\n')

for (let i = 0; i < SERVICES.length; i++) {
  try {
    await processService(SERVICES[i], i)
  } catch (err) {
    console.error(`[${i + 1}/10] ${SERVICES[i].slug} — FAILED: ${err.message}`)
  }
  // Small delay between API calls
  if (i < SERVICES.length - 1) {
    await new Promise(r => setTimeout(r, 2000))
  }
}

console.log('\nAll done!')
