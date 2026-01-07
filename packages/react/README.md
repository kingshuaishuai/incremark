# @incremark/react

Incremark 的 React 18+ 集成库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` hook 和 `<Incremark>` 组件
- ⌨️ **打字机效果** - 内置 `useBlockTransformer` 实现逐字符显示
- 🎨 **可定制** - 支持自定义渲染组件
- ⚡ **高性能** - 利用 React 的 reconciliation 机制
- 🔧 **DevTools** - 内置开发者工具

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## 快速开始

**1. 引入样式**

```tsx
import '@incremark/react/styles.css'
```

**2. 在组件中使用**

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import '@incremark/react/styles.css'

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
| `isLoading` | `boolean` | 是否正在加载 |
| `append` | `Function` | 追加内容 |
| `finalize` | `Function` | 完成解析 |
| `reset` | `Function` | 重置状态 |
| `render` | `Function` | 一次性渲染（reset + append + finalize） |

### useBlockTransformer(sourceBlocks, options)

打字机效果 hook。作为解析器和渲染器之间的中间层，控制内容的逐步显示。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceBlocks` | `SourceBlock[]` | 源 blocks（通常来自 `completedBlocks`） |
| `options.charsPerTick` | `number` | 每次显示的字符数（默认：2） |
| `options.tickInterval` | `number` | 每次显示的间隔时间 ms（默认：50） |
| `options.plugins` | `TransformerPlugin[]` | 插件列表（用于特殊块的处理） |

**返回值：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `displayBlocks` | `DisplayBlock[]` | 用于渲染的 blocks |
| `isProcessing` | `boolean` | 是否正在处理中 |
| `skip` | `Function` | 跳过动画，立即显示全部内容 |
| `reset` | `Function` | 重置状态 |
| `setOptions` | `Function` | 动态更新配置 |

**使用示例：**

```tsx
import { useMemo, useState, useEffect } from 'react'
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
  
  // 配置打字机速度
  const [typewriterSpeed, setTypewriterSpeed] = useState(2)
  const [typewriterInterval, setTypewriterInterval] = useState(50)

  // 转换为 SourceBlock 格式
  const sourceBlocks = useMemo(() => 
    completedBlocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status
    })),
    [completedBlocks]
  )

  // 使用 BlockTransformer
  const { 
    displayBlocks, 
    isProcessing, 
    skip, 
    reset: resetTransformer,
    setOptions 
  } = useBlockTransformer(sourceBlocks, {
    charsPerTick: typewriterSpeed,
    tickInterval: typewriterInterval,
    plugins: defaultPlugins
  })

  // 监听配置变化
  useEffect(() => {
    setOptions({ charsPerTick: typewriterSpeed, tickInterval: typewriterInterval })
  }, [typewriterSpeed, typewriterInterval, setOptions])

  // 转换为渲染格式
  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return (
    <div>
      <Incremark blocks={renderBlocks} />
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
```

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
  showBlockStatus={true}
/>
```

**Props：**

| Prop | 类型 | 说明 |
|------|------|------|
| `blocks` | `Block[]` | 要渲染的 blocks |
| `components` | `object` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | 是否显示块状态（pending/completed） |

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

## 插件系统

BlockTransformer 支持插件来处理特殊类型的块：

```tsx
import { 
  defaultPlugins,
  codeBlockPlugin,
  imagePlugin,
  mermaidPlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/react'

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

## AutoScrollContainer

自动滚动容器组件，适用于流式内容场景：

```tsx
import { useRef, useState } from 'react'
import { AutoScrollContainer, Incremark, type AutoScrollContainerRef } from '@incremark/react'

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
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
      
      {/* 显示滚动状态 */}
      {scrollRef.current?.isUserScrolledUp() && (
        <span>用户已暂停自动滚动</span>
      )}
      
      {/* 强制滚动到底部 */}
      <button onClick={() => scrollRef.current?.scrollToBottom()}>
        滚动到底部
      </button>
    </div>
  )
}
```

**Props：**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 触发自动滚动的底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |
| `className` | `string` | - | 容器类名 |
| `style` | `CSSProperties` | - | 容器样式 |

**Ref 方法（通过 useRef）：**

| 方法 | 说明 |
|------|------|
| `scrollToBottom()` | 强制滚动到底部 |
| `isUserScrolledUp()` | 返回用户是否手动向上滚动了 |
| `container` | 容器 DOM 元素引用 |

## License

MIT
