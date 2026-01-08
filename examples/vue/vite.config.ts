import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@incremark/core/engines/micromark': resolve(__dirname, '../../packages/core/src/engines/micromark/index.ts'),
      '@incremark/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@incremark/vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
      '@incremark/devtools': resolve(__dirname, '../../packages/devtools/src/index.ts'),
      '@incremark/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 自动导入 variables.less，这样所有 Less 文件都可以直接使用变量
        additionalData: `@import "${resolve(__dirname, '../../packages/theme/src/styles/variables.less')}";`
      }
    }
  }
})
