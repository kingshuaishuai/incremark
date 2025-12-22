# 快速开始

本指南将帮助你在 5 分钟内集成 Incremark。

## 安装

::: code-group

```bash [pnpm]
pnpm add @incremark/core @incremark/vue @incremark/theme
```

```bash [npm]
npm install @incremark/core @incremark/vue @incremark/theme
```

```bash [yarn]
yarn add @incremark/core @incremark/vue @incremark/theme
```

:::

如果使用 React：

```bash
pnpm add @incremark/core @incremark/react @incremark/theme
```

如果使用 Svelte：

```bash
pnpm add @incremark/core @incremark/svelte @incremark/theme
```

> **注意**：`@incremark/theme` 是可选的，但推荐用于样式支持。

## Vue 集成

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import '@incremark/theme/styles.css'

// 创建解析器实例
const incremark = useIncremark({
  gfm: true  // 启用 GFM 扩展
})
const { blocks, append, finalize, reset } = incremark

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
  <!-- 推荐：传入 incremark 对象 -->
  <Incremark :incremark="incremark" />
</template>
```

## React 集成

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

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
      {/* 推荐：传入 incremark 对象 */}
      <Incremark incremark={incremark} />
    </>
  )
}
```

## Svelte 集成

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

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

<button on:click={simulateStream}>开始</button>
<!-- 推荐：传入 incremark 对象 -->
<Incremark {incremark} />
```

## 核心 API

### `useIncremark(options)`

返回值：

| 属性 | 类型 | 说明 |
|------|------|------|
| `markdown` | `string` | 已收集的完整 Markdown |
| `blocks` | `Block[]` | 所有块（含稳定 ID，如果启用了打字机效果则包含效果） |
| `completedBlocks` | `Block[]` | 已完成的块 |
| `pendingBlocks` | `Block[]` | 待处理的块 |
| `isFinalized` | `boolean` | 是否已完成解析 |
| `append(chunk)` | `Function` | 追加内容 |
| `finalize()` | `Function` | 完成解析 |
| `reset()` | `Function` | 重置状态 |
| `abort()` | `Function` | 中断解析 |
| `typewriter` | `TypewriterControls` | 打字机控制对象（如果启用） |

### 配置选项

```ts
interface UseIncremarkOptions extends ParserOptions {
  // 解析器选项
  gfm?: boolean              // 启用 GFM（表格、任务列表等）
  containers?: boolean       // 启用 ::: 容器语法
  extensions?: Extension[]   // 自定义 micromark 扩展
  mdastExtensions?: Extension[]  // 自定义 mdast 扩展
  
  // 打字机选项（v0.2.0+）
  typewriter?: {
    enabled?: boolean              // 启用/禁用（默认：如果提供了 typewriter 则为 true）
    charsPerTick?: number | [number, number]  // 每次显示的字符数（默认：[1, 3]）
    tickInterval?: number          // 更新间隔（毫秒，默认：30）
    effect?: 'none' | 'fade-in' | 'typing'  // 动画效果
    cursor?: string                // 光标字符（默认：'|'）
    pauseOnHidden?: boolean        // 页面隐藏时暂停（默认：true）
  }
}
```

## 启用 DevTools

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // 一行启用！
```

点击右下角的 🔧 按钮打开 DevTools 面板。

## v0.2.0 新功能

### HTML 片段

Markdown 中的 HTML 片段会被自动解析和渲染：

```markdown
<div class="custom">
  <span>Hello</span>
</div>
```

### 脚注

脚注会在文档底部自动渲染：

```markdown
文字[^1] 和更多[^2]

[^1]: 第一个脚注
[^2]: 第二个脚注
```

### 主题系统

使用 `ThemeProvider` 应用主题：

```tsx
import { ThemeProvider } from '@incremark/react'
import { darkTheme } from '@incremark/theme'

<ThemeProvider theme="dark">
  <Incremark incremark={incremark} />
</ThemeProvider>
```

## 下一步

- [迁移指南](./migration-guide) - 从 v0.1.x 升级到 v0.2.0
- [核心概念](./concepts) - 深入理解增量解析原理
- [Vue 集成](./vue) - Vue 完整指南
- [React 集成](./react) - React 完整指南
- [Svelte 集成](./svelte) - Svelte 完整指南

