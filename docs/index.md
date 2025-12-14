---
layout: home

hero:
  name: Incremark
  text: Incremental Markdown Parser
  tagline: Designed for AI streaming output, save 90% parsing overhead
  image:
    src: /logo.svg
    alt: Incremark
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/example/incremark

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
    details: Core library decoupled from frameworks, provides official Vue and React integrations, easily extensible
  - icon: 📊
    title: DevTools
    details: Built-in developer tools to visualize parsing state, block structure and performance metrics
  - icon: 🎨
    title: Highly Customizable
    details: Support custom rendering components, extended syntax (GFM, math formulas, Mermaid, etc.)
---

## Why Incremark?

Traditional Markdown parsers have serious performance issues in AI streaming scenarios:

| Scenario | Traditional | Incremark |
|----------|-------------|-----------|
| 1000 chars input | Parse ~500K chars | Parse ~50K chars |
| CPU usage | High, page stutters | Low, smooth |
| Memory | Repeatedly create AST | Incremental update, reuse nodes |

## Quick Start

```bash
# Install
pnpm add @incremark/core @incremark/vue

# Or use React
pnpm add @incremark/core @incremark/react
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
