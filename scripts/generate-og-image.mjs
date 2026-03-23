#!/usr/bin/env node
/**
 * Generate branded OG image (1200x630) for social sharing.
 * Uses the real designer logo on navy background with Heebo subtitle.
 *
 * Usage: node scripts/generate-og-image.mjs
 */

import { readFileSync, existsSync } from 'fs'
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

// Load Heebo font (download first if missing: curl -sL "https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/Heebo%5Bwght%5D.ttf" -o /tmp/Heebo.ttf)
const fontPath = '/tmp/Heebo.ttf'
if (!existsSync(fontPath)) {
  console.error('Heebo font not found at /tmp/Heebo.ttf — download it first')
  process.exit(1)
}
const fontBase64 = readFileSync(fontPath).toString('base64')

// Load the light logo (white/gold text on transparent — designed for dark backgrounds)
const logoSrcPath = resolve(ROOT, 'docs/לוגו/לוגו/logo.png')

// Trim transparent padding
const logoCropped = await sharp(logoSrcPath)
  .trim({ threshold: 10 })
  .toBuffer()

const logoMeta = await sharp(logoCropped).metadata()
console.log(`Logo cropped: ${logoMeta.width}x${logoMeta.height}`)

// Resize logo to ~500px wide for the OG card
const LOGO_WIDTH = 500
const logoResized = await sharp(logoCropped)
  .resize(LOGO_WIDTH, null, { fit: 'inside' })
  .toBuffer()

const logoResizedMeta = await sharp(logoResized).metadata()
const LOGO_HEIGHT = logoResizedMeta.height
console.log(`Logo resized: ${LOGO_WIDTH}x${LOGO_HEIGHT}`)

const logoBase64 = logoResized.toString('base64')

// Position calculations — center the logo vertically in the upper portion
const LOGO_Y = 150
const LINE_Y = LOGO_Y + LOGO_HEIGHT + 40
const TEXT_Y = LINE_Y + 55

// Build SVG overlay with subtitle text
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

  <!-- Real designer logo (light version for dark bg) -->
  <image
    href="data:image/png;base64,${logoBase64}"
    x="${(WIDTH - LOGO_WIDTH) / 2}" y="${LOGO_Y}"
    width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}"
  />

  <!-- Gold line -->
  <line
    x1="${WIDTH / 2 - 160}" y1="${LINE_Y}"
    x2="${WIDTH / 2 + 160}" y2="${LINE_Y}"
    stroke="${GOLD}" stroke-width="2"
  />

  <!-- Subtitle -->
  <text
    x="${WIDTH / 2}" y="${TEXT_Y}"
    text-anchor="middle"
    font-family="Heebo, sans-serif"
    font-weight="400"
    font-size="26"
    fill="${GOLD}"
    direction="rtl"
  >רואי חשבון ומשפטנים · ייעוץ מיסוי · ליווי עסקי</text>
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
