# @incremark/react

React 18+ integration library for Incremark, providing high-performance streaming Markdown rendering components.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Core Advantages

- 📦 **Out of the Box** - Provides `IncremarkContent` component and `useIncremark` hook
- ⚡ **Extreme Performance** - Incremental parsing with O(n) complexity, dual-engine support
- ⌨️ **Typewriter Effect** - Built-in animation effects (fade-in, typing)
- 🎨 **Highly Customizable** - Custom components, code blocks, containers
- 🎯 **Theme System** - Built-in ThemeProvider with light/dark themes
- 📜 **Auto Scroll** - Built-in AutoScrollContainer component
- 🔧 **DevTools** - Built-in developer debugging tools

## Installation

```bash
pnpm add @incremark/react @incremark/theme
```

## Quick Start

### Recommended: IncremarkContent Component

```tsx
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // Handle AI streaming output
  async function handleStream(stream: ReadableStream) {
    setContent('')
    setIsFinished(false)
    
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setContent(prev => prev + decoder.decode(value))
    }
    
    setIsFinished(true)
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>Start</button>
      <IncremarkContent 
        content={content} 
        isFinished={isFinished}
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

### Advanced: useIncremark Hook

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import '@incremark/react/styles.css'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ 
    gfm: true,
    math: true
  })

  async function handleStream(stream: ReadableStream) {
    reset()
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
  }

  return (
    <>
      <button onClick={() => handleStream(stream)}>Start</button>
      <Incremark blocks={blocks} />
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
  components?: ComponentMap                          // Custom components
  customContainers?: Record<string, ComponentType>   // Custom containers
  customCodeBlocks?: Record<string, ComponentType>   // Custom code blocks
  codeBlockConfigs?: Record<string, CodeBlockConfig>

  // Styling
  showBlockStatus?: boolean    // Show block status border
  pendingClass?: string        // CSS class for pending blocks
}
```

### Example: Enable Typewriter Effect

```tsx
<IncremarkContent 
  content={content} 
  isFinished={isFinished}
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
  content={content} 
  isFinished={isFinished}
  components={{ heading: CustomHeading }}
  customContainers={{ warning: WarningContainer }}
  customCodeBlocks={{ echarts: EchartsCodeBlock }}
  codeBlockConfigs={{ echarts: { takeOver: true } }}
/>
```

## Theme System

```tsx
import { ThemeProvider, IncremarkContent } from '@incremark/react'

// Built-in theme
<ThemeProvider theme="dark">
  <IncremarkContent content={content} isFinished={isFinished} />
</ThemeProvider>

// Custom theme
<ThemeProvider theme={{ color: { brand: { primary: '#8b5cf6' } } }}>
  <IncremarkContent content={content} isFinished={isFinished} />
</ThemeProvider>
```

## Auto Scroll

```tsx
import { useRef, useState } from 'react'
import { AutoScrollContainer, IncremarkContent, type AutoScrollContainerRef } from '@incremark/react'

function App() {
  const scrollRef = useRef<AutoScrollContainerRef>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  return (
    <div>
      <AutoScrollContainer 
        ref={scrollRef} 
        enabled={autoScrollEnabled}
        threshold={50}
        behavior="smooth"
      >
        <IncremarkContent content={content} isFinished={isFinished} />
      </AutoScrollContainer>
      
      <button onClick={() => scrollRef.current?.scrollToBottom()}>
        Scroll to Bottom
      </button>
    </div>
  )
}
```

## useIncremark API

```ts
const {
  // State
  markdown,           // string - Complete Markdown
  blocks,             // Block[] - All blocks
  completedBlocks,    // Block[] - Completed blocks
  pendingBlocks,      // Block[] - Pending blocks
  isLoading,          // boolean - Is loading
  isDisplayComplete,  // boolean - Is display complete
  
  // Methods
  append,             // (chunk: string) => IncrementalUpdate
  finalize,           // () => IncrementalUpdate
  reset,              // () => void
  render,             // (content: string) => IncrementalUpdate
  
  // Typewriter controls
  typewriter: {
    enabled,          // boolean - Is enabled
    isProcessing,     // boolean - Is processing
    skip,             // () => void - Skip animation
    setOptions        // (options) => void - Update config
  }
} = useIncremark(options)
```

## DevTools

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks} />
}
```

## React Query Integration

```tsx
import { useQuery } from '@tanstack/react-query'
import { useIncremark, Incremark } from '@incremark/react'

function StreamingContent() {
  const { blocks, append, finalize, reset } = useIncremark()
  
  const { refetch } = useQuery({
    queryKey: ['chat'],
    queryFn: async () => {
      reset()
      // ... streaming logic
      finalize()
      return null
    },
    enabled: false
  })

  return (
    <>
      <button onClick={() => refetch()}>Start</button>
      <Incremark blocks={blocks} />
    </>
  )
}
```

## Math Formula Support

Built-in support, just enable `math: true`:

```tsx
<IncremarkContent 
  content={content} 
  isFinished={isFinished}
  incremarkOptions={{ math: true }}
/>
```

Import KaTeX styles:

```ts
import 'katex/dist/katex.min.css'
```

## License

MIT
