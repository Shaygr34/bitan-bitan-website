"""
Deloitte Israel Tax Alerts Monitor
Scrapes the tax alerts listing page for new PDFs.
URL pattern: /il/he/services/tax/perspectives/YYYY-tax-alerts-and-circulars.html
"""

import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "deloitte"
SOURCE_LABEL = "Deloitte Israel"

# Try current year and previous year
BASE_URL = "https://www.deloitte.com/il/he/services/tax/perspectives"
EN_BASE_URL = "https://www.deloitte.com/il/en/services/tax/perspectives"


def get_alerts_url(year):
    return "{}/{}-tax-alerts-and-circulars.html".format(BASE_URL, year)


def get_en_alerts_url(year):
    return "{}/{}-tax-alerts-and-circulars.html".format(EN_BASE_URL, year)


def fetch_page(url):
    """Fetch page with browser-like headers."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "he-IL,he;q=0.9,en;q=0.8",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
    except requests.RequestException as e:
        print("  Deloitte fetch error: {}".format(e))
    return None


def extract_alerts(html, url):
    """Extract alert items from the page HTML."""
    soup = BeautifulSoup(html, "html.parser")
    alerts = []

    # Look for links to PDF files or alert detail pages
    for link in soup.find_all("a", href=True):
        href = link["href"]
        text = link.get_text(strip=True)

        if not text or len(text) < 5:
            continue

        # Match PDF links or internal alert pages
        is_pdf = href.lower().endswith(".pdf")
        is_alert_page = "/perspectives/" in href and href != url

        if is_pdf or is_alert_page:
            # Try to extract alert number from text (e.g., "חוזר מס 1/2026")
            full_url = href if href.startswith("http") else "https://www.deloitte.com" + href

            alerts.append({
                "title": text[:200],
                "url": full_url,
                "is_pdf": is_pdf,
            })

    # Also look for list items or structured content
    for li in soup.find_all("li"):
        text = li.get_text(strip=True)
        link_tag = li.find("a", href=True)
        if link_tag and text and len(text) > 10:
            href = link_tag["href"]
            if href.lower().endswith(".pdf") or "/perspectives/" in href:
                full_url = href if href.startswith("http") else "https://www.deloitte.com" + href
                if not any(a["url"] == full_url for a in alerts):
                    alerts.append({
                        "title": text[:200],
                        "url": full_url,
                        "is_pdf": href.lower().endswith(".pdf"),
                    })

    return alerts


def scan():
    """Scan Deloitte for new tax alerts. Returns list of items."""
    items = []
    now = datetime.now()
    years = [now.year, now.year - 1]

    for year in years:
        # Try Hebrew first, then English
        for url_fn in [get_alerts_url, get_en_alerts_url]:
            url = url_fn(year)
            print("  Checking: {}".format(url))
            html = fetch_page(url)
            if html:
                alerts = extract_alerts(html, url)
                for alert in alerts:
                    items.append({
                        "source": SOURCE_NAME,
                        "sourceLabel": SOURCE_LABEL,
                        "title": alert["title"],
                        "url": alert["url"],
                        "itemType": "tax_alert",
                        "detectedAt": now.isoformat(),
                        "metadata": {
                            "year": year,
                            "isPdf": alert["is_pdf"],
                        },
                    })
                if alerts:
                    print("  Found {} alerts for {}".format(len(alerts), year))
                    break  # Got results from one language, skip the other
            else:
                print("  Could not fetch page for {}".format(year))

    # Deduplicate by URL
    seen_urls = set()
    unique = []
    for item in items:
        if item["url"] not in seen_urls:
            seen_urls.add(item["url"])
            unique.append(item)

    return unique
