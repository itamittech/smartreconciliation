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
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Banner with Product Value Proposition - Enhanced with brand guidelines */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-10 lg:p-12 text-white shadow-[var(--shadow-brand)]">
        {/* Background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Smart Reconciliation</h2>
          </div>
          <p className="text-xl lg:text-2xl text-white/95 mb-5 max-w-3xl font-medium">
            AI-Powered Financial Data Matching & Exception Management
          </p>
          <p className="text-base text-white/85 max-w-3xl leading-relaxed mb-8">
            Automate complex reconciliations with intelligent matching algorithms.
            Reduce manual work by up to 90%, catch discrepancies in real-time, and leverage
            AI-powered insights to resolve exceptions faster than ever.
          </p>

          {/* Feature badges with glassmorphism */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 shadow-lg transition-transform hover:scale-105">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Automated Matching</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 shadow-lg transition-transform hover:scale-105">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 shadow-lg transition-transform hover:scale-105">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold">Exception Intelligence</span>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs - refined */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Quick Overview - Enhanced typography */}
      <div>
        <h3 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-2">Today's Overview</h3>
        <p className="text-base text-[var(--color-neutral-600)]">
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
