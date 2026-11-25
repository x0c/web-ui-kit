import { Skeleton } from '../primitives/skeleton'

export function PageSkeleton() {
  return (
    <div aria-hidden className="space-y-5">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-lg" />
    </div>
  )
}
