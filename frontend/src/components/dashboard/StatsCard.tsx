import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className="rounded-md bg-brand-50 p-3">
            <Icon className="h-6 w-6 text-brand-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { StatsCard }
