import { defineConfig } from 'tsup';
import vue from 'esbuild-plugin-vue3';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts'
  },
  format: ['esm'],
  dts: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
  external: ['vue', '@incremark/vue', '@incremark/chat-core'],
  esbuildPlugins: [vue()],
});
