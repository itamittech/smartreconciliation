import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'glass' // 'glass' deprecated, maps to 'elevated'
  glowColor?: string // deprecated, kept for compatibility
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glowColor, ...props }, ref) => {
    // Map old variants for backward compatibility
    const normalizedVariant = variant === 'glass' ? 'elevated' : variant

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles - Professional
          'rounded-lg transition-smooth overflow-hidden',
          // Variant styles
          {
            // Default - Clean card
            'bg-card border border-border shadow-sm': normalizedVariant === 'default',

            // Elevated - More prominent shadow
            'bg-card border border-border shadow-md': normalizedVariant === 'elevated',

            // Interactive - Hover effect
            'bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer':
              normalizedVariant === 'interactive',
          },
          className
        )}
        {...props}
      />
    )
  }
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
        'text-xl font-semibold leading-tight tracking-tight text-card-foreground',
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
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
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
