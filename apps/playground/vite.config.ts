import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/]react(-dom)?[\\/]/, priority: 30 },
            { name: 'radix', test: /node_modules[\\/]radix-ui[\\/]/, priority: 25 },
            { name: 'table', test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 15 },
          ],
        },
      },
    },
  },
})
