"""
Israel Tax Authority Telegram Channel Monitor
Scrapes the public web view at t.me/s/taxes_il
"""

import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "tax_authority_telegram"
SOURCE_LABEL = "רשות המיסים (טלגרם)"

CHANNEL_URL = "https://t.me/s/taxes_il"


def fetch_channel():
    """Fetch the public web view of the Telegram channel."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
    }
    try:
        resp = requests.get(CHANNEL_URL, headers=headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
    except requests.RequestException as e:
        print("  Telegram fetch error: {}".format(e))
    return None


def extract_messages(html):
    """Extract messages from Telegram web view HTML."""
    soup = BeautifulSoup(html, "html.parser")
    messages = []

    # Telegram web preview uses .tgme_widget_message divs
    for msg_div in soup.find_all("div", class_="tgme_widget_message"):
        # Get message text
        text_div = msg_div.find("div", class_="tgme_widget_message_text")
        if not text_div:
            continue

        text = text_div.get_text(strip=True)
        if not text or len(text) < 10:
            continue

        # Get message link (unique ID)
        msg_link = msg_div.get("data-post", "")
        msg_url = "https://t.me/{}".format(msg_link) if msg_link else ""

        # Get date
        date_tag = msg_div.find("time")
        date_str = ""
        if date_tag and date_tag.get("datetime"):
            date_str = date_tag["datetime"]

        # Get any links in the message
        links = []
        for a in text_div.find_all("a", href=True):
            href = a["href"]
            if "t.me" not in href:  # Skip internal telegram links
                links.append(href)

        # Truncate text for title (first line or first 120 chars)
        title = text.split("\n")[0][:120]

        messages.append({
            "title": title,
            "fullText": text[:500],
            "url": msg_url,
            "date": date_str,
            "links": links,
        })

    return messages


def scan():
    """Scan Tax Authority Telegram for recent messages. Returns list of items."""
    items = []
    now = datetime.now()

    print("  Checking: {}".format(CHANNEL_URL))
    html = fetch_channel()

    if not html:
        print("  Could not fetch Telegram channel")
        return items

    messages = extract_messages(html)
    print("  Found {} messages".format(len(messages)))

    for msg in messages:
        # Only include messages with meaningful content
        if len(msg["fullText"]) < 20:
            continue

        items.append({
            "source": SOURCE_NAME,
            "sourceLabel": SOURCE_LABEL,
            "title": msg["title"],
            "url": msg["url"],
            "itemType": "official_update",
            "detectedAt": now.isoformat(),
            "metadata": {
                "fullText": msg["fullText"],
                "date": msg["date"],
                "externalLinks": msg["links"],
            },
        })

    return items
