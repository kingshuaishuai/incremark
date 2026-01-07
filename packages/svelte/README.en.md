# @incremark/svelte

Svelte 5 integration library for Incremark, providing high-performance streaming Markdown rendering components.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Core Advantages

- 📦 **Out of the Box** - Provides `IncremarkContent` component and `useIncremark` store
- ⚡ **Extreme Performance** - Incremental parsing with O(n) complexity, dual-engine support
- ⌨️ **Typewriter Effect** - Built-in animation effects (fade-in, typing)
- 🎨 **Highly Customizable** - Custom components, code blocks, containers
- 🎯 **Svelte 5 Runes** - Uses the latest Svelte 5 syntax
- 📜 **Auto Scroll** - Built-in AutoScrollContainer component

## Installation

```bash
pnpm add @incremark/core @incremark/svelte
```

## Quick Start

### Recommended: IncremarkContent Component

```svelte
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  let content = $state('')
  let isFinished = $state(false)

  // Handle AI streaming output
  async function handleStream(stream: AsyncIterable<string>) {
    content = ''
    isFinished = false
    
    for await (const chunk of stream) {
      content += chunk
    }
    
    isFinished = true
  }
</script>

<button onclick={() => handleStream(stream)}>Start</button>
<IncremarkContent 
  {content} 
  {isFinished}
  incremarkOptions={{
    gfm: true,
    math: true,
    containers: true,
    htmlTree: true
  }}
/>
```

### Advanced: useIncremark Store

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const { blocks, append, finalize, reset } = useIncremark({ 
    gfm: true,
    math: true
  })

  async function handleStream(stream: AsyncIterable<string>) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }
</script>

<button onclick={() => handleStream(stream)}>Start</button>
<Incremark blocks={$blocks} />
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
  components?: ComponentMap                          // Custom components
  customContainers?: Record<string, Component>       // Custom containers
  customCodeBlocks?: Record<string, Component>       // Custom code blocks
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // Styling
  showBlockStatus?: boolean    // Show block status border
  pendingClass?: string        // CSS class for pending blocks
}
```

### Example: Enable Typewriter Effect

```svelte
<IncremarkContent 
  {content} 
  {isFinished}
  incremarkOptions={{
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'fade-in'
    }
  }}
/>
```

### Example: Custom Components

```svelte
<script lang="ts">
  import CustomHeading from './CustomHeading.svelte'
  import WarningContainer from './WarningContainer.svelte'
  import EchartsCodeBlock from './EchartsCodeBlock.svelte'
</script>

<IncremarkContent 
  {content} 
  {isFinished}
  components={{ heading: CustomHeading }}
  customContainers={{ warning: WarningContainer }}
  customCodeBlocks={{ echarts: EchartsCodeBlock }}
  codeBlockConfigs={{ echarts: { takeOver: true } }}
/>
```

## Theme System

```svelte
<script lang="ts">
  import { ThemeProvider, IncremarkContent } from '@incremark/svelte'
</script>

<!-- Built-in theme -->
<ThemeProvider theme="dark">
  <IncremarkContent {content} {isFinished} />
</ThemeProvider>

<!-- Custom theme -->
<ThemeProvider theme={{ color: { brand: { primary: '#8b5cf6' } } }}>
  <IncremarkContent {content} {isFinished} />
</ThemeProvider>
```

## Auto Scroll

```svelte
<script lang="ts">
  import { AutoScrollContainer, IncremarkContent } from '@incremark/svelte'

  let scrollContainer: { scrollToBottom: () => void }
  let autoScrollEnabled = $state(true)
</script>

<AutoScrollContainer 
  bind:this={scrollContainer} 
  enabled={autoScrollEnabled}
  threshold={50}
  behavior="smooth"
>
  <IncremarkContent {content} {isFinished} />
</AutoScrollContainer>

<button onclick={() => scrollContainer?.scrollToBottom()}>
  Scroll to Bottom
</button>
```

## useIncremark API

```ts
const {
  // State (Svelte stores)
  markdown,           // Writable<string> - Complete Markdown
  blocks,             // Readable<Block[]> - All blocks
  completedBlocks,    // Writable<Block[]> - Completed blocks
  pendingBlocks,      // Writable<Block[]> - Pending blocks
  isLoading,          // Writable<boolean> - Is loading
  isDisplayComplete,  // Readable<boolean> - Is display complete
  
  // Methods
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate
  
  // Typewriter controls
  typewriter: {
    enabled,          // Writable<boolean> - Is enabled
    isProcessing,     // Readable<boolean> - Is processing
    skip,             // () => void - Skip animation
    setOptions        // (options) => void - Update config
  }
} = useIncremark(options)
```

## Svelte 5 Runes Syntax

This library uses Svelte 5 Runes syntax:

```svelte
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'

  // Use $state for reactive state
  let content = $state('')
  let isFinished = $state(false)

  // Use $derived for computed values
  let charCount = $derived(content.length)
</script>

<IncremarkContent {content} {isFinished} />
<p>Character count: {charCount}</p>
```

## Math Formula Support

Built-in support, just enable `math: true`:

```svelte
<IncremarkContent 
  {content} 
  {isFinished}
  incremarkOptions={{ math: true }}
/>
```

Import KaTeX styles:

```ts
import 'katex/dist/katex.min.css'
```

## License

MIT


