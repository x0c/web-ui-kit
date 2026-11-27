**Languages:** English | [简体中文](README.zh-CN.md)

# web-ui-kit

Flat Monochrome React 19, Radix UI, and Tailwind CSS v4 design tokens (`@x0c/tokens`) and admin console component kit (`@x0c/ui`) for embedded developer and operations UIs.

- **Zero runtime brand lock-in**: Neutral tokens and primitives out of the box, with an injectable `brand` slot on `AdminShell` and CSS custom properties for runtime theming.
- **Proven headless primitives**: Built on Radix UI, `@tanstack/react-table` (`DataTable`), `cmdk` (`CommandPalette`), `sonner` (`Toaster`), and `lucide-react`.
- **Self-contained GitHub Release tarballs**: Distributed directly from immutable GitHub Releases (no private registry auth, zero token setup, SHA-512 locked in `package-lock.json`).
- **Opt-in webfonts**: `@x0c/ui/styles.css` ships only CSS tokens and utilities with clean system font fallbacks (ideal for single-binary `go:embed` consoles); import `@x0c/ui/fonts.css` when you want bundled Geist & Geist Mono variable fonts.

## Packages

| Package | Purpose | Highlights |
|---|---|---|
| `@x0c/ui` | Self-contained React 19 UI primitives, console patterns & bundled tokens | `AdminShell`, `DataTable`, `CommandPalette`, `FormDialog`, `Sheet`, `ConfirmAction`, `SecretDialog`, `Notice`, `StatusDot`, Radix primitives, and `./styles.css` / `./fonts.css`. |
| [`@x0c/tokens`](packages/tokens) | Standalone CSS custom properties & Tailwind v4 `@theme inline` | Light/Dark/System tokens (`./theme.css`), raw properties (`./tokens.css`), optional Geist fonts (`./fonts.css`). |

## Install

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/v0.3.2/x0c-ui-0.3.2.tgz
npm install -D @tailwindcss/vite tailwindcss typescript
```

For CSS-only tokens without React primitives:

```bash
npm install https://github.com/x0c/web-ui-kit/releases/download/v0.3.2/x0c-tokens-0.3.2.tgz
```

## Usage

Import Tailwind CSS v4 and `@x0c/ui/styles.css` in your main stylesheet:

```css
@import "tailwindcss";
@import "@x0c/ui/styles.css";
/* Optional: bundle Geist & Geist Mono fonts */
/* @import "@x0c/ui/fonts.css"; */
```

Render an admin or developer console with `AdminShell`:

```tsx
import { AdminShell, PageHeader, Panel, Toaster } from '@x0c/ui'
import { Database, ScrollText } from 'lucide-react'
import { useState } from 'react'

export function App() {
  const [tab, setTab] = useState('catalog')
  return (
    <>
      <AdminShell
        product="Console"
        nav={[
          { id: 'catalog', label: 'Catalog', icon: Database, section: 'Control' },
          { id: 'audit', label: 'Audit Logs', icon: ScrollText, section: 'Control' },
        ]}
        activeId={tab}
        onSelectNav={setTab}
        enableCommandPalette
      >
        <PageHeader title="Catalog" />
        <Panel title="Instances">Ready</Panel>
      </AdminShell>
      <Toaster />
    </>
  )
}
```

Pass `brand={<MyBrandLockup />}` to `<AdminShell />` if you want a custom brand lockup before the `product` title, or wrap only `product` cleanly when omitted.

For localized one-time secrets, pass `warningLabel`, `savedLabel`, `srDescription`, `copyLabel`, and `copyFailedLabel` to `SecretDialog`. The wrapping application owns the dismissal callback and each field's label.

## Supported Platforms

Works in modern evergreen browsers with React 19 (`>= 19.0.0`), Tailwind CSS v4 (`>= 4.0.0`), and TypeScript/Vite toolchains on macOS, Linux, and Windows.

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run dev:playground
```

See [Security Policy](SECURITY.md) and [MIT License](LICENSE).

To verify a candidate without publishing, run `python3 scripts/release.py --build-only --version v<package-version>`. It builds the Playground, checks contrast and narrow layouts in Chromium, installs the packed tarballs in an isolated consumer, and verifies React rendering and CSS exports. The release command requires matching package versions and never overwrites published assets. React Server Components remain outside the supported scope.

## Related Tools

| Repository | Description |
|---|---|
| **[agent-dbctl](https://github.com/x0c/agent-dbctl)** | Enterprise database execution gate & local approval console for AI coding agents (built with `@x0c/ui`). |
| **[corral](https://github.com/corral-dev/corral)** | Search, resume, and hand off local Claude Code, Codex CLI, Cursor, and OpenCode sessions. |
| **[subswap](https://github.com/x0c/subswap)** | Check remaining quota and switch Claude Code, Codex, Cursor, Kimi Code, and OpenCode accounts without logging out. |
| **[agentsync](https://github.com/x0c/agentsync)** | Sync `AGENTS.md`, `CLAUDE.md`, skills, and MCP configs across coding agents from one local source of truth. |
| **[shell-gate](https://github.com/x0c/shell-gate)** | Self-hosted Go browser terminal gateway for ttyd with passkeys, TOTP 2FA, and persistent tabs. |
