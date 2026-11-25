# Admin SPA Starter

Quick-start template for a React 19 + Tailwind CSS v4 admin or developer console embedded in a single binary (such as Go `go:embed`).

## 1. Dependencies

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/v0.3.0/x0c-ui-0.3.0.tgz
npm install -D @tailwindcss/vite tailwindcss vite typescript @types/react @types/react-dom
```

## 2. `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Service Console</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 3. `src/index.css`

```css
@import "tailwindcss";
@import "@x0c/ui/styles.css";
/* Optional: bundle Geist & Geist Mono fonts instead of system UI/monospace fallbacks */
/* @import "@x0c/ui/fonts.css"; */
```

## 4. `src/App.tsx`

Import `AdminShell`, `PageHeader`, `MetricStrip`, `Panel`, `InsetList`, `Row`, `DataTable`, `FormDialog`, `Sheet`, `ConfirmAction`, `SecretDialog`, `Notice`, `StatusDot`, `Toaster`, and `createAdminClient` from `@x0c/ui`. Pass a custom `brand` React node to `AdminShell` if you want a custom brand lockup alongside `product`.
