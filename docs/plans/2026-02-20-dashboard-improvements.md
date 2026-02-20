# Dashboard Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken dashboard chart and invisible Quick Actions text, and add a meaningful Exceptions Breakdown card using data already returned by the API.

**Architecture:** Three targeted changes to frontend components only — no backend changes needed. Replace `MatchRateChart` (broken line chart) with a bar chart driven by `recentReconciliations[].matchRate`. Add a new `ExceptionsBreakdown` component in the right column. Fix description text colour in `QuickActions` buttons.

**Tech Stack:** React 19, TypeScript, Recharts (already installed), Tailwind CSS v4, Lucide icons

---

### Task 1: Replace MatchRateChart with a Match Rate bar chart

The current `MatchRateChart` renders a flat meaningless line. Replace it with a `BarChart` showing each recent reconciliation's match rate on the Y-axis and the reconciliation name on the X-axis. Uses data that is already passed in via `recentReconciliations` from the dashboard metrics.

**Files:**
- Modify: `frontend/src/components/dashboard/MatchRateChart.tsx`
- Modify: `frontend/src/pages/HomePage.tsx` (update props passed to chart)

**Step 1: Update MatchRateChart to accept reconciliation-based data and render a bar chart**

Replace the entire content of `frontend/src/components/dashboard/MatchRateChart.tsx` with:

```tsx
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
  if (matchRate >= 90) return '#10B981' // success green
  if (matchRate >= 70) return '#F59E0B' // warning amber
  return '#EF4444'                       // error red
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Match Rate']}
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
        {/* Legend */}
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
```

**Step 2: Update HomePage.tsx to pass the right data to MatchRateChart**

In `frontend/src/pages/HomePage.tsx`:

1. Remove the old `chartData` / `defaultChartData` block (lines 41-95 approximately).
2. Add a new derived value before the `return`:

```tsx
// Build chart data from recent reconciliations (completed ones with a match rate)
const matchRateChartData = (metrics?.recentReconciliations ?? [])
  .filter((r) => r.matchRate != null)
  .map((r) => ({
    name: r.name,
    matchRate: r.matchRate ?? 0,
  }))
```

3. Update the `<MatchRateChart>` usage in the JSX:

```tsx
<MatchRateChart data={matchRateChartData} />
```

**Step 3: Verify TypeScript compiles**

```bash
cd frontend && node_modules/.bin/tsc --noEmit
```

Expected: no errors related to MatchRateChart or HomePage.

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/MatchRateChart.tsx frontend/src/pages/HomePage.tsx
git commit -m "fix: replace broken line chart with match rate bar chart per reconciliation"
```

---

### Task 2: Fix Quick Actions description text visibility

The `<p className="text-xs font-normal text-muted-foreground">` inside each button is neutral-500 gray, which is nearly invisible on the blue primary button and still faint on secondary buttons. Fix by changing the description paragraph to use the button's text colour with reduced opacity instead.

**Files:**
- Modify: `frontend/src/components/dashboard/QuickActions.tsx`

**Step 1: Update QuickActions.tsx**

Replace the inner `<p>` for description from:
```tsx
<p className="text-xs font-normal text-muted-foreground">
  {action.description}
</p>
```

to:
```tsx
<p className="text-xs font-normal opacity-70">
  {action.description}
</p>
```

`opacity-70` inherits the button's current text colour (white for primary, dark for secondary) and dims it to 70%, which is readable in both contexts.

Also update the `label` paragraph for clarity — give it a slightly stronger weight on secondary buttons by keeping it as-is (already `font-medium`). No change needed there.

**Step 2: Verify visually (dev server)**

```bash
cd frontend && npm run dev
```

Open http://localhost:5173, navigate to the dashboard. Confirm:
- "Start a new reconciliation" text is readable inside the blue "Upload Files" button
- Description text on secondary buttons is also clearly visible

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/QuickActions.tsx
git commit -m "fix: make Quick Actions description text visible on all button variants"
```

---

### Task 3: Add ExceptionsBreakdown component

Create a new `ExceptionsBreakdown` card that displays `exceptionsByType` (bar chart) and `exceptionsBySeverity` (coloured summary pills) from the dashboard metrics. Place it below `QuickActions` in the right column.

**Files:**
- Create: `frontend/src/components/dashboard/ExceptionsBreakdown.tsx`
- Modify: `frontend/src/components/dashboard/index.ts` (export new component)
- Modify: `frontend/src/pages/HomePage.tsx` (render in right column)

**Step 1: Create ExceptionsBreakdown.tsx**

```tsx
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
```

**Step 2: Export from dashboard index**

In `frontend/src/components/dashboard/index.ts`, add:
```ts
export { ExceptionsBreakdown } from './ExceptionsBreakdown'
```

**Step 3: Update HomePage.tsx to render ExceptionsBreakdown**

1. Import `ExceptionsBreakdown`:
```tsx
import {
  StatsCard,
  RecentReconciliations,
  MatchRateChart,
  QuickActions,
  ExceptionsBreakdown,
} from '@/components/dashboard'
```

2. In the right column (the `<div>` that currently only contains `<QuickActions />`), update to:
```tsx
<div className="space-y-6">
  <QuickActions />
  <ExceptionsBreakdown
    byType={metrics?.exceptionsByType ?? {}}
    bySeverity={metrics?.exceptionsBySeverity ?? {}}
    total={metrics?.totalExceptions ?? 0}
  />
</div>
```

**Step 4: Verify TypeScript compiles**

```bash
cd frontend && node_modules/.bin/tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add frontend/src/components/dashboard/ExceptionsBreakdown.tsx \
        frontend/src/components/dashboard/index.ts \
        frontend/src/pages/HomePage.tsx
git commit -m "feat: add ExceptionsBreakdown card showing exceptions by type and severity"
```

---

### Task 4: Final verification

**Step 1: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: build succeeds with no errors.

**Step 2: Run dev server and manual smoke-test**

```bash
cd frontend && npm run dev
```

Verify on http://localhost:5173:
- [ ] Dashboard chart shows "Match Rate by Reconciliation" with coloured bars (green/amber/red based on rate)
- [ ] Chart shows empty state message when no completed reconciliations exist
- [ ] Quick Actions: all description texts are readable (white + dimmed on blue button, dark + dimmed on secondary buttons)
- [ ] Right column shows Exceptions Breakdown below Quick Actions (or empty state if no exceptions)
- [ ] No console errors

**Step 3: Final commit if any lint fixes needed**

```bash
git add -p
git commit -m "chore: dashboard polish and lint fixes"
```
