# Intake Form Persistence + Soft Docs Validation

**Date:** 2026-04-09
**Status:** Design approved, pending implementation
**Scope:** `src/app/intake/[token]/IntakeForm.tsx` + `intake.module.css`

## Problem

1. Clients lose all form progress on page refresh or browser close. Since they often need to leave to collect required documents, this causes friction and abandonment.
2. The hard-blocked docs step (disabled "הבא" button) prevents clients from reviewing their full submission or submitting what they have now and completing docs later.

## Design

### 1. localStorage Auto-Save/Restore

**Storage key:** `intake_draft_{token}`

**Saved payload:**
```json
{
  "formData": { "fullName": "...", "companyNumber": "...", ... },
  "clientType": "עצמאי",
  "step": 3,
  "skipTypeStep": true
}
```

Note: `savedAt` is intentionally omitted — the intake token itself has a server-enforced 4-day expiry, which serves as the implicit TTL for the draft. No separate staleness logic needed.

**Save trigger:** `useEffect` watching `formData`, `clientType`, `step` — debounced 300ms via `setTimeout`/`clearTimeout` pattern.

**Restore logic (on mount):**
```
if previousData exists → use previousData (server-authoritative, 4-day re-edit)
else if localStorage has intake_draft_{token}:
  - if saved skipTypeStep !== current skipTypeStep → discard draft (step mapping mismatch)
  - else → restore formData + clientType + step
else → start fresh (EMPTY_FORM)
```

The `skipTypeStep` guard prevents step number collisions: when `prefillClientType` is set, the form uses a 4-step layout (skipping client type selection), so step numbers from a 5-step session would land on the wrong content screen. Discarding the draft in this case is safe — it only happens when the link URL itself changed.

**Cleanup:** On successful submit (`setSubmitted(true)`), call `localStorage.removeItem(storageKey)`.

**What does NOT persist:** Files (browser security restriction on File objects). The welcome-back banner explicitly tells the client to re-upload.

### 2. Welcome-Back Banner

Shown when form state is restored from localStorage. Dismissible with ✕.

**Text:** "ברוכים השבים! שמרנו את הפרטים שמילאתם. קבצים שהועלו בעבר לא נשמרים — יש להעלות שוב."

**Style:** Surface background with gold left border, matching the existing design language. CSS class `.welcomeBanner` in intake.module.css.

**State:** `const [showWelcome, setShowWelcome] = useState(false)` — set to `true` only when localStorage restore actually happens.

**Placement:** Inside `.card`, above the step content.

### 3. Soft Docs Validation (replacing hard block)

#### Docs step changes:
- **Remove** the disabled "יש להעלות את כל מסמכי החובה" button
- **Restore** the normal "הבא" button — client can always proceed
- **Keep** the amber warning banner listing missing required docs (informational)
- **Keep** the amber `.dropzoneRequired` border on unfilled required doc slots

#### Progress bar badge:
- When required docs are missing, show a small amber dot on the "מסמכים" step circle in the progress bar
- CSS class `.stepBadge` — absolute positioned dot, `background: #F6C547`, 8×8px circle
- Only visible when `hasMissingDocs && contentStep !== 'docs'` (hide when on the docs step itself)
- **Circle lookup:** Find the docs step by matching `stepLabels.indexOf('מסמכים')` — NOT a hardcoded index. This handles both the 4-step (`skipTypeStep`) and 5-step flows correctly.

#### Review step changes:
- **Keep** the amber warning banner + "חזרה למסמכים" button
- **Remove** the disabled submit button behavior
- **Add inline confirmation:** When client clicks "שלח" with missing docs:
  1. Instead of submitting, show an inline confirmation panel (replaces the submit button area)
  2. Panel text: "לא העליתם את כל מסמכי החובה. ניתן להשלים גם מאוחר יותר. לשלוח בכל זאת?"
  3. Two buttons: "שלח בכל זאת" (gold, calls handleSubmit) + "חזרה למסמכים" (outline, navigates to docs step)
  4. NO browser `confirm()` dialog — inline only
- **State:** `const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)`
- **Reset:** `showConfirmSubmit` resets to `false` on any step navigation (`goNext`, `goBack`, or direct step set). This prevents stale confirmation panels when the user leaves and returns to the review step.
- **Flow:** Click "שלח" → if hasMissingDocs → `setShowConfirmSubmit(true)`. Click "שלח בכל זאת" → call `handleSubmit()` (which no longer checks for missing docs — that gate is removed).

### 4. handleSubmit changes

Remove the missing docs validation from `handleSubmit()` — the inline confirmation already handles the gate. The function should always proceed with submission when called.

## Files Modified

| File | Changes |
|------|---------|
| `src/app/intake/[token]/IntakeForm.tsx` | localStorage hooks, welcome banner, soft validation, inline confirmation |
| `src/app/intake/[token]/intake.module.css` | `.welcomeBanner`, `.stepBadge`, `.confirmPanel`, `.confirmText`, `.confirmButtons` |

## Edge Cases

- **Token reuse after submit:** localStorage cleared on submit, so revisiting shows server `previousData` (existing 4-day flow).
- **Multiple tabs:** Last-write-wins. Both tabs use the same key, so whichever saves last persists. Acceptable for this use case.
- **localStorage unavailable:** (private browsing, storage full) — wrapped in try/catch, graceful fallback to no persistence. No error shown to user.
- **Stale localStorage + fresh previousData:** `previousData` always wins (server is authoritative).

## Not in Scope

- File persistence (not possible with localStorage)
- Server-side draft saving (adds backend complexity, not needed — localStorage + 4-day re-edit covers the use case)
- Cross-device persistence (would require server-side drafts)
