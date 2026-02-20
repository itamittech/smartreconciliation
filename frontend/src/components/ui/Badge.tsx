import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline' | 'secondary'
  pulse?: boolean // deprecated, kept for compatibility
}

const Badge = ({ className, variant = 'default', pulse, ...props }: BadgeProps) => {
  // Map old variants for backward compatibility
  const normalizedVariant = variant === 'secondary' ? 'info' : variant

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-smooth',
        // Variant styles - Professional
        {
          // Default - Neutral
          'bg-muted text-muted-foreground border border-border': normalizedVariant === 'default',

          // Success - Green
          'bg-success/10 text-success border border-success/20': normalizedVariant === 'success',

          // Warning - Amber
          'bg-warning/10 text-warning border border-warning/20': normalizedVariant === 'warning',

          // Destructive - Red
          'bg-destructive/10 text-destructive border border-destructive/20': normalizedVariant === 'destructive',

          // Info - Blue
          'bg-info/10 text-info border border-info/20': normalizedVariant === 'info',

          // Outline - Transparent
          'border border-border text-muted-foreground bg-transparent': normalizedVariant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
