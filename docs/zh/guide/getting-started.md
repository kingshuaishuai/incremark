# 快速开始

本指南将帮助你在 5 分钟内集成 Incremark。

## 安装

::: code-group

```bash [pnpm]
pnpm add @incremark/core @incremark/vue
```

```bash [npm]
npm install @incremark/core @incremark/vue
```

```bash [yarn]
yarn add @incremark/core @incremark/vue
```

:::

如果使用 React：

```bash
pnpm add @incremark/core @incremark/react
```

## Vue 集成

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

// 创建解析器实例
const { blocks, append, finalize, reset } = useIncremark({
  gfm: true  // 启用 GFM 扩展
})

// 模拟 AI 流式输出
async function simulateStream() {
  reset()
  
  const text = '# Hello\n\nThis is **Incremark**!'
  const chunks = text.match(/.{1,5}/g) || []
  
  for (const chunk of chunks) {
    append(chunk)
    await new Promise(r => setTimeout(r, 50))
  }
  
  finalize()
}
</script>

<template>
  <button @click="simulateStream">开始</button>
  <Incremark :blocks="blocks" />
</template>
```

## React 集成

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function simulateStream() {
    reset()
    
    const text = '# Hello\n\nThis is **Incremark**!'
    const chunks = text.match(/.{1,5}/g) || []
    
    for (const chunk of chunks) {
      append(chunk)
      await new Promise(r => setTimeout(r, 50))
    }
    
    finalize()
  }

  return (
    <>
      <button onClick={simulateStream}>开始</button>
      <Incremark blocks={blocks} />
    </>
  )
}
```

## 核心 API

### `useIncremark(options)`

返回值：

| 属性 | 类型 | 说明 |
|------|------|------|
| `markdown` | `string` | 已收集的完整 Markdown |
| `blocks` | `Block[]` | 所有块（含稳定 ID） |
| `completedBlocks` | `Block[]` | 已完成的块 |
| `pendingBlocks` | `Block[]` | 待处理的块 |
| `append(chunk)` | `Function` | 追加内容 |
| `finalize()` | `Function` | 完成解析 |
| `reset()` | `Function` | 重置状态 |
| `abort()` | `Function` | 中断解析 |

### 配置选项

```ts
interface ParserOptions {
  gfm?: boolean              // 启用 GFM（表格、任务列表等）
  containers?: boolean       // 启用 ::: 容器语法
  extensions?: Extension[]   // 自定义 micromark 扩展
  mdastExtensions?: Extension[]  // 自定义 mdast 扩展
}
```

## 启用 DevTools

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // 一行启用！
```

点击右下角的 🔧 按钮打开 DevTools 面板。

## 下一步

- [核心概念](./concepts) - 深入理解增量解析原理
- [Vue 集成](./vue) - Vue 完整指南
- [React 集成](./react) - React 完整指南

