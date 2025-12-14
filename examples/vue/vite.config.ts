import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@incremark/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@incremark/vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
      '@incremark/devtools': resolve(__dirname, '../../packages/devtools/src/index.ts')
    }
  }
})
