#!/usr/bin/env python3
"""
Article Image Generator for Bitan & Bitan website.
Generates branded illustrations for articles without mainImage using OpenAI API,
then uploads to Sanity CDN and patches each article.

Usage:
  python3 scripts/generate-article-images.py              # Generate images only
  python3 scripts/generate-article-images.py --upload      # Generate + upload to Sanity
  python3 scripts/generate-article-images.py --upload-only # Upload already-generated images
"""

import os
import sys
import json
import time
import base64
import argparse
import requests
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
SANITY_PROJECT_ID = "ul4uwnp7"
SANITY_DATASET = "production"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

OUTPUT_DIR = Path(__file__).parent.parent / "generated-images"
DELAY_BETWEEN_CALLS = 3  # seconds
RATE_LIMIT_BACKOFF = 60  # seconds

# ── Category-specific visual elements ───────────────────────────────────────
CATEGORY_VISUALS = {
    "real-estate-tax": "buildings, property outlines, house silhouettes, land plots",
    "tax-planning": "calendar pages, planning charts, timeline arrows, strategy diagrams",
    "corporate-tax": "office towers, corporate buildings, boardroom table, business charts",
    "employee-tax": "people silhouettes at desks, payroll documents, office workspace",
    "vat": "receipt rolls, cash register, shopping bags, invoice documents",
    "tax-credits": "coins flowing, credit cards, money returning arrows, piggy bank",
    "wealth-declaration": "balance scales, asset icons, property + car + bank symbols",
    "legislation-updates": "gavel, law books, parliament building, newspaper headlines",
    "bookkeeping": "ledger books, calculator, spreadsheet grids, organized filing",
    "grants": "hands receiving, gift box, government building, upward arrows",
    "tax-refunds": "money returning, refund arrows, coins flowing back, happy wallet",
}
DEFAULT_VISUALS = "documents, calculator, pen, abstract geometric shapes"


def fetch_articles_without_images():
    """Fetch all articles from Sanity that don't have a mainImage."""
    query = '*[_type == "article" && !defined(mainImage)]{ _id, title, slug, "catSlug": category->slug.current }'
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{SANITY_DATASET}"
    params = {"query": query}
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}

    resp = requests.get(url, params=params, headers=headers)
    resp.raise_for_status()
    return resp.json()["result"]


def build_prompt(title, cat_slug):
    """Build the image generation prompt for an article."""
    visuals = CATEGORY_VISUALS.get(cat_slug or "", DEFAULT_VISUALS)

    return f"""Create a professional, clean illustration for a financial/tax article.

Theme: "{title}"

Style requirements:
- Color palette: deep navy (#102040) background with gold (#C5A572) accent lines and highlights
- White (#FFFFFF) geometric shapes and icons on the navy background
- Modern, minimalist flat design — NO photorealism, NO people faces, NO clip art
- Clean geometric composition with subtle depth (light shadows, layered shapes)
- Professional and trustworthy feel, suitable for an accounting firm website

Visual elements to include: {visuals}

Layout:
- Landscape orientation (wide format)
- Main visual elements centered or arranged in a balanced composition
- Gold accent lines or borders framing key elements
- Subtle grid or dot pattern in the background for texture
- Leave some breathing room — don't overcrowd

CRITICAL: The image must contain ABSOLUTELY ZERO TEXT. No letters, no words, no sentences, no numbers, no labels, no captions, no headings — in ANY language. This is purely a graphical illustration with shapes, icons, and symbols only.

Also do NOT include:
- Photographs or realistic imagery
- Clip art or cartoon style
- Busy or cluttered compositions"""


def generate_image(prompt, slug):
    """Call OpenAI API to generate an image. Returns path to saved file or None."""
    output_path = OUTPUT_DIR / f"{slug}.png"

    # Skip if already generated
    if output_path.exists() and output_path.stat().st_size > 10000:
        return output_path

    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "n": 1,
        "size": "1536x1024",
        "quality": "low",
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=120)

        if resp.status_code == 429:
            print(f"  Rate limited. Waiting {RATE_LIMIT_BACKOFF}s...")
            time.sleep(RATE_LIMIT_BACKOFF)
            resp = requests.post(url, headers=headers, json=payload, timeout=120)

        resp.raise_for_status()
        data = resp.json()

        # gpt-image-1 returns base64
        if "data" in data and data["data"]:
            item = data["data"][0]
            if "b64_json" in item:
                img_bytes = base64.b64decode(item["b64_json"])
            elif "url" in item:
                img_resp = requests.get(item["url"], timeout=60)
                img_resp.raise_for_status()
                img_bytes = img_resp.content
            else:
                print(f"  Unexpected response format: {list(item.keys())}")
                return None

            output_path.write_bytes(img_bytes)
            return output_path

    except requests.exceptions.RequestException as e:
        print(f"  Error: {e}")
        return None

    return None


def upload_to_sanity(image_path, filename):
    """Upload an image to Sanity CDN. Returns the asset document ID."""
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/{SANITY_DATASET}?filename={filename}"
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}",
        "Content-Type": "image/png",
    }

    with open(image_path, "rb") as f:
        resp = requests.post(url, headers=headers, data=f, timeout=60)

    if resp.status_code == 200:
        doc = resp.json().get("document", {})
        return doc.get("_id")
    else:
        print(f"  Upload failed ({resp.status_code}): {resp.text[:200]}")
        return None


def patch_article_image(article_id, asset_id, alt_text):
    """Patch an article's mainImage field with the uploaded asset."""
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/{SANITY_DATASET}"
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}",
        "Content-Type": "application/json",
    }

    mutations = {
        "mutations": [
            {
                "patch": {
                    "id": article_id,
                    "set": {
                        "mainImage": {
                            "_type": "image",
                            "asset": {
                                "_type": "reference",
                                "_ref": asset_id,
                            },
                            "hotspot": {"x": 0.5, "y": 0.5, "width": 1, "height": 1},
                            "alt": alt_text,
                        }
                    },
                }
            }
        ]
    }

    resp = requests.post(url, headers=headers, json=mutations, timeout=30)
    if resp.status_code == 200:
        return True
    else:
        print(f"  Patch failed ({resp.status_code}): {resp.text[:200]}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate article images for Bitan website")
    parser.add_argument("--upload", action="store_true", help="Generate AND upload to Sanity")
    parser.add_argument("--upload-only", action="store_true", help="Upload already-generated images only")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching articles without mainImage from Sanity...")
    articles = fetch_articles_without_images()
    print(f"Found {len(articles)} articles without images.\n")

    if not articles:
        print("All articles already have images!")
        return

    # ── Phase 1: Generate images ────────────────────────────────────────────
    if not args.upload_only:
        print("=" * 60)
        print("PHASE 1: Generating images with OpenAI")
        print("=" * 60)

        generated = 0
        skipped = 0
        failed = 0

        for i, article in enumerate(articles, 1):
            slug = article["slug"]["current"]
            title = article["title"]
            cat_slug = article.get("catSlug")
            output_path = OUTPUT_DIR / f"{slug}.png"

            if output_path.exists() and output_path.stat().st_size > 10000:
                print(f"[{i}/{len(articles)}] SKIP (exists): {slug}")
                skipped += 1
                continue

            print(f"[{i}/{len(articles)}] Generating: {slug}")
            print(f"  Title: {title}")
            print(f"  Category: {cat_slug or 'none'}")

            prompt = build_prompt(title, cat_slug)
            result = generate_image(prompt, slug)

            if result:
                size_kb = result.stat().st_size / 1024
                print(f"  Saved: {result.name} ({size_kb:.0f} KB)")
                generated += 1
            else:
                print(f"  FAILED to generate")
                failed += 1

            if i < len(articles):
                time.sleep(DELAY_BETWEEN_CALLS)

        print(f"\nGeneration complete: {generated} new, {skipped} skipped, {failed} failed")

    # ── Phase 2: Upload to Sanity ───────────────────────────────────────────
    if args.upload or args.upload_only:
        print("\n" + "=" * 60)
        print("PHASE 2: Uploading to Sanity + patching articles")
        print("=" * 60)

        uploaded = 0
        upload_failed = 0

        for i, article in enumerate(articles, 1):
            slug = article["slug"]["current"]
            article_id = article["_id"]
            title = article["title"]
            image_path = OUTPUT_DIR / f"{slug}.png"

            if not image_path.exists():
                print(f"[{i}/{len(articles)}] NO IMAGE: {slug}")
                upload_failed += 1
                continue

            print(f"[{i}/{len(articles)}] Uploading: {slug}")

            asset_id = upload_to_sanity(image_path, f"{slug}.png")
            if not asset_id:
                upload_failed += 1
                continue

            print(f"  Asset ID: {asset_id}")

            success = patch_article_image(article_id, asset_id, title)
            if success:
                print(f"  Patched article: {article_id}")
                uploaded += 1
            else:
                upload_failed += 1

            time.sleep(0.5)  # gentle rate limit for Sanity API

        print(f"\nUpload complete: {uploaded} patched, {upload_failed} failed")


if __name__ == "__main__":
    main()
