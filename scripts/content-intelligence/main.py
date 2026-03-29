#!/usr/bin/env python3
"""
Bitan & Bitan — Content Intelligence Scanner
Runs weekly (Sunday morning, after performance report).

1. Pull GSC query data — find high-impression, low-CTR keyword gaps
2. Pull all articles from Sanity — match queries to existing content
3. Score opportunities (new article vs update vs stale)
4. Write contentOpportunity documents to Sanity
5. Send content brief email via Resend
"""

import os
import sys
import json
import re
import base64
import tempfile
from datetime import datetime, timedelta

import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

# ── Config ──────────────────────────────────────────────────────────────

SANITY_PROJECT_ID = "ul4uwnp7"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2024-01-01"
SITE_URL = "sc-domain:bitancpa.com"
GA4_PROPERTY_ID = "525595931"
GSC_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
STALE_THRESHOLD_MONTHS = 6
MIN_IMPRESSIONS = 10
MIN_VIEWS_FOR_STALE = 5

SANITY_TOKEN = os.environ.get("SANITY_API_WRITE_TOKEN", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
REPORT_RECIPIENTS = os.environ.get("REPORT_RECIPIENTS", "").split(",")
REPORT_FROM = os.environ.get(
    "REPORT_FROM", "ביטן את ביטן - דוחות <reports@bitancpa.com>"
)

_tmp_creds_path = None


# ── Credentials ─────────────────────────────────────────────────────────

def setup_credentials():
    global _tmp_creds_path
    creds_b64 = os.environ.get("GA4_CREDENTIALS_B64")
    if creds_b64:
        creds_json = base64.b64decode(creds_b64).decode("utf-8")
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        )
        tmp.write(creds_json)
        tmp.close()
        _tmp_creds_path = tmp.name
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp.name
        return tmp.name
    local_path = os.path.expanduser("~/ga4-credentials.json")
    if os.path.exists(local_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = local_path
        return local_path
    raise RuntimeError("No GA4 credentials found. Set GA4_CREDENTIALS_B64.")


def cleanup_credentials():
    if _tmp_creds_path and os.path.exists(_tmp_creds_path):
        os.unlink(_tmp_creds_path)


# ── Date Range ──────────────────────────────────────────────────────────

def get_previous_week_range():
    today = datetime.now()
    day_of_week = today.weekday()
    days_since_last_sat = (day_of_week + 2) % 7
    if days_since_last_sat == 0:
        days_since_last_sat = 7
    end = today - timedelta(days=days_since_last_sat)
    start = end - timedelta(days=6)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


# ── GSC ─────────────────────────────────────────────────────────────────

def pull_gsc_queries(start_date, end_date):
    """Pull top 100 queries by impressions."""
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=GSC_SCOPES
    )
    svc = build("searchconsole", "v1", credentials=creds)

    # Get queries sorted by impressions (not clicks) — we want untapped potential
    resp = svc.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["query"],
            "rowLimit": 100,
            "dimensionFilterGroups": [{
                "filters": [{
                    "dimension": "query",
                    "operator": "excludingRegex",
                    # Exclude branded queries — we already own those
                    "expression": "ביטן|bitan|bitancpa",
                }],
            }],
        },
    ).execute()

    queries = []
    for r in resp.get("rows", []):
        queries.append({
            "query": r["keys"][0],
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
            "ctr": round(r["ctr"], 4),
            "position": round(r["position"], 1),
        })

    # Sort by impressions descending
    queries.sort(key=lambda x: x["impressions"], reverse=True)
    return queries


def pull_gsc_pages(start_date, end_date):
    """Pull page-level GSC data for cross-referencing."""
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=GSC_SCOPES
    )
    svc = build("searchconsole", "v1", credentials=creds)

    resp = svc.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["page"],
            "rowLimit": 50,
        },
    ).execute()

    pages = {}
    for r in resp.get("rows", []):
        path = r["keys"][0].replace("https://bitancpa.com", "") or "/"
        pages[path] = {
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
        }
    return pages


# ── GA4 (for staleness — need pageviews) ────────────────────────────────

def pull_ga4_page_views(start_date, end_date):
    """Pull page views from GA4 for staleness check."""
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        RunReportRequest, DateRange, Dimension, Metric, OrderBy
    )
    client = BetaAnalyticsDataClient()
    resp = client.run_report(RunReportRequest(
        property="properties/{}".format(GA4_PROPERTY_ID),
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        order_bys=[OrderBy(
            metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"),
            desc=True,
        )],
        limit=100,
    ))
    views = {}
    for row in resp.rows:
        path = row.dimension_values[0].value
        views[path] = int(row.metric_values[0].value)
    return views


# ── Sanity ──────────────────────────────────────────────────────────────

def sanity_query(groq, params=None):
    url = "https://{}.api.sanity.io/v{}/data/query/{}".format(
        SANITY_PROJECT_ID, SANITY_API_VERSION, SANITY_DATASET
    )
    headers = {"Authorization": "Bearer {}".format(SANITY_TOKEN)}
    p = {"query": groq}
    if params:
        for k, v in params.items():
            p["${}".format(k)] = '"{}"'.format(v)
    resp = requests.get(url, headers=headers, params=p)
    resp.raise_for_status()
    return resp.json().get("result")


def sanity_mutate(mutations):
    url = "https://{}.api.sanity.io/v{}/data/mutate/{}".format(
        SANITY_PROJECT_ID, SANITY_API_VERSION, SANITY_DATASET
    )
    headers = {
        "Authorization": "Bearer {}".format(SANITY_TOKEN),
        "Content-Type": "application/json",
    }
    resp = requests.post(url, headers=headers, json={"mutations": mutations})
    resp.raise_for_status()
    return resp.json()


def get_all_articles():
    """Get all articles with title, slug, and update date."""
    result = sanity_query(
        '*[_type == "article"] {'
        '  _id, title, "slug": slug.current, _updatedAt, _createdAt'
        '}'
    )
    return result or []


def get_existing_opportunities():
    """Get existing contentOpportunity docs to avoid duplicates."""
    result = sanity_query(
        '*[_type == "contentOpportunity" && status in ["opportunity", "drafting"]] {'
        '  _id, keyword, status'
        '}'
    )
    return result or []


# ── Matching ────────────────────────────────────────────────────────────

def normalize(text):
    """Normalize Hebrew text for matching."""
    # Remove punctuation, quotes, dashes
    text = re.sub(r'["\'\-—–:.,!?()״׳]', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def find_matching_article(query, articles):
    """Find the best matching article for a query."""
    query_norm = normalize(query)
    query_words = set(query_norm.split())

    # Remove very common Hebrew words
    stop_words = {
        "של", "על", "את", "זה", "מה", "איך", "לא", "כל", "עם", "בין",
        "או", "גם", "רק", "כי", "אם", "הם", "היא", "הוא", "אני",
    }
    query_words = query_words - stop_words

    if len(query_words) < 1:
        return None

    best_match = None
    best_score = 0

    for article in articles:
        title = article.get("title", "")
        slug = article.get("slug", "")

        title_norm = normalize(title)
        title_words = set(title_norm.split()) - stop_words

        # Word overlap score
        overlap = len(query_words & title_words)
        if overlap == 0:
            continue

        # Normalized overlap (proportion of query words found in title)
        score = overlap / len(query_words) if query_words else 0

        # Bonus for slug match
        slug_words = set(slug.replace("-", " ").split())
        slug_overlap = len(query_words & slug_words)
        score += slug_overlap * 0.1

        if score > best_score and score >= 0.4:
            best_match = article
            best_score = score

    return best_match


# ── Scoring ─────────────────────────────────────────────────────────────

def score_opportunity(impressions, position, ctr, has_article, article_age_months=None):
    """Score an opportunity from 0-100."""
    score = 0

    # Impressions (0-30): more impressions = bigger audience
    if impressions >= 500:
        score += 30
    elif impressions >= 200:
        score += 25
    elif impressions >= 100:
        score += 20
    elif impressions >= 50:
        score += 15
    else:
        score += 8

    # Position (0-30): 3-10 = page 1 bottom (easy push), 10-20 = reachable
    if 3 <= position <= 10:
        score += 30
    elif 10 < position <= 15:
        score += 25
    elif 15 < position <= 20:
        score += 20
    elif 20 < position <= 30:
        score += 12
    else:
        score += 5

    # CTR gap (0-20): low CTR relative to position = room to improve
    # Expected CTR by position (rough Google averages)
    expected = max(0.30 - (position - 1) * 0.025, 0.01)
    gap = max(expected - ctr, 0)
    score += min(int(gap * 250), 20)

    # Article status (0-20)
    if not has_article:
        score += 20  # No article = biggest opportunity
    elif article_age_months is not None and article_age_months > 12:
        score += 18
    elif article_age_months is not None and article_age_months > 6:
        score += 14
    elif article_age_months is not None and article_age_months > 3:
        score += 8

    return min(score, 100)


def months_since(date_str):
    """Calculate months since a date string."""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
        delta = now - dt
        return round(delta.days / 30.44)
    except (ValueError, TypeError):
        return None


# ── Query Grouping ──────────────────────────────────────────────────────

def group_related_queries(queries):
    """Group queries that likely refer to the same topic."""
    groups = []
    used = set()

    for i, q in enumerate(queries):
        if i in used:
            continue
        group = [q]
        used.add(i)
        q_words = set(normalize(q["query"]).split())

        for j, other in enumerate(queries):
            if j in used or j == i:
                continue
            other_words = set(normalize(other["query"]).split())
            # If queries share 60%+ of their words, group them
            if len(q_words) >= 2 and len(other_words) >= 2:
                overlap = len(q_words & other_words)
                min_len = min(len(q_words), len(other_words))
                if min_len > 0 and overlap / min_len >= 0.6:
                    group.append(other)
                    used.add(j)

        # Use highest-impression query as the group leader
        group.sort(key=lambda x: x["impressions"], reverse=True)
        leader = group[0]
        groups.append({
            "keyword": leader["query"],
            "impressions": sum(g["impressions"] for g in group),
            "clicks": sum(g["clicks"] for g in group),
            "position": leader["position"],  # Best position in group
            "ctr": leader["ctr"],
            "related": [g["query"] for g in group[1:]][:5],
            "query_count": len(group),
        })

    return groups


# ── Staleness Detection ────────────────────────────────────────────────

def find_stale_articles(articles, page_views):
    """Find articles that get traffic but haven't been updated recently."""
    stale = []
    now = datetime.now()

    for article in articles:
        slug = article.get("slug", "")
        if not slug:
            continue

        # Find matching page view path
        path = "/knowledge/{}".format(slug)
        views = page_views.get(path, 0)

        if views < MIN_VIEWS_FOR_STALE:
            continue

        updated = article.get("_updatedAt", article.get("_createdAt", ""))
        age = months_since(updated)

        if age is not None and age >= STALE_THRESHOLD_MONTHS:
            stale.append({
                "article": article,
                "views_per_week": views,
                "months_since_update": age,
                "slug": slug,
            })

    stale.sort(key=lambda x: x["views_per_week"], reverse=True)
    return stale


# ── Write to Sanity ────────────────────────────────────────────────────

def write_opportunities(opportunities, stale_articles, period_end):
    """Write/update contentOpportunity documents in Sanity."""
    mutations = []

    for opp in opportunities:
        # Sanity IDs must be ASCII-safe — hash the keyword
        import hashlib
        keyword_hash = hashlib.md5(opp["keyword"].encode("utf-8")).hexdigest()[:12]
        doc_id = "contentOpp-{}".format(keyword_hash)
        doc = {
            "_id": doc_id,
            "_type": "contentOpportunity",
            "keyword": opp["keyword"],
            "opportunityType": opp["type"],
            "status": "opportunity",
            "score": opp["score"],
            "weeklyImpressions": opp["impressions"],
            "currentPosition": opp["position"],
            "currentCtr": opp["ctr"],
            "weeklyClicks": opp["clicks"],
            "relatedQueries": "\n".join(opp.get("related", [])),
            "recommendation": opp["recommendation"],
            "detectedAt": period_end,
            "dataJson": json.dumps(opp, ensure_ascii=False),
        }
        if opp.get("article_id"):
            doc["existingArticle"] = {
                "_type": "reference",
                "_ref": opp["article_id"],
            }
        if opp.get("article_age"):
            doc["articleAgeMonths"] = opp["article_age"]

        mutations.append({"createOrReplace": doc})

    for stale in stale_articles[:10]:
        article = stale["article"]
        doc_id = "contentOpp-stale-{}".format(article["_id"][:40])
        doc = {
            "_id": doc_id,
            "_type": "contentOpportunity",
            "keyword": article.get("title", ""),
            "opportunityType": "stale",
            "status": "opportunity",
            "score": min(50 + stale["views_per_week"], 90),
            "weeklyImpressions": 0,
            "weeklyClicks": 0,
            "recommendation": "מאמר מקבל {} צפיות בשבוע אבל לא עודכן {} חודשים. יש לבדוק שהמידע עדכני.".format(
                stale["views_per_week"], stale["months_since_update"]
            ),
            "existingArticle": {
                "_type": "reference",
                "_ref": article["_id"],
            },
            "articleAgeMonths": stale["months_since_update"],
            "detectedAt": datetime.now().strftime("%Y-%m-%d"),
            "dataJson": json.dumps(stale, ensure_ascii=False, default=str),
        }
        mutations.append({"createOrReplace": doc})

    if mutations:
        sanity_mutate(mutations)
        print("Wrote {} opportunity documents to Sanity".format(len(mutations)))


# ── HTML Email ──────────────────────────────────────────────────────────

def fmt_date_he(date_str):
    parts = date_str.split("-")
    return "{}.{}.{}".format(parts[2], parts[1], parts[0][2:])


def generate_email(opportunities, stale_articles, period_end):
    """Generate content brief email."""

    # Opportunity rows
    opp_html = ""
    for i, opp in enumerate(opportunities[:5]):
        type_label = "מאמר חדש" if opp["type"] == "new" else "עדכון מאמר"
        type_color = "#e74c3c" if opp["type"] == "new" else "#f39c12"
        related_text = ""
        if opp.get("related"):
            related_text = '<div style="font-size:11px;color:#888;margin-top:4px;">ביטויים קשורים: {}</div>'.format(
                " · ".join(opp["related"][:3])
            )

        opp_html += """
        <tr><td style="padding:16px;border-bottom:1px solid #eee;">
            <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="direction:rtl;">
            <tr>
                <td style="vertical-align:top;">
                    <div style="font-size:15px;font-weight:700;color:#102040;margin-bottom:4px;">{keyword}</div>
                    <div style="font-size:12px;margin-bottom:6px;">
                        <span style="background:{type_color};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;">{type_label}</span>
                    </div>
                    <div style="font-size:13px;color:#444;">{recommendation}</div>
                    {related}
                </td>
                <td width="90" style="vertical-align:top;text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:#102040;">{score}</div>
                    <div style="font-size:10px;color:#888;">ציון</div>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="padding-top:8px;">
                    <table cellpadding="0" cellspacing="0" style="font-size:11px;color:#666;">
                    <tr>
                        <td style="padding-left:16px;">{impressions} חשיפות/שבוע</td>
                        <td style="padding-left:16px;">מיקום {position}</td>
                        <td style="padding-left:16px;">CTR {ctr}%</td>
                        <td>{clicks} הקלקות</td>
                    </tr>
                    </table>
                </td>
            </tr>
            </table>
        </td></tr>""".format(
            keyword=opp["keyword"],
            type_color=type_color,
            type_label=type_label,
            recommendation=opp["recommendation"],
            related=related_text,
            score=opp["score"],
            impressions=opp["impressions"],
            position=opp["position"],
            ctr=round(opp["ctr"] * 100, 1),
            clicks=opp["clicks"],
        )

    # Stale articles section
    stale_html = ""
    if stale_articles:
        stale_rows = ""
        for s in stale_articles[:5]:
            title = s["article"].get("title", s["slug"])
            if len(title) > 45:
                title = "..." + title[:42]
            stale_rows += """
            <tr>
                <td dir="rtl" style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;direction:rtl;">{}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px;">{}/שבוע</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px;color:#e74c3c;">{} חודשים</td>
            </tr>""".format(title, s["views_per_week"], s["months_since_update"])

        stale_html = """
<!-- Stale Content -->
<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:8px 0 16px;"></td></tr>
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">&#9888;&#65039; תוכן שדורש עדכון</h3>
    <p dir="rtl" style="font-size:12px;color:#666;margin:0 0 12px;text-align:right;">מאמרים שמקבלים תנועה אבל לא עודכנו מעל 6 חודשים</p>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;direction:rtl;">
    <tr style="background:#f8f8f8;">
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:right;">מאמר</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:center;width:90px;">צפיות</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:center;width:90px;">לא עודכן</td>
    </tr>
    {}
    </table>
</td></tr>""".format(stale_rows)

    no_opps = ""
    if not opportunities:
        no_opps = """
        <tr><td style="padding:24px;text-align:center;color:#888;font-size:14px;">
            לא נמצאו הזדמנויות חדשות השבוע. המשיכו ליצור תוכן איכותי!
        </td></tr>"""

    html = """<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body dir="rtl" style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
<table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;direction:rtl;">
<tr><td align="center">
<table dir="rtl" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);direction:rtl;">

<!-- Header -->
<tr><td style="background:#102040;padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#C5A572;font-size:22px;font-weight:700;">הזדמנויות תוכן שבועיות</h1>
    <p style="margin:8px 0 0;color:#fff;font-size:14px;opacity:0.85;">ביטן את ביטן — רואי חשבון</p>
    <p style="margin:6px 0 0;color:#C5A572;font-size:13px;">עד {period}</p>
</td></tr>

<!-- Summary -->
<tr><td dir="rtl" style="padding:20px 32px 8px;text-align:right;direction:rtl;">
    <p style="font-size:13px;color:#444;margin:0;">
        נמצאו <strong>{opp_count} הזדמנויות</strong> לתוכן חדש או עדכון,
        מדורגות לפי פוטנציאל תנועה.
        {stale_count}
    </p>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:12px 0;"></td></tr>

<!-- Opportunities -->
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">מה לכתוב הלאה</h3>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;direction:rtl;">
    {opportunities}
    {no_opps}
    </table>
</td></tr>

{stale_section}

<!-- Footer -->
<tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#999;">דוח אוטומטי — bitancpa.com</p>
    <p style="margin:4px 0 0;font-size:11px;color:#999;">הציון מבוסס על: חשיפות, מיקום בגוגל, CTR, וקיום מאמר באתר</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>""".format(
        period=fmt_date_he(period_end),
        opp_count=len(opportunities),
        stale_count="בנוסף, {} מאמרים דורשים עדכון.".format(len(stale_articles)) if stale_articles else "",
        opportunities=opp_html,
        no_opps=no_opps,
        stale_section=stale_html,
    )

    return html


# ── Email ───────────────────────────────────────────────────────────────

def send_email(html, subject, recipients):
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": "Bearer {}".format(RESEND_API_KEY),
            "Content-Type": "application/json",
        },
        json={
            "from": REPORT_FROM,
            "to": [r.strip() for r in recipients if r.strip()],
            "subject": subject,
            "html": html,
        },
    )
    if resp.status_code >= 400:
        print("Resend error: {} {}".format(resp.status_code, resp.text))
        resp.raise_for_status()
    result = resp.json()
    print("Email sent: {}".format(result.get("id", "unknown")))
    return result


# ── Main ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Bitan & Bitan — Content Intelligence Scanner")
    print("=" * 60)

    if not SANITY_TOKEN:
        sys.exit("SANITY_API_WRITE_TOKEN not set")
    if not RESEND_API_KEY:
        sys.exit("RESEND_API_KEY not set")
    if not any(r.strip() for r in REPORT_RECIPIENTS):
        sys.exit("REPORT_RECIPIENTS not set")

    setup_credentials()
    try:
        start_date, end_date = get_previous_week_range()
        print("Period: {} to {}".format(start_date, end_date))

        # 1. Pull data
        print("\nPulling GSC queries...")
        queries = pull_gsc_queries(start_date, end_date)
        print("  Got {} queries".format(len(queries)))

        print("Pulling GA4 page views...")
        page_views = pull_ga4_page_views(start_date, end_date)
        print("  Got {} pages".format(len(page_views)))

        # 2. Get articles from Sanity
        print("Fetching articles from Sanity...")
        articles = get_all_articles()
        print("  Got {} articles".format(len(articles)))

        # 3. Group related queries
        print("\nGrouping related queries...")
        groups = group_related_queries(queries)
        print("  {} query groups".format(len(groups)))

        # 4. Score opportunities
        print("Scoring opportunities...")
        opportunities = []

        for group in groups:
            if group["impressions"] < MIN_IMPRESSIONS:
                continue

            match = find_matching_article(group["keyword"], articles)
            has_article = match is not None
            article_age = None
            article_id = None

            if match:
                article_age = months_since(
                    match.get("_updatedAt", match.get("_createdAt"))
                )
                article_id = match.get("_id")

            opp_score = score_opportunity(
                group["impressions"],
                group["position"],
                group["ctr"],
                has_article,
                article_age,
            )

            # Generate recommendation
            if not has_article:
                rec = "אין מאמר באתר בנושא זה. {} אנשים בשבוע מחפשים את זה בגוגל — מאמר ייעודי יכול לתפוס תנועה משמעותית.".format(
                    group["impressions"]
                )
                opp_type = "new"
            elif article_age and article_age >= STALE_THRESHOLD_MONTHS:
                rec = "יש מאמר קיים אבל הוא לא עודכן {} חודשים. רענון תוכן ותאריך יכול לשפר את המיקום מ-{} למיקום גבוה יותר.".format(
                    article_age, group["position"]
                )
                opp_type = "update"
            elif group["position"] > 10:
                rec = "יש מאמר קיים במיקום {} (עמוד 2+). שיפור התוכן, הוספת מידע עדכני, ובניית קישורים פנימיים יכולים לדחוף לעמוד 1.".format(
                    group["position"]
                )
                opp_type = "update"
            else:
                rec = "מאמר קיים במיקום {}. CTR נמוך ({:.1f}%) — ייתכן ששיפור הכותרת והתיאור יגדיל הקלקות.".format(
                    group["position"], group["ctr"] * 100
                )
                opp_type = "update"

            opportunities.append({
                "keyword": group["keyword"],
                "type": opp_type,
                "score": opp_score,
                "impressions": group["impressions"],
                "clicks": group["clicks"],
                "position": group["position"],
                "ctr": group["ctr"],
                "related": group.get("related", []),
                "recommendation": rec,
                "article_id": article_id,
                "article_age": article_age,
            })

        # Sort by score
        opportunities.sort(key=lambda x: x["score"], reverse=True)
        print("  {} scored opportunities".format(len(opportunities)))

        # 5. Find stale articles
        print("\nChecking for stale articles...")
        stale = find_stale_articles(articles, page_views)
        print("  {} stale articles found".format(len(stale)))

        # 6. Write to Sanity
        print("\nWriting to Sanity...")
        write_opportunities(opportunities[:10], stale, end_date)

        # 7. Generate and send email
        print("Generating content brief email...")
        html = generate_email(opportunities, stale, end_date)

        subject = "הזדמנויות תוכן שבועיות — {} — {}".format(
            "bitancpa.com", fmt_date_he(end_date)
        )
        print("\nSending to: {}".format(
            ", ".join(r.strip() for r in REPORT_RECIPIENTS if r.strip())
        ))
        send_email(html, subject, REPORT_RECIPIENTS)

        # Print summary
        print("\n" + "=" * 60)
        print("Summary:")
        print("  Top opportunities:")
        for opp in opportunities[:5]:
            print("    [{:2d}] {} ({})".format(
                opp["score"], opp["keyword"], opp["type"]
            ))
        if stale:
            print("  Stale articles:")
            for s in stale[:3]:
                print("    {} — {} views/wk, {} months old".format(
                    s["slug"], s["views_per_week"], s["months_since_update"]
                ))
        print("=" * 60)

    finally:
        cleanup_credentials()


if __name__ == "__main__":
    main()
