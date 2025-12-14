# @incremark/react

Incremark 的 React 18+ 集成库。

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` hook 和 `<Incremark>` 组件
- 🎨 **可定制** - 支持自定义渲染组件
- ⚡ **高性能** - 利用 React 的 reconciliation 机制
- 🔧 **DevTools** - 内置开发者工具

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## 快速开始

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

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

## API

### useIncremark(options)

核心 hook。

**返回值：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `markdown` | `string` | 完整 Markdown |
| `blocks` | `Block[]` | 所有块 |
| `completedBlocks` | `Block[]` | 已完成块 |
| `pendingBlocks` | `Block[]` | 待处理块 |
| `append` | `Function` | 追加内容 |
| `finalize` | `Function` | 完成解析 |
| `reset` | `Function` | 重置状态 |

### useDevTools(incremark)

启用 DevTools。

```tsx
const incremark = useIncremark()
useDevTools(incremark)
```

### \<Incremark\>

渲染组件。

```tsx
<Incremark 
  blocks={blocks}
  components={{ heading: MyHeading }}
/>
```

## 自定义组件

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import MyCode from './MyCode'

function App() {
  const { blocks } = useIncremark()
  
  return (
    <Incremark 
      blocks={blocks} 
      components={{ code: MyCode }}
    />
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

## License

MIT

