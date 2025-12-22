# Migration Guide: v0.1.x → v0.2.0

This document will help you upgrade from Incremark v0.1.x to v0.2.0.

## Overview

v0.2.0 introduces the following major changes:

- ✨ **HTML Fragment Support**: New HTML element rendering capability
- ✨ **Definition and FootnoteDefinition Support**: Support for reference-style images/links and footnotes
- ✨ **Theme System Refactoring**: Separate theme package with Design Tokens
- 🔄 **Typewriter Effect Integration**: Typewriter effect is now integrated into `useIncremark`
- 🔄 **Vue/React API Alignment**: More consistent API across both frameworks

## Installation Changes

### New Dependencies

If you need to use theme functionality, install the new theme package:

```bash
# React
pnpm add @incremark/core @incremark/react @incremark/theme

# Vue
pnpm add @incremark/core @incremark/vue @incremark/theme

# Svelte
pnpm add @incremark/core @incremark/svelte @incremark/theme
```

### Style Import Changes

**Before:**
```tsx
// React
import '@incremark/react/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/vue/style.css';
</style>
```

**Now (Recommended):**
```tsx
// React
import '@incremark/theme/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/theme/styles.css';
</style>
```

> **Note**: The old style import paths (`@incremark/react/styles.css` and `@incremark/vue/style.css`) have been removed in v0.2.0. You must use `@incremark/theme/styles.css` instead.

## API Changes

### 1. Typewriter Effect Integration

**Before:** Need to use `useBlockTransformer` separately

```tsx
// React v0.1.x
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()

  const sourceBlocks = useMemo(() =>
    completedBlocks.map(b => ({ id: b.id, node: b.node, status: b.status })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = useMemo(() =>
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return <Incremark blocks={renderBlocks} />
}
```

**Now:** Typewriter effect is integrated into `useIncremark`

```tsx
// React v0.2.0
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, typewriter } = useIncremark({
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',
      cursor: '|'
    }
  })

  return (
    <>
      <Incremark blocks={blocks} />
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>Skip</button>
      )}
    </>
  )
}
```

**Vue Version:**

```vue
<!-- Vue v0.2.0 -->
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, typewriter } = useIncremark({
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing',
    cursor: '|'
  }
})
</script>

<template>
  <div>
    <Incremark :blocks="blocks" />
    <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
      Skip
    </button>
  </div>
</template>
```

### 2. Incremark Component API Changes

**Before:**
```tsx
<Incremark
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

**Now (Recommended):** Can pass `incremark` object for automatic context provision

```tsx
// Recommended usage: pass incremark object
const incremark = useIncremark()
return <Incremark incremark={incremark} />
```

Or continue using the original approach (still supported):

```tsx
<Incremark
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

### 3. New Components and Features

#### HTML Fragment Support

v0.2.0 adds full support for HTML fragments:

```tsx
// React
import { IncremarkHtmlElement } from '@incremark/react'

// Custom HTML element rendering
const customComponents = {
  htmlElement: IncremarkHtmlElement
}
```

HTML fragments in Markdown will be automatically parsed as `htmlElement` nodes:

```markdown
<div class="custom">
  <span>Hello</span>
</div>
```

#### Footnote Support

v0.2.0 adds footnote functionality:

```tsx
// React
import { Incremark, IncremarkFootnotes } from '@incremark/react'

function App() {
  const incremark = useIncremark()

  return (
    <>
      <Incremark incremark={incremark} />
      {/* Footnotes will automatically display at the bottom of the document */}
    </>
  )
}
```

Markdown example:

```markdown
这是一段文字[^1]，还有另一段[^2]。

[^1]: 这是第一个脚注
[^2]: 这是第二个脚注
```

#### Definition Support

v0.2.0 supports reference-style images and links:

```markdown
![图片][id]

[id]: https://example.com/image.png "图片标题"
```

### 4. Theme System

#### Using ThemeProvider

**Before:** No unified theme system

**Now:** Use `ThemeProvider` component

```tsx
// React
import { ThemeProvider, Incremark } from '@incremark/react'
import { darkTheme } from '@incremark/theme'

function App() {
  const incremark = useIncremark()

  return (
    <ThemeProvider theme="dark">
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
}
```

Or use a custom theme:

```tsx
import { ThemeProvider } from '@incremark/react'
import { defaultTheme, mergeTheme } from '@incremark/theme'

const customTheme = mergeTheme(defaultTheme, {
  color: {
    text: {
      primary: '#custom-color'
    }
  }
})

<ThemeProvider theme={customTheme}>
  <Incremark incremark={incremark} />
</ThemeProvider>
```

#### CSS Variables

v0.2.0 introduces a CSS variable-based theme system:

```css
.incremark {
  --incremark-color-text-primary: #333;
  --incremark-color-code-background: #24292e;
  --incremark-border-radius-lg: 12px;
}
```

## Complete Migration Examples

### React Application Migration

**Before (v0.1.x):**

```tsx
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'
import '@incremark/react/styles.css'

function App() {
  const { completedBlocks, append, finalize } = useIncremark({ gfm: true })

  const sourceBlocks = useMemo(() =>
    completedBlocks.map(b => ({ id: b.id, node: b.node, status: b.status })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = useMemo(() =>
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return <Incremark blocks={renderBlocks} />
}
```

**Now (v0.2.0):**

```tsx
import { useIncremark, Incremark, ThemeProvider } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const incremark = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing'
    }
  })

  return (
    <ThemeProvider theme="default">
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
}
```

### Vue Application Migration

**Before (v0.1.x):**

```vue
<script setup>
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/vue'
</script>

<style>
@import '@incremark/vue/style.css';
</style>

<template>
  <Incremark :blocks="renderBlocks" />
</template>
```

**Now (v0.2.0):**

```vue
<script setup>
import { useIncremark, Incremark, ThemeProvider } from '@incremark/vue'
</script>

<style>
@import '@incremark/theme/styles.css';
</style>

<template>
  <ThemeProvider theme="default">
    <Incremark :incremark="incremark" />
  </ThemeProvider>
</template>
```

## Breaking Changes

### 1. useBlockTransformer No Longer Required

If you previously used `useBlockTransformer` to implement typewriter effects, you can now configure it directly in `useIncremark`. The old API is still available, but migration is recommended.

### 2. Style Import Path Changes

**Important**: The old style import paths (`@incremark/react/styles.css` and `@incremark/vue/style.css`) have been removed in v0.2.0. You must migrate to `@incremark/theme/styles.css`.

## Compatibility Notes

- ✅ The old `useBlockTransformer` API is still available
- ⚠️ The old style import paths have been removed - you must use `@incremark/theme/styles.css`
- ✅ The `Incremark` component's `blocks` prop is still available
- ✅ All existing custom components are still available

## Need Help?

If you encounter issues during migration, please:

1. Check the [API Documentation](/api/react) or [API Documentation](/api/vue)
2. View [Complete Examples](/guide/react) or [Complete Examples](/guide/vue)
3. Submit an [Issue](https://github.com/kingshuaishuai/incremark/issues) on GitHub
