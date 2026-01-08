import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@incremark/core/engines/micromark': path.resolve(__dirname, '../../packages/core/src/engines/micromark/index.ts'),
      '@incremark/core': path.resolve(__dirname, '../../packages/core/src'),
      '@incremark/react': path.resolve(__dirname, '../../packages/react/src'),
      '@incremark/devtools': path.resolve(__dirname, '../../packages/devtools/src'),
      '@incremark/shared': path.resolve(__dirname, '../../packages/shared/src'),
      // '@incremark/theme': path.resolve(__dirname, '../../packages/theme/src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 自动导入 variables.less，这样所有 Less 文件都可以直接使用变量
        additionalData: `@import "${path.resolve(__dirname, '../../packages/theme/src/styles/variables.less')}";`
      }
    }
  }
})

