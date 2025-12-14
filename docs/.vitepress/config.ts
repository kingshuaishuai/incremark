import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Incremark',
  description: 'Incremental Markdown Parser for AI Streaming',
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'API', link: '/api/core' },
          { text: 'GitHub', link: 'https://github.com/example/incremark' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/introduction' },
                { text: 'Quick Start', link: '/guide/getting-started' },
                { text: 'Core Concepts', link: '/guide/concepts' }
              ]
            },
            {
              text: 'Framework Integration',
              items: [
                { text: 'Vue', link: '/guide/vue' },
                { text: 'React', link: '/guide/react' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Custom Components', link: '/guide/custom-components' },
                { text: 'DevTools', link: '/guide/devtools' },
                { text: 'Extensions', link: '/guide/extensions' }
              ]
            }
          ],
          '/api/': [
            {
              text: 'API Reference',
              items: [
                { text: '@incremark/core', link: '/api/core' },
                { text: '@incremark/vue', link: '/api/vue' },
                { text: '@incremark/react', link: '/api/react' },
                { text: '@incremark/devtools', link: '/api/devtools' }
              ]
            }
          ]
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/introduction' },
          { text: 'API', link: '/zh/api/core' },
          { text: 'GitHub', link: 'https://github.com/example/incremark' }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '开始',
              items: [
                { text: '介绍', link: '/zh/guide/introduction' },
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '核心概念', link: '/zh/guide/concepts' }
              ]
            },
            {
              text: '框架集成',
              items: [
                { text: 'Vue', link: '/zh/guide/vue' },
                { text: 'React', link: '/zh/guide/react' }
              ]
            },
            {
              text: '高级',
              items: [
                { text: '自定义组件', link: '/zh/guide/custom-components' },
                { text: 'DevTools', link: '/zh/guide/devtools' },
                { text: '扩展支持', link: '/zh/guide/extensions' }
              ]
            }
          ],
          '/zh/api/': [
            {
              text: 'API 参考',
              items: [
                { text: '@incremark/core', link: '/zh/api/core' },
                { text: '@incremark/vue', link: '/zh/api/vue' },
                { text: '@incremark/react', link: '/zh/api/react' },
                { text: '@incremark/devtools', link: '/zh/api/devtools' }
              ]
            }
          ]
        },
        outlineTitle: '目录',
        lastUpdatedText: '最后更新',
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/example/incremark' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },

    search: {
      provider: 'local'
    }
  }
})
