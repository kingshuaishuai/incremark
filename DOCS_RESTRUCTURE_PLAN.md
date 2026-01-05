# Incremark 文档重构计划

## 现状问题

### 1. 结构问题
- **重复内容过多**：Vue/React/Svelte 三个框架的集成页面内容高度相似
- **API 文档与指南混淆**：`getting-started.md` 里有大量 API 介绍
- **层级不清晰**：Features 里的分类不够细致

### 2. API 过时
- `useStreamRenderer` 已弃用但仍占用篇幅
- 缺少 `IncremarkContent` 组件文档
- Svelte 示例使用旧语法（`on:click` → `onclick`）
- 缺少 `DefinitionsProvider` / `useDefinitions` 等 Context API
- `IncrementalUpdate` 缺少 `definitions`、`footnoteDefinitions`、`footnoteReferenceOrder` 字段

### 3. 示例代码问题
- 示例过于复杂，快速开始应该是最简用法
- 打字机效果示例需要手动组合多个 composable
- 缺少真实场景示例（接入 AI API、SSE 流处理）

### 4. 缺失内容
- 无 `@incremark/theme` 单独 API 文档
- 无架构图和原理图解
- 无真实 AI 接入示例

---

## 新目录结构

```
docs/
├── index.md                      # 首页
│
├── guide/
│   ├── introduction.md           # 介绍：什么是 Incremark，核心价值
│   ├── quick-start.md            # 快速开始：5分钟上手，最简用法
│   ├── concepts.md               # 核心概念：增量解析、稳定边界、Block 生命周期
│   └── comparison.md             # 方案对比：vs marked, markdown-it, react-markdown
│
├── features/
│   ├── basic-usage.md            # 基础用法：IncremarkContent 完整 API
│   ├── typewriter.md             # 打字机效果：配置 + API
│   ├── auto-scroll.md            # 自动滚动：配置 + API
│   ├── themes.md                 # 主题系统：内置主题 + 自定义
│   ├── custom-components.md      # 自定义渲染组件
│   ├── custom-containers.md      # 自定义容器（:::）
│   ├── custom-codeblocks.md      # 自定义代码块（mermaid, echarts 等）
│   ├── footnotes.md              # 脚注支持
│   ├── html-elements.md          # HTML 片段渲染
│   └── devtools.md               # DevTools 开发者工具
│
├── advanced/
│   ├── architecture.md           # 架构原理（带图解）
│   └── extensions.md             # micromark/mdast 扩展
│
├── examples/
│   ├── openai.md                 # 接入 OpenAI
│   ├── anthropic.md              # 接入 Anthropic Claude
│   ├── vercel-ai.md              # 接入 Vercel AI SDK
│   └── custom-stream.md          # 自定义流处理
│
└── migration/
    └── v0-to-v1.md               # 迁移指南
```

---

## 设计原则

### 1. 使用 code-group 切换多框架代码

所有涉及多框架的代码示例，统一使用 VitePress 的 code-group 语法：

```markdown
::: code-group
\`\`\`vue [Vue]
// Vue 代码
\`\`\`

\`\`\`tsx [React]
// React 代码
\`\`\`

\`\`\`svelte [Svelte]
// Svelte 代码
\`\`\`
:::
```

### 2. 每个 Feature 页面 = 用法 + API

不再单独维护 `/api/` 目录，每个 Feature 页面包含：
- 简单示例
- 完整配置
- Props/Options 说明
- 相关 API

---

## 各页面内容规划

### guide/quick-start.md

**目标**：5 分钟内跑通，只展示最简用法

#### 安装

::: code-group
```bash [pnpm]
pnpm add @incremark/vue
# 或
pnpm add @incremark/react
# 或
pnpm add @incremark/svelte
```

```bash [npm]
npm install @incremark/vue
```

```bash [yarn]
yarn add @incremark/vue
```
:::

#### 基础示例

::: code-group
```vue [Vue]
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

async function simulateStream() {
  content.value = ''
  isFinished.value = false

  const text = '# Hello\n\nThis is **Incremark**!'
  for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
    content.value += chunk
    await new Promise(r => setTimeout(r, 50))
  }
  isFinished.value = true
}
</script>

<template>
  <button @click="simulateStream">Start</button>
  <IncremarkContent :content="content" :is-finished="isFinished" />
</template>
```

```tsx [React]
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  async function simulateStream() {
    setContent('')
    setIsFinished(false)

    const text = '# Hello\n\nThis is **Incremark**!'
    let acc = ''
    for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
      acc += chunk
      setContent(acc)
      await new Promise(r => setTimeout(r, 50))
    }
    setIsFinished(true)
  }

  return (
    <>
      <button onClick={simulateStream}>Start</button>
      <IncremarkContent content={content} isFinished={isFinished} />
    </>
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'

  let content = $state('')
  let isFinished = $state(false)

  async function simulateStream() {
    content = ''
    isFinished = false

    const text = '# Hello\n\nThis is **Incremark**!'
    for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
      content += chunk
      await new Promise(r => setTimeout(r, 50))
    }
    isFinished = true
  }
</script>

<button onclick={simulateStream}>Start</button>
<IncremarkContent {content} {isFinished} />
```
:::

#### 使用 Stream 模式

```vue
<script setup>
import { IncremarkContent } from '@incremark/vue'

async function* fetchAIStream() {
  const res = await fetch('/api/chat', { method: 'POST' })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield decoder.decode(value)
  }
}
</script>

<template>
  <IncremarkContent :stream="fetchAIStream" />
</template>
```

就这些，不展开更多。

---

### guide/concepts.md

**内容**：
1. 增量解析 vs 全量解析
2. Block 的状态：`pending` → `completed`
3. 稳定边界检测原理（简述）
4. 为什么需要 `isFinished`

**配图**：数据流图

```
Markdown Text
     ↓
IncremarkContent (或 useIncremark)
     ↓
┌─────────────────────────┐
│ IncremarkParser         │
│ - Boundary Detection    │
│ - AST Building          │
└─────────────────────────┘
     ↓
┌─────────────────────────┐
│ completedBlocks         │ ← 稳定，不会再变
│ pendingBlocks           │ ← 可能继续变化
└─────────────────────────┘
     ↓
BlockTransformer (打字机效果，可选)
     ↓
Renderer
```

---

### features/basic-usage.md

**IncremarkContent 组件完整用法**

#### 两种输入模式

1. **content 模式**：传入累积的字符串 + isFinished 标志
2. **stream 模式**：传入返回 AsyncGenerator 的函数

#### Props 说明

```ts
interface IncremarkContentProps {
  // 输入（二选一）
  content?: string                       // 累积字符串
  stream?: () => AsyncGenerator<string>  // 异步生成器函数

  // 状态
  isFinished?: boolean                   // 流结束标志（content 模式必需）

  // 配置
  incremarkOptions?: UseIncremarkOptions // 解析器 + 打字机配置

  // 自定义渲染
  components?: ComponentMap              // 自定义组件
  customContainers?: Record<string, Component>
  customCodeBlocks?: Record<string, Component>
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // 样式
  showBlockStatus?: boolean              // 显示 block 状态边框
  pendingClass?: string                  // pending block 的 CSS 类
}
```

#### UseIncremarkOptions

```ts
interface UseIncremarkOptions {
  // 解析器选项
  gfm?: boolean              // GFM 支持（表格、任务列表等）
  math?: boolean             // 数学公式支持
  htmlTree?: boolean         // HTML 片段解析
  containers?: boolean       // ::: 容器语法

  // 打字机选项
  typewriter?: {
    enabled?: boolean
    charsPerTick?: number | [number, number]
    tickInterval?: number
    effect?: 'none' | 'fade-in' | 'typing'
    cursor?: string
  }
}
```

#### 进阶：使用 useIncremark

当需要更细粒度控制时：

::: code-group
```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

async function handleStream(stream) {
  reset()
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

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }

  return <Incremark blocks={blocks} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'

  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }
</script>

<Incremark {blocks} />
```
:::

#### useIncremark 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `blocks` | `Block[]` | 所有块（含稳定 ID） |
| `markdown` | `string` | 已收集的完整 Markdown |
| `append(chunk)` | `Function` | 追加内容 |
| `finalize()` | `Function` | 完成解析 |
| `reset()` | `Function` | 重置状态 |
| `render(content)` | `Function` | 一次性渲染 |
| `isDisplayComplete` | `boolean` | 打字机效果是否完成 |

---

### features/typewriter.md

#### 启用打字机效果

::: code-group
```vue [Vue]
<script setup>
import { ref, computed } from 'vue'
import { IncremarkContent, type UseIncremarkOptions } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

const options = computed<UseIncremarkOptions>(() => ({
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing'
  }
}))
</script>

<template>
  <IncremarkContent
    :content="content"
    :is-finished="isFinished"
    :incremark-options="options"
  />
</template>
```

```tsx [React]
import { IncremarkContent, UseIncremarkOptions } from '@incremark/react'

const options: UseIncremarkOptions = {
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing'
  }
}

<IncremarkContent
  content={content}
  isFinished={isFinished}
  incremarkOptions={options}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, type UseIncremarkOptions } from '@incremark/svelte'

  let content = $state('')
  let isFinished = $state(false)

  const options: UseIncremarkOptions = {
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing'
    }
  }
</script>

<IncremarkContent {content} {isFinished} incremarkOptions={options} />
```
:::

#### 配置项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用 |
| `charsPerTick` | `number \| [min, max]` | `2` | 每次显示字符数 |
| `tickInterval` | `number` | `50` | 更新间隔（ms） |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | 动画效果 |
| `cursor` | `string` | `'\|'` | 光标字符 |

#### 动画效果说明

- **none**：无动画，直接显示
- **fade-in**：淡入效果，新字符透明度渐变
- **typing**：打字机效果，带光标

---

### features/auto-scroll.md

#### 使用 AutoScrollContainer

::: code-group
```vue [Vue]
<script setup>
import { ref } from 'vue'
import { IncremarkContent, AutoScrollContainer } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)
const scrollRef = ref()
</script>

<template>
  <AutoScrollContainer ref="scrollRef" :enabled="true" class="h-[500px]">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </AutoScrollContainer>
</template>
```

```tsx [React]
import { useRef } from 'react'
import { IncremarkContent, AutoScrollContainer } from '@incremark/react'

function App() {
  const scrollRef = useRef(null)

  return (
    <AutoScrollContainer ref={scrollRef} enabled className="h-[500px]">
      <IncremarkContent content={content} isFinished={isFinished} />
    </AutoScrollContainer>
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, AutoScrollContainer } from '@incremark/svelte'

  let content = $state('')
  let isFinished = $state(false)
</script>

<AutoScrollContainer enabled class="h-[500px]">
  <IncremarkContent {content} {isFinished} />
</AutoScrollContainer>
```
:::

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |

#### 暴露方法

| 方法 | 说明 |
|------|------|
| `scrollToBottom()` | 强制滚动到底部 |
| `isUserScrolledUp()` | 用户是否手动向上滚动 |

#### 行为说明

- 内容更新时自动滚动到底部
- 用户向上滚动时暂停自动滚动
- 用户滚动回底部时恢复自动滚动

---

### features/custom-components.md

#### 自定义节点渲染组件

::: code-group
```vue [Vue]
<script setup>
import { h } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const CustomHeading = {
  props: ['node'],
  setup(props) {
    const level = props.node.depth
    return () => h(`h${level}`, { class: 'my-heading' }, props.node.children)
  }
}

const components = {
  heading: CustomHeading
}
</script>

<template>
  <IncremarkContent :content="content" :components="components" />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function CustomHeading({ node, children }) {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  return <Tag className="my-heading">{children}</Tag>
}

const components = {
  heading: CustomHeading
}

<IncremarkContent content={content} components={components} />
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import CustomHeading from './CustomHeading.svelte'

  const components = {
    heading: CustomHeading
  }
</script>

<IncremarkContent {content} {components} />
```
:::

#### 可覆盖的组件类型

| 类型 | 节点 |
|------|------|
| `heading` | 标题 h1-h6 |
| `paragraph` | 段落 |
| `code` | 代码块 |
| `list` | 列表 |
| `listItem` | 列表项 |
| `table` | 表格 |
| `blockquote` | 引用 |
| `thematicBreak` | 分隔线 |
| `image` | 图片 |
| `link` | 链接 |
| `inlineCode` | 行内代码 |

---

### features/custom-containers.md

#### 自定义容器

Markdown 语法：

```markdown
::: warning
这是一个警告
:::

::: info 标题
这是一个信息框
:::
```

#### 定义容器组件

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import WarningContainer from './WarningContainer.vue'
import InfoContainer from './InfoContainer.vue'

const customContainers = {
  warning: WarningContainer,
  info: InfoContainer
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :incremark-options="{ containers: true }"
    :custom-containers="customContainers"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function WarningContainer({ node, children }) {
  return (
    <div className="warning-box">
      <div className="warning-title">{node.title || 'Warning'}</div>
      <div className="warning-content">{children}</div>
    </div>
  )
}

const customContainers = {
  warning: WarningContainer
}

<IncremarkContent
  content={content}
  incremarkOptions={{ containers: true }}
  customContainers={customContainers}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import WarningContainer from './WarningContainer.svelte'

  const customContainers = {
    warning: WarningContainer
  }
</script>

<IncremarkContent
  {content}
  incremarkOptions={{ containers: true }}
  {customContainers}
/>
```
:::

#### 容器组件 Props

| Prop | 类型 | 说明 |
|------|------|------|
| `node` | `ContainerNode` | 容器节点 |
| `node.name` | `string` | 容器名称（warning, info 等） |
| `node.title` | `string?` | 容器标题 |
| `children` | - | 容器内容 |

---

### features/custom-codeblocks.md

#### 自定义代码块渲染

适用于 mermaid、echarts 等需要特殊渲染的代码块。

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MermaidBlock from './MermaidBlock.vue'
import EchartsBlock from './EchartsBlock.vue'

const customCodeBlocks = {
  mermaid: MermaidBlock,
  echarts: EchartsBlock
}

// 配置：是否在 pending 状态就开始渲染
const codeBlockConfigs = {
  echarts: { takeOver: true }  // pending 时就渲染
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :custom-code-blocks="customCodeBlocks"
    :code-block-configs="codeBlockConfigs"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function MermaidBlock({ node }) {
  // node.value 是代码内容
  // node.lang 是语言标识
  return <div className="mermaid">{node.value}</div>
}

const customCodeBlocks = {
  mermaid: MermaidBlock
}

<IncremarkContent
  content={content}
  customCodeBlocks={customCodeBlocks}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import MermaidBlock from './MermaidBlock.svelte'

  const customCodeBlocks = {
    mermaid: MermaidBlock
  }
</script>

<IncremarkContent {content} {customCodeBlocks} />
```
:::

#### codeBlockConfigs

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `takeOver` | `boolean` | `false` | 是否在 pending 状态就接管渲染 |

---

### features/themes.md

#### 使用 ThemeProvider

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent, ThemeProvider } from '@incremark/vue'
</script>

<template>
  <ThemeProvider theme="dark">
    <IncremarkContent :content="content" />
  </ThemeProvider>
</template>
```

```tsx [React]
import { IncremarkContent, ThemeProvider } from '@incremark/react'

<ThemeProvider theme="dark">
  <IncremarkContent content={content} />
</ThemeProvider>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, ThemeProvider } from '@incremark/svelte'
</script>

<ThemeProvider theme="dark">
  <IncremarkContent {content} />
</ThemeProvider>
```
:::

#### 内置主题

- `default` - 浅色主题
- `dark` - 深色主题

#### 自定义主题

```ts
import { type DesignTokens } from '@incremark/vue'

const customTheme: Partial<DesignTokens> = {
  color: {
    brand: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed'
    }
  }
}

<ThemeProvider :theme="customTheme">
```

---

### features/devtools.md

#### 启用 DevTools

::: code-group
```vue [Vue]
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
</script>

<template>
  <Incremark :blocks="incremark.blocks" />
</template>
```

```tsx [React]
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, useDevTools, Incremark } from '@incremark/svelte'

  const incremark = useIncremark()
  useDevTools(incremark)
</script>

<Incremark blocks={incremark.blocks} />
```
:::

#### 配置项

```ts
useDevTools(incremark, {
  open: false,                    // 初始是否打开
  position: 'bottom-right',       // 位置
  theme: 'dark'                   // 主题
})
```

---

### advanced/architecture.md

**内容**：

1. **整体架构图**

```
┌─────────────────────────────────────────────────────┐
│                  IncremarkContent                    │
│  (高层封装，自动处理 append/finalize)                 │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                   useIncremark                       │
│  (状态管理，响应式封装)                               │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                  IncremarkParser                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Boundary    │  │ AST         │  │ Definition  │  │
│  │ Detector    │  │ Builder     │  │ Manager     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                 BlockTransformer                     │
│  (打字机效果，字符级增量渲染)                         │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ Plugins     │  │ Chunk       │                   │
│  │ System      │  │ Animation   │                   │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                    Renderer                          │
│  (框架特定的渲染组件)                                │
└─────────────────────────────────────────────────────┘
```

2. **Parser 内部结构**
   - BoundaryDetector：识别稳定边界
   - AstBuilder：构建 AST
   - DefinitionManager / FootnoteManager：管理引用

3. **性能优化**
   - 增量行解析
   - 上下文缓存
   - AST 增量追加

---

### advanced/extensions.md

#### micromark 扩展

```ts
import { gfmTable } from 'micromark-extension-gfm-table'

const options = {
  extensions: [gfmTable()]
}

<IncremarkContent :incremark-options="options" />
```

#### mdast 扩展

```ts
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'

const options = {
  mdastExtensions: [gfmTableFromMarkdown()]
}
```

---

## 需要删除/合并的旧文件

| 旧文件 | 处理方式 |
|--------|----------|
| `guide/getting-started.md` | 拆分到 `quick-start.md` 和 `features/*` |
| `guide/vue.md` | 删除，用 code-group 替代 |
| `guide/react.md` | 删除，用 code-group 替代 |
| `guide/svelte.md` | 删除，用 code-group 替代 |
| `guide/benchmark.md` | 合并到 `guide/comparison.md` |
| `guide/compared.md` | 合并到 `guide/comparison.md` |
| `guide/migration-guide.md` | 移动到 `migration/v0-to-v1.md` |
| `api/*` | 删除，API 合并到各 feature 页面 |

---

## 优先级

### P0（必须先完成）
- `guide/quick-start.md` - 用户第一印象
- `features/basic-usage.md` - 核心用法

### P1
- `guide/concepts.md`
- `features/typewriter.md`
- `features/auto-scroll.md`
- `features/themes.md`

### P2
- `features/custom-components.md`
- `features/custom-containers.md`
- `features/custom-codeblocks.md`
- `examples/*.md`

### P3
- `advanced/*.md`
- `migration/*`
- 其他 features

---

## 注意事项

1. **推荐使用 `IncremarkContent` 组件**：最简用法，内部自动处理增量解析和 finalize
2. **使用 code-group 切换框架**：避免维护多份重复代码
3. **Svelte 用 Svelte 5 语法**：`$state()` 和 `onclick`
4. **删除已弃用 API**：如 `useStreamRenderer`
5. **每个 Feature 包含完整 API**：不单独维护 API 文档

### IncremarkContent vs useIncremark

| 场景 | 推荐 |
|------|------|
| 简单展示 AI 流式输出 | `IncremarkContent` |
| 需要访问 blocks/ast | `useIncremark` |
| 需要 DevTools | `useIncremark` + `useDevTools` |

---

## 配置文件更新

更新 `.vitepress/config.ts` 的 sidebar：

```ts
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
        { text: 'Auto Scroll', link: '/features/auto-scroll' },
        { text: 'Themes', link: '/features/themes' },
        { text: 'Custom Components', link: '/features/custom-components' },
        { text: 'Custom Containers', link: '/features/custom-containers' },
        { text: 'Custom Code Blocks', link: '/features/custom-codeblocks' },
        { text: 'Footnotes', link: '/features/footnotes' },
        { text: 'HTML Elements', link: '/features/html-elements' },
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
  ]
}
```
