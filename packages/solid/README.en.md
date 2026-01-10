# @incremark/solid

SolidJS integration library for Incremark, providing high-performance streaming Markdown rendering components.

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
pnpm add @incremark/solid @incremark/theme
```

## Quick Start

### Recommended: IncremarkContent Component

```tsx
import { createSignal } from 'solid-js'
import { IncremarkContent } from '@incremark/solid'
import '@incremark/theme/styles.css'

function App() {
  const [content, setContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  // Handle AI streaming output
  async function handleStream(stream) {
    setContent('')
    setIsFinished(false)

    for await (const chunk of stream) {
      setContent(prev => prev + chunk)
    }

    setIsFinished(true)
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>Start</button>
      <IncremarkContent
        content={content()}
        isFinished={isFinished()}
        incremarkOptions={{
          gfm: true,
          math: true,
          containers: true,
          htmlTree: true
        }}
      />
    </>
  )
}
```

### Advanced: useIncremark Composable

```tsx
import { useIncremark, Incremark } from '@incremark/solid'
import '@incremark/solid/style.css'

function App() {
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

  return (
    <>
      <button onClick={() => handleStream(stream)}>Start</button>
      <Incremark blocks={blocks()} />
    </>
  )
}
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

```tsx
<IncremarkContent
  content={content()}
  isFinished={isFinished()}
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

```tsx
import CustomHeading from './CustomHeading'
import WarningContainer from './WarningContainer'
import EchartsCodeBlock from './EchartsCodeBlock'

<IncremarkContent
  content={content()}
  isFinished={isFinished()}
  components={{ heading: CustomHeading }}
  customContainers={{ warning: WarningContainer }}
  customCodeBlocks={{ echarts: EchartsCodeBlock }}
  codeBlockConfigs={{ echarts: { takeOver: true } }}
/>
```

## Theme System

```tsx
import { ThemeProvider, IncremarkContent } from '@incremark/solid'

// Built-in theme
<ThemeProvider theme="dark">
  <IncremarkContent content={content()} isFinished={isFinished()} />
</ThemeProvider>

// Custom theme
<ThemeProvider theme={{ color: { brand: { primary: '#8b5cf6' } } }}>
  <IncremarkContent content={content()} isFinished={isFinished()} />
</ThemeProvider>
```

## Auto Scroll

```tsx
import { createSignal } from 'solid-js'
import { AutoScrollContainer, IncremarkContent } from '@incremark/solid'

function App() {
  let scrollRef: HTMLDivElement | undefined
  const [autoScrollEnabled, setAutoScrollEnabled] = createSignal(true)

  return (
    <>
      <AutoScrollContainer
        ref={scrollRef}
        enabled={autoScrollEnabled()}
        threshold={50}
        behavior="smooth"
      >
        <IncremarkContent content={content()} isFinished={isFinished()} />
      </AutoScrollContainer>

      <button onClick={() => scrollRef?.scrollToBottom()}>
        Scroll to Bottom
      </button>
    </>
  )
}
```

## useIncremark API

```ts
const {
  // State
  markdown,           // Accessor<string> - Complete Markdown
  blocks,             // Accessor<Block[]> - All blocks
  completedBlocks,    // Accessor<Block[]> - Completed blocks
  pendingBlocks,      // Accessor<Block[]> - Pending blocks
  isLoading,          // Accessor<boolean> - Is loading
  isDisplayComplete,  // Accessor<boolean> - Is display complete

  // Methods
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate

  // Typewriter controls
  typewriter: {
    enabled,          // Accessor<boolean> - Is enabled
    isProcessing,     // Accessor<boolean> - Is processing
    skip,             // () => void - Skip animation
    setOptions        // (options) => void - Update config
  }
} = useIncremark(options)
```

## DevTools

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/solid'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks()} />
}
```

## Math Formula Support

Built-in support, just enable `math: true`:

```tsx
<IncremarkContent
  content={content()}
  isFinished={isFinished()}
  incremarkOptions={{ math: true }}
/>
```

Import KaTeX styles:

```tsx
import 'katex/dist/katex.min.css'
```

## License

MIT
