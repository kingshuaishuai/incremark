# @incremark/devtools

独立的 DevTools 库，可在任何框架中使用。

## 安装

```bash
pnpm add @incremark/devtools
```

## 使用方式

### 方式一：与框架集成配合

::: code-group

```ts [Vue]
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
```

```tsx [React]
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)
}
```

:::

### 方式二：直接使用

```ts
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
const onChangeCallback = mountDevTools()
parser.setOnChange(onChangeCallback)

// 使用解析器
parser.append('# Hello')
parser.finalize()
```

## API

### mountDevTools

创建并挂载 DevTools 实例，返回一个可传递给 parser 的回调。

```ts
function mountDevTools(
  options?: DevToolsOptions,
  target?: HTMLElement | string
): (state: ParserState) => void
```

#### 参数

- `options` - DevTools 配置选项
- `target` - 挂载目标，默认为 `'body'`

```ts
interface DevToolsOptions {
  /** 初始是否打开 */
  open?: boolean
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 主题 */
  theme?: 'dark' | 'light'
}
```

#### 返回值

返回一个回调函数，可传递给 `parser.setOnChange()`。

### IncremarkDevTools

DevTools 类，提供更细粒度的控制。

```ts
class IncremarkDevTools {
  constructor(options?: DevToolsOptions)
  
  /** 挂载到 DOM */
  mount(target?: HTMLElement | string): void
  
  /** 从 DOM 卸载 */
  unmount(): void
  
  /** 更新状态 */
  update(state: ParserState): void
  
  /** 获取当前状态 */
  getState(): DevToolsState
}
```

## 状态类型

```ts
interface DevToolsState {
  isOpen: boolean
  activeTab: 'overview' | 'blocks' | 'ast' | 'timeline'
  parserState: ParserState | null
  appendHistory: AppendRecord[]
}

interface AppendRecord {
  timestamp: number
  chunk: string
  completedCount: number
  pendingCount: number
}
```

## 自定义样式

DevTools 使用 CSS 变量，可以覆盖：

```css
.incremark-devtools {
  --devtools-bg: #1e1e1e;
  --devtools-text: #e0e0e0;
  --devtools-border: #333;
  --devtools-accent: #4fc3f7;
}
```

