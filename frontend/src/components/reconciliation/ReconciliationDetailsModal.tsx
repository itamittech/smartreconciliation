import { X, CheckCircle2, Clock, XCircle, FileText, GitBranch } from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Reconciliation } from '@/services/types'
import type { KnowledgeDomain } from '@/services/types'

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' }
> = {
  COMPLETED: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  IN_PROGRESS: { icon: Clock, label: 'Processing', variant: 'info' },
  PENDING: { icon: Clock, label: 'Pending', variant: 'warning' },
  FAILED: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

interface ReconciliationDetailsModalProps {
  reconciliation: Reconciliation
  onClose: () => void
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

export function ReconciliationDetailsModal({ reconciliation, onClose }: ReconciliationDetailsModalProps) {
  const config = statusConfig[reconciliation.status] || statusConfig.PENDING
  const StatusIcon = config.icon

  const matchRate = reconciliation.matchRate != null
    ? reconciliation.matchRate.toFixed(1)
    : reconciliation.totalSourceRecords && reconciliation.matchedRecords
    ? ((reconciliation.matchedRecords / reconciliation.totalSourceRecords) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card variant="glass" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gradient-violet mb-2">
                {reconciliation.name}
              </h2>
              {reconciliation.description && (
                <p className="text-sm text-gray-400">{reconciliation.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="hover:bg-space-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Status and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge variant={config.variant} pulse={reconciliation.status === 'IN_PROGRESS'}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Domain</p>
              <Badge variant="secondary">
                {DOMAIN_LABELS[reconciliation.domain] ?? reconciliation.domain}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-mono text-foreground">
                {new Date(reconciliation.createdAt).toLocaleDateString()}
              </p>
            </div>
            {reconciliation.completedAt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Completed</p>
                <p className="text-sm font-mono text-foreground">
                  {new Date(reconciliation.completedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Match Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-space-900 border border-space-600">
                    <div
                      className={cn('h-full transition-all duration-500', {
                        'gradient-cyan shadow-glow-green': Number(matchRate) >= 95,
                        'gradient-violet shadow-glow-violet': Number(matchRate) >= 80 && Number(matchRate) < 95,
                        'gradient-pink shadow-glow-pink': Number(matchRate) < 80,
                      })}
                      style={{ width: `${matchRate}%` }}
                    />
                  </div>
                  <span className="text-lg font-mono font-bold text-foreground">{matchRate}%</span>
                </div>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Records</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {(reconciliation.totalSourceRecords || 0).toLocaleString()}
                </p>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Matched</p>
                <p className="text-lg font-mono font-bold text-cyan-400">
                  {(reconciliation.matchedRecords || 0).toLocaleString()}
                </p>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Exceptions</p>
                <p className="text-lg font-mono font-bold text-pink-400">
                  {(reconciliation.exceptionCount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Source Files */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Data Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl flex items-start gap-3">
                <div className="rounded-lg gradient-cyan p-2 shadow-glow-cyan">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Source File A</p>
                  <p className="text-sm font-mono text-cyan-400 truncate">
                    {reconciliation.sourceFileName || 'Source Matrix'}
                  </p>
                </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-start gap-3">
                <div className="rounded-lg gradient-violet p-2 shadow-glow-violet">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Source File B</p>
                  <p className="text-sm font-mono text-violet-400 truncate">
                    {reconciliation.targetFileName || 'Target Matrix'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rule Set */}
          {reconciliation.ruleSetName && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Rule Set
              </h3>
              <div className="glass p-4 rounded-xl flex items-start gap-3">
                <div className="rounded-lg gradient-pink p-2 shadow-glow-pink">
                  <GitBranch className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-mono text-foreground">
                    {reconciliation.ruleSetName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-space-600">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
