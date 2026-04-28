"""
רונן מיסים אונליין (ronen-missim.co.il) Monitor
הוצאת רונן — major Israeli tax publishing house.
Publishes articles, rulings (פסיקה), legislation, and tax authority updates.
Listing pages are public, full content is paywalled.
Scrapes metadata (title, date, category) for awareness monitoring.
"""

import re
import html as html_module
from datetime import datetime

import requests

SOURCE_NAME = "ronen"
SOURCE_LABEL = "מיסים אונליין (רונן)"

LISTING_URL = "https://www.ronen-missim.co.il/search/documents"
MAX_PAGES = 2  # 12 items/page, ~24 recent items — keep it focused

# Map misimId prefixes to item types
TYPE_MAP = {
    "p": ("פסיקה", "tax_alert"),
    "zm2os": ("פרסום רשות המיסים", "official_update"),
    "zm2hm": ("החלטת מיסוי", "official_update"),
    "lh": ("חקיקה", "official_update"),
    "mm": ("מאמר", "tax_alert"),
}


def classify_item(misim_id):
    """Classify item type based on misimId prefix."""
    for prefix, (label, item_type) in TYPE_MAP.items():
        if misim_id.startswith(prefix):
            return label, item_type
    return "עדכון", "tax_alert"


def scan():
    """Scan Ronen Missim recent documents. Returns list of items."""
    items = []
    now = datetime.now()
    seen_ids = set()

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; BitanCPA-Monitor/1.0)",
        "Accept": "text/html",
    }

    for page in range(1, MAX_PAGES + 1):
        url = "{}?field=recent&page={}".format(LISTING_URL, page)
        print("  Checking page {}: {}".format(page, url))

        try:
            resp = requests.get(url, headers=headers, timeout=30)
            if resp.status_code != 200:
                print("  Page {} returned status {}".format(page, resp.status_code))
                continue
        except requests.RequestException as e:
            print("  Ronen fetch error: {}".format(e))
            continue

        html = resp.text

        # Only match recent document links (search/documents?misimId=...)
        # NOT reference library links (/api/misim/document?misimId=raphael...)
        misim_pattern = re.compile(
            r'href="search/documents\?misimId=([^&"]+)&view=doc">([^<]+)<',
        )

        for match in misim_pattern.finditer(html):
            misim_id = match.group(1).strip()
            title = html_module.unescape(match.group(2).strip())

            if not title or len(title) < 5 or misim_id in seen_ids:
                continue

            seen_ids.add(misim_id)
            category_label, item_type = classify_item(misim_id)

            doc_url = "https://www.ronen-missim.co.il/search/documents?misimId={}&view=doc".format(
                misim_id
            )

            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": title,
                "url": doc_url,
                "itemType": item_type,
                "detectedAt": now.isoformat(),
                "metadata": {
                    "misimId": misim_id,
                    "category": category_label,
                },
            })

    # Fallback: if regex found nothing, try a simpler title extraction
    if not items:
        print("  Primary pattern found 0 items, trying fallback...")
        # Try fetching and looking for any structured content
        try:
            resp = requests.get(
                "{}?field=recent&page=1".format(LISTING_URL),
                headers=headers, timeout=30,
            )
            # Look for title-like patterns in Hebrew
            title_pattern = re.compile(
                r'<(?:h[2-5]|a|span)[^>]*>([^<]{10,120})</(?:h[2-5]|a|span)>',
            )
            for match in title_pattern.finditer(resp.text):
                text = match.group(1).strip()
                # Filter for likely article titles (contains Hebrew)
                if re.search(r'[\u0590-\u05FF]', text) and len(text) > 15:
                    items.append({
                        "source": SOURCE_NAME,
                        "sourceLabel": SOURCE_LABEL,
                        "title": text,
                        "url": LISTING_URL,
                        "itemType": "tax_alert",
                        "detectedAt": now.isoformat(),
                        "metadata": {},
                    })
                    if len(items) >= 15:
                        break
        except Exception:
            pass

    print("  Found {} items".format(len(items)))
    return items
