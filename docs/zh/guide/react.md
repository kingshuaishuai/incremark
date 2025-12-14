# React 集成

`@incremark/react` 提供了与 React 18+ 深度集成的能力。

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## 基础用法

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset, markdown } = useIncremark({
    gfm: true
  })

  return (
    <div>
      <p>已接收 {markdown.length} 字符</p>
      <Incremark blocks={blocks} />
    </div>
  )
}
```

## useIncremark

核心 Hook，管理解析状态。

### 返回值

```ts
const {
  // 状态
  markdown,        // string - 完整 Markdown
  blocks,          // Block[] - 所有块
  completedBlocks, // Block[] - 已完成块
  pendingBlocks,   // Block[] - 待处理块
  ast,             // Root - 完整 AST
  isLoading,       // boolean - 是否加载中
  
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

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
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

```tsx
import { useIncremark, Incremark } from '@incremark/react'

const MyHeading = ({ node }) => (
  <h1 className="my-heading" style={{ color: 'blue' }}>
    {/* 渲染子节点 */}
  </h1>
)

const customComponents = {
  heading: MyHeading
}

function App() {
  const { blocks } = useIncremark()
  return <Incremark blocks={blocks} components={customComponents} />
}
```

## DevTools

```tsx
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)  // 一行启用！
  
  return <Incremark blocks={incremark.blocks} />
}
```

## 完整示例

```tsx
import { useState, useCallback } from 'react'
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function ChatApp() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset, markdown } = incremark
  
  useDevTools(incremark)
  
  const [isStreaming, setIsStreaming] = useState(false)

  const handleChat = useCallback(async () => {
    reset()
    setIsStreaming(true)
    
    const response = await fetch('/api/chat', { method: 'POST' })
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
    setIsStreaming(false)
  }, [append, finalize, reset])

  return (
    <div>
      <button onClick={handleChat} disabled={isStreaming}>
        {isStreaming ? '生成中...' : '开始对话'}
      </button>
      <div>{markdown.length} 字符</div>
      <Incremark blocks={blocks} />
    </div>
  )
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
      const res = await fetch('/api/stream')
      const reader = res.body!.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        append(new TextDecoder().decode(value))
      }
      
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

