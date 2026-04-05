#!/usr/bin/env python3
"""GA4 Weekly Analytics Report for bitancpa.com (2026-03-23 to 2026-03-29)"""

import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.expanduser("~/ga4-credentials.json")

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest, DateRange, Dimension, Metric, OrderBy
)

PROPERTY_ID = "525595931"
START_DATE = "2026-03-23"
END_DATE = "2026-03-29"

client = BetaAnalyticsDataClient()

def run_report(dimensions, metrics, order_by=None, limit=0):
    dims = [Dimension(name=d) for d in dimensions]
    mets = [Metric(name=m) for m in metrics]
    orders = []
    if order_by:
        for ob in order_by:
            if ob.startswith("-"):
                orders.append(OrderBy(
                    metric=OrderBy.MetricOrderBy(metric_name=ob[1:]),
                    desc=True
                ))
            else:
                orders.append(OrderBy(
                    dimension=OrderBy.DimensionOrderBy(dimension_name=ob)
                ))
    req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[DateRange(start_date=START_DATE, end_date=END_DATE)],
        dimensions=dims,
        metrics=mets,
        order_bys=orders if orders else [],
        limit=limit if limit else 0,
    )
    return client.run_report(req)

def fmt(val, is_duration=False, is_rate=False):
    try:
        f = float(val)
        if is_duration:
            m, s = divmod(int(f), 60)
            return f"{m}m {s}s"
        if is_rate:
            return f"{f*100:.1f}%"
        if f == int(f):
            return str(int(f))
        return f"{f:.2f}"
    except (ValueError, TypeError):
        return val

# ── 1. Overall Traffic ──
print("=" * 70)
print("1. OVERALL TRAFFIC SUMMARY")
print("   Date range:", START_DATE, "to", END_DATE)
print("=" * 70)
resp = run_report(
    dimensions=[],
    metrics=["totalUsers", "newUsers", "sessions", "screenPageViews",
             "averageSessionDuration", "bounceRate", "engagedSessions"]
)
if resp.rows:
    r = resp.rows[0]
    labels = ["Total Users", "New Users", "Sessions", "Pageviews",
              "Avg Session Duration", "Bounce Rate", "Engaged Sessions"]
    for i, label in enumerate(labels):
        val = r.metric_values[i].value
        if label == "Avg Session Duration":
            val = fmt(val, is_duration=True)
        elif label == "Bounce Rate":
            val = fmt(val, is_rate=True)
        else:
            val = fmt(val)
        print(f"  {label:.<30} {val}")

# ── 2. Top Pages ──
print("\n" + "=" * 70)
print("2. TOP PAGES BY PAGEVIEWS (Top 20)")
print("=" * 70)
resp = run_report(
    dimensions=["pagePath"],
    metrics=["screenPageViews", "totalUsers"],
    order_by=["-screenPageViews"],
    limit=20
)
print(f"  {'Page Path':<50} {'Views':>7} {'Users':>7}")
print(f"  {'-'*50} {'-'*7} {'-'*7}")
for row in resp.rows:
    path = row.dimension_values[0].value
    views = fmt(row.metric_values[0].value)
    users = fmt(row.metric_values[1].value)
    print(f"  {path:<50} {views:>7} {users:>7}")

# ── 3. Traffic Sources ──
print("\n" + "=" * 70)
print("3. TRAFFIC SOURCES (Source / Medium)")
print("=" * 70)
resp = run_report(
    dimensions=["sessionSource", "sessionMedium"],
    metrics=["sessions", "totalUsers"],
    order_by=["-sessions"],
    limit=20
)
print(f"  {'Source / Medium':<40} {'Sessions':>10} {'Users':>7}")
print(f"  {'-'*40} {'-'*10} {'-'*7}")
for row in resp.rows:
    src = row.dimension_values[0].value
    med = row.dimension_values[1].value
    sess = fmt(row.metric_values[0].value)
    users = fmt(row.metric_values[1].value)
    print(f"  {src + ' / ' + med:<40} {sess:>10} {users:>7}")

# ── 4. Device Breakdown ──
print("\n" + "=" * 70)
print("4. DEVICE BREAKDOWN")
print("=" * 70)
resp = run_report(
    dimensions=["deviceCategory"],
    metrics=["sessions"],
    order_by=["-sessions"]
)
total = sum(int(r.metric_values[0].value) for r in resp.rows)
print(f"  {'Device':<20} {'Sessions':>10} {'Share':>8}")
print(f"  {'-'*20} {'-'*10} {'-'*8}")
for row in resp.rows:
    dev = row.dimension_values[0].value
    sess = int(row.metric_values[0].value)
    pct = f"{sess/total*100:.1f}%" if total else "0%"
    print(f"  {dev:<20} {sess:>10} {pct:>8}")

# ── 5. Daily Trend ──
print("\n" + "=" * 70)
print("5. DAILY TREND")
print("=" * 70)
resp = run_report(
    dimensions=["date"],
    metrics=["sessions", "totalUsers", "screenPageViews"],
    order_by=["date"]
)
print(f"  {'Date':<12} {'Sessions':>10} {'Users':>7} {'Pageviews':>10}")
print(f"  {'-'*12} {'-'*10} {'-'*7} {'-'*10}")
for row in resp.rows:
    d = row.dimension_values[0].value
    date_fmt = f"{d[:4]}-{d[4:6]}-{d[6:]}"
    sess = fmt(row.metric_values[0].value)
    users = fmt(row.metric_values[1].value)
    pvs = fmt(row.metric_values[2].value)
    print(f"  {date_fmt:<12} {sess:>10} {users:>7} {pvs:>10}")

# ── 6. New vs Returning ──
print("\n" + "=" * 70)
print("6. NEW VS RETURNING USERS")
print("=" * 70)
resp = run_report(
    dimensions=["newVsReturning"],
    metrics=["sessions"],
    order_by=["-sessions"]
)
total = sum(int(r.metric_values[0].value) for r in resp.rows)
print(f"  {'Type':<20} {'Sessions':>10} {'Share':>8}")
print(f"  {'-'*20} {'-'*10} {'-'*8}")
for row in resp.rows:
    typ = row.dimension_values[0].value
    sess = int(row.metric_values[0].value)
    pct = f"{sess/total*100:.1f}%" if total else "0%"
    print(f"  {typ:<20} {sess:>10} {pct:>8}")

# ── 7. Top Landing Pages ──
print("\n" + "=" * 70)
print("7. TOP LANDING PAGES (Top 10)")
print("=" * 70)
resp = run_report(
    dimensions=["landingPagePlusQueryString"],
    metrics=["sessions", "totalUsers"],
    order_by=["-sessions"],
    limit=10
)
print(f"  {'Landing Page':<55} {'Sessions':>10} {'Users':>7}")
print(f"  {'-'*55} {'-'*10} {'-'*7}")
for row in resp.rows:
    path = row.dimension_values[0].value
    sess = fmt(row.metric_values[0].value)
    users = fmt(row.metric_values[1].value)
    print(f"  {path:<55} {sess:>10} {users:>7}")

# ── 8. Country/City ──
print("\n" + "=" * 70)
print("8. TOP CITIES (Top 10)")
print("=" * 70)
resp = run_report(
    dimensions=["city"],
    metrics=["sessions"],
    order_by=["-sessions"],
    limit=10
)
print(f"  {'City':<30} {'Sessions':>10}")
print(f"  {'-'*30} {'-'*10}")
for row in resp.rows:
    city = row.dimension_values[0].value
    sess = fmt(row.metric_values[0].value)
    print(f"  {city:<30} {sess:>10}")

print("\n" + "=" * 70)
print("Report complete.")
print("=" * 70)
