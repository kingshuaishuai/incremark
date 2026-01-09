# Incremark

Incremental Markdown parser designed for AI streaming output.

[![npm version](https://img.shields.io/npm/v/@incremark/core)](https://www.npmjs.com/package/@incremark/core)
[![license](https://img.shields.io/npm/l/@incremark/core)](./LICENSE)

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

📖 [Documentation](https://www.incremark.com/en/) | 🎮 [Vue Demo](https://vue.incremark.com/) | ⚛️ [React Demo](https://react.incremark.com/)

## Why Incremark?

Traditional Markdown parsers **re-parse the entire document** on every new chunk, leading to O(n²) complexity. Incremark's incremental parsing achieves O(n) — the larger the document, the more pronounced the advantage:

| File | Lines | Incremark | Streamdown | markstream | ant-design-x |
|------|-------|-----------|------------|------------|--------------|
| concepts.md | 91 | 12.0 ms | 50.5 ms (**4.2x**) | 381.9 ms (**31.9x**) | 53.6 ms (**4.5x**) |
| comparison.md | 109 | 20.5 ms | 74.0 ms (**3.6x**) | 552.2 ms (**26.9x**) | 85.2 ms (**4.1x**) |
| complex-html.md | 147 | 9.0 ms | 58.8 ms (**6.6x**) | 279.3 ms (**31.1x**) | 57.2 ms (**6.4x**) |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 208.4 ms (**10.9x**) | 980.6 ms (**51.3x**) | 217.8 ms (**11.4x**) |
| test-md-01.md | 916 | 87.7 ms | 1441.1 ms (**16.4x**) | 5754.7 ms (**65.6x**) | 1656.9 ms (**18.9x**) |
| **Total (38 files)** | **6484** | **519.4 ms** | **3190.3 ms** (**6.1x**) | **14683.9 ms** (**28.3x**) | **3728.6 ms** (**7.2x**) |

> 📊 Benchmark: 38 real Markdown files, 128.55 KB total. [View full results →](https://www.incremark.com/advanced/engines)

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

## Roadmap

- [ ] 🔧 DevTools Svelte Rewrite
- [ ] 🎨 Theme Package Separation
- [ ] 🟠 Svelte / ⚡ Solid Support
- [ ] 💭 AI Scenarios (thinking block, tool call, citations)

[View full roadmap →](https://www.incremark.com/roadmap.html)

## Documentation

Full documentation available at: [https://www.incremark.com/](https://www.incremark.com/)

## Live Demos

- 🎮 [Vue Demo](https://vue.incremark.com/) - Vue 3 integration example
- ⚛️ [React Demo](https://react.incremark.com/) - React integration example

## License

MIT

