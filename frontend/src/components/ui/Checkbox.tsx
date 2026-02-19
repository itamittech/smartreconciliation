import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              'peer h-5 w-5 shrink-0 rounded border-2 border-neutral-300 bg-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'checked:bg-brand-500 checked:border-brand-500',
              'transition-smooth',
              className
            )}
            {...props}
          />
          <Check
            className={cn(
              'absolute left-0.5 top-0.5 h-4 w-4 text-white pointer-events-none',
              'opacity-0 peer-checked:opacity-100 transition-opacity'
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-neutral-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
