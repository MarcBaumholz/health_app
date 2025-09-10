import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@state': '/src/state',
      '@components': '/src/components',
      '@lib': '/src/lib',
      '@routes': '/src/routes',
    },
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
  },
})
