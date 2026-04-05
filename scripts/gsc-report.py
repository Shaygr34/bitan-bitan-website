#!/usr/bin/env python3
"""Pull Google Search Console data for bitancpa.com."""

import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
CREDENTIALS_FILE = os.path.expanduser('~/ga4-credentials.json')
SITE_URL = 'sc-domain:bitancpa.com'
START_DATE = '2026-03-23'
END_DATE = '2026-03-29'

creds = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE, scopes=SCOPES
)
service = build('searchconsole', 'v1', credentials=creds)


def query_gsc(dimensions=None, row_limit=None):
    body = {
        'startDate': START_DATE,
        'endDate': END_DATE,
    }
    if dimensions:
        body['dimensions'] = dimensions
    if row_limit:
        body['rowLimit'] = row_limit
    resp = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    return resp


def fmt_ctr(ctr):
    return '{:.1f}%'.format(ctr * 100)


def fmt_pos(pos):
    return '{:.1f}'.format(pos)


# 1. Overall performance
print('=' * 70)
print('SEARCH CONSOLE REPORT: bitancpa.com')
print('Date range: {} to {}'.format(START_DATE, END_DATE))
print('=' * 70)

resp = query_gsc()
if 'rows' in resp:
    r = resp['rows'][0]
    print('\n--- OVERALL PERFORMANCE ---')
    print('Clicks:      {:,}'.format(int(r['clicks'])))
    print('Impressions: {:,}'.format(int(r['impressions'])))
    print('CTR:         {}'.format(fmt_ctr(r['ctr'])))
    print('Avg Position:{}'.format(fmt_pos(r['position'])))
else:
    print('\nNo overall data returned.')

# 2. Top queries
print('\n--- TOP 20 QUERIES BY CLICKS ---')
resp = query_gsc(dimensions=['query'], row_limit=20)
if 'rows' in resp:
    print('{:<55} {:>6} {:>7} {:>7} {:>5}'.format(
        'Query', 'Clicks', 'Impr', 'CTR', 'Pos'))
    print('-' * 82)
    for r in resp['rows']:
        q = r['keys'][0]
        if len(q) > 53:
            q = q[:50] + '...'
        print('{:<55} {:>6} {:>7} {:>7} {:>5}'.format(
            q, int(r['clicks']), int(r['impressions']),
            fmt_ctr(r['ctr']), fmt_pos(r['position'])))
else:
    print('No query data.')

# 3. Top pages
print('\n--- TOP 15 PAGES BY CLICKS ---')
resp = query_gsc(dimensions=['page'], row_limit=15)
if 'rows' in resp:
    print('{:<65} {:>6} {:>7} {:>7} {:>5}'.format(
        'Page', 'Clicks', 'Impr', 'CTR', 'Pos'))
    print('-' * 92)
    for r in resp['rows']:
        page = r['keys'][0].replace('https://bitancpa.com', '')
        if not page:
            page = '/'
        if len(page) > 63:
            page = page[:60] + '...'
        print('{:<65} {:>6} {:>7} {:>7} {:>5}'.format(
            page, int(r['clicks']), int(r['impressions']),
            fmt_ctr(r['ctr']), fmt_pos(r['position'])))
else:
    print('No page data.')

# 4. Device breakdown
print('\n--- DEVICE BREAKDOWN ---')
resp = query_gsc(dimensions=['device'])
if 'rows' in resp:
    print('{:<12} {:>6} {:>7} {:>7} {:>5}'.format(
        'Device', 'Clicks', 'Impr', 'CTR', 'Pos'))
    print('-' * 40)
    for r in resp['rows']:
        print('{:<12} {:>6} {:>7} {:>7} {:>5}'.format(
            r['keys'][0], int(r['clicks']), int(r['impressions']),
            fmt_ctr(r['ctr']), fmt_pos(r['position'])))
else:
    print('No device data.')

# 5. Daily trend
print('\n--- DAILY TREND ---')
resp = query_gsc(dimensions=['date'])
if 'rows' in resp:
    print('{:<12} {:>6} {:>7} {:>7} {:>5}'.format(
        'Date', 'Clicks', 'Impr', 'CTR', 'Pos'))
    print('-' * 40)
    for r in sorted(resp['rows'], key=lambda x: x['keys'][0]):
        print('{:<12} {:>6} {:>7} {:>7} {:>5}'.format(
            r['keys'][0], int(r['clicks']), int(r['impressions']),
            fmt_ctr(r['ctr']), fmt_pos(r['position'])))
else:
    print('No daily data.')

print('\n' + '=' * 70)
print('Note: GSC data lags 2-3 days. Recent days may be incomplete.')
print('=' * 70)
