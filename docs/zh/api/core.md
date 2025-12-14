# @incremark/core

核心解析器库，框架无关。

## 安装

```bash
pnpm add @incremark/core
```

## IncremarkParser

增量 Markdown 解析器类。

### 构造函数

```ts
new IncremarkParser(options?: ParserOptions)
```

### 方法

#### append(chunk)

追加内容并返回增量更新。

```ts
append(chunk: string): IncrementalUpdate
```

**参数：**
- `chunk` - 要追加的文本片段

**返回值：**
- `IncrementalUpdate` - 本次更新的块信息

#### finalize()

标记解析完成，处理剩余的待处理内容。

```ts
finalize(): IncrementalUpdate
```

#### reset()

重置解析器状态。

```ts
reset(): void
```

#### getBuffer()

获取当前缓冲区内容。

```ts
getBuffer(): string
```

#### getCompletedBlocks()

获取所有已完成的块。

```ts
getCompletedBlocks(): ParsedBlock[]
```

#### getAst()

获取当前完整的 AST。

```ts
getAst(): Root
```

#### setOnChange(callback)

设置状态变化回调（用于 DevTools）。

```ts
setOnChange(callback: ((state: ParserState) => void) | undefined): void
```

## createIncremarkParser

工厂函数，创建解析器实例。

```ts
function createIncremarkParser(options?: ParserOptions): IncremarkParser
```

## 类型定义

### ParserOptions

```ts
interface ParserOptions {
  /** 启用 GFM 扩展 */
  gfm?: boolean
  /** 启用 ::: 容器语法 */
  containers?: boolean | ContainerConfig
  /** 自定义块边界检测函数 */
  blockBoundaryDetector?: (content: string, position: number) => boolean
  /** micromark 扩展 */
  extensions?: Extension[]
  /** mdast 扩展 */
  mdastExtensions?: Extension[]
  /** 状态变化回调 */
  onChange?: (state: ParserState) => void
}
```

### ContainerConfig

```ts
interface ContainerConfig {
  /** 容器标记字符，默认 ':' */
  marker?: string
  /** 最小标记长度，默认 3 */
  minMarkerLength?: number
  /** 允许的容器名称 */
  allowedNames?: string[]
}
```

### ParsedBlock

```ts
interface ParsedBlock {
  /** 块的唯一 ID */
  id: string
  /** 块状态 */
  status: BlockStatus
  /** AST 节点 */
  node: RootContent
  /** 原始文本起始位置 */
  startOffset: number
  /** 原始文本结束位置 */
  endOffset: number
  /** 原始文本内容 */
  rawText: string
}
```

### BlockStatus

```ts
type BlockStatus = 'pending' | 'stable' | 'completed'
```

### IncrementalUpdate

```ts
interface IncrementalUpdate {
  /** 新完成的块 */
  completed: ParsedBlock[]
  /** 更新的块 */
  updated: ParsedBlock[]
  /** 待处理的块 */
  pending: ParsedBlock[]
  /** 完整 AST */
  ast: Root
}
```

### ParserState

```ts
interface ParserState {
  completedBlocks: ParsedBlock[]
  pendingBlocks: ParsedBlock[]
  markdown: string
  ast: Root
}
```

## 检测器函数

### detectFenceStart

检测代码块开始。

```ts
function detectFenceStart(line: string): { char: string; length: number; indent: number } | null
```

### detectFenceEnd

检测代码块结束。

```ts
function detectFenceEnd(line: string, fenceChar: string, fenceLength: number): boolean
```

### isEmptyLine

检测空行。

```ts
function isEmptyLine(line: string): boolean
```

### isHeading

检测标题行。

```ts
function isHeading(line: string): boolean
```

### isThematicBreak

检测分隔线。

```ts
function isThematicBreak(line: string): boolean
```

### isListItemStart

检测列表项开始。

```ts
function isListItemStart(line: string): boolean
```

### isBlockquoteStart

检测引用开始。

```ts
function isBlockquoteStart(line: string): boolean
```

