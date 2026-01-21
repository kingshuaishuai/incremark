import { defineConfig } from 'tsup';
import vue from 'esbuild-plugin-vue3';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts'
  },
  format: ['esm'],
  dts: false, // Vue SFC 不支持直接生成 dts，使用 vue-tsc 单独生成
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
  external: ['vue', '@incremark/vue', '@incremark/chat-core'],
  esbuildPlugins: [vue()],
});
