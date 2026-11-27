#!/usr/bin/env node
/**
 * Automated Light + Dark WCAG AA contrast & structural verification against the built Playground.
 * Uses Canvas 2D color normalization so CSS Color 4 formats (oklab, oklch, color-mix) are measured accurately.
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PLAYGROUND_DIR = path.join(ROOT, 'apps/playground')
const PORT = 4183
const URL = `http://127.0.0.1:${PORT}`

const server = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: PLAYGROUND_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
})

async function waitForServer(timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(URL)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error('Preview server did not start in time')
}

async function auditElements(page, selector, label) {
  return page.locator(selector).evaluateAll(
    (els, groupLabel) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      function toRGBA(cssColor) {
        if (!cssColor || cssColor === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = cssColor
        ctx.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
        return { r, g, b, a: a / 255 }
      }
      function blend(fg, bg) {
        const a = fg.a
        return {
          r: fg.r * a + bg.r * (1 - a),
          g: fg.g * a + bg.g * (1 - a),
          b: fg.b * a + bg.b * (1 - a),
          a: 1,
        }
      }
      function effectiveBg(el) {
        const chain = []
        let cur = el
        while (cur && cur.nodeType === 1) {
          const c = toRGBA(getComputedStyle(cur).backgroundColor)
          if (c.a > 0) chain.push(c)
          cur = cur.parentElement
        }
        let acc = { r: 255, g: 255, b: 255, a: 1 }
        for (let i = chain.length - 1; i >= 0; i--) {
          acc = blend(chain[i], acc)
        }
        return acc
      }
      function luminance({ r, g, b }) {
        const [rs, gs, bs] = [r, g, b].map((v) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
      }
      function contrast(c1, c2) {
        const l1 = luminance(c1)
        const l2 = luminance(c2)
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      }

      return els.map((el) => {
        const cs = getComputedStyle(el)
        const bg = effectiveBg(el)
        const fg = blend(toRGBA(cs.color), bg)
        const ratio = Number(contrast(fg, bg).toFixed(2))
        return {
          group: groupLabel,
          text: (el.textContent || '').trim().slice(0, 32),
          color: `rgb(${Math.round(fg.r)}, ${Math.round(fg.g)}, ${Math.round(fg.b)})`,
          bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
          contrast: ratio,
          passAA: ratio >= 4.5,
        }
      })
    },
    label,
  )
}

const errors = []
const failures = []

try {
  await waitForServer()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))

  await page.goto(URL, { waitUntil: 'networkidle' })

  let totalChecked = 0
  const layoutFailures = []
  for (const mode of ['light', 'dark']) {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.getByRole('button', { name: `Theme ${mode}` }).click()
    await page.waitForTimeout(100)

    await page.getByRole('button', { name: 'Overview' }).click()
    await page.waitForTimeout(80)

    // Verify EditorialSection header title + badge/action stay inline (no unintended wrap)
    const editorialChecks = await page.locator('[data-slot="editorial-section-header"]').evaluateAll((headers) =>
      headers.map((h) => {
        const title = h.querySelector('h2')
        const extra = h.querySelector('[data-slot="badge"], button')
        if (!title || !extra) return { ok: true }
        const tr = title.getBoundingClientRect()
        const er = extra.getBoundingClientRect()
        const dy = Math.abs((tr.top + tr.bottom) / 2 - (er.top + er.bottom) / 2)
        return {
          title: title.textContent?.trim(),
          extra: extra.textContent?.trim(),
          dy: Number(dy.toFixed(1)),
          ok: dy <= 4,
        }
      }),
    )
    for (const c of editorialChecks) {
      totalChecked += 1
      if (!c.ok) layoutFailures.push({ check: `editorial-inline:${mode}`, ...c })
    }

    await page.getByRole('button', { name: 'Revoke' }).click()
    await page.waitForTimeout(120)
    const dialogAudit = await auditElements(page, '[data-slot="alert-dialog-content"] button', `confirm-dialog:${mode}`)
    await page.getByRole('button', { name: 'Cancel' }).click()
    await page.waitForTimeout(100)

    await page.getByRole('button', { name: 'Auth & Forms' }).click()
    await page.waitForTimeout(100)
    const buttonAudit = await auditElements(page, '[data-testid="button-matrix"] button', `buttons:${mode}`)
    const badgeAudit = await auditElements(page, '[data-testid="badge-matrix"] > span', `badges:${mode}`)
    const noticeAudit = await auditElements(page, '[data-testid="notice-matrix"] > div', `notices:${mode}`)

    for (const item of [...dialogAudit, ...buttonAudit, ...badgeAudit, ...noticeAudit]) {
      totalChecked += 1
      if (!item.passAA) failures.push(item)
    }
  }

  // Mobile 390px single-line header & zero horizontal overflow check
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Overview' }).click()
  await page.waitForTimeout(100)
  const mobileCheck = await page.evaluate(() => {
    const header = document.querySelector('header')
    return {
      headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
  totalChecked += 2
  if (mobileCheck.headerHeight > 58) {
    layoutFailures.push({ check: 'mobile-topbar-height', ...mobileCheck })
  }
  if (mobileCheck.scrollWidth > mobileCheck.innerWidth) {
    layoutFailures.push({ check: 'mobile-horizontal-overflow', ...mobileCheck })
  }

  await browser.close()

  console.log(JSON.stringify({ totalChecked, failures, layoutFailures, mobileCheck, errors }, null, 2))
  if (errors.length > 0 || failures.length > 0 || layoutFailures.length > 0) {
    process.exitCode = 1
  }
} finally {
  server.kill('SIGTERM')
}
