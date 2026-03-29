"""
Knesset Finance Committee Monitor
Queries the OData API for recent Finance Committee sessions.
CommitteeID 4186 = ועדת הכספים (Knesset 25)
"""

import json
from datetime import datetime, timedelta

import requests

SOURCE_NAME = "knesset"
SOURCE_LABEL = "ועדת הכספים — הכנסת"

# Finance Committee, Knesset 25
COMMITTEE_ID = 4186
ODATA_BASE = "https://knesset.gov.il/Odata/ParliamentInfo.svc"


def fetch_sessions(days_back=14):
    """Fetch recent Finance Committee sessions."""
    since = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%dT00:00:00")

    url = (
        "{}/KNS_CommitteeSession"
        "?$filter=CommitteeID eq {} and StartDate ge datetime'{}'"
        "&$orderby=StartDate desc"
        "&$top=20"
        "&$format=json"
    ).format(ODATA_BASE, COMMITTEE_ID, since)

    print("  Fetching sessions since {}...".format(since[:10]))
    try:
        resp = requests.get(url, timeout=30)
        if resp.status_code != 200:
            print("  Knesset API returned status {}".format(resp.status_code))
            return []
        data = resp.json()
        return data.get("value", data.get("d", {}).get("results", []))
    except (requests.RequestException, json.JSONDecodeError) as e:
        print("  Knesset API error: {}".format(e))
        return []


def scan():
    """Scan Knesset Finance Committee for recent sessions. Returns list of items."""
    items = []
    now = datetime.now()

    sessions = fetch_sessions(days_back=14)
    print("  Found {} sessions in last 14 days".format(len(sessions)))

    for session in sessions:
        session_id = session.get("CommitteeSessionID", "")
        start_date = session.get("StartDate", "")
        note = session.get("Note", "") or ""
        status = session.get("StatusDesc", "")
        session_url = session.get("SessionUrl", "")

        # Parse date for display
        date_display = start_date[:10] if start_date else "?"

        # Build title
        if note:
            title = "ועדת הכספים {} — {}".format(date_display, note[:100])
        else:
            title = "ישיבת ועדת הכספים — {}".format(date_display)

        # Use session URL or construct one
        url = session_url or "https://main.knesset.gov.il/Activity/committees/Pages/AllCommitteesAgenda.aspx?Tab=3&ItemID={}".format(
            session_id
        )

        items.append({
            "source": SOURCE_NAME,
            "sourceLabel": SOURCE_LABEL,
            "title": title,
            "url": url,
            "itemType": "legislation",
            "detectedAt": now.isoformat(),
            "metadata": {
                "sessionId": session_id,
                "startDate": start_date,
                "note": note,
                "status": status,
            },
        })

    return items
