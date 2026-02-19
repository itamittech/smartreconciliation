import { Search, SlidersHorizontal } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import type { ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'

interface ExceptionFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedReconciliationId: string
  reconciliationOptions: Array<{ id: string; name: string }>
  onReconciliationChange: (reconciliationId: string) => void
  selectedSeverity: ExceptionSeverity | 'all'
  onSeverityChange: (severity: ExceptionSeverity | 'all') => void
  selectedStatus: ExceptionStatus | 'all'
  onStatusChange: (status: ExceptionStatus | 'all') => void
  selectedType: ExceptionType | 'all'
  onTypeChange: (type: ExceptionType | 'all') => void
}

const severityOptions: { value: ExceptionSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

const statusOptions: { value: ExceptionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'ignored', label: 'Ignored' },
]

const typeOptions: { value: ExceptionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'missing_source', label: 'Missing Source' },
  { value: 'missing_target', label: 'Missing Target' },
  { value: 'mismatch', label: 'Mismatch' },
  { value: 'duplicate', label: 'Duplicate' },
]

const ExceptionFilters = ({
  searchQuery,
  onSearchChange,
  selectedReconciliationId,
  reconciliationOptions,
  onReconciliationChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
}: ExceptionFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search exceptions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search exceptions"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={selectedReconciliationId}
          onChange={(e) => onReconciliationChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by reconciliation"
        >
          <option value="all">All Reconciliations</option>
          {reconciliationOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => onSeverityChange(e.target.value as ExceptionSeverity | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by severity"
        >
          {severityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as ExceptionStatus | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by status"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as ExceptionType | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by type"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button variant="outline" size="icon" aria-label="More filters">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { ExceptionFilters }
