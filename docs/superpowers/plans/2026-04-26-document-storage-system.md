# Document Storage System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire intake file uploads through Sanity clientDocument schema with proper naming, then write compact clickable links to Summit's native file fields.

**Architecture:** Files already upload to Sanity CDN (working). We add a structured layer: each file creates a `clientDocument` doc in Sanity with metadata (client, docType, timestamp). The Sanity CDN URL is then written to the matching Summit file field (e.g., `ת.ז/ רישיון בעלים`) as a clean short link, not dumped into הערות as a raw URL.

**Tech Stack:** Next.js 15, Sanity v3 (project ul4uwnp7, Free plan, 100GB assets), Summit CRM API

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/api/intake/route.ts` | **Modify** — Wire clientDocument creation + Summit file field writes |
| `src/lib/intake-types.ts` | **Modify** — Add DOC_KEY_TO_SUMMIT_FIELD mapping if not already covered by DOC_FIELDS |
| `src/lib/document-urls.ts` | **Create** — URL shortening/formatting helper for Summit display |
| `src/sanity/schemas/clientDocument.ts` | **No change** — Schema is already complete |

---

## Chunk 1: Structured Document Storage + Summit File Fields

### Task 1: Create URL formatting helper

**Files:**
- Create: `src/lib/document-urls.ts`

- [ ] **Step 1: Create the helper file**

This formats Sanity CDN URLs into compact, readable link text for Summit fields. Summit file fields accept a URL string — the display name in Summit comes from the URL itself or the field label.

```typescript
// src/lib/document-urls.ts

/**
 * Build a clean filename for Sanity CDN uploads.
 * Pattern: {clientName}_{docType}_{date}.{ext}
 * Example: "יוסי-כהן_תעודת-התאגדות_2026-04-26.pdf"
 */
export function buildDocFilename(
  clientName: string,
  docLabel: string,
  originalFilename: string,
): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'pdf'
  const date = new Date().toISOString().split('T')[0]
  // Clean names: replace spaces with dashes, remove special chars
  const cleanClient = clientName.replace(/\s+/g, '-').replace(/[/"']/g, '')
  const cleanDoc = docLabel.replace(/\s+/g, '-').replace(/[/"']/g, '')
  return `${cleanClient}_${cleanDoc}_${date}.${ext}`
}

/**
 * Build a compact display line for Summit הערות.
 * Pattern: "📄 {docLabel}: {shortUrl}"
 * The URL is already short since we control the filename.
 */
export function buildSummitNoteEntry(docLabel: string, url: string): string {
  return `📄 ${docLabel}: ${url}`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/document-urls.ts
git commit -m "feat: add document URL formatting helper"
```

---

### Task 2: Wire clientDocument creation during file upload

**Files:**
- Modify: `src/app/api/intake/route.ts` (section 5, lines ~392-432)

- [ ] **Step 1: Update file upload loop to create clientDocument in Sanity**

Replace the current file upload section (section 5 + 6) with:

```typescript
// -----------------------------------------------------------------------
// 5. Upload files to Sanity CDN + create clientDocument records
// -----------------------------------------------------------------------
const fileResults: { docKey: string; label: string; url: string; filename: string; sanityDocId: string }[] = []

const entries = Array.from(formData.entries())
for (const [key, value] of entries) {
  if (!key.startsWith('file_')) continue
  if (!(value instanceof File)) continue

  const docKey = key.replace(/^file_/, '')
  const docField = DOC_FIELDS.find(d => d.key === docKey)
  const label = docField?.label ?? (formData.get(`label_${docKey}`) as string | null) ?? docKey
  const originalFilename = value.name || `${docKey}.bin`
  const contentType = value.type || 'application/octet-stream'

  // Build clean filename: {clientName}_{docLabel}_{date}.{ext}
  const cleanFilename = buildDocFilename(fullName, label, originalFilename)

  try {
    const arrayBuffer = await value.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Sanity CDN with clean filename
    const asset = await writeClient.assets.upload('file', buffer, {
      filename: cleanFilename,
      contentType,
    })

    if (!asset?.url) continue

    // Create structured clientDocument in Sanity
    const sanityDoc = await writeClient.create({
      _type: 'clientDocument',
      summitEntityId: entityId || '',
      clientName: fullName,
      docType: docKey,
      file: {
        _type: 'file',
        asset: { _type: 'reference', _ref: asset._id },
      },
      uploadedBy: 'client',
    })

    fileResults.push({
      docKey,
      label,
      url: asset.url,
      filename: cleanFilename,
      sanityDocId: sanityDoc._id,
    })
  } catch (err) {
    console.error(`Failed to upload file ${originalFilename}:`, err)
  }
}

// -----------------------------------------------------------------------
// 6. Write file URLs to Summit entity fields + notes
// -----------------------------------------------------------------------
if (entityId && fileResults.length > 0) {
  const summitFileProps: Record<string, unknown> = {}
  const noteLines: string[] = ['מסמכים שהועלו:', '']

  for (const f of fileResults) {
    // Write to Summit's native file field if mapping exists
    const docField = DOC_FIELDS.find(d => d.key === f.docKey)
    if (docField?.summitField) {
      summitFileProps[docField.summitField] = f.url
    }

    // Build compact note line
    noteLines.push(buildSummitNoteEntry(f.label, f.url))
  }

  // Update Summit: file fields + notes
  const credentials = getSummitCredentials()
  if (credentials.APIKey && credentials.CompanyID) {
    try {
      await fetch('https://api.sumit.co.il/crm/data/updateentity/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Language': 'he' },
        body: JSON.stringify({
          Credentials: credentials,
          Entity: {
            ID: entityId,
            Folder: '557688522',
            Properties: {
              ...summitFileProps,
              'הערות': noteLines.join('\n'),
            },
          },
        }),
      })
    } catch (err) {
      console.error('Summit file fields update error:', err)
    }
  }
}
```

- [ ] **Step 2: Add imports at top of route.ts**

```typescript
import { DOC_FIELDS } from '@/lib/intake-types'
import { buildDocFilename, buildSummitNoteEntry } from '@/lib/document-urls'
```

Note: `DOC_FIELDS` may already be importable from intake-types — verify it's exported.

- [ ] **Step 3: Remove the old `updateSummitEntityNotes` call**

The old section 6 that called `updateSummitEntityNotes(entityId, noteLines.join('\n'))` is replaced by the new inline Summit update above. Make sure the old call is gone.

- [ ] **Step 4: Update submittedData JSON to include Sanity doc IDs**

In section 7 (mark token completed), add the file results:

```typescript
const submittedData = JSON.stringify({
  clientType,
  fullName,
  companyNumber,
  phone,
  email,
  address,
  city,
  zipCode,
  birthdate,
  businessSector,
  shareholderDetails,
  fileCount: fileResults.length,
  fileNames: fileResults.map((f) => f.filename),
  sanityDocIds: fileResults.map((f) => f.sanityDocId),
})
```

- [ ] **Step 5: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/api/intake/route.ts src/lib/document-urls.ts
git commit -m "feat: structured document storage — clientDocument + Summit file fields"
```

---

### Task 3: Verify DOC_FIELDS → Summit field mapping is correct

**Files:**
- Read: `src/lib/intake-types.ts` (DOC_FIELDS array)

- [ ] **Step 1: Verify each DOC_FIELDS entry has the correct summitField**

Current mapping to verify against Summit schema:

| docKey | label | summitField | Notes |
|--------|-------|-------------|-------|
| idCard | צילום ת.ז + ספח | ת.ז/ רישיון בעלים | Shared with driverLicense |
| driverLicense | צילום רישיון נהיגה | ת.ז/ רישיון בעלים | Shared with idCard — may overwrite! |
| bankApproval | אישור ניהול חשבון / שיק מבוטל | אישור ניהול חשבון | OK |
| osekMurshe | תעודת עוסק מורשה | תעודת עוסק מורשה | OK |
| ptihaTikMaam | פתיחת תיק מע"מ | פתיחת תיק מעמ | OK |
| teudatHitagdut | תעודת התאגדות | תעודת התאגדות | OK |
| takanonHevra | תקנון חברה | תקנון חברה | OK |
| protokolMurshe | פרוטוקול מורשה חתימה | פרוטוקול מורשה חתימה | OK |
| nesahHevra | נסח חברה | נסח חברה | OK |
| rentalContract | חוזה שכירות (ככל וקיים) | (empty) | No Summit field — notes only |

**Issue:** idCard and driverLicense share the same summitField (`ת.ז/ רישיון בעלים`). If both are uploaded, the second overwrites the first. Summit's file field may accept multiple URLs — test this. If not, combine both into one note entry for that field.

- [ ] **Step 2: Fix the shared field collision if needed**

If Summit's `ת.ז/ רישיון בעלים` accepts only one URL, concatenate both URLs separated by newline:

```typescript
// In the file fields loop, accumulate rather than overwrite
if (docField?.summitField) {
  const existing = summitFileProps[docField.summitField]
  if (existing) {
    // Multiple docs share this Summit field — append
    summitFileProps[docField.summitField] = `${existing}\n${f.url}`
  } else {
    summitFileProps[docField.summitField] = f.url
  }
}
```

- [ ] **Step 3: Commit if changes made**

```bash
git add src/app/api/intake/route.ts
git commit -m "fix: handle shared Summit file fields (idCard + driverLicense)"
```

---

### Task 4: Test end-to-end with a real form submission

- [ ] **Step 1: Create a test intake token**

Use Bitan OS or create directly in Sanity Studio. Set manager to אבי ביטן.

- [ ] **Step 2: Fill the intake form with test data**

Go to `https://bitancpa.com/intake/{token}`, fill all fields, upload a test PDF for ת.ז.

- [ ] **Step 3: Verify in Sanity Studio**

Check that a `clientDocument` was created with:
- Correct summitEntityId
- Correct clientName
- Correct docType (idCard)
- File asset linked
- uploadedBy = 'client'

- [ ] **Step 4: Verify in Summit**

Check the client entity:
- `ת.ז/ רישיון בעלים` field has the Sanity CDN URL
- הערות has compact formatted note with 📄 prefix
- URL opens the document when clicked

- [ ] **Step 5: Clean up test entity**

Archive or delete the test entity from Summit (use status=-1 trick).

---

### Task 5: Push to production

- [ ] **Step 1: Final TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 2: Push**

```bash
git push origin main
```

Railway auto-deploys.

- [ ] **Step 3: Verify deployment**

Check Railway logs for successful build.

---

## Post-Implementation Notes

### What this does NOT cover (future tasks):
1. **OS dashboard file viewer** — querying clientDocuments per client on bitan-bitan-os
2. **OS workflow rehaul** — progressive checklist with completion % tied to Summit statuses
3. **File type validation** — checking uploaded file categories match client type requirements
4. **Existing client files** — migrating old הערות URL dumps to clientDocument records
