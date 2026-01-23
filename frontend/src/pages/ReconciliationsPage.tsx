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
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components/ui'
import type { Reconciliation, ReconciliationStatus } from '@/types'
import { cn } from '@/lib/utils'

// Mock data
const mockReconciliations: Reconciliation[] = [
  {
    id: '1',
    name: 'January Bank Statement',
    status: 'completed',
    sourceAName: 'Bank Statement CSV',
    sourceBName: 'Accounting System',
    totalRecords: 2847,
    matchedRecords: 2789,
    exceptions: 58,
    createdAt: '2026-01-20T10:30:00Z',
    completedAt: '2026-01-20T10:35:00Z',
  },
  {
    id: '2',
    name: 'Q4 Invoice Reconciliation',
    status: 'processing',
    sourceAName: 'Invoice System',
    sourceBName: 'Payment Gateway',
    totalRecords: 5234,
    matchedRecords: 4102,
    exceptions: 0,
    createdAt: '2026-01-23T14:00:00Z',
  },
  {
    id: '3',
    name: 'Payroll vs HR Records',
    status: 'completed',
    sourceAName: 'Payroll System',
    sourceBName: 'HR Database',
    totalRecords: 450,
    matchedRecords: 448,
    exceptions: 2,
    createdAt: '2026-01-19T09:00:00Z',
    completedAt: '2026-01-19T09:05:00Z',
  },
  {
    id: '4',
    name: 'Inventory Count',
    status: 'pending',
    sourceAName: 'Warehouse System',
    sourceBName: 'ERP',
    totalRecords: 12500,
    matchedRecords: 0,
    exceptions: 0,
    createdAt: '2026-01-24T08:00:00Z',
  },
  {
    id: '5',
    name: 'Failed Import Test',
    status: 'failed',
    sourceAName: 'Test File',
    sourceBName: 'Database',
    totalRecords: 100,
    matchedRecords: 0,
    exceptions: 0,
    createdAt: '2026-01-22T16:00:00Z',
  },
]

const statusConfig: Record<
  ReconciliationStatus,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  completed: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  processing: { icon: Clock, label: 'Processing', variant: 'warning' },
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

const ReconciliationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredReconciliations = mockReconciliations.filter((recon) => {
    const matchesSearch = recon.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || recon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleNewReconciliation = () => {
    console.log('Create new reconciliation')
  }

  const handleRowClick = (id: string) => {
    setSelectedId(id === selectedId ? null : id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick(id)
    }
  }

  const getMatchRate = (recon: Reconciliation) => {
    if (recon.totalRecords === 0) return 0
    return ((recon.matchedRecords / recon.totalRecords) * 100).toFixed(1)
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
                  const config = statusConfig[recon.status]
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
                          <span className="font-medium">{recon.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{recon.sourceAName}</p>
                          <p className="text-muted-foreground">vs {recon.sourceBName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{recon.totalRecords.toLocaleString()} total</p>
                          <p className="text-muted-foreground">
                            {recon.exceptions} exceptions
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
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Delete:', recon.id)
                            }}
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
                <p className="mt-2 text-muted-foreground">No reconciliations found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export { ReconciliationsPage }
