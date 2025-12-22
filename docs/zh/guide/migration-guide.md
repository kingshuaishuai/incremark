# 迁移指南：v0.1.x → v0.2.0

本文档将帮助你从 Incremark v0.1.x 升级到 v0.2.0。

## 概述

v0.2.0 引入了以下主要变更：

- ✨ **HTML 片段支持**：新增 HTML 元素渲染能力
- ✨ **Definition 和 FootnoteDefinition 支持**：支持引用式图片/链接和脚注
- ✨ **主题系统重构**：拆分独立的主题包，引入 Design Token
- 🔄 **打字机效果集成**：打字机效果现在集成在 `useIncremark` 中
- 🔄 **Vue/React API 对齐**：两个框架的 API 更加一致

## 安装变更

### 新增依赖

如果你需要使用主题功能，需要安装新的主题包：

```bash
# React
pnpm add @incremark/core @incremark/react @incremark/theme

# Vue
pnpm add @incremark/core @incremark/vue @incremark/theme
```

### 样式导入变更

**之前：**
```tsx
// React
import '@incremark/react/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/vue/style.css';
</style>
```

**现在（推荐）：**
```tsx
// React
import '@incremark/theme/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/theme/styles.css';
</style>
```

> **注意**：旧的样式导入路径仍然可用，但建议迁移到新的主题包。

## API 变更

### 1. 打字机效果集成

**之前：** 需要单独使用 `useBlockTransformer`

```tsx
// React v0.1.x
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()
  
  const sourceBlocks = useMemo(() => 
    completedBlocks.map(b => ({ id: b.id, node: b.node, status: b.status })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return <Incremark blocks={renderBlocks} />
}
```

**现在：** 打字机效果集成在 `useIncremark` 中

```tsx
// React v0.2.0
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, typewriter } = useIncremark({
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',
      cursor: '|'
    }
  })

  return (
    <>
      <Incremark blocks={blocks} />
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>Skip</button>
      )}
    </>
  )
}
```

**Vue 版本：**

```vue
<!-- Vue v0.2.0 -->
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, typewriter } = useIncremark({
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing',
    cursor: '|'
  }
})
</script>

<template>
  <div>
    <Incremark :blocks="blocks" />
    <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
      Skip
    </button>
  </div>
</template>
```

### 2. Incremark 组件 API 变更

**之前：**
```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

**现在（推荐）：** 可以传入 `incremark` 对象，自动提供 context

```tsx
// 推荐用法：传入 incremark 对象
const incremark = useIncremark()
return <Incremark incremark={incremark} />
```

或者继续使用原来的方式（仍然支持）：

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

### 3. 新增组件和功能

#### HTML 片段支持

v0.2.0 新增了对 HTML 片段的完整支持：

```tsx
// React
import { IncremarkHtmlElement } from '@incremark/react'

// 自定义 HTML 元素渲染
const customComponents = {
  htmlElement: IncremarkHtmlElement
}
```

Markdown 中的 HTML 片段会被自动解析为 `htmlElement` 节点：

```markdown
<div class="custom">
  <span>Hello</span>
</div>
```

#### 脚注支持

v0.2.0 新增了脚注功能：

```tsx
// React
import { Incremark, IncremarkFootnotes } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  
  return (
    <>
      <Incremark incremark={incremark} />
      {/* 脚注会自动在文档底部显示 */}
    </>
  )
}
```

Markdown 示例：

```markdown
这是一段文字[^1]，还有另一段[^2]。

[^1]: 这是第一个脚注
[^2]: 这是第二个脚注
```

#### Definition 支持

v0.2.0 支持引用式图片和链接：

```markdown
![图片][id]

[id]: https://example.com/image.png "图片标题"
```

### 4. 主题系统

#### 使用 ThemeProvider

**之前：** 没有统一的主题系统

**现在：** 使用 `ThemeProvider` 组件

```tsx
// React
import { ThemeProvider, Incremark } from '@incremark/react'
import { darkTheme } from '@incremark/theme'

function App() {
  const incremark = useIncremark()
  
  return (
    <ThemeProvider theme="dark">
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
}
```

或者使用自定义主题：

```tsx
import { ThemeProvider } from '@incremark/react'
import { defaultTheme, mergeTheme } from '@incremark/theme'

const customTheme = mergeTheme(defaultTheme, {
  color: {
    text: {
      primary: '#custom-color'
    }
  }
})

<ThemeProvider theme={customTheme}>
  <Incremark incremark={incremark} />
</ThemeProvider>
```

#### CSS 变量

v0.2.0 引入了基于 CSS 变量的主题系统：

```css
.incremark {
  --incremark-color-text-primary: #333;
  --incremark-color-code-background: #24292e;
  --incremark-border-radius-lg: 12px;
}
```

## 完整迁移示例

### React 应用迁移

**之前 (v0.1.x)：**

```tsx
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'
import '@incremark/react/styles.css'

function App() {
  const { completedBlocks, append, finalize } = useIncremark({ gfm: true })
  
  const sourceBlocks = useMemo(() => 
    completedBlocks.map(b => ({ id: b.id, node: b.node, status: b.status })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return <Incremark blocks={renderBlocks} />
}
```

**现在 (v0.2.0)：**

```tsx
import { useIncremark, Incremark, ThemeProvider } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const incremark = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing'
    }
  })

  return (
    <ThemeProvider theme="default">
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
}
```

### Vue 应用迁移

**之前 (v0.1.x)：**

```vue
<script setup>
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/vue'
</script>

<style>
@import '@incremark/vue/style.css';
</style>

<template>
  <Incremark :blocks="renderBlocks" />
</template>
```

**现在 (v0.2.0)：**

```vue
<script setup>
import { useIncremark, Incremark, ThemeProvider } from '@incremark/vue'
</script>

<style>
@import '@incremark/theme/styles.css';
</style>

<template>
  <ThemeProvider theme="default">
    <Incremark :incremark="incremark" />
  </ThemeProvider>
</template>
```

## 破坏性变更

### 1. useBlockTransformer 不再必需

如果你之前使用 `useBlockTransformer` 实现打字机效果，现在可以直接在 `useIncremark` 中配置。旧的 API 仍然可用，但建议迁移。

### 2. 样式导入路径变更

虽然旧的样式路径仍然可用，但建议迁移到 `@incremark/theme/styles.css`。

## 兼容性说明

- ✅ 旧的 `useBlockTransformer` API 仍然可用
- ✅ 旧的样式导入路径仍然可用
- ✅ `Incremark` 组件的 `blocks` prop 仍然可用
- ✅ 所有现有的自定义组件仍然可用

## 需要帮助？

如果在迁移过程中遇到问题，请：

1. 查看 [API 文档](/api/react) 或 [API 文档](/api/vue)
2. 查看 [完整示例](/guide/react) 或 [完整示例](/guide/vue)
3. 在 GitHub 上提交 [Issue](https://github.com/kingshuaishuai/incremark/issues)

