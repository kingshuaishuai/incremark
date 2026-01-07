# @incremark/react

Incremark 的 React 18+ 集成库，提供高性能的流式 Markdown 渲染组件。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 核心优势

- 📦 **开箱即用** - 提供 `IncremarkContent` 组件和 `useIncremark` hook
- ⚡ **极致性能** - 增量解析 O(n) 复杂度，双引擎可选
- ⌨️ **打字机效果** - 内置多种动画效果（淡入、打字机）
- 🎨 **高度可定制** - 支持自定义组件、代码块、容器
- 🎯 **主题系统** - 内置 ThemeProvider，支持亮色/暗色主题
- 📜 **自动滚动** - 内置 AutoScrollContainer 组件
- 🔧 **DevTools** - 内置开发者调试工具

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## 快速开始

### 推荐方式：IncremarkContent 组件

```tsx
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'
import '@incremark/react/styles.css'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // 处理 AI 流式输出
  async function handleStream(stream: ReadableStream) {
    setContent('')
    setIsFinished(false)
    
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setContent(prev => prev + decoder.decode(value))
    }
    
    setIsFinished(true)
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>开始</button>
      <IncremarkContent 
        content={content} 
        isFinished={isFinished}
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

### 进阶方式：useIncremark Hook

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import '@incremark/react/styles.css'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ 
    gfm: true,
    math: true
  })

  async function handleStream(stream: ReadableStream) {
    reset()
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>开始</button>
      <Incremark blocks={blocks} />
    </>
  )
}
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
  components?: ComponentMap                          // 自定义组件
  customContainers?: Record<string, ComponentType>   // 自定义容器
  customCodeBlocks?: Record<string, ComponentType>   // 自定义代码块
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // 样式
  showBlockStatus?: boolean    // 显示 block 状态边框
  pendingClass?: string        // pending block 的 CSS 类
}
```

### 示例：启用打字机效果

```tsx
<IncremarkContent 
  content={content} 
  isFinished={isFinished}
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
  content={content} 
  isFinished={isFinished}
  components={{ heading: CustomHeading }}
  customContainers={{ warning: WarningContainer }}
  customCodeBlocks={{ echarts: EchartsCodeBlock }}
  codeBlockConfigs={{ echarts: { takeOver: true } }}
/>
```

## 主题系统

```tsx
import { ThemeProvider, IncremarkContent } from '@incremark/react'

// 内置主题
<ThemeProvider theme="dark">
  <IncremarkContent content={content} isFinished={isFinished} />
</ThemeProvider>

// 自定义主题
<ThemeProvider theme={{ color: { brand: { primary: '#8b5cf6' } } }}>
  <IncremarkContent content={content} isFinished={isFinished} />
</ThemeProvider>
```

## 自动滚动

```tsx
import { useRef, useState } from 'react'
import { AutoScrollContainer, IncremarkContent, type AutoScrollContainerRef } from '@incremark/react'

function App() {
  const scrollRef = useRef<AutoScrollContainerRef>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  return (
    <div>
      <AutoScrollContainer 
        ref={scrollRef} 
        enabled={autoScrollEnabled}
        threshold={50}
        behavior="smooth"
      >
        <IncremarkContent content={content} isFinished={isFinished} />
      </AutoScrollContainer>
      
      <button onClick={() => scrollRef.current?.scrollToBottom()}>
        滚动到底部
      </button>
    </div>
  )
}
```

## useIncremark API

```ts
const {
  // 状态
  markdown,           // string - 完整 Markdown
  blocks,             // Block[] - 所有块
  completedBlocks,    // Block[] - 已完成块
  pendingBlocks,      // Block[] - 待处理块
  isLoading,          // boolean - 是否加载中
  isDisplayComplete,  // boolean - 显示是否完成
  
  // 方法
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate
  
  // 打字机控制
  typewriter: {
    enabled,          // boolean - 是否启用
    isProcessing,     // boolean - 是否处理中
    skip,             // () => void - 跳过动画
    setOptions        // (options) => void - 更新配置
  }
} = useIncremark(options)
```

## DevTools

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks} />
}
```

## 与 React Query 集成

```tsx
import { useQuery } from '@tanstack/react-query'
import { useIncremark, Incremark } from '@incremark/react'

function StreamingContent() {
  const { blocks, append, finalize, reset } = useIncremark()
  
  const { refetch } = useQuery({
    queryKey: ['chat'],
    queryFn: async () => {
      reset()
      // ... 流式处理
      finalize()
      return null
    },
    enabled: false
  })

  return (
    <>
      <button onClick={() => refetch()}>开始</button>
      <Incremark blocks={blocks} />
    </>
  )
}
```

## 数学公式支持

内置支持，只需启用 `math: true`：

```tsx
<IncremarkContent 
  content={content} 
  isFinished={isFinished}
  incremarkOptions={{ math: true }}
/>
```

引入 KaTeX 样式：

```ts
import 'katex/dist/katex.min.css'
```

## License

MIT
