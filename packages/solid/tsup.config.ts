import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'solid-js',
    'solid-js/web',
    'solid-js/store',
    'katex',
    'mermaid',
    '@incremark/core',
    '@incremark/devtools',
    '@incremark/icons',
    '@incremark/shared',
    '@incremark/theme',
    'shiki',
    'shiki-stream',
    '@shikijs/core',
    'mdast',
    '@antfu/utils'
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'solid-js'
    options.loader = {
      '.ts': 'tsx',
      '.tsx': 'tsx'
    }
  }
})
