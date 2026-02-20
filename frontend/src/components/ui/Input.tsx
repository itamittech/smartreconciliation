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
          'flex h-11 w-full rounded-md border-2 border-border bg-card px-4 py-2 text-sm',
          'font-medium text-foreground',
          'placeholder:text-muted-foreground',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-primary',
          // Focus states
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10',
          // Transitions
          'transition-smooth',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50',
          // Hover state
          'hover:border-primary/30',
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
