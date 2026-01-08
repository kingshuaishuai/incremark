# 基础用法

**IncremarkContent 组件完整指南**

## 两种输入模式

1. **content 模式**：传入累积的字符串 + isFinished 标志
2. **stream 模式**：传入返回 AsyncGenerator 的函数

## Props 参考

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

### UseIncremarkOptions

```ts
interface UseIncremarkOptions {
  // 解析器选项
  gfm?: boolean              // GFM 支持（表格、任务列表等）
  math?: boolean | MathOptions // 数学公式支持
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

interface MathOptions {
  // 启用 TeX 风格的 \(...\) 和 \[...\] 语法
  tex?: boolean
}
```

### 数学公式配置

默认情况下，`math: true` 只支持 `$...$` 和 `$$...$$` 语法。

如果需要支持 TeX/LaTeX 风格的 `\(...\)` 和 `\[...\]` 分隔符，可以开启 **tex** 选项：

```ts
// 启用 TeX 风格分隔符
const options = {
  math: { tex: true }
}
```

这在处理学术论文或某些 AI 工具输出时非常有用。

## 进阶：使用 `useIncremark`

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

### useIncremark 返回值

| 属性 | 类型 | 说明 |
|---|---|---|
| `blocks` | `Block[]` | 所有块（含稳定 ID） |
| `markdown` | `string` | 已收集的完整 Markdown |
| `append(chunk)` | `Function` | 追加内容 |
| `finalize()` | `Function` | 完成解析 |
| `reset()` | `Function` | 重置状态 |
| `render(content)` | `Function` | 一次性渲染 |
| `isDisplayComplete` | `boolean` | 打字机效果是否完成 |
