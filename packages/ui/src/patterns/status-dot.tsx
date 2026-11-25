import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

const dotTones: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground/50',
}

/** Semantic status dot + label: keeps colored accents strictly on live entity statuses. */
export function StatusDot({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-foreground', className)}>
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', dotTones[tone])} />
      <span>{children}</span>
    </span>
  )
}
