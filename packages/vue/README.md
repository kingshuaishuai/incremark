# @incremark/vue

Incremark 的 Vue 3 集成库。

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` composable 和 `<Incremark>` 组件
- 🎨 **可定制** - 支持自定义渲染组件
- ⚡ **高性能** - 使用 `shallowRef` 和 `markRaw` 优化性能
- 🔧 **DevTools** - 内置开发者工具

## 安装

```bash
pnpm add @incremark/core @incremark/vue
```

## 快速开始

```vue
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
  <button @click="handleStream">开始</button>
  <Incremark :blocks="blocks" />
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
| `append` | `Function` | 追加内容 |
| `finalize` | `Function` | 完成解析 |
| `reset` | `Function` | 重置状态 |

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
/>
```

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

## License

MIT

