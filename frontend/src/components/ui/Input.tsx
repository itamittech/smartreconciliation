import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  glowOnFocus?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, glowOnFocus = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles - Quantum design
          'flex h-11 w-full rounded-lg border-2 border-space-600 bg-space-800 px-4 py-2.5 text-sm',
          'font-medium text-foreground',
          'placeholder:text-gray-500',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-violet-400',
          // Focus states with glow
          glowOnFocus
            ? 'focus-visible:outline-none focus-visible:border-violet-500 focus-visible:shadow-glow-violet'
            : 'focus-visible:outline-none focus-visible:border-violet-500',
          // Transitions
          'transition-all duration-300',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-space-900 disabled:text-gray-600 disabled:opacity-50',
          // Hover state
          'hover:border-space-500',
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
