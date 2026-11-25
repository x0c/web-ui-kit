import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name?: string | null, fallback = '?'): string {
  const s = String(name ?? '').trim()
  if (!s) return fallback
  const first = Array.from(s)[0] ?? fallback
  return /[a-z]/i.test(first) ? first.toUpperCase() : first
}

export function safeImageURL(url?: string | null): string {
  return typeof url === 'string' && /^https:\/\//i.test(url) ? url : ''
}

export function relTime(value?: string | null, justNowLabel = 'just now', locale?: string): string {
  if (!value) return ''
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return ''
  const diff = (time - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return justNowLabel
  const loc = locale || (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' })
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day')
  return new Date(time).toLocaleDateString(loc)
}

export function fmtDate(value?: string | null, locale?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return ''
  const loc = locale || (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  return d.toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtDateTime(value?: string | null, locale?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return ''
  const loc = locale || (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  return d.toLocaleString(loc, { hour12: false })
}

export class AdminApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.code = code
  }
}

export function errorMessage(err: unknown, fallback = 'Request failed'): string {
  if (err instanceof AdminApiError) return err.message || `${fallback} (${err.status})`
  if (err instanceof Error) return err.message || fallback
  return fallback
}

export interface AdminClientOptions {
  baseUrl?: string
  onUnauthorized?: () => void
}

/** Lightweight same-origin JSON API helper for cookie-authenticated admin SPAs. */
export function createAdminClient(options: AdminClientOptions = {}) {
  const base = (options.baseUrl ?? '').replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    if (init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    const res = await fetch(`${base}${path}`, {
      credentials: 'include',
      ...init,
      headers,
    })
    if (res.status === 401) {
      options.onUnauthorized?.()
    }
    if (res.status === 204) {
      return undefined as T
    }
    const text = await res.text()
    let data: Record<string, unknown> | undefined
    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>
      } catch {
        data = undefined
      }
    }
    if (!res.ok) {
      const msg =
        (typeof data?.error === 'string' && data.error) ||
        (typeof data?.message === 'string' && data.message) ||
        text ||
        `HTTP ${res.status}`
      const code = typeof data?.code === 'string' ? data.code : undefined
      throw new AdminApiError(res.status, msg, code)
    }
    return (data as T) ?? (undefined as T)
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    request,
  }
}
