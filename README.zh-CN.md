**语言：** [English](README.md) | 简体中文

# web-ui-kit

基于 React 19、Radix UI 与 Tailwind CSS v4 的 Flat Monochrome 设计 Token（`@x0c/tokens`）与控制台组件库（`@x0c/ui`），适用于单二进制内嵌控制台和后台管理系统。

- **零品牌绑定**：开箱提供中性单色 Token 与通用组件；`AdminShell` 支持通过 `brand` 插槽注入自定义品牌标识，颜色与圆角支持通过 CSS 自定义属性覆盖。
- **封装成熟无头原语**：基于 Radix UI、`@tanstack/react-table`（`DataTable`）、`cmdk`（`CommandPalette`）、`sonner`（`Toaster`）与 `lucide-react`。
- **字体按需打包**：`@x0c/ui/styles.css` 仅包含 Token 与样式规则并回退至系统字体，适合保持 Go `go:embed` 单二进制体积精简；需要内置 Geist / Geist Mono 可变字体时再按需引入 `@x0c/ui/fonts.css`。

## 包含包

| 包名 | 职责 | 说明 |
|---|---|---|
| [`@x0c/tokens`](packages/tokens) | CSS 变量与 Tailwind v4 `@theme inline` 契约 | 明暗/跟随系统配色 Token（`./theme.css`）、纯变量定义（`./tokens.css`）、可选 Geist 字体（`./fonts.css`）。 |
| [`@x0c/ui`](packages/ui) | React 19 基础原语与控制台布局模式 | `AdminShell`、`DataTable`、`CommandPalette`、`FormDialog`、`Sheet`、`ConfirmAction`、`SecretDialog`、`Notice`、`StatusDot`、Radix 原语及 `createAdminClient`。 |

## 安装

```bash
npm install react react-dom lucide-react @x0c/ui
npm install -D @tailwindcss/vite tailwindcss typescript
```

## 快速使用

在入口样式表中引入 Tailwind CSS v4 与 `@x0c/ui/styles.css`：

```css
@import "tailwindcss";
@import "@x0c/ui/styles.css";
/* 可选：打包内置 Geist 与 Geist Mono 字体 */
/* @import "@x0c/ui/fonts.css"; */
```

使用 `AdminShell` 搭建控制台界面：

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

需要在 `product` 标题左侧展示自定义品牌标识时，向 `<AdminShell />` 传入 `brand={<MyBrandLockup />}` 即可；未传入时仅展示中性产品标题。

## 支持的平台

支持在 macOS、Linux 与 Windows 上的现代浏览器以及 React 19（`>= 19.0.0`）、Tailwind CSS v4（`>= 4.0.0`）、TypeScript / Vite 构建环境中使用。

## 本地开发

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run dev:playground
```

安全上报与本地行为说明见 [SECURITY.md](SECURITY.md)，授权协议见 [MIT License](LICENSE)。

## 关联工具

| 仓库 | 简介 |
|---|---|
| **[agent-dbctl](https://github.com/x0c/agent-dbctl)** | 面向 AI Coding Agent 的企业级数据库执行门禁与本地审批控制台（基于 `@x0c/ui` 构建）。 |
| **[corral](https://github.com/corral-dev/corral)** | 统一检索、恢复并交接本地 Claude Code、Codex CLI、Cursor 与 OpenCode 会话历史。 |
| **[subswap](https://github.com/x0c/subswap)** | 查看剩余额度并在 Claude Code、Codex、Cursor、Kimi Code 与 OpenCode 之间免退出切换账号。 |
| **[agentsync](https://github.com/x0c/agentsync)** | 从单一本地真源跨工具同步 `AGENTS.md`、`CLAUDE.md`、Skills 与 MCP 配置。 |
| **[shell-gate](https://github.com/x0c/shell-gate)** | 基于 Go 的自托管 ttyd 浏览器终端网关，支持 Passkey、TOTP 两步验证与持久标签页。 |
