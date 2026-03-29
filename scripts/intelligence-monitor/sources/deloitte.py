"""
Deloitte Israel Tax Alerts Monitor
Scrapes the tax alerts listing page — alerts are in a flat <ul> inside .cmp-text
Each <li> has: <b> with alert number (optionally linked to PDF), then title text after <br>
"""

import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "deloitte"
SOURCE_LABEL = "Deloitte Israel"

BASE_URL = "https://www.deloitte.com/il/he/services/tax/perspectives"


def get_alerts_url(year):
    return "{}/{}-tax-alerts-and-circulars.html".format(BASE_URL, year)


def fetch_page(url):
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


def extract_alerts(html, year):
    """Extract alerts from the .cmp-text ul > li structure."""
    soup = BeautifulSoup(html, "html.parser")
    alerts = []

    # Find the content div with the alerts list
    cmp_text = soup.find("div", class_="cmp-text")
    if not cmp_text:
        return alerts

    for li in cmp_text.find_all("li"):
        # Get alert number from <b>
        bold = li.find("b")
        if not bold:
            continue

        # Check for PDF link inside <b>
        link_tag = bold.find("a", href=True)
        alert_number = bold.get_text(strip=True)
        pdf_url = ""

        if link_tag:
            pdf_url = link_tag["href"]
            if not pdf_url.startswith("http"):
                pdf_url = "https://www.deloitte.com" + pdf_url

        # Get the title — it's the text content of <li> minus the <b> content
        # Remove the bold tag to get remaining text
        li_text = li.get_text(separator=" ", strip=True)
        # Remove the alert number from the beginning
        title = li_text.replace(alert_number, "", 1).strip()
        # Clean up leading/trailing pipes, spaces
        title = re.sub(r'^[\s|]+', '', title).strip()

        if not title or len(title) < 5:
            continue

        # Skip if it's just "English" or navigation text
        if title.lower() in ["english", "hebrew", "עברית"]:
            continue

        alerts.append({
            "alertNumber": alert_number,
            "title": title,
            "pdfUrl": pdf_url,
            "year": year,
        })

    return alerts


def scan():
    """Scan Deloitte for tax alerts. Returns list of items."""
    items = []
    now = datetime.now()
    years = [now.year, now.year - 1]

    for year in years:
        url = get_alerts_url(year)
        print("  Checking: {}".format(url))
        html = fetch_page(url)
        if not html:
            print("  Could not fetch page for {}".format(year))
            continue

        alerts = extract_alerts(html, year)
        print("  Found {} alerts for {}".format(len(alerts), year))

        for alert in alerts:
            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": "{} — {}".format(alert["alertNumber"], alert["title"]),
                "url": alert["pdfUrl"] or get_alerts_url(year),
                "itemType": "tax_alert",
                "detectedAt": now.isoformat(),
                "metadata": {
                    "alertNumber": alert["alertNumber"],
                    "year": alert["year"],
                    "pdfUrl": alert["pdfUrl"],
                },
            })

    # Deduplicate by alert number
    seen = set()
    unique = []
    for item in items:
        key = item["metadata"]["alertNumber"]
        if key not in seen:
            seen.add(key)
            unique.append(item)

    return unique
