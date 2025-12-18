# Vue Integration

`@incremark/vue` provides deep integration with Vue 3.

## Installation

```bash
pnpm add @incremark/vue
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

Core composable that manages parsing state and optional typewriter effect.

### Return Values

```ts
const {
  // State
  markdown,        // Ref<string> - Complete Markdown
  blocks,          // ComputedRef<Block[]> - Blocks for rendering (includes typewriter effect if enabled)
  completedBlocks, // ShallowRef<Block[]> - Completed blocks
  pendingBlocks,   // ShallowRef<Block[]> - Pending blocks
  ast,             // ComputedRef<Root> - Complete AST
  isLoading,       // Ref<boolean> - Loading state
  
  // Methods
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - Force abort
  reset,           // () => void - Reset parser and typewriter
  render,          // (content: string) => Update - One-shot render
  
  // Typewriter controls
  typewriter,      // TypewriterControls - Typewriter control object
  
  // Instance
  parser           // IncremarkParser - Underlying parser
} = useIncremark(options)
```

### Configuration Options

```ts
interface UseIncremarkOptions {
  // Parser options
  gfm?: boolean              // Enable GFM
  containers?: boolean       // Enable ::: containers
  extensions?: Extension[]   // micromark extensions
  mdastExtensions?: Extension[]  // mdast extensions
  
  // Typewriter options (pass to enable)
  typewriter?: {
    enabled?: boolean              // Enable/disable (default: true)
    charsPerTick?: number | [number, number]  // Chars per tick (default: [1, 3])
    tickInterval?: number          // Interval in ms (default: 30)
    effect?: 'none' | 'fade-in' | 'typing'  // Animation effect
    cursor?: string                // Cursor character (default: '|')
    pauseOnHidden?: boolean        // Pause when hidden (default: true)
  }
}
```

## With Typewriter Effect

The typewriter effect is now integrated into `useIncremark`:

```vue
<script setup>
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, append, finalize, reset, typewriter } = useIncremark({
  gfm: true,
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing',  // or 'fade-in'
    cursor: '|'
  }
})
</script>

<template>
  <div :class="['content', `effect-${typewriter.effect.value}`]">
    <AutoScrollContainer>
      <!-- blocks already includes typewriter effect! -->
      <Incremark :blocks="blocks" />
    </AutoScrollContainer>
    
    <!-- Typewriter controls -->
    <button 
      v-if="typewriter.isProcessing.value && !typewriter.isPaused.value" 
      @click="typewriter.pause"
    >
      Pause
    </button>
    <button 
      v-if="typewriter.isPaused.value" 
      @click="typewriter.resume"
    >
      Resume
    </button>
    <button 
      v-if="typewriter.isProcessing.value" 
      @click="typewriter.skip"
    >
      Skip
    </button>
  </div>
</template>
```

### Typewriter Controls

```ts
interface TypewriterControls {
  enabled: Ref<boolean>               // Whether enabled (v-model compatible)
  isProcessing: ComputedRef<boolean>  // Animation ongoing
  isPaused: ComputedRef<boolean>      // Paused state
  effect: ComputedRef<AnimationEffect>  // Current effect
  skip: () => void                    // Skip all animations
  pause: () => void                   // Pause animation
  resume: () => void                  // Resume animation
  setOptions: (options) => void       // Update options
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
  mdastExtensions: [mathFromMarkdown()],
  typewriter: { effect: 'fade-in' }
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
import { useIncremark, useDevTools, Incremark, AutoScrollContainer } from '@incremark/vue'

const incremark = useIncremark({ 
  gfm: true,
  typewriter: {
    effect: 'fade-in',
    charsPerTick: [1, 3]
  }
})
const { blocks, append, finalize, reset, markdown, typewriter } = incremark

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
  <div :class="['app', `effect-${typewriter.effect.value}`]">
    <header>
      <button @click="simulateAI" :disabled="isStreaming">
        {{ isStreaming ? 'Generating...' : 'Start Chat' }}
      </button>
      <span>{{ markdown.length }} characters</span>
      
      <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
        Skip
      </button>
    </header>
    
    <AutoScrollContainer class="content">
      <Incremark :blocks="blocks" />
    </AutoScrollContainer>
  </div>
</template>
```

## Fade-in Animation CSS

If using `effect: 'fade-in'`, add this CSS:

```css
.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Next Steps

- [Typewriter Effect](./typewriter) - Detailed typewriter configuration
- [Auto Scroll](./auto-scroll) - Auto-scroll container
- [Custom Components](./custom-components) - Custom rendering
- [API Reference](/api/vue) - Complete API documentation
