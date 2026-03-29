"""
OS Experts Circular Directory Monitor
Scrapes the circulars table for Tax Authority/Capital Market circulars.
Structure: simple HTML table with columns: נושא | שנה | קישור
"""

import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "os_experts"
SOURCE_LABEL = "OS Experts — חוזרים"

CIRCULARS_URL = "https://www.os-experts.co.il/%D7%97%D7%95%D7%96%D7%A8%D7%99%D7%9D-%D7%94%D7%95%D7%A8%D7%90%D7%95%D7%AA-%D7%91%D7%99%D7%A6%D7%95%D7%A2-%D7%94%D7%A0%D7%97%D7%99%D7%95%D7%AA-%D7%9C%D7%9E%D7%A2%D7%A1%D7%99%D7%A7%D7%99%D7%9D-%D7%95/"


def scan():
    """Scan OS Experts circular directory. Returns list of items."""
    items = []
    now = datetime.now()
    current_year = str(now.year)
    prev_year = str(now.year - 1)

    print("  Checking: OS Experts circulars page")
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
    }
    try:
        resp = requests.get(CIRCULARS_URL, headers=headers, timeout=30)
        if resp.status_code != 200:
            print("  OS Experts returned status {}".format(resp.status_code))
            return items
    except requests.RequestException as e:
        print("  OS Experts fetch error: {}".format(e))
        return items

    soup = BeautifulSoup(resp.text, "html.parser")

    # Find all tables (the circulars are in a simple HTML table)
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 2:
                continue

            # Expected: [title, year, link] or [title, link]
            title = cells[0].get_text(strip=True)
            year = cells[1].get_text(strip=True) if len(cells) >= 3 else ""

            # Only include current and previous year
            if year and year not in [current_year, prev_year]:
                continue

            # Get link
            link_tag = row.find("a", href=True)
            url = ""
            if link_tag:
                url = link_tag["href"]
                if not url.startswith("http"):
                    url = "https://www.os-experts.co.il" + url

            if not title or len(title) < 5:
                continue

            # Skip header rows
            if "נושא" in title and "חוזר" in title:
                continue

            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": title,
                "url": url or CIRCULARS_URL,
                "itemType": "tax_alert",
                "detectedAt": now.isoformat(),
                "metadata": {
                    "year": year,
                    "pdfUrl": url if url.endswith(".pdf") else "",
                },
            })

    print("  Found {} circulars (current + previous year)".format(len(items)))
    return items
