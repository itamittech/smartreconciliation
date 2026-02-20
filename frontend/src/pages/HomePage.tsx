import {
  FileStack,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
  BarChart3,
  Zap,
  Shield,
  Activity,
} from 'lucide-react'
import {
  StatsCard,
  RecentReconciliations,
  MatchRateChart,
  QuickActions,
  ExceptionsBreakdown,
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
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center bg-card border border-border shadow-md p-8 rounded-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-semibold text-lg text-foreground">Connection Error</p>
            <p className="text-muted-foreground text-sm mt-2">
              {error instanceof Error ? error.message : 'Unable to connect to backend'}
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Verify backend is running on http://localhost:8080
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Transform recent reconciliations for the component
  const recentReconciliations = metrics?.recentReconciliations?.map(transformReconciliation) || []

  // Build chart data from recent reconciliations (completed ones with a match rate)
  const matchRateChartData = (metrics?.recentReconciliations ?? [])
    .filter((r) => r.matchRate != null)
    .map((r) => ({
      name: r.name,
      matchRate: r.matchRate ?? 0,
    }))

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Banner - Professional hero section */}
      <div className="rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary shadow-sm">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-foreground">Smart Reconciliation</h2>
            <p className="text-sm text-muted-foreground font-medium">Professional Platform v1.0</p>
          </div>
        </div>
        <p className="text-xl text-foreground mt-2 font-medium">
          AI-Powered Financial Data Reconciliation
        </p>
        <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-2xl">
          Automate complex reconciliations, detect discrepancies, and resolve
          exceptions faster with intelligent AI assistance.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-md px-5 py-3 shadow-sm transition-smooth hover:shadow-md">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Secure Matching</span>
          </div>
          <div className="flex items-center gap-2.5 bg-card border border-success/20 rounded-md px-5 py-3 shadow-sm transition-smooth hover:shadow-md">
            <Activity className="h-5 w-5 text-success" />
            <span className="text-sm font-semibold text-foreground">Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-2.5 bg-card border border-info/20 rounded-md px-5 py-3 shadow-sm transition-smooth hover:shadow-md">
            <Zap className="h-5 w-5 text-info" />
            <span className="text-sm font-semibold text-foreground">AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">Overview</h3>
        <p className="text-base text-muted-foreground">
          Real-time reconciliation metrics and exception tracking
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
          description="Overall accuracy"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Open Exceptions"
          value={metrics?.openExceptions ?? 0}
          description="Require attention"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Processing"
          value={metrics?.pendingReconciliations ?? 0}
          description="Active tasks"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MatchRateChart data={matchRateChartData} />
          <RecentReconciliations
            reconciliations={recentReconciliations}
            onViewDetails={handleViewDetails}
          />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <ExceptionsBreakdown
            byType={metrics?.exceptionsByType ?? {}}
            bySeverity={metrics?.exceptionsBySeverity ?? {}}
            total={metrics?.totalExceptions ?? 0}
          />
        </div>
      </div>
    </div>
  )
}

export { HomePage }
