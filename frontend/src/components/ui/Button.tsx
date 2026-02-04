import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent' | 'glass'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  glow?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', glow = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - Quantum design
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
          'transition-glow relative overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-40 disabled:grayscale',
          // Variant styles with glowing effects
          {
            // Primary - Electric Violet Gradient
            'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg hover:shadow-glow-violet hover:-translate-y-1 active:translate-y-0 active:shadow-md rounded-lg':
              variant === 'default',

            // Destructive - Neural Pink
            'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-glow-pink hover:-translate-y-1 active:translate-y-0 active:shadow-md rounded-lg':
              variant === 'destructive',

            // Outline - Glowing border
            'border-2 border-violet-500/50 bg-transparent text-violet-400 hover:bg-violet-500/10 hover:border-violet-400 hover:text-violet-300 hover:shadow-glow-violet rounded-lg':
              variant === 'outline',

            // Secondary - Cyber Cyan
            'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg hover:shadow-glow-cyan hover:-translate-y-1 active:translate-y-0 active:shadow-md rounded-lg':
              variant === 'secondary',

            // Ghost - Subtle hover
            'text-gray-300 hover:bg-space-750 hover:text-white rounded-lg':
              variant === 'ghost',

            // Link - Text with gradient
            'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 hover:from-violet-300 hover:to-cyan-300 underline-offset-4 hover:underline':
              variant === 'link',

            // Accent - Neural gradient
            'bg-gradient-to-br from-violet-500 via-cyan-500 to-pink-500 text-white shadow-lg hover:shadow-glow-violet hover:-translate-y-1 active:translate-y-0 active:shadow-md rounded-lg bg-[length:200%_200%] hover:bg-[position:100%_100%] transition-all duration-500':
              variant === 'accent',

            // Glass - Glassmorphism
            'glass text-white backdrop-blur-md hover:bg-space-750/80 hover:shadow-glow-violet rounded-lg':
              variant === 'glass',
          },
          // Size styles
          {
            'h-11 px-6 py-2.5 text-sm': size === 'default',
            'h-9 px-4 py-2 text-xs': size === 'sm',
            'h-14 px-8 py-3.5 text-base': size === 'lg',
            'h-11 w-11 p-0': size === 'icon',
          },
          // Optional extra glow
          glow && 'animate-pulse-glow',
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
