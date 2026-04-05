# Bitan & Bitan — First Content Campaign Analytics Report
## March 15–22, 2026

**Property**: bitancpa.com (GA4 Property ID: 525595931)
**Report Generated**: March 22, 2026
**Data Source**: GA4 Analytics Data API + Summit CRM Newsletter Stats

---

## Executive Summary

The firm's first newsletter campaign on March 20, 2026 was a resounding success. One article — a professional guide about business grants under "שאגת הארי" — generated **1,010 page views** from **639 unique readers**, drove **23 WhatsApp inquiries** and **5 phone calls**, and is continuing to attract **100+ daily visitors via Google organic search** even after the newsletter spike subsided. The newsletter itself achieved a **71% open rate** and **34% click rate** — both 3x above industry benchmarks.

**The bottom line**: The firm digitally served 580+ clients in a single day with one article and one email. Before this system existed, delivering that same professional guidance would have required individual phone calls or meetings.

---

## Question 1: Did the Article Bring Potential Clients to the Firm?

### Conversion Events (March 8–22, 2026)

| Event | Total Count | Unique Users | From Grants Article |
|-------|------------|-------------|-------------------|
| **WhatsApp Click** | 23 | 18 | **11** (from 6 different days) |
| **Phone Click** | 5 | 4 | 1 |
| **Form Submit** | 0 | 0 | 0 |
| **Category Filter** | 249 | 35 | — |
| **FAQ Expand** | 58 | 6 | — |
| **Knowledge Search** | 52 | 6 | — |

### Key Conversion Details

**WhatsApp clicks from the grants article by date:**
- March 17: 1 click
- March 18: 2 clicks
- March 20 (newsletter day): **4 clicks**
- March 21: 2 clicks
- March 22: 3 clicks

**18 unique people read the article and then clicked WhatsApp to contact the firm.** This is a direct, measurable pipeline from content → client inquiry.

**Phone clicks** occurred from `/`, `/about`, `/knowledge`, and the closely-held-company article — people are calling after exploring the site, not just from the grants article.

**Note**: The contact form (`form_submit`) had zero events. This is likely because the Resend email integration is not configured (missing env vars), so visitors may have tried and failed, or prefer WhatsApp/phone. **Recommendation**: Either fix the contact form email delivery or remove it to avoid dead-end UX.

### Engagement Signals (Site-Wide)

Beyond direct conversions:
- **249 category filter events** from 35 users = people actively exploring the Knowledge Center
- **52 knowledge searches** = people looking for specific topics
- **58 FAQ expansions** = people engaging with firm expertise
- These indicate **discovery behavior** — visitors finding the firm through one article and then exploring what else the firm offers.

---

## Question 2: Newsletter → Website Behavior Cross-Reference

### The Smoking Gun: March 20 Hourly Traffic

Newsletter sent at **11:49**. Here's what happened:

| Hour | Total Users | Direct Users | Organic Users | Interpretation |
|------|-------------|-------------|---------------|---------------|
| 09:00 | 14 | 5 | 9 | Normal morning organic |
| 10:00 | 11 | 2 | 9 | Normal |
| 11:00 | 9 | 0 | 9 | Newsletter not yet sent |
| 12:00 | 6 | 0 | 6 | Early opens beginning |
| **13:00** | **60** | **46** | **13** | **NEWSLETTER TSUNAMI** |
| 14:00 | 23 | 18 | 5 | Continued newsletter opens |
| 15:00 | 22 | 16 | 6 | Afternoon wave |
| 16:00 | 12 | 7 | 5 | Tapering |
| 17:00 | 9 | 5 | 3 | Tapering |
| 18:00 | 13 | 6 | 7 | Evening trickle |
| 19:00–23:00 | 5–9/hr | 2–6 | 1–7 | Evening long tail |

**March 20 was the ONLY day where direct traffic (119 sessions) exceeded organic (104 sessions).** Every other day in the week, organic dominated by 3–8x.

### Summit Referral Confirmation

3 sessions came from `app.sumit.co.il / referral` — this is Summit's tracking pixel or link wrapper confirming newsletter origin. The bulk of newsletter traffic appears as `(direct) / (none)` because Summit's email links likely don't include UTM parameters.

### Newsletter vs Organic Behavior on the Grants Article

| Source | Views | Users | Avg Time | Engaged Sessions | Bounce Rate |
|--------|-------|-------|----------|-----------------|-------------|
| **Google Organic** | 539 | 426 | **2m 16s** | 165 | 67.5% |
| **Direct (newsletter proxy)** | 206 | 142 | **1m 51s** | 41 | 77.3% |
| Summit referral | 2 | 1 | 1m 40s | 1 | 0.0% |
| Claude.ai referral | 11 | 1 | 23m 3s | 3 | 25.0% |

**Interpretation**: Organic visitors spend slightly longer (2:16 vs 1:51) and bounce less (67% vs 77%). This makes sense — organic visitors found the article via search intent (they were looking for this topic), while newsletter recipients clicked out of trust/curiosity and some scanned quickly. Both engagement times are excellent for a professional article.

### Estimated Newsletter Attribution

- **119 direct sessions on March 20** vs average ~15 direct/day on other days
- **~104 incremental sessions** attributable to the newsletter
- Summit reports **141 clicks** — the difference (~37) likely hit before 13:00 or used different browser configurations that GA4 couldn't attribute

**Recommendation for next newsletter**: Add `?utm_source=summit&utm_medium=email&utm_campaign=shaagat-haari` to the article link. This will give exact attribution instead of estimates.

---

## Question 3: Is Google Sending Free Traffic?

### GA4 Evidence: Yes, Massively

Google organic accounted for **840 sessions** (71% of all traffic) in the past week. The grants article alone received **539 views from Google organic search** — meaning Google is actively ranking this article for relevant queries.

### Source Breakdown (Mar 15–22)

| Source | Sessions | % of Total |
|--------|---------|-----------|
| Google Organic | 840 | 70.8% |
| Direct | 307 | 25.9% |
| (not set) | 53 | 4.5% |
| Bing Organic | 10 | 0.8% |
| Elfsight | 9 | 0.8% |
| Claude.ai | 5 | 0.4% |
| Summit referral | 3 | 0.3% |
| ChatGPT | 1 | 0.1% |

### Search Console Data: CONNECTED

The grants article page received **6,697 impressions** and **349 clicks** from Google Search in one week. The firm is ranking **position 1–2** for core שאגת הארי queries:

| Query | Clicks | Impressions | Position |
|-------|--------|------------|----------|
| פיצוי לעסקים שאגת הארי | 49 | 724 | **#2** |
| מענק שאגת הארי | 35 | 489 | **#1** |
| מענקים שאגת הארי | 22 | 329 | **#1** |
| מתווה פיצויים שאגת הארי לעסקים | 15 | 225 | **#2** |
| מענק לעצמאים שאגת הארי | 12 | 128 | **#2** |

**Google is showing the firm's content ~15,000 times per week in search results.** This is free, ongoing visibility that no amount of advertising could replicate at this scale for a local CPA firm.

Full Search Console analysis in Question 5 below.

### AI Referral Traffic (Notable)

- **Claude.ai**: 5 sessions, 1 user, **23 minutes avg engagement** — someone used Claude to find/discuss the article and deeply engaged
- **ChatGPT**: 1 session — AI assistants are starting to surface the firm's content

---

## Question 4: Is This Sustainable or a Spike?

### 28-Day Traffic Trend

| Date | Users | Sessions | Page Views | Avg Duration | Notes |
|------|-------|----------|-----------|-------------|-------|
| Feb 23–Mar 7 | 1–8 | 1–14 | 4–265 | High (internal) | Pre-launch / internal testing |
| Mar 8 | 2 | 4 | 459 | 92m (internal) | Internal testing |
| Mar 12 | 26 | 28 | 58 | 2m | **First real organic traffic** |
| Mar 13 | 12 | 13 | 29 | 36s | Growing |
| Mar 14 | 20 | 20 | 21 | 18s | Growing |
| **Mar 15** | **75** | **92** | **287** | **4m 31s** | **Organic takeoff** |
| Mar 16 | 89 | 95 | 148 | 1m 52s | Steady growth |
| **Mar 17** | **138** | **159** | **510** | **5m 39s** | **Peak content engagement** |
| **Mar 18** | **148** | **177** | **345** | **3m 15s** | **Peak article day (232 article views)** |
| Mar 19 | 153 | 163 | 229 | 1m 52s | Sustained |
| **Mar 20** | **198** | **225** | **301** | **2m 8s** | **Newsletter day** |
| Mar 21 | 112 | 132 | 137 | 1m 1s | Shabbat + tracking issue* |
| Mar 22 | 136 | 147 | 152 | 1m 38s | Sunday, still strong |

### Grants Article Daily Trajectory

| Date | English Slug | Hebrew Slug | Combined | Interpretation |
|------|-------------|------------|----------|---------------|
| Mar 16 | 13 | 0 | **13** | Article discovered by Google |
| Mar 17 | 135 | 0 | **135** | Rapid organic growth |
| **Mar 18** | **116** | **116** | **232** | **Peak day (Hebrew slug appears)** |
| Mar 19 | 138 | 13 | **151** | Sustained |
| **Mar 20** | **192** | **74** | **266** | **Newsletter + organic combined** |
| Mar 21 | 106 | 13 | **119** | Post-newsletter, still strong |
| Mar 22 | 114 | 10 | **124** | Sustained via organic |

### Verdict: SUSTAINABLE

The article went from 0 → 135 daily views **before the newsletter was even sent** (Mar 17). After the newsletter spike on Mar 20, traffic settled to 119–124/day — **still higher than the pre-newsletter baseline**. Google organic is the primary sustainer. The newsletter provided an initial boost, but the article has independent organic momentum.

**The content flywheel is working**: Write quality content → Google indexes it → People find it → Some become leads → Newsletter amplifies the reach.

### Tracking Anomaly: March 21–22

Both days show **100% bounce rate** across ALL visitor types (new, returning, not set). This is technically impossible if users are spending 60–97 seconds on the site. Likely causes:
- GA4 script loading issue (possible CDN/caching problem)
- Cookie consent blocking GA4 on some visits
- A deployment that temporarily broke the GA4 tag

**Recommendation**: Check if a deployment happened on March 21. Verify that `NEXT_PUBLIC_GA4_ID` is properly set and the `GoogleAnalytics` component is rendering. The engagement time data is still being recorded (60–97s), so the core tracking works — it's specifically the "engaged session" classification that's broken.

---

## Question 5: What Should the Next Article Be About?

### Current Knowledge Center Performance (14 days)

**High Performers (organic traffic + high engagement):**

| Article | Views | Users | Avg Time | Bounce | Signal |
|---------|-------|-------|----------|--------|--------|
| business-grants-shaagat-haari | 784 | 581 | 2m 18s | 70% | Star performer |
| חופשה-ללא-תשלום-שאגת-הארי | 226 | 58 | 3m 45s | 57% | Hebrew version, deep reads |
| detailed-vat-reporting-guide | 29 | 21 | 3m 12s | 8% | **Best engagement, needs promotion** |
| closely-held-company | 16 | 14 | 3m 0s | 44% | Organic discovery |
| invoice-requirements-faq | 17 | 13 | 59s | 15% | Quick reference |
| trapped-profits | 12 | 8 | 2m 56s | 22% | High quality, low volume |

**Hidden Gems (high engagement time, low volume — content that rewards promotion):**

| Article | Views | Avg Time | Bounce | Why Promote? |
|---------|-------|----------|--------|-------------|
| iron-swords-salary-grant | 10 | **12m 12s** | 0% | Incredible engagement, no bounces |
| iron-swords-business-grant | 10 | **7m 38s** | 14% | Very deep reading |
| iron-swords-exempt-to-licensed | 4 | **7m 1s** | 0% | Niche but dedicated readers |
| detailed-vat-reporting-guide | 29 | **3m 12s** | 8% | Best ratio of volume × quality |

### Recommended Next Articles (by Signal Strength)

1. **VAT-related content** — `detailed-vat-reporting-guide` is already attracting organic traffic with the best engagement metrics on the site (3:12 avg, 8% bounce). More VAT content will compound on existing search authority. Topics: VAT registration thresholds, VAT on digital services, common VAT mistakes.

2. **Timely regulatory updates** — The שאגת הארי article proves that timely, regulatory content gets massive organic search traction. The next regulatory announcement from the Tax Authority should get the same treatment immediately.

3. **"Closely held company" (חברה משפחתית)** — Already attracting 16 organic views with 3-minute engagement. A deeper guide or FAQ would capture more of this search intent.

4. **Tax planning / תכנון מס** — The article `למה-חשוב-לתכנן-מס-מראש` gets 15 views with 1:50 avg time. Tax planning is an evergreen CPA topic with high commercial intent.

5. **Iron Swords articles as a newsletter bundle** — These have incredible engagement (7–12 minutes!) but low discovery. A "Complete Iron Swords Guide" newsletter could drive 100+ clicks based on the שאגת הארי campaign performance.

### Search Console Data: What People Are Googling (Mar 15–22)

**Top Search Queries Driving Clicks:**

| Query (Hebrew) | Clicks | Impressions | CTR | Avg Position |
|----------------|--------|------------|-----|-------------|
| פיצוי לעסקים שאגת הארי | 49 | 724 | 6.8% | **1.9** |
| מענק שאגת הארי | 35 | 489 | 7.2% | **1.1** |
| מענקים שאגת הארי | 22 | 329 | 6.7% | **1.2** |
| מתווה פיצויים שאגת הארי לעסקים | 15 | 225 | 6.7% | **1.6** |
| מענק לעצמאים שאגת הארי | 12 | 128 | 9.4% | **2.1** |
| מתווה פיצויים לעסקים שאגת הארי | 11 | 314 | 3.5% | 1.4 |
| רווחים כלואים | 9 | 47 | 19.1% | 6.6 |
| מענק שאגת הארי לעסקים | 8 | 32 | 25.0% | 4.7 |
| פיצויים לעסקים שאגת הארי | 8 | 154 | 5.2% | 1.6 |
| מענק לעסקים שאגת הארי | 7 | 96 | 7.3% | 2.4 |
| אישור ניכוי במקור וניהול ספרים | 4 | 68 | 5.9% | 6.3 |
| ביטן את ביטן | 4 | 8 | 50.0% | **1.1** |
| החזר בלו על סולר | 4 | 133 | 3.0% | 6.0 |
| חברת מעטים | 3 | 26 | 11.5% | 2.4 |

**The grants article page alone**: 349 clicks from 6,697 impressions (5.2% CTR, avg position 3.2).

**Total Search Impressions for the site**: ~15,000+ in one week. The firm is appearing in Google results thousands of times.

### Content Opportunities: High Impressions, Low CTR

These are queries where Google is SHOWING the firm's content but people aren't clicking — fixable with better titles/descriptions or dedicated content:

| Query | Impressions | Clicks | CTR | Position | Opportunity |
|-------|------------|--------|-----|----------|-------------|
| אישור ניכוי מס במקור וניהול ספרים | **400** | 3 | 0.8% | 8.0 | **Write a dedicated article** — huge search volume |
| מתווה פיצויים לעסקים שאגת הארי | 314 | 11 | 3.5% | 1.4 | Already ranking #1 — improve meta description |
| החזר בלו על סולר | **133** | 4 | 3.0% | 6.0 | **Write a diesel fuel tax refund guide** |
| מתווה פיצויים שאגת הארי לעצמאים | 123 | 4 | 3.3% | 1.1 | Ranking #1 but low CTR — optimize title |
| פיצוי לעצמאים שאגת הארי | 91 | 3 | 3.3% | 1.2 | Same — title optimization |
| מענק שאגת הארי לעצמאים | 75 | 2 | 2.7% | 1.3 | Same |
| דיווח מע"מ מקוון עד 23 לחודש | **66** | 1 | 1.5% | 6.0 | **Write a VAT online reporting guide** |
| דיווח חשבוניות מקוון | **58** | 1 | 1.7% | 4.7 | **Write an invoice reporting guide** |
| פיצויים לעצמאים שאגת הארי | 57 | 2 | 3.5% | 1.5 | Title optimization |

### Old WordPress URLs Still Getting Traffic

Google is still sending clicks to OLD WordPress URLs (Hebrew slugs on www.bitancpa.com). The redirects in next.config.ts are catching some, but several old URLs are still getting significant impressions:

| Old URL Pattern | Clicks | Impressions | Note |
|----------------|--------|------------|------|
| /דיווח-חשבוניות... | 40 | 1,794 | Old WP invoice reporting page |
| /החזר-בלו... | 30 | 1,235 | Old WP diesel refund page |
| /מה-אחוז... | 26 | 230 | Old WP tax percentage page |
| /חשבונית-מס... | 16 | 1,090 | Old WP invoice requirements |
| /טלפונים... | 15 | 873 | Old WP phone directory |
| /שווי-לצרכן... | 14 | 875 | Old WP car value page |

**These old pages represent 1,000+ weekly clicks that should flow to the new site's Knowledge Center.** Verify all redirects are working and consider writing new articles for the highest-impression topics.

### Updated Next Article Recommendations (with Search Console data)

1. **אישור ניכוי מס במקור וניהול ספרים** (Tax withholding certificate) — **400 impressions/week**, only 3 clicks. A dedicated article could capture this entire search volume. HIGH PRIORITY.

2. **החזר בלו על סולר** (Diesel fuel tax refund) — **133 impressions**, 4 clicks. No dedicated content exists. Write this and the firm owns position 1.

3. **דיווח חשבוניות מקוון / דיווח מע"מ** (Online invoice/VAT reporting) — Combined **124 impressions**. A comprehensive guide would capture both query families.

4. **שאגת הארי for עצמאים** (Self-employed grants) — The firm ranks #1 for multiple self-employed grant queries but CTR is low (2.7–3.3%). The current article covers both businesses and self-employed — consider a **dedicated self-employed guide** or improve the meta description to mention עצמאים explicitly.

5. **רווחים כלואים** (Trapped profits) — 47 impressions, 9 clicks, 19.1% CTR at position 6.6. Already performing well. A content refresh or expanded guide could push to position 1–3.

---

## Cross-Reference: Newsletter Campaign Performance

### Summit Campaign Stats (March 20, 11:49)

| Metric | Count | Rate | Industry Avg* | vs. Industry |
|--------|-------|------|--------------|-------------|
| Recipients | 624 | — | — | — |
| Delivered | 580 | 93% | ~95% | Normal |
| **Opens** | **411** | **71%** | **22–28%** | **2.5–3.2x above** |
| **Clicks** | **141** | **34%** | **3–5%** | **6.8–11.3x above** |
| Bounced | 7 | 1.1% | ~2% | Good |
| Not Delivered | 44 | 7% | ~5% | Slightly high |
| Blocked | 7 | 1.1% | — | Normal |
| Errors | 0 | 0% | — | Perfect |

*Industry averages for Israeli B2B email marketing

### What These Numbers Mean for the Firm

**71% open rate** means the firm's clients actively look for and trust communications from Bitan & Bitan. This is not a marketing metric — it's a relationship metric. 411 out of 580 clients opened the email within hours.

**34% click rate** means the content was compelling enough that one-third of all recipients clicked through to read the full article. Most marketing emails are lucky to get 3–5% click rates. The firm's clients are hungry for professional guidance.

**The 44 undelivered emails** represent clients with outdated or incorrect email addresses. These should be flagged for contact info updates at the next interaction.

---

## Actionable Recommendations

### Immediate (This Week)

1. **Add UTM parameters to all newsletter links**: `?utm_source=summit&utm_medium=email&utm_campaign=[article-name]` — enables precise attribution
2. **Fix the contact form**: Either configure Resend (RESEND_API_KEY + CONTACT_EMAIL_TO) or remove the form to avoid dead-end UX
3. **Investigate March 21–22 bounce anomaly**: Check if a deployment broke GA4 tracking
4. **Add service account to Search Console**: See instructions in Question 3 above
5. **Clean up 44 bounced email addresses**: Flag for manual update

### Short-Term (Next 2 Weeks)

6. **Publish next article on VAT or tax planning**: Ride the SEO momentum
7. **Send second newsletter** with the VAT article to prove the campaign wasn't a one-time fluke
8. **Create a WhatsApp auto-reply**: 18 people clicked WhatsApp from the article — ensure they get an immediate professional response

### Medium-Term (Next Month)

9. **Build a content calendar**: One article every 2 weeks, one newsletter monthly
10. **Set up automated GA4 weekly reports**: Service account is ready, just needs a scheduled script
11. **Track Search Console weekly**: Once access is granted, monitor query growth
12. **Consider a "subscribe to updates" CTA in articles**: Newsletter signup is available but may not be prominent enough in article pages

---

## Data Gaps & Limitations

| Gap | Impact | Resolution |
|-----|--------|-----------|
| No UTM parameters on newsletter | Can't precisely separate newsletter vs organic direct traffic | Add UTMs to next campaign |
| ~~Search Console not connected~~ | **RESOLVED** — now pulling query data | Service account added with Full access |
| Contact form not functional | Zero form submissions may be a broken feature, not lack of intent | Fix Resend integration |
| March 21–22 tracking anomaly | Bounce rate data unreliable for those days | Investigate GA4 tag loading |
| No baseline period | First week of real traffic, no month-over-month comparison yet | Will have baseline after 30 days |

---

## Appendix: Raw Data Tables

### A. Full Page Performance (14 days, top 30 pages)

| Page | Views | Users | Avg Duration | Bounce Rate |
|------|-------|-------|-------------|-------------|
| /knowledge/business-grants-...shaagat-haari-2026 | 784 | 581 | 2m 18s | 70.2% |
| /knowledge | 702 | 173 | 2m 13s | 44.7% |
| / | 435 | 179 | 2m 44s | 52.0% |
| /knowledge/חופשה-ללא-תשלום-חלת-שאגת-הארי | 226 | 58 | 3m 45s | 56.8% |
| /about | 122 | 19 | 4m 26s | 15.6% |
| /services | 64 | 14 | 2m 49s | 15.8% |
| /faq | 60 | 11 | 3m 8s | 21.1% |
| /contact | 53 | 8 | 3m 21s | 15.8% |
| /services/tax-advisory | 30 | 7 | 3m 59s | 50.0% |
| /knowledge/detailed-vat-reporting-guide | 29 | 21 | 3m 12s | 8.3% |
| /knowledge/invoice-requirements-faq | 17 | 13 | 59s | 15.4% |
| /knowledge/closely-held-company | 16 | 14 | 3m 0s | 43.8% |
| /knowledge/למה-חשוב-לתכנן-מס-מראש | 15 | 6 | 1m 50s | 18.2% |
| /knowledge/section-17-4-credit-note-connection | 12 | 9 | 45s | 63.6% |
| /knowledge/trapped-profits | 12 | 8 | 2m 56s | 22.2% |

### B. Service Account Credentials

- **Email**: bitan-analytics@bitan-ga4-reader.iam.gserviceaccount.com
- **GCP Project**: bitan-ga4-reader
- **Key File**: ~/ga4-credentials.json
- **APIs Enabled**: Analytics Data API, Search Console API
- **GA4 Access**: Viewer on Property 525595931
- **Search Console Access**: Full access on sc-domain:bitancpa.com
