import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, Modal } from '@/components/ui'
import { ConsolidatedExceptionCard, ExceptionFilters } from '@/components/exceptions'
import type { ConsolidatedExceptionGroup, ConsolidatedExceptionItem } from '@/components/exceptions/ConsolidatedExceptionCard'
import type { ReconciliationException as FrontendException, ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'
import { useExceptions, useUpdateException, useBulkResolveExceptions } from '@/services/hooks'
import type { ReconciliationException as ApiException } from '@/services/types'

type ExceptionViewModel = FrontendException & {
  fieldName?: string
  sourceValue?: string
  targetValue?: string
}

const severityRank: Record<ExceptionSeverity, number> = {
  info: 1,
  warning: 2,
  critical: 3,
}

const statusRank: Record<ExceptionStatus, number> = {
  ignored: 1,
  resolved: 2,
  acknowledged: 3,
  in_review: 4,
  open: 5,
}

type ExceptionActionType = 'accept' | 'reject' | 'investigate'

interface ActionDialogState {
  isOpen: boolean
  exceptionId: string | null
  action: ExceptionActionType | null
  remarks: string
  error: string | null
}

// Map backend severity to frontend
function mapSeverity(backendSeverity: string): ExceptionSeverity {
  switch (backendSeverity.toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
      return 'critical'
    case 'MEDIUM':
    case 'WARNING':
      return 'warning'
    default:
      return 'info'
  }
}

// Map backend type to frontend
function mapType(backendType: string): ExceptionType {
  switch (backendType.toUpperCase()) {
    case 'MISSING_SOURCE':
      return 'missing_source'
    case 'MISSING_TARGET':
      return 'missing_target'
    case 'VALUE_MISMATCH':
    case 'MISMATCH':
      return 'mismatch'
    case 'DUPLICATE':
      return 'duplicate'
    default:
      return 'mismatch'
  }
}

function mapStatus(backendStatus: string): ExceptionStatus {
  switch (backendStatus.toUpperCase()) {
    case 'OPEN':
      return 'open'
    case 'ACKNOWLEDGED':
      return 'acknowledged'
    case 'IN_REVIEW':
      return 'in_review'
    case 'RESOLVED':
      return 'resolved'
    case 'IGNORED':
      return 'ignored'
    default:
      return 'open'
  }
}

// Transform backend exception to frontend format
function transformException(apiException: ApiException): ExceptionViewModel {
  return {
    id: apiException.id.toString(),
    reconciliationId: apiException.reconciliationId.toString(),
    reconciliationName: apiException.reconciliationName,
    type: mapType(apiException.type),
    severity: mapSeverity(apiException.severity),
    status: mapStatus(apiException.status),
    sourceRecordId: apiException.sourceValue || undefined,
    targetRecordId: apiException.targetValue || undefined,
    sourceData: apiException.sourceData || undefined,
    targetData: apiException.targetData || undefined,
    details: apiException.description || `${apiException.type} exception on field ${apiException.fieldName || 'unknown'}`,
    resolution: apiException.resolution || undefined,
    resolvedBy: apiException.resolvedBy || undefined,
    aiSuggestion: apiException.aiSuggestion || undefined,
    fieldName: apiException.fieldName || undefined,
    sourceValue: apiException.sourceValue || undefined,
    targetValue: apiException.targetValue || undefined,
    createdAt: apiException.createdAt,
  }
}

function stableStringify(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value !== 'object') return String(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}:${stableStringify(val)}`)
  return `{${entries.join(',')}}`
}

function getGroupKey(exception: ExceptionViewModel): string {
  return [
    exception.reconciliationId,
    exception.sourceRecordId || '',
    exception.targetRecordId || '',
    stableStringify(exception.sourceData || {}),
    stableStringify(exception.targetData || {}),
  ].join('|')
}

function consolidateExceptions(exceptions: ExceptionViewModel[]): ConsolidatedExceptionGroup[] {
  const groups = new Map<string, ConsolidatedExceptionGroup>()

  exceptions.forEach((exception) => {
    const key = getGroupKey(exception)
    const existing = groups.get(key)

    const exceptionItem: ConsolidatedExceptionItem = {
      id: exception.id,
      type: exception.type,
      severity: exception.severity,
      status: exception.status,
      details: exception.details,
      resolution: exception.resolution,
      resolvedBy: exception.resolvedBy,
      fieldName: exception.fieldName,
      sourceValue: exception.sourceValue,
      targetValue: exception.targetValue,
      aiSuggestion: exception.aiSuggestion,
      createdAt: exception.createdAt,
    }

    if (!existing) {
      const normalizedFieldName = exception.fieldName?.trim().toLowerCase()
      const fieldSeverity =
        normalizedFieldName
          ? { [normalizedFieldName]: exception.severity }
          : {}

      groups.set(key, {
        id: key,
        reconciliationId: exception.reconciliationId,
        reconciliationName: exception.reconciliationName,
        sourceRecordId: exception.sourceRecordId,
        targetRecordId: exception.targetRecordId,
        sourceData: exception.sourceData,
        targetData: exception.targetData,
        exceptions: [exceptionItem],
        aiSuggestions: exception.aiSuggestion ? [exception.aiSuggestion] : [],
        highlightedFields: normalizedFieldName ? [normalizedFieldName] : [],
        fieldSeverity,
        highestSeverity: exception.severity,
        status: exception.status,
        latestAt: exception.createdAt,
      })
      return
    }

    existing.exceptions.push(exceptionItem)
    if (exception.aiSuggestion && !existing.aiSuggestions.includes(exception.aiSuggestion)) {
      existing.aiSuggestions.push(exception.aiSuggestion)
    }

    const normalizedFieldName = exception.fieldName?.trim().toLowerCase()
    if (normalizedFieldName) {
      if (!existing.highlightedFields.includes(normalizedFieldName)) {
        existing.highlightedFields.push(normalizedFieldName)
      }
      const currentFieldSeverity = existing.fieldSeverity[normalizedFieldName]
      if (!currentFieldSeverity || severityRank[exception.severity] > severityRank[currentFieldSeverity]) {
        existing.fieldSeverity[normalizedFieldName] = exception.severity
      }
    }

    if (severityRank[exception.severity] > severityRank[existing.highestSeverity]) {
      existing.highestSeverity = exception.severity
    }
    if (statusRank[exception.status] > statusRank[existing.status]) {
      existing.status = exception.status
    }
    if (new Date(exception.createdAt).getTime() > new Date(existing.latestAt).getTime()) {
      existing.latestAt = exception.createdAt
    }
  })

  return Array.from(groups.values()).sort((a, b) => {
    const statusDelta = statusRank[b.status] - statusRank[a.status]
    if (statusDelta !== 0) return statusDelta
    const severityDelta = severityRank[b.highestSeverity] - severityRank[a.highestSeverity]
    if (severityDelta !== 0) return severityDelta
    return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
  })
}

const ExceptionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReconciliationId, setSelectedReconciliationId] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<ExceptionSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ExceptionStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ExceptionType | 'all'>('all')
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    isOpen: false,
    exceptionId: null,
    action: null,
    remarks: '',
    error: null,
  })

  // API filters
  const baseApiFilters = {
    status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : undefined,
    type: selectedType !== 'all' ? selectedType.toUpperCase() : undefined,
    severity: selectedSeverity !== 'all' ? selectedSeverity.toUpperCase() : undefined,
  }
  const apiFilters = {
    ...baseApiFilters,
    reconciliationId: selectedReconciliationId !== 'all' ? Number(selectedReconciliationId) : undefined,
  }

  const { data: exceptionsResponse, isLoading, isError, error } = useExceptions(apiFilters)
  const { data: reconciliationScopeResponse } = useExceptions(baseApiFilters)
  const updateException = useUpdateException()
  const bulkResolve = useBulkResolveExceptions()

  // Handle paginated response - data.content contains the array
  const pageData = exceptionsResponse?.data as { content?: ApiException[] } | ApiException[] | undefined
  const exceptions = useMemo(() => {
    const apiExceptions = Array.isArray(pageData) ? pageData : (pageData?.content || [])
    return apiExceptions.map(transformException)
  }, [pageData])

  const reconciliationScopePageData = reconciliationScopeResponse?.data as { content?: ApiException[] } | ApiException[] | undefined
  const reconciliationScopeExceptions = useMemo(() => {
    const apiExceptions = Array.isArray(reconciliationScopePageData)
      ? reconciliationScopePageData
      : (reconciliationScopePageData?.content || [])
    return apiExceptions.map(transformException)
  }, [reconciliationScopePageData])

  const reconciliationOptions = useMemo(() => {
    const map = new Map<string, string>()
    reconciliationScopeExceptions.forEach((exception) => {
      if (!map.has(exception.reconciliationId)) {
        map.set(exception.reconciliationId, exception.reconciliationName)
      }
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [reconciliationScopeExceptions])

  const consolidatedGroups = useMemo(() => consolidateExceptions(exceptions), [exceptions])

  // Client-side search filter (search query not sent to API)
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return consolidatedGroups

    return consolidatedGroups.filter((group) => {
      const exceptionText = group.exceptions
        .map((exception) =>
          [
            exception.details,
            exception.fieldName || '',
            exception.sourceValue || '',
            exception.targetValue || '',
          ].join(' ')
        )
        .join(' ')
      const aiText = group.aiSuggestions.join(' ')
      const sourceText = stableStringify(group.sourceData || {})
      const targetText = stableStringify(group.targetData || {})

      return (
        group.reconciliationName.toLowerCase().includes(query) ||
        exceptionText.toLowerCase().includes(query) ||
        aiText.toLowerCase().includes(query) ||
        sourceText.toLowerCase().includes(query) ||
        targetText.toLowerCase().includes(query)
      )
    })
  }, [consolidatedGroups, searchQuery])

  const openCount = exceptions.filter((e) => e.status === 'open').length
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && e.status === 'open').length

  const handleResolve = (id: string, action: 'accept' | 'reject' | 'investigate') => {
    setActionDialog({
      isOpen: true,
      exceptionId: id,
      action,
      remarks: '',
      error: null,
    })
  }

  const closeActionDialog = () => {
    setActionDialog({
      isOpen: false,
      exceptionId: null,
      action: null,
      remarks: '',
      error: null,
    })
  }

  const getActionDialogConfig = () => {
    switch (actionDialog.action) {
      case 'accept':
        return {
          title: 'Accept Exception',
          description: 'Provide remarks for why this exception is accepted and resolved.',
          placeholder: 'Enter acceptance remarks...',
          submitLabel: 'Accept & Resolve',
          required: true,
        }
      case 'reject':
        return {
          title: 'Reject Exception',
          description: 'Provide remarks for why this is not a valid exception.',
          placeholder: 'Enter rejection remarks...',
          submitLabel: 'Reject Exception',
          required: true,
        }
      case 'investigate':
        return {
          title: 'Mark For Investigation',
          description: 'Describe what additional human investigation is required.',
          placeholder: 'Enter investigation notes...',
          submitLabel: 'Move To In Review',
          required: true,
        }
      default:
        return {
          title: 'Update Exception',
          description: '',
          placeholder: 'Enter remarks...',
          submitLabel: 'Update',
          required: false,
        }
    }
  }

  const handleSubmitAction = () => {
    if (!actionDialog.exceptionId || !actionDialog.action) return

    const config = getActionDialogConfig()
    const remarks = actionDialog.remarks.trim()

    if (config.required && remarks.length === 0) {
      setActionDialog((prev) => ({
        ...prev,
        error: 'Remarks are required for this action.',
      }))
      return
    }

    const numericId = parseInt(actionDialog.exceptionId, 10)
    if (actionDialog.action === 'accept') {
      updateException.mutate(
        {
          id: numericId,
          data: {
            status: 'RESOLVED',
            resolution: remarks,
            resolvedBy: 'UI User',
          },
        },
        {
          onSuccess: closeActionDialog,
          onError: (err) => {
            setActionDialog((prev) => ({
              ...prev,
              error: err instanceof Error ? err.message : 'Failed to accept exception.',
            }))
          },
        }
      )
      return
    }

    if (actionDialog.action === 'reject') {
      updateException.mutate(
        {
          id: numericId,
          data: {
            status: 'IGNORED',
            resolution: remarks,
            resolvedBy: 'UI User',
          },
        },
        {
          onSuccess: closeActionDialog,
          onError: (err) => {
            setActionDialog((prev) => ({
              ...prev,
              error: err instanceof Error ? err.message : 'Failed to reject exception.',
            }))
          },
        }
      )
      return
    }

    updateException.mutate(
      {
        id: numericId,
        data: {
          status: 'IN_REVIEW',
          resolution: remarks,
          resolvedBy: 'UI User',
        },
      },
      {
        onSuccess: closeActionDialog,
        onError: (err) => {
          setActionDialog((prev) => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Failed to move exception to in-review.',
          }))
        },
      }
    )
  }

  const handleBulkAccept = () => {
    const highConfidence = exceptions.filter(
      (e) => e.status === 'open' && e.aiSuggestion
    )
    const ids = highConfidence.map((e) => parseInt(e.id, 10))
    if (ids.length > 0) {
      bulkResolve.mutate({ ids, resolution: 'Bulk accepted based on AI suggestions' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading exceptions...</p>
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
            <p className="font-semibold text-lg">Failed to load exceptions</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unable to connect to backend API'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const actionDialogConfig = getActionDialogConfig()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Exception Queue</h2>
            <p className="text-sm text-muted-foreground">
              Review and resolve reconciliation exceptions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBulkAccept}
              disabled={bulkResolve.isPending || openCount === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Accept All AI Suggestions
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exceptions.length - openCount}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <ExceptionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedReconciliationId={selectedReconciliationId}
            reconciliationOptions={reconciliationOptions}
            onReconciliationChange={setSelectedReconciliationId}
            selectedSeverity={selectedSeverity}
            onSeverityChange={setSelectedSeverity}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
      </div>

      {/* Exception List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <p className="mt-2 font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  {exceptions.length === 0
                    ? 'No exceptions found. Great job!'
                    : 'No exceptions match your current filters.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <ConsolidatedExceptionCard
                key={group.id}
                group={group}
                onResolve={handleResolve}
              />
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={actionDialog.isOpen}
        onClose={closeActionDialog}
        title={actionDialogConfig.title}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{actionDialogConfig.description}</p>

          <div>
            <label htmlFor="exception-action-remarks" className="mb-1 block text-sm font-medium">
              Remarks {actionDialogConfig.required && <span className="text-destructive">*</span>}
            </label>
            <textarea
              id="exception-action-remarks"
              value={actionDialog.remarks}
              onChange={(e) =>
                setActionDialog((prev) => ({
                  ...prev,
                  remarks: e.target.value,
                  error: null,
                }))
              }
              placeholder={actionDialogConfig.placeholder}
              className="h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {actionDialog.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionDialog.error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeActionDialog} disabled={updateException.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAction} disabled={updateException.isPending}>
              {updateException.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                actionDialogConfig.submitLabel
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export { ExceptionsPage }
