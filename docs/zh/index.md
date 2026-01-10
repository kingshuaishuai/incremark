---
layout: home

hero:
  name: Incremark
  text: 增量式 Markdown 解析器
  tagline: 专为 AI 流式输出设计，极致性能体验。
  image:
    src: /logo.svg
    alt: Incremark
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: Vue 演示
      link: https://vue.incremark.com/
    - theme: alt
      text: React 演示
      link: https://react.incremark.com/
    - theme: alt
      text: Svelte 演示
      link: https://svelte.incremark.com/
    - theme: alt
      text: Solid 演示
      link: https://solid.incremark.com/
    - theme: alt
      text: GitHub
      link: https://github.com/kingshuaishuai/incremark

features:
  - icon: ⚡
    title: 增量解析
    details: 只解析新增内容，已完成的块不再重复处理，大幅降低 CPU 开销。
  - icon: 🔄
    title: 流式友好
    details: 专为 AI 流式输出场景设计，支持逐字符、逐行、逐块输入。
  - icon: 🎯
    title: 精确边界检测
    details: 智能识别 Markdown 块边界，支持代码块、列表、引用等复杂嵌套结构。
  - icon: 🔌
    title: 框架无关
    details: 核心库与框架解耦，提供 Vue、React、Svelte、Solid 官方集成，易于扩展其他框架。
  - icon: 📊
    title: DevTools
    details: 内置开发者工具，可视化查看解析状态、块结构和性能指标。
  - icon: 🎨
    title: 高度可定制
    details: 支持自定义渲染组件、扩展语法（GFM、数学公式、Mermaid 等）。
  - icon: 🌐
    title: SSR 友好
    details: 完整支持服务端渲染，兼容 Nuxt、Next.js 和 SvelteKit。
  - icon: ♿
    title: 国际化与无障碍
    details: 内置多语言支持，遵循 WAI-ARIA 规范，对屏幕阅读器友好。
---

## 为什么选择 Incremark？

传统 Markdown 解析器每次收到新内容都会**重新解析整个文档**，导致 O(n²) 的复杂度。Incremark 的增量解析实现了 O(n) —— 文档越大，优势越明显：

| 文件 | 行数 | Incremark | Streamdown | markstream | ant-design-x |
|------|------|-----------|------------|------------|--------------|
| concepts.md | 91 | 12.0 ms | 50.5 ms (**4.2x**) | 381.9 ms (**31.9x**) | 53.6 ms (**4.5x**) |
| comparison.md | 109 | 20.5 ms | 74.0 ms (**3.6x**) | 552.2 ms (**26.9x**) | 85.2 ms (**4.1x**) |
| complex-html.md | 147 | 9.0 ms | 58.8 ms (**6.6x**) | 279.3 ms (**31.1x**) | 57.2 ms (**6.4x**) |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 208.4 ms (**10.9x**) | 980.6 ms (**51.3x**) | 217.8 ms (**11.4x**) |
| test-md-01.md | 916 | 87.7 ms | 1441.1 ms (**16.4x**) | 5754.7 ms (**65.6x**) | 1656.9 ms (**18.9x**) |
| **总计 (38个文件)** | **6484** | **519.4 ms** | **3190.3 ms** (**6.1x**) | **14683.9 ms** (**28.3x**) | **3728.6 ms** (**7.2x**) |

> 📊 基准测试: 38 个真实 Markdown 文件，共 128.55 KB。[查看完整结果 →](/zh/advanced/engines#完整测试结果)

## 快速体验

::: code-group

```bash [Vue]
pnpm add @incremark/vue @incremark/theme
```

```bash [React]
pnpm add @incremark/react @incremark/theme
```

```bash [Svelte]
pnpm add @incremark/svelte @incremark/theme
```

```bash [Solid]
pnpm add @incremark/solid @incremark/theme
```

:::

::: code-group

```vue [Vue]
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/theme/styles.css'

const content = ref('')
const isFinished = ref(false)

// 处理 AI 流式输出
async function handleStream(stream) {
  for await (const chunk of stream) {
    content.value += chunk
  }
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent :content="content" :is-finished="isFinished" />
</template>
```

```tsx [React]
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // 处理 AI 流式输出
  async function handleStream(stream) {
    for await (const chunk of stream) {
      setContent(prev => prev + chunk)
    }
    setIsFinished(true)
  }

  return <IncremarkContent content={content} isFinished={isFinished} />
}
```

```svelte [Svelte]
<script>
import { IncremarkContent } from '@incremark/svelte'
import '@incremark/theme/styles.css'

let content = $state('')
let isFinished = $state(false)

// 处理 AI 流式输出
async function handleStream(stream) {
  for await (const chunk of stream) {
    content += chunk
  }
  isFinished = true
}
</script>

<IncremarkContent {content} {isFinished} />
```

```tsx [Solid]
import { createSignal } from 'solid-js'
import { IncremarkContent } from '@incremark/solid'
import '@incremark/theme/styles.css'

function App() {
  const [content, setContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  // 处理 AI 流式输出
  async function handleStream(stream) {
    for await (const chunk of stream) {
      setContent(prev => prev + chunk)
    }
    setIsFinished(true)
  }

  return <IncremarkContent content={content()} isFinished={isFinished()} />
}
```

:::
