import { ChevronDown, KeyRound } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { BrandMark } from '../brand/brand-mark'
import { cn } from '../lib/utils'
import { Button } from '../primitives/button'
import { Notice } from './notice'

export interface OidcAutoRedirectOptions {
  enabled: boolean
  loginUrl: string
  storagePrefix?: string
  cooldownMs?: number
}

function sanitizeReturnTo(rawPathname: string, rawSearch: string): string {
  const params = new URLSearchParams(rawSearch)
  params.delete('error')
  params.delete('logged_out')
  params.delete('local')
  const qs = params.toString()
  const path =
    rawPathname.startsWith('/') && !rawPathname.startsWith('/api/') && !rawPathname.startsWith('/rpc/')
      ? rawPathname
      : '/'
  return `${path}${qs ? `?${qs}` : ''}`
}

export function buildOidcLoginHref(basePath: string, pathname?: string, search?: string): string {
  const p = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const s = search ?? (typeof window !== 'undefined' ? window.location.search : '')
  const sep = basePath.includes('?') ? '&' : '?'
  return `${basePath}${sep}return_to=${encodeURIComponent(sanitizeReturnTo(p, s))}`
}

/**
 * Triggers zero-click OIDC redirect for unauthenticated console visits while guarding
 * against redirect loops (?logged_out=1, ?local=1, ?error=, manual sign-out flag, or 15s cooldown).
 */
export function useOidcAutoRedirect({
  enabled,
  loginUrl,
  storagePrefix = 'x0c_oidc',
  cooldownMs = 15_000,
}: OidcAutoRedirectOptions): boolean {
  const [redirecting] = useState(() => {
    if (!enabled || typeof window === 'undefined') return false
    try {
      const sp = new URLSearchParams(window.location.search)
      if (sp.has('local') || sp.has('logged_out') || sp.has('error')) return false
      if (sessionStorage.getItem(`${storagePrefix}_manual_logout`) === '1') return false
      const rawTs = sessionStorage.getItem(`${storagePrefix}_auto_ts`)
      if (rawTs && Date.now() - Number(rawTs) < cooldownMs) return false
      return true
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!redirecting) return
    try {
      sessionStorage.setItem(`${storagePrefix}_auto_ts`, String(Date.now()))
    } catch {
      // Ignore restricted storage environments.
    }
    window.location.replace(loginUrl)
  }, [redirecting, loginUrl, storagePrefix])

  return redirecting
}

export interface SignInScreenProps {
  product: ReactNode
  brand?: ReactNode
  title?: ReactNode
  error?: ReactNode
  ssoHref?: string
  ssoLabel?: ReactNode
  onSsoClick?: () => void
  /** Optional local fallback form; collapsed behind a secondary toggle when ssoHref is set. */
  localForm?: ReactNode
  localToggleLabel?: ReactNode
  defaultShowLocalForm?: boolean
  footer?: ReactNode
  className?: string
}

/** Flat monochrome centered sign-in surface with single primary SSO CTA and optional collapsible local login. */
export function SignInScreen({
  product,
  brand,
  title = 'Sign in to Console',
  error,
  ssoHref,
  ssoLabel = 'Continue with SSO',
  onSsoClick,
  localForm,
  localToggleLabel = 'Use local account',
  defaultShowLocalForm = false,
  footer,
  className,
}: SignInScreenProps) {
  const [showLocal, setShowLocal] = useState(!ssoHref || defaultShowLocalForm)
  const host = typeof window !== 'undefined' ? window.location.host : ''

  return (
    <div className={cn('flex min-h-svh flex-col items-center justify-center bg-background px-4 text-foreground', className)}>
      <div className="w-full max-w-[384px]">
        <div className="mb-6 flex items-center gap-2.5">
          {brand ?? <BrandMark size="sm" />}
          <span className="text-sm font-medium text-muted-foreground">{product}</span>
        </div>

        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>

        {error && <Notice className="mt-5">{error}</Notice>}

        {ssoHref && (
          <Button asChild size="lg" className="mt-6 w-full" onClick={onSsoClick}>
            <a href={ssoHref}>{ssoLabel}</a>
          </Button>
        )}

        {localForm && ssoHref && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowLocal((v) => !v)}
              aria-expanded={showLocal}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <KeyRound className="size-3.5" />
              <span>{localToggleLabel}</span>
              <ChevronDown className={cn('size-3.5 transition-transform', showLocal && 'rotate-180')} />
            </button>
            {showLocal && <div className="mt-4 border-t border-border pt-4">{localForm}</div>}
          </div>
        )}

        {localForm && !ssoHref && <div className="mt-6">{localForm}</div>}

        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          {footer ?? host}
        </div>
      </div>
    </div>
  )
}
