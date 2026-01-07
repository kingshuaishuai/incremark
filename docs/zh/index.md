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
    details: 核心库与框架解耦，提供 Vue、React、Svelte 官方集成，易于扩展其他框架。
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

传统 Markdown 解析器在 AI 流式输出场景中存在严重的性能问题：

| 文档大小 | 节省时间 | 加速比 |
|---------|---------|--------|
| 短文档 (~1KB) | 37% | **1.6x** |
| 中等文档 (~5KB) | 86% | **7.4x** |
| 长文档 (~10KB) | 93% | **13.6x** |
| 超长文档 (~20KB) | 96% | **27.1x** 🚀 |

## 快速体验

```bash
# 安装
pnpm add @incremark/core @incremark/vue

# 或使用 React
pnpm add @incremark/core @incremark/react

# 或使用 Svelte
pnpm add @incremark/core @incremark/svelte
```

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize } = useIncremark()

// 处理 AI 流式输出
async function handleStream(stream) {
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <Incremark :blocks="blocks" />
</template>
```
