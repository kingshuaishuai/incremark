/**
 * @file Vite 配置
 * @description Svelte 示例项目的 Vite 配置
 */

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@incremark/core/engines/micromark': resolve(__dirname, '../../packages/core/src/engines/micromark/index.ts'),
      '@incremark/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@incremark/svelte': resolve(__dirname, '../../packages/svelte/src/index.ts'),
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

