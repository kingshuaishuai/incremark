# @incremark/react

React 18+ 集成库。

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## Hooks

### useIncremark

核心 Hook，创建并管理解析器实例。

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### 参数

```ts
interface UseIncremarkOptions extends ParserOptions {}
```

继承自 `@incremark/core` 的 `ParserOptions`。

#### 返回值

```ts
interface UseIncremarkReturn {
  /** 已收集的完整 Markdown 字符串 */
  markdown: string
  /** 已完成的块列表 */
  completedBlocks: ParsedBlock[]
  /** 待处理的块列表 */
  pendingBlocks: ParsedBlock[]
  /** 当前完整的 AST */
  ast: Root
  /** 所有块（完成 + 待处理），带稳定 ID */
  blocks: Array<ParsedBlock & { stableId: string }>
  /** 是否正在加载 */
  isLoading: boolean
  /** 追加内容 */
  append: (chunk: string) => IncrementalUpdate
  /** 完成解析 */
  finalize: () => IncrementalUpdate
  /** 强制中断 */
  abort: () => IncrementalUpdate
  /** 重置解析器 */
  reset: () => void
  /** 解析器实例 */
  parser: IncremarkParser
}
```

### useDevTools

DevTools Hook，一行启用开发者工具。

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): void
```

#### 参数

- `incremark` - `useIncremark` 的返回值
- `options` - DevTools 配置选项

```ts
interface UseDevToolsOptions {
  /** 初始是否打开 */
  open?: boolean
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 主题 */
  theme?: 'dark' | 'light'
}
```

## 组件

### Incremark

主渲染组件。

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | 必填 | 要渲染的块 |
| `components` | `Record<string, ComponentType>` | `{}` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | `true` | 是否显示块状态边框 |

### IncremarkRenderer

单块渲染组件。

```tsx
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `RootContent` | 必填 | AST 节点 |
| `components` | `Record<string, ComponentType>` | `{}` | 自定义组件映射 |

## 使用示例

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

  useDevTools(incremark)

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

  return <Incremark blocks={blocks} />
}
```

