---
layout: home

hero:
  name: Incremark
  text: Incremental Markdown Parser
  tagline: Designed for AI streaming output, up to 46x faster parsing
  image:
    src: /logo.svg
    alt: Incremark
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
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
      text: GitHub
      link: https://github.com/kingshuaishuai/incremark

features:
  - icon: ⚡
    title: Incremental Parsing
    details: Only parse new content, completed blocks are not reprocessed, significantly reducing CPU overhead
  - icon: 🔄
    title: Stream Friendly
    details: Designed for AI streaming output, supports character-by-character, line-by-line, block-by-block input
  - icon: 🎯
    title: Precise Boundary Detection
    details: Intelligently identifies Markdown block boundaries, supports code blocks, lists, quotes and complex nested structures
  - icon: 🔌
    title: Framework Agnostic
    details: Core library decoupled from frameworks, provides official Vue, React, and Svelte integrations, easily extensible
  - icon: 📊
    title: DevTools
    details: Built-in developer tools to visualize parsing state, block structure and performance metrics
  - icon: 🎨
    title: Highly Customizable
    details: Support custom rendering components, extended syntax (GFM, math formulas, Mermaid, etc.)
---

## Why Incremark?

Traditional Markdown parsers have serious performance issues in AI streaming scenarios:

| Document Size | Traditional | Incremark | Speedup |
|--------------|-------------|-----------|---------|
| ~1KB | 0.4s | 0.17s | **2x** |
| ~5KB | 10s | 0.9s | **10x** |
| ~10KB | 40s | 1.8s | **20x** |
| ~20KB | 183s | 4s | **46x** |

## Quick Start

```bash
# Install
pnpm add @incremark/core @incremark/vue

# Or use React
pnpm add @incremark/core @incremark/react

# Or use Svelte
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
