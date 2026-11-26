import { cn } from '../lib/utils'

export interface DisplayCatalogItem {
  code?: string
  label: string
  label_en?: string
  color?: string
}

export type DisplayCatalogSource =
  | readonly DisplayCatalogItem[]
  | Record<string, DisplayCatalogItem>
  | undefined

export function resolveCatalogItem(
  source: DisplayCatalogSource,
  code: string,
  locale = 'en',
): { label: string; color?: string; known: boolean } {
  const item = Array.isArray(source)
    ? source.find((entry) => entry.code === code)
    : source && !Array.isArray(source)
      ? (source as Record<string, DisplayCatalogItem>)[code]
      : undefined
  if (!item) {
    return { label: code, known: false }
  }
  const isEn = locale.toLowerCase().startsWith('en')
  return {
    label: isEn ? item.label_en || item.label : item.label || item.label_en || code,
    color: item.color,
    known: true,
  }
}

export interface CatalogBadgeProps {
  /** Array or code-keyed map of server-owned display metadata items. */
  source?: DisplayCatalogSource
  code: string
  locale?: string
  /** 'pill': monochrome border + semantic dot; 'tinted': subtle tinted fill/border from item color. */
  variant?: 'pill' | 'tinted'
  className?: string
}

/** Server-driven label and color badge that preserves unknown codes verbatim. */
export function CatalogBadge({
  source,
  code,
  locale = 'en',
  variant = 'pill',
  className,
}: CatalogBadgeProps) {
  const { label, color, known } = resolveCatalogItem(source, code, locale)
  if (!known) {
    return (
      <span
        className={cn(
          'inline-flex h-[22px] items-center rounded-full border border-border bg-card px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground',
          className,
        )}
      >
        {label}
      </span>
    )
  }

  if (variant === 'tinted' && color) {
    return (
      <span
        className={cn(
          'inline-flex h-[22px] items-center gap-1.5 rounded-md border px-2 text-xs font-medium whitespace-nowrap text-foreground',
          className,
        )}
        style={{
          borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs font-medium whitespace-nowrap text-foreground/90',
        className,
      )}
    >
      {color && (
        <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  )
}
