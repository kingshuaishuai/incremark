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
    details: Core logic decoupled. First-class support for Vue, React, and Svelte.
  - icon: 📊
    title: DevTools
    details: Built-in DevTools to visualize parsing state, block structure, and performance metrics.
  - icon: 🎨
    title: Highly Customizable
    details: Support for custom components and extended syntax (GFM, Math, Mermaid, etc.).
---

## Why Incremark?

Traditional Markdown parsers suffer from severe performance issues in streaming AI scenarios:

| Document Size | Time Saved | Speedup |
|---------------|------------|---------|
| Short (~1KB) | 37% | **1.6x** |
| Medium (~5KB) | 86% | **7.4x** |
| Long (~10KB) | 93% | **13.6x** |
| Very Long (~20KB) | 96% | **27.1x** 🚀 |

## Quick Experience

```bash
# Install
pnpm add @incremark/core @incremark/vue

# Or with React
pnpm add @incremark/core @incremark/react

# Or with Svelte
pnpm add @incremark/core @incremark/svelte
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
