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
  Database,
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components/ui'
import { CreateReconciliationWizard, ReconciliationDetailsModal } from '@/components/reconciliation'
import type { ReconciliationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useReconciliations, useDeleteReconciliation, useStartReconciliation } from '@/services/hooks'
import { useAppStore } from '@/store'
import type { Reconciliation as ApiReconciliation } from '@/services/types'

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' }
> = {
  COMPLETED: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  IN_PROGRESS: { icon: Clock, label: 'Processing', variant: 'info' },
  PENDING: { icon: Clock, label: 'Pending', variant: 'warning' },
  FAILED: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

const ReconciliationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { setActiveView } = useAppStore()
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
    if (confirm('Delete this reconciliation from the quantum matrix?')) {
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
          <Loader2 className="h-10 w-10 animate-spin text-violet-400 glow-violet" />
          <p className="text-gray-400">Loading quantum reconciliations...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center glass p-8 rounded-2xl max-w-md">
          <AlertCircle className="h-12 w-12 text-pink-500" />
          <div>
            <p className="font-semibold text-lg text-foreground">Neural Connection Failed</p>
            <p className="text-gray-400 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unable to access quantum backend'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col relative">
      {/* Particle background */}
      <div className="fixed inset-0 pattern-dots opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="border-b border-space-600 p-6 glass-strong relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-violet">Reconciliation Matrix</h2>
            <p className="text-sm text-gray-400 mt-1">
              Neural-powered data matching and verification workflows
            </p>
          </div>
          <Button onClick={handleNewReconciliation} glow>
            <Plus className="mr-2 h-4 w-4" />
            New Reconciliation
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search quantum matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search reconciliations"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReconciliationStatus | 'all')}
            className="h-11 rounded-lg border-2 border-space-600 bg-space-800 px-4 text-sm text-foreground focus:outline-none focus:border-violet-500 focus:shadow-glow-violet transition-all"
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
      <div className="flex-1 overflow-auto p-6 relative z-10">
        <Card variant="glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-space-600">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                    Reconciliation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Data Sources
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Neural Accuracy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                        'cursor-pointer border-b border-space-700 transition-all hover:bg-space-750',
                        selectedId === recon.id && 'bg-space-750 shadow-glow-violet'
                      )}
                      aria-selected={selectedId === recon.id}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl gradient-violet p-2 shadow-glow-violet">
                            <Database className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{recon.name}</span>
                            {recon.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{recon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-cyan-400 font-mono text-xs">{recon.sourceFileName || 'Source Matrix'}</p>
                          <p className="text-gray-500 text-xs mt-0.5">↔ {recon.targetFileName || 'Target Matrix'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-mono">
                          <p className="text-foreground">{(recon.totalSourceRecords || 0).toLocaleString()}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {recon.exceptionCount || 0} exceptions
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-space-900 border border-space-600">
                            <div
                              className={cn('h-full transition-all duration-500', {
                                'gradient-cyan shadow-glow-green': Number(matchRate) >= 95,
                                'gradient-violet shadow-glow-violet': Number(matchRate) >= 80 && Number(matchRate) < 95,
                                'gradient-pink shadow-glow-pink': Number(matchRate) < 80,
                              })}
                              style={{ width: `${matchRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-foreground font-semibold">{matchRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={config.variant} pulse={recon.status === 'IN_PROGRESS'}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                        {new Date(recon.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {recon.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Start reconciliation"
                              onClick={(e) => handleStart(e, recon.id)}
                              disabled={startReconciliation.isPending}
                              className="hover:text-green-400"
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
                              setActiveView('exceptions')
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
                              alert(`Quantum export for: ${recon.name}`)
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
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-neural shadow-glow-violet mb-4">
                  <FileStack className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-400 text-lg">
                  {reconciliations.length === 0
                    ? 'Initialize your first quantum reconciliation'
                    : 'No matches in the neural matrix'
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

      {/* Reconciliation Details Modal */}
      {showDetailsModal && selectedId && (
        <ReconciliationDetailsModal
          reconciliation={reconciliations.find((r) => r.id === selectedId)!}
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
