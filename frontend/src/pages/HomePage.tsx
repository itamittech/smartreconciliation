import {
  FileStack,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Sparkles,
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
      {/* Welcome Banner with Product Value Proposition */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Smart Reconciliation</h2>
          </div>
          <p className="text-lg text-primary-foreground/90 mb-4 max-w-2xl">
            AI-Powered Financial Data Matching & Exception Management
          </p>
          <p className="text-sm text-primary-foreground/80 max-w-3xl">
            Automate complex reconciliations with intelligent matching algorithms.
            Reduce manual work by up to 90%, catch discrepancies in real-time, and leverage
            AI-powered insights to resolve exceptions faster than ever.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Automated Matching</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Exception Intelligence</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* Quick Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Today's Overview</h3>
        <p className="text-sm text-muted-foreground">
          Monitor your reconciliation performance and manage exceptions
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
