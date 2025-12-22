# Quick Start

This guide will help you integrate Incremark in 5 minutes.

## Installation

::: code-group

```bash [pnpm]
pnpm add @incremark/core @incremark/vue @incremark/theme
```

```bash [npm]
npm install @incremark/core @incremark/vue @incremark/theme
```

```bash [yarn]
yarn add @incremark/core @incremark/vue @incremark/theme
```

:::

For React:

```bash
pnpm add @incremark/core @incremark/react @incremark/theme
```

For Svelte:

```bash
pnpm add @incremark/core @incremark/svelte @incremark/theme
```

> **Note**: `@incremark/theme` is optional but recommended for styling.

## Vue Integration

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import '@incremark/theme/styles.css'

// Create parser instance
const incremark = useIncremark({
  gfm: true  // Enable GFM extensions
})
const { blocks, append, finalize, reset } = incremark

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
  <!-- Recommended: Pass incremark object -->
  <Incremark :incremark="incremark" />
</template>
```

## React Integration

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

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
      {/* Recommended: Pass incremark object */}
      <Incremark incremark={incremark} />
    </>
  )
}
```

## Svelte Integration

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

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

<button on:click={simulateStream}>Start</button>
<!-- Recommended: Pass incremark object -->
<Incremark {incremark} />
```

## Core API

### `useIncremark(options)`

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `markdown` | `string` | Collected complete Markdown |
| `blocks` | `Block[]` | All blocks (with stable IDs, includes typewriter effect if enabled) |
| `completedBlocks` | `Block[]` | Completed blocks |
| `pendingBlocks` | `Block[]` | Pending blocks |
| `isFinalized` | `boolean` | Whether parsing is finalized |
| `append(chunk)` | `Function` | Append content |
| `finalize()` | `Function` | Complete parsing |
| `reset()` | `Function` | Reset state |
| `abort()` | `Function` | Abort parsing |
| `typewriter` | `TypewriterControls` | Typewriter controls (if enabled) |

### Configuration Options

```ts
interface UseIncremarkOptions extends ParserOptions {
  // Parser options
  gfm?: boolean              // Enable GFM (tables, task lists, etc.)
  containers?: boolean       // Enable ::: container syntax
  extensions?: Extension[]   // Custom micromark extensions
  mdastExtensions?: Extension[]  // Custom mdast extensions
  
  // Typewriter options (v0.2.0+)
  typewriter?: {
    enabled?: boolean              // Enable/disable (default: true if provided)
    charsPerTick?: number | [number, number]  // Chars per tick (default: [1, 3])
    tickInterval?: number          // Interval in ms (default: 30)
    effect?: 'none' | 'fade-in' | 'typing'  // Animation effect
    cursor?: string                // Cursor character (default: '|')
    pauseOnHidden?: boolean        // Pause when hidden (default: true)
  }
}
```

## Enable DevTools

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // One line to enable!
```

Click the 🔧 button in the bottom right to open the DevTools panel.

## New Features in v0.2.0

### HTML Fragments

HTML fragments in Markdown are automatically parsed and rendered:

```markdown
<div class="custom">
  <span>Hello</span>
</div>
```

### Footnotes

Footnotes are automatically rendered at the bottom:

```markdown
Text[^1] and more[^2]

[^1]: First footnote
[^2]: Second footnote
```

### Theme System

Use `ThemeProvider` to apply themes:

```tsx
import { ThemeProvider } from '@incremark/react'
import { darkTheme } from '@incremark/theme'

<ThemeProvider theme="dark">
  <Incremark incremark={incremark} />
</ThemeProvider>
```

## Next Steps

- [Migration Guide](./migration-guide) - Upgrade from v0.1.x to v0.2.0
- [Core Concepts](./concepts) - Deep dive into incremental parsing
- [Vue Integration](./vue) - Complete Vue guide
- [React Integration](./react) - Complete React guide
- [Svelte Integration](./svelte) - Complete Svelte guide
