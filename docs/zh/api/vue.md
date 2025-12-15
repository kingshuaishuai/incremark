# @incremark/vue

Vue 3 集成库。

## 安装

```bash
pnpm add @incremark/core @incremark/vue
```

## Composables

### useIncremark

核心 Composable，创建并管理解析器实例。

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
  markdown: Ref<string>
  /** 已完成的块列表 */
  completedBlocks: ShallowRef<ParsedBlock[]>
  /** 待处理的块列表 */
  pendingBlocks: ShallowRef<ParsedBlock[]>
  /** 当前完整的 AST */
  ast: ComputedRef<Root>
  /** 所有块（完成 + 待处理），带稳定 ID */
  blocks: ComputedRef<Array<ParsedBlock & { stableId: string }>>
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 追加内容 */
  append: (chunk: string) => IncrementalUpdate
  /** 完成解析 */
  finalize: () => IncrementalUpdate
  /** 强制中断 */
  abort: () => IncrementalUpdate
  /** 重置解析器 */
  reset: () => void
  /** 一次性渲染完整 Markdown */
  render: (content: string) => IncrementalUpdate
  /** 解析器实例 */
  parser: IncremarkParser
}
```

### useDevTools

DevTools Composable，一行启用开发者工具。

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): IncremarkDevTools
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

```vue
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | 必填 | 要渲染的块 |
| `components` | `Record<string, Component>` | `{}` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | `true` | 是否显示块状态边框 |

### IncremarkRenderer

单块渲染组件。

```vue
<IncremarkRenderer :node="block.node" :components="customComponents" />
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `RootContent` | 必填 | AST 节点 |
| `components` | `Record<string, Component>` | `{}` | 自定义组件映射 |

### 内置渲染组件

可单独导入使用：

- `IncremarkHeading` - 标题
- `IncremarkParagraph` - 段落
- `IncremarkCode` - 代码块
- `IncremarkList` - 列表
- `IncremarkTable` - 表格
- `IncremarkBlockquote` - 引用
- `IncremarkThematicBreak` - 分隔线
- `IncremarkMath` - 数学公式
- `IncremarkInline` - 行内内容
- `IncremarkDefault` - 默认/未知类型

## 使用示例

```vue
<script setup>
import { 
  useIncremark, 
  useDevTools,
  Incremark 
} from '@incremark/vue'

const incremark = useIncremark({ gfm: true })
const { blocks, append, finalize, reset } = incremark

useDevTools(incremark)

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

