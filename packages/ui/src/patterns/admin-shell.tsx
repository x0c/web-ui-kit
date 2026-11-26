import type { LucideIcon } from 'lucide-react'
import { LogOut, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { BrandLockup, BrandMark } from '../brand/brand-mark'
import { cn } from '../lib/utils'
import { Button } from '../primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu'
import { Skeleton } from '../primitives/skeleton'
import { CommandPalette, type CommandAction } from './command-palette'
import { UserAvatar } from './identity'

export interface AdminNavItem {
  id: string
  label: string
  icon: LucideIcon
  section?: string
  href?: string
}

export interface AdminUser {
  email: string
  displayName?: string
  avatarUrl?: string
}

export interface CommandPaletteLabels {
  trigger?: string
  openLabel?: string
  placeholder?: string
  emptyLabel?: string
  title?: string
}

export interface AdminShellProps {
  product: ReactNode
  brand?: ReactNode
  brandName?: string
  brandLogoUrl?: string | null
  brandAccentColor?: string | null
  nav: AdminNavItem[]
  activeId: string
  onSelectNav?: (id: string) => void
  renderNavLink?: (item: AdminNavItem, active: boolean, children: ReactNode, className: string) => ReactNode
  navAriaLabel?: string
  topbarActions?: ReactNode
  topbarExtra?: ReactNode
  user?: AdminUser | null
  userMenuExtra?: ReactNode
  onSignOut?: () => void
  signOutLabel?: string
  accountMenuLabel?: string
  onBrandClick?: () => void
  brandHref?: string
  enableCommandPalette?: boolean
  commandPaletteLabels?: CommandPaletteLabels
  extraCommands?: CommandAction[]
  sidebarFooter?: ReactNode
  children: ReactNode
}

export function AppTopbar({
  product,
  brand,
  brandName,
  brandLogoUrl,
  brandAccentColor,
  onBrandClick,
  brandHref = '/',
  user,
  userMenuExtra,
  onSignOut,
  signOutLabel = 'Sign out',
  accountMenuLabel = 'Account menu',
  children,
}: {
  product?: ReactNode
  brand?: ReactNode
  brandName?: string
  brandLogoUrl?: string | null
  brandAccentColor?: string | null
  onBrandClick?: () => void
  brandHref?: string
  user?: AdminUser | null
  userMenuExtra?: ReactNode
  onSignOut?: () => void
  signOutLabel?: string
  accountMenuLabel?: string
  children?: ReactNode
}) {
  const hasExplicitBrand = Boolean(brand || brandName || brandLogoUrl)
  const productLabel = typeof product === 'string' ? product : undefined
  const headerPrimaryNode = hasExplicitBrand ? (
    brand ?? (
      <BrandLockup
        compactOnMobile
        brandName={brandName}
        logoUrl={brandLogoUrl}
        accentColor={brandAccentColor}
      />
    )
  ) : product ? (
    <span className="inline-flex items-center gap-2">
      <BrandMark size="sm" accentColor={brandAccentColor} label={productLabel} />
      <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">{product}</span>
    </span>
  ) : (
    <BrandMark size="sm" accentColor={brandAccentColor} />
  )

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center gap-3 px-4 sm:px-6">
        {onBrandClick ? (
          <button
            type="button"
            onClick={onBrandClick}
            className="flex shrink-0 cursor-pointer items-center rounded-md font-semibold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {headerPrimaryNode}
          </button>
        ) : (
          <a
            href={brandHref}
            className="flex shrink-0 items-center rounded-md font-semibold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {headerPrimaryNode}
          </a>
        )}
        {hasExplicitBrand && product && (
          <>
            <span aria-hidden className="text-lg font-light text-border">/</span>
            <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">{product}</div>
          </>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {children}
          {user && (
            <UserMenu
              user={user}
              userMenuExtra={userMenuExtra}
              onSignOut={onSignOut}
              signOutLabel={signOutLabel}
              accountMenuLabel={accountMenuLabel}
            />
          )}
        </div>
      </div>
    </header>
  )
}

function UserMenu({
  user,
  userMenuExtra,
  onSignOut,
  signOutLabel,
  accountMenuLabel,
}: {
  user: AdminUser
  userMenuExtra?: ReactNode
  onSignOut?: () => void
  signOutLabel: string
  accountMenuLabel: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={accountMenuLabel}
          className="ml-1.5 cursor-pointer rounded-full transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <UserAvatar name={user.displayName} email={user.email} url={user.avatarUrl} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <UserAvatar name={user.displayName} email={user.email} url={user.avatarUrl} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user.displayName || user.email}</div>
            <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        {userMenuExtra && (
          <>
            <DropdownMenuSeparator />
            {userMenuExtra}
          </>
        )}
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onSignOut()}>
              <LogOut />
              {signOutLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopbarLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild={Boolean(href)}
      onClick={onClick}
      className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground md:inline-flex"
    >
      {href ? <a href={href}>{children}</a> : children}
    </Button>
  )
}

/** Sticky full-bleed horizontal underline tab strip shown on viewports below md. */
export function MobileTabBar({
  items,
  activeId,
  onSelect,
  renderLink,
  label = 'Navigation',
}: {
  items: AdminNavItem[]
  activeId: string
  onSelect?: (id: string) => void
  renderLink?: AdminShellProps['renderNavLink']
  label?: string
}) {
  return (
    <nav
      aria-label={label}
      className="sticky top-14 z-20 flex overflow-x-auto border-b border-border bg-background px-4 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const active = item.id === activeId
        const cls = cn(
          'relative flex h-11 shrink-0 cursor-pointer items-center gap-1.5 px-3 text-[13px] font-medium whitespace-nowrap transition-colors first:pl-0',
          active
            ? 'text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-foreground first:after:left-0'
            : 'text-muted-foreground hover:text-foreground',
        )
        if (renderLink) {
          return <span key={item.id}>{renderLink(item, active, item.label, cls)}</span>
        }
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect?.(item.id)}
            className={cls}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

/** Two-column workspace: sticky 204px monochrome sidebar beside main content. */
export function AppFrame({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1160px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-6 pb-24 sm:px-6 md:grid-cols-[204px_minmax(0,1fr)] md:gap-12 md:pt-10">
      <aside className="hidden min-w-0 md:sticky md:top-[88px] md:block md:self-start">{sidebar}</aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}

export function SideNav({ children, label = 'Sidebar navigation' }: { children: ReactNode; label?: string }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-0.5">
      {children}
    </nav>
  )
}

export function SideNavSection({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pt-5 pb-1.5 text-[11px] font-medium tracking-[0.04em] text-muted-foreground/75 first:pt-0">
      {children}
    </div>
  )
}

function sideNavItemClassName(active?: boolean): string {
  return cn(
    'flex h-8.5 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-[13.5px] whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none',
    active
      ? 'bg-foreground/[0.065] font-medium text-foreground [&_svg]:text-foreground'
      : 'font-normal text-muted-foreground hover:bg-foreground/[0.035] hover:text-foreground [&_svg]:text-muted-foreground/80',
  )
}

export function SideNavItem({
  active,
  icon: Icon,
  onClick,
  children,
}: {
  active?: boolean
  icon: LucideIcon
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={sideNavItemClassName(active)}
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}

/** Complete Flat Monochrome Admin Console shell with responsive sidebar, mobile tab bar, and optional command palette. */
export function AdminShell({
  product,
  brand,
  brandName,
  brandLogoUrl,
  brandAccentColor,
  nav,
  activeId,
  onSelectNav,
  renderNavLink,
  navAriaLabel = 'Console navigation',
  topbarActions,
  topbarExtra,
  user,
  userMenuExtra,
  onSignOut,
  signOutLabel,
  accountMenuLabel,
  onBrandClick,
  brandHref,
  enableCommandPalette = false,
  commandPaletteLabels,
  extraCommands = [],
  sidebarFooter,
  children,
}: AdminShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const sections: Array<{ title?: string; items: AdminNavItem[] }> = []
  for (const item of nav) {
    const last = sections[sections.length - 1]
    if (!last || last.title !== item.section) {
      sections.push({ title: item.section, items: [item] })
    } else {
      last.items.push(item)
    }
  }

  const commandItems: CommandAction[] = [
    ...nav.map((item) => ({
      id: `nav:${item.id}`,
      label: item.label,
      group: item.section ?? 'Navigation',
      icon: item.icon,
      onSelect: () => {
        if (onSelectNav) {
          onSelectNav(item.id)
        } else if (item.href) {
          window.location.assign(item.href)
        }
      },
    })),
    ...extraCommands,
  ]

  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppTopbar
        product={product}
        brand={brand}
        brandName={brandName}
        brandLogoUrl={brandLogoUrl}
        brandAccentColor={brandAccentColor}
        onBrandClick={onBrandClick}
        brandHref={brandHref}
        user={user}
        userMenuExtra={userMenuExtra}
        onSignOut={onSignOut}
        signOutLabel={signOutLabel}
        accountMenuLabel={accountMenuLabel}
      >
        {enableCommandPalette && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCmdOpen(true)}
            className="hidden h-8 gap-2 px-2.5 text-xs text-muted-foreground sm:inline-flex"
            aria-label={commandPaletteLabels?.openLabel ?? 'Open command palette'}
          >
            <Search className="size-3.5" />
            <span>{commandPaletteLabels?.trigger ?? 'Search'}</span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.2 font-mono text-[10px]">
              ⌘K
            </kbd>
          </Button>
        )}
        {topbarExtra}
        {topbarActions}
      </AppTopbar>

      {enableCommandPalette && (
        <CommandPalette
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          items={commandItems}
          placeholder={commandPaletteLabels?.placeholder}
          emptyLabel={commandPaletteLabels?.emptyLabel}
          title={commandPaletteLabels?.title}
        />
      )}

      <MobileTabBar
        items={nav}
        activeId={activeId}
        onSelect={onSelectNav}
        renderLink={renderNavLink}
        label={navAriaLabel}
      />

      <AppFrame
        sidebar={
          <SideNav label={navAriaLabel}>
            {sections.map((sec, idx) => (
              <div key={sec.title ?? idx}>
                {sec.title && <SideNavSection>{sec.title}</SideNavSection>}
                <div className="flex flex-col gap-0.5">
                  {sec.items.map((item) => {
                    const active = item.id === activeId
                    const Icon = item.icon
                    const itemCls = sideNavItemClassName(active)
                    const content = (
                      <>
                        <Icon className="size-4" />
                        {item.label}
                      </>
                    )
                    if (renderNavLink) {
                      return <div key={item.id}>{renderNavLink(item, active, content, itemCls)}</div>
                    }
                    return (
                      <SideNavItem
                        key={item.id}
                        active={active}
                        icon={item.icon}
                        onClick={() => onSelectNav?.(item.id)}
                      >
                        {item.label}
                      </SideNavItem>
                    )
                  })}
                </div>
              </div>
            ))}
            {sidebarFooter && (
              <div className="mt-5 border-t border-border pt-3.5 text-xs text-muted-foreground">
                {sidebarFooter}
              </div>
            )}
          </SideNav>
        }
      >
        {children}
      </AppFrame>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
      <div className="min-w-0">
        <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.025em]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface MetricItem {
  label: string
  value?: number | string | null
}

/** Single 1px hairline-divided metric strip for overview KPIs. */
export function MetricStrip({
  items,
  loading = false,
  className,
}: {
  items: MetricItem[]
  loading?: boolean
  className?: string
}) {
  return (
    <div
      aria-busy={loading || undefined}
      className={cn(
        'mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className,
      )}
    >
      {items.map((m) => (
        <div key={m.label} className="bg-card px-4 py-4 sm:px-5">
          <div className="text-xs font-medium text-muted-foreground">{m.label}</div>
          {loading ? (
            <Skeleton className="mt-1.5 h-[28px] w-14" />
          ) : (
            <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
              {m.value ?? 0}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** De-boxed editorial section: left-hand heading + optional action beside open content. */
export function EditorialSection({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'grid gap-5 border-t border-border py-6 first-of-type:border-t-0 first-of-type:pt-1 sm:py-8 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start lg:justify-start lg:pt-0.5">
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** Grouped entity container with 1px hairline dividers and no outer drop shadow. */
export function InsetList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'divide-y divide-border overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Bordered content section with a title row and optional trailing action. */
export function Panel({
  title,
  action,
  children,
  className,
  flush,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <section className={cn('mb-5 overflow-hidden rounded-lg border border-border bg-card', className)}>
      {(title || action) && (
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 sm:px-5">
          <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-4 sm:p-5'}>{children}</div>
    </section>
  )
}

/** Fixed-height row for peer lists; title/meta/actions keep the same slots across rows. */
export function Row({
  icon,
  title,
  meta,
  actions,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="row"
      className={cn(
        'flex min-h-[64px] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 sm:gap-3.5 sm:px-5',
        className,
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {meta && <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
      {children}
    </span>
  )
}

export function EmptyRow({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-[64px] items-center justify-center gap-2 px-5 text-sm text-muted-foreground [&_svg]:size-4">
      {icon}
      {children}
    </div>
  )
}
