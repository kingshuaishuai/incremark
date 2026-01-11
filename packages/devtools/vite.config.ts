import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected'
      }
    }),
  ],
  resolve: {
    // 强制使用 browser 条件，优先加载客户端版本
    conditions: ['browser', 'import', 'module', 'default'],
  },
  define: {
    // 确保打包时知道这是客户端环境
    'import.meta.env.SSR': 'false',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IncremarkDevTools',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // 外部化 @incremark/core，它是 peerDependency
      external: ['@incremark/core'],
      output: {
        // 将所有代码打包到一个文件，避免动态导入警告
        inlineDynamicImports: true,
      },
    },
    // 内联所有依赖（包括 svelte 运行时）
    commonjsOptions: {
      include: [/node_modules/],
    },
    minify: 'esbuild',
    sourcemap: true,
    // 确保是客户端构建
    ssr: false,
  },
  // CSS 处理
  css: {
    postcss: {},
  },
})
