"""
Bank of Israel Interest Rate Monitor
Polls the public API for rate changes.
Only generates an alert when the rate changes or a decision date is imminent.
"""

import json
from datetime import datetime, timedelta

import requests

SOURCE_NAME = "boi"
SOURCE_LABEL = "בנק ישראל"

API_URL = "https://www.boi.org.il/PublicApi/GetInterest"


def scan():
    """Check BOI interest rate. Returns list of items (usually 0-1)."""
    items = []
    now = datetime.now()

    print("  Checking: {}".format(API_URL))
    try:
        resp = requests.get(API_URL, timeout=15)
        if resp.status_code != 200:
            print("  BOI API returned status {}".format(resp.status_code))
            return items
    except requests.RequestException as e:
        print("  BOI API error: {}".format(e))
        return items

    try:
        data = resp.json()
    except json.JSONDecodeError:
        print("  BOI API returned invalid JSON")
        return items

    rate = data.get("currentInterest")
    next_date_str = data.get("nextInterestDate", "")
    last_published_str = data.get("lastPublishedDate", "")

    print("  Current rate: {}%, next decision: {}".format(rate, next_date_str[:10]))

    # Parse next decision date
    next_date = None
    if next_date_str:
        try:
            next_date = datetime.fromisoformat(next_date_str.replace("Z", "+00:00"))
        except ValueError:
            pass

    # Generate alert if decision date is within 3 days (upcoming) or today/yesterday (just happened)
    if next_date:
        days_until = (next_date.replace(tzinfo=None) - now).days
        if days_until <= 3:
            if days_until >= 0:
                title = "החלטת ריבית בנק ישראל — {} | ריבית נוכחית: {}%".format(
                    next_date_str[:10], rate
                )
                alert_type = "upcoming_decision"
            else:
                title = "ריבית בנק ישראל: {}% | ההחלטה האחרונה: {}".format(
                    rate, last_published_str[:10]
                )
                alert_type = "rate_published"

            items.append({
                "source": SOURCE_NAME,
                "sourceLabel": SOURCE_LABEL,
                "title": title,
                "url": "https://www.boi.org.il/he/economic-roles/monetary-policy/",
                "itemType": "official_update",
                "detectedAt": now.isoformat(),
                "metadata": {
                    "currentRate": rate,
                    "nextDecisionDate": next_date_str,
                    "lastPublishedDate": last_published_str,
                    "alertType": alert_type,
                },
            })

    return items
