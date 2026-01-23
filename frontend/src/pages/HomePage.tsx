import {
  FileStack,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import {
  StatsCard,
  RecentReconciliations,
  MatchRateChart,
  QuickActions,
} from '@/components/dashboard'
import type { Reconciliation } from '@/types'

// Mock data for demonstration
const mockReconciliations: Reconciliation[] = [
  {
    id: '1',
    name: 'January Bank Statement',
    status: 'completed',
    sourceAName: 'Bank Statement',
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
]

const mockChartData = [
  { date: 'Jan 1', matchRate: 94, exceptions: 45 },
  { date: 'Jan 5', matchRate: 95, exceptions: 38 },
  { date: 'Jan 10', matchRate: 96, exceptions: 32 },
  { date: 'Jan 15', matchRate: 97, exceptions: 28 },
  { date: 'Jan 20', matchRate: 98, exceptions: 23 },
  { date: 'Jan 24', matchRate: 97.5, exceptions: 25 },
]

const HomePage = () => {
  const handleViewDetails = (id: string) => {
    console.log('View reconciliation:', id)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back, John</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your reconciliations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reconciliations"
          value={127}
          description="This month"
          icon={FileStack}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Match Rate"
          value="97.2%"
          description="Average accuracy"
          icon={CheckCircle2}
          trend={{ value: 2.3, isPositive: true }}
        />
        <StatsCard
          title="Pending Exceptions"
          value={23}
          description="Require attention"
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Processing"
          value={3}
          description="In progress"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MatchRateChart data={mockChartData} />
          <RecentReconciliations
            reconciliations={mockReconciliations}
            onViewDetails={handleViewDetails}
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

export { HomePage }
