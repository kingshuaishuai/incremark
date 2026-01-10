# @incremark/vue

Vue 3 integration library for Incremark, providing high-performance streaming Markdown rendering components.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Core Advantages

- 📦 **Out of the Box** - Provides `IncremarkContent` component and `useIncremark` composable
- ⚡ **Extreme Performance** - Incremental parsing with O(n) complexity, dual-engine support
- ⌨️ **Typewriter Effect** - Built-in animation effects (fade-in, typing)
- 🎨 **Highly Customizable** - Custom components, code blocks, containers
- 🎯 **Theme System** - Built-in ThemeProvider with light/dark themes
- 📜 **Auto Scroll** - Built-in AutoScrollContainer component
- 🔧 **DevTools** - Built-in developer debugging tools

## Installation

```bash
pnpm add @incremark/vue @incremark/theme
```

## Quick Start

### Recommended: IncremarkContent Component

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/theme/styles.css'

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
  <button @click="handleStream(stream)">Start</button>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{
      gfm: true,
      math: true,
      containers: true,
      htmlTree: true
    }"
  />
</template>
```

### Advanced: useIncremark Composable

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import '@incremark/vue/style.css'

const { blocks, append, finalize, reset } = useIncremark({ 
  gfm: true,
  math: true
})

async function handleStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <button @click="handleStream(stream)">Start</button>
  <Incremark :blocks="blocks" />
</template>
```

## IncremarkContent Component

Declarative all-in-one component, recommended for most scenarios.

### Props

```ts
interface IncremarkContentProps {
  // Input (choose one)
  content?: string                       // Accumulated Markdown string
  stream?: () => AsyncGenerator<string>  // Async generator function

  // Status
  isFinished?: boolean                   // Stream finished flag (required for content mode)

  // Configuration
  incremarkOptions?: {
    gfm?: boolean              // GFM support
    math?: boolean             // Math formulas
    htmlTree?: boolean         // HTML structured parsing
    containers?: boolean       // ::: container syntax
    typewriter?: {             // Typewriter effect
      enabled?: boolean
      charsPerTick?: number | [number, number]
      tickInterval?: number
      effect?: 'none' | 'fade-in' | 'typing'
      cursor?: string
    }
  }

  // Custom rendering
  components?: ComponentMap                        // Custom components
  customContainers?: Record<string, Component>     // Custom containers
  customCodeBlocks?: Record<string, Component>     // Custom code blocks
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // Styling
  showBlockStatus?: boolean    // Show block status border
  pendingClass?: string        // CSS class for pending blocks
}
```

### Example: Enable Typewriter Effect

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :incremark-options="{
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'fade-in'
    }
  }"
/>
```

### Example: Custom Components

```vue
<script setup>
import CustomHeading from './CustomHeading.vue'
import WarningContainer from './WarningContainer.vue'
import EchartsCodeBlock from './EchartsCodeBlock.vue'
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :components="{ heading: CustomHeading }"
    :custom-containers="{ warning: WarningContainer }"
    :custom-code-blocks="{ echarts: EchartsCodeBlock }"
    :code-block-configs="{ echarts: { takeOver: true } }"
  />
</template>
```

## Theme System

```vue
<script setup>
import { ThemeProvider, IncremarkContent } from '@incremark/vue'
</script>

<template>
  <!-- Built-in theme -->
  <ThemeProvider theme="dark">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </ThemeProvider>

  <!-- Custom theme -->
  <ThemeProvider :theme="{ color: { brand: { primary: '#8b5cf6' } } }">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </ThemeProvider>
</template>
```

## Auto Scroll

```vue
<script setup>
import { ref } from 'vue'
import { AutoScrollContainer, IncremarkContent } from '@incremark/vue'

const scrollRef = ref()
const autoScrollEnabled = ref(true)
</script>

<template>
  <AutoScrollContainer 
    ref="scrollRef" 
    :enabled="autoScrollEnabled"
    :threshold="50"
    behavior="smooth"
  >
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </AutoScrollContainer>
  
  <button @click="scrollRef?.scrollToBottom()">
    Scroll to Bottom
  </button>
</template>
```

## useIncremark API

```ts
const {
  // State
  markdown,           // Ref<string> - Complete Markdown
  blocks,             // ComputedRef<Block[]> - All blocks
  completedBlocks,    // ShallowRef<Block[]> - Completed blocks
  pendingBlocks,      // ShallowRef<Block[]> - Pending blocks
  isLoading,          // Ref<boolean> - Is loading
  isDisplayComplete,  // ComputedRef<boolean> - Is display complete
  
  // Methods
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate
  
  // Typewriter controls
  typewriter: {
    enabled,          // Ref<boolean> - Is enabled
    isProcessing,     // Ref<boolean> - Is processing
    skip,             // () => void - Skip animation
    setOptions        // (options) => void - Update config
  }
} = useIncremark(options)
```

## DevTools

```vue
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
</script>

<template>
  <Incremark :blocks="incremark.blocks" />
</template>
```

## Math Formula Support

Built-in support, just enable `math: true`:

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :incremark-options="{ math: true }"
/>
```

Import KaTeX styles:

```ts
import 'katex/dist/katex.min.css'
```

## License

MIT
