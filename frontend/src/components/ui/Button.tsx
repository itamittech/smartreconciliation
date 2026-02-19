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
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
          // Variant styles
          {
            // Primary - Professional blue (also handles 'default' for backward compat)
            'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-brand rounded-md':
              normalizedVariant === 'primary',

            // Secondary - Neutral with border (also handles 'outline' for backward compat)
            'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border-2 border-neutral-300 rounded-md':
              normalizedVariant === 'secondary',

            // Ghost - Subtle
            'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-md':
              normalizedVariant === 'ghost',

            // Destructive - Red
            'bg-error-500 text-white hover:bg-error-600 shadow-sm rounded-md':
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
