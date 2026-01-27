import {
  FileStack,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  StatsCard,
  RecentReconciliations,
  MatchRateChart,
  QuickActions,
} from '@/components/dashboard'
import { useDashboardMetrics } from '@/services/hooks'
import type { Reconciliation } from '@/types'

// Transform backend reconciliation summary to frontend format
function transformReconciliation(
  summary: { id: number; name: string; status: string; matchRate: number; exceptionCount: number; createdAt: string }
): Reconciliation {
  return {
    id: summary.id.toString(),
    name: summary.name,
    status: summary.status.toLowerCase() as 'pending' | 'processing' | 'completed' | 'failed',
    sourceAName: 'Source',
    sourceBName: 'Target',
    totalRecords: 0,
    matchedRecords: 0,
    exceptions: summary.exceptionCount,
    createdAt: summary.createdAt,
    completedAt: summary.status === 'COMPLETED' ? summary.createdAt : undefined,
  }
}

// Placeholder chart data when no real data available
const defaultChartData = [
  { date: 'Day 1', matchRate: 0, exceptions: 0 },
  { date: 'Day 2', matchRate: 0, exceptions: 0 },
  { date: 'Day 3', matchRate: 0, exceptions: 0 },
]

const HomePage = () => {
  const { data: metricsResponse, isLoading, isError, error } = useDashboardMetrics()
  const metrics = metricsResponse?.data

  const handleViewDetails = (id: string) => {
    console.log('View reconciliation:', id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-semibold text-lg">Failed to load dashboard</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unable to connect to backend API'}
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Make sure the backend is running on http://localhost:8080
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Transform recent reconciliations for the component
  const recentReconciliations = metrics?.recentReconciliations?.map(transformReconciliation) || []

  // Build chart data from exceptions breakdown
  const chartData = metrics?.exceptionsByType
    ? Object.entries(metrics.exceptionsByType).map(([type, count]) => ({
        date: type.replace('_', ' '),
        matchRate: metrics.overallMatchRate || 0,
        exceptions: count,
      }))
    : defaultChartData

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your reconciliations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reconciliations"
          value={metrics?.totalReconciliations ?? 0}
          description={`${metrics?.completedReconciliations ?? 0} completed`}
          icon={FileStack}
        />
        <StatsCard
          title="Match Rate"
          value={metrics?.overallMatchRate ? `${metrics.overallMatchRate.toFixed(1)}%` : '—'}
          description="Average accuracy"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Open Exceptions"
          value={metrics?.openExceptions ?? 0}
          description="Require attention"
          icon={AlertTriangle}
        />
        <StatsCard
          title="In Progress"
          value={metrics?.pendingReconciliations ?? 0}
          description="Processing"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MatchRateChart data={chartData.length > 0 ? chartData : defaultChartData} />
          <RecentReconciliations
            reconciliations={recentReconciliations}
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
