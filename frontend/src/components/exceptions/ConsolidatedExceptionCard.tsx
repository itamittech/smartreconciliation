import { useState } from 'react'
import { AlertCircle, AlertTriangle, Check, ChevronDown, ChevronRight, Info, Sparkles, X } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'
import { cn } from '@/lib/utils'

export interface ConsolidatedExceptionItem {
  id: string
  type: ExceptionType
  severity: ExceptionSeverity
  status: ExceptionStatus
  details: string
  resolution?: string
  resolvedBy?: string
  fieldName?: string
  sourceValue?: string
  targetValue?: string
  aiSuggestion?: string
  createdAt: string
}

export interface ConsolidatedExceptionGroup {
  id: string
  reconciliationId: string
  reconciliationName: string
  sourceRecordId?: string
  targetRecordId?: string
  sourceData?: Record<string, unknown>
  targetData?: Record<string, unknown>
  exceptions: ConsolidatedExceptionItem[]
  aiSuggestions: string[]
  highlightedFields: string[]
  fieldSeverity: Record<string, ExceptionSeverity>
  highestSeverity: ExceptionSeverity
  status: ExceptionStatus
  latestAt: string
}

interface ConsolidatedExceptionCardProps {
  group: ConsolidatedExceptionGroup
  onResolve?: (id: string, action: 'accept' | 'reject' | 'investigate') => void
}

const typeLabels: Record<ExceptionType, string> = {
  MISSING_SOURCE: 'Missing in Source',
  MISSING_TARGET: 'Missing in Target',
  VALUE_MISMATCH: 'Value Mismatch',
  DUPLICATE: 'Duplicate',
  FORMAT_ERROR: 'Format Error',
  TOLERANCE_EXCEEDED: 'Tolerance Exceeded',
  POTENTIAL_MATCH: 'Potential Match',
}

const statusLabelMap: Record<ExceptionStatus, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  in_review: 'In Review',
  resolved: 'Resolved',
  ignored: 'Ignored',
}

const severityBadge = (severity: ExceptionSeverity) => {
  if (severity === 'critical') return { label: 'Critical', variant: 'destructive' as const }
  if (severity === 'warning') return { label: 'Warning', variant: 'warning' as const }
  return { label: 'Info', variant: 'secondary' as const }
}

const fieldHighlightClass = (severity: ExceptionSeverity | undefined) => {
  if (severity === 'critical') return 'border-destructive/40 bg-destructive/10'
  if (severity === 'warning') return 'border-warning/40 bg-warning/10'
  if (severity === 'info') return 'border-primary/30 bg-primary/5'
  return 'border-border/70'
}

const valueToString = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const RowDataPanel = ({
  title,
  rowData,
  recordId,
  highlightedFields,
  fieldSeverity,
}: {
  title: 'Source Row' | 'Target Row'
  rowData?: Record<string, unknown>
  recordId?: string
  highlightedFields: string[]
  fieldSeverity: Record<string, ExceptionSeverity>
}) => {
  const entries = Object.entries(rowData || {})
  const normalizedHighlighted = new Set(highlightedFields.map((f) => f.toLowerCase()))

  return (
    <div className="rounded-md border bg-background">
      <div className="border-b bg-muted/40 px-3 py-2">
        <p className="text-sm font-semibold">{title}</p>
        {recordId && (
          <p className="text-xs text-muted-foreground">
            Record ID: {recordId}
          </p>
        )}
      </div>
      <div className="max-h-72 overflow-auto p-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No row data available</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([field, value]) => {
              const normalizedField = field.toLowerCase()
              const isHighlighted = normalizedHighlighted.has(normalizedField)
              const severity = fieldSeverity[normalizedField]
              return (
                <div
                  key={field}
                  className={cn(
                    'rounded-md border px-3 py-2',
                    isHighlighted ? fieldHighlightClass(severity) : 'border-border/60'
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field}</p>
                  <p className="mt-0.5 break-all text-sm">{valueToString(value)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const ConsolidatedExceptionCard = ({ group, onResolve }: ConsolidatedExceptionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(group.status === 'open' || group.status === 'in_review')
  const highestSeverity = severityBadge(group.highestSeverity)
  const statusLabel = statusLabelMap[group.status]
  const openCount = group.exceptions.filter((ex) => ex.status === 'open').length

  const handleAction = (id: string, action: 'accept' | 'reject' | 'investigate') => {
    onResolve?.(id, action)
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={cn('h-1', {
          'bg-destructive': group.highestSeverity === 'critical',
          'bg-warning': group.highestSeverity === 'warning',
          'bg-muted': group.highestSeverity === 'info',
        })}
      />
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={highestSeverity.variant}>{highestSeverity.label}</Badge>
            <Badge variant="outline">{group.reconciliationName}</Badge>
            <Badge variant={group.status === 'open' ? 'outline' : 'secondary'}>
              {statusLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(group.latestAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {group.exceptions.length} issue{group.exceptions.length > 1 ? 's' : ''} in this row pair
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
          <div className="text-xs text-muted-foreground">
            Highlighted fields: {group.highlightedFields.length > 0 ? group.highlightedFields.join(', ') : 'None'}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse row group details' : 'Expand row group details'}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                Collapse
              </>
            ) : (
              <>
                <ChevronRight className="mr-1 h-3.5 w-3.5" />
                Expand
              </>
            )}
          </Button>
        </div>

        {isExpanded && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <RowDataPanel
                title="Source Row"
                rowData={group.sourceData}
                recordId={group.sourceRecordId}
                highlightedFields={group.highlightedFields}
                fieldSeverity={group.fieldSeverity}
              />
              <RowDataPanel
                title="Target Row"
                rowData={group.targetData}
                recordId={group.targetRecordId}
                highlightedFields={group.highlightedFields}
                fieldSeverity={group.fieldSeverity}
              />
            </div>

            <div className="rounded-md border bg-muted/20">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-semibold">Exceptions In This Row Group</p>
              </div>
              <div className="space-y-3 p-3">
                {group.exceptions.map((exception) => {
                  const severity = severityBadge(exception.severity)
                  const SeverityIcon =
                    exception.severity === 'critical'
                      ? AlertTriangle
                      : exception.severity === 'warning'
                        ? AlertCircle
                        : Info
                  return (
                    <div key={exception.id} className="rounded-md border bg-background p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityIcon
                            className={cn(
                              'h-4 w-4',
                              exception.severity === 'critical'
                                ? 'text-destructive'
                                : exception.severity === 'warning'
                                  ? 'text-warning'
                                  : 'text-muted-foreground'
                            )}
                          />
                          <Badge variant={severity.variant} className="text-xs">
                            {typeLabels[exception.type]}
                          </Badge>
                          {exception.fieldName && (
                            <Badge variant="outline" className="text-xs">
                              Field: {exception.fieldName}
                            </Badge>
                          )}
                          <Badge variant={exception.status === 'open' ? 'outline' : 'secondary'} className="text-xs">
                            {statusLabelMap[exception.status]}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exception.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{exception.details}</p>
                      {exception.resolution && (
                        <div className="mt-3 rounded-md border border-border bg-secondary/30 px-3 py-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            User Remarks
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">
                            {exception.resolution}
                          </p>
                          {exception.resolvedBy && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Entered by: {exception.resolvedBy}
                            </p>
                          )}
                        </div>
                      )}
                      {(exception.sourceValue || exception.targetValue) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {exception.sourceValue ?? '-'} <span className="mx-1">-&gt;</span> {exception.targetValue ?? '-'}
                        </p>
                      )}
                      {exception.status === 'open' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(exception.id, 'accept')}
                            aria-label={`Accept exception ${exception.id}`}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(exception.id, 'reject')}
                            aria-label={`Reject exception ${exception.id}`}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(exception.id, 'investigate')}
                            aria-label={`Investigate exception ${exception.id}`}
                          >
                            Investigate
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Analysis
          </div>
          {group.aiSuggestions.length > 0 ? (
            <div className="mt-2 space-y-2">
              {group.aiSuggestions.map((suggestion, index) => (
                <p key={`${group.id}-ai-${index}`} className="text-sm text-muted-foreground">
                  {suggestion}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No AI analysis available for this row group.
            </p>
          )}
          {openCount > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {openCount} open exception{openCount > 1 ? 's' : ''} still need action.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { ConsolidatedExceptionCard }

