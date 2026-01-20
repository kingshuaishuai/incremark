import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/protocol/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
});
