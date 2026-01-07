import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'detector/index': 'src/detector/index.ts',
    'utils/index': 'src/utils/index.ts',
    // 引擎独立入口（支持 tree-shaking）
    'engines/marked/index': 'src/engines/marked/index.ts',
    'engines/micromark/index': 'src/engines/micromark/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true
})

