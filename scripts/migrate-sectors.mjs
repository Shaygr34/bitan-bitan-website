/**
 * Migrate תחום עיסוק from old granular entities to 25 canonical categories.
 *
 * Usage: SUMMIT_COMPANY_ID=... SUMMIT_API_KEY=... node scripts/migrate-sectors.mjs [--resume INDEX]
 *
 * - Reads mapping from docs/sector-consolidation-map.json
 * - Gets all clients from folder 557688522
 * - For each client: checks תחום עיסוק, maps to canonical, updates + adds remark
 * - Rate-limited: 1 call/sec, batch of 50 with 15s pause, 65s backoff on 403
 * - Progress saved to /tmp/sector-migration-progress.json (resume-safe)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://api.sumit.co.il";
const FOLDER_ID = "557688522";
const RATE_LIMIT_MS = 1000;
const BATCH_SIZE = 50;
const BATCH_PAUSE_MS = 15000;
const MAX_RETRIES = 5;
const PROGRESS_FILE = "/tmp/sector-migration-progress.json";

const creds = {
  CompanyID: parseInt(process.env.SUMMIT_COMPANY_ID, 10),
  APIKey: process.env.SUMMIT_API_KEY?.trim(),
};

if (!creds.APIKey) {
  console.error("Missing SUMMIT_API_KEY");
  process.exit(1);
}

// ── Canonical category → new Summit entity ID ──
const CATEGORY_TO_NEW_ID = {
  'נדל"ן ושכירות': 1840456818,
  'בנייה ושיפוצים': 1840457091,
  'ייעוץ וניהול': 1099298826,
  'טכנולוגיה ודיגיטל': 1840457217,
  'מזון ומסעדנות': 1840456923,
  'אופנה וטקסטיל': 1840457450,
  'ביטוח ופיננסים': 1099298366,
  'עריכת דין': 1099298876,
  'ראיית חשבון': 1840457580,
  'בריאות ורפואה': 1840457466,
  'טיפול ופסיכולוגיה': 1840457142,
  'חינוך והדרכה': 1840457494,
  'עיצוב ויצירה': 1099298678,
  'צילום ומדיה': 1840457867,
  'מוזיקה ובידור': 1840457501,
  'יבוא וסחר': 1840457509,
  'קמעונאות': 1840458123,
  'הובלות ושליחויות': 1840457516,
  'כושר וספורט': 1840458274,
  'יופי וטיפוח': 1840458558,
  'רכב ומוסכים': 1840458289,
  'ניקיון ותחזוקה': 1840458434,
  'תעשייה וייצור': 1840458656,
  'חקלאות ובעלי חיים': 1840458295,
  'אחר': 1840458584,
};

const CANONICAL_IDS = new Set(Object.values(CATEGORY_TO_NEW_ID));

// ── Build lookup from mapping file ──
function buildLookup() {
  const mapPath = join(__dirname, "..", "docs", "sector-consolidation-map.json");
  const data = JSON.parse(readFileSync(mapPath, "utf8"));
  const lookup = {};

  for (const m of data.mapping) {
    lookup[m.entityId] = {
      canonicalCategory: m.canonicalCategory,
      highValueDetail: m.highValueDetail,
      originalName: m.originalName,
    };
  }

  for (const s of data.statusEntries) {
    lookup[s.entityId] = {
      canonicalCategory: "אחר",
      highValueDetail: s.originalName,
      originalName: s.originalName,
    };
  }

  return lookup;
}

// ── API helpers ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiCall(endpoint, body, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Language": "he" },
        body: JSON.stringify({ Credentials: creds, ...body }),
        signal: AbortSignal.timeout(20000),
      });

      if (res.status === 403 || res.status === 429) {
        const backoff = 65000 * attempt;
        console.log(`  Rate limited (${res.status}). Pausing ${Math.round(backoff / 1000)}s (attempt ${attempt})...`);
        await sleep(backoff);
        continue;
      }

      const text = await res.text();
      if (!text || text.trim().length === 0) {
        if (attempt < retries) {
          await sleep(5000);
          continue;
        }
        return null;
      }

      const json = JSON.parse(text);
      if (json.Status === 0) return json.Data;
      console.error(`  API error: ${json.UserErrorMessage || json.TechnicalErrorDetails}`);
      return null;
    } catch (err) {
      if (attempt < retries) {
        await sleep(5000 * attempt);
        continue;
      }
      console.error(`  Fetch error: ${err.message}`);
      return null;
    }
  }
  return null;
}

// ── Summit API wrappers ──
async function listEntities(startIndex = 0, pageSize = 100) {
  return apiCall("/crm/data/listentities/", {
    Folder: FOLDER_ID,
    Paging: { StartIndex: startIndex, PageSize: pageSize },
    IncludeInheritedFolders: false,
  });
}

async function getEntity(entityId) {
  return apiCall("/crm/data/getentity/", {
    EntityID: entityId,
    Folder: FOLDER_ID,
  });
}

async function updateEntity(entityId, properties) {
  return apiCall("/crm/data/updateentity/", {
    Entity: {
      ID: entityId,
      Folder: FOLDER_ID,
      Properties: properties,
    },
  });
}

async function addRemark(entityId, content) {
  return apiCall("/crm/data/addclientremark/", {
    EntityID: entityId,
    Folder: FOLDER_ID,
    Content: content,
  });
}

// ── Load/save progress ──
function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
  }
  return {
    processed: 0,
    updated: 0,
    skippedNoSector: 0,
    skippedAlreadyCanonical: 0,
    skippedNotInMapping: 0,
    errors: 0,
    lastProcessedIndex: -1,
    updates: [],
  };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Main ──
async function main() {
  const lookup = buildLookup();
  console.log(`Loaded ${Object.keys(lookup).length} sector mappings`);
  console.log(`${Object.keys(CATEGORY_TO_NEW_ID).length} canonical categories`);

  // Get resume index from CLI
  const resumeIndex = process.argv.includes("--resume")
    ? parseInt(process.argv[process.argv.indexOf("--resume") + 1], 10)
    : 0;

  // 1. Collect all client IDs
  console.log("\n=== Phase 1: Collecting client IDs ===");
  const allIds = [];
  let startIndex = 0;
  let hasNext = true;
  while (hasNext) {
    const data = await listEntities(startIndex, 100);
    if (!data || !data.Entities) break;
    for (const e of data.Entities) allIds.push(e.ID);
    hasNext = data.HasNextPage;
    startIndex += 100;
    await sleep(RATE_LIMIT_MS);
  }
  console.log(`Total clients: ${allIds.length}`);

  // 2. Process clients
  console.log(`\n=== Phase 2: Processing (starting from index ${resumeIndex}) ===`);
  const progress = loadProgress();
  let callsInBatch = 0;

  for (let i = resumeIndex; i < allIds.length; i++) {
    const clientId = allIds[i];

    // Rate limiting
    await sleep(RATE_LIMIT_MS);
    callsInBatch++;
    if (callsInBatch >= BATCH_SIZE) {
      console.log(`  [Batch pause] Processed ${i + 1}/${allIds.length}. Pausing ${BATCH_PAUSE_MS / 1000}s...`);
      await sleep(BATCH_PAUSE_MS);
      callsInBatch = 0;
    }

    // Get entity
    const data = await getEntity(clientId);
    if (!data || !data.Entity) {
      progress.errors++;
      progress.lastProcessedIndex = i;
      saveProgress(progress);
      continue;
    }

    const entity = data.Entity;
    const name = entity["Customers_FullName"]?.[0] || `ID:${clientId}`;
    progress.processed++;

    // Check תחום עיסוק
    const sectorField = entity["תחום עיסוק"];
    if (!sectorField || !sectorField[0]) {
      progress.skippedNoSector++;
      progress.lastProcessedIndex = i;
      if (i % 50 === 0) {
        console.log(`  [${i}/${allIds.length}] ${name} — no sector`);
        saveProgress(progress);
      }
      continue;
    }

    const oldSectorId = sectorField[0].ID;
    const oldSectorName = sectorField[0].Name;

    // Already canonical?
    if (CANONICAL_IDS.has(oldSectorId)) {
      progress.skippedAlreadyCanonical++;
      progress.lastProcessedIndex = i;
      console.log(`  [${i}] ${name} — already canonical: ${oldSectorName}`);
      continue;
    }

    // Look up mapping
    const mapping = lookup[oldSectorId];
    if (!mapping) {
      progress.skippedNotInMapping++;
      progress.lastProcessedIndex = i;
      console.log(`  [${i}] ${name} — sector ${oldSectorId} (${oldSectorName}) NOT IN MAPPING`);
      continue;
    }

    const newId = CATEGORY_TO_NEW_ID[mapping.canonicalCategory];
    if (!newId) {
      progress.errors++;
      console.error(`  [${i}] ${name} — no new ID for category: ${mapping.canonicalCategory}`);
      continue;
    }

    // Update entity
    await sleep(RATE_LIMIT_MS);
    callsInBatch++;
    const updateResult = await updateEntity(clientId, { "תחום עיסוק": newId });
    if (!updateResult) {
      progress.errors++;
      console.error(`  [${i}] ${name} — UPDATE FAILED`);
      progress.lastProcessedIndex = i;
      saveProgress(progress);
      continue;
    }

    // Add remark if highValueDetail
    if (mapping.highValueDetail) {
      await sleep(RATE_LIMIT_MS);
      callsInBatch++;
      const remarkText = `תחום עיסוק מקורי: ${mapping.originalName}. פירוט: ${mapping.highValueDetail}`;
      await addRemark(clientId, remarkText);
    }

    progress.updated++;
    progress.lastProcessedIndex = i;
    progress.updates.push({
      clientId,
      name,
      oldSector: oldSectorName,
      oldSectorId,
      newCategory: mapping.canonicalCategory,
      newId,
      detail: mapping.highValueDetail,
      timestamp: new Date().toISOString(),
    });

    console.log(`  [${i}] ✓ ${name}: ${oldSectorName} → ${mapping.canonicalCategory}${mapping.highValueDetail ? ` (${mapping.highValueDetail})` : ""}`);

    // Save progress every 10 updates
    if (progress.updated % 10 === 0) saveProgress(progress);
  }

  // Final save
  saveProgress(progress);

  // Summary
  console.log("\n=== Migration Summary ===");
  console.log(`Total clients:          ${allIds.length}`);
  console.log(`Processed:              ${progress.processed}`);
  console.log(`Updated:                ${progress.updated}`);
  console.log(`Skipped (no sector):    ${progress.skippedNoSector}`);
  console.log(`Skipped (already OK):   ${progress.skippedAlreadyCanonical}`);
  console.log(`Skipped (not mapped):   ${progress.skippedNotInMapping}`);
  console.log(`Errors:                 ${progress.errors}`);
  console.log(`\nProgress saved to: ${PROGRESS_FILE}`);
}

main().catch(console.error);
