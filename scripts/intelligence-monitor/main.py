#!/usr/bin/env python3
"""
Bitan & Bitan — Professional Intelligence Monitor (Phase 1)
Runs daily via GitHub Actions.

Sources:
  1. Deloitte Israel tax alerts (interpreted circulars)
  2. Tax Authority Telegram channel (official updates)
  3. Globes RSS (tax/regulatory news)

Pipeline:
  1. Scan all sources for items
  2. Compare against previously seen items in Sanity
  3. If new items found → send digest email via Resend
  4. Store new items in Sanity (intelligenceItem docs)
"""

import os
import sys
import json
import hashlib
from datetime import datetime

import requests

from sources import deloitte, telegram, globes

# ── Config ──────────────────────────────────────────────────────────────

SANITY_PROJECT_ID = "ul4uwnp7"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2024-01-01"

SANITY_TOKEN = os.environ.get("SANITY_API_WRITE_TOKEN", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
REPORT_RECIPIENTS = os.environ.get("REPORT_RECIPIENTS", "").split(",")
REPORT_FROM = os.environ.get(
    "REPORT_FROM", "ביטן את ביטן - מודיעין <reports@bitancpa.com>"
)


# ── Sanity ──────────────────────────────────────────────────────────────

def sanity_query(groq):
    url = "https://{}.api.sanity.io/v{}/data/query/{}".format(
        SANITY_PROJECT_ID, SANITY_API_VERSION, SANITY_DATASET
    )
    headers = {"Authorization": "Bearer {}".format(SANITY_TOKEN)}
    resp = requests.get(url, headers=headers, params={"query": groq})
    resp.raise_for_status()
    return resp.json().get("result")


def sanity_mutate(mutations):
    url = "https://{}.api.sanity.io/v{}/data/mutate/{}".format(
        SANITY_PROJECT_ID, SANITY_API_VERSION, SANITY_DATASET
    )
    headers = {
        "Authorization": "Bearer {}".format(SANITY_TOKEN),
        "Content-Type": "application/json",
    }
    resp = requests.post(url, headers=headers, json={"mutations": mutations})
    resp.raise_for_status()
    return resp.json()


def get_seen_item_ids():
    """Get IDs of all existing intelligence items (last 90 days)."""
    result = sanity_query(
        '*[_type == "intelligenceItem"]._id'
    )
    return set(result or [])


def item_to_doc_id(item):
    """Generate a deterministic Sanity doc ID from an item."""
    # Hash the URL (or title if no URL) for a stable, ASCII-safe ID
    key = item.get("url") or item.get("title", "")
    h = hashlib.md5(key.encode("utf-8")).hexdigest()[:16]
    return "intel-{}-{}".format(item["source"], h)


def write_items(items):
    """Write new intelligence items to Sanity."""
    mutations = []
    for item in items:
        doc_id = item_to_doc_id(item)
        doc = {
            "_id": doc_id,
            "_type": "intelligenceItem",
            "source": item["source"],
            "sourceLabel": item["sourceLabel"],
            "title": item["title"],
            "url": item.get("url", ""),
            "itemType": item.get("itemType", ""),
            "detectedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "dataJson": json.dumps(item, ensure_ascii=False),
        }
        mutations.append({"createIfNotExists": doc})

    if mutations:
        # Batch in groups of 50 to avoid request size limits
        for i in range(0, len(mutations), 50):
            batch = mutations[i:i + 50]
            sanity_mutate(batch)

    return len(mutations)


# ── Digest Email ────────────────────────────────────────────────────────

def fmt_date_he():
    now = datetime.now()
    return "{:02d}.{:02d}.{}".format(now.day, now.month, str(now.year)[2:])


def generate_digest_email(new_items):
    """Generate Hebrew RTL digest email with new items grouped by source."""

    # Group by source
    by_source = {}
    for item in new_items:
        src = item["sourceLabel"]
        if src not in by_source:
            by_source[src] = []
        by_source[src].append(item)

    # Source icons
    source_icons = {
        "deloitte": "📋",
        "tax_authority_telegram": "📢",
        "globes": "📰",
    }

    sections_html = ""
    for source_label, items in by_source.items():
        icon = source_icons.get(items[0]["source"], "📌")

        items_html = ""
        for item in items[:10]:  # Max 10 per source
            title = item["title"]
            if len(title) > 100:
                title = "..." + title[:97]
            url = item.get("url", "")

            # Item type badge
            type_labels = {
                "tax_alert": "חוזר מקצועי",
                "official_update": "עדכון רשמי",
                "news": "חדשות",
            }
            badge = type_labels.get(item.get("itemType", ""), "עדכון")

            link_html = '<a href="{}" style="color:#102040;text-decoration:none;font-weight:600;">{}</a>'.format(
                url, title
            ) if url else '<span style="font-weight:600;color:#102040;">{}</span>'.format(title)

            # Show preview text for Telegram messages
            preview = ""
            metadata = item.get("metadata", {})
            if item["source"] == "tax_authority_telegram" and metadata.get("fullText"):
                full_text = metadata["fullText"]
                if len(full_text) > 150:
                    full_text = full_text[:147] + "..."
                preview = '<div style="font-size:12px;color:#666;margin-top:4px;">{}</div>'.format(full_text)

            items_html += """
            <tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
                <div style="margin-bottom:2px;">
                    <span style="background:#e8e0d0;color:#8a7040;padding:1px 6px;border-radius:3px;font-size:10px;">{badge}</span>
                </div>
                <div style="font-size:14px;line-height:1.5;">{link}</div>
                {preview}
            </td></tr>""".format(badge=badge, link=link_html, preview=preview)

        sections_html += """
        <tr><td style="padding:16px 32px 8px;">
            <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">
                {icon} {source} ({count})
            </h3>
            <table dir="rtl" width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #eee;border-radius:4px;direction:rtl;">
            {items}
            </table>
        </td></tr>""".format(
            icon=icon,
            source=source_label,
            count=len(items),
            items=items_html,
        )

    html = """<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body dir="rtl" style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
<table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;direction:rtl;">
<tr><td align="center">
<table dir="rtl" width="600" cellpadding="0" cellspacing="0"
       style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);direction:rtl;">

<!-- Header -->
<tr><td style="background:#102040;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#C5A572;font-size:20px;font-weight:700;">עדכון מקצועי יומי</h1>
    <p style="margin:6px 0 0;color:#fff;font-size:13px;opacity:0.85;">ביטן את ביטן — רואי חשבון</p>
    <p style="margin:4px 0 0;color:#C5A572;font-size:12px;">{date}</p>
</td></tr>

<!-- Summary -->
<tr><td dir="rtl" style="padding:16px 32px 0;text-align:right;direction:rtl;">
    <p style="font-size:13px;color:#444;margin:0;">
        נמצאו <strong>{total} עדכונים חדשים</strong> מ-{source_count} מקורות.
    </p>
</td></tr>

{sections}

<!-- Footer -->
<tr><td style="background:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee;margin-top:16px;">
    <p style="margin:0;font-size:11px;color:#999;">עדכון אוטומטי — מודיעין מקצועי bitancpa.com</p>
    <p style="margin:4px 0 0;font-size:11px;color:#999;">מקורות: Deloitte Israel · רשות המיסים (טלגרם) · Globes</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>""".format(
        date=fmt_date_he(),
        total=len(new_items),
        source_count=len(by_source),
        sections=sections_html,
    )

    return html


# ── Email ───────────────────────────────────────────────────────────────

def send_email(html, subject, recipients):
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": "Bearer {}".format(RESEND_API_KEY),
            "Content-Type": "application/json",
        },
        json={
            "from": REPORT_FROM,
            "to": [r.strip() for r in recipients if r.strip()],
            "subject": subject,
            "html": html,
        },
    )
    if resp.status_code >= 400:
        print("Resend error: {} {}".format(resp.status_code, resp.text))
        resp.raise_for_status()
    result = resp.json()
    print("Email sent: {}".format(result.get("id", "unknown")))
    return result


# ── Main ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Bitan & Bitan — Professional Intelligence Monitor")
    print("Date: {}".format(datetime.now().strftime("%Y-%m-%d %H:%M")))
    print("=" * 60)

    if not SANITY_TOKEN:
        sys.exit("SANITY_API_WRITE_TOKEN not set")
    if not RESEND_API_KEY:
        sys.exit("RESEND_API_KEY not set")
    if not any(r.strip() for r in REPORT_RECIPIENTS):
        sys.exit("REPORT_RECIPIENTS not set")

    # 1. Get previously seen items
    print("\nLoading seen items from Sanity...")
    seen_ids = get_seen_item_ids()
    print("  {} items already tracked".format(len(seen_ids)))

    # 2. Scan all sources
    all_items = []

    print("\n[1/3] Scanning Deloitte Israel tax alerts...")
    try:
        deloitte_items = deloitte.scan()
        all_items.extend(deloitte_items)
        print("  → {} items".format(len(deloitte_items)))
    except Exception as e:
        print("  ERROR: {}".format(e))

    print("\n[2/3] Scanning Tax Authority Telegram...")
    try:
        telegram_items = telegram.scan()
        all_items.extend(telegram_items)
        print("  → {} items".format(len(telegram_items)))
    except Exception as e:
        print("  ERROR: {}".format(e))

    print("\n[3/3] Scanning Globes RSS feeds...")
    try:
        globes_items = globes.scan()
        all_items.extend(globes_items)
        print("  → {} items".format(len(globes_items)))
    except Exception as e:
        print("  ERROR: {}".format(e))

    print("\nTotal items scanned: {}".format(len(all_items)))

    # 3. Filter to new items only
    new_items = []
    for item in all_items:
        doc_id = item_to_doc_id(item)
        if doc_id not in seen_ids:
            new_items.append(item)

    print("New items (not previously seen): {}".format(len(new_items)))

    if not new_items:
        print("\nNo new items today. No email sent.")
        print("=" * 60)
        return

    # 4. Write new items to Sanity
    print("\nWriting {} new items to Sanity...".format(len(new_items)))
    written = write_items(new_items)
    print("  Wrote {} documents".format(written))

    # 5. Send digest email
    print("\nGenerating digest email...")
    html = generate_digest_email(new_items)

    subject = "עדכון מקצועי — {} פריטים חדשים — {}".format(
        len(new_items), fmt_date_he()
    )
    print("Sending to: {}".format(
        ", ".join(r.strip() for r in REPORT_RECIPIENTS if r.strip())
    ))
    send_email(html, subject, REPORT_RECIPIENTS)

    # 6. Print summary
    print("\n" + "=" * 60)
    print("Summary:")
    for item in new_items[:10]:
        print("  [{}] {}".format(item["sourceLabel"], item["title"][:60]))
    if len(new_items) > 10:
        print("  ... and {} more".format(len(new_items) - 10))
    print("=" * 60)


if __name__ == "__main__":
    main()
