# Incremark

Incremental Markdown parser designed for AI streaming output.

[![npm version](https://img.shields.io/npm/v/@incremark/core)](https://www.npmjs.com/package/@incremark/core)
[![license](https://img.shields.io/npm/l/@incremark/core)](./LICENSE)

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

📖 [Documentation](https://www.incremark.com/en/) | 🎮 [Vue Demo](https://vue.incremark.com/) | ⚛️ [React Demo](https://react.incremark.com/)

## Why Incremark?

Traditional Markdown parsers have performance issues in AI streaming scenarios: they re-parse the entire text every time new content arrives. Incremark uses an incremental parsing strategy, **only parsing new content** - completed blocks are never re-processed.

| Doc Size | Traditional | Incremark | Speedup |
|----------|-------------|-----------|---------|
| ~1KB | 0.4s | 0.17s | **2x** |
| ~5KB | 10s | 0.9s | **10x** |
| ~10KB | 40s | 1.8s | **20x** |
| ~20KB | 183s | 4s | **46x** |

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@incremark/core](./packages/core) | Core parser | ![npm](https://img.shields.io/npm/v/@incremark/core) |
| [@incremark/vue](./packages/vue) | Vue 3 integration | ![npm](https://img.shields.io/npm/v/@incremark/vue) |
| [@incremark/react](./packages/react) | React integration | ![npm](https://img.shields.io/npm/v/@incremark/react) |
| [@incremark/devtools](./packages/devtools) | Developer tools | ![npm](https://img.shields.io/npm/v/@incremark/devtools) |

## Quick Start

### Vue

```bash
pnpm add @incremark/core @incremark/vue
```

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

async function handleAIStream(stream) {
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

### React

```bash
pnpm add @incremark/core @incremark/react
```

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleAIStream(stream: ReadableStream) {
    reset()
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(new TextDecoder().decode(value))
    }
    finalize()
  }

  return <Incremark blocks={blocks} />
}
```

## Features

- ⚡ **Incremental Parsing** - Only parse new content
- 🔄 **Streaming Friendly** - Supports char-by-char/line-by-line input
- 🎯 **Boundary Detection** - Smart block boundary recognition
- 🔌 **Framework Agnostic** - Core library works independently
- 📊 **DevTools** - Built-in developer tools
- 🎨 **Customizable** - Support for custom render components
- 📐 **Extension Support** - GFM, Math formulas, Mermaid, etc.

## Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run Vue example
pnpm example:vue

# Run React example
pnpm example:react

# Start documentation
pnpm docs

# Run tests
pnpm test

# Build
pnpm build
```

## Documentation

Full documentation available at: [https://www.incremark.com/](https://www.incremark.com/)

## Live Demos

- 🎮 [Vue Demo](https://vue.incremark.com/) - Vue 3 integration example
- ⚛️ [React Demo](https://react.incremark.com/) - React integration example

## License

MIT

