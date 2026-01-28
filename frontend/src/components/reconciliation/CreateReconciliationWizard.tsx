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
} from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { WizardStepIndicator } from './WizardStepIndicator'
import { useFiles, useRuleSets, useCreateReconciliation } from '@/services/hooks'

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

const CreateReconciliationWizard = ({ onClose, onSuccess }: CreateReconciliationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardState, setWizardState] = useState<WizardState>({
    name: '',
    description: '',
    sourceFileId: null,
    targetFileId: null,
    ruleSetId: null,
  })

  const { data: filesResponse, isLoading: filesLoading } = useFiles()
  const { data: ruleSetsResponse, isLoading: ruleSetsLoading } = useRuleSets()
  const createReconciliation = useCreateReconciliation()

  const files = filesResponse?.data || []
  const ruleSets = ruleSetsResponse?.data || []

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return wizardState.name.trim().length > 0
      case 1:
        return wizardState.sourceFileId !== null
      case 2:
        return wizardState.targetFileId !== null && wizardState.targetFileId !== wizardState.sourceFileId
      case 3:
        return wizardState.ruleSetId !== null
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
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
            <p className="mb-4 text-sm text-muted-foreground">
              Select the source file to reconcile from
            </p>
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
              <div className="max-h-64 space-y-2 overflow-auto">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className={cn(
                      'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                      wizardState.sourceFileId === file.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setWizardState({ ...wizardState, sourceFileId: file.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.originalFilename}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.rowCount?.toLocaleString() || '?'} rows, {file.columnCount || '?'} columns
                          </p>
                        </div>
                      </div>
                      {wizardState.sourceFileId === file.id && (
                        <Check className="h-5 w-5 text-primary" />
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
            <p className="mb-4 text-sm text-muted-foreground">
              Select the target file to reconcile against
            </p>
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
              <div className="max-h-64 space-y-2 overflow-auto">
                {files
                  .filter((f) => f.id !== wizardState.sourceFileId)
                  .map((file) => (
                    <Card
                      key={file.id}
                      className={cn(
                        'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                        wizardState.targetFileId === file.id && 'border-primary bg-primary/5'
                      )}
                      onClick={() => setWizardState({ ...wizardState, targetFileId: file.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.originalFilename}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.rowCount?.toLocaleString() || '?'} rows, {file.columnCount || '?'} columns
                            </p>
                          </div>
                        </div>
                        {wizardState.targetFileId === file.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              Select the rule set to use for matching
            </p>
            {ruleSetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : ruleSets.length === 0 ? (
              <div className="py-8 text-center">
                <GitBranch className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No rule sets defined yet</p>
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-auto">
                {ruleSets.map((ruleSet) => (
                  <Card
                    key={ruleSet.id}
                    className={cn(
                      'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                      wizardState.ruleSetId === ruleSet.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setWizardState({ ...wizardState, ruleSetId: ruleSet.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{ruleSet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ruleSet.fieldMappings?.length || 0} mappings, {ruleSet.matchingRules?.length || 0} rules
                          </p>
                        </div>
                      </div>
                      {wizardState.ruleSetId === ruleSet.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

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
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
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
