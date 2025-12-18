# Vue 集成

`@incremark/vue` 提供与 Vue 3 的深度集成。

## 安装

```bash
pnpm add @incremark/vue
```

## 基本用法

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

核心 composable，管理解析状态和可选的打字机效果。

### 返回值

```ts
const {
  // 状态
  markdown,        // Ref<string> - 完整 Markdown
  blocks,          // ComputedRef<Block[]> - 用于渲染的块（启用打字机时包含效果）
  completedBlocks, // ShallowRef<Block[]> - 已完成块
  pendingBlocks,   // ShallowRef<Block[]> - 待处理块
  ast,             // ComputedRef<Root> - 完整 AST
  isLoading,       // Ref<boolean> - 加载状态
  
  // 方法
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - 强制中断
  reset,           // () => void - 重置解析器和打字机
  render,          // (content: string) => Update - 一次性渲染
  
  // 打字机控制
  typewriter,      // TypewriterControls - 打字机控制对象
  
  // 实例
  parser           // IncremarkParser - 底层解析器
} = useIncremark(options)
```

### 配置选项

```ts
interface UseIncremarkOptions {
  // 解析器选项
  gfm?: boolean              // 启用 GFM
  containers?: boolean       // 启用 ::: 容器
  extensions?: Extension[]   // micromark 扩展
  mdastExtensions?: Extension[]  // mdast 扩展
  
  // 打字机选项（传入即启用）
  typewriter?: {
    enabled?: boolean              // 启用/禁用（默认: true）
    charsPerTick?: number | [number, number]  // 每次字符数（默认: [1, 3]）
    tickInterval?: number          // 间隔毫秒（默认: 30）
    effect?: 'none' | 'fade-in' | 'typing'  // 动画效果
    cursor?: string                // 光标字符（默认: '|'）
    pauseOnHidden?: boolean        // 隐藏时暂停（默认: true）
  }
}
```

## 使用打字机效果

打字机效果现已集成到 `useIncremark` 中：

```vue
<script setup>
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, append, finalize, reset, typewriter } = useIncremark({
  gfm: true,
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing',  // 或 'fade-in'
    cursor: '|'
  }
})
</script>

<template>
  <div :class="['content', `effect-${typewriter.effect.value}`]">
    <AutoScrollContainer>
      <!-- blocks 已包含打字机效果！ -->
      <Incremark :blocks="blocks" />
    </AutoScrollContainer>
    
    <!-- 打字机控制 -->
    <button 
      v-if="typewriter.isProcessing.value && !typewriter.isPaused.value" 
      @click="typewriter.pause"
    >
      暂停
    </button>
    <button 
      v-if="typewriter.isPaused.value" 
      @click="typewriter.resume"
    >
      继续
    </button>
    <button 
      v-if="typewriter.isProcessing.value" 
      @click="typewriter.skip"
    >
      跳过
    </button>
  </div>
</template>
```

### 打字机控制

```ts
interface TypewriterControls {
  enabled: Ref<boolean>               // 是否启用（支持 v-model）
  isProcessing: ComputedRef<boolean>  // 动画进行中
  isPaused: ComputedRef<boolean>      // 暂停状态
  effect: ComputedRef<AnimationEffect>  // 当前效果
  skip: () => void                    // 跳过所有动画
  pause: () => void                   // 暂停动画
  resume: () => void                  // 恢复动画
  setOptions: (options) => void       // 更新选项
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

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
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
  mdastExtensions: [mathFromMarkdown()],
  typewriter: { effect: 'fade-in' }
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
import { useIncremark, useDevTools, Incremark, AutoScrollContainer } from '@incremark/vue'

const incremark = useIncremark({ 
  gfm: true,
  typewriter: {
    effect: 'fade-in',
    charsPerTick: [1, 3]
  }
})
const { blocks, append, finalize, reset, markdown, typewriter } = incremark

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
  <div :class="['app', `effect-${typewriter.effect.value}`]">
    <header>
      <button @click="simulateAI" :disabled="isStreaming">
        {{ isStreaming ? '生成中...' : '开始对话' }}
      </button>
      <span>{{ markdown.length }} 字符</span>
      
      <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
        跳过
      </button>
    </header>
    
    <AutoScrollContainer class="content">
      <Incremark :blocks="blocks" />
    </AutoScrollContainer>
  </div>
</template>
```

## 渐入动画 CSS

如果使用 `effect: 'fade-in'`，添加以下 CSS：

```css
.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 下一步

- [打字机效果](./typewriter) - 详细打字机配置
- [自动滚动](./auto-scroll) - 自动滚动容器
- [自定义组件](./custom-components) - 自定义渲染
- [API 参考](/api/vue) - 完整 API 文档
