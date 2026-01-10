import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '@incremark/core/engines/micromark': resolve(__dirname, '../../packages/core/src/engines/micromark/index.ts'),
      '@incremark/core': resolve(__dirname, '../../packages/core/src'),
      '@incremark/solid': resolve(__dirname, '../../packages/solid/src'),
      '@incremark/devtools': resolve(__dirname, '../../packages/devtools/src'),
      '@incremark/shared': resolve(__dirname, '../../packages/shared/src'),
      '@incremark/theme/styles.css': resolve(__dirname, '../../packages/theme/dist/styles.css'),
      '@incremark/theme': resolve(__dirname, '../../packages/theme/src'),
      '@incremark/icons': resolve(__dirname, '../../packages/icons/src'),
    }
  },
  esbuild: {
    jsxImportSource: 'solid-js',
    jsx: 'automatic'
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 自动导入 variables.less，这样所有 Less 文件都可以直接使用变量
        additionalData: `@import "${resolve(__dirname, '../../packages/theme/src/styles/variables.less')}";`
      }
    }
  },
  server: {
    port: 3001,
    strictPort: true
  },
  build: {
    target: 'esnext'
  }
})
