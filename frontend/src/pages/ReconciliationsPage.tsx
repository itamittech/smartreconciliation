import { useState } from 'react'
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
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components/ui'
import { CreateReconciliationWizard } from '@/components/reconciliation'
import type { ReconciliationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useReconciliations, useDeleteReconciliation, useStartReconciliation } from '@/services/hooks'
import type { Reconciliation as ApiReconciliation } from '@/services/types'

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  COMPLETED: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  IN_PROGRESS: { icon: Clock, label: 'Processing', variant: 'warning' },
  PENDING: { icon: Clock, label: 'Pending', variant: 'secondary' },
  FAILED: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

const ReconciliationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  const { data: reconciliationsResponse, isLoading, isError, error } = useReconciliations()
  const deleteReconciliation = useDeleteReconciliation()
  const startReconciliation = useStartReconciliation()

  const reconciliations = reconciliationsResponse?.data || []

  const filteredReconciliations = reconciliations.filter((recon) => {
    const matchesSearch = recon.name.toLowerCase().includes(searchQuery.toLowerCase())
    const backendStatus = recon.status?.toString().toLowerCase()
    const filterStatus = statusFilter === 'all' ? true :
      (statusFilter === 'processing' && backendStatus === 'in_progress') ||
      backendStatus === statusFilter
    return matchesSearch && filterStatus
  })

  const handleNewReconciliation = () => {
    setShowWizard(true)
  }

  const handleRowClick = (id: number) => {
    setSelectedId(id === selectedId ? null : id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick(id)
    }
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this reconciliation?')) {
      deleteReconciliation.mutate(id)
    }
  }

  const handleStart = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    startReconciliation.mutate(id)
  }

  const getMatchRate = (recon: ApiReconciliation) => {
    if (recon.matchRate != null) return recon.matchRate.toFixed(1)
    if (!recon.totalSourceRecords || recon.totalSourceRecords === 0) return '0.0'
    if (!recon.matchedRecords) return '0.0'
    return ((recon.matchedRecords / recon.totalSourceRecords) * 100).toFixed(1)
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
            <p className="font-semibold text-lg">Failed to load reconciliations</p>
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
            <h2 className="text-lg font-semibold">All Reconciliations</h2>
            <p className="text-sm text-muted-foreground">
              Manage and track your data reconciliations
            </p>
          </div>
          <Button onClick={handleNewReconciliation}>
            <Plus className="mr-2 h-4 w-4" />
            New Reconciliation
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reconciliations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search reconciliations"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReconciliationStatus | 'all')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Sources
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Records
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Match Rate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReconciliations.map((recon) => {
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-secondary p-2">
                            <FileStack className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium">{recon.name}</span>
                            {recon.description && (
                              <p className="text-sm text-muted-foreground">{recon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{recon.sourceFileName || 'Source File'}</p>
                          <p className="text-muted-foreground">vs {recon.targetFileName || 'Target File'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{(recon.totalSourceRecords || 0).toLocaleString()} total</p>
                          <p className="text-muted-foreground">
                            {recon.exceptionCount || 0} exceptions
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn('h-full', {
                                'bg-success': Number(matchRate) >= 95,
                                'bg-warning': Number(matchRate) >= 80 && Number(matchRate) < 95,
                                'bg-destructive': Number(matchRate) < 80,
                              })}
                              style={{ width: `${matchRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{matchRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={config.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(recon.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {recon.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Start reconciliation"
                              onClick={(e) => handleStart(e, recon.id)}
                              disabled={startReconciliation.isPending}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View details"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('View:', recon.id)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Download results"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Download:', recon.id)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={(e) => handleDelete(e, recon.id)}
                            disabled={deleteReconciliation.isPending}
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
              <div className="py-12 text-center">
                <FileStack className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {reconciliations.length === 0
                    ? 'No reconciliations yet. Create your first one!'
                    : 'No reconciliations found matching your filters'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Reconciliation Wizard */}
      {showWizard && (
        <CreateReconciliationWizard
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  )
}

export { ReconciliationsPage }
