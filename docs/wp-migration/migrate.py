#!/usr/bin/env python3
"""
Transform extracted WordPress articles and produce Sanity-ready JSON.
Reads wp-content-inventory.md, transforms content, outputs articles.json.
"""

import json
import re
import uuid
import hashlib
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent

# ─── Article definitions (27 articles) ────────────────────────────────
# Maps inventory title -> (slug, category_id, difficulty, is_2025)
ARTICLES = {
    "רווחים כלואים": {
        "slug": "trapped-profits",
        "category": "cat-companies",
        "difficulty": "advanced",
        "is_2025": True,
    },
    "חברת מעטים": {
        "slug": "closely-held-company",
        "category": "cat-companies",
        "difficulty": "advanced",
        "is_2025": True,
    },
    "הקפאת מדרגות מס, מס יסף ומס הוני נוסף": {
        "slug": "tax-bracket-freeze-surcharge-2025",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": True,
    },
    'עדכון חקיקה מע"מ – 18%': {
        "slug": "vat-18-percent-update-2025",
        "category": "cat-vat",
        "difficulty": "basic",
        "is_2025": True,
        "title_override": 'עדכון חקיקה: מע"מ 18%',
    },
    "בעלי הכנסה מעבודה בחו\"ל": {
        "slug": "income-from-work-abroad",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "דירת מגורים מזכה": {
        "slug": "qualifying-residential-apartment",
        "category": "cat-real-estate-tax",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "הוצאות נלוות": {
        "slug": "ancillary-expenses",
        "category": "cat-income-tax",
        "difficulty": "basic",
        "is_2025": False,
    },
    "הוצאות נסיעות לחו\"ל מוכרות למס הכנסה לשנת 2017": {
        "slug": "deductible-travel-expenses-abroad",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": 'הוצאות נסיעות לחו"ל מוכרות למס הכנסה',
    },
    "היערכות חברות לתום שנת מס 2016": {
        "slug": "year-end-prep-companies-2016",
        "category": "cat-companies",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "הערכות חברה לתום שנת 2019": {
        "slug": "year-end-prep-companies-2019",
        "category": "cat-companies",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": "היערכות חברות לתום שנת המס 2019",
    },
    "הערכות חברות לתום שנת 2016": {
        "slug": "year-end-prep-companies-overview-2016",
        "category": "cat-companies",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": "היערכות חברות לתום שנת המס 2016 — סקירה כללית",
    },
    "הערכות עצמאים לתום שנת מס 2016": {
        "slug": "year-end-prep-freelancers-2016",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": "היערכות עצמאים לתום שנת המס 2016",
    },
    "הקשר בין סעיף 17(4) לפקודת מס הכנסה להודעת זיכוי –": {
        "slug": "section-17-4-credit-note-connection",
        "category": "cat-income-tax",
        "difficulty": "advanced",
        "is_2025": False,
        "title_override": "הקשר בין סעיף 17(4) לפקודת מס הכנסה להודעת זיכוי",
    },
    "זכאות לשיעור מס מופחת – אזרחים מעל גיל 60": {
        "slug": "reduced-tax-rate-over-60",
        "category": "cat-income-tax",
        "difficulty": "basic",
        "is_2025": False,
        "title_override": "זכאות לשיעור מס מופחת לאזרחים מעל גיל 60",
    },
    "חוזר מקצועי – שינויים בשכר החל מיום 1 בינואר 2017": {
        "slug": "salary-changes-january-2017",
        "category": "cat-payroll",
        "difficulty": "basic",
        "is_2025": False,
        "title_override": "שינויים בשכר החל מינואר 2017",
    },
    "חישוב גידול / קיטון בהון – מקורות ושימושים": {
        "slug": "wealth-increase-decrease-sources-uses",
        "category": "cat-income-tax",
        "difficulty": "advanced",
        "is_2025": False,
        "title_override": "חישוב גידול וקיטון בהון — מקורות ושימושים",
    },
    "כללים להוצאת הודעת זיכוי (חשבונית זיכוי)": {
        "slug": "credit-note-rules",
        "category": "cat-vat",
        "difficulty": "basic",
        "is_2025": False,
        "title_override": "כללים להוצאת הודעת זיכוי (חשבונית זיכוי)",
    },
    "מענק עבודה": {
        "slug": "work-grant-negative-income-tax",
        "category": "cat-income-tax",
        "difficulty": "basic",
        "is_2025": False,
    },
    "סוגי תשלומים שהעברתם לתושב חוץ פטורה מניכוי מס במקור": {
        "slug": "payments-to-foreign-residents-withholding-exempt",
        "category": "cat-income-tax",
        "difficulty": "advanced",
        "is_2025": False,
        "title_override": "סוגי תשלומים לתושב חוץ הפטורים מניכוי מס במקור",
    },
    "פטור חד פעמי ממס שבח על 2 דירות": {
        "slug": "one-time-betterment-tax-exemption-two-apartments",
        "category": "cat-real-estate-tax",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "פטור ממס שבח": {
        "slug": "betterment-tax-exemption",
        "category": "cat-real-estate-tax",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "פטור ממשיכת כספי תגמולים החייבים ב-35% מס": {
        "slug": "severance-fund-withdrawal-35-percent-exemption",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": 'פטור ממשיכת כספי תגמולים החייבים ב-35% מס',
    },
    "פריסת מס שבח": {
        "slug": "betterment-tax-spreading",
        "category": "cat-real-estate-tax",
        "difficulty": "intermediate",
        "is_2025": False,
    },
    "ריכוז טבלת שיעורי המס החלים על הכנסות  ועל רווחי י": {
        "slug": "tax-rate-table-summary",
        "category": "cat-income-tax",
        "difficulty": "intermediate",
        "is_2025": False,
        "title_override": "ריכוז טבלת שיעורי המס על הכנסות ורווחי הון",
    },
    "שאלות ותשובות בנושא דברים שחובה בחשבונית": {
        "slug": "invoice-requirements-faq",
        "category": "cat-vat",
        "difficulty": "basic",
        "is_2025": False,
        "title_override": "שאלות ותשובות: מה חובה בחשבונית מס",
    },
    "תיקון 190": {
        "slug": "amendment-190",
        "category": "cat-income-tax",
        "difficulty": "advanced",
        "is_2025": False,
    },
    "תשלום מס שבח": {
        "slug": "betterment-tax-payment",
        "category": "cat-real-estate-tax",
        "difficulty": "basic",
        "is_2025": False,
    },
}

# Also try matching with slightly different title variants
TITLE_VARIANTS = {}
for title in ARTICLES:
    # Create normalized version for matching
    norm = title.strip().rstrip('–').rstrip('-').strip()
    TITLE_VARIANTS[norm] = title
    # Also without quotes
    no_quotes = norm.replace('"', '').replace("'", '').replace('"', '').replace('"', '')
    TITLE_VARIANTS[no_quotes] = title


# ─── Boilerplate patterns to remove ──────────────────────────────────

BOILERPLATE_PATTERNS = [
    r'להצטרפות לדף הפייסבוק העסקי[^\n]*',
    r'להצטרפות לקבוצת פייסבוק[^\n]*',
    r'לפרטים נוספים ו/או שאלות והבהרות נוספות ניתן לפנות.*?ממשרדנו\.?',
    r'לפרטים נוספים.*?לפנות ל.*?רו"ח.*?ממשרדנו\.?',
    r'\*\*\* ?המידע מנוסח בלשון זכר.*?\*\*\*',
    r'\*המידע מנוסח בלשון זכר.*?\*',
    r'שימוש במידע המקצועי באתר הינו על אחריות המשתמש.*?ייעוץ.*?חוות דעת\.?',
    r'\[Image: information logo\]',
    r'\[Image:.*?\]',
    r'Print Friendly',
    r'שלכם,?\s*האחים ביטן\.?',
    r'נשמח לעמוד לרשותכם לכל שאלה ו/או הבהרה.*?\.?',
    r'נשמח לסייע.*?\.?$',
    r'להתקשר.*?03-5174295.*',
    r'לחץ כאן[^\n]*',
]

STANDARD_ENDING = """---
לייעוץ מקצועי פרטני בנושא, צרו קשר עם משרד ביטן את ביטן.

*המידע באתר הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני.*"""

DATE_DISCLAIMER = 'הערה: מאמר זה פורסם במקור בשנת {year}. הנתונים והסכומים עשויים להשתנות — יש לבדוק את העדכונים האחרונים.'


def parse_articles_from_inventory():
    """Parse article sections from wp-content-inventory.md."""
    with open(OUTPUT_DIR / "wp-content-inventory.md", 'r', encoding='utf-8') as f:
        content = f.read()

    # Split on article headers (## Title after the "# Full Content" section)
    full_content_idx = content.find("# Full Content")
    if full_content_idx == -1:
        print("ERROR: Could not find '# Full Content' section")
        return []

    content = content[full_content_idx:]

    # Split by article sections
    sections = re.split(r'\n---\n\n## ', content)

    articles = []
    for section in sections[1:]:  # Skip the "# Full Content" header
        lines = section.strip().split('\n')
        if not lines:
            continue

        title = lines[0].strip()

        # Parse metadata
        meta = {}
        body_start = 0
        for i, line in enumerate(lines[1:], 1):
            if line.startswith('**URL:**'):
                meta['url'] = line.replace('**URL:**', '').strip()
            elif line.startswith('**Date:**'):
                meta['date'] = line.replace('**Date:**', '').strip()
            elif line.startswith('**Category:**'):
                meta['category'] = line.replace('**Category:**', '').strip()
            elif line.startswith('**Word Count:**'):
                meta['word_count'] = int(line.replace('**Word Count:**', '').strip())
            elif line.startswith('**Quality:**'):
                meta['quality'] = line.replace('**Quality:**', '').strip()
            elif line.startswith('**Priority:**'):
                meta['priority'] = line.replace('**Priority:**', '').strip()
                body_start = i + 1
                break

        body = '\n'.join(lines[body_start:]).strip()

        articles.append({
            'title': title,
            'body': body,
            **meta
        })

    return articles


def match_article(title):
    """Match an extracted article title to our ARTICLES config."""
    # Direct match
    if title in ARTICLES:
        return ARTICLES[title]

    # Try normalized
    norm = title.strip().rstrip('–').rstrip('-').strip()
    if norm in TITLE_VARIANTS:
        return ARTICLES[TITLE_VARIANTS[norm]]

    # Try partial match - find the best match
    for key in ARTICLES:
        # Check if key starts with same words
        if title.startswith(key[:30]) or key.startswith(title[:30]):
            return ARTICLES[key]

    # Try with quote variations
    title_noquote = title.replace('"', '').replace("'", '').replace('"', '').replace('"', '')
    for key in ARTICLES:
        key_noquote = key.replace('"', '').replace("'", '').replace('"', '').replace('"', '')
        if title_noquote.startswith(key_noquote[:25]) or key_noquote.startswith(title_noquote[:25]):
            return ARTICLES[key]

    return None


def transform_body(body, config):
    """Apply transformations to article body text."""
    text = body

    # Remove boilerplate
    for pattern in BOILERPLATE_PATTERNS:
        text = re.sub(pattern, '', text, flags=re.MULTILINE | re.DOTALL)

    # Remove "בעל עסק יקר" openings
    text = re.sub(r'^בעל עסק יקר,?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^בעלי עסקים יקרים,?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^לקוחות יקרים,?\s*', '', text, flags=re.MULTILINE)

    # Remove exclamation marks (keep single ?)
    text = re.sub(r'!{1,}', '.', text)

    # Clean up multiple blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove trailing whitespace on lines
    text = re.sub(r' +\n', '\n', text)

    return text.strip()


def generate_excerpt(title, body):
    """Generate a Hebrew excerpt from the article body."""
    # Take first meaningful paragraph
    paragraphs = [p.strip() for p in body.split('\n\n') if p.strip() and not p.startswith('#') and len(p.strip()) > 30]
    if paragraphs:
        excerpt = paragraphs[0]
        # Truncate to ~200 chars at word boundary
        if len(excerpt) > 200:
            excerpt = excerpt[:197]
            last_space = excerpt.rfind(' ')
            if last_space > 150:
                excerpt = excerpt[:last_space]
            excerpt += '...'
        return excerpt
    return title


def make_key():
    """Generate a unique _key for Portable Text blocks."""
    return uuid.uuid4().hex[:12]


def text_to_portable_text(text, config):
    """Convert markdown-like text to Sanity Portable Text blocks."""
    blocks = []

    # Add date disclaimer for older articles
    if not config.get('is_2025', False):
        date = config.get('date', '')
        year = date[:4] if date else '2017'
        disclaimer_text = DATE_DISCLAIMER.format(year=year)
        blocks.append({
            "_type": "block",
            "_key": make_key(),
            "style": "blockquote",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": make_key(),
                    "text": disclaimer_text,
                    "marks": ["strong"]
                }
            ]
        })

    lines = text.split('\n')
    current_list_items = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines
        if not line:
            # Flush any pending list items
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            i += 1
            continue

        # Heading
        if line.startswith('## '):
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            heading_text = line[3:].strip()
            if heading_text:
                blocks.append({
                    "_type": "block",
                    "_key": make_key(),
                    "style": "h2",
                    "markDefs": [],
                    "children": [
                        {"_type": "span", "_key": make_key(), "text": heading_text, "marks": []}
                    ]
                })
            i += 1
            continue

        if line.startswith('### '):
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            heading_text = line[4:].strip()
            if heading_text:
                blocks.append({
                    "_type": "block",
                    "_key": make_key(),
                    "style": "h3",
                    "markDefs": [],
                    "children": [
                        {"_type": "span", "_key": make_key(), "text": heading_text, "marks": []}
                    ]
                })
            i += 1
            continue

        if line.startswith('# ') and not line.startswith('## '):
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            heading_text = line[2:].strip()
            if heading_text:
                blocks.append({
                    "_type": "block",
                    "_key": make_key(),
                    "style": "h2",
                    "markDefs": [],
                    "children": [
                        {"_type": "span", "_key": make_key(), "text": heading_text, "marks": []}
                    ]
                })
            i += 1
            continue

        # List item
        if line.startswith('- '):
            item_text = line[2:].strip()
            if item_text:
                current_list_items.append({
                    "_type": "block",
                    "_key": make_key(),
                    "style": "normal",
                    "listItem": "bullet",
                    "level": 1,
                    "markDefs": [],
                    "children": [
                        {"_type": "span", "_key": make_key(), "text": item_text, "marks": []}
                    ]
                })
            i += 1
            continue

        # Table — convert to text
        if line.startswith('[table]'):
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            i += 1
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = lines[i].strip()
                cells = [c.strip() for c in row.split('|') if c.strip()]
                if cells:
                    row_text = ' | '.join(cells)
                    blocks.append({
                        "_type": "block",
                        "_key": make_key(),
                        "style": "normal",
                        "markDefs": [],
                        "children": [
                            {"_type": "span", "_key": make_key(), "text": row_text, "marks": []}
                        ]
                    })
                i += 1
            continue

        # Table rows without [table] marker
        if line.startswith('|') and '|' in line[1:]:
            if current_list_items:
                blocks.extend(current_list_items)
                current_list_items = []
            cells = [c.strip() for c in line.split('|') if c.strip()]
            if cells:
                row_text = ' | '.join(cells)
                blocks.append({
                    "_type": "block",
                    "_key": make_key(),
                    "style": "normal",
                    "markDefs": [],
                    "children": [
                        {"_type": "span", "_key": make_key(), "text": row_text, "marks": []}
                    ]
                })
            i += 1
            continue

        # HR / separator
        if line == '---':
            i += 1
            continue

        # Regular paragraph
        if current_list_items:
            blocks.extend(current_list_items)
            current_list_items = []

        # Collect multi-line paragraph (lines until next blank line or heading)
        para_lines = [line]
        i += 1
        while i < len(lines):
            next_line = lines[i].strip()
            if not next_line or next_line.startswith('#') or next_line.startswith('- ') or next_line.startswith('[table]') or next_line.startswith('|') or next_line == '---':
                break
            para_lines.append(next_line)
            i += 1

        para_text = ' '.join(para_lines)

        # Skip the standard ending if it snuck through
        if 'לייעוץ מקצועי פרטני' in para_text or 'המידע באתר הינו כללי' in para_text:
            continue

        if para_text and len(para_text) > 3:
            # Handle bold markers in text
            children = parse_inline_marks(para_text)
            blocks.append({
                "_type": "block",
                "_key": make_key(),
                "style": "normal",
                "markDefs": [],
                "children": children
            })

    # Flush remaining list items
    if current_list_items:
        blocks.extend(current_list_items)

    # Add standard ending
    blocks.append({
        "_type": "block",
        "_key": make_key(),
        "style": "normal",
        "markDefs": [],
        "children": [{"_type": "span", "_key": make_key(), "text": "---", "marks": []}]
    })
    blocks.append({
        "_type": "block",
        "_key": make_key(),
        "style": "normal",
        "markDefs": [],
        "children": [
            {"_type": "span", "_key": make_key(), "text": "לייעוץ מקצועי פרטני בנושא, צרו קשר עם משרד ביטן את ביטן.", "marks": []}
        ]
    })
    blocks.append({
        "_type": "block",
        "_key": make_key(),
        "style": "normal",
        "markDefs": [],
        "children": [
            {"_type": "span", "_key": make_key(), "text": "המידע באתר הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני.", "marks": ["em"]}
        ]
    })

    return blocks


def parse_inline_marks(text):
    """Parse inline bold/italic from markdown-like text into Portable Text children."""
    # Simple approach: just return as plain text (no inline marks parsing needed for these articles)
    return [{"_type": "span", "_key": make_key(), "text": text, "marks": []}]


def build_sanity_document(title, config, body_blocks, date):
    """Build a complete Sanity article document."""
    doc_id = f"wp-{config['slug']}"

    # Use title_override if provided
    final_title = config.get('title_override', title)

    # publishedAt — use original date, add time component
    published_at = None
    if date and len(date) >= 10:
        published_at = f"{date}T12:00:00.000Z"

    # Generate excerpt from first paragraph block
    excerpt = ''
    for block in body_blocks:
        if block.get('style') == 'normal' and not block.get('listItem'):
            children = block.get('children', [])
            if children:
                text = children[0].get('text', '')
                if len(text) > 30 and 'הערה:' not in text and '---' not in text:
                    excerpt = text[:200]
                    if len(text) > 200:
                        last_space = excerpt.rfind(' ')
                        if last_space > 150:
                            excerpt = excerpt[:last_space]
                        excerpt += '...'
                    break

    doc = {
        "_id": doc_id,
        "_type": "article",
        "title": final_title,
        "slug": {"_type": "slug", "current": config['slug']},
        "publishedAt": published_at,
        "excerpt": excerpt,
        "difficulty": config.get('difficulty', 'intermediate'),
        "body": body_blocks,
        "disclaimer": "המידע באתר הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני.",
    }

    return doc


def main():
    print("=" * 60)
    print("WordPress → Sanity Article Migration")
    print("=" * 60)

    # Parse articles from inventory
    print("\nParsing articles from inventory...")
    raw_articles = parse_articles_from_inventory()
    print(f"  Found {len(raw_articles)} articles in inventory")

    # Match and transform
    results = []
    not_found = []

    for raw in raw_articles:
        config = match_article(raw['title'])
        if not config:
            continue  # Not in our target list

        print(f"\n  Processing: {raw['title'][:50]}...")

        # Transform body
        transformed = transform_body(raw['body'], config)

        # Add date to config for disclaimer
        config['date'] = raw.get('date', '')

        # Convert to Portable Text
        body_blocks = text_to_portable_text(transformed, config)

        # Build document
        doc = build_sanity_document(raw['title'], config, body_blocks, raw.get('date', ''))

        results.append({
            'doc': doc,
            'config': config,
            'original_title': raw['title'],
            'word_count': raw.get('word_count', 0),
        })

    # Check which articles we didn't find
    found_slugs = {r['config']['slug'] for r in results}
    for title, config in ARTICLES.items():
        if config['slug'] not in found_slugs:
            not_found.append(title)

    print(f"\n{'=' * 60}")
    print(f"Results: {len(results)} articles transformed")
    if not_found:
        print(f"NOT FOUND in inventory ({len(not_found)}):")
        for t in not_found:
            print(f"  - {t}")

    # Write output JSON
    output = {
        'articles': [r['doc'] for r in results],
        'summary': [
            {
                'title': r['doc']['title'],
                'slug': r['config']['slug'],
                'category': r['config']['category'],
                'word_count': r['word_count'],
                'date': r['config'].get('date', ''),
                'is_2025': r['config'].get('is_2025', False),
                'blocks': len(r['doc']['body']),
            }
            for r in results
        ]
    }

    out_path = OUTPUT_DIR / "articles.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nOutput: {out_path}")
    print(f"Total articles: {len(results)}")
    total_words = sum(r['word_count'] for r in results)
    print(f"Total words: ~{total_words:,}")

    # Print summary table
    print(f"\n{'#':>3} | {'Title':<45} | {'Slug':<40} | {'Cat':<20} | {'Words':>6}")
    print("-" * 130)
    for i, r in enumerate(results, 1):
        t = r['doc']['title'][:44]
        s = r['config']['slug'][:39]
        c = r['config']['category']
        w = r['word_count']
        print(f"{i:>3} | {t:<45} | {s:<40} | {c:<20} | {w:>6}")


if __name__ == '__main__':
    main()
