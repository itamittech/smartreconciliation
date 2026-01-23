import { AlertTriangle, AlertCircle, Info, Sparkles, Check, X } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import type { ReconciliationException, ExceptionSeverity, ExceptionType } from '@/types'
import { cn } from '@/lib/utils'

interface ExceptionCardProps {
  exception: ReconciliationException
  onResolve?: (id: string, action: 'accept' | 'reject' | 'investigate') => void
}

const severityConfig: Record<
  ExceptionSeverity,
  { icon: typeof AlertTriangle; color: string; variant: 'destructive' | 'warning' | 'secondary' }
> = {
  critical: { icon: AlertTriangle, color: 'text-destructive', variant: 'destructive' },
  warning: { icon: AlertCircle, color: 'text-warning', variant: 'warning' },
  info: { icon: Info, color: 'text-muted-foreground', variant: 'secondary' },
}

const typeLabels: Record<ExceptionType, string> = {
  missing_source: 'Missing in Source',
  missing_target: 'Missing in Target',
  mismatch: 'Data Mismatch',
  duplicate: 'Duplicate Detected',
}

const ExceptionCard = ({ exception, onResolve }: ExceptionCardProps) => {
  const config = severityConfig[exception.severity]
  const SeverityIcon = config.icon

  const handleAction = (action: 'accept' | 'reject' | 'investigate') => {
    onResolve?.(exception.id, action)
  }

  return (
    <Card className="overflow-hidden">
      <div className={cn('h-1', {
        'bg-destructive': exception.severity === 'critical',
        'bg-warning': exception.severity === 'warning',
        'bg-muted': exception.severity === 'info',
      })} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5 rounded-full p-1.5', {
              'bg-destructive/10': exception.severity === 'critical',
              'bg-warning/10': exception.severity === 'warning',
              'bg-secondary': exception.severity === 'info',
            })}>
              <SeverityIcon className={cn('h-4 w-4', config.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={config.variant} className="text-xs">
                  {typeLabels[exception.type]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(exception.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 font-medium">{exception.details}</p>
              {exception.sourceRecordId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Source ID: {exception.sourceRecordId}
                </p>
              )}
            </div>
          </div>
          <Badge variant={exception.status === 'open' ? 'outline' : 'secondary'}>
            {exception.status}
          </Badge>
        </div>

        {exception.aiSuggestion && (
          <div className="mt-4 rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestion
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {exception.aiSuggestion}
            </p>
          </div>
        )}

        {exception.status === 'open' && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction('accept')}
              aria-label="Accept suggestion"
            >
              <Check className="mr-1 h-3 w-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('reject')}
              aria-label="Reject suggestion"
            >
              <X className="mr-1 h-3 w-3" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('investigate')}
              aria-label="Investigate further"
            >
              Investigate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ExceptionCard }
