import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'glow' | 'solid'
  glowColor?: 'violet' | 'cyan' | 'pink' | 'green'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glowColor = 'violet', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles - Quantum design
        'rounded-xl transition-glow overflow-hidden',
        // Variant styles
        {
          // Default - Solid dark card
          'bg-card border border-space-600 shadow-lg': variant === 'default',

          // Glass - Glassmorphism
          'glass shadow-xl': variant === 'glass',

          // Interactive - Hover with glow
          'bg-card border border-space-600 shadow-lg hover:shadow-glow-violet hover:-translate-y-1 hover:border-violet-500/50 cursor-pointer transition-all duration-300':
            variant === 'interactive',

          // Glow - Always glowing
          'bg-card border-2 shadow-xl': variant === 'glow',

          // Solid - Strong background
          'bg-space-750 border border-space-600 shadow-md': variant === 'solid',
        },
        // Glow color variants
        variant === 'glow' && {
          'border-violet-500/50 shadow-glow-violet': glowColor === 'violet',
          'border-cyan-500/50 shadow-glow-cyan': glowColor === 'cyan',
          'border-pink-500/50 shadow-glow-pink': glowColor === 'pink',
          'border-green-500/50 shadow-glow-green': glowColor === 'green',
        },
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold leading-tight tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-400 leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0 gap-4', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
