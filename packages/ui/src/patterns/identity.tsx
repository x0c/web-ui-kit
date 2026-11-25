import { cn, initials, safeImageURL } from '../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar'

const sizes = { sm: 'size-7 text-[11px]', md: 'size-9 text-xs', lg: 'size-10 text-sm', xl: 'size-12 text-base' }

export function UserAvatar({
  name,
  email,
  url,
  size = 'md',
  className,
}: {
  name?: string
  email?: string
  url?: string
  size?: keyof typeof sizes
  className?: string
}) {
  const img = safeImageURL(url)
  return (
    <Avatar className={cn(sizes[size], 'ring-1 ring-border', className)}>
      {img && <AvatarImage src={img} alt="" />}
      <AvatarFallback className="bg-secondary font-medium text-foreground/85">{initials(name || email)}</AvatarFallback>
    </Avatar>
  )
}

const tile = { sm: 'size-7 rounded-md text-xs', md: 'size-9 rounded-md text-sm', lg: 'size-12 rounded-lg text-lg' }

export function AppTile({
  name,
  logo,
  size = 'md',
  className,
}: {
  name?: string
  logo?: string
  size?: keyof typeof tile
  className?: string
}) {
  const img = safeImageURL(logo)
  if (img) {
    return <img src={img} alt="" className={cn(tile[size], 'shrink-0 object-cover ring-1 ring-border', className)} />
  }
  return (
    <span
      aria-hidden
      className={cn(
        tile[size],
        'grid shrink-0 place-items-center bg-secondary font-semibold text-foreground/85 ring-1 ring-border',
        className,
      )}
    >
      {initials(name, 'A')}
    </span>
  )
}
