import { defineConfig, type HeadConfig } from 'vitepress'
import taskLists from 'markdown-it-task-lists';
import { vitepressMermaidPreview } from 'vitepress-mermaid-preview';
import llms from 'vitepress-plugin-llms'



const shared = {
  title: "Incremark",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'keywords', content: 'markdown, streaming, incremental, parser, ai, chatgpt, llm, typewriter, performance, vue, react, svelte' }],
    ['meta', { name: 'author', content: 'Incremark' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Incremark - High-performance streaming markdown renderer' }],
    ['meta', { property: 'og:description', content: 'A context-aware incremental markdown parser specifically designed for AI streaming output scenarios.' }],
    ['meta', { property: 'og:image', content: 'https://www.incremark.com/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Incremark' }],
    ['meta', { name: 'twitter:description', content: 'High-performance streaming markdown renderer for AI apps.' }],
  ] as HeadConfig[],
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kingshuaishuai/incremark' }
    ],
    search: {
      provider: 'local'
    }
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
      { text: 'Advanced', link: '/advanced/architecture' },
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
            { text: 'Why Incremark', link: '/guide/why-incremark' },
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
            { text: 'i18n & Accessibility', link: '/features/i18n' },
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
            { text: 'Engines', link: '/advanced/engines' },
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
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            placeholder: 'Search documentation...',
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search documentation'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: 'Clear query',
                  resetButtonAriaLabel: 'Clear query',
                  cancelButtonText: 'Cancel',
                  cancelButtonAriaLabel: 'Cancel'
                },
                startScreen: {
                  recentSearchesTitle: 'Recent searches',
                  noRecentSearchesText: 'No recent searches',
                  saveRecentSearchButtonTitle: 'Save recent search',
                  removeRecentSearchButtonTitle: 'Remove from recent searches',
                  favoriteSearchesTitle: 'Favorite searches',
                  removeFavoriteSearchButtonTitle: 'Remove from favorite searches'
                },
                errorScreen: {
                  titleText: 'Unable to get results',
                  helpText: 'Check your network connection'
                },
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close',
                  searchByText: 'Search by'
                },
                noResultsScreen: {
                  noResultsText: 'No results for',
                  suggestedQueryText: 'Try searching for',
                  reportMissingResultsText: 'Do you believe this query should yield results?',
                  reportMissingResultsLinkText: 'Tell us'
                }
              }
            }
          }
        }
      }
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
      { text: '进阶', link: '/zh/advanced/architecture' },
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
            { text: '为什么选择 Incremark', link: '/zh/guide/why-incremark' },
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
            { text: '国际化与无障碍', link: '/zh/features/i18n' },
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
            { text: '双引擎', link: '/zh/advanced/engines' },
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
    },
    outlineTitle: '页面导航',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            placeholder: '搜索文档...',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '请检查网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                }
              }
            }
          }
        }
      }
    }
  }
}

export default defineConfig({
  ...shared,
  markdown: {
    config: (md) => {
      md.use(taskLists);
      vitepressMermaidPreview(md);
    }
  },
  locales: {
    root: en,
    zh: zh
  },
  sitemap: {
    hostname: 'https://www.incremark.com'
  },
  vite: {
    plugins: [
      llms()
    ]
  }
})
