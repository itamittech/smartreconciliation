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
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useRuleSets, useDeleteRuleSet, useCreateRuleSet, useAddFieldMapping, useAddMatchingRule, useDuplicateRuleSet, useUpdateRuleSet, useTestRuleSet } from '@/services/hooks'
import type { RuleSet as ApiRuleSet } from '@/services/types'
import { CreateRuleSetModal } from '@/components/rules/CreateRuleSetModal'
import { EditRuleSetModal } from '@/components/rules/EditRuleSetModal'
import { TestRuleSetModal } from '@/components/rules/TestRuleSetModal'

const RulesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

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

  const handleCreateRule = () => {
    setIsCreateModalOpen(true)
  }

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
  }) => {
    // Create the rule set first
    const response = await createRuleSet.mutateAsync({
      name: data.name,
      description: data.description,
    })
    const ruleSet = response.data

    // Add field mappings
    for (const mapping of data.fieldMappings) {
      await addFieldMapping.mutateAsync({
        ruleSetId: ruleSet.id,
        data: {
          sourceField: mapping.sourceField,
          targetField: mapping.targetField,
          isKeyField: mapping.isKeyField,
        },
      })
    }

    // Add matching rules
    for (const rule of data.matchingRules) {
      await addMatchingRule.mutateAsync({
        ruleSetId: ruleSet.id,
        data: {
          name: rule.name,
          sourceField: rule.sourceField,
          targetField: rule.targetField,
          matchType: rule.matchType as 'EXACT' | 'FUZZY' | 'RANGE' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH',
          threshold: rule.threshold ?? undefined,
        },
      })
    }

    // Select the newly created rule
    setSelectedRuleId(ruleSet.id ?? null)
  }

  const handleSelectRule = (rule: ApiRuleSet) => {
    setSelectedRuleId(rule.id === selectedRuleId ? null : rule.id)
  }

  const handleDeleteRule = (id: number) => {
    if (confirm('Are you sure you want to delete this rule set?')) {
      deleteRuleSet.mutate(id)
      if (selectedRuleId === id) {
        setSelectedRuleId(null)
      }
    }
  }

  const handleDuplicateRule = async (id: number) => {
    try {
      const result = await duplicateRuleSet.mutateAsync(id)
      setSelectedRuleId(result.data.id ?? null)
    } catch (error) {
      console.error('Failed to duplicate rule set:', error)
    }
  }

  const handleEditRule = () => {
    setIsEditModalOpen(true)
  }

  const handleEditRuleSubmit = async (data: { name: string; description: string }) => {
    if (!selectedRuleId) return
    await updateRuleSet.mutateAsync({
      id: selectedRuleId,
      data: {
        name: data.name,
        description: data.description,
      },
    })
  }

  const handleTestRule = () => {
    setIsTestModalOpen(true)
  }

  const handleTestRuleSubmit = async (data: { sampleSize: number }) => {
    if (!selectedRuleId) throw new Error('No rule selected')
    const result = await testRuleSet.mutateAsync({
      id: selectedRuleId,
      data,
    })
    return result.data
  }

  const handleKeyDown = (e: React.KeyboardEvent, rule: ApiRuleSet) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelectRule(rule)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading rules...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-semibold text-lg">Failed to load rules</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unable to connect to backend API'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <CreateRuleSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRuleSubmit}
      />
      <EditRuleSetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ruleSet={selectedRule}
        onSubmit={handleEditRuleSubmit}
      />
      <TestRuleSetModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        ruleSet={selectedRule}
        onTest={handleTestRuleSubmit}
      />
      <div className="flex h-full">
      {/* Rule List */}
      <div className="flex w-96 flex-col border-r">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Rule Library</h2>
            <Button size="sm" onClick={handleCreateRule}>
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
              <GitBranch className="mx-auto h-8 w-8 text-muted-foreground" />
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
                  'mb-2 cursor-pointer rounded-lg border p-3 transition-colors',
                  selectedRuleId === rule.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
                aria-selected={selectedRuleId === rule.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  {rule.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                {rule.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {rule.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{rule.fieldMappings?.length || 0} mappings</span>
                  <span>{rule.matchingRules?.length || 0} rules</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rule Details / Builder */}
      <div className="flex-1 overflow-auto">
        {selectedRule ? (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{selectedRule.name}</h2>
                  {selectedRule.isActive && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
                {selectedRule.description && (
                  <p className="mt-1 text-muted-foreground">
                    {selectedRule.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleTestRule}>
                  <Play className="mr-1 h-4 w-4" />
                  Test Rule
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditRule}>
                  <Edit2 className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateRule(selectedRule.id)}
                  disabled={duplicateRuleSet.isPending}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRule(selectedRule.id)}
                  disabled={deleteRuleSet.isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Field Mappings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Field Mappings</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRule.fieldMappings && selectedRule.fieldMappings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRule.fieldMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center gap-4 rounded-md border p-3"
                      >
                        <div className="flex-1 rounded bg-secondary/50 px-3 py-2 text-sm">
                          {mapping.sourceField}
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <div className="flex-1 rounded bg-secondary/50 px-3 py-2 text-sm">
                          {mapping.targetField}
                        </div>
                        {mapping.isKeyField && (
                          <Badge variant="outline" className="text-xs">Key</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No field mappings defined</p>
                )}
              </CardContent>
            </Card>

            {/* Matching Rules */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Matching Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRule.matchingRules && selectedRule.matchingRules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRule.matchingRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium">{rule.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {rule.sourceField} → {rule.targetField}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rule.matchType}</Badge>
                          {rule.threshold && (
                            <Badge variant="outline">{rule.threshold}%</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No matching rules defined</p>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {selectedRule.fieldMappings?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Field Mappings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {selectedRule.matchingRules?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Matching Rules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {selectedRule.fieldMappings?.filter(m => m.isKeyField).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Key Fields</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <GitBranch className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">Select a Rule</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a rule from the library to view or edit its configuration
              </p>
              <Button className="mt-4" onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Rule
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
