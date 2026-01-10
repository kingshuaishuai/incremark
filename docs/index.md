---
layout: home

hero:
  name: Incremark
  text: High-performance streaming markdown renderer
  tagline: Designed for streaming AI output, with extreme performance improvements.
  image:
    src: /logo.svg
    alt: Incremark
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: Vue Demo
      link: https://vue.incremark.com/
    - theme: alt
      text: React Demo
      link: https://react.incremark.com/
    - theme: alt
      text: Svelte Demo
      link: https://svelte.incremark.com/
    - theme: alt
      text: Solid Demo
      link: https://solid.incremark.com/
    - theme: alt
      text: View on GitHub
      link: https://github.com/kingshuaishuai/incremark

features:
  - icon: ⚡
    title: Incremental Parsing
    details: Only parses new content. Zero overhead for long documents.
  - icon: 🔄
    title: Stream Friendly
    details: Designed for AI streaming scenarios. Supports character, line, and block updates.
  - icon: 🎯
    title: Accurate Boundaries
    details: Intelligent boundary detection for complex nested structures like code blocks and lists.
  - icon: 🔌
    title: Framework Agnostic
    details: Core logic decoupled. First-class support for Vue, React, Svelte, and Solid.
  - icon: 📊
    title: DevTools
    details: Built-in DevTools to visualize parsing state, block structure, and performance metrics.
  - icon: 🎨
    title: Highly Customizable
    details: Support for custom components and extended syntax (GFM, Math, Mermaid, etc.).
  - icon: 🌐
    title: SSR Friendly
    details: Full support for Server-Side Rendering with Nuxt, Next.js, and SvelteKit.
  - icon: ♿
    title: i18n & Accessibility
    details: Built-in multi-language support. WAI-ARIA compliant and screen reader friendly.
---

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

> 📊 Benchmark: 38 real Markdown files, 128.55 KB total. [View full results →](/advanced/engines#complete-benchmark-data)

## Quick Experience

```bash
# Install
pnpm add @incremark/core @incremark/vue

# Or with React
pnpm add @incremark/core @incremark/react

# Or with Svelte
pnpm add @incremark/core @incremark/svelte

# Or with Solid
pnpm add @incremark/core @incremark/solid
```

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize } = useIncremark()

// Handle AI streaming output
async function handleStream(stream) {
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
