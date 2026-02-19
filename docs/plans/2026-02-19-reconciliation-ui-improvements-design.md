# Reconciliation UI Improvements — Design

**Date:** 2026-02-19
**Status:** Approved

## Overview

Three targeted UI improvements to the Reconciliations page and Create Reconciliation Wizard:

1. **Clearer Start button** — Replace the icon-only play button with a labeled "Start" button
2. **In-wizard file upload** — Allow uploading source/target files directly from the wizard
3. **Per-row start spinner** — Show a loading spinner on the specific row being started

---

## Improvement 1: Labeled "Start" Button

### Problem
The `PlayCircle` icon-only button in the reconciliation table Actions column provides no text cue. Users unfamiliar with the UI must guess its purpose.

### Solution
Replace `Button variant="ghost" size="icon"` (icon only) with a small labeled button:
- Icon: `PlayCircle`
- Label: `"Start"`
- Style: `variant="ghost" size="sm"` with green accent (`text-green-500 hover:text-green-400 hover:bg-green-500/10`)

### Location
`frontend/src/pages/ReconciliationsPage.tsx` — inside the actions column render for `PENDING` rows.

---

## Improvement 2: File Upload Inside Wizard

### Problem
Steps 1 (Source) and 2 (Target) of the Create Reconciliation Wizard only allow selecting from files already uploaded. Users must leave the wizard to upload a file first, breaking the workflow.

### Solution
Add an inline upload section at the top of both file selection steps:
- A click-to-upload area with a `Upload` icon and label
- Accepts CSV, Excel (.xlsx/.xls), JSON, XML
- Uses the existing `useUploadFile` hook
- On successful upload: the new file appears in the list and is auto-selected
- Shows a `Loader2` spinner during upload; shows error if upload fails

### UI Layout (per step)
```
┌──────────────────────────────────────┐
│ ⬆ Upload a new file                  │
│ [ Choose file... ]  (csv/xlsx/json)  │
│ ─────────────── or ─────────────────  │
│ Pick from existing files             │
│ [ File A ]                           │
│ [ File B ] ✓                         │
└──────────────────────────────────────┘
```

### Location
`frontend/src/components/reconciliation/CreateReconciliationWizard.tsx` — cases 1 and 2 in `renderStepContent()`.

---

## Improvement 3: Per-Row Start Spinner

### Problem
The current `startReconciliation.isPending` flag is shared across the single mutation instance, so clicking Start on any row disables all play buttons simultaneously.

### Solution
Track a `Set<number>` of `startingIds` in component state. When Start is clicked for row `id`:
1. Add `id` to `startingIds`
2. Call `startReconciliation.mutate(id, { onSettled: () => remove id })`
3. The button for that specific row shows `Loader2 animate-spin` + label `"Starting..."` and is `disabled`
4. All other rows are unaffected

### Location
`frontend/src/pages/ReconciliationsPage.tsx` — `handleStart` function + play button render.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/pages/ReconciliationsPage.tsx` | Labeled Start button + per-row spinner logic |
| `frontend/src/components/reconciliation/CreateReconciliationWizard.tsx` | Upload section in Source and Target steps |

No backend changes required.
