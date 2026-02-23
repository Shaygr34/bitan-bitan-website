# M10 Runbook — SEO + Analytics + Performance

## Environment Variables

### `NEXT_PUBLIC_GA4_ID` (required for analytics)

Set this in Railway (or your hosting provider) to enable Google Analytics 4.

```
NEXT_PUBLIC_GA4_ID=G-9FW8BN7143
```

When not set, the GA4 script simply does not render — no errors.

### `NEXT_PUBLIC_SITE_URL` (optional, recommended for production)

Controls the canonical URL base and sitemap links.

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.co.il
```

**Priority:**
1. `NEXT_PUBLIC_SITE_URL` if set
2. `RAILWAY_PUBLIC_DOMAIN` (auto-injected by Railway) → `https://{domain}`
3. `http://localhost:3000` (local dev fallback)

**When connecting a custom domain:** set `NEXT_PUBLIC_SITE_URL` to your production URL so that canonical tags and sitemap entries point to the right domain.

---

## Validating SEO

### robots.txt

Visit: `{YOUR_URL}/robots.txt`

Expected output:
```
User-Agent: *
Allow: /
Disallow: /studio
Disallow: /studio/
Disallow: /api/

Sitemap: {YOUR_URL}/sitemap.xml
```

### sitemap.xml

Visit: `{YOUR_URL}/sitemap.xml`

Should include:
- All static pages (/, /about, /services, /knowledge, /faq, /contact, /privacy, /terms)
- All knowledge article slugs from Sanity (`/knowledge/{slug}`)

### Structured Data (JSON-LD)

Use [Google Rich Results Test](https://search.google.com/test/rich-results) or view page source.

- **Every page:** `AccountingService` organization schema (in root layout)
- **`/faq`:** `FAQPage` schema with all Q&A pairs
- **`/knowledge/{slug}`:** `Article` schema with headline, author, date, image

### Page Metadata

Every page should have:
- Unique `<title>` following template: `{Page Title} | ביטן את ביטן`
- `<meta name="description">` in Hebrew
- OG tags (`og:title`, `og:description`, `og:locale=he_IL`)
- `<link rel="canonical">` pointing to the clean URL
- Twitter card: `summary_large_image`

---

## Verifying GA4 Events

### Setup

1. Open GA4 → Realtime → Events
2. Visit the staging or production site in another tab

### Events to verify

| Event | Trigger | Parameters |
|---|---|---|
| `whatsapp_click` | Click any WhatsApp CTA/link | `page_path`, `location_label` (header_sticky, footer, cta) |
| `phone_click` | Click any phone CTA/link | `page_path`, `location_label` |
| `form_submit` | Submit the contact form successfully | `page_path` |
| `faq_expand` | Expand any FAQ accordion item | `question`, `page_path` |
| `service_click` | *(wired but no dedicated service detail pages yet)* | `service_title` |
| `article_click` | *(wired in analytics.ts, ready for use)* | `article_title` |

### Quick test

1. Go to `/contact` → click WhatsApp button → check Realtime for `whatsapp_click`
2. Go to `/faq` → expand an item → check for `faq_expand`
3. Go to footer → click phone number → check for `phone_click`

Events are debounced (500ms) to prevent double-firing on fast clicks.

---

## Performance Notes

- All Sanity images now use `next/image` with `fill` layout and responsive `sizes`
- Images lazy-load by default (except hero/article images marked `priority`)
- Google Maps iframe on `/contact` uses `loading="lazy"`
- Framer Motion is loaded only in client components that need animation
- No changes to existing code splitting; all pages use ISR (5-minute revalidation)

---

## File Map (M10 additions)

| File | Purpose |
|---|---|
| `src/lib/site-url.ts` | Single source of truth for base URL |
| `src/lib/analytics.ts` | Centralized GA4 event helpers |
| `src/components/GoogleAnalytics.tsx` | GA4 script loader (next/script) |
| `src/components/JsonLd.tsx` | Reusable JSON-LD renderer |
| `src/app/robots.ts` | robots.txt generation |
| `src/app/sitemap.ts` | sitemap.xml generation (static + dynamic) |
| `docs/M10-RUNBOOK.md` | This file |
