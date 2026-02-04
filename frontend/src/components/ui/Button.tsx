import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - enhanced with brand guidelines
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variant styles
          {
            // Primary - Brand Blue (#4D65FF)
            'bg-[var(--color-brand-500)] text-white shadow-sm hover:bg-[var(--color-brand-600)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0':
              variant === 'default',

            // Destructive - Error color
            'bg-[var(--color-error-500)] text-white shadow-sm hover:bg-[var(--color-error-600)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0':
              variant === 'destructive',

            // Outline - Border with brand color
            'border-2 border-[var(--color-brand-200)] bg-white text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-300)]':
              variant === 'outline',

            // Secondary - Light brand tint
            'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)]':
              variant === 'secondary',

            // Ghost - Transparent with hover
            'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]':
              variant === 'ghost',

            // Link - Text only
            'text-[var(--color-brand-600)] underline-offset-4 hover:underline hover:text-[var(--color-brand-700)]':
              variant === 'link',

            // Accent - Purple for AI features
            'bg-[var(--color-accent-purple-500)] text-white shadow-sm hover:bg-[var(--color-accent-purple-600)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0':
              variant === 'accent',
          },
          // Size styles - enhanced spacing
          {
            'h-10 px-6 py-2.5 text-sm': size === 'default',
            'h-9 px-4 py-2 text-sm rounded-md': size === 'sm',
            'h-12 px-8 py-3 text-base rounded-lg': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
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
