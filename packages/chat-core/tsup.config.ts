import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/protocol/index.ts',
    'src/transport/index.ts',
    'src/processors/index.ts',
    'src/utils/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
});
