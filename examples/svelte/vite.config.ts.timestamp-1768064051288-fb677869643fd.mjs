// vite.config.ts
import { defineConfig } from "file:///Users/yishuai/develop/ai/markdown/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_less@4.5.1_sass@1.97.1/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/yishuai/develop/ai/markdown/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@4.0.4_svelte@5.46.0_vite@5.4.21_@types+node@20.19.27_less@4.5.1_sass@1.97.1_/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/yishuai/develop/ai/markdown/examples/svelte";
var vite_config_default = defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@incremark/core/engines/micromark": resolve(__vite_injected_original_dirname, "../../packages/core/src/engines/micromark/index.ts"),
      "@incremark/core": resolve(__vite_injected_original_dirname, "../../packages/core/src/index.ts"),
      "@incremark/svelte": resolve(__vite_injected_original_dirname, "../../packages/svelte/src/index.ts"),
      "@incremark/devtools": resolve(__vite_injected_original_dirname, "../../packages/devtools/src/index.ts"),
      "@incremark/shared": resolve(__vite_injected_original_dirname, "../../packages/shared/src/index.ts")
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 自动导入 variables.less，这样所有 Less 文件都可以直接使用变量
        additionalData: `@import "${resolve(__vite_injected_original_dirname, "../../packages/theme/src/styles/variables.less")}";`
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveWlzaHVhaS9kZXZlbG9wL2FpL21hcmtkb3duL2V4YW1wbGVzL3N2ZWx0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lpc2h1YWkvZGV2ZWxvcC9haS9tYXJrZG93bi9leGFtcGxlcy9zdmVsdGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lpc2h1YWkvZGV2ZWxvcC9haS9tYXJrZG93bi9leGFtcGxlcy9zdmVsdGUvdml0ZS5jb25maWcudHNcIjsvKipcbiAqIEBmaWxlIFZpdGUgXHU5MTREXHU3RjZFXG4gKiBAZGVzY3JpcHRpb24gU3ZlbHRlIFx1NzkzQVx1NEY4Qlx1OTg3OVx1NzZFRVx1NzY4NCBWaXRlIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBzdmVsdGUgfSBmcm9tICdAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtzdmVsdGUoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BpbmNyZW1hcmsvY29yZS9lbmdpbmVzL21pY3JvbWFyayc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZW5naW5lcy9taWNyb21hcmsvaW5kZXgudHMnKSxcbiAgICAgICdAaW5jcmVtYXJrL2NvcmUnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQGluY3JlbWFyay9zdmVsdGUnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3N2ZWx0ZS9zcmMvaW5kZXgudHMnKSxcbiAgICAgICdAaW5jcmVtYXJrL2RldnRvb2xzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kZXZ0b29scy9zcmMvaW5kZXgudHMnKSxcbiAgICAgICdAaW5jcmVtYXJrL3NoYXJlZCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9pbmRleC50cycpLFxuICAgIH1cbiAgfSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgbGVzczoge1xuICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgLy8gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1IHZhcmlhYmxlcy5sZXNzXHVGRjBDXHU4RkQ5XHU2ODM3XHU2MjQwXHU2NzA5IExlc3MgXHU2NTg3XHU0RUY2XHU5MEZEXHU1M0VGXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4XHU1M0Q4XHU5MUNGXG4gICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQGltcG9ydCBcIiR7cmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy90aGVtZS9zcmMvc3R5bGVzL3ZhcmlhYmxlcy5sZXNzJyl9XCI7YFxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUtBLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsY0FBYztBQUN2QixTQUFTLGVBQWU7QUFQeEIsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUFBLEVBQ2xCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLHFDQUFxQyxRQUFRLGtDQUFXLG9EQUFvRDtBQUFBLE1BQzVHLG1CQUFtQixRQUFRLGtDQUFXLGtDQUFrQztBQUFBLE1BQ3hFLHFCQUFxQixRQUFRLGtDQUFXLG9DQUFvQztBQUFBLE1BQzVFLHVCQUF1QixRQUFRLGtDQUFXLHNDQUFzQztBQUFBLE1BQ2hGLHFCQUFxQixRQUFRLGtDQUFXLG9DQUFvQztBQUFBLElBQzlFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osbUJBQW1CO0FBQUE7QUFBQSxRQUVuQixnQkFBZ0IsWUFBWSxRQUFRLGtDQUFXLGdEQUFnRCxDQUFDO0FBQUEsTUFDbEc7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
