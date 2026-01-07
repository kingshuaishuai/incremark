import { defineConfig } from 'vitepress'
import { vitepressMermaidPreview } from 'vitepress-mermaid-preview';


const shared = {
  title: "Incremark",
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kingshuaishuai/incremark' }
    ]
  }
}

const en = {
  label: 'English',
  lang: 'en',
  link: '/',
  description: "High-performance streaming markdown renderer",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/quick-start' },
      { text: 'Features', link: '/features/basic-usage' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/openai' },
      { text: 'Roadmap', link: '/roadmap' },
      { text: 'GitHub', link: 'https://github.com/kingshuaishuai/incremark' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Core Concepts', link: '/guide/concepts' },
            { text: 'Comparison', link: '/guide/comparison' }
          ]
        }
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Basic Usage', link: '/features/basic-usage' },
            { text: 'Typewriter Effect', link: '/features/typewriter' },
            { text: 'HTML Elements', link: '/features/html-elements' },
            { text: 'Footnotes', link: '/features/footnotes' },
            { text: 'Custom Containers', link: '/features/custom-containers' },
            { text: 'Custom Components', link: '/features/custom-components' },
            { text: 'Custom Code Blocks', link: '/features/custom-codeblocks' },
            { text: 'Themes', link: '/features/themes' },
            { text: 'Auto Scroll', link: '/features/auto-scroll' },
            { text: 'DevTools', link: '/features/devtools' }
          ]
        }
      ],
      '/advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Architecture', link: '/advanced/architecture' },
            { text: 'Extensions', link: '/advanced/extensions' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'OpenAI', link: '/examples/openai' },
            { text: 'Anthropic', link: '/examples/anthropic' },
            { text: 'Vercel AI SDK', link: '/examples/vercel-ai' },
            { text: 'Custom Stream', link: '/examples/custom-stream' }
          ]
        }
      ],
      '/migration/': [
        {
          text: 'Migration',
          items: [
            { text: 'v0 to v1', link: '/migration/v0-to-v1' }
          ]
        }
      ]
    }
  }
}

const zh = {
  label: '简体中文',
  lang: 'zh',
  link: '/zh/',
  description: "高性能流式 Markdown 渲染器",
  themeConfig: {
    nav: [
      { text: '指南', link: '/zh/guide/quick-start' },
      { text: '功能', link: '/zh/features/basic-usage' },
      { text: 'API', link: '/zh/api/' },
      { text: '示例', link: '/zh/examples/openai' },
      { text: '路线图', link: '/zh/roadmap' },
      { text: 'GitHub', link: 'https://github.com/kingshuaishuai/incremark' }
    ],
    sidebar: {
      '/zh/guide/': [
        {
          text: '快速开始',
          items: [
            { text: '介绍', link: '/zh/guide/introduction' },
            { text: '快速上手', link: '/zh/guide/quick-start' },
            { text: '核心概念', link: '/zh/guide/concepts' },
            { text: '方案对比', link: '/zh/guide/comparison' }
          ]
        }
      ],
      '/zh/features/': [
        {
          text: '功能特性',
          items: [
            { text: '基础用法', link: '/zh/features/basic-usage' },
            { text: '打字机效果', link: '/zh/features/typewriter' },
            { text: 'HTML 元素', link: '/zh/features/html-elements' },
            { text: '脚注', link: '/zh/features/footnotes' },
            { text: '自定义容器', link: '/zh/features/custom-containers' },
            { text: '自定义组件', link: '/zh/features/custom-components' },
            { text: '自定义代码块', link: '/zh/features/custom-codeblocks' },
            { text: '主题', link: '/zh/features/themes' },
            { text: '自动滚动', link: '/zh/features/auto-scroll' },
            { text: '开发者工具', link: '/zh/features/devtools' }
          ]
        }
      ],
      '/zh/advanced/': [
        {
          text: '进阶',
          items: [
            { text: '架构原理', link: '/zh/advanced/architecture' },
            { text: '扩展功能', link: '/zh/advanced/extensions' }
          ]
        }
      ],
      '/zh/examples/': [
        {
          text: '示例',
          items: [
            { text: 'OpenAI', link: '/zh/examples/openai' },
            { text: 'Anthropic', link: '/zh/examples/anthropic' },
            { text: 'Vercel AI SDK', link: '/zh/examples/vercel-ai' },
            { text: '自定义流', link: '/zh/examples/custom-stream' }
          ]
        }
      ],
      '/zh/migration/': [
        {
          text: '迁移',
          items: [
            { text: 'v0 到 v1', link: '/zh/migration/v0-to-v1' }
          ]
        }
      ]
    },
    outlineTitle: '页面导航',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
}

export default defineConfig({
  ...shared,
  markdown: {
    config: (md) => {
      vitepressMermaidPreview(md);
    }
  },
  locales: {
    root: en,
    zh: zh
  }
})
