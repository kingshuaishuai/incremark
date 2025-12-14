# Vue Integration

`@incremark/vue` provides deep integration with Vue 3.

## Installation

```bash
pnpm add @incremark/core @incremark/vue
```

## Basic Usage

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset, markdown } = useIncremark({
  gfm: true
})
</script>

<template>
  <div>
    <p>Received {{ markdown.length }} characters</p>
    <Incremark :blocks="blocks" />
  </div>
</template>
```

## useIncremark

Core composable that manages parsing state.

### Return Values

```ts
const {
  // State
  markdown,        // Ref<string> - Complete Markdown
  blocks,          // ComputedRef<Block[]> - All blocks
  completedBlocks, // ShallowRef<Block[]> - Completed blocks
  pendingBlocks,   // ShallowRef<Block[]> - Pending blocks
  ast,             // ComputedRef<Root> - Complete AST
  isLoading,       // Ref<boolean> - Loading state
  
  // Methods
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - Force abort
  reset,           // () => void
  
  // Instance
  parser           // IncremarkParser - Underlying parser
} = useIncremark(options)
```

### Configuration Options

```ts
interface UseIncremarkOptions {
  gfm?: boolean              // Enable GFM
  containers?: boolean       // Enable ::: containers
  extensions?: Extension[]   // micromark extensions
  mdastExtensions?: Extension[]  // mdast extensions
}
```

## Incremark Component

Main rendering component that accepts blocks and renders them.

```vue
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Block[]` | Required | Blocks to render |
| `components` | `Record<string, Component>` | `{}` | Custom components |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

## Custom Components

Override default rendering components:

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyHeading from './MyHeading.vue'
import MyCode from './MyCode.vue'

const { blocks } = useIncremark()

const customComponents = {
  heading: MyHeading,
  code: MyCode
}
</script>

<template>
  <Incremark :blocks="blocks" :components="customComponents" />
</template>
```

Custom components receive a `node` prop:

```vue
<!-- MyHeading.vue -->
<script setup>
defineProps<{ node: { depth: number; children: any[] } }>()
</script>

<template>
  <component 
    :is="`h${node.depth}`" 
    class="my-heading"
  >
    <slot />
  </component>
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

## DevTools

```vue
<script setup>
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)  // One line to enable!
</script>
```

## Complete Example

```vue
<script setup>
import { ref } from 'vue'
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark({ gfm: true })
const { blocks, append, finalize, reset, markdown } = incremark

useDevTools(incremark)

const isStreaming = ref(false)

async function simulateAI() {
  reset()
  isStreaming.value = true
  
  const response = await fetch('/api/chat', { method: 'POST' })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    append(decoder.decode(value))
  }
  
  finalize()
  isStreaming.value = false
}
</script>

<template>
  <button @click="simulateAI" :disabled="isStreaming">
    {{ isStreaming ? 'Generating...' : 'Start Chat' }}
  </button>
  <Incremark :blocks="blocks" />
</template>
```
