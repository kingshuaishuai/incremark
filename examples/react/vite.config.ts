import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@incremark/core': path.resolve(__dirname, '../../packages/core/src'),
      '@incremark/react': path.resolve(__dirname, '../../packages/react/src'),
      '@incremark/devtools': path.resolve(__dirname, '../../packages/devtools/src')
    }
  }
})

