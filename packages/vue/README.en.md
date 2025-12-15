# @incremark/vue

Vue 3 integration for Incremark.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 📦 **Out of the Box** - Provides `useIncremark` composable and `<Incremark>` component
- 🎨 **Customizable** - Support for custom render components
- ⚡ **High Performance** - Optimized with `shallowRef` and `markRaw`
- 🔧 **DevTools** - Built-in developer tools

## Installation

```bash
pnpm add @incremark/core @incremark/vue
```

## Quick Start

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

async function handleStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <button @click="handleStream">Start</button>
  <Incremark :blocks="blocks" />
</template>
```

## API

### useIncremark(options)

Core composable.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `markdown` | `Ref<string>` | Complete Markdown |
| `blocks` | `ComputedRef<Block[]>` | All blocks |
| `completedBlocks` | `ShallowRef<Block[]>` | Completed blocks |
| `pendingBlocks` | `ShallowRef<Block[]>` | Pending blocks |
| `append` | `Function` | Append content |
| `finalize` | `Function` | Complete parsing |
| `reset` | `Function` | Reset state |
| `render` | `Function` | Render once (reset + append + finalize) |

### useDevTools(incremark)

Enable DevTools.

```ts
const incremark = useIncremark()
useDevTools(incremark)
```

### \<Incremark\>

Render component.

```vue
<Incremark 
  :blocks="blocks"
  :components="{ heading: MyHeading }"
/>
```

## Custom Components

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyCode from './MyCode.vue'

const { blocks } = useIncremark()
</script>

<template>
  <Incremark 
    :blocks="blocks" 
    :components="{ code: MyCode }"
  />
</template>
```

## Math Formula Support

```bash
pnpm add micromark-extension-math mdast-util-math katex
```

```vue
<script setup>
import { useIncremark } from '@incremark/vue'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

const { blocks } = useIncremark({
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
</script>
```

## License

MIT

