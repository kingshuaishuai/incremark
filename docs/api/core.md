# @incremark/core

Framework-agnostic core parser library.

## Installation

```bash
pnpm add @incremark/core
```

## IncremarkParser

Incremental Markdown parser class.

### Constructor

```ts
new IncremarkParser(options?: ParserOptions)
```

### Methods

#### append(chunk)

Append content and return incremental update.

```ts
append(chunk: string): IncrementalUpdate
```

**Parameters:**
- `chunk` - Text fragment to append

**Returns:**
- `IncrementalUpdate` - Block info for this update

#### finalize()

Mark parsing as complete, process remaining pending content.

```ts
finalize(): IncrementalUpdate
```

#### reset()

Reset parser state.

```ts
reset(): void
```

#### render(content)

Render complete Markdown at once (reset + append + finalize).

```ts
render(content: string): IncrementalUpdate
```

**Parameters:**
- `content` - Complete Markdown content

**Returns:**
- `IncrementalUpdate` - Parse result

#### getBuffer()

Get current buffer content.

```ts
getBuffer(): string
```

#### getCompletedBlocks()

Get all completed blocks.

```ts
getCompletedBlocks(): ParsedBlock[]
```

#### getAst()

Get current complete AST.

```ts
getAst(): Root
```

#### setOnChange(callback)

Set state change callback (for DevTools).

```ts
setOnChange(callback: ((state: ParserState) => void) | undefined): void
```

## createIncremarkParser

Factory function to create parser instance.

```ts
function createIncremarkParser(options?: ParserOptions): IncremarkParser
```

## Type Definitions

### ParserOptions

```ts
interface ParserOptions {
  /** Enable GFM extensions */
  gfm?: boolean
  /** Enable ::: container syntax */
  containers?: boolean | ContainerConfig
  /** Custom block boundary detector */
  blockBoundaryDetector?: (content: string, position: number) => boolean
  /** micromark extensions */
  extensions?: Extension[]
  /** mdast extensions */
  mdastExtensions?: Extension[]
  /** State change callback */
  onChange?: (state: ParserState) => void
}
```

### ContainerConfig

```ts
interface ContainerConfig {
  /** Container marker character, default ':' */
  marker?: string
  /** Minimum marker length, default 3 */
  minMarkerLength?: number
  /** Allowed container names */
  allowedNames?: string[]
}
```

### ParsedBlock

```ts
interface ParsedBlock {
  /** Unique block ID */
  id: string
  /** Block status */
  status: BlockStatus
  /** AST node */
  node: RootContent
  /** Raw text start offset */
  startOffset: number
  /** Raw text end offset */
  endOffset: number
  /** Raw text content */
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
  /** Newly completed blocks */
  completed: ParsedBlock[]
  /** Updated blocks */
  updated: ParsedBlock[]
  /** Pending blocks */
  pending: ParsedBlock[]
  /** Complete AST */
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

## Detector Functions

### detectFenceStart

Detect code block start.

```ts
function detectFenceStart(line: string): { char: string; length: number; indent: number } | null
```

### detectFenceEnd

Detect code block end.

```ts
function detectFenceEnd(line: string, fenceChar: string, fenceLength: number): boolean
```

### isEmptyLine

Detect empty line.

```ts
function isEmptyLine(line: string): boolean
```

### isHeading

Detect heading line.

```ts
function isHeading(line: string): boolean
```

### isThematicBreak

Detect thematic break.

```ts
function isThematicBreak(line: string): boolean
```

### isListItemStart

Detect list item start.

```ts
function isListItemStart(line: string): boolean
```

### isBlockquoteStart

Detect blockquote start.

```ts
function isBlockquoteStart(line: string): boolean
```
