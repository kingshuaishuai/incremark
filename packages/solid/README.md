# @incremark/solid

Incremark 的 SolidJS 集成库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` composable 和 `<IncremarkContent>` 组件
- ⚡ **极致性能** - 增量解析 O(n) 复杂度，双引擎支持
- ⌨️ **打字机效果** - 内置动画效果（fade-in、typing）
- 🎨 **高度可定制** - 自定义组件、代码块、容器
- 🎯 **主题系统** - 内置 ThemeProvider 支持亮/暗主题
- 📜 **自动滚动** - 内置 AutoScrollContainer 组件
- 🔧 **DevTools** - 内置开发者调试工具

## 安装

```bash
pnpm add @incremark/core @incremark/solid
```

## 快速开始

### 推荐：IncremarkContent 组件

```tsx
import { createSignal } from 'solid-js'
import { IncremarkContent } from '@incremark/solid'
import '@incremark/solid/style.css'

function App() {
  const [content, setContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  // 处理 AI 流式输出
  async function handleStream(stream) {
    setContent('')
    setIsFinished(false)

    for await (const chunk of stream) {
      setContent(prev => prev + chunk)
    }

    setIsFinished(true)
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>开始</button>
      <IncremarkContent
        content={content()}
        isFinished={isFinished()}
        incremarkOptions={{
          gfm: true,
          math: true,
          containers: true,
          htmlTree: true
        }}
      />
    </>
  )
}
```

### 高级：useIncremark Composable

```tsx
import { useIncremark, Incremark } from '@incremark/solid'
import '@incremark/solid/style.css'

function App() {
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

  return (
    <>
      <button onClick={() => handleStream(stream)}>开始</button>
      <Incremark blocks={blocks()} />
    </>
  )
}
```

## IncremarkContent 组件

声明式一体化组件，推荐用于大多数场景。

### Props

```ts
interface IncremarkContentProps {
  // 输入（选择一种）
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
  showBlockStatus?: boolean    // 显示块状态边框
  pendingClass?: string        // pending 块的 CSS 类
}
```

### 示例：启用打字机效果

```tsx
<IncremarkContent
  content={content()}
  isFinished={isFinished()}
  incremarkOptions={{
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'fade-in'
    }
  }}
/>
```

### 示例：自定义组件

```tsx
import CustomHeading from './CustomHeading'
import WarningContainer from './WarningContainer'
import EchartsCodeBlock from './EchartsCodeBlock'

<IncremarkContent
  content={content()}
  isFinished={isFinished()}
  components={{ heading: CustomHeading }}
  customContainers={{ warning: WarningContainer }}
  customCodeBlocks={{ echarts: EchartsCodeBlock }}
  codeBlockConfigs={{ echarts: { takeOver: true } }}
/>
```

## 主题系统

```tsx
import { ThemeProvider, IncremarkContent } from '@incremark/solid'

// 内置主题
<ThemeProvider theme="dark">
  <IncremarkContent content={content()} isFinished={isFinished()} />
</ThemeProvider>

// 自定义主题
<ThemeProvider theme={{ color: { brand: { primary: '#8b5cf6' } } }}>
  <IncremarkContent content={content()} isFinished={isFinished()} />
</ThemeProvider>
```

## 自动滚动

```tsx
import { createSignal } from 'solid-js'
import { AutoScrollContainer, IncremarkContent } from '@incremark/solid'

function App() {
  let scrollRef: HTMLDivElement | undefined
  const [autoScrollEnabled, setAutoScrollEnabled] = createSignal(true)

  return (
    <>
      <AutoScrollContainer
        ref={scrollRef}
        enabled={autoScrollEnabled()}
        threshold={50}
        behavior="smooth"
      >
        <IncremarkContent content={content()} isFinished={isFinished()} />
      </AutoScrollContainer>

      <button onClick={() => scrollRef?.scrollToBottom()}>
        滚动到底部
      </button>
    </>
  )
}
```

## useIncremark API

```ts
const {
  // 状态
  markdown,           // Accessor<string> - 完整 Markdown
  blocks,             // Accessor<Block[]> - 所有块
  completedBlocks,    // Accessor<Block[]> - 已完成块
  pendingBlocks,      // Accessor<Block[]> - 待处理块
  isLoading,          // Accessor<boolean> - 是否加载中
  isDisplayComplete,  // Accessor<boolean> - 是否显示完成

  // 方法
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate

  // 打字机控制
  typewriter: {
    enabled,          // Accessor<boolean> - 是否启用
    isProcessing,     // Accessor<boolean> - 是否处理中
    skip,             // () => void - 跳过动画
    setOptions        // (options) => void - 更新配置
  }
} = useIncremark(options)
```

## DevTools

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/solid'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks()} />
}
```

## 数学公式支持

内置支持，只需启用 `math: true`：

```tsx
<IncremarkContent
  content={content()}
  isFinished={isFinished()}
  incremarkOptions={{ math: true }}
/>
```

导入 KaTeX 样式：

```tsx
import 'katex/dist/katex.min.css'
```

## 许可证

MIT
