---
layout: home

hero:
  name: Incremark
  text: 增量式 Markdown 解析器
  tagline: 专为 AI 流式输出设计，节省 90% 解析开销
  image:
    src: /logo.svg
    alt: Incremark
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/example/incremark

features:
  - icon: ⚡
    title: 增量解析
    details: 只解析新增内容，已完成的块不再重复处理，大幅降低 CPU 开销
  - icon: 🔄
    title: 流式友好
    details: 专为 AI 流式输出场景设计，支持逐字符、逐行、逐块输入
  - icon: 🎯
    title: 精确边界检测
    details: 智能识别 Markdown 块边界，支持代码块、列表、引用等复杂嵌套结构
  - icon: 🔌
    title: 框架无关
    details: 核心库与框架解耦，提供 Vue、React 官方集成，易于扩展其他框架
  - icon: 📊
    title: DevTools
    details: 内置开发者工具，可视化查看解析状态、块结构和性能指标
  - icon: 🎨
    title: 高度可定制
    details: 支持自定义渲染组件、扩展语法（GFM、数学公式、Mermaid 等）
---

## 为什么选择 Incremark？

传统 Markdown 解析器在 AI 流式输出场景中存在严重的性能问题：

| 场景 | 传统方式 | Incremark |
|------|----------|-----------|
| 1000 字符输入 | 解析 ~50 万字符 | 解析 ~5 万字符 |
| CPU 占用 | 高，页面卡顿 | 低，流畅运行 |
| 内存使用 | 反复创建 AST | 增量更新，复用节点 |

## 快速体验

```bash
# 安装
pnpm add @incremark/core @incremark/vue

# 或使用 React
pnpm add @incremark/core @incremark/react
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

