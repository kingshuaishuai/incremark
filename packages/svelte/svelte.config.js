/**
 * @file Svelte 包配置
 * @description
 * `@sveltejs/package` 的 `svelte-package` 会读取此配置，用于预处理 Svelte 组件（含 TypeScript）。
 */

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
  preprocess: vitePreprocess(),
}

export default config


