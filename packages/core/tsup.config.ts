import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'detector/index': 'src/detector/index.ts',
    'utils/index': 'src/utils/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true
})

