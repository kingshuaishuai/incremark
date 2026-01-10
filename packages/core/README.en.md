# @incremark/core

High-performance incremental Markdown parser core library, designed specifically for AI streaming output scenarios.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Core Advantages

- 🚀 **O(n) Complexity** - Incremental parsing, each character parsed at most once
- ⚡ **Dual-Engine Architecture** - Choice between Marked (fast) and Micromark (stable)
- 🔄 **Stream-Friendly** - Designed for AI streaming output scenarios
- ⌨️ **Typewriter Effect** - Built-in BlockTransformer for character-by-character display
- 🎯 **Smart Boundary Detection** - Accurately identifies Markdown block boundaries
- 📦 **Tree-shaking** - Only bundles Marked engine by default, load on demand
- 🔌 **Rich Extensions** - Support for footnotes, math formulas, custom containers, HTML parsing

## Installation

```bash
pnpm add @incremark/core
```

## Quick Start

```ts
import { createIncremarkParser } from '@incremark/core'

const parser = createIncremarkParser({
  gfm: true,
  math: true,
  containers: true
})

// Simulate streaming input
parser.append('# Hello\n')
parser.append('\nWorld')
parser.finalize()

// Get results
console.log(parser.getCompletedBlocks())
console.log(parser.getAst())
```

## Dual-Engine Architecture

### Marked Engine (Default)

Fast mode, optimized for streaming scenarios:

```ts
import { createIncremarkParser } from '@incremark/core'

// Uses Marked engine by default
const parser = createIncremarkParser({ gfm: true, math: true })
```

**Features:**
- 🚀 Ultra-fast parsing, ideal for real-time AI chat
- 🔧 Custom extensions for footnotes, math, containers, inline HTML
- 📦 Tree-shaking friendly, default bundle only includes Marked

### Micromark Engine

Stable mode, strict CommonMark compliance:

```ts
import { createIncremarkParser } from '@incremark/core'
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

// Use Micromark engine
const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  gfm: true,
  math: true
})
```

**Features:**
- ✅ 100% CommonMark compatible
- 🔌 Rich micromark/mdast plugin ecosystem
- 🛡️ Battle-tested stability

## API

### createIncremarkParser(options)

Create a parser instance.

```ts
interface ParserOptions {
  gfm?: boolean                    // Enable GFM (tables, task lists, etc.)
  math?: boolean                   // Enable math formulas ($..$ and $$..$$)
  containers?: boolean             // Enable ::: container syntax
  htmlTree?: boolean               // Enable HTML structured parsing
  astBuilder?: AstBuilderClass     // Custom AST builder (for engine switching)
}
```

### parser.append(chunk)

Append content, returns incremental update.

### parser.finalize()

Complete parsing, mark remaining pending content as completed.

### parser.reset()

Reset parser state.

### parser.render(content)

One-time render complete Markdown (reset + append + finalize).

```ts
const update = parser.render('# Hello World')
console.log(update.completed) // Completed blocks
```

### parser.getAst()

Get complete AST (mdast format).

### parser.getCompletedBlocks()

Get completed blocks.

### parser.getBuffer()

Get current buffer content.

## Framework Integration

For daily use, it's recommended to use the framework packages which have built-in incremental parsing and typewriter effect support:

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

async function simulateStream() {
  content.value = ''
  isFinished.value = false

  const text = '# Hello\n\nThis is **Incremark**!'
  for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
    content.value += chunk  // Incremental append
    await new Promise(r => setTimeout(r, 50))
  }
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :is-finished="isFinished"
    :incremark-options="{ typewriter: { enabled: true } }"
  />
</template>
```

```tsx
// React
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  async function simulateStream() {
    setContent('')
    setIsFinished(false)

    const text = '# Hello\n\nThis is **Incremark**!'
    const chunks = text.match(/[\s\S]{1,5}/g) || []
    for (const chunk of chunks) {
      setContent(prev => prev + chunk)  // Incremental append
      await new Promise(r => setTimeout(r, 50))
    }
    setIsFinished(true)
  }

  return (
    <IncremarkContent
      content={content}
      isFinished={isFinished}
      incremarkOptions={{ typewriter: { enabled: true } } }
    />
  )
}
```

## Advanced: BlockTransformer

`BlockTransformer` is the typewriter effect controller, serving as middleware between parser and renderer. Only use this when you need custom rendering logic.

```ts
import { createBlockTransformer, defaultPlugins } from '@incremark/core'

const transformer = createBlockTransformer({
  charsPerTick: 2,        // Display 2 characters per tick
  tickInterval: 50,       // Every 50ms
  effect: 'fade-in',      // Animation effect: none | fade-in | typing
  plugins: defaultPlugins,
  onChange: (displayBlocks) => {
    render(displayBlocks)
  }
})

// Push source blocks
transformer.push(sourceBlocks)

// Skip animation
transformer.skip()

// Reset
transformer.reset()

// Destroy
transformer.destroy()
```

### Configuration Options

```ts
interface TransformerOptions {
  charsPerTick?: number | [number, number]  // Characters per tick (supports random range)
  tickInterval?: number                      // Interval in ms
  effect?: 'none' | 'fade-in' | 'typing'    // Animation effect
  cursor?: string                            // Cursor character (typing effect)
  plugins?: TransformerPlugin[]              // Plugin list
  onChange?: (blocks: DisplayBlock[]) => void
}
```

## Type Definitions

```ts
interface ParsedBlock {
  id: string
  status: 'pending' | 'completed'
  node: RootContent
  startOffset: number
  endOffset: number
  rawText: string
}

interface IncrementalUpdate {
  completed: ParsedBlock[]
  pending: ParsedBlock[]
  ast: Root
  definitions: DefinitionMap
  footnoteDefinitions: FootnoteDefinitionMap
  footnoteReferenceOrder: string[]
}
```

## Performance Comparison

Based on benchmark tests with 38 real Markdown documents:

| Comparison | Average Advantage |
|------------|-------------------|
| vs Streamdown | ~**6.1x faster** |
| vs ant-design-x | ~**7.2x faster** |
| vs markstream-vue | ~**28.3x faster** |

The longer the document, the greater the advantage (O(n) vs O(n²)).

## Framework Integration

- Vue: [@incremark/vue](../vue)
- React: [@incremark/react](../react)
- Svelte: [@incremark/svelte](../svelte)

## License

MIT
