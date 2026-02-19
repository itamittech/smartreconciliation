import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles - Professional
          'flex h-11 w-full rounded-md border-2 border-neutral-300 bg-white px-4 py-2 text-sm',
          'font-medium text-neutral-900',
          'placeholder:text-neutral-500',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-brand-600',
          // Focus states
          'focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100',
          // Transitions
          'transition-smooth',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 disabled:opacity-50',
          // Hover state
          'hover:border-neutral-400',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
