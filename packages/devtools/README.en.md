# @incremark/devtools

Developer tools for Incremark, framework agnostic.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 🔍 **Real-time State** - View parsing state, block list, AST
- 📊 **Timeline** - Record each append operation
- 🌐 **Internationalization** - Supports Chinese and English interfaces
- 🎨 **Themes** - Supports dark/light themes
- 📦 **Framework Agnostic** - Works with Vue, React, Svelte, Solid, or vanilla JS
- 🔌 **Multi-parser Support** - Monitor multiple parser instances simultaneously

## Installation

```bash
pnpm add @incremark/devtools
```

## Usage

### With Vue

```vue
<script setup>
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/vue'
import { onMounted, onUnmounted } from 'vue'

const devtools = createDevTools({
  locale: 'en-US'
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

### With React

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/react'
import { useEffect, useRef } from 'react'

function App() {
  const devtools = useRef(createDevTools({
    locale: 'en-US'
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

### With Svelte

```svelte
<script lang="ts">
  import { createDevTools } from '@incremark/devtools'
  import { IncremarkContent } from '@incremark/svelte'
  import { onMount, onDestroy } from 'svelte'

  let devtools = createDevTools({
    locale: 'en-US'
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

### With Solid

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/solid'
import { onMount, onCleanup } from 'solid-js'

const devtools = createDevTools({
  locale: 'en-US'
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

### Standalone Usage

```ts
import { createIncremarkParser } from '@incremark/core'
import { createDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
const devtools = createDevTools({
  locale: 'en-US'
})

devtools.mount()

// Register parser
devtools.register(parser, {
  id: 'my-parser',
  label: 'My Parser'
})

// Set up callback
parser.setOnChange((state) => {
  // DevTools will update automatically
})

// Cleanup
devtools.unregister('my-parser')
devtools.unmount()
```

## API

### createDevTools(options?)

Create a DevTools instance.

```ts
const devtools = createDevTools({
  open: false,                    // Initially open the panel
  position: 'bottom-right',       // Position
  theme: 'dark',                  // Theme
  locale: 'en-US'                 // Locale: 'en-US' | 'zh-CN'
})
```

### devtools.mount()

Mount DevTools to DOM.

```ts
devtools.mount()
```

### devtools.unmount()

Unmount DevTools from DOM.

```ts
devtools.unmount()
```

### devtools.register(parser, options)

Register a parser instance.

```ts
devtools.register(parser, {
  id: 'unique-id',      // Unique identifier
  label: 'Display Name' // Display label
})
```

### devtools.unregister(id)

Unregister a specific parser.

```ts
devtools.unregister('unique-id')
```

### setLocale(locale)

Dynamically set DevTools language.

```ts
import { setLocale } from '@incremark/devtools'

setLocale('zh-CN')  // Switch to Chinese
setLocale('en-US')  // Switch to English
```

## Configuration Options

```ts
interface DevToolsOptions {
  open?: boolean           // Initially open the panel, default false
  position?: Position      // Position, default 'bottom-right'
  theme?: 'dark' | 'light' // Theme, default 'dark'
  locale?: Locale          // Locale, default 'en-US'
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type Locale = 'zh-CN' | 'en-US'
```

## Feature Panels

| Panel | Function |
|-------|----------|
| **Overview** | Shows character count, block count, node type distribution, streaming status, etc. |
| **Blocks** | View all parsed blocks with details including status, raw text, and AST nodes |
| **AST** | Complete Abstract Syntax Tree in JSON format with interactive expand/collapse |
| **Timeline** | History of append operations with timestamps and block count changes |

## Types

```ts
import type {
  IncremarkDevTools,
  DevToolsOptions,
  DevToolsState,
  AppendRecord,
  ParserRegistration,
  RegisterOptions,
  Locale,
  I18nMessages
} from '@incremark/devtools'
```

## License

MIT
