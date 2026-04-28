"""
CapiTax (capitax.co.il) RSS Monitor
אלכסנדר שפירא ושות' — boutique tax law firm.
Publishes professional articles and weekly tax tips.
RSS feed at /rss (windows-1255 encoded).
"""

import xml.etree.ElementTree as ET
from datetime import datetime

import requests

SOURCE_NAME = "capitax"
SOURCE_LABEL = "CapiTax (שפירא ושות')"

RSS_URL = "https://www.capitax.co.il/rss"


def scan():
    """Scan CapiTax RSS feed for new articles. Returns list of items."""
    items = []
    now = datetime.now()

    print("  Checking: {}".format(RSS_URL))
    try:
        resp = requests.get(RSS_URL, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (compatible; BitanCPA-Monitor/1.0)",
        })
        if resp.status_code != 200:
            print("  CapiTax RSS returned status {}".format(resp.status_code))
            return items
    except requests.RequestException as e:
        print("  CapiTax RSS fetch error: {}".format(e))
        return items

    # Feed is windows-1255 encoded — decode properly
    try:
        content = resp.content.decode("windows-1255", errors="replace")
    except (UnicodeDecodeError, LookupError):
        content = resp.text

    try:
        root = ET.fromstring(content)
        channel = root.find("channel")
        if channel is None:
            print("  No channel element in RSS")
            return items

        for item in channel.findall("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_date = (item.findtext("pubDate") or "").strip()

            if not title or len(title) < 5:
                continue

            # Normalize URL to https
            if link.startswith("http://"):
                link = link.replace("http://", "https://", 1)
            # Ensure full URL
            if link and not link.startswith("http"):
                link = "https://www.capitax.co.il" + link

            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": title,
                "url": link,
                "itemType": "tax_alert",
                "detectedAt": now.isoformat(),
                "metadata": {
                    "pubDate": pub_date,
                },
            })

        print("  Found {} items".format(len(items)))

    except ET.ParseError as e:
        print("  CapiTax RSS parse error: {}".format(e))

    return items
