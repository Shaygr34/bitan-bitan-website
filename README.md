# ביטן את ביטן — אתר משרד רואי חשבון

Next.js 15 + Sanity CMS website for Bitan & Bitan CPAs.

## Tech Stack

- **Framework:** Next.js 15 (App Router, standalone output)
- **CMS:** Sanity v3 (embedded Studio at `/studio`)
- **Styling:** Tailwind CSS + custom design tokens
- **Language:** TypeScript, Hebrew-first UI (RTL)
- **Deployment:** Railway (Docker)

## Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | `ul4uwnp7` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version | `2024-01-01` |
| `SANITY_API_TOKEN` | Write-access token (for seed script & server mutations) | *(secret)* |

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Generate a token at: sanity.io/manage → project ul4uwnp7 → API → Tokens → Add API Token (Editor role).

## Local Development

```bash
npm install
npm run dev
```

- **Site:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio

## Sanity Studio

The Sanity Studio is embedded in the Next.js app at `/studio` (no separate project needed).

### CORS Origins

For the Studio to work on deployed URLs, add CORS origins in your Sanity project:

1. Go to sanity.io/manage → project ul4uwnp7 → API → CORS Origins
2. Add your deployed URL (e.g. `https://your-app.up.railway.app`) with **Allow credentials** checked
3. `http://localhost:3000` should already be there for local dev

### Content Schemas (9 types)

| Schema | Hebrew Title | Description |
|---|---|---|
| `article` | מאמר | Blog articles with rich text, SEO fields |
| `guide` | מדריך | In-depth guides and tutorials |
| `category` | קטגוריה | Content categories (Income Tax, VAT, etc.) |
| `tag` | תגית | Lightweight tags for articles/guides |
| `service` | שירות | Business service offerings |
| `author` | כותב | Content authors |
| `faq` | שאלה נפוצה | Frequently asked questions |
| `siteSettings` | הגדרות האתר | Global settings (phone, address, hours) |
| `testimonial` | המלצה | Client testimonials |

All schema names are in English. All field titles/labels and editor UI are in Hebrew.

## Seed Content

Populate the CMS with initial data (2 authors, 5 categories, 7 services, site settings):

```bash
SANITY_API_TOKEN=<your-write-token> npm run seed
```

The script is idempotent — re-running it updates existing documents rather than creating duplicates.

### Seed data includes

- **Authors:** אבי ביטן, רון ביטן
- **Categories:** מס הכנסה, מע"מ, ביטוח לאומי, חברות, שכר
- **Services:** ייעוץ מס, הנהלת חשבונות, דוחות כספיים, ביקורת חשבונות, ליווי עסקי, מיסוי בינלאומי, שכר ותנאים סוציאליים
- **Site Settings:** site name, phone, WhatsApp (+972527221111), email, address, office hours

## Deployment (Railway)

The app deploys via Docker. Railway env vars needed:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ul4uwnp7
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

These are passed as Docker build args in the Dockerfile. The app runs on port 8080.