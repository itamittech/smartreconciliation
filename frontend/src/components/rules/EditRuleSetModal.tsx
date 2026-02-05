import { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { Modal, Button, Input, Badge } from '@/components/ui'
import type { RuleSet, MatchType } from '@/services/types'

interface EditRuleSetModalProps {
  isOpen: boolean
  onClose: () => void
  ruleSet: RuleSet | null
  onSubmit: (data: {
    name: string
    description: string
  }) => Promise<void>
}

export const EditRuleSetModal = ({ isOpen, onClose, ruleSet, onSubmit }: EditRuleSetModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when ruleSet changes
  useEffect(() => {
    if (ruleSet) {
      setName(ruleSet.name)
      setDescription(ruleSet.description || '')
    }
  }, [ruleSet])

  const handleSubmit = async () => {
    if (!name) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update rule set:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  if (!ruleSet) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Rule Set" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-rule-name" className="block text-sm font-medium mb-1">
              Rule Set Name *
            </label>
            <Input
              id="edit-rule-name"
              placeholder="e.g., Q1 2026 Reconciliation Rules"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-rule-description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              id="edit-rule-description"
              placeholder="Brief description of this rule set"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Show current mappings count (read-only for now) */}
        <div className="p-4 bg-secondary/10 rounded-lg">
          <div className="text-sm text-muted-foreground">
            <p>Field Mappings: {ruleSet.fieldMappings?.length || 0}</p>
            <p>Matching Rules: {ruleSet.matchingRules?.length || 0}</p>
            <p className="mt-2 text-xs italic">
              Note: To modify mappings and rules, edit them from the details view
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
