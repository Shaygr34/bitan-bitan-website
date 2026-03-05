#!/usr/bin/env python3
"""
Extract article content from bitan-finance.co.il (live WordPress site).
Outputs bitan-finance-inventory.md.
"""

import json
import re
import time
import requests
from urllib.parse import unquote
from bs4 import BeautifulSoup
from pathlib import Path

OUTPUT = Path(__file__).parent / "bitan-finance-inventory.md"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "he,en;q=0.9",
}

# Article URLs from the articles page
ARTICLE_URLS = [
    "https://bitan-finance.co.il/על-כמה-שנים-אחורה-אפשר-לקבל-החזר-מס/",
    "https://bitan-finance.co.il/למי-מיועד-החזר-מס/",
    "https://bitan-finance.co.il/דירת-מגורים-מזכה/",
    "https://bitan-finance.co.il/זיכוי-בגין-ילדים-קטנים/",
    "https://bitan-finance.co.il/זיכוי-ביטוח-חיים-קצבת-שארים-בקופת-גמל/",
    "https://bitan-finance.co.il/זיכוי-בעד-ילדים-נטולי-יכולת/",
    "https://bitan-finance.co.il/זיכוי-הנצחת-בן-משפחה-חיל-שוטר-פעולות-אי/",
    "https://bitan-finance.co.il/זיכוי-לגרוש/",
    "https://bitan-finance.co.il/זיכוי-ליחיד-במשפחה-חד-הורית/",
    "https://bitan-finance.co.il/זיכוי-לתושבים-ביישובים-זכאים/",
    "https://bitan-finance.co.il/זיכוי-ממס-הכנסה-לעולה-חדש/",
    "https://bitan-finance.co.il/זיכוי-מס-בגין-תרומה/",
    "https://bitan-finance.co.il/זכאות-לשיעור-מופחת-פנסיה/",
    "https://bitan-finance.co.il/זיכוי-בגין-סיום-תואר-אקדמי/",
    "https://bitan-finance.co.il/מענק-עבודה/",
    "https://bitan-finance.co.il/ניכוי-בעד-תשלומים-לקופת-גמל-לפנסיה/",
    "https://bitan-finance.co.il/ניכוי-בשל-תשלומי-פרמיה-לביטוח-אבדן-כושר-עבודה/",
    "https://bitan-finance.co.il/ניכוי-בשל-תשלומים-לקרן-השתלמות/",
    "https://bitan-finance.co.il/פטור-חד-פעמי-ממס-שבח-על-2-דירות/",
    "https://bitan-finance.co.il/פטור-ממס-שבח/",
    "https://bitan-finance.co.il/פטור-ממשיכת-כספי-תגמולים-החייבים-ב-35-מס/",
    "https://bitan-finance.co.il/פריסת-מס-שבח/",
    "https://bitan-finance.co.il/קיבוע-זכויות-לגיל-פרישה/",
    "https://bitan-finance.co.il/קיזוז-הפסדים/",
    "https://bitan-finance.co.il/תיקון-190-לפקודת-מס-הכנסה/",
    "https://bitan-finance.co.il/תשלום-מס-שבח/",
]

# Service/info pages to check
SERVICE_URLS = [
    "https://bitan-finance.co.il/החזר-מס-לשכירים/",
    "https://bitan-finance.co.il/החזר-מס-הכנסה/",
    "https://bitan-finance.co.il/איך-עושים-החזר-מס/",
    "https://bitan-finance.co.il/בדיקת-החזר-מס/",
    "https://bitan-finance.co.il/החזר-מס-שבח-דיגיטלי/",
    "https://bitan-finance.co.il/טופס-161/",
    "https://bitan-finance.co.il/משכנתאות/",
    "https://bitan-finance.co.il/שאלות-ותשובות/",
    "https://bitan-finance.co.il/אודות/",
    "https://bitan-finance.co.il/לוח-סניפים/",
]

session = requests.Session()
session.headers.update(HEADERS)


def extract_content(url):
    """Fetch a page and extract title + body text."""
    try:
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
    except Exception as e:
        return None, None, f"Error: {e}"

    soup = BeautifulSoup(resp.text, "html.parser")

    # Title: try <h1> first, then <title>
    h1 = soup.find("h1")
    title_tag = soup.find("title")
    title = ""
    if h1:
        title = h1.get_text(strip=True)
    elif title_tag:
        title = title_tag.get_text(strip=True).split("|")[0].strip()

    # Remove scripts, styles, nav, header, footer, sidebar
    for tag in soup.find_all(["script", "style", "nav", "header", "footer",
                               "aside", "noscript", "iframe"]):
        tag.decompose()

    # Try common WordPress content containers
    content_el = None
    for selector in [
        "article .entry-content",
        ".entry-content",
        "article",
        ".elementor-widget-theme-post-content",
        ".elementor-section",
        "main .content",
        "main",
        "#content",
    ]:
        found = soup.select(selector)
        if found:
            # Pick the one with the most text
            best = max(found, key=lambda el: len(el.get_text()))
            if len(best.get_text(strip=True)) > 50:
                content_el = best
                break

    if not content_el:
        # Fallback: body
        content_el = soup.find("body")

    if not content_el:
        return title, "", "No content found"

    # Extract text with structure
    lines = []
    for el in content_el.descendants:
        if el.name in ("h1", "h2", "h3", "h4"):
            text = el.get_text(strip=True)
            if text:
                level = int(el.name[1])
                lines.append(f"\n{'#' * (level + 1)} {text}\n")
        elif el.name == "li":
            text = el.get_text(strip=True)
            if text:
                lines.append(f"- {text}")
        elif el.name == "p":
            text = el.get_text(strip=True)
            if text:
                lines.append(text)
        elif el.name == "td":
            pass  # handled with table
        elif el.name == "table":
            # Simple table extraction
            rows = el.find_all("tr")
            for row in rows:
                cells = [c.get_text(strip=True) for c in row.find_all(["th", "td"])]
                if any(cells):
                    lines.append(" | ".join(cells))

    body = "\n".join(lines)
    # Deduplicate consecutive identical lines
    deduped = []
    for line in body.split("\n"):
        if not deduped or line != deduped[-1]:
            deduped.append(line)
    body = "\n".join(deduped)

    return title, body, None


def word_count(text):
    return len(text.split())


def main():
    results = {"articles": [], "services": []}

    print("=" * 60)
    print("Extracting articles from bitan-finance.co.il")
    print("=" * 60)

    # Extract articles
    for i, url in enumerate(ARTICLE_URLS, 1):
        decoded_path = unquote(url.replace("https://bitan-finance.co.il", ""))
        print(f"  [{i}/{len(ARTICLE_URLS)}] {decoded_path[:60]}...")
        title, body, err = extract_content(url)
        if err:
            print(f"    ⚠ {err}")
        wc = word_count(body) if body else 0
        print(f"    → {title} ({wc} words)")
        results["articles"].append({
            "url": url,
            "title": title or decoded_path,
            "body": body or "",
            "words": wc,
            "error": err,
        })
        time.sleep(1)

    # Extract service pages
    print(f"\n{'=' * 60}")
    print("Extracting service pages")
    print("=" * 60)

    for i, url in enumerate(SERVICE_URLS, 1):
        decoded_path = unquote(url.replace("https://bitan-finance.co.il", ""))
        print(f"  [{i}/{len(SERVICE_URLS)}] {decoded_path[:60]}...")
        title, body, err = extract_content(url)
        if err:
            print(f"    ⚠ {err}")
        wc = word_count(body) if body else 0
        print(f"    → {title} ({wc} words)")
        results["services"].append({
            "url": url,
            "title": title or decoded_path,
            "body": body or "",
            "words": wc,
            "error": err,
        })
        time.sleep(1)

    # Write inventory
    print(f"\n{'=' * 60}")
    print("Writing inventory...")

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("# bitan-finance.co.il Content Inventory\n\n")
        f.write(f"Extracted: 2026-03-05\n")
        f.write(f"Source: https://bitan-finance.co.il\n\n")

        # Summary table
        f.write("## Summary\n\n")
        f.write("### Articles\n\n")
        f.write("| # | Title | Words | Status |\n")
        f.write("|---|-------|-------|--------|\n")
        for i, a in enumerate(results["articles"], 1):
            status = "✅" if a["words"] >= 300 else "⚠ Short" if a["words"] > 0 else "❌ Empty"
            if a["error"]:
                status = f"❌ {a['error'][:30]}"
            f.write(f"| {i} | {a['title']} | {a['words']} | {status} |\n")

        total_articles = sum(1 for a in results["articles"] if a["words"] >= 300)
        f.write(f"\n**{total_articles} articles with 300+ words** out of {len(results['articles'])} total\n\n")

        f.write("### Service Pages\n\n")
        f.write("| # | Title | URL | Words | Status |\n")
        f.write("|---|-------|-----|-------|--------|\n")
        for i, s in enumerate(results["services"], 1):
            decoded = unquote(s["url"].replace("https://bitan-finance.co.il", ""))
            status = "✅" if s["words"] >= 300 else "⚠ Short" if s["words"] > 0 else "❌ Empty"
            f.write(f"| {i} | {s['title']} | {decoded} | {s['words']} | {status} |\n")

        total_services = sum(1 for s in results["services"] if s["words"] >= 300)
        f.write(f"\n**{total_services} service pages with 300+ words** out of {len(results['services'])} total\n\n")

        # Full content - articles
        f.write("---\n\n")
        f.write("## Full Content — Articles\n\n")
        for a in results["articles"]:
            if a["words"] < 50:
                continue
            decoded_url = unquote(a["url"])
            f.write(f"### {a['title']}\n\n")
            f.write(f"**URL:** {decoded_url}\n")
            f.write(f"**Words:** {a['words']}\n\n")
            f.write(a["body"])
            f.write("\n\n---\n\n")

        # Full content - service pages
        f.write("## Full Content — Service Pages\n\n")
        for s in results["services"]:
            if s["words"] < 50:
                continue
            decoded_url = unquote(s["url"])
            f.write(f"### {s['title']}\n\n")
            f.write(f"**URL:** {decoded_url}\n")
            f.write(f"**Words:** {s['words']}\n\n")
            f.write(s["body"])
            f.write("\n\n---\n\n")

    print(f"\nOutput: {OUTPUT}")
    print(f"Articles: {total_articles} substantial / {len(results['articles'])} total")
    print(f"Service pages: {total_services} substantial / {len(results['services'])} total")


if __name__ == "__main__":
    main()
