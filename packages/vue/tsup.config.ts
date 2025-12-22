import { defineConfig } from 'tsup'
import vue from 'esbuild-plugin-vue3'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['esm'],
  dts: false, // Vue SFC 不支持直接生成 dts，使用源码提供类型
  clean: true,
  external: ['vue', '@incremark/core', '@incremark/devtools', '@incremark/theme', 'katex', 'mermaid', 'shiki'],
  sourcemap: true,
  esbuildPlugins: [vue()]
})
