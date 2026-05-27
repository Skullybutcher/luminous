import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'danger'

export interface LuminaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-primary-foreground font-semibold',
    'shadow-[0_0_12px_rgba(37,99,235,0.35)]',
    'hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-primary/50',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-muted border border-border',
    'hover:bg-bg-elevated hover:text-text-primary hover:border-white/10',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-primary/30',
  ].join(' '),
  danger: [
    'bg-danger/10 text-danger border border-danger/25 font-semibold',
    'hover:bg-danger hover:text-white hover:border-danger',
    'active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-danger/50',
  ].join(' '),
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-xl gap-2',
}

export const LuminaButton = forwardRef<HTMLButtonElement, LuminaButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LuminaButton.displayName = 'LuminaButton'
