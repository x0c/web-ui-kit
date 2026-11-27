import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Label } from '../primitives/label'

/** Label + control with optional trailing action, hint, and inline validation error. */
export function FormField({
  label,
  htmlFor,
  trailing,
  hint,
  error,
  className,
  srOnlyLabel,
  children,
}: {
  label: ReactNode
  htmlFor?: string
  trailing?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  className?: string
  srOnlyLabel?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <div className={cn('flex items-baseline justify-between gap-3', srOnlyLabel && 'sr-only')}>
        <Label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground/90">
          {label}
        </Label>
        {trailing && <div className="shrink-0 text-[13px]">{trailing}</div>}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
