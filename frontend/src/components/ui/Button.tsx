import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  glow?: boolean // deprecated, kept for compatibility
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', glow, ...props }, ref) => {
    // Map old variants to new ones for backward compatibility
    const normalizedVariant = variant === 'default' ? 'primary' : variant === 'outline' ? 'secondary' : variant

    return (
      <button
        className={cn(
          // Base styles - Professional
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
          'transition-smooth relative overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
          // Variant styles
          {
            // Primary - Brand color
            'bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-md':
              normalizedVariant === 'primary',

            // Secondary - Neutral with border
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-border rounded-md':
              normalizedVariant === 'secondary',

            // Ghost - Subtle
            'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md':
              normalizedVariant === 'ghost',

            // Destructive - Red
            'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm rounded-md':
              normalizedVariant === 'destructive',
          },
          // Size styles
          {
            'h-11 px-6 py-2.5 text-sm': size === 'default',
            'h-9 px-4 py-2 text-xs': size === 'sm',
            'h-14 px-8 py-3.5 text-base': size === 'lg',
            'h-11 w-11 p-0': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
