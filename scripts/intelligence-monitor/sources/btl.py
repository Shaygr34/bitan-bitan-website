"""
ביטוח לאומי (National Insurance) RSS Monitor
Parses the official RSS feed for news/updates.
"""

import xml.etree.ElementTree as ET
from datetime import datetime

import requests

SOURCE_NAME = "btl"
SOURCE_LABEL = "ביטוח לאומי"

RSS_URL = "http://www.btl.gov.il/About/news/_layouts/15/RssPage.aspx?mode=1"


def scan():
    """Scan BTL RSS feed for news items. Returns list of items."""
    items = []
    now = datetime.now()

    print("  Checking: {}".format(RSS_URL))
    try:
        resp = requests.get(RSS_URL, timeout=30)
        if resp.status_code != 200:
            print("  BTL RSS returned status {}".format(resp.status_code))
            return items
    except requests.RequestException as e:
        print("  BTL RSS fetch error: {}".format(e))
        return items

    try:
        root = ET.fromstring(resp.content)
        channel = root.find("channel")
        if channel is None:
            print("  No channel element in RSS")
            return items

        for item in channel.findall("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_date = (item.findtext("pubDate") or "").strip()

            # Skip empty/default items
            if not title or title == "default" or len(title) < 5:
                continue

            # Filter for CPA-relevant content only
            CPA_KEYWORDS = [
                "מענק", "קצבה", "קצבאות", "גמלה", "גמלאות",
                "דמי ביטוח", "הפרשה", "הפרשות", "שיעור",
                "מעסיק", "שכיר", "עצמאי", "פנסיה",
                "תשלום", "דיווח", "הצהרה", "שומה",
                "ניכוי", "זיכוי", "החזר",
                "חוק", "תיקון", "תקנה",
                "מדד", "עדכון סכומים", "שכר מינימום",
                "פיצוי", "נפגע עבודה", "פגיעה בעבודה",
                "שאגת הארי", "חרבות ברזל", "מלחמ",
            ]
            if not any(kw in title for kw in CPA_KEYWORDS):
                continue

            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": title,
                "url": link,
                "itemType": "official_update",
                "detectedAt": now.isoformat(),
                "metadata": {
                    "pubDate": pub_date,
                },
            })

        print("  Found {} items".format(len(items)))

    except ET.ParseError as e:
        print("  BTL RSS parse error: {}".format(e))

    return items
