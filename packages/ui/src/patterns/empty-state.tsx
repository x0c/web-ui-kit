import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/** Centered empty or not-found state with optional icon, title, description, and action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  fullHeight = false,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  fullHeight?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid place-items-center px-6 py-12',
        fullHeight && 'min-h-svh',
        className,
      )}
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        {icon && (
          <div className="mb-4 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}
