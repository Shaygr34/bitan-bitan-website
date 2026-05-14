# Newsletter Subscribers — Website Signup List

**Snapshot date:** 2026-05-14
**Source:** Sanity `newsletterSubscriber` documents (project `ul4uwnp7`, dataset `production`)
**Total subscribers:** 3 (all `isActive: true`)

## List

| # | Name | Email | Subscribed (UTC) | Categories |
|---|------|-------|------------------|------------|
| 1 | *(unnamed)* | `1hagitmarom@gmail.com` | 2026-03-16 07:01:50 | מס הכנסה, מע״מ, ביטוח לאומי, חברות, שכר, חוזרים, מענקים ופיצויים, החזרי מס |
| 2 | חנן רחמיאל | `htjr61@gmail.com` | 2026-03-17 08:31:54 | מענקים ופיצויים |
| 3 | פרי שולמית | `speri266@gmail.com` | 2026-03-18 05:13:45 | שאגת הארי, מענקים ופיצויים |

## Context

- Signup form (`src/components/NewsletterSignup.tsx`) was live in /knowledge during March 2026
- Component still exists; no longer imported by any page (removed from /knowledge & /knowledge/[slug])
- API route `src/app/api/newsletter/route.ts` is still operational (validates email, checks duplicates, writes to Sanity)
- No bounce/unsubscribe activity recorded — these 3 docs remain `isActive: true` since signup
- 2 of 3 selected "מענקים ופיצויים" — signup motivation was the שאגת הארי grant news cycle, not general firm updates

## GROQ to refresh this list

```groq
*[_type == "newsletterSubscriber"] | order(_createdAt asc) {
  _id, name, email, subscribedAt, isActive,
  "categoryNames": subscribedCategories[]->title
}
```
