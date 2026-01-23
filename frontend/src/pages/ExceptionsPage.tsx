import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ExceptionCard, ExceptionFilters } from '@/components/exceptions'
import type { ReconciliationException, ExceptionSeverity, ExceptionStatus, ExceptionType } from '@/types'

// Mock data
const mockExceptions: ReconciliationException[] = [
  {
    id: '1',
    reconciliationId: 'recon-1',
    type: 'mismatch',
    severity: 'critical',
    status: 'open',
    sourceRecordId: 'INV-4521',
    targetRecordId: 'PAY-8832',
    details: 'Invoice #4521 ($1,500.00) has amount mismatch with payment ($1,450.00)',
    aiSuggestion: 'The $50 difference matches a discount code "SAVE50" applied at checkout. Suggest accepting this as a valid match.',
    createdAt: '2026-01-23T14:30:00Z',
  },
  {
    id: '2',
    reconciliationId: 'recon-1',
    type: 'missing_target',
    severity: 'critical',
    status: 'open',
    sourceRecordId: 'INV-4522',
    details: 'Invoice #4522 ($2,340.00) has no matching payment record',
    aiSuggestion: 'Found 3 payments totaling $2,340 on the same date. These likely combine to match this invoice.',
    createdAt: '2026-01-23T14:32:00Z',
  },
  {
    id: '3',
    reconciliationId: 'recon-1',
    type: 'duplicate',
    severity: 'warning',
    status: 'open',
    sourceRecordId: 'TXN-9901',
    details: 'Duplicate transaction detected: TXN-9901 appears twice with same amount ($750.00)',
    aiSuggestion: 'This appears to be a system error. The second entry was created within 1 second of the first. Recommend removing the duplicate.',
    createdAt: '2026-01-23T14:35:00Z',
  },
  {
    id: '4',
    reconciliationId: 'recon-1',
    type: 'mismatch',
    severity: 'warning',
    status: 'open',
    sourceRecordId: 'INV-4530',
    details: 'Date mismatch: Invoice date (Jan 15) differs from payment date (Jan 17)',
    aiSuggestion: 'The 2-day difference is within the normal payment processing window. Suggest accepting with date tolerance.',
    createdAt: '2026-01-23T14:40:00Z',
  },
  {
    id: '5',
    reconciliationId: 'recon-2',
    type: 'missing_source',
    severity: 'info',
    status: 'resolved',
    targetRecordId: 'PAY-9012',
    details: 'Payment PAY-9012 ($125.00) has no matching source record',
    createdAt: '2026-01-22T10:00:00Z',
  },
  {
    id: '6',
    reconciliationId: 'recon-1',
    type: 'mismatch',
    severity: 'critical',
    status: 'open',
    sourceRecordId: 'INV-4599',
    details: 'Currency mismatch: Invoice in USD, payment recorded in EUR',
    aiSuggestion: 'Based on the exchange rate on the transaction date, the amounts match when converted. Suggest accepting with currency conversion note.',
    createdAt: '2026-01-23T15:00:00Z',
  },
]

const ExceptionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<ExceptionSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ExceptionStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ExceptionType | 'all'>('all')
  const [exceptions, setExceptions] = useState(mockExceptions)

  const filteredExceptions = exceptions.filter((ex) => {
    const matchesSearch = ex.details.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = selectedSeverity === 'all' || ex.severity === selectedSeverity
    const matchesStatus = selectedStatus === 'all' || ex.status === selectedStatus
    const matchesType = selectedType === 'all' || ex.type === selectedType
    return matchesSearch && matchesSeverity && matchesStatus && matchesType
  })

  const openCount = exceptions.filter((e) => e.status === 'open').length
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && e.status === 'open').length

  const handleResolve = (id: string, action: 'accept' | 'reject' | 'investigate') => {
    console.log('Resolve exception:', id, action)
    if (action === 'accept') {
      setExceptions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'resolved' as ExceptionStatus } : e))
      )
    }
  }

  const handleBulkAccept = () => {
    const highConfidence = exceptions.filter(
      (e) => e.status === 'open' && e.aiSuggestion
    )
    setExceptions((prev) =>
      prev.map((e) =>
        highConfidence.some((hc) => hc.id === e.id)
          ? { ...e, status: 'resolved' as ExceptionStatus }
          : e
      )
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Exception Queue</h2>
            <p className="text-sm text-muted-foreground">
              Review and resolve reconciliation exceptions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkAccept}>
              <Sparkles className="mr-2 h-4 w-4" />
              Accept All AI Suggestions
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exceptions.length - openCount}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <ExceptionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSeverity={selectedSeverity}
            onSeverityChange={setSelectedSeverity}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
      </div>

      {/* Exception List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {filteredExceptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <p className="mt-2 font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No exceptions match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredExceptions.map((exception) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onResolve={handleResolve}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export { ExceptionsPage }
