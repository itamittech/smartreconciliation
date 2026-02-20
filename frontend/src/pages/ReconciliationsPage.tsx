import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  FileStack,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  PlayCircle,
  Database,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components/ui'
import { CreateReconciliationWizard, ReconciliationDetailsModal } from '@/components/reconciliation'
import type { ReconciliationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useReconciliations, useDeleteReconciliation, useStartReconciliation, useBulkDeleteReconciliations } from '@/services/hooks'
import type { Reconciliation as ApiReconciliation } from '@/services/types'
import { useAppStore } from '@/store'

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' }
> = {
  COMPLETED: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  IN_PROGRESS: { icon: Clock, label: 'Processing', variant: 'info' },
  PENDING: { icon: Clock, label: 'Pending', variant: 'warning' },
  FAILED: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

const ITEMS_PER_PAGE = 20

type SortField = 'name' | 'status' | 'matchRate' | 'createdAt' | 'completedAt'
type SortDirection = 'asc' | 'desc'

const ReconciliationsPage = () => {
  const params = new URLSearchParams(window.location.search)
  const [searchQuery, setSearchQuery] = useState(() => params.get('reconSearch') || '')
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'all'>(() => {
    const status = params.get('reconStatus')
    if (status === 'completed' || status === 'processing' || status === 'pending' || status === 'failed' || status === 'all') {
      return status
    }
    return 'all'
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    const value = Number(params.get('reconPage') || '1')
    return Number.isNaN(value) || value < 1 ? 1 : value
  })
  const [sortField, setSortField] = useState<SortField>(() => {
    const value = params.get('reconSort')
    if (value === 'name' || value === 'status' || value === 'matchRate' || value === 'createdAt' || value === 'completedAt') {
      return value
    }
    return 'createdAt'
  })
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const value = params.get('reconOrder')
    return value === 'asc' || value === 'desc' ? value : 'desc'
  })
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [startingIds, setStartingIds] = useState<Set<number>>(new Set())
  const setActiveView = useAppStore((state) => state.setActiveView)

  const { data: reconciliationsResponse, isLoading, isError, error } = useReconciliations({
    page: currentPage - 1, // Backend uses 0-based indexing
    size: ITEMS_PER_PAGE,
    sort: sortField,
    order: sortDirection,
  })
  const deleteReconciliation = useDeleteReconciliation()
  const bulkDeleteReconciliations = useBulkDeleteReconciliations()
  const startReconciliation = useStartReconciliation()

  // Handle both paginated and non-paginated responses
  const isPaginated = reconciliationsResponse?.data && 'content' in reconciliationsResponse.data
  const reconciliations: ApiReconciliation[] = isPaginated
    ? (reconciliationsResponse.data as any).content || []
    : (reconciliationsResponse?.data as any) || []
  const totalElements = isPaginated ? (reconciliationsResponse.data as any).totalElements : reconciliations.length
  const totalPages = isPaginated ? (reconciliationsResponse.data as any).totalPages : 1

  // Client-side filtering for search and status (could be moved to backend later)
  const filteredReconciliations = reconciliations.filter((recon: ApiReconciliation) => {
    const matchesSearch = searchQuery ? recon.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const backendStatus = recon.status?.toString().toLowerCase()
    const filterStatus = statusFilter === 'all' ? true :
      (statusFilter === 'processing' && backendStatus === 'in_progress') ||
      backendStatus === statusFilter
    return matchesSearch && filterStatus
  })

  const paginatedReconciliations = filteredReconciliations
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalElements)

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: ReconciliationStatus | 'all') => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedReconciliations.map((r: ApiReconciliation) => r.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (confirm(`Delete ${selectedIds.size} selected reconciliation(s)?`)) {
      bulkDeleteReconciliations.mutate(Array.from(selectedIds), {
        onSuccess: (response) => {
          const result = response.data
          if (result.failedCount > 0) {
            alert(`Deleted ${result.successCount} items. ${result.failedCount} failed.`)
          }
          setSelectedIds(new Set())
        },
        onError: () => {
          alert('Bulk delete failed. Please try again.')
        }
      })
    }
  }

  const allSelected = paginatedReconciliations.length > 0 &&
    paginatedReconciliations.every((r: ApiReconciliation) => selectedIds.has(r.id))
  const someSelected = paginatedReconciliations.some((r: ApiReconciliation) => selectedIds.has(r.id)) && !allSelected

  const handleNewReconciliation = () => {
    setShowWizard(true)
  }

  const handleRowClick = (id: number) => {
    setSelectedId(id)
    setShowDetailsModal(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick(id)
    }
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('Delete this reconciliation?')) {
      deleteReconciliation.mutate(id)
    }
  }

  const handleStart = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setStartingIds((prev) => new Set(prev).add(id))
    startReconciliation.mutate(id, {
      onSettled: () =>
        setStartingIds((prev) => {
          const s = new Set(prev)
          s.delete(id)
          return s
        }),
    })
  }

  const getMatchRate = (recon: ApiReconciliation) => {
    if (recon.matchRate != null) return recon.matchRate.toFixed(1)
    if (!recon.totalSourceRecords || recon.totalSourceRecords === 0) return '0.0'
    if (!recon.matchedRecords) return '0.0'
    return ((recon.matchedRecords / recon.totalSourceRecords) * 100).toFixed(1)
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set('view', 'reconciliations')
    urlParams.set('reconPage', String(currentPage))
    urlParams.set('reconSort', sortField)
    urlParams.set('reconOrder', sortDirection)
    if (searchQuery) urlParams.set('reconSearch', searchQuery)
    else urlParams.delete('reconSearch')
    urlParams.set('reconStatus', statusFilter)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${urlParams.toString()}`)
  }, [currentPage, searchQuery, sortField, sortDirection, statusFilter])

  const handleOpenExceptions = (event: React.MouseEvent, recon: ApiReconciliation) => {
    event.stopPropagation()
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set('view', 'exceptions')
    urlParams.set('reconciliationId', recon.id.toString())
    urlParams.set('businessDate', recon.createdAt.slice(0, 10))
    urlParams.set('status', 'open')
    window.history.pushState(window.history.state, '', `${window.location.pathname}?${urlParams.toString()}`)
    setActiveView('exceptions')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reconciliations...</p>
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
            <p className="font-semibold text-lg">Connection Failed</p>
            <p className="text-muted-foreground text-sm mt-2">
              {error instanceof Error ? error.message : 'Unable to connect to the server'}
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
            <h2 className="text-lg font-semibold">Reconciliations</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Data matching and exception tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteReconciliations.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {bulkDeleteReconciliations.isPending ? 'Deleting...' : 'Delete Selected'}
                </Button>
              </div>
            )}
            <Button onClick={handleNewReconciliation}>
              <Plus className="mr-2 h-4 w-4" />
              New Reconciliation
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reconciliations..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Search reconciliations"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as ReconciliationStatus | 'all')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-input"
                      aria-label="Select all reconciliations"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('name')}
                    role="columnheader"
                  >
                    Reconciliation <SortIcon field="name" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Data Sources
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Records
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('matchRate')}
                    role="columnheader"
                  >
                    Match Rate <SortIcon field="matchRate" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('status')}
                    role="columnheader"
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('createdAt')}
                    role="columnheader"
                  >
                    Date <SortIcon field="createdAt" />
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedReconciliations.map((recon: ApiReconciliation) => {
                  const config = statusConfig[recon.status] || statusConfig.PENDING
                  const StatusIcon = config.icon
                  const matchRate = getMatchRate(recon)

                  return (
                    <tr
                      key={recon.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleRowClick(recon.id)}
                      onKeyDown={(e) => handleKeyDown(e, recon.id)}
                      className={cn(
                        'cursor-pointer border-b transition-colors hover:bg-muted/50',
                        selectedId === recon.id && 'bg-muted/50'
                      )}
                      aria-selected={selectedId === recon.id}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(recon.id)}
                          onChange={(e) => handleSelectOne(recon.id, e.target.checked)}
                          className="rounded border-input"
                          aria-label={`Select ${recon.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-2">
                            <Database className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{recon.name}</span>
                            {recon.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{recon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-foreground text-xs">{recon.sourceFileName || '—'}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">↔ {recon.targetFileName || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-foreground">{(recon.totalSourceRecords || 0).toLocaleString()}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {(recon.exceptionCount || 0) > 0 ? (
                              <button
                                type="button"
                                onClick={(event) => handleOpenExceptions(event, recon)}
                                className="text-primary hover:underline font-medium"
                                aria-label={`Open ${recon.exceptionCount || 0} exceptions for ${recon.name}`}
                              >
                                {recon.exceptionCount || 0} exceptions
                              </button>
                            ) : (
                              '0 exceptions'
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn('h-full transition-all duration-500', {
                                'bg-success': Number(matchRate) >= 95,
                                'bg-primary': Number(matchRate) >= 80 && Number(matchRate) < 95,
                                'bg-destructive': Number(matchRate) < 80,
                              })}
                              style={{ width: `${matchRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">{matchRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={config.variant} pulse={recon.status === 'IN_PROGRESS'}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(recon.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {recon.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Start ${recon.name}`}
                              onClick={(e) => handleStart(e, recon.id)}
                              disabled={startingIds.has(recon.id)}
                              className="gap-1 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              {startingIds.has(recon.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                              {startingIds.has(recon.id) ? 'Starting...' : 'Start'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View details"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(recon.id)
                            }}
                            className="hover:text-violet-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Download results"
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`Export not yet available for: ${recon.name}`)
                            }}
                            className="hover:text-cyan-400"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={(e) => handleDelete(e, recon.id)}
                            disabled={deleteReconciliation.isPending}
                            className="hover:text-pink-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredReconciliations.length === 0 && (
              <div className="py-16 text-center">
                <FileStack className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {reconciliations.length === 0
                    ? 'No reconciliations yet. Create your first one.'
                    : 'No results match your search.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {totalElements}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Reconciliation Wizard */}
      {showWizard && (
        <CreateReconciliationWizard
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Reconciliation Details Modal */}
      {showDetailsModal && selectedId && (
        <ReconciliationDetailsModal
          reconciliation={reconciliations.find((r: ApiReconciliation) => r.id === selectedId)!}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}

export { ReconciliationsPage }
