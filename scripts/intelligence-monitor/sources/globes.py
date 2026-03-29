"""
Globes RSS Monitor
Parses macro-economics and financial services RSS feeds,
filters for tax/accounting/regulatory keywords.
"""

import re
import xml.etree.ElementTree as ET
from datetime import datetime

import requests

SOURCE_NAME = "globes"
SOURCE_LABEL = "Globes (גלובס)"

RSS_FEEDS = {
    "macro": "https://www.globes.co.il/WebService/Rss/RssFeeder.asmx/FeederKeyword?iID=1389",
    "finance": "https://www.globes.co.il/WebService/Rss/RssFeeder.asmx/FeederKeyword?iID=1383",
    "all_news": "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=1725",
}

# Hebrew keywords that indicate tax/accounting/CPA relevance
TAX_KEYWORDS = [
    "מס", "מיסוי", "מיסים", "רשות המסים", "מס הכנסה",
    "מע\"מ", "מעמ", "ניכוי", "זיכוי", "החזר מס",
    "חוזר מס", "הוראת ביצוע", "פקודת מס",
    "רואי חשבון", "רו\"ח", "ביקורת",
    "חשבונאות", "תקן חשבונאות", "IFRS",
    "ביטוח לאומי", "פנסיה", "קרן השתלמות",
    "חברה בע\"מ", "עוסק מורשה", "עוסק פטור",
    "דוח שנתי", "דוחות כספיים",
    "שאגת הארי", "מענק", "פיצוי",
    "חקיקה", "תיקון חוק", "הצעת חוק",
    "ועדת הכספים", "כנסת",
    "תקציב", "גירעון",
    "ריבית", "בנק ישראל", "אינפלציה",
]

# Compile a regex pattern for faster matching
KEYWORD_PATTERN = re.compile(
    "|".join(re.escape(kw) for kw in TAX_KEYWORDS),
    re.IGNORECASE,
)


def fetch_rss(url):
    """Fetch and parse an RSS feed."""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; BitanCPA-Monitor/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
    except requests.RequestException as e:
        print("  Globes RSS fetch error: {}".format(e))
    return None


def parse_rss(xml_text):
    """Parse RSS XML and return items."""
    items = []
    try:
        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            return items

        for item in channel.findall("item"):
            title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            description = item.findtext("description", "").strip()
            pub_date = item.findtext("pubDate", "").strip()

            if title:
                items.append({
                    "title": title,
                    "url": link,
                    "description": description[:300],
                    "pubDate": pub_date,
                })
    except ET.ParseError as e:
        print("  RSS parse error: {}".format(e))

    return items


def is_tax_relevant(title, description):
    """Check if an article is relevant to tax/accounting."""
    text = "{} {}".format(title, description)
    return bool(KEYWORD_PATTERN.search(text))


def scan():
    """Scan Globes RSS feeds for tax-relevant articles. Returns list of items."""
    all_items = []
    now = datetime.now()
    seen_urls = set()

    for feed_name, feed_url in RSS_FEEDS.items():
        print("  Checking Globes {} feed...".format(feed_name))
        xml_text = fetch_rss(feed_url)
        if not xml_text:
            print("  Could not fetch {} feed".format(feed_name))
            continue

        rss_items = parse_rss(xml_text)
        relevant = 0

        for item in rss_items:
            if item["url"] in seen_urls:
                continue

            if is_tax_relevant(item["title"], item["description"]):
                seen_urls.add(item["url"])
                relevant += 1
                all_items.append({
                    "source": SOURCE_NAME,
                    "sourceLabel": SOURCE_LABEL,
                    "title": item["title"],
                    "url": item["url"],
                    "itemType": "news",
                    "detectedAt": now.isoformat(),
                    "metadata": {
                        "description": item["description"],
                        "pubDate": item["pubDate"],
                        "feed": feed_name,
                    },
                })

        print("  {} feed: {}/{} items tax-relevant".format(
            feed_name, relevant, len(rss_items)
        ))

    return all_items
