# Why Incremark?

In the age of Large Language Models, displaying AI-generated content has become one of the most common requirements in web development. You might wonder: there are already so many Markdown rendering libraries out there — why do we need another one?

This article will answer that question honestly.

## The Problem We're Solving

### AI Output is Getting Longer

If you've been following AI trends, you'll notice a clear pattern:

- **2022**: GPT-3.5 responses were typically a few hundred words
- **2023**: GPT-4 responses could reach 2,000-4,000 words
- **2024-2025**: Reasoning models like OpenAI o1 and DeepSeek R1 output "thinking processes" that can exceed 10,000+ words

Single conversation token counts are moving from 4K toward 32K, even 128K.

**The challenge**: For frontend developers, rendering 500 words versus 50,000 words of Markdown are completely different problems.

### Traditional Parsers Can't Keep Up

Here's what happens when you use traditional Markdown parsers with streaming AI output:

```
Chunk 1: Parse 100 characters ✓
Chunk 2: Parse 200 characters (100 old + 100 new)
Chunk 3: Parse 300 characters (200 old + 100 new)
...
Chunk 100: Parse 10,000 characters 😰
```

Every time a new chunk arrives, the entire document gets re-parsed. This is **O(n²) complexity**.

For a 20KB document, this means:
- **ant-design-x**: 1,657 ms total parsing time
- **markstream-vue**: 5,755 ms (almost 6 seconds!)
- **Incremark**: 88 ms ✨

**The difference is not 2x or 3x — it's 19x to 65x.**

## Why Incremark is Different

### 1. True Incremental Parsing

Incremark doesn't just "optimize" the traditional approach — it fundamentally rethinks how streaming Markdown should work.

```
Chunk 1: Parse 100 chars → cache stable blocks
Chunk 2: Parse only ~100 new chars (previous cached)
Chunk 3: Parse only ~100 new chars (previous cached)
...
Chunk 100: Parse only ~100 new chars
```

This is **O(n) complexity**. The larger your document, the greater our advantage.

### 2. Dual-Engine Architecture

We understand that different scenarios have different needs:

| Engine | Speed | Best For |
|--------|-------|----------|
| **Marked** (Default) | ⚡⚡⚡⚡⚡ | Real-time streaming, AI chat |
| **Micromark** | ⚡⚡⚡ | Complex documents, strict CommonMark compliance |

You can switch engines with a single configuration option.

### 3. Enhanced Features Out of the Box

Native Marked doesn't support footnotes, math, or custom containers. We've added these through carefully designed extensions:

- ✅ **Footnotes**: Full GFM footnote support (`[^1]`)
- ✅ **Math Blocks**: Inline (`$...$`) and block (`$$...$$`) formulas
- ✅ **Custom Containers**: `:::tip`, `:::warning`, `:::danger`
- ✅ **HTML Parsing**: Structured HTML tree parsing
- ✅ **Optimistic References**: Graceful handling of incomplete links during streaming

### 4. Framework Agnostic

We provide first-class support for all major frameworks:

```bash
# Vue
pnpm add @incremark/core @incremark/vue

# React
pnpm add @incremark/core @incremark/react

# Svelte
pnpm add @incremark/core @incremark/svelte
```

One core library, consistent APIs, identical features across frameworks.

## Honest Performance Comparison

We believe in transparency. Here are our actual benchmark results across 38 test files:

### Overall Averages

| vs Competitor | Average Advantage |
|---------------|-------------------|
| vs Streamdown | ~**6.1x faster** |
| vs ant-design-x | ~**7.2x faster** |
| vs markstream-vue | ~**28.3x faster** |

### Where We're Not Faster

We won't hide this: in some benchmarks, Incremark appears slower than Streamdown:

| File | Incremark | Streamdown | Why |
|------|-----------|------------|-----|
| footnotes.md | 1.7 ms | 0.2 ms | Streamdown doesn't support footnotes |
| FOOTNOTE_FIX_SUMMARY.md | 22.7 ms | 0.5 ms | Same — skips footnote parsing |

**This isn't a performance issue — it's a feature difference.** We chose to fully implement footnotes because they matter for AI content.

### Where We Truly Excel

For standard Markdown content, our advantage is clear:

| File | Lines | Incremark | ant-design-x | Advantage |
|------|-------|-----------|--------------|-----------|
| concepts.md | 91 | 12.0 ms | 53.6 ms | **4.5x** |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 217.8 ms | **11.4x** |
| test-md-01.md | 916 | 87.7 ms | 1656.9 ms | **18.9x** |

**The larger the document, the greater our advantage.**

## Who Should Use Incremark?

### ✅ Perfect For

- **AI Chat Applications**: Claude, ChatGPT, custom LLM interfaces
- **Long-Form AI Content**: Reasoning models, code generation, document analysis
- **Real-Time Editors**: Collaborative Markdown editing
- **Enterprise RAG Systems**: Knowledge bases with large document rendering
- **Multi-Framework Teams**: Consistent behavior across Vue, React, and Svelte

### ⚠️ Consider Alternatives For

- **Static Site Generation**: If you're pre-rendering Markdown at build time, simpler libraries work fine
- **Very Short Content**: For content under 500 characters, the performance difference is negligible

## The Bigger Picture

We're not just building a library — we're preparing for the future of AI interfaces.

### The Trend is Clear

- AI output is getting longer (reasoning models, chain-of-thought)
- Streaming is becoming the default (better UX, lower latency)
- Users expect instant feedback (no loading spinners, no jank)

Traditional O(n²) parsers simply can't scale to this future. Incremark's O(n) architecture is built for it.

### Our Commitment

We're committed to:
- **Performance**: Continuously optimizing both engines
- **Features**: Adding new syntax support as needed
- **Stability**: Thorough testing and careful versioning
- **Documentation**: AI-friendly docs (see our `llms.txt`)

## Getting Started

Ready to try it? It takes less than 5 minutes:

```bash
pnpm add @incremark/core @incremark/vue
```

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

// Handle AI streaming output
async function handleStream(stream) {
  content.value = ''
  isFinished.value = false
  
  for await (const chunk of stream) {
    content.value += chunk
  }
  
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{ gfm: true, math: true }"
  />
</template>
```

That's it. Your AI chat just got 19x faster.

---

## FAQ

### Q: Is Incremark production-ready?

Yes. The core parsing engine has been extensively tested with real-world AI content, including edge cases like incomplete code blocks, nested lists, and complex footnotes.

### Q: Will WebAssembly-based parsers make Incremark obsolete?

This is a valid concern. Rust-based Wasm parsers (like `pulldown-cmark`) could theoretically be faster. However:

1. Wasm-JS interop has overhead (especially for string passing)
2. Incremental parsing is hard to implement in Wasm
3. 88ms for a 20KB document is already imperceptible to humans

As long as we maintain our current performance level, Wasm isn't a threat.

### Q: How does Incremark compare to `react-markdown`?

`react-markdown` is designed for static documents, not streaming. It re-renders the entire component tree on every update, causing severe performance issues with AI streaming. Incremark only updates what changed.

### Q: Can I customize the rendering?

Absolutely. All three framework packages support custom components:

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-code-blocks="{ echarts: MyEchartsCodeBlock }"
  :custom-containers="{ warning: MyWarningContainer }"
  :components="{ heading: MyCustomHeading }"
/>
```

---

We built Incremark because we needed it ourselves. We hope it helps you build better AI experiences.

Questions? Issues? [Open a GitHub issue](https://github.com/kingshuaishuai/incremark/issues) or check our [documentation](/).

