# @incremark/vue

Vue 3 integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/vue
```

## Composables

### useIncremark

Core composable that creates and manages parser instance.

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
  markdown: Ref<string>
  /** Completed block list */
  completedBlocks: ShallowRef<ParsedBlock[]>
  /** Pending block list */
  pendingBlocks: ShallowRef<ParsedBlock[]>
  /** Current complete AST */
  ast: ComputedRef<Root>
  /** All blocks (completed + pending), with stable IDs */
  blocks: ComputedRef<Array<ParsedBlock & { stableId: string }>>
  /** Loading state */
  isLoading: Ref<boolean>
  /** Append content */
  append: (chunk: string) => IncrementalUpdate
  /** Complete parsing */
  finalize: () => IncrementalUpdate
  /** Force abort */
  abort: () => IncrementalUpdate
  /** Reset parser */
  reset: () => void
  /** Parser instance */
  parser: IncremarkParser
}
```

### useDevTools

DevTools composable, one line to enable developer tools.

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): IncremarkDevTools
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

```vue
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | Required | Blocks to render |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

### IncremarkRenderer

Single block rendering component.

```vue
<IncremarkRenderer :node="block.node" :components="customComponents" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |

### Built-in Rendering Components

Can be imported individually:

- `IncremarkHeading` - Heading
- `IncremarkParagraph` - Paragraph
- `IncremarkCode` - Code block
- `IncremarkList` - List
- `IncremarkTable` - Table
- `IncremarkBlockquote` - Blockquote
- `IncremarkThematicBreak` - Thematic break
- `IncremarkMath` - Math formula
- `IncremarkInline` - Inline content
- `IncremarkDefault` - Default/unknown type

## Usage Example

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
