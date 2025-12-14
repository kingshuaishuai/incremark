# Quick Start

This guide will help you integrate Incremark in 5 minutes.

## Installation

::: code-group

```bash [pnpm]
pnpm add @incremark/core @incremark/vue
```

```bash [npm]
npm install @incremark/core @incremark/vue
```

```bash [yarn]
yarn add @incremark/core @incremark/vue
```

:::

For React:

```bash
pnpm add @incremark/core @incremark/react
```

## Vue Integration

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

// Create parser instance
const { blocks, append, finalize, reset } = useIncremark({
  gfm: true  // Enable GFM extensions
})

// Simulate AI streaming output
async function simulateStream() {
  reset()
  
  const text = '# Hello\n\nThis is **Incremark**!'
  const chunks = text.match(/.{1,5}/g) || []
  
  for (const chunk of chunks) {
    append(chunk)
    await new Promise(r => setTimeout(r, 50))
  }
  
  finalize()
}
</script>

<template>
  <button @click="simulateStream">Start</button>
  <Incremark :blocks="blocks" />
</template>
```

## React Integration

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function simulateStream() {
    reset()
    
    const text = '# Hello\n\nThis is **Incremark**!'
    const chunks = text.match(/.{1,5}/g) || []
    
    for (const chunk of chunks) {
      append(chunk)
      await new Promise(r => setTimeout(r, 50))
    }
    
    finalize()
  }

  return (
    <>
      <button onClick={simulateStream}>Start</button>
      <Incremark blocks={blocks} />
    </>
  )
}
```

## Core API

### `useIncremark(options)`

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `markdown` | `string` | Collected complete Markdown |
| `blocks` | `Block[]` | All blocks (with stable IDs) |
| `completedBlocks` | `Block[]` | Completed blocks |
| `pendingBlocks` | `Block[]` | Pending blocks |
| `append(chunk)` | `Function` | Append content |
| `finalize()` | `Function` | Complete parsing |
| `reset()` | `Function` | Reset state |
| `abort()` | `Function` | Abort parsing |

### Configuration Options

```ts
interface ParserOptions {
  gfm?: boolean              // Enable GFM (tables, task lists, etc.)
  containers?: boolean       // Enable ::: container syntax
  extensions?: Extension[]   // Custom micromark extensions
  mdastExtensions?: Extension[]  // Custom mdast extensions
}
```

## Enable DevTools

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // One line to enable!
```

Click the 🔧 button in the bottom right to open the DevTools panel.

## Next Steps

- [Core Concepts](./concepts) - Deep dive into incremental parsing
- [Vue Integration](./vue) - Complete Vue guide
- [React Integration](./react) - Complete React guide
