import { cn } from '../lib/utils'
import { Skeleton } from '../primitives/skeleton'

export type PageSkeletonVariant = 'overview' | 'table' | 'list' | 'detail'

export interface PageSkeletonProps {
  /** Structural layout matching the eventual loaded view to minimize layout shift. */
  variant?: PageSkeletonVariant
  /** Number of list/table placeholder rows (default 4 for list/overview, 5 for table). */
  rows?: number
  /** Show top PageHeader placeholder (title + trailing action). */
  showHeader?: boolean
  /** Accessible status label announced once for the loading region. */
  label?: string
  className?: string
}

const TABLE_COL_WIDTHS = [
  ['w-24', 'w-36', 'w-16', 'w-14', 'w-12'],
  ['w-20', 'w-44', 'w-20', 'w-12', 'w-12'],
  ['w-28', 'w-32', 'w-16', 'w-16', 'w-12'],
  ['w-24', 'w-40', 'w-20', 'w-10', 'w-12'],
  ['w-20', 'w-36', 'w-16', 'w-14', 'w-12'],
] as const

const LIST_TITLE_WIDTHS = ['w-36', 'w-44', 'w-32', 'w-40', 'w-36'] as const
const LIST_META_WIDTHS = ['w-56', 'w-48', 'w-60', 'w-44', 'w-52'] as const

function HeaderSkeleton() {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
      <div className="space-y-2">
        <Skeleton className="h-[28px] w-44" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  )
}

function MetricStripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card">
      <div className="-mr-px -mb-px grid grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="min-w-0 border-r border-b border-border bg-card px-4 py-4 sm:px-5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-[28px] w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}

function InsetListSkeleton({ rows, embedded = false }: { rows: number; embedded?: boolean }) {
  return (
    <div
      className={cn(
        'divide-y divide-border bg-card',
        !embedded && 'overflow-hidden rounded-lg border border-border',
      )}
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex min-h-[64px] items-center gap-3 px-4 py-2.5 sm:gap-3.5 sm:px-5">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={cn('h-3.5 max-w-full', LIST_TITLE_WIDTHS[idx % LIST_TITLE_WIDTHS.length])} />
            <Skeleton className={cn('h-3 max-w-full', LIST_META_WIDTHS[idx % LIST_META_WIDTHS.length])} />
          </div>
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function TableCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border px-4 py-3 sm:px-5">
        <Skeleton className="h-8 w-full sm:w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="divide-y divide-border">
        <div className="flex h-10 items-center gap-4 bg-muted/45 px-4 sm:px-5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
        {Array.from({ length: rows }).map((_, idx) => {
          const widths = TABLE_COL_WIDTHS[idx % TABLE_COL_WIDTHS.length]
          return (
            <div key={idx} className="flex h-[45px] items-center gap-4 px-4 sm:px-5">
              <Skeleton className={cn('h-3.5', widths[0])} />
              <Skeleton className={cn('h-3.5', widths[1])} />
              <Skeleton className={cn('hidden h-3.5 sm:block', widths[2])} />
              <Skeleton className={cn('hidden h-3.5 md:block', widths[3])} />
              <Skeleton className={cn('ml-auto h-3.5', widths[4])} />
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 sm:px-5">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  )
}

function DetailCardSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="mb-5 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5 sm:px-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        {Array.from({ length: fields }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className={cn('h-9 w-full', idx === fields - 1 && 'sm:w-2/3')} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PageSkeletonBody({
  variant,
  listRows,
  showHeader,
}: {
  variant: PageSkeletonVariant
  listRows: number
  showHeader: boolean
}) {
  return (
    <>
      {showHeader && <HeaderSkeleton />}

      {variant === 'overview' && (
        <>
          <MetricStripSkeleton count={4} />
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5 sm:px-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <InsetListSkeleton rows={listRows} embedded />
          </div>
        </>
      )}

      {variant === 'table' && <TableCardSkeleton rows={listRows} />}

      {variant === 'list' && <InsetListSkeleton rows={listRows} />}

      {variant === 'detail' && (
        <>
          <DetailCardSkeleton fields={3} />
          <DetailCardSkeleton fields={2} />
        </>
      )}
    </>
  )
}

/**
 * Structural content-area placeholder matching @x0c/ui page anatomy (PageHeader, MetricStrip,
 * Panel/InsetList, and DataTable) to eliminate generic gray-box flashes and layout shift.
 */
export function PageSkeleton({
  variant = 'overview',
  rows,
  showHeader = true,
  label = 'Loading',
  className,
}: PageSkeletonProps) {
  const listRows = rows ?? (variant === 'table' ? 5 : variant === 'overview' ? 3 : 4)

  return (
    <div aria-busy="true" aria-live="polite" className={cn(className)}>
      <span className="sr-only">{label}</span>
      <PageSkeletonBody variant={variant} listRows={listRows} showHeader={showHeader} />
    </div>
  )
}

export interface ShellSkeletonProps {
  /** Number of placeholder navigation items in the sticky sidebar. */
  navCount?: number
  /** Structural variant for the main content area. */
  variant?: PageSkeletonVariant
  /** Accessible status label announced once for the loading shell. */
  label?: string
  className?: string
}

const NAV_WIDTHS = ['w-24', 'w-28', 'w-20', 'w-26', 'w-22'] as const

/**
 * Full-console cold-start / auth-bootstrap placeholder matching AdminShell geometry
 * (56px topbar + sticky 204px sidebar + structured main workspace).
 */
export function ShellSkeleton({
  navCount = 4,
  variant = 'overview',
  label = 'Loading workspace',
  className,
}: ShellSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn('min-h-svh bg-background text-foreground', className)}
    >
      <span className="sr-only">{label}</span>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1160px] items-center gap-3 px-4 sm:px-6">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="hidden h-8 w-28 rounded-md sm:block" />
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex gap-4 overflow-hidden border-b border-border bg-background px-4 py-3 md:hidden">
        {Array.from({ length: Math.min(navCount, 4) }).map((_, idx) => (
          <Skeleton key={idx} className="h-4 w-16 shrink-0" />
        ))}
      </div>

      <div className="mx-auto grid max-w-[1160px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-6 pb-24 sm:px-6 md:grid-cols-[204px_minmax(0,1fr)] md:gap-12 md:pt-10">
        <aside aria-hidden="true" className="hidden min-w-0 md:block">
          <div className="flex flex-col gap-1">
            <Skeleton className="mb-2 h-3 w-16" />
            {Array.from({ length: navCount }).map((_, idx) => (
              <div key={idx} className="flex h-8.5 items-center gap-2.5 px-2.5">
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <Skeleton className={cn('h-3.5', NAV_WIDTHS[idx % NAV_WIDTHS.length])} />
              </div>
            ))}
          </div>
        </aside>
        <main aria-hidden="true" className="min-w-0">
          <PageSkeletonBody variant={variant} listRows={variant === 'table' ? 5 : variant === 'overview' ? 3 : 4} showHeader />
        </main>
      </div>
    </div>
  )
}
