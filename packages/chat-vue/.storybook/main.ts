/// <reference types="vite/client" />

import remarkGfm from 'remark-gfm';
import { storySourcePlugin } from './vite-plugin-story-source.ts';

const config = {
  stories: [
    '../src/**/stories/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-links',
    '@storybook/addon-themes'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },
  viteFinal: async (config) => {
    const { default: vue } = await import('@vitejs/plugin-vue');
    config.plugins = [...(config.plugins || []), vue(), storySourcePlugin()];

    // 配置 workspace 包的路径解析
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};

    const path = await import('path');
    const url = new URL(import.meta.url);
    const __dirname = path.dirname(url.pathname);

    config.resolve.alias = {
      ...config.resolve.alias,
      '@incremark/vue': path.join(__dirname, '../../vue/dist/index.js'),
    };

    return config;
  },
};

export default config;
