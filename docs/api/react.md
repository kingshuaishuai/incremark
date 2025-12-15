# @incremark/react

React 18+ integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/react
```

## Hooks

### useIncremark

Core hook that creates and manages parser instance.

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### Parameters

```ts
interface UseIncremarkOptions extends ParserOptions {}
```

Inherits from `@incremark/core`'s `ParserOptions`.

#### Return Values

```ts
interface UseIncremarkReturn {
  /** Collected complete Markdown string */
  markdown: string
  /** Completed block list */
  completedBlocks: ParsedBlock[]
  /** Pending block list */
  pendingBlocks: ParsedBlock[]
  /** Current complete AST */
  ast: Root
  /** All blocks (completed + pending), with stable IDs */
  blocks: Array<ParsedBlock & { stableId: string }>
  /** Loading state */
  isLoading: boolean
  /** Append content */
  append: (chunk: string) => IncrementalUpdate
  /** Complete parsing */
  finalize: () => IncrementalUpdate
  /** Force abort */
  abort: () => IncrementalUpdate
  /** Reset parser */
  reset: () => void
  /** Render complete Markdown at once */
  render: (content: string) => IncrementalUpdate
  /** Parser instance */
  parser: IncremarkParser
}
```

### useDevTools

DevTools hook, one line to enable developer tools.

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): void
```

#### Parameters

- `incremark` - Return value from `useIncremark`
- `options` - DevTools configuration options

```ts
interface UseDevToolsOptions {
  /** Initially open */
  open?: boolean
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Theme */
  theme?: 'dark' | 'light'
}
```

## Components

### Incremark

Main rendering component.

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | Required | Blocks to render |
| `components` | `Record<string, ComponentType>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

### IncremarkRenderer

Single block rendering component.

```tsx
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, ComponentType>` | `{}` | Custom component mapping |

## Usage Example

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
