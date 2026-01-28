import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ExceptionCard, ExceptionFilters } from '@/components/exceptions'
import type { ReconciliationException as FrontendException, ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'
import { useExceptions, useResolveException, useIgnoreException, useBulkResolveExceptions } from '@/services/hooks'
import type { ReconciliationException as ApiException } from '@/services/types'

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

// Transform backend exception to frontend format
function transformException(apiException: ApiException): FrontendException {
  return {
    id: apiException.id.toString(),
    reconciliationId: apiException.reconciliationId.toString(),
    type: mapType(apiException.type),
    severity: mapSeverity(apiException.severity),
    status: apiException.status.toLowerCase() as ExceptionStatus,
    sourceRecordId: apiException.sourceValue || undefined,
    targetRecordId: apiException.targetValue || undefined,
    sourceData: apiException.sourceData || undefined,
    targetData: apiException.targetData || undefined,
    details: apiException.description || `${apiException.type} exception on field ${apiException.fieldName || 'unknown'}`,
    aiSuggestion: apiException.aiSuggestion || undefined,
    createdAt: apiException.createdAt,
  }
}

const ExceptionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<ExceptionSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ExceptionStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ExceptionType | 'all'>('all')

  // API filters
  const apiFilters = {
    status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : undefined,
    type: selectedType !== 'all' ? selectedType.toUpperCase() : undefined,
    severity: selectedSeverity !== 'all' ? selectedSeverity.toUpperCase() : undefined,
  }

  const { data: exceptionsResponse, isLoading, isError, error } = useExceptions(apiFilters)
  const resolveException = useResolveException()
  const ignoreException = useIgnoreException()
  const bulkResolve = useBulkResolveExceptions()

  // Handle paginated response - data.content contains the array
  const pageData = exceptionsResponse?.data as { content?: ApiException[] } | ApiException[] | undefined
  const apiExceptions = Array.isArray(pageData) ? pageData : (pageData?.content || [])
  const exceptions = apiExceptions.map(transformException)

  // Client-side search filter (search query not sent to API)
  const filteredExceptions = exceptions.filter((ex) => {
    const matchesSearch = ex.details.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const openCount = exceptions.filter((e) => e.status === 'open').length
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && e.status === 'open').length

  const handleResolve = (id: string, action: 'accept' | 'reject' | 'investigate') => {
    const numericId = parseInt(id, 10)
    if (action === 'accept') {
      resolveException.mutate({ id: numericId, data: { resolution: 'Accepted via UI' } })
    } else if (action === 'reject') {
      ignoreException.mutate(numericId)
    } else {
      console.log('Investigate:', id)
    }
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
          {filteredExceptions.length === 0 ? (
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
            filteredExceptions.map((exception) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onResolve={handleResolve}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export { ExceptionsPage }
