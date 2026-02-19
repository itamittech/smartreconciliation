import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './Label'

export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

const FormField = ({ label, error, required, children, className }: FormFieldProps) => (
  <div className={cn('space-y-2', className)}>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {error && <p className="text-sm text-error-600 mt-1">{error}</p>}
  </div>
)

export { FormField }
