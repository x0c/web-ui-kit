import { cn, initials, safeImageURL } from '../lib/utils'

export interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  logoUrl?: string | null
  accentColor?: string | null
  label?: string
  className?: string
}

/** Optional HTTPS logo image or minimal neutral monochrome monogram tile. */
export function BrandMark({ size = 'sm', logoUrl, accentColor, label, className }: BrandMarkProps) {
  const logo = safeImageURL(logoUrl)
  const dims =
    size === 'lg'
      ? 'size-10 rounded-lg text-sm'
      : size === 'md'
        ? 'size-8 rounded-md text-xs'
        : 'size-6 rounded-md text-[11px]'
  if (logo) {
    return <img src={logo} alt="" className={cn(dims, 'shrink-0 object-cover ring-1 ring-border', className)} />
  }

  const hasCustomBrand =
    accentColor &&
    /^#[0-9a-fA-F]{6}$/.test(accentColor) &&
    accentColor.toLowerCase() !== '#2563eb'

  const glyph = label?.trim() ? initials(label, '') : ''

  return (
    <span
      aria-hidden
      className={cn(
        dims,
        'grid shrink-0 place-items-center font-semibold select-none',
        hasCustomBrand ? 'bg-brand text-primary-foreground' : 'bg-primary text-primary-foreground',
        className,
      )}
    >
      {glyph ? (
        glyph
      ) : (
        <svg viewBox="0 0 24 24" className="size-[60%]" fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1.5" fill="currentColor" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" />
        </svg>
      )}
    </span>
  )
}

export interface BrandLockupProps {
  brandName?: string
  logoUrl?: string | null
  accentColor?: string | null
  compactOnMobile?: boolean
  className?: string
}

/** Header lockup: monochrome BrandMark paired with an optional brand name label. */
export function BrandLockup({
  brandName,
  logoUrl,
  accentColor,
  compactOnMobile = false,
  className,
}: BrandLockupProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandMark size="sm" logoUrl={logoUrl} accentColor={accentColor} label={brandName} />
      {brandName && (
        <span className={cn('text-sm font-semibold tracking-[-0.02em] text-foreground', compactOnMobile && 'hidden sm:inline')}>
          {brandName}
        </span>
      )}
    </span>
  )
}
