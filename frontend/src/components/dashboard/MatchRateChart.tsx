import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface MatchRateChartProps {
  data: { name: string; matchRate: number }[]
}

const getBarColor = (matchRate: number) => {
  if (matchRate >= 90) return '#10B981'
  if (matchRate >= 70) return '#F59E0B'
  return '#EF4444'
}

const MatchRateChart = ({ data }: MatchRateChartProps) => {
  const hasData = data.length > 0 && data.some((d) => d.matchRate > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Match Rate by Reconciliation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-neutral-500">
              No completed reconciliations yet.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#737373', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(v: string) =>
                    v.length > 12 ? `${v.slice(0, 12)}…` : v
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#737373', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  cursor={{ fill: '#F5F5F5' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${Number(value || 0).toFixed(1)}%`, 'Match Rate']}
                />
                <Bar dataKey="matchRate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.matchRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success-500" />
            ≥ 90% Good
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warning-500" />
            70–89% Fair
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-error-500" />
            &lt; 70% Poor
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export { MatchRateChart }
