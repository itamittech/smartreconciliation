# Reconciliation UI Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Three UI improvements: labeled Start button, per-row start spinner, and inline file upload in the reconciliation wizard.

**Architecture:** All changes are frontend-only. ReconciliationsPage.tsx gets a labeled button + per-row loading state. CreateReconciliationWizard.tsx gets an upload section reused across both Source and Target steps.

**Tech Stack:** React 19, TypeScript, Zustand, TanStack React Query, lucide-react, Tailwind CSS

---

## Task 1: Labeled "Start" Button + Per-Row Spinner

**Files:**
- Modify: `frontend/src/pages/ReconciliationsPage.tsx`

### Context

Currently the play button is an icon-only ghost button:
```tsx
<Button variant="ghost" size="icon" aria-label="Start reconciliation"
  onClick={(e) => handleStart(e, recon.id)}
  disabled={startReconciliation.isPending}
  className="hover:text-green-400">
  <PlayCircle className="h-4 w-4" />
</Button>
```

Problems:
- No text label → users guess its purpose
- `startReconciliation.isPending` is shared → clicking one row disables ALL play buttons

### Step 1: Add `startingIds` state

Find the existing state declarations near the top of `ReconciliationsPage` (around line 42-50) and add one new line:

```tsx
const [startingIds, setStartingIds] = useState<Set<number>>(new Set())
```

### Step 2: Update `handleStart` to track per-row loading

Replace the current `handleStart` function (around line 176-179):

```tsx
// BEFORE
const handleStart = (e: React.MouseEvent, id: number) => {
  e.stopPropagation()
  startReconciliation.mutate(id)
}
```

With:

```tsx
// AFTER
const handleStart = (e: React.MouseEvent, id: number) => {
  e.stopPropagation()
  setStartingIds((prev) => new Set(prev).add(id))
  startReconciliation.mutate(id, {
    onSettled: () =>
      setStartingIds((prev) => {
        const s = new Set(prev)
        s.delete(id)
        return s
      }),
  })
}
```

### Step 3: Replace the play button render

Find the play button block inside the `paginatedReconciliations.map(...)` render (around line 414-425):

```tsx
// BEFORE
{recon.status === 'PENDING' && (
  <Button
    variant="ghost"
    size="icon"
    aria-label="Start reconciliation"
    onClick={(e) => handleStart(e, recon.id)}
    disabled={startReconciliation.isPending}
    className="hover:text-green-400"
  >
    <PlayCircle className="h-4 w-4" />
  </Button>
)}
```

Replace with:

```tsx
// AFTER
{recon.status === 'PENDING' && (
  <Button
    variant="ghost"
    size="sm"
    aria-label="Start reconciliation"
    onClick={(e) => handleStart(e, recon.id)}
    disabled={startingIds.has(recon.id)}
    className="gap-1 text-green-500 hover:text-green-400 hover:bg-green-500/10"
  >
    {startingIds.has(recon.id) ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <PlayCircle className="h-4 w-4" />
    )}
    {startingIds.has(recon.id) ? 'Starting...' : 'Start'}
  </Button>
)}
```

Note: `Loader2` and `PlayCircle` are already imported at the top of the file — no new imports needed.

### Step 4: TypeScript compile check

```bash
cd frontend && node_modules/.bin/tsc --noEmit
```

Expected: No errors.

### Step 5: Commit

```bash
git add frontend/src/pages/ReconciliationsPage.tsx
git commit -m "feat: replace icon-only play button with labeled Start button and per-row spinner"
```

---

## Task 2: Inline File Upload in Wizard — Source Step

**Files:**
- Modify: `frontend/src/components/reconciliation/CreateReconciliationWizard.tsx`

### Context

Step 1 (Source) and Step 2 (Target) currently only show a list of already-uploaded files. We'll add an upload section at the top of each step. We reuse the same `useUploadFile` hook and auto-select the newly uploaded file.

### Step 1: Add new imports

At the top of `CreateReconciliationWizard.tsx`, add `Upload` to the lucide-react imports and `useUploadFile` to the hooks import:

```tsx
// Find this line (around line 2):
import {
  X,
  Loader2,
  FileText,
  GitBranch,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Sparkles,
  Key,
  Info,
} from 'lucide-react'

// Add Upload:
import {
  X,
  Loader2,
  FileText,
  GitBranch,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Sparkles,
  Key,
  Info,
  Upload,
} from 'lucide-react'
```

```tsx
// Find this line (around line 19):
import {
  useFiles,
  useRuleSets,
  useCreateReconciliation,
  useSuggestMappings,
  useSuggestRules,
  useCreateRuleSet,
  useAddFieldMapping,
  useAddMatchingRule,
} from '@/services/hooks'

// Add useUploadFile:
import {
  useFiles,
  useRuleSets,
  useCreateReconciliation,
  useSuggestMappings,
  useSuggestRules,
  useCreateRuleSet,
  useAddFieldMapping,
  useAddMatchingRule,
  useUploadFile,
} from '@/services/hooks'
```

### Step 2: Add upload state and hook inside the component

Inside `CreateReconciliationWizard` (after the existing hook calls, around line 102), add:

```tsx
const uploadFile = useUploadFile()
const [uploadError, setUploadError] = useState<string | null>(null)
```

### Step 3: Add a shared upload handler

Add this function inside the component, after the existing `handleCreateRuleSetFromAi` function (around line 240):

```tsx
const handleFileUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  role: 'source' | 'target'
) => {
  const file = e.target.files?.[0]
  if (!file) return
  setUploadError(null)
  uploadFile.mutate(
    { file },
    {
      onSuccess: (res) => {
        const newId = res.data?.id
        if (newId) {
          setWizardState((prev) => ({
            ...prev,
            [role === 'source' ? 'sourceFileId' : 'targetFileId']: newId,
          }))
        }
      },
      onError: (err) => {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      },
    }
  )
  // Reset the input so the same file can be re-selected if needed
  e.target.value = ''
}
```

### Step 4: Add upload UI section helper

Add this helper function just before `renderStepContent`:

```tsx
const renderUploadSection = (role: 'source' | 'target') => (
  <div className="mb-4">
    <label
      htmlFor={`upload-${role}`}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-3 text-sm transition-colors',
        uploadFile.isPending
          ? 'cursor-not-allowed opacity-60 border-border'
          : 'border-primary/30 hover:border-primary hover:bg-primary/5'
      )}
    >
      {uploadFile.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">Uploading…</span>
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium">Upload a new file</span>
          <span className="text-muted-foreground">(CSV, Excel, JSON, XML)</span>
        </>
      )}
      <input
        id={`upload-${role}`}
        type="file"
        accept=".csv,.xlsx,.xls,.json,.xml"
        className="sr-only"
        disabled={uploadFile.isPending}
        onChange={(e) => handleFileUpload(e, role)}
      />
    </label>
    {uploadError && (
      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        {uploadError}
      </p>
    )}
    <div className="relative my-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or pick from existing</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  </div>
)
```

### Step 5: Wire upload section into Source step (case 1)

Find `case 1:` in `renderStepContent` (around line 508). Replace its return value:

```tsx
// BEFORE
case 1:
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Select the source file to reconcile from</p>
      {filesLoading ? (
        ...
      ) : files.length === 0 ? (
        ...
      ) : (
        <div className="max-h-64 space-y-2 overflow-auto">
          ...
        </div>
      )}
    </div>
  )
```

```tsx
// AFTER
case 1:
  return (
    <div>
      {renderUploadSection('source')}
      <p className="mb-2 text-sm text-muted-foreground">Select the source file to reconcile from</p>
      {filesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No files uploaded yet</p>
        </div>
      ) : (
        <div className="max-h-52 space-y-2 overflow-auto">
          {files.map((file) => (
            <Card
              key={file.id}
              className={cn(
                'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                wizardState.sourceFileId === file.id && 'border-primary bg-primary/5',
                file.missing && 'opacity-70',
                file.missing && wizardState.sourceFileId === file.id && 'border-destructive bg-destructive/5'
              )}
              onClick={() => setWizardState({ ...wizardState, sourceFileId: file.id })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={cn("h-5 w-5 text-muted-foreground", file.missing && "text-destructive")} />
                  <div>
                    <p className={cn("font-medium", file.missing && "text-destructive")}>
                      {file.originalFilename}
                      {file.missing && <span className="ml-2 text-xs font-normal">(Missing)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.missing
                        ? "File missing from disk - please re-upload"
                        : `${file.rowCount?.toLocaleString() || '?'} rows, ${file.columnCount || '?'} columns`}
                    </p>
                  </div>
                </div>
                {wizardState.sourceFileId === file.id && (
                  file.missing
                    ? <AlertCircle className="h-5 w-5 text-destructive" />
                    : <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
```

Note the scroll area height changes from `max-h-64` to `max-h-52` to leave room for the upload section.

### Step 6: Wire upload section into Target step (case 2)

Find `case 2:` in `renderStepContent` (around line 562). Apply the same pattern:

```tsx
// AFTER
case 2:
  return (
    <div>
      {renderUploadSection('target')}
      <p className="mb-2 text-sm text-muted-foreground">Select the target file to reconcile against</p>
      {filesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No files uploaded yet</p>
        </div>
      ) : (
        <div className="max-h-52 space-y-2 overflow-auto">
          {files
            .filter((f) => f.id !== wizardState.sourceFileId)
            .map((file) => (
              <Card
                key={file.id}
                className={cn(
                  'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                  wizardState.targetFileId === file.id && 'border-primary bg-primary/5',
                  file.missing && 'opacity-70',
                  file.missing && wizardState.targetFileId === file.id && 'border-destructive bg-destructive/5'
                )}
                onClick={() => setWizardState({ ...wizardState, targetFileId: file.id })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={cn("h-5 w-5 text-muted-foreground", file.missing && "text-destructive")} />
                    <div>
                      <p className={cn("font-medium", file.missing && "text-destructive")}>
                        {file.originalFilename}
                        {file.missing && <span className="ml-2 text-xs font-normal">(Missing)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.missing
                          ? "File missing from disk - please re-upload"
                          : `${file.rowCount?.toLocaleString() || '?'} rows, ${file.columnCount || '?'} columns`}
                      </p>
                    </div>
                  </div>
                  {wizardState.targetFileId === file.id && (
                    file.missing
                      ? <AlertCircle className="h-5 w-5 text-destructive" />
                      : <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
```

### Step 7: TypeScript compile check

```bash
cd frontend && node_modules/.bin/tsc --noEmit
```

Expected: No errors.

### Step 8: Commit

```bash
git add frontend/src/components/reconciliation/CreateReconciliationWizard.tsx
git commit -m "feat: add inline file upload to wizard source and target steps"
```

---

## Manual Verification Checklist

After both tasks are implemented and compiled:

1. **Start button label** — Open Reconciliations page. For any PENDING reconciliation, the actions column should show a green "▶ Start" button (not just an icon).
2. **Per-row spinner** — Click Start on one row. That row's button should show a spinner + "Starting..." and be disabled. Other rows' Start buttons should remain active.
3. **Upload in wizard (source)** — Click New Reconciliation → fill Details → advance to Source step. The top of the step shows a dashed upload zone. Upload a CSV. It should show a spinner, then the new file appears in the list highlighted/selected.
4. **Upload in wizard (target)** — Advance to Target step. Same upload zone appears. Upload a second file; it auto-selects. The previously uploaded source file does not appear in the list (already filtered out).
5. **Upload error** — Try uploading an unsupported file type (e.g., `.pdf`) or a file the backend rejects. An error message should appear below the upload zone.
