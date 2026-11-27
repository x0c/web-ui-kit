**语言：** [English](README.md) | 简体中文

# web-ui-kit

基于 React 19、Radix UI 与 Tailwind CSS v4 的 Flat Monochrome 设计 Token（`@x0c/tokens`）与控制台组件库（`@x0c/ui`），适用于单二进制内嵌控制台和后台管理系统。

- **零品牌绑定**：开箱提供中性单色 Token 与通用组件；`AdminShell` 支持通过 `brand` 插槽注入自定义品牌标识，颜色与圆角支持通过 CSS 自定义属性覆盖。
- **封装成熟无头原语**：基于 Radix UI、`@tanstack/react-table`（`DataTable`）、`cmdk`（`CommandPalette`）、`sonner`（`Toaster`）与 `lucide-react`。
- **免鉴权 GitHub Release 压缩包分发**：直接从不可变 GitHub Release 安装（无需配置 npm 私有源或令牌，并由 `package-lock.json` 自动做 SHA-512 校验）。
- **字体按需打包**：`@x0c/ui/styles.css` 仅包含 Token 与样式规则并回退至系统字体，适合保持 Go `go:embed` 单二进制体积精简；需要内置 Geist / Geist Mono 可变字体时再按需引入 `@x0c/ui/fonts.css`。

## 包含包

| 包名 | 职责 | 说明 |
|---|---|---|
| `@x0c/ui` | 自包含的 React 19 基础原语、控制台模式与内置 Token | `AdminShell`、`DataTable`、`CommandPalette`、`FormDialog`、`Sheet`、`ConfirmAction`、`SecretDialog`、`Notice`、`StatusDot`、Radix 原语，以及 `./styles.css` / `./fonts.css`。 |
| [`@x0c/tokens`](packages/tokens) | 独立 CSS 变量与 Tailwind v4 `@theme inline` 契约 | 明暗/跟随系统配色 Token（`./theme.css`）、纯变量定义（`./tokens.css`）、可选 Geist 字体（`./fonts.css`）。 |

## 安装

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/v0.3.2/x0c-ui-0.3.2.tgz
npm install -D @tailwindcss/vite tailwindcss typescript
```

若仅需 CSS Token 而不引入 React 原语：

```bash
npm install https://github.com/x0c/web-ui-kit/releases/download/v0.3.2/x0c-tokens-0.3.2.tgz
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

使用 `SecretDialog` 展示一次性密钥时，可传入 `warningLabel`、`savedLabel`、`srDescription`、`copyLabel` 和 `copyFailedLabel` 提供本地化文案。关闭后的处理和各字段的标签仍由调用方负责。

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

如需只验证、不发布，运行 `python3 scripts/release.py --build-only --version v<包版本>`。命令会构建演示站，在 Chromium 中检查对比度和窄屏布局，再把实际压缩包安装到隔离的项目，验证 React 渲染和 CSS 导出。正式发布要求两个包的版本与标签一致，已有发布资源不会被覆盖。当前未承诺支持 React Server Components。

## 关联工具

| 仓库 | 简介 |
|---|---|
| **[agent-dbctl](https://github.com/x0c/agent-dbctl)** | 面向 AI Coding Agent 的企业级数据库执行门禁与本地审批控制台（基于 `@x0c/ui` 构建）。 |
| **[corral](https://github.com/corral-dev/corral)** | 统一检索、恢复并交接本地 Claude Code、Codex CLI、Cursor 与 OpenCode 会话历史。 |
| **[subswap](https://github.com/x0c/subswap)** | 查看剩余额度并在 Claude Code、Codex、Cursor、Kimi Code 与 OpenCode 之间免退出切换账号。 |
| **[agentsync](https://github.com/x0c/agentsync)** | 从单一本地真源跨工具同步 `AGENTS.md`、`CLAUDE.md`、Skills 与 MCP 配置。 |
| **[shell-gate](https://github.com/x0c/shell-gate)** | 基于 Go 的自托管 ttyd 浏览器终端网关，支持 Passkey、TOTP 两步验证与持久标签页。 |
