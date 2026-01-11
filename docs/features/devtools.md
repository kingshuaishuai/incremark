# DevTools

Incremark DevTools provides a visual interface for debugging and inspecting incremental markdown rendering. It supports real-time monitoring of parser state, block details, AST structure, and append history.

## Installation

::: code-group
```bash [npm]
npm install @incremark/devtools
```

```bash [pnpm]
pnpm add @incremark/devtools
```

```bash [yarn]
yarn add @incremark/devtools
```
:::

## Basic Usage

### Vue

```vue
<script setup>
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/vue'
import { onMounted, onUnmounted } from 'vue'

// Create devtools instance
const devtools = createDevTools({
  locale: 'en-US' // 'en-US' or 'zh-CN'
})

onMounted(() => {
  devtools.mount()
})

onUnmounted(() => {
  devtools.unmount()
})
</script>

<template>
  <IncremarkContent
    :content="markdown"
    :devtools="devtools"
    devtoolsId="main-parser"
    devtoolsLabel="Main Content"
  />
</template>
```

### React

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/react'
import { useEffect, useRef } from 'react'

function App() {
  const devtools = useRef(createDevTools({
    locale: 'en-US' // 'en-US' or 'zh-CN'
  }))

  useEffect(() => {
    devtools.current.mount()
    return () => devtools.current.unmount()
  }, [])

  return (
    <IncremarkContent
      content={markdown}
      devtools={devtools.current}
      devtoolsId="main-parser"
      devtoolsLabel="Main Content"
    />
  )
}
```

### Svelte

```svelte
<script lang="ts">
  import { createDevTools } from '@incremark/devtools'
  import { IncremarkContent } from '@incremark/svelte'
  import { onMount, onDestroy } from 'svelte'

  let devtools = createDevTools({
    locale: 'en-US' // 'en-US' or 'zh-CN'
  })

  onMount(() => {
    devtools.mount()
  })

  onDestroy(() => {
    devtools.unmount()
  })
</script>

<IncremarkContent
  {content}
  {devtools}
  devtoolsId="main-parser"
  devtoolsLabel="Main Content"
/>
```

### Solid

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/solid'
import { onMount, onCleanup } from 'solid-js'

const devtools = createDevTools({
  locale: 'en-US' // 'en-US' or 'zh-CN'
})

onMount(() => {
  devtools.mount()
})

onCleanup(() => {
  devtools.unmount()
})

return (
  <IncremarkContent
    content={markdown()}
    devtools={devtools}
    devtoolsId="main-parser"
    devtoolsLabel="Main Content"
  />
)
```

## Configuration Options

```ts
const devtools = createDevTools({
  open: false,                    // Initially open the panel
  position: 'bottom-right',       // Position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'dark',                  // Theme: 'dark' | 'light'
  locale: 'en-US'                 // Locale: 'en-US' | 'zh-CN'
})
```

## Dynamic Locale Switching

You can dynamically change the DevTools language:

```ts
import { setLocale } from '@incremark/devtools'

// Switch to Chinese
setLocale('zh-CN')

// Switch to English
setLocale('en-US')
```

## IncremarkContent Props

When using DevTools with `IncremarkContent`, you can pass these additional props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `devtools` | `IncremarkDevTools` | - | The devtools instance to register with |
| `devtoolsId` | `string` | Auto-generated | Unique identifier for this parser in devtools |
| `devtoolsLabel` | `string` | `devtoolsId` | Display label for this parser in devtools |

## Features

DevTools provides four main tabs:

### Overview
- Total block count
- Completed and pending blocks
- Character count
- Node type distribution
- Current streaming status

### Blocks
- List of all parsed blocks
- Block details (ID, type, status, raw text)
- AST node inspection
- Real-time status updates

### AST
- Complete Abstract Syntax Tree view
- Interactive tree structure
- Node property inspection

### Timeline
- Append history with timestamps
- Track incremental updates
- Block count changes over time

## Multiple Parsers

DevTools supports monitoring multiple parsers simultaneously:

```vue
<template>
  <IncremarkContent
    :content="content1"
    :devtools="devtools"
    devtoolsId="parser-1"
    devtoolsLabel="Main Content"
  />
  <IncremarkContent
    :content="content2"
    :devtools="devtools"
    devtoolsId="parser-2"
    devtoolsLabel="Sidebar Content"
  />
</template>
```

Use the dropdown in DevTools to switch between different parsers.
