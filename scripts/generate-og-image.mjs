#!/usr/bin/env node
/**
 * Generate branded OG image (1200x630) for social sharing.
 * Uses sharp with SVG text overlay + embedded Heebo font.
 *
 * Usage: node scripts/generate-og-image.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const WIDTH = 1200
const HEIGHT = 630

// Brand colors
const NAVY = '#102040'
const GOLD = '#C5A572'
const WHITE = '#FFFFFF'

// Load and encode font as base64 for SVG embedding
const fontPath = '/tmp/Heebo.ttf'
const fontBase64 = readFileSync(fontPath).toString('base64')

// Load logo
const logoPath = resolve(ROOT, 'public/logo.png')
const logoBuffer = await sharp(logoPath)
  .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
const logoBase64 = logoBuffer.toString('base64')

// Build SVG overlay with embedded font, logo, line, and text
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

  <!-- Logo -->
  <image
    href="data:image/png;base64,${logoBase64}"
    x="${(WIDTH - 200) / 2}" y="80"
    width="200" height="200"
  />

  <!-- Gold line -->
  <line
    x1="${WIDTH / 2 - 120}" y1="310"
    x2="${WIDTH / 2 + 120}" y2="310"
    stroke="${GOLD}" stroke-width="2"
  />

  <!-- Main title -->
  <text
    x="${WIDTH / 2}" y="380"
    text-anchor="middle"
    font-family="Heebo, sans-serif"
    font-weight="700"
    font-size="42"
    fill="${WHITE}"
    direction="rtl"
  >ביטן את ביטן — רואי חשבון ומשפטנים</text>

  <!-- Subtitle -->
  <text
    x="${WIDTH / 2}" y="440"
    text-anchor="middle"
    font-family="Heebo, sans-serif"
    font-weight="400"
    font-size="28"
    fill="${GOLD}"
    direction="rtl"
  >ייעוץ מס · דוחות כספיים · ליווי עסקי</text>
</svg>`

// Generate final image
const output = resolve(ROOT, 'public/og-image.png')

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: NAVY,
  },
})
  .composite([
    {
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(output)

console.log(`✓ OG image generated: ${output} (${WIDTH}x${HEIGHT})`)
