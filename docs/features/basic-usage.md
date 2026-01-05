# Basic Usage

**IncremarkContent Component Complete Guide**

## Two Input Modes

1. **content mode**: Pass accumulated string + isFinished flag
2. **stream mode**: Pass function returning AsyncGenerator

## Props Reference

```ts
interface IncremarkContentProps {
  // Input (Choose one)
  content?: string                       // Accumulated string
  stream?: () => AsyncGenerator<string>  // Async generator function

  // Status
  isFinished?: boolean                   // Stream finished flag (Required for content mode)

  // Configuration
  incremarkOptions?: UseIncremarkOptions // Parser + Typewriter config

  // Custom Rendering
  components?: ComponentMap              // Custom components
  customContainers?: Record<string, Component>
  customCodeBlocks?: Record<string, Component>
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // Styling
  showBlockStatus?: boolean              // Show block status border
  pendingClass?: string                  // CSS class for pending block
}
```

### UseIncremarkOptions

```ts
interface UseIncremarkOptions {
  // Parser Options
  gfm?: boolean              // GFM support (tables, tasklists, etc.)
  math?: boolean             // Math formula support
  htmlTree?: boolean         // HTML fragment parsing
  containers?: boolean       // ::: container syntax

  // Typewriter Options
  typewriter?: {
    enabled?: boolean
    charsPerTick?: number | [number, number]
    tickInterval?: number
    effect?: 'none' | 'fade-in' | 'typing'
    cursor?: string
  }
}
```

## Advanced: Using `useIncremark`

When finer control is needed:

::: code-group
```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

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

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }

  return <Incremark blocks={blocks} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'

  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }
</script>

<Incremark {blocks} />
```
:::

### useIncremark Return Values

| Property | Type | Description |
|---|---|---|
| `blocks` | `Block[]` | All blocks (with stable ID) |
| `markdown` | `string` | Accumulated Markdown |
| `append(chunk)` | `Function` | Append content |
| `finalize()` | `Function` | Complete parsing |
| `reset()` | `Function` | Reset state |
| `render(content)` | `Function` | Render once |
| `isDisplayComplete` | `boolean` | Is typewriter effect complete |
