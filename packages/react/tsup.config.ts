import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', '@incremark/core', '@incremark/devtools', '@incremark/theme', 'katex', 'mermaid', 'shiki']
})

