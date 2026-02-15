import { useState } from 'react'
import { Plus, Trash2, ArrowRight, Sparkles, Key } from 'lucide-react'
import { Modal, Button, Input, Badge } from '@/components/ui'
import type { MatchType, AiSuggestedMapping, AiSuggestedRule } from '@/services/types'
import { useFiles, useSuggestMappings, useSuggestRules } from '@/services/hooks'

interface FieldMappingForm {
  sourceField: string
  targetField: string
  isKeyField: boolean
}

interface MatchingRuleForm {
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  threshold: number | null
}

interface CreateRuleSetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    fieldMappings: FieldMappingForm[]
    matchingRules: MatchingRuleForm[]
    isAiGenerated?: boolean
  }) => Promise<void>
}

type AiStep = 'idle' | 'analyzing-mappings' | 'review-mappings' | 'analyzing-rules' | 'review-rules'

export const CreateRuleSetModal = ({ isOpen, onClose, onSubmit }: CreateRuleSetModalProps) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Manual mode state
  const [fieldMappings, setFieldMappings] = useState<FieldMappingForm[]>([])
  const [matchingRules, setMatchingRules] = useState<MatchingRuleForm[]>([])
  const [newMapping, setNewMapping] = useState<FieldMappingForm>({
    sourceField: '',
    targetField: '',
    isKeyField: false,
  })
  const [newRule, setNewRule] = useState<MatchingRuleForm>({
    name: '',
    sourceField: '',
    targetField: '',
    matchType: 'EXACT',
    threshold: null,
  })

  // AI mode state
  const [aiStep, setAiStep] = useState<AiStep>('idle')
  const [sourceFileId, setSourceFileId] = useState<number | null>(null)
  const [targetFileId, setTargetFileId] = useState<number | null>(null)
  const [suggestedMappings, setSuggestedMappings] = useState<(AiSuggestedMapping & { accepted: boolean })[]>([])
  const [suggestedRules, setSuggestedRules] = useState<(AiSuggestedRule & { accepted: boolean })[]>([])
  const [aiError, setAiError] = useState<string | null>(null)

  const { data: filesResponse } = useFiles()
  const suggestMappings = useSuggestMappings()
  const suggestRulesHook = useSuggestRules()
  const files = filesResponse?.data || []

  const resetForm = () => {
    setName('')
    setDescription('')
    setFieldMappings([])
    setMatchingRules([])
    setNewMapping({ sourceField: '', targetField: '', isKeyField: false })
    setNewRule({ name: '', sourceField: '', targetField: '', matchType: 'EXACT', threshold: null })
    setMode('manual')
    setAiStep('idle')
    setSuggestedMappings([])
    setSuggestedRules([])
    setSourceFileId(null)
    setTargetFileId(null)
    setAiError(null)
  }

  // Manual handlers
  const handleAddMapping = () => {
    if (newMapping.sourceField && newMapping.targetField) {
      setFieldMappings([...fieldMappings, newMapping])
      setNewMapping({ sourceField: '', targetField: '', isKeyField: false })
    }
  }

  const handleRemoveMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index))
  }

  const handleAddRule = () => {
    if (newRule.name && newRule.sourceField && newRule.targetField) {
      setMatchingRules([...matchingRules, newRule])
      setNewRule({ name: '', sourceField: '', targetField: '', matchType: 'EXACT', threshold: null })
    }
  }

  const handleRemoveRule = (index: number) => {
    setMatchingRules(matchingRules.filter((_, i) => i !== index))
  }

  const handleManualSubmit = async () => {
    if (!name) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name, description, fieldMappings, matchingRules })
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to create rule set:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // AI handlers
  const handleAnalyzeMappings = async () => {
    if (!sourceFileId || !targetFileId) return
    setAiError(null)
    setAiStep('analyzing-mappings')
    try {
      const result = await suggestMappings.mutateAsync({ sourceFileId, targetFileId })
      const mappings = (result.data.mappings || []).map((m) => ({ ...m, accepted: true }))
      setSuggestedMappings(mappings)
      setAiStep('review-mappings')
    } catch {
      setAiError('Failed to analyze file mappings. Please try again.')
      setAiStep('idle')
    }
  }

  const handleAnalyzeRules = async () => {
    const acceptedMappings = suggestedMappings.filter((m) => m.accepted)
    if (!sourceFileId || !targetFileId || acceptedMappings.length === 0) return
    setAiError(null)
    setAiStep('analyzing-rules')
    try {
      const result = await suggestRulesHook.mutateAsync({
        sourceFileId,
        targetFileId,
        mappings: acceptedMappings,
      })
      const rules = (result.data.rules || []).map((r) => ({ ...r, accepted: true }))
      setSuggestedRules(rules)
      setAiStep('review-rules')
    } catch {
      setAiError('Failed to suggest matching rules. Please try again.')
      setAiStep('review-mappings')
    }
  }

  const handleAiSubmit = async () => {
    if (!name) return
    const acceptedMappings = suggestedMappings.filter((m) => m.accepted)
    const acceptedRules = suggestedRules.filter((r) => r.accepted)
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        isAiGenerated: true,
        fieldMappings: acceptedMappings.map((m) => ({
          sourceField: m.sourceField,
          targetField: m.targetField,
          isKeyField: m.isKey ?? false,
        })),
        matchingRules: acceptedRules.map((r) => ({
          name: r.name,
          sourceField: r.sourceField,
          targetField: r.targetField,
          matchType: r.matchType,
          threshold: r.fuzzyThreshold ?? r.tolerance ?? null,
        })),
      })
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to create AI rule set:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100)
    if (confidence >= 0.8)
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
          {pct}%
        </span>
      )
    if (confidence >= 0.5)
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          {pct}%
        </span>
      )
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
        {pct}%
      </span>
    )
  }

  const isReadyToAnalyze =
    sourceFileId !== null && targetFileId !== null && sourceFileId !== targetFileId

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Rule Set" size="xl">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="rule-name" className="block text-sm font-medium mb-1">
              Rule Set Name *
            </label>
            <Input
              id="rule-name"
              placeholder="e.g., Q1 2026 Reconciliation Rules"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="rule-description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              id="rule-description"
              placeholder="Brief description of this rule set"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => {
              setMode('manual')
              setAiStep('idle')
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'manual' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'ai' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Assisted
          </button>
        </div>

        {/* ── AI MODE ── */}
        {mode === 'ai' && (
          <div className="space-y-4">
            {/* Step 1: File selection + analyze */}
            {(aiStep === 'idle' || aiStep === 'analyzing-mappings') && (
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the source and target files. AI will analyze their columns and generate
                  optimal field mappings and matching rules.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Source File</label>
                    <select
                      value={sourceFileId ?? ''}
                      onChange={(e) =>
                        setSourceFileId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 rounded border bg-background text-sm"
                    >
                      <option value="">Select file...</option>
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.originalFilename}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Target File</label>
                    <select
                      value={targetFileId ?? ''}
                      onChange={(e) =>
                        setTargetFileId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 rounded border bg-background text-sm"
                    >
                      <option value="">Select file...</option>
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.originalFilename}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {aiError && <p className="text-sm text-destructive">{aiError}</p>}
                <Button
                  onClick={handleAnalyzeMappings}
                  disabled={!isReadyToAnalyze || aiStep === 'analyzing-mappings'}
                  className="w-full"
                >
                  {aiStep === 'analyzing-mappings' ? (
                    <>
                      <span className="mr-2 animate-spin">⟳</span>
                      Analyzing Files...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Let AI Analyze Files
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Mapping review */}
            {(aiStep === 'review-mappings' || aiStep === 'analyzing-rules') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Field Mapping Suggestions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setSuggestedMappings(suggestedMappings.map((m) => ({ ...m, accepted: true })))
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() =>
                        setSuggestedMappings(
                          suggestedMappings.map((m) => ({ ...m, accepted: false }))
                        )
                      }
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Reject All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {suggestedMappings.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        m.accepted ? 'bg-primary/5 border-primary/20' : 'opacity-50 border-dashed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={m.accepted}
                        onChange={(e) => {
                          const updated = [...suggestedMappings]
                          updated[i] = { ...updated[i], accepted: e.target.checked }
                          setSuggestedMappings(updated)
                        }}
                        className="rounded"
                      />
                      <div className="flex flex-1 items-center gap-2 text-sm">
                        <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-xs">
                          {m.sourceField}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-xs">
                          {m.targetField}
                        </span>
                        {m.isKey && (
                          <Key className="h-3 w-3 text-amber-500 shrink-0" title="Key field" />
                        )}
                      </div>
                      {confidenceBadge(m.confidence)}
                    </div>
                  ))}
                </div>
                {aiError && <p className="text-sm text-destructive">{aiError}</p>}
                <Button
                  onClick={handleAnalyzeRules}
                  disabled={
                    suggestedMappings.filter((m) => m.accepted).length === 0 ||
                    aiStep === 'analyzing-rules'
                  }
                  variant="outline"
                  className="w-full"
                >
                  {aiStep === 'analyzing-rules' ? (
                    <>
                      <span className="mr-2 animate-spin">⟳</span>
                      Generating Rules...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Suggest Matching Rules
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Rule review */}
            {aiStep === 'review-rules' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Matching Rule Suggestions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setSuggestedRules(suggestedRules.map((r) => ({ ...r, accepted: true })))
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() =>
                        setSuggestedRules(suggestedRules.map((r) => ({ ...r, accepted: false })))
                      }
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Reject All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {suggestedRules.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        r.accepted ? 'bg-primary/5 border-primary/20' : 'opacity-50 border-dashed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={r.accepted}
                        onChange={(e) => {
                          const updated = [...suggestedRules]
                          updated[i] = { ...updated[i], accepted: e.target.checked }
                          setSuggestedRules(updated)
                        }}
                        className="rounded"
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.sourceField} → {r.targetField}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {r.matchType}
                      </Badge>
                      {r.isKey && (
                        <Key className="h-3 w-3 text-amber-500 shrink-0" title="Key field" />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setAiStep('review-mappings')}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  ← Back to mappings
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MANUAL MODE ── */}
        {mode === 'manual' && (
          <>
            {/* Field Mappings */}
            <div className="space-y-3">
              <h3 className="font-semibold">Field Mappings</h3>
              {fieldMappings.length > 0 && (
                <div className="space-y-2">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="px-3 py-1 bg-secondary/50 rounded text-sm">
                          {mapping.sourceField}
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="px-3 py-1 bg-secondary/50 rounded text-sm">
                          {mapping.targetField}
                        </span>
                        {mapping.isKeyField && (
                          <Badge variant="outline" className="text-xs">
                            Key
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMapping(index)}
                        aria-label={`Remove mapping ${mapping.sourceField} to ${mapping.targetField}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label htmlFor="source-field" className="block text-xs mb-1">
                    Source Field
                  </label>
                  <Input
                    id="source-field"
                    placeholder="Source field name"
                    value={newMapping.sourceField}
                    onChange={(e) => setNewMapping({ ...newMapping, sourceField: e.target.value })}
                  />
                </div>
                <ArrowRight className="h-4 w-4 mb-2" />
                <div className="flex-1">
                  <label htmlFor="target-field" className="block text-xs mb-1">
                    Target Field
                  </label>
                  <Input
                    id="target-field"
                    placeholder="Target field name"
                    value={newMapping.targetField}
                    onChange={(e) => setNewMapping({ ...newMapping, targetField: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 mb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newMapping.isKeyField}
                    onChange={(e) =>
                      setNewMapping({ ...newMapping, isKeyField: e.target.checked })
                    }
                    className="rounded"
                  />
                  Key
                </label>
                <Button
                  size="sm"
                  onClick={handleAddMapping}
                  className="mb-0.5"
                  aria-label="Add field mapping"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Matching Rules */}
            <div className="space-y-3">
              <h3 className="font-semibold">Matching Rules</h3>
              {matchingRules.length > 0 && (
                <div className="space-y-2">
                  {matchingRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {rule.sourceField} → {rule.targetField}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{rule.matchType}</Badge>
                        {rule.threshold && (
                          <Badge variant="outline">{rule.threshold}%</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(index)}
                          aria-label={`Remove rule ${rule.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2 p-3 border rounded-lg bg-secondary/10">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="rule-name-input" className="block text-xs mb-1">
                      Rule Name
                    </label>
                    <Input
                      id="rule-name-input"
                      placeholder="e.g., Amount Exact Match"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="match-type" className="block text-xs mb-1">
                      Match Type
                    </label>
                    <select
                      id="match-type"
                      value={newRule.matchType}
                      onChange={(e) =>
                        setNewRule({ ...newRule, matchType: e.target.value as MatchType })
                      }
                      className="w-full px-3 py-2 rounded border bg-background text-sm"
                    >
                      <option value="EXACT">Exact</option>
                      <option value="FUZZY">Fuzzy</option>
                      <option value="RANGE">Range</option>
                      <option value="CONTAINS">Contains</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rule-source-field" className="block text-xs mb-1">
                      Source Field
                    </label>
                    <Input
                      id="rule-source-field"
                      placeholder="Source field"
                      value={newRule.sourceField}
                      onChange={(e) => setNewRule({ ...newRule, sourceField: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="rule-target-field" className="block text-xs mb-1">
                      Target Field
                    </label>
                    <Input
                      id="rule-target-field"
                      placeholder="Target field"
                      value={newRule.targetField}
                      onChange={(e) => setNewRule({ ...newRule, targetField: e.target.value })}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={handleAddRule} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Matching Rule
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onClose()
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {mode === 'manual' ? (
            <Button onClick={handleManualSubmit} disabled={isSubmitting || !name}>
              {isSubmitting ? 'Creating...' : 'Create Rule Set'}
            </Button>
          ) : (
            <Button
              onClick={handleAiSubmit}
              disabled={isSubmitting || !name || aiStep !== 'review-rules'}
            >
              {isSubmitting ? 'Creating...' : 'Create AI Rule Set'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
