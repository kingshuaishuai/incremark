# React 集成

`@incremark/react` 提供与 React 18+ 的深度集成。

## 安装

```bash
pnpm add @incremark/react
```

## 基本用法

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

核心 hook，管理解析状态和可选的打字机效果。

### 返回值

```ts
const {
  // 状态
  markdown,        // string - 完整 Markdown
  blocks,          // Block[] - 用于渲染的块（启用打字机时包含效果）
  completedBlocks, // Block[] - 已完成块
  pendingBlocks,   // Block[] - 待处理块
  ast,             // Root - 完整 AST
  isLoading,       // boolean - 加载状态
  
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

```tsx
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/react'

function ChatApp() {
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

  return (
    <div className={`content effect-${typewriter.effect}`}>
      <AutoScrollContainer>
        {/* blocks 已包含打字机效果！ */}
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
      
      {/* 打字机控制 */}
      {typewriter.isProcessing && !typewriter.isPaused && (
        <button onClick={typewriter.pause}>暂停</button>
      )}
      {typewriter.isPaused && (
        <button onClick={typewriter.resume}>继续</button>
      )}
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>跳过</button>
      )}
    </div>
  )
}
```

### 打字机控制

```ts
interface TypewriterControls {
  enabled: boolean                    // 是否启用
  setEnabled: (enabled: boolean) => void  // 切换启用
  isProcessing: boolean               // 动画进行中
  isPaused: boolean                   // 暂停状态
  effect: 'none' | 'fade-in' | 'typing'  // 当前效果
  skip: () => void                    // 跳过所有动画
  pause: () => void                   // 暂停动画
  resume: () => void                  // 恢复动画
  setOptions: (options) => void       // 更新选项
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

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
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
import { useIncremark, useDevTools, Incremark, AutoScrollContainer } from '@incremark/react'

function ChatApp() {
  const incremark = useIncremark({ 
    gfm: true,
    typewriter: {
      effect: 'fade-in',
      charsPerTick: [1, 3]
    }
  })
  const { blocks, append, finalize, reset, markdown, typewriter } = incremark
  
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
    <div className={`app effect-${typewriter.effect}`}>
      <header>
        <button onClick={handleChat} disabled={isStreaming}>
          {isStreaming ? '生成中...' : '开始对话'}
        </button>
        <span>{markdown.length} 字符</span>
        
        {typewriter.isProcessing && (
          <button onClick={typewriter.skip}>跳过</button>
        )}
      </header>
      
      <AutoScrollContainer className="content">
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
    </div>
  )
}
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

## 与 React Query 集成

```tsx
import { useQuery } from '@tanstack/react-query'
import { useIncremark, Incremark } from '@incremark/react'

function StreamingContent() {
  const { blocks, append, finalize, reset } = useIncremark({
    typewriter: { effect: 'typing' }
  })
  
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

## 下一步

- [打字机效果](./typewriter) - 详细打字机配置
- [自动滚动](./auto-scroll) - 自动滚动容器
- [自定义组件](./custom-components) - 自定义渲染
- [API 参考](/api/react) - 完整 API 文档
