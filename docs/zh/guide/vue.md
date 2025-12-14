# Vue 集成

`@incremark/vue` 提供了与 Vue 3 深度集成的能力。

## 安装

```bash
pnpm add @incremark/core @incremark/vue
```

## 基础用法

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset, markdown } = useIncremark({
  gfm: true
})
</script>

<template>
  <div>
    <p>已接收 {{ markdown.length }} 字符</p>
    <Incremark :blocks="blocks" />
  </div>
</template>
```

## useIncremark

核心 Composable，管理解析状态。

### 返回值

```ts
const {
  // 状态
  markdown,        // Ref<string> - 完整 Markdown
  blocks,          // ComputedRef<Block[]> - 所有块
  completedBlocks, // ShallowRef<Block[]> - 已完成块
  pendingBlocks,   // ShallowRef<Block[]> - 待处理块
  ast,             // ComputedRef<Root> - 完整 AST
  isLoading,       // Ref<boolean> - 是否加载中
  
  // 方法
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - 强制中断
  reset,           // () => void
  
  // 实例
  parser           // IncremarkParser - 底层解析器
} = useIncremark(options)
```

### 配置选项

```ts
interface UseIncremarkOptions {
  gfm?: boolean              // 启用 GFM
  containers?: boolean       // 启用 ::: 容器
  extensions?: Extension[]   // micromark 扩展
  mdastExtensions?: Extension[]  // mdast 扩展
}
```

## Incremark 组件

主渲染组件，接收 blocks 并渲染。

```vue
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `blocks` | `Block[]` | 必填 | 要渲染的块 |
| `components` | `Record<string, Component>` | `{}` | 自定义组件 |
| `showBlockStatus` | `boolean` | `true` | 显示块状态边框 |

## 自定义组件

覆盖默认渲染组件：

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyHeading from './MyHeading.vue'
import MyCode from './MyCode.vue'

const { blocks } = useIncremark()

const customComponents = {
  heading: MyHeading,
  code: MyCode
}
</script>

<template>
  <Incremark :blocks="blocks" :components="customComponents" />
</template>
```

自定义组件接收 `node` prop：

```vue
<!-- MyHeading.vue -->
<script setup>
defineProps<{ node: { depth: number; children: any[] } }>()
</script>

<template>
  <component 
    :is="`h${node.depth}`" 
    class="my-heading"
  >
    <slot />
  </component>
</template>
```

## 数学公式支持

```bash
pnpm add micromark-extension-math mdast-util-math katex
```

```vue
<script setup>
import { useIncremark } from '@incremark/vue'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

const { blocks } = useIncremark({
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
</script>
```

## DevTools

```vue
<script setup>
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // 一行启用！
</script>
```

## 完整示例

```vue
<script setup>
import { ref } from 'vue'
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark({ gfm: true })
const { blocks, append, finalize, reset, markdown } = incremark

useDevTools(incremark)

const isStreaming = ref(false)

async function simulateAI() {
  reset()
  isStreaming.value = true
  
  const response = await fetch('/api/chat', { method: 'POST' })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    append(decoder.decode(value))
  }
  
  finalize()
  isStreaming.value = false
}
</script>

<template>
  <button @click="simulateAI" :disabled="isStreaming">
    {{ isStreaming ? '生成中...' : '开始对话' }}
  </button>
  <Incremark :blocks="blocks" />
</template>
```

