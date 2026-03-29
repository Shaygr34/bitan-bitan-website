#!/usr/bin/env python3
"""
Bitan & Bitan — Automated Weekly Performance Report
Runs as Railway cron job every Sunday morning.

Pipeline:
1. Pull GA4 analytics (previous week Sun–Sat)
2. Pull GSC search data (with 2-3 day lag caveat)
3. Query Sanity for subscriber/lead counts
4. Write weeklyMetrics document to Sanity
5. Read previous week for WoW comparison
6. Generate branded Hebrew HTML email
7. Send via Resend
"""

import os
import sys
import json
import base64
import tempfile
from datetime import datetime, timedelta

import requests
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest, DateRange, Dimension, Metric, OrderBy
)
from google.oauth2 import service_account
from googleapiclient.discovery import build

# ── Config ──────────────────────────────────────────────────────────────

GA4_PROPERTY_ID = "525595931"
SANITY_PROJECT_ID = "ul4uwnp7"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2024-01-01"
SITE_URL = "sc-domain:bitancpa.com"
GSC_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

SANITY_TOKEN = os.environ.get("SANITY_API_WRITE_TOKEN", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
REPORT_RECIPIENTS = os.environ.get(
    "REPORT_RECIPIENTS", ""
).split(",")
REPORT_FROM = os.environ.get(
    "REPORT_FROM", "ביטן את ביטן - דוחות <reports@bitancpa.com>"
)

# ── Credentials Setup ───────────────────────────────────────────────────

_tmp_creds_path = None


def setup_credentials():
    """Set up GA4/GSC credentials from env var or local file."""
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
    """Remove temp credentials file if created."""
    if _tmp_creds_path and os.path.exists(_tmp_creds_path):
        os.unlink(_tmp_creds_path)


# ── Date Range ──────────────────────────────────────────────────────────

def get_previous_week_range():
    """Get previous week Sun–Sat date range."""
    today = datetime.now()
    # days_since_sunday: Monday=0..Sunday=6 → we want Sunday=0
    day_of_week = today.weekday()  # Mon=0, Sun=6
    # If today is Sunday (6), previous week ended yesterday (Sat)
    # If today is Monday (0), previous week ended 2 days ago (Sat)
    days_since_last_sat = (day_of_week + 2) % 7
    if days_since_last_sat == 0:
        days_since_last_sat = 7
    end = today - timedelta(days=days_since_last_sat)
    start = end - timedelta(days=6)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


# ── GA4 ─────────────────────────────────────────────────────────────────

def pull_ga4(start_date, end_date):
    """Pull all GA4 metrics for the period."""
    client = BetaAnalyticsDataClient()

    def run(dimensions, metrics, order_by=None, limit=0):
        dims = [Dimension(name=d) for d in dimensions]
        mets = [Metric(name=m) for m in metrics]
        orders = []
        if order_by:
            for ob in order_by:
                if ob.startswith("-"):
                    orders.append(OrderBy(
                        metric=OrderBy.MetricOrderBy(metric_name=ob[1:]),
                        desc=True,
                    ))
                else:
                    orders.append(OrderBy(
                        dimension=OrderBy.DimensionOrderBy(dimension_name=ob),
                    ))
        return client.run_report(RunReportRequest(
            property="properties/{}".format(GA4_PROPERTY_ID),
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            dimensions=dims,
            metrics=mets,
            order_bys=orders,
            limit=limit or 0,
        ))

    data = {}

    # Overall
    resp = run([], [
        "totalUsers", "newUsers", "sessions", "screenPageViews",
        "averageSessionDuration", "bounceRate", "engagedSessions",
    ])
    if resp.rows:
        r = resp.rows[0]
        data["overall"] = {
            "totalUsers": int(r.metric_values[0].value),
            "newUsers": int(r.metric_values[1].value),
            "sessions": int(r.metric_values[2].value),
            "pageviews": int(r.metric_values[3].value),
            "avgSessionDuration": float(r.metric_values[4].value),
            "bounceRate": float(r.metric_values[5].value),
            "engagedSessions": int(r.metric_values[6].value),
        }

    # Top pages (with titles)
    resp = run(["pagePath", "pageTitle"], ["screenPageViews", "totalUsers"],
               ["-screenPageViews"], 15)
    data["topPages"] = [
        {
            "path": row.dimension_values[0].value,
            "title": row.dimension_values[1].value,
            "pageviews": int(row.metric_values[0].value),
            "users": int(row.metric_values[1].value),
        }
        for row in resp.rows
    ]

    # Traffic sources
    resp = run(["sessionSource", "sessionMedium"], ["sessions", "totalUsers"],
               ["-sessions"], 15)
    data["trafficSources"] = [
        {
            "source": row.dimension_values[0].value,
            "medium": row.dimension_values[1].value,
            "sessions": int(row.metric_values[0].value),
            "users": int(row.metric_values[1].value),
        }
        for row in resp.rows
    ]

    # Devices
    resp = run(["deviceCategory"], ["sessions"], ["-sessions"])
    total_sess = sum(int(r.metric_values[0].value) for r in resp.rows)
    data["devices"] = [
        {
            "device": row.dimension_values[0].value,
            "sessions": int(row.metric_values[0].value),
            "share": round(int(row.metric_values[0].value) / max(total_sess, 1), 3),
        }
        for row in resp.rows
    ]

    # Daily trend
    resp = run(["date"], ["sessions", "totalUsers", "screenPageViews"], ["date"])
    data["dailyTrend"] = [
        {
            "date": row.dimension_values[0].value,
            "sessions": int(row.metric_values[0].value),
            "users": int(row.metric_values[1].value),
            "pageviews": int(row.metric_values[2].value),
        }
        for row in resp.rows
    ]

    # New vs returning
    resp = run(["newVsReturning"], ["sessions"], ["-sessions"])
    total = sum(int(r.metric_values[0].value) for r in resp.rows)
    data["newVsReturning"] = {
        row.dimension_values[0].value: {
            "sessions": int(row.metric_values[0].value),
            "share": round(int(row.metric_values[0].value) / max(total, 1), 3),
        }
        for row in resp.rows
    }

    return data


# ── GSC ─────────────────────────────────────────────────────────────────

def pull_gsc(start_date, end_date):
    """Pull Search Console data."""
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=GSC_SCOPES
    )
    svc = build("searchconsole", "v1", credentials=creds)

    def query(dimensions=None, row_limit=None):
        body = {"startDate": start_date, "endDate": end_date}
        if dimensions:
            body["dimensions"] = dimensions
        if row_limit:
            body["rowLimit"] = row_limit
        return svc.searchanalytics().query(
            siteUrl=SITE_URL, body=body
        ).execute()

    data = {}

    # Overall
    resp = query()
    if "rows" in resp:
        r = resp["rows"][0]
        data["overall"] = {
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
            "ctr": round(r["ctr"], 4),
            "position": round(r["position"], 1),
        }

    # Top queries
    resp = query(["query"], 20)
    data["topQueries"] = [
        {
            "query": r["keys"][0],
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
            "ctr": round(r["ctr"], 4),
            "position": round(r["position"], 1),
        }
        for r in resp.get("rows", [])
    ]

    # Top pages
    resp = query(["page"], 10)
    data["topPages"] = [
        {
            "page": r["keys"][0].replace("https://bitancpa.com", "") or "/",
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
            "ctr": round(r["ctr"], 4),
            "position": round(r["position"], 1),
        }
        for r in resp.get("rows", [])
    ]

    # Devices
    resp = query(["device"])
    data["devices"] = [
        {
            "device": r["keys"][0],
            "clicks": int(r["clicks"]),
            "impressions": int(r["impressions"]),
            "ctr": round(r["ctr"], 4),
            "position": round(r["position"], 1),
        }
        for r in resp.get("rows", [])
    ]

    return data


# ── Sanity ──────────────────────────────────────────────────────────────

def sanity_query(groq, params=None):
    """Run a GROQ query against Sanity."""
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
    """Write mutations to Sanity."""
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


def get_subscriber_count():
    """Count newsletter subscribers."""
    result = sanity_query('count(*[_type == "newsletterSubscriber"])')
    return result or 0


def get_lead_count():
    """Count contact leads."""
    result = sanity_query('count(*[_type == "contactLead"])')
    return result or 0


def get_new_subscribers_since(date_str):
    """Count subscribers added since a date."""
    result = sanity_query(
        'count(*[_type == "newsletterSubscriber" && _createdAt >= $since])',
        {"since": date_str}
    )
    return result or 0


def get_new_leads_since(date_str):
    """Count leads added since a date."""
    result = sanity_query(
        'count(*[_type == "contactLead" && _createdAt >= $since])',
        {"since": date_str}
    )
    return result or 0


def write_metrics(metrics, period_end):
    """Write weeklyMetrics document to Sanity (createOrReplace)."""
    doc_id = "weeklyMetrics-{}".format(period_end)
    ga4_overall = metrics.get("ga4", {}).get("overall", {})
    gsc_overall = metrics.get("gsc", {}).get("overall", {})

    doc = {
        "_id": doc_id,
        "_type": "weeklyMetrics",
        "periodStart": metrics["periodStart"],
        "periodEnd": metrics["periodEnd"],
        "totalUsers": ga4_overall.get("totalUsers", 0),
        "totalPageviews": ga4_overall.get("pageviews", 0),
        "totalClicks": gsc_overall.get("clicks", 0),
        "totalImpressions": gsc_overall.get("impressions", 0),
        "metricsJson": json.dumps(metrics, ensure_ascii=False),
    }
    sanity_mutate([{"createOrReplace": doc}])
    print("Wrote weeklyMetrics: {}".format(doc_id))


def read_previous_metrics(current_period_end):
    """Read the most recent weeklyMetrics before current period."""
    result = sanity_query(
        '*[_type == "weeklyMetrics" && periodEnd < $end]'
        ' | order(periodEnd desc) [0] {metricsJson}',
        {"end": current_period_end},
    )
    if result and result.get("metricsJson"):
        return json.loads(result["metricsJson"])
    return None


# ── HTML Report ─────────────────────────────────────────────────────────

def fmt_num(n):
    """Format number with commas."""
    return "{:,}".format(int(n))


def fmt_pct(v):
    """Format as percentage."""
    return "{:.1f}%".format(float(v) * 100)


def fmt_duration(seconds):
    """Format seconds as M:SS."""
    m, s = divmod(int(seconds), 60)
    return "{}:{:02d}".format(m, s)


def fmt_date_he(date_str):
    """Format YYYY-MM-DD as DD.MM.YY."""
    parts = date_str.split("-")
    return "{}.{}.{}".format(parts[2], parts[1], parts[0][2:])


def wow_delta(current, previous, is_lower_better=False):
    """Calculate WoW change and return arrow + color."""
    if previous is None or previous == 0:
        return ""
    pct = (current - previous) / abs(previous) * 100
    if abs(pct) < 0.5:
        return '<span style="color:#888;">—</span>'
    if pct > 0:
        color = "#e74c3c" if is_lower_better else "#27ae60"
        return '<span style="color:{};">&#9650; {:.0f}%</span>'.format(color, pct)
    else:
        color = "#27ae60" if is_lower_better else "#e74c3c"
        return '<span style="color:{};">&#9660; {:.0f}%</span>'.format(color, abs(pct))


def generate_report(current, previous):
    """Generate branded Hebrew HTML email report."""
    ga4 = current.get("ga4", {})
    gsc = current.get("gsc", {})
    overall = ga4.get("overall", {})
    gsc_overall = gsc.get("overall", {})
    subs = current.get("subscribers", {})

    prev_ga4 = (previous or {}).get("ga4", {}).get("overall", {})
    prev_gsc = (previous or {}).get("gsc", {}).get("overall", {})

    period = "{} — {}".format(
        fmt_date_he(current["periodStart"]),
        fmt_date_he(current["periodEnd"]),
    )

    # Top 5 pages — show title (friendly name), not path
    # In RTL email: columns reversed — number first (left), then title (right)
    top_pages_html = ""
    for p in ga4.get("topPages", [])[:5]:
        title = p.get("title", p["path"])
        # Clean up common suffixes from page titles
        for suffix in [" | ביטן את ביטן", " — ביטן את ביטן", " - ביטן את ביטן"]:
            title = title.replace(suffix, "")
        if not title or title == "(not set)":
            title = p["path"]
        if len(title) > 50:
            title = "..." + title[:47]
        top_pages_html += """
        <tr>
            <td dir="rtl" style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;direction:rtl;">{}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:left;font-size:13px;font-weight:600;width:70px;">{}</td>
        </tr>""".format(title, fmt_num(p["pageviews"]))

    # Top 5 search queries
    # RTL: query on right, numbers on left
    top_queries_html = ""
    for q in gsc.get("topQueries", [])[:5]:
        top_queries_html += """
        <tr>
            <td dir="rtl" style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;direction:rtl;">{}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px;width:70px;">{}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px;width:60px;">{}</td>
        </tr>""".format(q["query"], q["clicks"], round(q["position"], 1))

    # Traffic sources summary
    organic_sessions = 0
    direct_sessions = 0
    other_sessions = 0
    total_sessions = overall.get("sessions", 0)
    for src in ga4.get("trafficSources", []):
        if src["medium"] == "organic":
            organic_sessions += src["sessions"]
        elif src["source"] == "(direct)":
            direct_sessions += src["sessions"]
        else:
            other_sessions += src["sessions"]

    # Branded search
    branded_clicks = 0
    for q in gsc.get("topQueries", []):
        query_lower = q["query"].lower()
        if any(term in query_lower for term in ["ביטן", "bitan", "bitancpa"]):
            branded_clicks += q["clicks"]

    # New vs returning
    nvr = ga4.get("newVsReturning", {})
    returning_share = nvr.get("returning", {}).get("share", 0)

    html = """<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body dir="rtl" style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
<table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;direction:rtl;">
<tr><td align="center">
<table dir="rtl" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);direction:rtl;">

<!-- Header -->
<tr><td style="background:#102040;padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#C5A572;font-size:22px;font-weight:700;">דוח ביצועי אתר שבועי</h1>
    <p style="margin:8px 0 0;color:#fff;font-size:14px;opacity:0.85;">ביטן את ביטן — רואי חשבון</p>
    <p style="margin:6px 0 0;color:#C5A572;font-size:13px;">{period}</p>
</td></tr>

<!-- KPI Cards -->
<tr><td style="padding:24px 32px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td width="25%" style="text-align:center;padding:12px 4px;">
            <div style="font-size:28px;font-weight:700;color:#102040;">{users}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">מבקרים</div>
            <div style="font-size:11px;margin-top:2px;">{users_wow}</div>
        </td>
        <td width="25%" style="text-align:center;padding:12px 4px;">
            <div style="font-size:28px;font-weight:700;color:#102040;">{pageviews}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">צפיות</div>
            <div style="font-size:11px;margin-top:2px;">{pageviews_wow}</div>
        </td>
        <td width="25%" style="text-align:center;padding:12px 4px;">
            <div style="font-size:28px;font-weight:700;color:#102040;">{clicks}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">הקלקות מגוגל</div>
            <div style="font-size:11px;margin-top:2px;">{clicks_wow}</div>
        </td>
        <td width="25%" style="text-align:center;padding:12px 4px;">
            <div style="font-size:28px;font-weight:700;color:#102040;">{impressions_k}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">חשיפות בגוגל</div>
            <div style="font-size:11px;margin-top:2px;">{impressions_wow}</div>
        </td>
    </tr>
    </table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:16px 0;"></td></tr>

<!-- Secondary metrics -->
<tr><td style="padding:0 32px 16px;">
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#444;border:1px solid #eee;border-radius:4px;direction:rtl;border-collapse:collapse;">
    <tr>
        <td width="33%" style="padding:10px 12px;text-align:center;border-bottom:1px solid #eee;border-left:1px solid #eee;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">משך ביקור ממוצע</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{avg_duration}</div>
        </td>
        <td width="33%" style="padding:10px 12px;text-align:center;border-bottom:1px solid #eee;border-left:1px solid #eee;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">שיעור נטישה</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{bounce_rate}</div>
        </td>
        <td width="34%" style="padding:10px 12px;text-align:center;border-bottom:1px solid #eee;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">CTR בגוגל</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{ctr}</div>
        </td>
    </tr>
    <tr>
        <td width="33%" style="padding:10px 12px;text-align:center;border-left:1px solid #eee;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">מיקום ממוצע בגוגל</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{avg_position}</div>
        </td>
        <td width="33%" style="padding:10px 12px;text-align:center;border-left:1px solid #eee;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">מבקרים חוזרים</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{returning_pct}</div>
        </td>
        <td width="34%" style="padding:10px 12px;text-align:center;">
            <div style="font-size:11px;color:#888;margin-bottom:3px;">חיפוש ממותג</div>
            <div style="font-size:16px;font-weight:700;color:#102040;">{branded}</div>
        </td>
    </tr>
    </table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:4px 0 16px;"></td></tr>

<!-- Traffic Sources -->
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 12px;color:#102040;font-size:15px;text-align:right;">מקורות תנועה</h3>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;direction:rtl;">
    <tr>
        <td style="padding:4px 0;">
            <span style="display:inline-block;width:12px;height:12px;background:#27ae60;border-radius:2px;vertical-align:middle;margin-left:6px;"></span>
            גוגל אורגני: <strong>{organic_pct}</strong> ({organic_sess} סשנים)
        </td>
    </tr>
    <tr>
        <td style="padding:4px 0;">
            <span style="display:inline-block;width:12px;height:12px;background:#3498db;border-radius:2px;vertical-align:middle;margin-left:6px;"></span>
            ישיר: <strong>{direct_pct}</strong> ({direct_sess} סשנים)
        </td>
    </tr>
    <tr>
        <td style="padding:4px 0;">
            <span style="display:inline-block;width:12px;height:12px;background:#95a5a6;border-radius:2px;vertical-align:middle;margin-left:6px;"></span>
            אחר: <strong>{other_pct}</strong> ({other_sess} סשנים)
        </td>
    </tr>
    </table>
</td></tr>

<!-- Top Content -->
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">תוכן מוביל</h3>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;direction:rtl;">
    <tr style="background:#f8f8f8;">
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:right;">עמוד</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:left;width:70px;">צפיות</td>
    </tr>
    {top_pages}
    </table>
</td></tr>

<!-- Top Search Queries -->
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">מילות חיפוש מובילות</h3>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;direction:rtl;">
    <tr style="background:#f8f8f8;">
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:right;">ביטוי</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:center;width:70px;">הקלקות</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#666;text-align:center;width:60px;">מיקום</td>
    </tr>
    {top_queries}
    </table>
</td></tr>

<!-- Newsletter -->
<tr><td style="padding:0 32px 16px;">
    <h3 dir="rtl" style="margin:0 0 8px;color:#102040;font-size:15px;text-align:right;">ניוזלטר ולידים</h3>
    <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#444;direction:rtl;">
    <tr>
        <td style="padding:4px 0;">מנויי ניוזלטר: <strong>{total_subs}</strong> (חדש השבוע: {new_subs})</td>
    </tr>
    <tr>
        <td style="padding:4px 0;">לידים מטופס יצירת קשר: <strong>{total_leads}</strong> (חדש השבוע: {new_leads})</td>
    </tr>
    </table>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#999;">דוח אוטומטי — bitancpa.com</p>
    <p style="margin:4px 0 0;font-size:11px;color:#999;">נתוני Search Console עשויים להיות חלקיים עבור 2-3 הימים האחרונים</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""

    impressions = gsc_overall.get("impressions", 0)
    if impressions >= 1000:
        impressions_k = "{:.1f}K".format(impressions / 1000)
    else:
        impressions_k = fmt_num(impressions)

    return html.format(
        period=period,
        users=fmt_num(overall.get("totalUsers", 0)),
        pageviews=fmt_num(overall.get("pageviews", 0)),
        clicks=fmt_num(gsc_overall.get("clicks", 0)),
        impressions_k=impressions_k,
        users_wow=wow_delta(
            overall.get("totalUsers", 0),
            prev_ga4.get("totalUsers"),
        ),
        pageviews_wow=wow_delta(
            overall.get("pageviews", 0),
            prev_ga4.get("pageviews"),
        ),
        clicks_wow=wow_delta(
            gsc_overall.get("clicks", 0),
            prev_gsc.get("clicks"),
        ),
        impressions_wow=wow_delta(
            gsc_overall.get("impressions", 0),
            prev_gsc.get("impressions"),
        ),
        avg_duration=fmt_duration(overall.get("avgSessionDuration", 0)),
        bounce_rate=fmt_pct(overall.get("bounceRate", 0)),
        avg_position=round(gsc_overall.get("position", 0), 1),
        ctr=fmt_pct(gsc_overall.get("ctr", 0)),
        returning_pct=fmt_pct(returning_share),
        branded=branded_clicks,
        organic_pct="{:.0f}%".format(organic_sessions / max(total_sessions, 1) * 100),
        organic_sess=fmt_num(organic_sessions),
        direct_pct="{:.0f}%".format(direct_sessions / max(total_sessions, 1) * 100),
        direct_sess=fmt_num(direct_sessions),
        other_pct="{:.0f}%".format(other_sessions / max(total_sessions, 1) * 100),
        other_sess=fmt_num(other_sessions),
        top_pages=top_pages_html,
        top_queries=top_queries_html,
        total_subs=subs.get("total", 0),
        new_subs=subs.get("newThisWeek", 0),
        total_leads=subs.get("totalLeads", 0),
        new_leads=subs.get("newLeadsThisWeek", 0),
    )


# ── Email ───────────────────────────────────────────────────────────────

def send_email(html, subject, recipients):
    """Send HTML email via Resend API."""
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
    print("Bitan & Bitan — Weekly Performance Report")
    print("=" * 60)

    # Validate config
    if not SANITY_TOKEN:
        sys.exit("SANITY_API_WRITE_TOKEN not set")
    if not RESEND_API_KEY:
        sys.exit("RESEND_API_KEY not set")
    if not any(r.strip() for r in REPORT_RECIPIENTS):
        sys.exit("REPORT_RECIPIENTS not set")

    creds_path = setup_credentials()
    try:
        start_date, end_date = get_previous_week_range()
        print("Period: {} to {}".format(start_date, end_date))

        # 1. Pull data
        print("\nPulling GA4 data...")
        ga4_data = pull_ga4(start_date, end_date)
        print("  Users: {}".format(
            ga4_data.get("overall", {}).get("totalUsers", "?")
        ))

        print("Pulling GSC data...")
        gsc_data = pull_gsc(start_date, end_date)
        print("  Clicks: {}".format(
            gsc_data.get("overall", {}).get("clicks", "?")
        ))

        # 2. Subscriber & lead counts
        print("Querying Sanity for subscribers/leads...")
        total_subs = get_subscriber_count()
        new_subs = get_new_subscribers_since(start_date)
        total_leads = get_lead_count()
        new_leads = get_new_leads_since(start_date)
        print("  Subscribers: {} (new: {})".format(total_subs, new_subs))
        print("  Leads: {} (new: {})".format(total_leads, new_leads))

        # 3. Assemble metrics
        metrics = {
            "periodStart": start_date,
            "periodEnd": end_date,
            "generatedAt": datetime.now().isoformat(),
            "ga4": ga4_data,
            "gsc": gsc_data,
            "subscribers": {
                "total": total_subs,
                "newThisWeek": new_subs,
                "totalLeads": total_leads,
                "newLeadsThisWeek": new_leads,
            },
        }

        # 4. Read previous week
        print("\nReading previous week metrics...")
        previous = read_previous_metrics(end_date)
        if previous:
            print("  Found: {} to {}".format(
                previous.get("periodStart", "?"),
                previous.get("periodEnd", "?"),
            ))
        else:
            print("  No previous data (first report)")

        # 5. Write current metrics to Sanity
        print("\nWriting metrics to Sanity...")
        write_metrics(metrics, end_date)

        # 6. Generate report
        print("Generating HTML report...")
        html = generate_report(metrics, previous)

        # 7. Send email
        subject = "דוח ביצועי אתר שבועי — {} — {}".format(
            "bitancpa.com", fmt_date_he(end_date)
        )
        print("\nSending email to: {}".format(
            ", ".join(r.strip() for r in REPORT_RECIPIENTS if r.strip())
        ))
        send_email(html, subject, REPORT_RECIPIENTS)

        print("\n" + "=" * 60)
        print("Report complete!")
        print("=" * 60)

    finally:
        cleanup_credentials()


if __name__ == "__main__":
    main()
