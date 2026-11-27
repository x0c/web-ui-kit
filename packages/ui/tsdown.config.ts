import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: false,
  target: 'es2022',
  fixedExtension: false,
  failOnWarn: true,
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'lucide-react',
      'sonner',
      'radix-ui',
      'input-otp',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-table',
      'cmdk',
    ],
  },
})
