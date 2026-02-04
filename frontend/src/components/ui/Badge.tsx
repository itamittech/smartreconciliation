import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'glow'
  pulse?: boolean
}

const Badge = ({ className, variant = 'default', pulse = false, ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all',
        // Variant styles with quantum colors
        {
          // Default - Electric Violet
          'bg-violet-500/20 text-violet-300 border border-violet-500/50': variant === 'default',

          // Secondary - Cyber Cyan
          'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50': variant === 'secondary',

          // Destructive - Neural Pink
          'bg-pink-500/20 text-pink-300 border border-pink-500/50': variant === 'destructive',

          // Outline - Subtle border
          'border border-gray-600 text-gray-300 bg-transparent': variant === 'outline',

          // Success - Quantum Green
          'bg-green-500/20 text-green-300 border border-green-500/50': variant === 'success',

          // Warning - Amber
          'bg-amber-500/20 text-amber-300 border border-amber-500/50': variant === 'warning',

          // Info - Cyan
          'bg-cyan-400/20 text-cyan-200 border border-cyan-400/50': variant === 'info',

          // Glow - With shadow glow
          'bg-violet-500/30 text-violet-200 border border-violet-400/70 shadow-glow-violet': variant === 'glow',
        },
        pulse && 'animate-pulse-glow',
        className
      )}
      {...props}
    />
  )
}

export { Badge }
