/**
 * Seed clientLogo documents in Sanity.
 * Creates text-only entries. Image logos use static files from /logos/ for now.
 *
 * Usage: SANITY_API_TOKEN=<token> node scripts/seed-client-logos.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'ul4uwnp7',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
})

const logos = [
  // Row 1
  { _id: 'clientLogo-beit-hana', companyName: 'בית חנה', subtitle: 'המקום השלישי', row: 1, sortOrder: 1 },
  { _id: 'clientLogo-sela', companyName: 'א.י.ל. סלע', subtitle: 'בנייה ותשתית', row: 1, sortOrder: 2 },
  { _id: 'clientLogo-climax', companyName: 'קליימקס נדל"ן', subtitle: 'השקעות בנדל"ן', row: 1, sortOrder: 3, hasStaticLogo: '/logos/climax.png' },
  { _id: 'clientLogo-citizen', companyName: 'Citizen Cafe TLV', subtitle: 'בית ספר לעברית', row: 1, sortOrder: 4, hasStaticLogo: '/logos/citizen.svg' },
  { _id: 'clientLogo-schlein', companyName: 'קבוצת שליין', subtitle: 'יזום נדל"ן', row: 1, sortOrder: 5, hasStaticLogo: '/logos/schlein.png' },
  { _id: 'clientLogo-oren', companyName: 'אורן שאיבת בטון', subtitle: 'בע"מ', row: 1, sortOrder: 6 },
  { _id: 'clientLogo-zamsh', companyName: 'ZAMSH', subtitle: 'נעלי נשים', row: 1, sortOrder: 7, hasStaticLogo: '/logos/zamsh.svg', logoSize: 'small' },
  { _id: 'clientLogo-superclick', companyName: 'סופר קליק', subtitle: 'רשת סופרמרקטים', row: 1, sortOrder: 8 },
  { _id: 'clientLogo-hemilton', companyName: 'המילטון', subtitle: 'חשמל ואלקטרוניקה', row: 1, sortOrder: 9, hasStaticLogo: '/logos/hemilton.png' },
  { _id: 'clientLogo-singal', companyName: 'סינגל טקסטיל', subtitle: 'בע"מ', row: 1, sortOrder: 10 },
  { _id: 'clientLogo-mozart', companyName: 'מוצארט', subtitle: 'קונדיטוריה ואפל טוב', row: 1, sortOrder: 11, hasStaticLogo: '/logos/mozart.png', logoSize: 'large' },

  // Row 2
  { _id: 'clientLogo-knil', companyName: 'Knil', subtitle: 'Technology', row: 2, sortOrder: 1 },
  { _id: 'clientLogo-barak', companyName: 'ברק אור', subtitle: 'שירותי רכב', row: 2, sortOrder: 2 },
  { _id: 'clientLogo-green-alma', companyName: 'גרין אלמה', subtitle: 'חברה לבנייה', row: 2, sortOrder: 3 },
  { _id: 'clientLogo-electro', companyName: 'אלקטרו סיטי', subtitle: 'חשמל ואלקטרוניקה', row: 2, sortOrder: 4 },
  { _id: 'clientLogo-alchemist', companyName: 'The Alchemist', subtitle: 'TLV', row: 2, sortOrder: 5 },
  { _id: 'clientLogo-tseler', companyName: 'צלר תעופה', subtitle: 'שירותי תעופה', row: 2, sortOrder: 6 },
  { _id: 'clientLogo-wimberg', companyName: 'ווימברג', subtitle: 'יבוא ושיווק', row: 2, sortOrder: 7 },
  { _id: 'clientLogo-hapishpesh', companyName: 'הפשפש', subtitle: 'חנות חיות חברתית', row: 2, sortOrder: 8 },
  { _id: 'clientLogo-esp710', companyName: 'ESP 710', subtitle: 'טכנולוגיה', row: 2, sortOrder: 9 },
  { _id: 'clientLogo-tapuz', companyName: 'TAPUZ', subtitle: 'שירותי אריזה ומשלוח', row: 2, sortOrder: 10 },
]

async function seed() {
  console.log(`Seeding ${logos.length} client logos...`)

  for (const logo of logos) {
    const { hasStaticLogo, ...doc } = logo
    const sanityDoc = {
      _type: 'clientLogo',
      ...doc,
      isActive: true,
      logoSize: doc.logoSize || 'normal',
    }

    try {
      await client.createOrReplace(sanityDoc)
      console.log(`  ✓ ${doc.companyName} (row ${doc.row}, #${doc.sortOrder})`)
    } catch (err) {
      console.error(`  ✗ ${doc.companyName}: ${err.message}`)
    }
  }

  console.log('\nDone! Image logos still use static files from /logos/.')
  console.log('To upload actual logo images to Sanity, use the Studio UI.')
}

seed()
