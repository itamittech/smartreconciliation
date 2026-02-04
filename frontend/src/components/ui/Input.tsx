import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with brand guidelines
          'flex h-10 w-full rounded-lg border-2 border-[var(--color-neutral-300)] bg-white px-4 py-2.5 text-sm',
          'font-medium text-[var(--color-neutral-900)]',
          'placeholder:text-[var(--color-neutral-400)]',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-[var(--color-brand-600)]',
          // Focus states
          'focus-visible:outline-none focus-visible:border-[var(--color-brand-500)]',
          'focus-visible:ring-3 focus-visible:ring-[var(--color-brand-500)]/10',
          // Transitions
          'transition-all duration-200',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-neutral-400)]',
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
