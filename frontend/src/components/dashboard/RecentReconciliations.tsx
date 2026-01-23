import { FileStack, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import type { Reconciliation, ReconciliationStatus } from '@/types'

interface RecentReconciliationsProps {
  reconciliations: Reconciliation[]
  onViewDetails?: (id: string) => void
}

const statusConfig: Record<
  ReconciliationStatus,
  { icon: typeof CheckCircle2; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  completed: { icon: CheckCircle2, label: 'Completed', variant: 'success' },
  processing: { icon: Clock, label: 'Processing', variant: 'warning' },
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' },
}

const RecentReconciliations = ({
  reconciliations,
  onViewDetails,
}: RecentReconciliationsProps) => {
  const handleClick = (id: string) => {
    onViewDetails?.(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileStack className="h-5 w-5" />
          Recent Reconciliations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reconciliations.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No reconciliations yet. Start by uploading your data files.
            </p>
          ) : (
            reconciliations.map((recon) => {
              const config = statusConfig[recon.status]
              const StatusIcon = config.icon

              return (
                <div
                  key={recon.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClick(recon.id)}
                  onKeyDown={(e) => handleKeyDown(e, recon.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  aria-label={`View ${recon.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-secondary p-2">
                      <FileStack className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{recon.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {recon.sourceAName} vs {recon.sourceBName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {recon.matchedRecords}/{recon.totalRecords}
                      </p>
                      <p className="text-xs text-muted-foreground">matched</p>
                    </div>
                    <Badge variant={config.variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { RecentReconciliations }
