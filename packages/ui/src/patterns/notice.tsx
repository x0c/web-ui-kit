import { CheckCircle2, CircleAlert, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type Tone = 'error' | 'success' | 'warning' | 'info'

const tones: Record<Tone, string> = {
  error: 'border-destructive/25 bg-destructive/[0.06] text-destructive [&_svg]:text-destructive',
  success: 'border-success/25 bg-success/[0.07] text-foreground [&_svg]:text-success',
  warning: 'border-warning/30 bg-warning/[0.08] text-foreground [&_svg]:text-warning',
  info: 'border-border bg-muted text-foreground [&_svg]:text-muted-foreground',
}

/** Inline status message placed at the affected form or content. */
export function Notice({
  tone = 'error',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? TriangleAlert : CircleAlert
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[13px] leading-5 [overflow-wrap:anywhere]',
        tones[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
