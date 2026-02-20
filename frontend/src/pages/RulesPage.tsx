import { useState } from 'react'
import {
  Plus,
  Search,
  GitBranch,
  ArrowRight,
  Edit2,
  Copy,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Play,
  Sparkles,
  X,
  Save,
  ChevronDown,
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  useRuleSets,
  useDeleteRuleSet,
  useCreateRuleSet,
  useAddFieldMapping,
  useAddMatchingRule,
  useDuplicateRuleSet,
  useUpdateRuleSet,
  useTestRuleSet,
} from '@/services/hooks'
import type { RuleSet as ApiRuleSet, MatchType } from '@/services/types'
import { CreateRuleSetModal } from '@/components/rules/CreateRuleSetModal'
import { TestRuleSetModal } from '@/components/rules/TestRuleSetModal'

// ── Editable row types ──────────────────────────────────────────────
interface EditableMapping {
  _key: string
  sourceField: string
  targetField: string
  isKeyField: boolean
}

interface EditableRule {
  _key: string
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  threshold: number | null
}

const MATCH_TYPES: MatchType[] = ['EXACT', 'FUZZY', 'RANGE', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH']

let _keyCounter = 0
const nextKey = () => `k${++_keyCounter}`

// ── Small helper components ──────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{children}</p>
)

const RulesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  // ── Edit mode state ──
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editMappings, setEditMappings] = useState<EditableMapping[]>([])
  const [editRules, setEditRules] = useState<EditableRule[]>([])

  const { data: ruleSetsResponse, isLoading, isError, error } = useRuleSets()
  const deleteRuleSet = useDeleteRuleSet()
  const duplicateRuleSet = useDuplicateRuleSet()
  const updateRuleSet = useUpdateRuleSet()
  const createRuleSet = useCreateRuleSet()
  const addFieldMapping = useAddFieldMapping()
  const addMatchingRule = useAddMatchingRule()
  const testRuleSet = useTestRuleSet()

  const ruleSets = ruleSetsResponse?.data || []
  const selectedRule = ruleSets.find(r => r.id === selectedRuleId) || null

  const filteredRules = ruleSets.filter((rule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Handlers ────────────────────────────────────────────────────────

  const handleCreateRuleSubmit = async (data: {
    name: string
    description: string
    fieldMappings: Array<{ sourceField: string; targetField: string; isKeyField: boolean }>
    matchingRules: Array<{
      name: string
      sourceField: string
      targetField: string
      matchType: string
      threshold: number | null
    }>
    isAiGenerated?: boolean
  }) => {
    const response = await createRuleSet.mutateAsync({
      name: data.name,
      description: data.description,
      isAiGenerated: data.isAiGenerated,
    })
    const ruleSet = response.data
    for (const mapping of data.fieldMappings) {
      await addFieldMapping.mutateAsync({
        ruleSetId: ruleSet.id,
        data: { sourceField: mapping.sourceField, targetField: mapping.targetField, isKey: mapping.isKeyField },
      })
    }
    for (const rule of data.matchingRules) {
      await addMatchingRule.mutateAsync({
        ruleSetId: ruleSet.id,
        data: {
          name: rule.name,
          sourceField: rule.sourceField,
          targetField: rule.targetField,
          matchType: rule.matchType as MatchType,
          fuzzyThreshold: rule.matchType === 'FUZZY' ? (rule.threshold ?? undefined) : undefined,
          tolerance: rule.matchType === 'RANGE' ? (rule.threshold ?? undefined) : undefined,
        },
      })
    }
    setSelectedRuleId(ruleSet.id ?? null)
  }

  const handleSelectRule = (rule: ApiRuleSet) => {
    if (isEditing) return          // prevent switching while editing
    setSelectedRuleId(rule.id === selectedRuleId ? null : rule.id)
  }

  const handleDeleteRule = (id: number) => {
    if (confirm('Are you sure you want to delete this rule set?')) {
      deleteRuleSet.mutate(id)
      if (selectedRuleId === id) setSelectedRuleId(null)
    }
  }

  const handleDuplicateRule = async (id: number) => {
    try {
      const result = await duplicateRuleSet.mutateAsync(id)
      setSelectedRuleId(result.data.id ?? null)
    } catch (err) {
      console.error('Failed to duplicate rule set:', err)
    }
  }

  // ── Edit mode ───────────────────────────────────────────────────────

  const enterEditMode = () => {
    if (!selectedRule) return
    setEditName(selectedRule.name)
    setEditDescription(selectedRule.description || '')
    setEditMappings(
      (selectedRule.fieldMappings ?? []).map(m => ({
        _key: nextKey(),
        sourceField: m.sourceField,
        targetField: m.targetField,
        isKeyField: m.isKeyField,
      }))
    )
    setEditRules(
      (selectedRule.matchingRules ?? []).map(r => ({
        _key: nextKey(),
        name: r.name,
        sourceField: r.sourceField,
        targetField: r.targetField,
        matchType: r.matchType,
        threshold: r.threshold,
      }))
    )
    setIsEditing(true)
  }

  const cancelEdit = () => setIsEditing(false)

  const handleSaveEdit = async () => {
    if (!selectedRuleId || !editName.trim()) return
    await updateRuleSet.mutateAsync({
      id: selectedRuleId,
      data: {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        fieldMappings: editMappings
          .filter(m => m.sourceField.trim() && m.targetField.trim())
          .map(m => ({
            sourceField: m.sourceField.trim(),
            targetField: m.targetField.trim(),
            isKey: m.isKeyField,
          })),
        matchingRules: editRules
          .filter(r => r.name.trim() && r.sourceField.trim() && r.targetField.trim())
          .map(r => ({
            name: r.name.trim(),
            sourceField: r.sourceField.trim(),
            targetField: r.targetField.trim(),
            matchType: r.matchType,
            fuzzyThreshold: r.matchType === 'FUZZY' ? (r.threshold ?? undefined) : undefined,
            tolerance: r.matchType === 'RANGE' ? (r.threshold ?? undefined) : undefined,
          })),
      },
    })
    setIsEditing(false)
  }

  // Mapping row helpers
  const addMapping = () =>
    setEditMappings(prev => [...prev, { _key: nextKey(), sourceField: '', targetField: '', isKeyField: false }])

  const removeMapping = (key: string) =>
    setEditMappings(prev => prev.filter(m => m._key !== key))

  const updateMapping = (key: string, patch: Partial<EditableMapping>) =>
    setEditMappings(prev => prev.map(m => (m._key === key ? { ...m, ...patch } : m)))

  // Rule row helpers
  const addRule = () =>
    setEditRules(prev => [
      ...prev,
      { _key: nextKey(), name: '', sourceField: '', targetField: '', matchType: 'EXACT', threshold: null },
    ])

  const removeRule = (key: string) =>
    setEditRules(prev => prev.filter(r => r._key !== key))

  const updateRule = (key: string, patch: Partial<EditableRule>) =>
    setEditRules(prev => prev.map(r => (r._key === key ? { ...r, ...patch } : r)))

  const handleTestRuleSubmit = async (data: { sampleSize: number }) => {
    if (!selectedRuleId) throw new Error('No rule selected')
    const result = await testRuleSet.mutateAsync({ id: selectedRuleId, data })
    return result.data
  }

  const handleKeyDown = (e: React.KeyboardEvent, rule: ApiRuleSet) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelectRule(rule)
    }
  }

  // ── Loading / Error states ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-neutral-500">Loading rules...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center bg-white border border-neutral-200 shadow-md p-8 rounded-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-error-500" />
          <div>
            <p className="font-semibold text-lg text-neutral-900">Failed to load rules</p>
            <p className="text-neutral-500 text-sm mt-1">
              {error instanceof Error ? error.message : 'Unable to connect to backend API'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <>
      <CreateRuleSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRuleSubmit}
      />
      <TestRuleSetModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        ruleSet={selectedRule}
        onTest={handleTestRuleSubmit}
      />

      <div className="flex h-full">
        {/* ── Rule List sidebar ─────────────────────────────────────── */}
        <div className="flex w-80 flex-col border-r border-border bg-muted/30">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Rule Library</h2>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search rules"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {filteredRules.length === 0 ? (
              <div className="py-8 text-center">
                <GitBranch className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {ruleSets.length === 0 ? 'No rules yet' : 'No matching rules'}
                </p>
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRule(rule)}
                  onKeyDown={(e) => handleKeyDown(e, rule)}
                  className={cn(
                    'mb-1.5 cursor-pointer rounded-lg border p-3 transition-colors',
                    selectedRuleId === rule.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-card hover:border-border hover:bg-muted/50',
                    isEditing && selectedRuleId !== rule.id && 'opacity-40 pointer-events-none'
                  )}
                  aria-selected={selectedRuleId === rule.id}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch className={cn('h-4 w-4 shrink-0', selectedRuleId === rule.id ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="font-medium text-sm text-foreground truncate">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {rule.isAiGenerated && (
                        <Badge variant="outline" className="text-[10px] h-4.5 flex items-center gap-1 border-primary/30 text-primary uppercase tracking-tighter">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  {rule.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1 pl-6">{rule.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/60 pl-6 font-medium">
                    <span>{rule.fieldMappings?.length || 0} mappings</span>
                    <span>·</span>
                    <span>{rule.matchingRules?.length || 0} rules</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Detail / Builder panel ───────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-background">
          {selectedRule ? (
            <div className="p-6 max-w-4xl">

              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xl font-semibold h-11 border-primary/30 focus:border-primary"
                        placeholder="Rule set name"
                        aria-label="Rule set name"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        aria-label="Description"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-semibold text-foreground">{selectedRule.name}</h2>
                        {selectedRule.isAiGenerated && (
                          <Badge variant="outline" className="flex items-center gap-1 border-primary/30 text-primary">
                            <Sparkles className="h-3 w-3" />
                            AI-Generated
                          </Badge>
                        )}
                        {selectedRule.isActive && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                      {selectedRule.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{selectedRule.description}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={updateRuleSet.isPending}>
                        <X className="mr-1.5 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={updateRuleSet.isPending || !editName.trim()}
                      >
                        {updateRuleSet.isPending ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => setIsTestModalOpen(true)}>
                        <Play className="mr-1.5 h-4 w-4" />
                        Test Rule
                      </Button>
                      <Button variant="secondary" size="sm" onClick={enterEditMode}>
                        <Edit2 className="mr-1.5 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateRule(selectedRule.id)}
                        disabled={duplicateRuleSet.isPending}
                      >
                        <Copy className="mr-1.5 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRule(selectedRule.id)}
                        disabled={deleteRuleSet.isPending}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Field Mappings ────────────────────────────────── */}
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Field Mappings
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({isEditing ? editMappings.length : selectedRule.fieldMappings?.length || 0})
                      </span>
                    </CardTitle>
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={addMapping}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Row
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      {/* Column headers */}
                      <div className="grid grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-2 px-1">
                        <SectionLabel>Source Field</SectionLabel>
                        <span />
                        <SectionLabel>Target Field</SectionLabel>
                        <SectionLabel>Key</SectionLabel>
                        <span className="w-8" />
                      </div>
                      {editMappings.length === 0 ? (
                        <p className="py-3 text-center text-sm text-muted-foreground">
                          No mappings yet — click Add Row to begin.
                        </p>
                      ) : (
                        editMappings.map((m) => (
                          <div key={m._key} className="grid grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                            <Input
                              value={m.sourceField}
                              onChange={(e) => updateMapping(m._key, { sourceField: e.target.value })}
                              placeholder="source_field"
                              className="h-8 text-sm font-mono bg-card"
                              aria-label="Source field"
                            />
                            <ArrowRight className="h-4 w-4 text-primary/40 shrink-0" />
                            <Input
                              value={m.targetField}
                              onChange={(e) => updateMapping(m._key, { targetField: e.target.value })}
                              placeholder="target_field"
                              className="h-8 text-sm font-mono bg-card"
                              aria-label="Target field"
                            />
                            <button
                              type="button"
                              onClick={() => updateMapping(m._key, { isKeyField: !m.isKeyField })}
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                                m.isKeyField
                                  ? 'border-primary/40 bg-primary/10 text-primary'
                                  : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
                              )}
                              aria-label="Toggle key field"
                              title="Mark as key field"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMapping(m._key)}
                              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              aria-label="Remove mapping"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {!selectedRule.fieldMappings || selectedRule.fieldMappings.length === 0 ? (
                        <p className="py-3 text-sm text-muted-foreground">
                          No field mappings defined. Click Edit to add some.
                        </p>
                      ) : (
                        selectedRule.fieldMappings.map((mapping) => (
                          <div
                            key={mapping.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5"
                          >
                            <span className="flex-1 rounded bg-card border border-border px-3 py-1.5 text-sm font-mono text-foreground">
                              {mapping.sourceField}
                            </span>
                            <ArrowRight className="h-4 w-4 text-primary/40 shrink-0" />
                            <span className="flex-1 rounded bg-card border border-border px-3 py-1.5 text-sm font-mono text-foreground">
                              {mapping.targetField}
                            </span>
                            {mapping.isKeyField && (
                              <Badge variant="outline" className="text-xs border-primary/20 text-primary shrink-0">
                                Key
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Matching Rules ────────────────────────────────── */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Matching Rules
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({isEditing ? editRules.length : selectedRule.matchingRules?.length || 0})
                      </span>
                    </CardTitle>
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={addRule}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Rule
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {editRules.length === 0 ? (
                        <p className="py-3 text-center text-sm text-muted-foreground">
                          No rules yet — click Add Rule to begin.
                        </p>
                      ) : (
                        editRules.map((r) => (
                          <div key={r._key} className="rounded-md border border-border bg-muted/40 p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={r.name}
                                onChange={(e) => updateRule(r._key, { name: e.target.value })}
                                placeholder="Rule name"
                                className="h-8 text-sm font-medium bg-card flex-1"
                                aria-label="Rule name"
                              />
                              <button
                                type="button"
                                onClick={() => removeRule(r._key)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                aria-label="Remove rule"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                              <Input
                                value={r.sourceField}
                                onChange={(e) => updateRule(r._key, { sourceField: e.target.value })}
                                placeholder="source_field"
                                className="h-8 text-sm font-mono bg-card"
                                aria-label="Source field"
                              />
                              <ArrowRight className="h-4 w-4 text-primary/40 shrink-0" />
                              <Input
                                value={r.targetField}
                                onChange={(e) => updateRule(r._key, { targetField: e.target.value })}
                                placeholder="target_field"
                                className="h-8 text-sm font-mono bg-card"
                                aria-label="Target field"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <select
                                  value={r.matchType}
                                  onChange={(e) => updateRule(r._key, { matchType: e.target.value as MatchType, threshold: null })}
                                  className="w-full appearance-none rounded-md border border-border bg-card px-3 py-1.5 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                  aria-label="Match type"
                                >
                                  {MATCH_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                              {(r.matchType === 'FUZZY' || r.matchType === 'RANGE') && (
                                <div className="flex items-center gap-1.5">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={r.matchType === 'FUZZY' ? 100 : undefined}
                                    step={r.matchType === 'FUZZY' ? 1 : 0.01}
                                    value={r.threshold ?? ''}
                                    onChange={(e) => updateRule(r._key, { threshold: e.target.value ? Number(e.target.value) : null })}
                                    placeholder={r.matchType === 'FUZZY' ? '80' : '0.01'}
                                    className="h-8 w-24 text-sm bg-card"
                                    aria-label="Threshold"
                                  />
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {r.matchType === 'FUZZY' ? '%' : 'tolerance'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {!selectedRule.matchingRules || selectedRule.matchingRules.length === 0 ? (
                        <p className="py-3 text-sm text-muted-foreground">
                          No matching rules defined. Click Edit to add some.
                        </p>
                      ) : (
                        selectedRule.matchingRules.map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{rule.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {rule.sourceField} → {rule.targetField}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs font-mono">
                                {rule.matchType}
                              </Badge>
                              {rule.threshold != null && (
                                <Badge variant="outline" className="text-xs">
                                  {rule.matchType === 'FUZZY' ? `${rule.threshold}%` : `±${rule.threshold}`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Summary stats ─────────────────────────────────── */}
              {!isEditing && (
                <Card className="mt-4">
                  <CardContent className="pt-4 pb-4">
                    <div className="grid gap-4 grid-cols-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {selectedRule.fieldMappings?.length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Field Mappings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {selectedRule.matchingRules?.length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Matching Rules</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {selectedRule.fieldMappings?.filter(m => m.isKeyField).length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Key Fields</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <GitBranch className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">Select a Rule Set</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a rule set from the library to view or edit its configuration
                </p>
                <Button className="mt-5" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Rule Set
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export { RulesPage }
