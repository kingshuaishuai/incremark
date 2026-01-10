# @incremark/vue

Incremark 的 Vue 3 集成库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` composable 和 `<Incremark>` 组件
- ⌨️ **打字机效果** - 内置 `useBlockTransformer` 实现逐字符显示
- 🎨 **可定制** - 支持自定义渲染组件
- ⚡ **高性能** - 使用 `shallowRef` 和 `markRaw` 优化性能
- 🔧 **DevTools** - 内置开发者工具

## 安装

```bash
pnpm add @incremark/vue @incremark/theme
```

## 快速开始

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/theme/styles.css'

const content = ref('')
const isFinished = ref(false)

async function handleStream(stream) {
  for await (const chunk of stream) {
    content.value += chunk
  }
  isFinished.value = true
}
</script>

<template>
  <button @click="handleStream">开始</button>
  <IncremarkContent :content="content" :is-finished="isFinished" />
</template>
```

## API

### useIncremark(options)

核心 composable。

**返回值：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `markdown` | `Ref<string>` | 完整 Markdown |
| `blocks` | `ComputedRef<Block[]>` | 所有块 |
| `completedBlocks` | `ShallowRef<Block[]>` | 已完成块 |
| `pendingBlocks` | `ShallowRef<Block[]>` | 待处理块 |
| `isLoading` | `Ref<boolean>` | 是否正在加载 |
| `append` | `Function` | 追加内容 |
| `finalize` | `Function` | 完成解析 |
| `reset` | `Function` | 重置状态 |
| `render` | `Function` | 一次性渲染（reset + append + finalize） |

### useBlockTransformer(sourceBlocks, options)

打字机效果 composable。作为解析器和渲染器之间的中间层，控制内容的逐步显示。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceBlocks` | `Ref<SourceBlock[]>` | 源 blocks（通常来自 `completedBlocks`） |
| `options.charsPerTick` | `number` | 每次显示的字符数（默认：2） |
| `options.tickInterval` | `number` | 每次显示的间隔时间 ms（默认：50） |
| `options.plugins` | `TransformerPlugin[]` | 插件列表（用于特殊块的处理） |

**返回值：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `displayBlocks` | `ComputedRef<DisplayBlock[]>` | 用于渲染的 blocks |
| `isProcessing` | `ComputedRef<boolean>` | 是否正在处理中 |
| `skip` | `Function` | 跳过动画，立即显示全部内容 |
| `reset` | `Function` | 重置状态 |
| `setOptions` | `Function` | 动态更新配置 |

**使用示例：**

```vue
<script setup>
import { computed, ref, watch } from 'vue'
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/vue'

const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

// 配置打字机速度
const typewriterSpeed = ref(2)
const typewriterInterval = ref(50)

// 转换为 SourceBlock 格式
const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

// 使用 BlockTransformer
const { 
  displayBlocks, 
  isProcessing, 
  skip, 
  reset: resetTransformer,
  setOptions 
} = useBlockTransformer(sourceBlocks, {
  charsPerTick: typewriterSpeed.value,
  tickInterval: typewriterInterval.value,
  plugins: defaultPlugins
})

// 监听配置变化
watch([typewriterSpeed, typewriterInterval], ([speed, interval]) => {
  setOptions({ charsPerTick: speed, tickInterval: interval })
})

// 转换为渲染格式
const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)
</script>

<template>
  <Incremark :blocks="renderBlocks" />
  <button v-if="isProcessing" @click="skip">跳过</button>
</template>
```

### useDevTools(incremark)

启用 DevTools。

```ts
const incremark = useIncremark()
useDevTools(incremark)
```

### \<Incremark\>

渲染组件。

```vue
<Incremark 
  :blocks="blocks"
  :components="{ heading: MyHeading }"
  :show-block-status="true"
/>
```

**Props：**

| Prop | 类型 | 说明 |
|------|------|------|
| `blocks` | `Block[]` | 要渲染的 blocks |
| `components` | `object` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | 是否显示块状态（pending/completed） |

## 自定义组件

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyCode from './MyCode.vue'

const { blocks } = useIncremark()
</script>

<template>
  <Incremark 
    :blocks="blocks" 
    :components="{ code: MyCode }"
  />
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

## 插件系统

BlockTransformer 支持插件来处理特殊类型的块：

```ts
import { 
  defaultPlugins,
  codeBlockPlugin,
  imagePlugin,
  mermaidPlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/vue'

// 使用默认插件集
const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  plugins: defaultPlugins
})

// 或自定义插件
const myPlugin = createPlugin({
  name: 'my-plugin',
  match: (node) => node.type === 'myType',
  transform: (node) => ({ displayNode: node, isComplete: true })
})
```

**内置插件：**

| 插件 | 说明 |
|------|------|
| `codeBlockPlugin` | 代码块整体显示 |
| `imagePlugin` | 图片整体显示 |
| `mermaidPlugin` | Mermaid 图表整体显示 |
| `mathPlugin` | 数学公式整体显示 |
| `thematicBreakPlugin` | 分隔线整体显示 |

## AutoScrollContainer

自动滚动容器组件，适用于流式内容场景：

```vue
<script setup>
import { ref } from 'vue'
import { AutoScrollContainer, Incremark } from '@incremark/vue'

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
    <Incremark :blocks="blocks" />
  </AutoScrollContainer>
  
  <!-- 显示滚动状态 -->
  <span v-if="scrollRef?.isUserScrolledUp?.()">
    用户已暂停自动滚动
  </span>
  
  <!-- 强制滚动到底部 -->
  <button @click="scrollRef?.scrollToBottom()">
    滚动到底部
  </button>
</template>
```

**Props：**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 触发自动滚动的底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |

**暴露的方法（通过 ref）：**

| 方法 | 说明 |
|------|------|
| `scrollToBottom()` | 强制滚动到底部 |
| `isUserScrolledUp()` | 返回用户是否手动向上滚动了 |
| `container` | 容器 DOM 元素引用 |

## License

MIT
