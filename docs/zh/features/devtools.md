# DevTools 开发工具

Incremark DevTools 提供了一个可视化界面，用于调试和检查增量 Markdown 渲染。它支持实时监控解析器状态、块详情、AST 结构和追加历史。

## 安装

::: code-group
```bash [npm]
npm install @incremark/devtools
```

```bash [pnpm]
pnpm add @incremark/devtools
```

```bash [yarn]
yarn add @incremark/devtools
```
:::

## 基本用法

### Vue

```vue
<script setup>
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/vue'
import { onMounted, onUnmounted } from 'vue'

// 创建 devtools 实例
const devtools = createDevTools({
  locale: 'zh-CN' // 'en-US' 或 'zh-CN'
})

onMounted(() => {
  devtools.mount()
})

onUnmounted(() => {
  devtools.unmount()
})
</script>

<template>
  <IncremarkContent
    :content="markdown"
    :devtools="devtools"
    devtoolsId="main-parser"
    devtoolsLabel="主内容"
  />
</template>
```

### React

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/react'
import { useEffect, useRef } from 'react'

function App() {
  const devtools = useRef(createDevTools({
    locale: 'zh-CN' // 'en-US' 或 'zh-CN'
  }))

  useEffect(() => {
    devtools.current.mount()
    return () => devtools.current.unmount()
  }, [])

  return (
    <IncremarkContent
      content={markdown}
      devtools={devtools.current}
      devtoolsId="main-parser"
      devtoolsLabel="主内容"
    />
  )
}
```

### Svelte

```svelte
<script lang="ts">
  import { createDevTools } from '@incremark/devtools'
  import { IncremarkContent } from '@incremark/svelte'
  import { onMount, onDestroy } from 'svelte'

  let devtools = createDevTools({
    locale: 'zh-CN' // 'en-US' 或 'zh-CN'
  })

  onMount(() => {
    devtools.mount()
  })

  onDestroy(() => {
    devtools.unmount()
  })
</script>

<IncremarkContent
  {content}
  {devtools}
  devtoolsId="main-parser"
  devtoolsLabel="主内容"
/>
```

### Solid

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/solid'
import { onMount, onCleanup } from 'solid-js'

const devtools = createDevTools({
  locale: 'zh-CN' // 'en-US' 或 'zh-CN'
})

onMount(() => {
  devtools.mount()
})

onCleanup(() => {
  devtools.unmount()
})

return (
  <IncremarkContent
    content={markdown()}
    devtools={devtools}
    devtoolsId="main-parser"
    devtoolsLabel="主内容"
  />
)
```

## 配置选项

```ts
const devtools = createDevTools({
  open: false,                    // 初始是否打开面板
  position: 'bottom-right',       // 位置: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'dark',                  // 主题: 'dark' | 'light'
  locale: 'zh-CN'                 // 语言: 'en-US' | 'zh-CN'
})
```

## 动态语言切换

您可以动态更改 DevTools 的语言：

```ts
import { setLocale } from '@incremark/devtools'

// 切换到中文
setLocale('zh-CN')

// 切换到英文
setLocale('en-US')
```

## IncremarkContent 属性

将 DevTools 与 `IncremarkContent` 一起使用时，您可以传递以下额外属性：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `devtools` | `IncremarkDevTools` | - | 要注册的 devtools 实例 |
| `devtoolsId` | `string` | 自动生成 | 在 devtools 中此解析器的唯一标识符 |
| `devtoolsLabel` | `string` | `devtoolsId` | 在 devtools 中此解析器的显示标签 |

## 功能特性

DevTools 提供四个主要选项卡：

### 概览
- 总块数
- 已完成和待处理的块
- 字符数
- 节点类型分布
- 当前流式处理状态

### 块
- 所有已解析块的列表
- 块详情（ID、类型、状态、原始文本）
- AST 节点检查
- 实时状态更新

### AST
- 完整的抽象语法树视图
- 交互式树结构
- 节点属性检查

### 时间线
- 带时间戳的追加历史
- 跟踪增量更新
- 块数随时间的变化

## 多解析器支持

DevTools 支持同时监控多个解析器：

```vue
<template>
  <IncremarkContent
    :content="content1"
    :devtools="devtools"
    devtoolsId="parser-1"
    devtoolsLabel="主内容"
  />
  <IncremarkContent
    :content="content2"
    :devtools="devtools"
    devtoolsId="parser-2"
    devtoolsLabel="侧边栏内容"
  />
</template>
```

使用 DevTools 中的下拉菜单在不同解析器之间切换。
