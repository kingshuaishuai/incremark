# @incremark/vue

Incremark 的 Vue 3 集成库，提供高性能的流式 Markdown 渲染组件。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 核心优势

- 📦 **开箱即用** - 提供 `IncremarkContent` 组件和 `useIncremark` composable
- ⚡ **极致性能** - 增量解析 O(n) 复杂度，双引擎可选
- ⌨️ **打字机效果** - 内置多种动画效果（淡入、打字机）
- 🎨 **高度可定制** - 支持自定义组件、代码块、容器
- 🎯 **主题系统** - 内置 ThemeProvider，支持亮色/暗色主题
- 📜 **自动滚动** - 内置 AutoScrollContainer 组件
- 🔧 **DevTools** - 内置开发者调试工具

## 安装

```bash
pnpm add @incremark/core @incremark/vue
```

## 快速开始

### 推荐方式：IncremarkContent 组件

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/vue/style.css'

const content = ref('')
const isFinished = ref(false)

// 处理 AI 流式输出
async function handleStream(stream) {
  content.value = ''
  isFinished.value = false
  
  for await (const chunk of stream) {
    content.value += chunk
  }
  
  isFinished.value = true
}
</script>

<template>
  <button @click="handleStream(stream)">开始</button>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{
      gfm: true,
      math: true,
      containers: true,
      htmlTree: true
    }"
  />
</template>
```

### 进阶方式：useIncremark Composable

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import '@incremark/vue/style.css'

const { blocks, append, finalize, reset } = useIncremark({ 
  gfm: true,
  math: true
})

async function handleStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <button @click="handleStream(stream)">开始</button>
  <Incremark :blocks="blocks" />
</template>
```

## IncremarkContent 组件

声明式的一体化组件，推荐在大多数场景使用。

### Props

```ts
interface IncremarkContentProps {
  // 输入（二选一）
  content?: string                       // 累积的 Markdown 字符串
  stream?: () => AsyncGenerator<string>  // 异步生成器函数

  // 状态
  isFinished?: boolean                   // 流结束标志（content 模式必需）

  // 配置
  incremarkOptions?: {
    gfm?: boolean              // GFM 支持
    math?: boolean             // 数学公式
    htmlTree?: boolean         // HTML 结构化解析
    containers?: boolean       // ::: 容器语法
    typewriter?: {             // 打字机效果
      enabled?: boolean
      charsPerTick?: number | [number, number]
      tickInterval?: number
      effect?: 'none' | 'fade-in' | 'typing'
      cursor?: string
    }
  }

  // 自定义渲染
  components?: ComponentMap                        // 自定义组件
  customContainers?: Record<string, Component>     // 自定义容器
  customCodeBlocks?: Record<string, Component>     // 自定义代码块
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // 样式
  showBlockStatus?: boolean    // 显示 block 状态边框
  pendingClass?: string        // pending block 的 CSS 类
}
```

### 示例：启用打字机效果

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :incremark-options="{
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'fade-in'
    }
  }"
/>
```

### 示例：自定义组件

```vue
<script setup>
import CustomHeading from './CustomHeading.vue'
import WarningContainer from './WarningContainer.vue'
import EchartsCodeBlock from './EchartsCodeBlock.vue'
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :components="{ heading: CustomHeading }"
    :custom-containers="{ warning: WarningContainer }"
    :custom-code-blocks="{ echarts: EchartsCodeBlock }"
    :code-block-configs="{ echarts: { takeOver: true } }"
  />
</template>
```

## 主题系统

```vue
<script setup>
import { ThemeProvider, IncremarkContent } from '@incremark/vue'
</script>

<template>
  <!-- 内置主题 -->
  <ThemeProvider theme="dark">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </ThemeProvider>

  <!-- 自定义主题 -->
  <ThemeProvider :theme="{ color: { brand: { primary: '#8b5cf6' } } }">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </ThemeProvider>
</template>
```

## 自动滚动

```vue
<script setup>
import { ref } from 'vue'
import { AutoScrollContainer, IncremarkContent } from '@incremark/vue'

const scrollRef = ref()
const autoScrollEnabled = ref(true)
</script>

<template>
  <AutoScrollContainer 
    ref="scrollRef" 
    :enabled="autoScrollEnabled"
    :threshold="50"
    behavior="smooth"
  >
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </AutoScrollContainer>
  
  <button @click="scrollRef?.scrollToBottom()">
    滚动到底部
  </button>
</template>
```

## useIncremark API

```ts
const {
  // 状态
  markdown,           // Ref<string> - 完整 Markdown
  blocks,             // ComputedRef<Block[]> - 所有块
  completedBlocks,    // ShallowRef<Block[]> - 已完成块
  pendingBlocks,      // ShallowRef<Block[]> - 待处理块
  isLoading,          // Ref<boolean> - 是否加载中
  isDisplayComplete,  // ComputedRef<boolean> - 显示是否完成
  
  // 方法
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate
  
  // 打字机控制
  typewriter: {
    enabled,          // Ref<boolean> - 是否启用
    isProcessing,     // Ref<boolean> - 是否处理中
    skip,             // () => void - 跳过动画
    setOptions        // (options) => void - 更新配置
  }
} = useIncremark(options)
```

## DevTools

```vue
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
</script>

<template>
  <Incremark :blocks="incremark.blocks" />
</template>
```

## 数学公式支持

内置支持，只需启用 `math: true`：

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :incremark-options="{ math: true }"
/>
```

引入 KaTeX 样式：

```ts
import 'katex/dist/katex.min.css'
```

## License

MIT
