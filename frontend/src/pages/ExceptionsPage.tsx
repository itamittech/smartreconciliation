import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Button, Card, CardContent, Modal, Input, Badge } from '@/components/ui'
import { ConsolidatedExceptionCard } from '@/components/exceptions'
import type { ConsolidatedExceptionGroup, ConsolidatedExceptionItem } from '@/components/exceptions/ConsolidatedExceptionCard'
import type { ReconciliationException as FrontendException, ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'
import { useBulkAutoResolveExceptions, useExceptionRunSummaries, useExceptions, useUpdateException } from '@/services/hooks'
import { getSafeErrorMessage } from '@/utils/errors'
import type {
  ReconciliationException as ApiException,
  ExceptionRunSummary,
  PaginatedResponse,
  AutoResolveExceptionsRequest,
  ExceptionStatus as ApiExceptionStatus,
  ExceptionSeverity as ApiExceptionSeverity,
  ExceptionType as ApiExceptionType,
  KnowledgeDomain,
} from '@/services/types'

type ExceptionViewModel = FrontendException & {
  fieldName?: string
  sourceValue?: string
  targetValue?: string
}

const PAGE_SIZE = 20

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

const DOMAIN_LABELS: Record<KnowledgeDomain, string> = {
  BANKING: 'Banking',
  TRADING: 'Trading',
  ACCOUNTS_PAYABLE: 'Accounts Payable',
  INVENTORY: 'Inventory',
  INTERCOMPANY: 'Intercompany',
  ECOMMERCE: 'E-Commerce',
  TECHNICAL: 'Technical',
  GENERAL: 'General',
}

function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseStatusParam(param: string | null): ExceptionStatus | 'all' {
  if (!param) return 'open'
  if (param === 'open' || param === 'in_review' || param === 'acknowledged' || param === 'resolved' || param === 'ignored' || param === 'all') {
    return param
  }
  return 'open'
}

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

function mapType(backendType: string): ExceptionType {
  const upper = backendType.toUpperCase() as ExceptionType
  const valid: ExceptionType[] = [
    'MISSING_SOURCE', 'MISSING_TARGET', 'VALUE_MISMATCH',
    'DUPLICATE', 'FORMAT_ERROR', 'TOLERANCE_EXCEEDED', 'POTENTIAL_MATCH',
  ]
  if (upper === ('MISMATCH' as ExceptionType)) return 'VALUE_MISMATCH'
  return valid.includes(upper) ? upper : 'VALUE_MISMATCH'
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

function transformException(apiException: ApiException): ExceptionViewModel {
  return {
    id: apiException.id.toString(),
    reconciliationId: apiException.reconciliationId.toString(),
    reconciliationName: apiException.reconciliationName,
    domain: apiException.domain,
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
      const fieldSeverity = normalizedFieldName ? { [normalizedFieldName]: exception.severity } : {}

      groups.set(key, {
        id: key,
        reconciliationId: exception.reconciliationId,
        reconciliationName: exception.reconciliationName,
        domain: exception.domain,
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
  // Read URL params once on initial render, then clear them from URL
  const [initialParams] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const values = {
      businessDate: params.get('businessDate'),
      reconciliationId: params.get('reconciliationId'),
      status: params.get('status'),
    }
    // Immediately clear sensitive data from URL
    if (values.businessDate || values.reconciliationId || values.status) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    return values
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [businessDate, setBusinessDate] = useState(initialParams.businessDate || getTodayDateString())
  const [selectedReconciliationId, setSelectedReconciliationId] = useState<string>(initialParams.reconciliationId || 'all')
  const [selectedSeverity, setSelectedSeverity] = useState<ExceptionSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ExceptionStatus | 'all'>(parseStatusParam(initialParams.status))
  const [selectedType, setSelectedType] = useState<ExceptionType | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    isOpen: false,
    exceptionId: null,
    action: null,
    remarks: '',
    error: null,
  })

  useEffect(() => {
    setCurrentPage(0)
  }, [businessDate, selectedReconciliationId, selectedSeverity, selectedStatus, selectedType])

  const baseApiFilters = {
    status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : undefined,
    type: selectedType !== 'all' ? selectedType.toUpperCase() : undefined,
    severity: selectedSeverity !== 'all' ? selectedSeverity.toUpperCase() : undefined,
    fromDate: businessDate,
    toDate: businessDate,
  }

  const apiFilters = {
    ...baseApiFilters,
    reconciliationId: selectedReconciliationId !== 'all' ? Number(selectedReconciliationId) : undefined,
    page: currentPage,
    size: PAGE_SIZE,
    sortBy: 'createdAt',
    sortDir: 'desc' as const,
  }

  const { data: exceptionsResponse, isLoading, isError, error } = useExceptions(apiFilters)
  const { data: runSummaryResponse } = useExceptionRunSummaries(baseApiFilters)
  const updateException = useUpdateException()
  const bulkAutoResolve = useBulkAutoResolveExceptions()

  const pageData = exceptionsResponse?.data as PaginatedResponse<ApiException> | ApiException[] | undefined
  const pageContent = Array.isArray(pageData) ? pageData : pageData?.content || []
  const totalPages = Array.isArray(pageData) ? 1 : pageData?.totalPages || 1
  const totalElements = Array.isArray(pageData) ? pageContent.length : pageData?.totalElements || pageContent.length

  const exceptions = useMemo(() => pageContent.map(transformException), [pageContent])
  const runSummaries = useMemo(() => (runSummaryResponse?.data || []) as ExceptionRunSummary[], [runSummaryResponse])

  const selectedRunSummary = useMemo(
    () => runSummaries.find((run) => run.reconciliationId.toString() === selectedReconciliationId),
    [runSummaries, selectedReconciliationId]
  )

  const consolidatedGroups = useMemo(() => consolidateExceptions(exceptions), [exceptions])

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return consolidatedGroups

    return consolidatedGroups.filter((group) => {
      const exceptionText = group.exceptions
        .map((exception) => [
          exception.details,
          exception.fieldName || '',
          exception.sourceValue || '',
          exception.targetValue || '',
        ].join(' '))
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

  const totalsFromRuns = useMemo(() => {
    if (selectedRunSummary) {
      return {
        open: selectedRunSummary.openCount,
        criticalOpen: selectedRunSummary.criticalOpenCount,
        inReview: selectedRunSummary.inReviewCount,
        aiActionable: selectedRunSummary.aiActionableCount,
      }
    }

    return runSummaries.reduce(
      (acc, run) => ({
        open: acc.open + run.openCount,
        criticalOpen: acc.criticalOpen + run.criticalOpenCount,
        inReview: acc.inReview + run.inReviewCount,
        aiActionable: acc.aiActionable + run.aiActionableCount,
      }),
      { open: 0, criticalOpen: 0, inReview: 0, aiActionable: 0 }
    )
  }, [runSummaries, selectedRunSummary])

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
              error: getSafeErrorMessage(err),
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
              error: getSafeErrorMessage(err),
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
            error: getSafeErrorMessage(err),
          }))
        },
      }
    )
  }

  const handleBulkAutoResolve = () => {
    const request: AutoResolveExceptionsRequest = {
      reconciliationId: selectedReconciliationId !== 'all' ? Number(selectedReconciliationId) : undefined,
      status: selectedStatus !== 'all' ? (selectedStatus.toUpperCase() as ApiExceptionStatus) : undefined,
      type: selectedType !== 'all' ? (selectedType as ApiExceptionType) : undefined,
      severity: selectedSeverity !== 'all' ? (selectedSeverity.toUpperCase() as ApiExceptionSeverity) : undefined,
      fromDate: businessDate,
      toDate: businessDate,
      resolutionTemplate: 'Resolved automatically from AI suggestion',
      resolvedBy: 'UI User',
    }
    bulkAutoResolve.mutate(request)
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
              {getSafeErrorMessage(error)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const actionDialogConfig = getActionDialogConfig()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Exception Workspace</h2>
            <p className="text-sm text-muted-foreground">Run-focused triage for daily reconciliation operations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBulkAutoResolve}
              disabled={bulkAutoResolve.isPending || totalsFromRuns.aiActionable === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Auto-resolve AI Suggestions
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalsFromRuns.criticalOpen}</p>
                <p className="text-sm text-muted-foreground">Critical Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalsFromRuns.open}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalsFromRuns.inReview}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-success/10 p-2">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalsFromRuns.aiActionable}</p>
                <p className="text-sm text-muted-foreground">AI Actionable</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <Input
            type="search"
            placeholder="Search exceptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search exceptions"
          />
          <Input
            type="date"
            value={businessDate}
            onChange={(e) => setBusinessDate(e.target.value || getTodayDateString())}
            aria-label="Business date"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ExceptionStatus | 'all')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as ExceptionSeverity | 'all')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter by severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ExceptionType | 'all')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="MISSING_SOURCE">Missing Source</option>
            <option value="MISSING_TARGET">Missing Target</option>
            <option value="VALUE_MISMATCH">Value Mismatch</option>
            <option value="DUPLICATE">Duplicate</option>
            <option value="FORMAT_ERROR">Format Error</option>
            <option value="TOLERANCE_EXCEEDED">Tolerance Exceeded</option>
            <option value="POTENTIAL_MATCH">Potential Match</option>
          </select>
        </div>

        {selectedReconciliationId !== 'all' && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline">
              Scoped to {selectedRunSummary?.reconciliationName || `Reconciliation #${selectedReconciliationId}`}
              {selectedRunSummary?.domain ? ` (${DOMAIN_LABELS[selectedRunSummary.domain]})` : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedReconciliationId('all')}
            >
              Clear scope
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid h-full gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="h-full overflow-hidden">
            <CardContent className="h-full overflow-auto p-0">
              <div className="border-b px-4 py-3">
                <p className="font-semibold">Runs on {businessDate}</p>
                <p className="text-xs text-muted-foreground">Select one reconciliation to isolate noise</p>
              </div>
              <div className="space-y-2 p-3">
                <button
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${selectedReconciliationId === 'all' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                  onClick={() => setSelectedReconciliationId('all')}
                >
                  <p className="font-medium">All Runs</p>
                  <p className="text-xs text-muted-foreground">{runSummaries.length} runs in scope</p>
                </button>
                {runSummaries.length === 0 && (
                  <p className="px-1 py-4 text-sm text-muted-foreground">No runs available for this date.</p>
                )}
                {runSummaries.map((run) => {
                  const runId = run.reconciliationId.toString()
                  const selected = selectedReconciliationId === runId
                  return (
                    <button
                      key={run.reconciliationId}
                      type="button"
                      onClick={() => setSelectedReconciliationId(runId)}
                      className={`w-full rounded-md border px-3 py-2 text-left ${selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/40'}`}
                    >
                      <p className="text-sm font-medium truncate">{run.reconciliationName}</p>
                      <p className="text-xs text-muted-foreground">
                        Domain: {DOMAIN_LABELS[run.domain] ?? run.domain}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Open: {run.openCount} | Critical: {run.criticalOpenCount}</p>
                      <p className="text-xs text-muted-foreground">AI: {run.aiActionableCount} | Total: {run.totalInScope}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex h-full flex-col overflow-hidden">
            <Card className="mb-4">
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <p className="text-sm text-muted-foreground">
                  Showing page {currentPage + 1} of {Math.max(totalPages, 1)} ({totalElements} exceptions in scope)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
                    disabled={currentPage >= totalPages - 1 || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1 overflow-auto space-y-4">
              {filteredGroups.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                    <p className="mt-2 font-medium">All caught up!</p>
                    <p className="text-sm text-muted-foreground">
                      {exceptions.length === 0
                        ? 'No exceptions found in this scope.'
                        : 'No exceptions match your current filters.'}
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
