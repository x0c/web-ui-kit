import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const [tokens, ui] = process.argv.slice(2).map((arg) => resolve(arg))
if (!tokens || !ui) throw new Error('Pass the packed tokens and UI tarball paths')
const root = new URL('../', import.meta.url)
const version = (name) => JSON.parse(readFileSync(new URL(`node_modules/${name}/package.json`, root))).version
const consumer = mkdtempSync(join(tmpdir(), 'web-ui-kit-consumer-'))

function run(file, args) {
  const result = spawnSync(file, args, { cwd: consumer, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${file} failed (${result.status ?? result.signal})`)
}

try {
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies: {
      '@x0c/tokens': `file:${tokens}`,
      '@x0c/ui': `file:${ui}`,
      react: version('react'),
      'react-dom': version('react-dom'),
      'lucide-react': version('lucide-react'),
      tailwindcss: version('tailwindcss'),
    },
  }))
  run('npm', ['install', '--no-audit', '--no-fund'])
  writeFileSync(join(consumer, 'verify.mjs'), `
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Notice } from '@x0c/ui'

for (const [tone, role] of [['error', 'alert'], ['success', 'status'], ['warning', 'status'], ['info', 'status']]) {
  const markup = renderToStaticMarkup(createElement(Notice, { tone }, tone))
  assert.ok(markup.includes(\`role="\${role}"\`), \`Unexpected Notice role for \${tone}: \${markup}\`)
}
assert.match(renderToStaticMarkup(createElement(Button, {}, 'Continue')), /<button[^>]*>Continue<\\/button>/)
const css = (specifier) => readFileSync(new URL(import.meta.resolve(specifier)), 'utf8')
assert.match(css('@x0c/tokens/tokens.css'), /--background:/)
assert.match(css('@x0c/tokens/theme.css'), /--color-background:/)
assert.match(css('@x0c/ui/styles.css'), /theme\\.css/)
assert.ok(css('@x0c/ui/fonts.css').length > 0)
console.log('Installed tarballs: React rendering, Notice roles and CSS exports verified.')
`)
  run(process.execPath, ['verify.mjs'])
} finally {
  rmSync(consumer, { recursive: true, force: true })
}
