import * as React from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
}

const SIZES: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
}

export const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) => cn(BASE, VARIANTS[variant], SIZES[size], className)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button className={buttonVariants({ variant, size, className })} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { Button }
