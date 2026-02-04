import {
  FileStack,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  Brain,
  Activity,
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
          <Loader2 className="h-10 w-10 animate-spin text-violet-400 glow-violet" />
          <p className="text-gray-400">Initializing quantum interface...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center glass p-8 rounded-2xl max-w-md">
          <AlertCircle className="h-12 w-12 text-pink-500" />
          <div>
            <p className="font-semibold text-lg text-foreground">Neural Network Offline</p>
            <p className="text-gray-400 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unable to connect to quantum backend'}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Verify backend is running on http://localhost:8080
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
    <div className="space-y-8 p-6 lg:p-8 relative">
      {/* Animated particle background */}
      <div className="fixed inset-0 particles pointer-events-none" />

      {/* Welcome Banner - Quantum hero section */}
      <div className="relative overflow-hidden rounded-2xl gradient-quantum animate-gradient p-10 lg:p-12 text-white shadow-glow-violet">
        {/* Neural network pattern background */}
        <div className="absolute inset-0 neural-lines opacity-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl glass border-2 border-white/30 shadow-glow-violet animate-pulse-glow">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Quantum Intelligence</h2>
              <p className="text-sm text-white/80 font-mono">Neural Reconciliation System v1.0</p>
            </div>
          </div>
          <p className="text-xl lg:text-2xl text-white/95 mb-5 max-w-3xl font-medium">
            AI-Powered Financial Data Matching & Neural Exception Management
          </p>
          <p className="text-base text-white/85 max-w-3xl leading-relaxed mb-8">
            Harness quantum algorithms and neural networks to automate complex reconciliations.
            Reduce manual processing by 90%, detect anomalies in real-time, and leverage
            AI intelligence to resolve exceptions with unprecedented speed.
          </p>

          {/* Feature badges with glowing effects */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 glass border border-white/30 rounded-xl px-5 py-3 shadow-glow-violet transition-all hover:scale-105 hover:shadow-glow-cyan">
              <Brain className="h-5 w-5" />
              <span className="text-sm font-semibold">Neural Matching</span>
            </div>
            <div className="flex items-center gap-2.5 glass border border-white/30 rounded-xl px-5 py-3 shadow-glow-cyan transition-all hover:scale-105 hover:shadow-glow-violet">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-semibold">Live Analytics</span>
            </div>
            <div className="flex items-center gap-2.5 glass border border-white/30 rounded-xl px-5 py-3 shadow-glow-pink transition-all hover:scale-105 hover:shadow-glow-green">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-semibold">Quantum Intelligence</span>
            </div>
          </div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl animate-pulse-glow delay-500" />
      </div>

      {/* Quick Overview */}
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-gradient-violet mb-2">Neural Command Center</h3>
        <p className="text-base text-gray-400">
          Real-time quantum reconciliation metrics and exception intelligence
        </p>
      </div>

      {/* Stats Grid with staggered animation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        <div className="animate-float delay-100">
          <StatsCard
            title="Total Reconciliations"
            value={metrics?.totalReconciliations ?? 0}
            description={`${metrics?.completedReconciliations ?? 0} completed`}
            icon={FileStack}
          />
        </div>
        <div className="animate-float delay-200">
          <StatsCard
            title="Match Rate"
            value={metrics?.overallMatchRate ? `${metrics.overallMatchRate.toFixed(1)}%` : '—'}
            description="Neural accuracy"
            icon={CheckCircle2}
          />
        </div>
        <div className="animate-float delay-300">
          <StatsCard
            title="Open Exceptions"
            value={metrics?.openExceptions ?? 0}
            description="Require analysis"
            icon={AlertTriangle}
          />
        </div>
        <div className="animate-float delay-400">
          <StatsCard
            title="Processing"
            value={metrics?.pendingReconciliations ?? 0}
            description="Active quantum tasks"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
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
