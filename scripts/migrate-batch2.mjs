/**
 * Batch 2 WP → Sanity migration script.
 * Migrates 38 WordPress articles to Sanity CMS.
 *
 * Usage: node scripts/migrate-batch2.mjs
 * Requires: SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN) in .env.local
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ── Parse .env.local ──────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('ERROR: No SANITY_API_WRITE_TOKEN or SANITY_API_TOKEN found in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId: 'ul4uwnp7',
  dataset: 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ── Category mapping ──────────────────────────────────────────────────────────
const CATEGORY_MAP = {
  'vat': 'cat-vat',
  'real-estate-tax': '6503cbf4-bf0c-42b2-b2bd-66106ff7a13d',
  'employee-rights': 'db68e0b1-5467-495d-875c-a1390074c94a',
  'business-setup': '9f014721-26e9-4f69-97f6-f22c6e71d04a',
  'national-insurance': 'cat-national-insurance',
  'income-tax': 'cat-income-tax',
  'deductions-credits': 'aec9306e-b59c-4d33-b15e-178ca1dfc8c9',
  'reporting-updates': '04a2c203-9bdd-458c-9a83-74956cad720f',
};

const AUTHOR_ID = 'author-avi';

// ── The 38 articles ───────────────────────────────────────────────────────────
const ARTICLES = [
  // BATCH 1 — vat
  { titleMatch: 'פיצוי בגין הפרת הסכם חייב במע', slug: 'vat-on-contract-compensation', category: 'vat', altSearch: ['פיצוי', 'הפרת הסכם'] },
  { titleMatch: 'בוטל תשלום מקדמות בגין מס עסקאות', slug: 'vat-advance-payments-import-services', category: 'vat', altSearch: ['מקדמות', 'מס עסקאות'] },
  { titleMatch: 'שכ"ט לשירותי ייעוץ לחברה בחו', slug: 'vat-consulting-fees-foreign-company', category: 'vat', altSearch: ['ייעוץ לחברה', 'שכ"ט'] },
  { titleMatch: '17% מע"מ לחברה מחוץ לאילת', slug: 'vat-eilat-interest-loan', category: 'vat', altSearch: ['אילת', '17%'] },
  { titleMatch: 'מע"מ בשיעור 0 על שירות לתייר', slug: 'vat-zero-rate-tourist-services', category: 'vat', altSearch: ['מע"מ 0', 'תייר', 'מעמ-0', 'נותני שירותים'] },
  { titleMatch: 'מע"מ על תווי שי', slug: 'vat-on-gift-vouchers', category: 'vat', altSearch: ['תווי שי'] },
  { titleMatch: 'תשלום מע"מ עבור שטח בדירה המשמש לעסק', slug: 'vat-home-office-space', category: 'vat', altSearch: ['שטח בדירה', 'דירה המשמש'] },
  { titleMatch: 'לקזז מע"מ תשומות מהוצאה שאינה מוכרת', slug: 'vat-input-deduction-non-recognized-expense', category: 'vat', altSearch: ['לקזז מע', 'תשומות'] },
  // BATCH 2 — real-estate-tax
  { titleMatch: 'חברה תפרוס מס שבח ריאלי', slug: 'company-capital-gains-tax-spreading', category: 'real-estate-tax', altSearch: ['תפרוס', 'מס שבח ריאלי'] },
  { titleMatch: 'שיפוצים בדירה שיוכרו לצורך ניכוי', slug: 'renovation-deduction-capital-gains', category: 'real-estate-tax', altSearch: ['שיפוצים'] },
  { titleMatch: 'הגבלות חדשות בתחום הנדל"ן החל מה- 1 לינואר 2019', slug: 'real-estate-restrictions-2019', category: 'real-estate-tax', altSearch: ['הגבלות חדשות', 'נדל"ן', 'ינואר 2019'] },
  { titleMatch: 'פינוי-בינוי', slug: 'pinui-binui-urban-renewal', category: 'real-estate-tax', altSearch: ['פינוי'] },
  { titleMatch: 'הבדלים חשובים בין מס שבח למס הכנסה', slug: 'capital-gains-vs-income-tax-loss-offset', category: 'real-estate-tax', altSearch: ['הבדלים', 'מס שבח'] },
  // BATCH 3 — employee-rights
  { titleMatch: 'ריכוז נושאים חשובים בנוגע לעבודת נשים וחופשת לידה', slug: 'women-employment-maternity-leave', category: 'employee-rights', altSearch: ['עבודת נשים', 'חופשת לידה'] },
  { titleMatch: 'עובד שלא ניצל את מלוא ימי החופשה', slug: 'unused-annual-leave-rights', category: 'employee-rights', altSearch: ['ניצל', 'חופשה'] },
  { titleMatch: 'הגברת אכיפה בנוגע לאי הפרשות סוציאליות', slug: 'enforcement-social-contributions', category: 'employee-rights', altSearch: ['אכיפה', 'הפרשות'] },
  { titleMatch: 'בעל עסק חייב להפריש לקופת פנסיה', slug: 'employer-pension-vs-provident-fund', category: 'employee-rights', altSearch: ['להפריש', 'פנסיה'] },
  { titleMatch: 'חוק דמי מחלה לעובד', slug: 'employee-sick-pay-law', category: 'employee-rights', altSearch: ['דמי מחלה'] },
  { titleMatch: 'פיצויים לעובד שהתפטר עקב העתקת מקום מגורים', slug: 'resignation-relocation-severance', category: 'employee-rights', altSearch: ['התפטר', 'העתקת מקום'] },
  { titleMatch: 'זכאות לפיצויים ודמי אבטלה לעובדת שילדה', slug: 'maternity-severance-unemployment', category: 'employee-rights', altSearch: ['אבטלה', 'עובדת שילדה'] },
  // BATCH 4 — business-setup
  { titleMatch: 'תשלום אגרה שנתית לרשם החברות לשנת 2020', slug: 'annual-companies-registrar-fee-2020', category: 'business-setup', altSearch: ['אגרה שנתית', 'רשם החברות'] },
  { titleMatch: 'החלפת שם חברה', slug: 'changing-company-name', category: 'business-setup', altSearch: ['החלפת שם'] },
  { titleMatch: 'בעל חברה רוצה לשנות כתובת', slug: 'changing-company-address', category: 'business-setup', altSearch: ['לשנות כתובת'] },
  { titleMatch: 'בעל חברה שמשלם שכר לבני משפחתו', slug: 'family-salary-30-percent-withholding', category: 'business-setup', altSearch: ['בני משפחתו', '30%'] },
  { titleMatch: 'חובת ניהול ספרים הוראות מס הכנסה', slug: 'bookkeeping-requirements-income-tax', category: 'business-setup', altSearch: ['ניהול ספרים', 'הוראות ניהול ספרים'] },
  { titleMatch: 'בעל עסק שמעברים לו תשלום בהעברה בנקאית מחויב בהוצאת קבלת', slug: 'bank-transfer-receipt-requirement', category: 'business-setup', altSearch: ['העברה בנקאית', 'קבלת'] },
  { titleMatch: 'שפת חשבונית לבעל עסק הנותן שירות', slug: 'invoice-language-foreign-clients', category: 'business-setup', altSearch: ['שפת חשבונית'] },
  { titleMatch: 'פתיחת עסק חדש', slug: 'opening-new-business', category: 'business-setup', altSearch: ['עסק חדש'] },
  // BATCH 5 — national-insurance
  { titleMatch: 'חוב מע"מ או חוב ביטוח לאומי מה עדיף', slug: 'vat-debt-vs-national-insurance-debt', category: 'national-insurance', altSearch: ['חוב מע', 'ביטוח לאומי'] },
  { titleMatch: 'דין ביטוח לאומי עבור תושב ארצות הברית', slug: 'national-insurance-us-resident-israel', category: 'national-insurance', altSearch: ['ארצות הברית', 'תושב'] },
  { titleMatch: 'ביטוח לאומי לעצמאים', slug: 'national-insurance-self-employed', category: 'national-insurance', altSearch: ['ביטוח לאומי לעצמאים'] },
  // BATCH 6 — income-tax / deductions-credits
  { titleMatch: 'מצבים בהם ניתן להכיר הפרשה חשבונאית', slug: 'accounting-provision-tax-recognition', category: 'income-tax', altSearch: ['הפרשה חשבונאית'] },
  { titleMatch: 'גילוי מרצון', slug: 'voluntary-disclosure-tax', category: 'income-tax', altSearch: ['גילוי מרצון'] },
  { titleMatch: 'ניכוי הוצאות אחזקת טלפון סלולרי ואינטרנט', slug: 'phone-internet-expense-deduction', category: 'deductions-credits', altSearch: ['טלפון סלולרי', 'אינטרנט'] },
  { titleMatch: 'יתרת ההשקעה על נכס כהוצאה שוטפת', slug: 'remaining-asset-investment-current-expense', category: 'deductions-credits', altSearch: ['יתרת ההשקעה'] },
  { titleMatch: 'ניכוי הוצאות רכב של בעל עסק', slug: 'vehicle-expense-deduction-business-owner', category: 'deductions-credits', altSearch: ['הוצאות רכב'] },
  // BATCH 7 — reporting-updates
  { titleMatch: 'הורחב מתווה הפיצויים לתושבי הדרום', slug: 'southern-residents-compensation-expansion', category: 'reporting-updates', altSearch: ['מתווה הפיצויים', 'תושבי הדרום'] },
  { titleMatch: 'עדכון לבעלי עסקים באיזור עוטף עזה והדרום', slug: 'gaza-envelope-business-update', category: 'reporting-updates', altSearch: ['עוטף עזה', 'עדכון לבעלי עסקים'] },
];

// ── HTML entity decoder ───────────────────────────────────────────────────────
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.slice(2, -1));
      return String.fromCharCode(code);
    });
}

// ── HTML to Portable Text ─────────────────────────────────────────────────────
function htmlToPortableText(html) {
  // Remove script, style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Handle lists: <li> → bullet character
  text = text.replace(/<li[^>]*>/gi, '• ');
  text = text.replace(/<\/li>/gi, '\n');

  // Replace <br>, </p>, </div>, </h2>, </h3> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6])>/gi, '\n\n');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = decodeEntities(text);

  // Split into paragraphs
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);

  // Filter out unwanted content
  const REMOVE_PATTERNS = [
    /שתפו/,
    /\*\*\* המידע מנוסח בלשון זכר \*\*\*/,
    /המידע מנוסח בלשון זכר/,
    /לפרטים נוספים ניתן לפנות/,
    /בעל עסק יקר/,
    /facebook\.com/i,
    /fb\.com/i,
  ];

  const filtered = paragraphs.filter(p => {
    return !REMOVE_PATTERNS.some(pattern => pattern.test(p));
  });

  // Minimal "אנחנו" cleanup: if appears more than once, keep only the first
  let anachSeenOnce = false;
  const cleaned = filtered.map(p => {
    if (p.includes('אנחנו')) {
      if (!anachSeenOnce) {
        anachSeenOnce = true;
        return p; // keep first occurrence
      }
      // Remove subsequent occurrences of "אנחנו" from text
      return p.replace(/אנחנו/g, '');
    }
    return p;
  }).filter(p => p.trim().length > 0);

  // Convert to Portable Text blocks
  let blockIndex = 0;
  return cleaned.map(p => ({
    _type: 'block',
    _key: `block-${blockIndex++}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `span-${blockIndex}`, text: p, marks: [] }],
  }));
}

// ── Fetch WP posts ────────────────────────────────────────────────────────────
async function fetchAllWpPosts() {
  const allPosts = [];
  for (let page = 1; page <= 2; page++) {
    const url = `https://www.bitancpa.com/wp-json/wp/v2/posts?per_page=100&page=${page}`;
    console.log(`Fetching WP page ${page}...`);
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        if (resp.status === 400) {
          console.log(`  Page ${page}: no more posts (HTTP ${resp.status})`);
          break;
        }
        throw new Error(`HTTP ${resp.status}`);
      }
      const posts = await resp.json();
      console.log(`  Page ${page}: ${posts.length} posts`);
      allPosts.push(...posts);
    } catch (err) {
      console.error(`  Page ${page} error: ${err.message}`);
      if (page === 1) throw err; // page 1 is essential
    }
  }
  console.log(`Total WP posts fetched: ${allPosts.length}\n`);
  return allPosts;
}

// ── Match articles ────────────────────────────────────────────────────────────
function findWpPost(wpPosts, article) {
  // Decode all titles for matching
  const decodedPosts = wpPosts.map(p => ({
    ...p,
    decodedTitle: decodeEntities(p.title.rendered),
  }));

  // Strategy 1: exact substring match
  const exactMatch = decodedPosts.find(p => p.decodedTitle.includes(article.titleMatch));
  if (exactMatch) return exactMatch;

  // Strategy 2: try alt search terms (all terms must match)
  if (article.altSearch && article.altSearch.length > 0) {
    // Try each alt term individually first, then check combinations
    for (const term of article.altSearch) {
      const matches = decodedPosts.filter(p => p.decodedTitle.includes(term));
      if (matches.length === 1) return matches[0];
    }

    // Try combinations of 2 alt terms
    if (article.altSearch.length >= 2) {
      for (let i = 0; i < article.altSearch.length; i++) {
        for (let j = i + 1; j < article.altSearch.length; j++) {
          const matches = decodedPosts.filter(p =>
            p.decodedTitle.includes(article.altSearch[i]) &&
            p.decodedTitle.includes(article.altSearch[j])
          );
          if (matches.length === 1) return matches[0];
        }
      }
    }

    // If only one alt term, try it even if multiple matches (pick first)
    for (const term of article.altSearch) {
      const matches = decodedPosts.filter(p => p.decodedTitle.includes(term));
      if (matches.length > 0) {
        // For "הוצאות רכב", exclude the one about tourists
        if (article.slug === 'vehicle-expense-deduction-business-owner') {
          const filtered = matches.filter(p => !p.decodedTitle.includes('תיירים'));
          if (filtered.length > 0) return filtered[0];
        }
        return matches[0];
      }
    }

    // Strategy 3: try matching by WP slug
    const slugTerms = article.slug.split('-');
    // Check WP slug containment
    const wpSlugMatch = decodedPosts.find(p =>
      article.altSearch.some(term => {
        const normalized = term.replace(/"/g, '').replace(/\s+/g, '-');
        return p.slug && p.slug.includes(normalized);
      })
    );
    if (wpSlugMatch) return wpSlugMatch;
  }

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Batch 2 WP → Sanity Migration ===\n');

  // 1. Fetch WP posts
  const wpPosts = await fetchAllWpPosts();

  // Save raw data
  mkdirSync('docs/wp-migration', { recursive: true });
  writeFileSync('docs/wp-migration/batch2-raw-articles.json', JSON.stringify(wpPosts, null, 2));
  console.log('Saved raw WP data to docs/wp-migration/batch2-raw-articles.json\n');

  // 2. Match articles
  const matched = [];
  const unmatched = [];

  for (const article of ARTICLES) {
    const wp = findWpPost(wpPosts, article);
    if (wp) {
      matched.push({ article, wp });
    } else {
      unmatched.push(article);
    }
  }

  console.log(`Matched: ${matched.length}/${ARTICLES.length}`);
  if (unmatched.length > 0) {
    console.log(`\nUNMATCHED articles:`);
    for (const u of unmatched) {
      console.log(`  - "${u.titleMatch}" → ${u.slug}`);
    }
  }
  console.log('');

  // 3. Migrate matched articles
  const results = [];
  const tableRows = [];

  for (let i = 0; i < matched.length; i++) {
    const { article, wp } = matched[i];
    const label = `[${i + 1}/${matched.length}]`;
    const decodedTitle = decodeEntities(wp.title.rendered);
    const categoryId = CATEGORY_MAP[article.category];

    try {
      // Check for duplicates
      const existing = await client.fetch(
        `*[_type == "article" && title == $title][0]`,
        { title: decodedTitle }
      );

      // Build body
      const rawBody = htmlToPortableText(wp.content.rendered);

      // Add disclaimer for pre-2021 articles
      const pubDate = new Date(wp.date);
      const pubYear = pubDate.getFullYear();
      let body = [];

      if (pubYear < 2021) {
        body.push({
          _type: 'block',
          _key: 'block-disclaimer',
          style: 'normal',
          markDefs: [],
          children: [{
            _type: 'span',
            _key: 'span-disclaimer',
            text: `📌 מאמר זה פורסם במקור בשנת ${pubYear}. הנתונים והסכומים עשויים להשתנות — מומלץ לוודא מול הרשויות.`,
            marks: [],
          }],
        });
      }

      body.push(...rawBody);

      // Append footer blocks
      body.push({
        _type: 'block',
        _key: 'block-footer-cta',
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: 'span-footer-cta',
          text: 'לייעוץ פרטני בנושא, צרו קשר עם המשרד.',
          marks: [],
        }],
      });

      body.push({
        _type: 'block',
        _key: 'block-footer-disclaimer',
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: 'span-footer-disclaimer',
          text: 'המידע הכללי באתר אינו מהווה תחליף לייעוץ מקצועי פרטני.',
          marks: [],
        }],
      });

      // Extract excerpt (first 200 chars of text content)
      const allText = rawBody.map(b => b.children[0]?.text || '').join(' ');
      const excerpt = allText.slice(0, 200).trim();

      const docId = `article-${article.slug}`;
      const doc = {
        _id: docId,
        _type: 'article',
        title: decodedTitle,
        slug: { _type: 'slug', current: article.slug },
        category: { _type: 'reference', _ref: categoryId },
        author: { _type: 'reference', _ref: AUTHOR_ID },
        publishedAt: wp.date,
        excerpt,
        body,
        contentType: 'article',
      };

      await client.createOrReplace(doc);

      const status = existing ? 'replaced' : 'created';
      console.log(`${label} ${status}: "${decodedTitle}" → ${article.slug}`);
      tableRows.push({ num: i + 1, title: decodedTitle, slug: article.slug, category: article.category, status, wpId: wp.id, year: pubYear });
      results.push({ slug: article.slug, status, wpId: wp.id });
    } catch (err) {
      console.error(`${label} FAILED: "${decodedTitle}" → ${err.message}`);
      tableRows.push({ num: i + 1, title: decodedTitle, slug: article.slug, category: article.category, status: 'FAILED', wpId: wp.id, year: new Date(wp.date).getFullYear() });
      results.push({ slug: article.slug, status: 'failed', error: err.message });
    }
  }

  // 4. Print results table
  console.log('\n\n## Migration Results\n');
  console.log('| # | Title | Slug | Category | Year | Status | WP ID |');
  console.log('|---|-------|------|----------|------|--------|-------|');
  for (const row of tableRows) {
    const shortTitle = row.title.length > 40 ? row.title.slice(0, 40) + '...' : row.title;
    console.log(`| ${row.num} | ${shortTitle} | ${row.slug} | ${row.category} | ${row.year} | ${row.status} | ${row.wpId} |`);
  }

  if (unmatched.length > 0) {
    console.log('\n\n## Unmatched Articles\n');
    console.log('| # | Title Match | Slug | Category |');
    console.log('|---|-------------|------|----------|');
    unmatched.forEach((u, i) => {
      console.log(`| ${i + 1} | ${u.titleMatch} | ${u.slug} | ${u.category} |`);
    });
  }

  // Summary
  const created = results.filter(r => r.status === 'created').length;
  const replaced = results.filter(r => r.status === 'replaced').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`\n\nSummary: ${created} created, ${replaced} replaced, ${failed} failed, ${unmatched.length} unmatched`);
  console.log(`Total: ${matched.length} processed out of ${ARTICLES.length} target articles`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
