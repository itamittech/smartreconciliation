import { useState } from 'react'
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
import { Button, Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { WizardStepIndicator } from './WizardStepIndicator'
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
import type { AiSuggestedMapping, AiSuggestedRule } from '@/services/types'

type RulesStepMode = 'choose' | 'analyzing-mappings' | 'review-mappings' | 'analyzing-rules' | 'review-rules' | 'manual'

interface AcceptedMapping extends AiSuggestedMapping {
  accepted: boolean
}

interface AcceptedRule extends AiSuggestedRule {
  accepted: boolean
}

interface WizardState {
  name: string
  description: string
  sourceFileId: number | null
  targetFileId: number | null
  ruleSetId: number | null
}

interface CreateReconciliationWizardProps {
  onClose: () => void
  onSuccess?: () => void
}

const steps = [
  { label: 'Details' },
  { label: 'Source' },
  { label: 'Target' },
  { label: 'Rules' },
]

const confidenceBadge = (confidence: number) => {
  const pct = Math.round(confidence * 100)
  const color =
    confidence >= 0.8
      ? 'bg-green-100 text-green-700'
      : confidence >= 0.5
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'
  return <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', color)}>{pct}%</span>
}

const matchTypeBadge = (matchType: string) => (
  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
    {matchType}
  </span>
)

const CreateReconciliationWizard = ({ onClose, onSuccess }: CreateReconciliationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardState, setWizardState] = useState<WizardState>({
    name: '',
    description: '',
    sourceFileId: null,
    targetFileId: null,
    ruleSetId: null,
  })

  // AI Analysis state
  const [rulesMode, setRulesMode] = useState<RulesStepMode>('choose')
  const [acceptedMappings, setAcceptedMappings] = useState<AcceptedMapping[]>([])
  const [acceptedRules, setAcceptedRules] = useState<AcceptedRule[]>([])
  const [aiExplanation, setAiExplanation] = useState<string>('')
  const [aiError, setAiError] = useState<string | null>(null)
  const [isCreatingRuleSet, setIsCreatingRuleSet] = useState(false)

  const { data: filesResponse, isLoading: filesLoading } = useFiles()
  const { data: ruleSetsResponse, isLoading: ruleSetsLoading } = useRuleSets()
  const createReconciliation = useCreateReconciliation()
  const suggestMappings = useSuggestMappings()
  const suggestRules = useSuggestRules()
  const createRuleSet = useCreateRuleSet()
  const addFieldMapping = useAddFieldMapping()
  const addMatchingRule = useAddMatchingRule()
  const uploadFile = useUploadFile()
  const [uploadError, setUploadError] = useState<string | null>(null)

  const files = filesResponse?.data || []
  const ruleSets = ruleSetsResponse?.data || []

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return wizardState.name.trim().length > 0
      case 1: {
        const file = files.find((f) => f.id === wizardState.sourceFileId)
        return wizardState.sourceFileId !== null && (!file || !file.missing)
      }
      case 2: {
        const file = files.find((f) => f.id === wizardState.targetFileId)
        return (
          wizardState.targetFileId !== null &&
          wizardState.targetFileId !== wizardState.sourceFileId &&
          (!file || !file.missing)
        )
      }
      case 3:
        return wizardState.ruleSetId !== null
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleCreate = () => {
    if (!wizardState.sourceFileId || !wizardState.targetFileId || !wizardState.ruleSetId) return
    createReconciliation.mutate(
      {
        name: wizardState.name,
        description: wizardState.description || undefined,
        sourceFileId: wizardState.sourceFileId,
        targetFileId: wizardState.targetFileId,
        ruleSetId: wizardState.ruleSetId,
      },
      {
        onSuccess: () => {
          onSuccess?.()
          onClose()
        },
      }
    )
  }

  const handleAnalyzeMappings = () => {
    if (!wizardState.sourceFileId || !wizardState.targetFileId) return
    setAiError(null)
    setRulesMode('analyzing-mappings')
    suggestMappings.mutate(
      { sourceFileId: wizardState.sourceFileId, targetFileId: wizardState.targetFileId },
      {
        onSuccess: (res) => {
          const data = res.data
          setAcceptedMappings((data?.mappings ?? []).map((m) => ({ ...m, accepted: true })))
          setAiExplanation(data?.explanation ?? '')
          setRulesMode('review-mappings')
        },
        onError: (err) => {
          setAiError(err instanceof Error ? err.message : 'AI analysis failed')
          setRulesMode('choose')
        },
      }
    )
  }

  const handleAnalyzeRules = () => {
    if (!wizardState.sourceFileId || !wizardState.targetFileId) return
    const acceptedOnly = acceptedMappings.filter((m) => m.accepted)
    setAiError(null)
    setRulesMode('analyzing-rules')
    suggestRules.mutate(
      { sourceFileId: wizardState.sourceFileId, targetFileId: wizardState.targetFileId, mappings: acceptedOnly },
      {
        onSuccess: (res) => {
          const data = res.data
          setAcceptedRules((data?.rules ?? []).map((r) => ({ ...r, accepted: true })))
          if (data?.explanation) setAiExplanation(data.explanation)
          setRulesMode('review-rules')
        },
        onError: (err) => {
          setAiError(err instanceof Error ? err.message : 'Rule suggestion failed')
          setRulesMode('review-mappings')
        },
      }
    )
  }

  const handleCreateRuleSetFromAi = async () => {
    setIsCreatingRuleSet(true)
    setAiError(null)
    try {
      const ruleSetRes = await createRuleSet.mutateAsync({
        name: `AI: ${wizardState.name}`,
        description: aiExplanation || 'AI-generated rule set',
        isAiGenerated: true,
      })
      const ruleSetId = ruleSetRes.data?.id
      if (!ruleSetId) throw new Error('Rule set creation failed')

      for (const m of acceptedMappings.filter((m) => m.accepted)) {
        await addFieldMapping.mutateAsync({
          ruleSetId,
          data: { sourceField: m.sourceField, targetField: m.targetField, isKey: m.isKey ?? false },
        })
      }

      for (const r of acceptedRules.filter((r) => r.accepted)) {
        await addMatchingRule.mutateAsync({
          ruleSetId,
          data: {
            name: r.name,
            sourceField: r.sourceField,
            targetField: r.targetField,
            matchType: r.matchType,
            fuzzyThreshold: r.fuzzyThreshold,
            tolerance: r.tolerance,
          },
        })
      }

      setWizardState((prev) => ({ ...prev, ruleSetId }))
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to create rule set')
    } finally {
      setIsCreatingRuleSet(false)
    }
  }

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

  const renderRulesStep = () => {
    if (rulesMode === 'choose') {
      return (
        <div className="space-y-4">
          {aiError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {aiError}
            </div>
          )}
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Let AI Analyze Files</span>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              AI will examine both files, suggest field mappings with confidence scores, and generate
              optimized matching rules automatically.
            </p>
            <Button onClick={handleAnalyzeMappings} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Analyze with AI
            </Button>
          </div>

          <div className="relative flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <p className="mb-3 text-sm text-muted-foreground">Use an existing rule set</p>
            {ruleSetsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : ruleSets.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No rule sets yet</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-auto">
                {ruleSets.map((rs) => (
                  <Card
                    key={rs.id}
                    className={cn(
                      'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                      wizardState.ruleSetId === rs.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => { setWizardState({ ...wizardState, ruleSetId: rs.id }); setRulesMode('manual') }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rs.name}</span>
                      </div>
                      {wizardState.ruleSetId === rs.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (rulesMode === 'analyzing-mappings' || rulesMode === 'analyzing-rules') {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">
            {rulesMode === 'analyzing-mappings' ? 'AI is analyzing file schemas…' : 'AI is generating matching rules…'}
          </p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </div>
      )
    }

    if (rulesMode === 'review-mappings') {
      const allAccepted = acceptedMappings.every((m) => m.accepted)
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Review AI-suggested field mappings</p>
            <button
              onClick={() => setAcceptedMappings((prev) => prev.map((m) => ({ ...m, accepted: !allAccepted })))}
              className="text-xs text-primary hover:underline"
            >
              {allAccepted ? 'Deselect all' : 'Accept all'}
            </button>
          </div>
          {aiExplanation && (
            <div className="flex gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {aiExplanation}
            </div>
          )}
          <div className="max-h-52 space-y-1.5 overflow-auto">
            {acceptedMappings.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 rounded-md border p-2 transition-colors cursor-pointer',
                  m.accepted ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30 opacity-50'
                )}
                onClick={() =>
                  setAcceptedMappings((prev) =>
                    prev.map((item, idx) => (idx === i ? { ...item, accepted: !item.accepted } : item))
                  )
                }
              >
                <div className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0',
                  m.accepted ? 'border-primary bg-primary' : 'border-border')}>
                  {m.accepted && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="flex-1 text-xs font-mono">
                  {m.sourceField} <span className="text-muted-foreground">→</span> {m.targetField}
                </span>
                {m.isKey && <Key className="h-3.5 w-3.5 text-amber-500" title="Key field" />}
                {confidenceBadge(m.confidence)}
              </div>
            ))}
          </div>
          <Button
            className="w-full gap-2"
            disabled={!acceptedMappings.some((m) => m.accepted)}
            onClick={handleAnalyzeRules}
          >
            <Sparkles className="h-4 w-4" />
            Let AI Suggest Rules
          </Button>
        </div>
      )
    }

    if (rulesMode === 'review-rules') {
      const allAccepted = acceptedRules.every((r) => r.accepted)
      const ruleSetCreated = wizardState.ruleSetId !== null
      return (
        <div className="space-y-3">
          {ruleSetCreated ? (
            <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
              <Check className="h-4 w-4 shrink-0" />
              Rule set created successfully — ready to proceed!
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Review AI-suggested matching rules</p>
                <button
                  onClick={() => setAcceptedRules((prev) => prev.map((r) => ({ ...r, accepted: !allAccepted })))}
                  className="text-xs text-primary hover:underline"
                >
                  {allAccepted ? 'Deselect all' : 'Accept all'}
                </button>
              </div>
              <div className="max-h-44 space-y-1.5 overflow-auto">
                {acceptedRules.map((r, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-2 transition-colors cursor-pointer',
                      r.accepted ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30 opacity-50'
                    )}
                    onClick={() =>
                      setAcceptedRules((prev) =>
                        prev.map((item, idx) => (idx === i ? { ...item, accepted: !item.accepted } : item))
                      )
                    }
                  >
                    <div className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0',
                      r.accepted ? 'border-primary bg-primary' : 'border-border')}>
                      {r.accepted && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="flex-1 text-xs font-mono truncate">
                      {r.sourceField} <span className="text-muted-foreground">→</span> {r.targetField}
                    </span>
                    {matchTypeBadge(r.matchType)}
                    {r.isKey && <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" title="Key field" />}
                  </div>
                ))}
              </div>
              {aiError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {aiError}
                </div>
              )}
              <Button
                className="w-full gap-2"
                disabled={!acceptedRules.some((r) => r.accepted) || isCreatingRuleSet}
                onClick={handleCreateRuleSetFromAi}
              >
                {isCreatingRuleSet ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Rule Set…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Rule Set &amp; Use It
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )
    }

    // manual mode — existing rule set selected
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Selected rule set:</p>
        {ruleSets
          .filter((rs) => rs.id === wizardState.ruleSetId)
          .map((rs) => (
            <Card key={rs.id} className="border-primary bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="font-medium">{rs.name}</span>
                <Check className="ml-auto h-4 w-4 text-primary" />
              </div>
            </Card>
          ))}
        <button
          onClick={() => { setRulesMode('choose'); setWizardState({ ...wizardState, ruleSetId: null }) }}
          className="text-xs text-primary hover:underline"
        >
          ← Choose a different option
        </button>
      </div>
    )
  }

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="recon-name" className="mb-1 block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="recon-name"
                placeholder="e.g., Monthly Bank Reconciliation"
                value={wizardState.name}
                onChange={(e) => setWizardState({ ...wizardState, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="recon-desc" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="recon-desc"
                placeholder="Optional description..."
                value={wizardState.description}
                onChange={(e) => setWizardState({ ...wizardState, description: e.target.value })}
                className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )

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

      case 3:
        return renderRulesStep()

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">New Reconciliation</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close wizard">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="border-b px-6 py-4">
          <WizardStepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="p-6">
          {createReconciliation.isError && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {createReconciliation.error instanceof Error
                ? createReconciliation.error.message
                : 'Failed to create reconciliation'}
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceed() || createReconciliation.isPending}
            >
              {createReconciliation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { CreateReconciliationWizard }
