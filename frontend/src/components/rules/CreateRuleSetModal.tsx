import { useState } from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { Modal, Button, Input, Badge } from '@/components/ui'
import type { MatchType } from '@/services/types'

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
  }) => Promise<void>
}

export const CreateRuleSetModal = ({ isOpen, onClose, onSubmit }: CreateRuleSetModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fieldMappings, setFieldMappings] = useState<FieldMappingForm[]>([])
  const [matchingRules, setMatchingRules] = useState<MatchingRuleForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Field mapping form
  const [newMapping, setNewMapping] = useState<FieldMappingForm>({
    sourceField: '',
    targetField: '',
    isKeyField: false,
  })

  // Matching rule form
  const [newRule, setNewRule] = useState<MatchingRuleForm>({
    name: '',
    sourceField: '',
    targetField: '',
    matchType: 'EXACT',
    threshold: null,
  })

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
      setNewRule({
        name: '',
        sourceField: '',
        targetField: '',
        matchType: 'EXACT',
        threshold: null,
      })
    }
  }

  const handleRemoveRule = (index: number) => {
    setMatchingRules(matchingRules.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!name) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        fieldMappings,
        matchingRules,
      })
      // Reset form
      setName('')
      setDescription('')
      setFieldMappings([])
      setMatchingRules([])
      onClose()
    } catch (error) {
      console.error('Failed to create rule set:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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

        {/* Field Mappings */}
        <div className="space-y-3">
          <h3 className="font-semibold">Field Mappings</h3>

          {/* Existing mappings */}
          {fieldMappings.length > 0 && (
            <div className="space-y-2">
              {fieldMappings.map((mapping, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
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

          {/* Add mapping form */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="source-field" className="block text-xs mb-1">
                Source Field
              </label>
              <Input
                id="source-field"
                placeholder="Source field name"
                value={newMapping.sourceField}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, sourceField: e.target.value })
                }
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
                onChange={(e) =>
                  setNewMapping({ ...newMapping, targetField: e.target.value })
                }
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
            <Button size="sm" onClick={handleAddMapping} className="mb-0.5" aria-label="Add field mapping">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Matching Rules */}
        <div className="space-y-3">
          <h3 className="font-semibold">Matching Rules</h3>

          {/* Existing rules */}
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

          {/* Add rule form */}
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
                  onChange={(e) =>
                    setNewRule({ ...newRule, sourceField: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewRule({ ...newRule, targetField: e.target.value })
                  }
                />
              </div>
            </div>
            <Button size="sm" onClick={handleAddRule} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Matching Rule
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting ? 'Creating...' : 'Create Rule Set'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
