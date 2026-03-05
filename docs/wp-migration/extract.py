#!/usr/bin/env python3
"""
WordPress Content Extraction from Wayback Machine for bitancpa.com
Handles challenge pages by trying multiple timestamps per URL.
"""

import json
import re
import time
import urllib.parse
import sys
from pathlib import Path
from collections import defaultdict

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4", "lxml"], stdout=subprocess.DEVNULL)
    import requests
    from bs4 import BeautifulSoup

import warnings
warnings.filterwarnings("ignore")

OUTPUT_DIR = Path(__file__).parent
SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
})


def load_urls_with_all_timestamps():
    """Load CDX data, group ALL timestamps per URL for fallback."""
    with open(OUTPUT_DIR / "wayback_urls.json", "r") as f:
        data = json.load(f)
    rows = data[1:]

    exclude_re = re.compile(
        r'wp-content|wp-admin|wp-includes|wp-json|wp-login|wp-cron|'
        r'xmlrpc|robots\.txt|sitemap|ads\.txt|\.well-known|'
        r'\.css|\.js|\.png|\.jpg|\.jpeg|\.gif|\.svg|\.ico|\.woff|\.ttf|\.eot|\.pdf|\.zip|\.xml|'
        r'/feed/|/tag/|/author/|/page/\d|/comment-|/embed|/amp/?$|'
        r'\?replytocom|\?share=|\?like_comment|\?p=.*preview|'
        r'/cart/|/checkout/|/my-account/',
        re.IGNORECASE
    )

    spam_re = re.compile(
        r'casino|poker|slot|betting|gambling|1win|mostbet|pin-up|vulkan|'
        r'free.spins|no.deposit|wagering|gratorama|book.of.ra|'
        r'descuento|pagando|kueski|cherry.mobile|benzineprijs|'
        r'addestrare|riviera|kroon|arbitrage|stargames',
        re.IGNORECASE
    )

    skip_prefixes = [
        'index_b/', 'forms/', 'category/', 'category-',
        'information_services/',
        'אינדקס/', 'טפסים/',
        'הוראות-ביצוע-מס-הכנסה/',
        'רשימת-היישובים-',
        'דע-את-זכויותיך/', 'דע-את-זכויותיך-2/',
        'היערכות-הגשה-דוחות-', 'דרישת-מסמכים-להכנת-',
        'הערכות-לקראת-תום-שנת-', 'גמלאים-יקרים-',
        'websites-recommendation/', 'שליטה-מרחוק/',
        'ריבית-סעיף-3ט/', 'החזר-בלו-סולר/',
    ]

    # Collect ALL timestamps per normalized path
    url_data = defaultdict(list)  # path -> [(timestamp, original_url)]

    for ts, orig, status in rows:
        if exclude_re.search(orig):
            continue
        if spam_re.search(orig):
            continue

        parsed = urllib.parse.urlparse(orig)
        path = urllib.parse.unquote(parsed.path).strip('/').replace(':80', '')

        if any(path.startswith(p) for p in skip_prefixes):
            continue
        if path.startswith('http'):
            continue

        segments = [s for s in path.split('/') if s]
        if len(segments) > 2:
            continue

        if len(segments) == 2:
            parent = segments[0]
            if not (re.match(r'^\d+-\d+$', parent) or
                    parent in ('car-tex', 'cash-low', 'change-address',
                               'change-your-company-name', 'check-your-rights',
                               'compensation', 'birthandtax', 'companytax')):
                has_hebrew_child = any('\u0590' <= c <= '\u05FF' for c in segments[1])
                has_hebrew_parent = any('\u0590' <= c <= '\u05FF' for c in parent)
                if not has_hebrew_child or has_hebrew_parent:
                    continue

        has_hebrew = any('\u0590' <= c <= '\u05FF' for c in path)
        is_structural = path in ('', 'about', 'contact', 'services', 'blog',
                                  'birthandtax', 'companytax', 'car-tex',
                                  'cash-low', 'change-address', 'change-your-company-name',
                                  'check-your-rights', 'compensation')

        if not has_hebrew and not is_structural:
            continue

        url_data[path].append((ts, orig))

    # Deduplicate nested paths
    to_remove = []
    for path in url_data:
        segments = [s for s in path.split('/') if s]
        if len(segments) == 2:
            slug = segments[1]
            if slug in url_data:
                to_remove.append(path)
    for path in to_remove:
        del url_data[path]

    # Sort timestamps: prefer pre-2024 (real content), then newest first within each era
    for path in url_data:
        timestamps = url_data[path]
        # Sort: older timestamps first (more likely to have real content), then newer
        timestamps.sort(key=lambda x: (
            0 if int(x[0][:4]) < 2024 else 1,  # Pre-2024 preferred
            -int(x[0])  # Within same era, newest first
        ))

    print(f"Total CDX rows: {len(rows)}")
    print(f"After filtering: {len(url_data)} unique article paths")
    return url_data


def is_challenge_page(html):
    """Detect Cloudflare/WAF challenge pages."""
    return ('One moment' in html[:500] or
            'being verified' in html[:500] or
            'challenge-platform' in html[:1000] or
            len(html) < 2000 and 'wsidchk' in html)


def fetch_article(path, timestamps_list):
    """Try multiple timestamps until we get real content."""
    for ts, orig in timestamps_list[:4]:  # Try up to 4 timestamps
        wayback_url = f"https://web.archive.org/web/{ts}id_/{orig}"
        try:
            resp = SESSION.get(wayback_url, timeout=30)
            if resp.status_code != 200:
                continue
            if is_challenge_page(resp.text):
                time.sleep(1)
                continue
            return parse_article(resp.text, orig), None
        except requests.exceptions.ConnectionError:
            return None, "Connection refused (rate limited)"
        except requests.exceptions.Timeout:
            continue
        except Exception as e:
            return None, str(e)[:80]
        finally:
            time.sleep(1)

    return None, "All timestamps returned challenge pages"


def parse_article(html, original_url):
    """Parse article content from bitancpa.com HTML."""
    soup = BeautifulSoup(html, 'lxml')

    # Title
    title = ''
    h1 = soup.find('h1')
    if h1:
        title = h1.get_text(strip=True)
    elif soup.title:
        title = soup.title.get_text(strip=True)
        title = re.sub(r'\s*[-|–]\s*ביטן.*$', '', title).strip()

    # Date from Yoast JSON-LD
    date = ''
    schema_el = soup.find('script', class_='yoast-schema-graph')
    if schema_el and schema_el.string:
        try:
            schema = json.loads(schema_el.string)
            for item in schema.get('@graph', []):
                if 'datePublished' in item:
                    date = item['datePublished'][:10]
                    break
        except json.JSONDecodeError:
            pass
    if not date:
        meta = soup.find('meta', property='article:modified_time') or soup.find('meta', property='article:published_time')
        if meta:
            date = meta.get('content', '')[:10]

    # Category from category links
    category = ''
    cat_link = soup.find('a', href=re.compile(r'/category/'))
    if cat_link:
        category = cat_link.get_text(strip=True)
    if not category:
        # Try from Yoast breadcrumb schema
        if schema_el and schema_el.string:
            try:
                schema = json.loads(schema_el.string)
                for item in schema.get('@graph', []):
                    if item.get('@type') == 'BreadcrumbList':
                        items = item.get('itemListElement', [])
                        if len(items) >= 2:
                            # Second-to-last breadcrumb is usually the category
                            category = items[-2].get('name', '') if items[-2].get('name', '') != 'Home' else ''
                        break
            except:
                pass

    # Body — the site uses div.content (the inner one with <p> tags)
    body = ''
    # Find all div.content, take the one with the most <p> children
    content_divs = soup.find_all('div', class_='content')
    best_content = None
    best_p_count = 0
    for cd in content_divs:
        p_count = len(cd.find_all('p', recursive=False))
        if p_count > best_p_count:
            best_p_count = p_count
            best_content = cd

    # Fallback to other containers
    if not best_content or best_p_count < 1:
        best_content = (
            soup.find('div', class_='entry-content') or
            soup.find('article') or
            soup.find('div', class_='post-content') or
            soup.find('main')
        )

    if best_content:
        body = extract_text(best_content)

    word_count = len(body.split()) if body else 0

    return {
        'title': title,
        'date': date,
        'category': category,
        'body': body,
        'word_count': word_count,
        'original_url': original_url,
    }


def extract_text(el):
    """Extract structured text preserving headings, paragraphs, lists."""
    lines = []
    seen = set()

    for child in el.children:
        if not hasattr(child, 'name') or child.name is None:
            text = child.strip() if isinstance(child, str) else ''
            if text and len(text) > 10 and text not in seen:
                lines.append(text)
                seen.add(text)
            continue

        if child.name in ('script', 'style', 'nav', 'footer', 'aside', 'form',
                          'noscript', 'iframe', 'button'):
            continue

        # Skip "Print Friendly" and share buttons
        if child.get('class') and any('print' in c.lower() or 'share' in c.lower() or 'social' in c.lower()
                                       for c in child.get('class', [])):
            continue

        if child.name in ('h1', 'h2', 'h3', 'h4'):
            text = child.get_text(strip=True)
            if text and text not in seen:
                prefix = '#' * int(child.name[1])
                lines.append(f"\n{prefix} {text}\n")
                seen.add(text)
        elif child.name in ('ul', 'ol'):
            for li in child.find_all('li', recursive=False):
                text = li.get_text(strip=True)
                if text and text not in seen:
                    lines.append(f"- {text}")
                    seen.add(text)
        elif child.name == 'table':
            lines.append("\n[table]")
            for row in child.find_all('tr'):
                cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
                if any(cells):
                    lines.append('| ' + ' | '.join(cells) + ' |')
            lines.append('')
        elif child.name in ('p', 'blockquote'):
            text = child.get_text(strip=True)
            if text and len(text) > 3 and text not in seen:
                lines.append(f"\n{text}\n")
                seen.add(text)
        elif child.name == 'div':
            # Recurse into divs that contain article content
            inner_ps = child.find_all('p', recursive=False)
            inner_hs = child.find_all(['h2', 'h3', 'h4'], recursive=False)
            if inner_ps or inner_hs:
                inner = extract_text(child)
                if inner and inner not in seen:
                    lines.append(inner)
                    seen.add(inner)
            else:
                text = child.get_text(strip=True)
                if text and len(text) > 20 and text not in seen:
                    # Skip if it looks like sidebar/widget content
                    if not any(c in (child.get('class') or []) for c in
                              ['sidebar', 'widget', 'rss', 'menu', 'nav', 'footer', 'related']):
                        lines.append(f"\n{text}\n")
                        seen.add(text)
        elif child.name == 'img':
            alt = child.get('alt', '')
            if alt:
                lines.append(f"[Image: {alt}]")

    result = '\n'.join(lines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def assess(article):
    """Return (quality, priority)."""
    body = (article['body'] or '').lower()
    wc = article['word_count']

    if wc < 150 and any(w in body for w in ['טופס', 'מחשבון', 'חישוב']):
        return 'Form/Tool', 'Skip'
    if wc < 50:
        return 'Thin', 'Skip'

    quality = 'Good' if wc >= 300 else 'Thin'

    evergreen = [
        'פתיחת תיק', 'חשבונית', 'עוסק מורשה', 'עוסק פטור',
        'ניהול ספרים', 'מס הכנסה', 'ביטוח לאומי', 'מע"מ',
        'דוח שנתי', 'הוצאות מוכרות', 'מקדמות', 'חברה בע"מ',
        'עמותה', 'שכיר', 'עצמאי', 'תיאום מס', 'החזר מס',
        'ניכוי במקור', 'דמי ביטוח', 'פנסיה', 'פיצויים',
        'חשבונית ישראל', 'עוסק זעיר',
    ]
    is_evergreen = any(t in body for t in evergreen)

    stale_re = [r'שנת המס 20[12][0-9]', r'עד ליום \d+\.\d+\.20[12][0-9]']
    is_stale = any(re.search(p, body) for p in stale_re)

    if quality == 'Thin':
        return 'Thin', 'P3'
    if is_stale and not is_evergreen:
        return 'Stale', 'P3'
    if is_stale and is_evergreen:
        return 'Good', 'P2'
    if is_evergreen:
        return 'Good', 'P1'
    return 'Good', 'P2'


SLUG_MAP = {
    'חשבונית': 'invoice', 'עוסק-מורשה': 'licensed-dealer', 'עוסק-פטור': 'exempt-dealer',
    'פתיחת-תיק': 'opening-file', 'חברה': 'company', 'מס-הכנסה': 'income-tax',
    'ביטוח-לאומי': 'national-insurance', 'מע"מ': 'vat', 'מעמ': 'vat',
    'דוח-שנתי': 'annual-report', 'הוצאות-מוכרות': 'deductible-expenses',
    'תיאום-מס': 'tax-coordination', 'החזר-מס': 'tax-refund',
    'ניהול-ספרים': 'bookkeeping', 'מקדמות': 'advance-payments',
    'עמותה': 'nonprofit', 'שכיר': 'employee', 'עצמאי': 'freelancer',
    'אודות': 'about', 'צור-קשר': 'contact', 'שירותים': 'services',
    'הנהלת-חשבונות': 'accounting', 'מיסוי': 'taxation',
    'ניכוי': 'deduction', 'זיכוי': 'credit', 'שומה': 'assessment',
    'פנסיה': 'pension', 'אבטלה': 'unemployment', 'שבח': 'betterment-tax',
    'רכישה': 'purchase-tax', 'דיבידנד': 'dividend',
    'הצהרת-הון': 'wealth-declaration', 'דירה': 'apartment',
    'שכירות': 'rent', 'נכות': 'disability', 'פיצויים': 'severance',
    'מילואים': 'reserves', 'לידה': 'maternity', 'רכב': 'vehicle',
    'מזומן': 'cash', 'קבלה': 'receipt', 'פיטורים': 'termination',
    'משכנתא': 'mortgage', 'מלכר': 'nonprofit-report',
    'עוסק-זעיר': 'micro-dealer', 'חרבות-ברזל': 'swords-of-iron',
}


def make_slug(path, title):
    decoded = urllib.parse.unquote(path).strip('/')
    for heb, eng in [('אודות', '/about'), ('צור-קשר', '/contact')]:
        if heb in decoded:
            return eng
    parts = []
    for heb, eng in sorted(SLUG_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        if heb in decoded:
            parts.append(eng)
            decoded = decoded.replace(heb, '')
    if parts:
        return '/knowledge/' + '-'.join(parts[:3])
    return '/knowledge'


def main():
    start_time = time.time()

    print("=" * 60)
    print("STEP 1: Parse and filter URLs")
    print("=" * 60)
    url_data = load_urls_with_all_timestamps()
    sorted_paths = sorted(url_data.keys())
    total = len(sorted_paths)
    print(f"Will fetch {total} URLs with fallback timestamps\n")

    print("=" * 60)
    print("STEP 2: Fetch articles (with challenge detection)")
    print("=" * 60)

    articles = []
    errors = []
    challenge_count = 0

    for i, path in enumerate(sorted_paths, 1):
        decoded = urllib.parse.unquote(path) or '/'
        label = decoded[:55]
        ts_count = len(url_data[path])
        print(f"  [{i}/{total}] {label} ({ts_count} ts)", end=' ', flush=True)

        article, err = fetch_article(path, url_data[path])

        if err:
            if 'challenge' in err.lower():
                challenge_count += 1
                print(f"-> challenge ({ts_count} tried)")
            elif 'rate' in err.lower() or 'refused' in err.lower():
                print(f"-> RATE LIMITED, pausing 30s...")
                time.sleep(30)
                # Retry once
                article, err2 = fetch_article(path, url_data[path])
                if err2:
                    errors.append({'path': decoded, 'error': err2})
                    print(f"  -> still failed")
                    continue
            else:
                print(f"-> ERR: {err}")
                errors.append({'path': decoded, 'error': err})
                continue

        if article and article['word_count'] > 20:
            article['path'] = decoded
            quality, priority = assess(article)
            article['quality'] = quality
            article['priority'] = priority
            articles.append(article)
            print(f"-> {article['word_count']}w {quality}/{priority}")
        elif article:
            print(f"-> skip ({article['word_count']}w)")
        else:
            if 'challenge' not in (err or '').lower():
                errors.append({'path': decoded, 'error': err or 'no content'})

        # Rate limiting: 2.5s between requests
        time.sleep(2.5)

    elapsed = (time.time() - start_time) / 60

    # Sort by priority
    prio_order = {'P1': 0, 'P2': 1, 'P3': 2, 'Skip': 3}
    articles.sort(key=lambda a: (prio_order.get(a['priority'], 9), a.get('title', '')))

    p1 = [a for a in articles if a['priority'] == 'P1']
    p2 = [a for a in articles if a['priority'] == 'P2']
    p3 = [a for a in articles if a['priority'] == 'P3']
    skips = [a for a in articles if a['priority'] == 'Skip']
    total_words = sum(a['word_count'] for a in articles)

    # ─── STEP 3: Content inventory ───────────────────────────────────
    print(f"\n{'=' * 60}")
    print("STEP 3: Content inventory")
    print(f"{'=' * 60}")

    with open(OUTPUT_DIR / "wp-content-inventory.md", 'w', encoding='utf-8') as f:
        f.write("# WordPress Content Inventory - bitancpa.com\n\n")
        f.write(f"Extracted: {time.strftime('%Y-%m-%d %H:%M')} ({elapsed:.0f} min)\n\n")
        f.write("## Summary\n\n")
        f.write(f"- **Total URLs scanned:** {total}\n")
        f.write(f"- **Articles extracted:** {len(articles)}\n")
        f.write(f"- **P1 (evergreen, high quality):** {len(p1)}\n")
        f.write(f"- **P2 (good, may need updates):** {len(p2)}\n")
        f.write(f"- **P3 (thin/stale):** {len(p3)}\n")
        f.write(f"- **Skip (form/tool/empty):** {len(skips)}\n")
        f.write(f"- **Challenge pages (content lost):** {challenge_count}\n")
        f.write(f"- **Other failures:** {len(errors)}\n")
        f.write(f"- **Total word count:** ~{total_words:,}\n\n")

        f.write("## Content Table\n\n")
        f.write("| # | Title | Path | Date | Category | Words | Quality | Priority |\n")
        f.write("|---|-------|------|------|----------|-------|---------|----------|\n")
        for i, a in enumerate(articles, 1):
            t = (a['title'] or 'Untitled')[:50].replace('|', '/')
            p = a['path'][:40].replace('|', '/')
            c = (a['category'] or '').replace('|', '/')
            f.write(f"| {i} | {t} | {p} | {a['date']} | {c} | {a['word_count']} | {a['quality']} | {a['priority']} |\n")

        if errors:
            f.write("\n## Failed Extractions\n\n")
            for err in errors:
                f.write(f"- `{err['path']}` - {err['error']}\n")

        if challenge_count:
            f.write(f"\n## Challenge Pages ({challenge_count})\n\n")
            f.write("These URLs only had snapshots from when the site was behind a Cloudflare challenge.\n")
            f.write("Content may be recoverable via Google Cache or direct site access if the site comes back online.\n\n")

        f.write("\n---\n\n# Full Content\n\n")
        for a in articles:
            if a['priority'] == 'Skip':
                continue
            f.write(f"---\n\n## {a['title'] or 'Untitled'}\n\n")
            f.write(f"**URL:** {a['original_url']}\n")
            f.write(f"**Date:** {a['date']}\n")
            f.write(f"**Category:** {a['category']}\n")
            f.write(f"**Word Count:** {a['word_count']}\n")
            f.write(f"**Quality:** {a['quality']}\n")
            f.write(f"**Priority:** {a['priority']}\n\n")
            f.write(a['body'] or '*[No content extracted]*')
            f.write("\n\n")

    print("  -> wp-content-inventory.md")

    # ─── STEP 4: Redirect map ───────────────────────────────────────
    print(f"\n{'=' * 60}")
    print("STEP 4: Redirect map")
    print(f"{'=' * 60}")

    with open(OUTPUT_DIR / "wp-redirect-map.md", 'w', encoding='utf-8') as f:
        f.write("# URL Redirect Map - bitancpa.com\n\n")
        f.write("| Old URL (bitancpa.com) | Suggested New URL | Redirect | Notes |\n")
        f.write("|------------------------|-------------------|----------|-------|\n")
        for a in articles:
            old = '/' + a['path'].strip('/') + '/'
            if old == '//':
                old = '/'
            new = make_slug(a['path'], a['title'])
            note = a['priority']
            if a['priority'] in ('P1', 'P2'):
                note += ' - republish'
            elif a['priority'] == 'P3':
                note += ' - redirect to hub'
            else:
                note += ' - skip'
                new = '/knowledge'
            f.write(f"| {old} | {new} | 301 | {note} |\n")
    print("  -> wp-redirect-map.md")

    # ─── STEP 5: Category map ───────────────────────────────────────
    print(f"\n{'=' * 60}")
    print("STEP 5: Category map")
    print(f"{'=' * 60}")

    cats = sorted(set(a['category'] for a in articles if a['category']))

    CAT_MAP = {
        'מס הכנסה': ('מס הכנסה', 'income-tax'),
        'מע"מ': ('מע"מ', 'vat'),
        "מע''מ": ('מע"מ', 'vat'),
        'מע״מ': ('מע"מ', 'vat'),
        'ביטוח לאומי': ('ביטוח לאומי', 'national-insurance'),
        'חדשות ועדכונים': ('חדשות ועדכונים', 'news'),
        'טיפ יומי': ('טיפ יומי', 'daily-tip'),
        'מיסוי מקרקעין': ('מיסוי מקרקעין', 'real-estate-tax'),
        'רשם החברות': ('רשם החברות', 'companies-registrar'),
        'השירותים שלנו': ('שירותים', 'services'),
        'כללי': ('כללי', 'general'),
    }

    with open(OUTPUT_DIR / "wp-category-map.md", 'w', encoding='utf-8') as f:
        f.write("# Category Mapping - bitancpa.com old to new\n\n")
        f.write("| Old Category | New Sanity Category | Sanity Slug |\n")
        f.write("|-------------|--------------------|-----------|\n")
        for cat in cats:
            if cat in CAT_MAP:
                new_cat, slug = CAT_MAP[cat]
            else:
                new_cat, slug = cat, '(needs-mapping)'
                for key, (nc, sl) in CAT_MAP.items():
                    if key in cat or cat in key:
                        new_cat, slug = nc, sl
                        break
            f.write(f"| {cat} | {new_cat} | {slug} |\n")
    print("  -> wp-category-map.md")

    # ─── Summary ─────────────────────────────────────────────────────
    print(f"\n{'=' * 60}")
    print("EXTRACTION COMPLETE")
    print(f"{'=' * 60}")
    print(f"  Time elapsed:       {elapsed:.0f} min")
    print(f"  URLs scanned:       {total}")
    print(f"  Articles extracted:  {len(articles)}")
    print(f"  P1 (evergreen):     {len(p1)}")
    print(f"  P2 (needs update):  {len(p2)}")
    print(f"  P3 (thin/stale):    {len(p3)}")
    print(f"  Skip:               {len(skips)}")
    print(f"  Challenge pages:    {challenge_count}")
    print(f"  Other failures:     {len(errors)}")
    print(f"  Total words:        ~{total_words:,}")


if __name__ == '__main__':
    main()
