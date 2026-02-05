import { useState } from 'react'
import { Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Modal, Button, Badge } from '@/components/ui'
import type { RuleSet } from '@/services/types'

interface TestRuleSetModalProps {
  isOpen: boolean
  onClose: () => void
  ruleSet: RuleSet | null
  onTest: (data: { sampleSize: number }) => Promise<any>
}

export const TestRuleSetModal = ({ isOpen, onClose, ruleSet, onTest }: TestRuleSetModalProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunTest = async () => {
    if (!ruleSet) return

    setIsRunning(true)
    setError(null)
    try {
      const results = await onTest({ sampleSize: 100 })
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleClose = () => {
    setTestResults(null)
    setError(null)
    onClose()
  }

  if (!ruleSet) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Test Rule Set" size="lg">
      <div className="space-y-6">
        {/* Rule Summary */}
        <div className="p-4 bg-secondary/10 rounded-lg">
          <h3 className="font-medium mb-2">{ruleSet.name}</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Field Mappings: {ruleSet.fieldMappings?.length || 0}</p>
            <p>Matching Rules: {ruleSet.matchingRules?.length || 0}</p>
          </div>
        </div>

        {/* Test Configuration */}
        {!testResults && !error && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will validate the rule set configuration and run a test preview.
            </p>
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4" role="region" aria-label="Test results">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Test Passed</span>
              </div>
            </div>

            {/* Field Mappings Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Field Mappings Test</h4>
              <div className="space-y-2">
                {testResults.fieldMappings?.map((mapping: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                    <div className="text-sm">
                      {mapping.sourceField} → {mapping.targetField}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {mapping.success ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Rules Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Matching Rules Test</h4>
              <div className="space-y-2">
                {testResults.matchingRules?.map((rule: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                    <div className="text-sm">{rule.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {rule.matchType}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Statistics */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Overall Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{testResults.stats?.validMappings || 0}</p>
                  <p className="text-xs text-muted-foreground">Valid Mappings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{testResults.stats?.validRules || 0}</p>
                  <p className="text-xs text-muted-foreground">Valid Rules</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Test Failed</span>
            </div>
            <p className="text-sm mt-2 text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {!testResults && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isRunning}>
                Cancel
              </Button>
              <Button onClick={handleRunTest} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Test
                  </>
                )}
              </Button>
            </>
          )}
          {testResults && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleRunTest}>
                <Play className="mr-2 h-4 w-4" />
                Run Again
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
