# Newsletter Send Runbook

**Purpose:** Make sure website signups actually receive the newsletter.

Today, website signups live in Sanity (`newsletterSubscriber` documents).
Sends happen via Summit CRM's mailing lists. These are not connected automatically.
**Before every send**, the office should sync new Sanity subscribers into the Summit list.

## Pre-send sync (manual, ~2 minutes)

1. Open Sanity Studio: `https://bitancpa.com/studio`
2. Click **Vision** (the query plugin)
3. Run this GROQ query:

   ```groq
   *[_type == "newsletterSubscriber" && isActive == true]
     | order(subscribedAt desc) {
       email, name, subscribedAt
     }
   ```

4. Copy the emails from the result panel
5. In Summit (`app.sumit.co.il`):
   - Mailing Lists → ניוזלטר (or whichever list this send is going to)
   - Add the emails (Summit deduplicates automatically — re-adding existing addresses is safe)
6. Send the newsletter normally

## Tracking last sync (optional)

After each sync, drop a note in this file with the date + count synced. That way
the next person knows when the last reconciliation happened.

| Sync date  | Subscribers synced | Notes                          |
|------------|--------------------|--------------------------------|
| 2026-05-14 | 3 (baseline)       | Re-enable of website signup. Existing subscribers carried over. |

## When to retire this manual step

When monthly signup volume crosses ~10/month, build a Sanity webhook →
`/api/sanity-summit-sync` route that adds new subscribers to the Summit list
automatically. Until then, the manual ritual is cheaper than the integration.

## Removing a subscriber

If someone asks to be removed:
- In Sanity Studio, find their `newsletterSubscriber` doc → set `isActive` to `false` (don't delete — keep the audit trail)
- In Summit, remove them from every mailing list they're on
- Israeli anti-spam law: removal must take effect within 3 business days
