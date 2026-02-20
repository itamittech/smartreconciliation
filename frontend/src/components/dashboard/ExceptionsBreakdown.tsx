import { AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface ExceptionsBreakdownProps {
  byType: Record<string, number>
  bySeverity: Record<string, number>
  total: number
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:     { label: 'High',     color: 'text-error-700',   bg: 'bg-error-50'   },
  MEDIUM:   { label: 'Medium',   color: 'text-warning-700', bg: 'bg-warning-50' },
  LOW:      { label: 'Low',      color: 'text-info-700',    bg: 'bg-info-50'    },
  CRITICAL: { label: 'Critical', color: 'text-error-700',   bg: 'bg-error-50'   },
}

const typeLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const ExceptionsBreakdown = ({ byType, bySeverity, total }: ExceptionsBreakdownProps) => {
  const typeEntries = Object.entries(byType).sort(([, a], [, b]) => b - a)
  const severityEntries = Object.entries(bySeverity).sort(([, a], [, b]) => b - a)
  const maxCount = typeEntries[0]?.[1] ?? 1

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Exceptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-neutral-500">
            No exceptions found.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning-500" />
          Exceptions Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* By Type — horizontal bar rows */}
        {typeEntries.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              By Type
            </p>
            <div className="space-y-2">
              {typeEntries.map(([type, count]) => (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">{typeLabel(type)}</span>
                    <span className="font-semibold text-neutral-900">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100">
                    <div
                      className="h-1.5 rounded-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Severity — pill badges */}
        {severityEntries.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              By Severity
            </p>
            <div className="flex flex-wrap gap-2">
              {severityEntries.map(([severity, count]) => {
                const cfg = severityConfig[severity] ?? {
                  label: severity,
                  color: 'text-neutral-700',
                  bg: 'bg-neutral-100',
                }
                return (
                  <div
                    key={severity}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                  >
                    <span>{cfg.label}</span>
                    <span className="rounded-sm bg-white/60 px-1">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ExceptionsBreakdown }
