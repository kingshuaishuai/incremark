# Dual-Engine Architecture

Incremark features a **dual-engine parsing system** — an important architectural decision we made during development. We want to give users the freedom to choose: find the perfect balance between extreme performance and perfect compatibility for your specific use case.

## Why Dual Engines?

During Incremark's development, we faced a core question: **How do we achieve the best performance in streaming AI scenarios?**

After extensive research and testing, we discovered:

- **Marked** is extremely fast, but doesn't natively support footnotes, math, and other advanced features
- **Micromark** has perfect spec compliance and a rich plugin ecosystem, but has a larger bundle size

Our decision: **Why not both?**

With the dual-engine architecture, users can choose based on their needs:
- Performance-sensitive AI chat scenarios → Use the Marked engine
- Documents requiring strict spec compliance → Use the Micromark engine

## Engine Overview

| Engine | Speed | Features | Bundle Size | Best For |
|--------|-------|----------|-------------|----------|
| **Marked** (Default) | ⚡⚡⚡⚡⚡ | Standard + Enhanced Extensions | Smaller | Real-time streaming, AI chat |
| **Micromark** | ⚡⚡⚡ | Full CommonMark + Plugins | Larger | Complex documents, strict compliance |

## Marked Engine (Default)

The **Marked engine** is our default choice, deeply optimized for **streaming AI scenarios**.

### Why Marked as the Default?

1. **Extreme parsing speed**: Marked is one of the fastest Markdown parsers in the JavaScript ecosystem
2. **Battle-tested stability**: Over 10 years of history, validated by countless projects
3. **Easy to extend**: Flexible extension mechanism allows us to add features as needed
4. **Small bundle size**: Benefits frontend tree-shaking optimization

### What We Enhanced for Marked

Native Marked is a "good enough" parser focused on standard Markdown syntax, without many advanced features. But in AI scenarios, we often need these features.

Therefore, Incremark extends Marked with custom extensions:

| Feature | Native Marked | Incremark Enhanced | Description |
|---------|---------------|-------------------|-------------|
| **Footnotes** | ❌ Not supported | ✅ Full GFM footnotes | `[^1]` references and `[^1]: content` definitions |
| **Math Blocks** | ❌ Not supported | ✅ Inline and block math | `$E=mc^2$` and `$$...$$` |
| **Custom Containers** | ❌ Not supported | ✅ Directive syntax | `:::tip`, `:::warning`, `:::danger` |
| **Inline HTML Parsing** | ⚠️ Preserved as-is | ✅ Structured parsing | Parses HTML into manipulable AST nodes |
| **Optimistic References** | ❌ Not supported | ✅ Streaming-friendly | Gracefully handles incomplete links/images during streaming |
| **Footnote Definition Blocks** | ❌ Not supported | ✅ Multi-line content | Supports complex footnotes with code blocks, lists, etc. |

> 💡 These extensions are carefully designed for AI scenarios. They provide full functionality while minimizing performance overhead.

### Usage

The Marked engine is the **default**, so you don't need any special configuration:

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)
</script>

<template>
  <!-- Marked engine is used by default -->
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
  />
</template>
```

### Enable/Disable Specific Features

```vue
<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{
      gfm: true,        // GFM extensions (tables, strikethrough, etc.)
      math: true,       // Math formulas
      containers: true, // Custom containers
      htmlTree: true    // HTML structured parsing
    }"
  />
</template>
```

## Micromark Engine

The **Micromark engine** is the choice for perfect spec compliance.

### Why Offer Micromark?

While the Marked engine satisfies most scenarios, some users may have stricter requirements:

1. **Strict CommonMark compliance**: Micromark is currently the most spec-compliant parser
2. **Rich plugin ecosystem**: GFM, Math, Directive plugins are all community-polished
3. **Precise position information**: AST nodes include accurate line/column positions for error locating
4. **Better edge case handling**: More stable in complex nested scenarios

### Usage

To use the Micromark engine, you need to import `MicromarkAstBuilder` and pass it via `astBuilder` option:

```ts
// In your composable or setup
import { createIncremarkParser } from '@incremark/core'
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  gfm: true,
  math: true
})
```

> **Note**: The `IncremarkContent` component currently uses the Marked engine by default. To use Micromark with the component, you would need to use `useIncremark` directly with a custom parser.

### When Should You Use Micromark?

- Your content includes complex nested structures
- You need to handle edge cases that Marked can't parse correctly
- Your application has strict CommonMark compliance requirements
- You need Micromark plugins beyond our built-in extensions

## Complete Benchmark Data

We benchmarked 38 real Markdown files. Here are the complete results:

### Test Environment

- **Test files**: 38 files, 6,484 lines total, 128.55 KB
- **Test method**: Simulated streaming input, character-by-character append
- **Compared solutions**: Streamdown, markstream-vue, ant-design-x

### Full Test Results

| Filename | Lines | Size(KB) | Incremark | Streamdown | markstream | ant-design-x | vs Streamdown | vs markstream | vs ant-design-x |
|----------|-------|----------|-----------|------------|------------|--------------|---------------|---------------|-----------------|
| test-footnotes-simple.md | 15 | 0.09 | 0.3 ms | 0.0 ms | 1.4 ms | 0.2 ms | 0.1x | 4.7x | 0.6x |
| simple-paragraphs.md | 16 | 0.41 | 0.9 ms | 0.9 ms | 5.9 ms | 1.0 ms | 1.1x | 6.7x | 1.2x |
| test-footnotes-multiline.md | 21 | 0.18 | 0.6 ms | 0.0 ms | 2.2 ms | 0.4 ms | 0.1x | 3.5x | 0.6x |
| test-footnotes-edge-cases.md | 27 | 0.25 | 0.8 ms | 0.0 ms | 4.2 ms | 1.2 ms | 0.0x | 5.3x | 1.5x |
| test-footnotes-complex.md | 28 | 0.24 | 2.1 ms | 0.0 ms | 4.8 ms | 1.0 ms | 0.0x | 2.3x | 0.5x |
| introduction.md | 34 | 1.57 | 5.6 ms | 12.6 ms | 75.6 ms | 12.8 ms | 2.2x | 13.4x | 2.3x |
| devtools.md | 51 | 0.92 | 1.2 ms | 0.9 ms | 6.1 ms | 1.1 ms | 0.8x | 5.0x | 0.9x |
| footnotes.md | 52 | 0.94 | 1.7 ms | 0.2 ms | 10.6 ms | 1.9 ms | 0.1x | 6.3x | 1.2x |
| html-elements.md | 55 | 1.02 | 1.6 ms | 2.2 ms | 12.6 ms | 2.8 ms | 1.4x | 7.8x | 1.7x |
| themes.md | 58 | 0.96 | 1.9 ms | 1.3 ms | 8.6 ms | 1.8 ms | 0.7x | 4.4x | 0.9x |
| test-footnotes-comprehensive.md | 63 | 0.66 | 5.6 ms | 0.1 ms | 25.8 ms | 7.7 ms | 0.0x | 4.6x | 1.4x |
| auto-scroll.md | 72 | 1.68 | 3.9 ms | 3.5 ms | 39.9 ms | 4.9 ms | 0.9x | 10.1x | 1.2x |
| custom-codeblocks.md | 72 | 1.44 | 3.4 ms | 2.0 ms | 14.9 ms | 2.5 ms | 0.6x | 4.4x | 0.7x |
| custom-components.md | 73 | 1.40 | 4.0 ms | 2.0 ms | 32.7 ms | 2.9 ms | 0.5x | 8.1x | 0.7x |
| custom-containers.md | 88 | 1.67 | 4.2 ms | 2.4 ms | 18.1 ms | 3.1 ms | 0.6x | 4.3x | 0.7x |
| typewriter.md | 88 | 1.89 | 5.6 ms | 4.1 ms | 35.0 ms | 4.9 ms | 0.7x | 6.2x | 0.9x |
| concepts.md | 91 | 4.29 | 12.0 ms | 50.5 ms | 381.9 ms | 53.6 ms | 4.2x | 31.9x | 4.5x |
| INLINE_CODE_UPDATE.md | 94 | 1.66 | 4.7 ms | 17.2 ms | 60.9 ms | 15.6 ms | 3.7x | 12.9x | 3.3x |
| comparison.md | 109 | 5.39 | 20.5 ms | 74.0 ms | 552.2 ms | 85.2 ms | 3.6x | 26.9x | 4.1x |
| basic-usage.md | 130 | 3.04 | 8.5 ms | 12.3 ms | 74.1 ms | 14.1 ms | 1.4x | 8.7x | 1.7x |
| CODE_BACKGROUND_SEPARATION.md | 131 | 2.83 | 8.7 ms | 28.8 ms | 153.6 ms | 31.3 ms | 3.3x | 17.6x | 3.6x |
| P2_SUMMARY.md | 138 | 2.61 | 8.3 ms | 38.4 ms | 157.2 ms | 41.9 ms | 4.6x | 18.9x | 5.0x |
| quick-start.md | 146 | 3.04 | 7.3 ms | 7.3 ms | 64.2 ms | 9.6 ms | 1.0x | 8.8x | 1.3x |
| complex-html-examples.md | 147 | 3.99 | 9.0 ms | 58.8 ms | 279.3 ms | 57.2 ms | 6.6x | 31.1x | 6.4x |
| CODE_COLOR_SEPARATION.md | 162 | 3.51 | 10.0 ms | 32.8 ms | 191.1 ms | 36.9 ms | 3.3x | 19.1x | 3.7x |
| P0_OPTIMIZATION_REPORT.md | 168 | 3.53 | 10.1 ms | 56.2 ms | 228.0 ms | 58.1 ms | 5.6x | 22.6x | 5.8x |
| COLOR_SYSTEM_REFACTOR.md | 169 | 3.78 | 18.5 ms | 64.0 ms | 355.5 ms | 69.1 ms | 3.5x | 19.2x | 3.7x |
| FOOTNOTE_TEST_GUIDE.md | 219 | 2.87 | 12.3 ms | 0.2 ms | 167.6 ms | 45.0 ms | 0.0x | 13.7x | 3.7x |
| P2_COLORS_PACKAGE_REPORT.md | 226 | 4.10 | 11.4 ms | 77.9 ms | 311.6 ms | 80.5 ms | 6.8x | 27.2x | 7.0x |
| FOOTNOTE_FIX_SUMMARY.md | 236 | 3.93 | 22.7 ms | 0.5 ms | 535.0 ms | 120.8 ms | 0.0x | 23.6x | 5.3x |
| BASE_COLORS_SYSTEM.md | 259 | 4.47 | 35.8 ms | 43.0 ms | 191.8 ms | 43.4 ms | 1.2x | 5.4x | 1.2x |
| OPTIMIZATION_COMPARISON.md | 270 | 5.42 | 17.8 ms | 52.3 ms | 366.1 ms | 61.9 ms | 2.9x | 20.6x | 3.5x |
| P1_OPTIMIZATION_REPORT.md | 327 | 5.63 | 20.7 ms | 106.8 ms | 433.8 ms | 114.8 ms | 5.2x | 21.0x | 5.5x |
| OPTIMIZATION_PLAN.md | 371 | 6.89 | 33.1 ms | 67.6 ms | 372.1 ms | 76.7 ms | 2.0x | 11.2x | 2.3x |
| OPTIMIZATION_SUMMARY.md | 391 | 6.24 | 19.1 ms | 208.4 ms | 980.6 ms | 217.8 ms | 10.9x | 51.3x | 11.4x |
| P1.5_COLOR_SYSTEM_REPORT.md | 482 | 9.12 | 22.0 ms | 145.5 ms | 789.8 ms | 168.2 ms | 6.6x | 35.9x | 7.7x |
| BLOCK_TRANSFORMER_ANALYSIS.md | 489 | 9.24 | 75.7 ms | 574.3 ms | 1984.1 ms | 619.9 ms | 7.6x | 26.2x | 8.2x |
| test-md-01.md | 916 | 17.67 | 87.7 ms | 1441.1 ms | 5754.7 ms | 1656.9 ms | 16.4x | 65.6x | 18.9x |
| **【Total】** | **6484** | **128.55** | **519.4 ms** | **3190.3 ms** | **14683.9 ms** | **3728.6 ms** | **6.1x** | **28.3x** | **7.2x** |

### How to Interpret This Data

#### We're Honest: Incremark is Slower in Some Scenarios

You may notice that for `test-footnotes-*.md` and `FOOTNOTE_*.md` files, Incremark is much slower than Streamdown (0.0x - 0.1x).

**The reason is simple: Streamdown doesn't support footnote syntax.**

When Streamdown encounters `[^1]` footnote references, it simply skips them. Meanwhile, Incremark:
1. Recognizes footnote references
2. Parses footnote definition blocks (which may contain multi-line content, code blocks, lists, etc.)
3. Establishes reference relationships
4. Generates correct AST structure

This isn't a performance issue — it's a **feature difference**. We believe complete footnote support is crucial for AI scenarios, so we chose to implement it.

#### Where's the Real Performance Advantage?

Excluding footnote-related files, look at standard Markdown content performance:

| File | Lines | Incremark | Streamdown | Advantage |
|------|-------|-----------|------------|-----------|
| concepts.md | 91 | 12.0 ms | 50.5 ms | **4.2x** |
| comparison.md | 109 | 20.5 ms | 74.0 ms | **3.6x** |
| complex-html-examples.md | 147 | 9.0 ms | 58.8 ms | **6.6x** |
| P0_OPTIMIZATION_REPORT.md | 168 | 10.1 ms | 56.2 ms | **5.6x** |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 208.4 ms | **10.9x** |
| test-md-01.md | 916 | 87.7 ms | 1441.1 ms | **16.4x** |

**Conclusion**: For standard Markdown content, the larger the document, the more pronounced Incremark's advantage.

#### Why Such a Gap?

This is the direct result of **O(n) vs O(n²)** algorithmic complexity.

Traditional parsers (Streamdown, ant-design-x, markstream-vue) **re-parse the entire document** on every new chunk:

```
Chunk 1: Parse 100 chars
Chunk 2: Parse 200 chars (100 old + 100 new)
Chunk 3: Parse 300 chars (200 old + 100 new)
...
Chunk 100: Parse 10,000 chars
```

Total work: `100 + 200 + 300 + ... + 10000 = 5,050,000` character operations

**Incremark's incremental parsing** only processes new content:

```
Chunk 1: Parse 100 chars → cache stable blocks
Chunk 2: Parse only ~100 new chars
Chunk 3: Parse only ~100 new chars
...
Chunk 100: Parse only ~100 new chars
```

Total work: `100 × 100 = 10,000` character operations

That's a **500x difference**. This is why an 18KB document can be 16x+ faster.

## Feature Parity

We strive to keep both engines functionally consistent:

| Feature | Marked Engine | Micromark Engine |
|---------|---------------|------------------|
| GFM (Tables, Strikethrough, Autolinks) | ✅ | ✅ |
| Math Blocks (`$...$` and `$$...$$`) | ✅ | ✅ |
| Custom Containers (`:::tip`, etc.) | ✅ | ✅ |
| HTML Element Parsing | ✅ | ✅ |
| Footnotes | ✅ | ✅ |
| Typewriter Animation | ✅ | ✅ |
| Incremental Updates | ✅ | ✅ |

## Switching Engines

Engine selection is done at **initialization time**, not runtime. This is by design for tree-shaking optimization.

### Why Not Runtime Switching?

To ensure optimal bundle size:
- Default import only includes the `marked` engine
- `micromark` engine is imported separately when needed
- This allows bundlers to tree-shake unused engines

### How to Switch Engines

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

// Engine is selected at initialization
// For marked (default): no extra import needed
// For micromark: import MicromarkAstBuilder
</script>

<template>
  <!-- Uses marked engine by default -->
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{ gfm: true, math: true }"
  />
</template>
```

### Using Micromark Engine

To use micromark, import `MicromarkAstBuilder` from the separate engine entry:

```ts
import { createIncremarkParser } from '@incremark/core'
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

// Create parser with micromark engine
const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  gfm: true,
  math: true
})
```

> ⚠️ **Tree-shaking Note**: Importing from `@incremark/core/engines/micromark` only adds micromark to your bundle. The default import keeps only marked.

## Extending Engines

Both engines support custom extensions. See the [Extensions Guide](/advanced/extensions) for details.

```ts
// Custom marked extension example
import { createCustomExtension } from '@incremark/core'

const myExtension = createCustomExtension({
  name: 'myPlugin',
  // ... extension config
})
```

## Summary and Recommendations

| Aspect | Marked | Micromark |
|--------|--------|-----------|
| Parsing Speed | ⚡⚡⚡⚡⚡ | ⚡⚡⚡ |
| Bundle Size | 📦 Smaller | 📦 Larger |
| CommonMark Compliance | ✅ Good | ✅ Perfect |
| Built-in Extensions | ✅ Footnotes, Math, Containers | ✅ Via plugins |
| Plugin Ecosystem | 🔧 Growing | 🔧 Mature |
| Recommended For | Streaming AI, Real-time rendering | Static documents, Strict compliance |

**Our Recommendations**:

1. **Most scenarios**: Use the default Marked engine — it's already great
2. **Parsing issues**: If Marked doesn't handle certain edge cases well, try switching to Micromark
3. **Extreme performance needs**: Marked engine is your best choice
4. **Strict compliance needs**: Micromark engine is more suitable

We'll continue optimizing both engines to ensure they provide the best experience for you.
