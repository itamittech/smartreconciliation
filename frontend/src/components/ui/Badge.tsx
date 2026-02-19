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
          'bg-neutral-100 text-neutral-700 border border-neutral-300': normalizedVariant === 'default',

          // Success - Green
          'bg-success-50 text-success-700 border border-success-200': normalizedVariant === 'success',

          // Warning - Amber
          'bg-warning-50 text-warning-700 border border-warning-200': normalizedVariant === 'warning',

          // Destructive - Red
          'bg-error-50 text-error-700 border border-error-200': normalizedVariant === 'destructive',

          // Info - Blue (also handles 'secondary' for backward compat)
          'bg-info-50 text-info-700 border border-info-200': normalizedVariant === 'info',

          // Outline - Transparent
          'border border-neutral-300 text-neutral-700 bg-transparent': normalizedVariant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
