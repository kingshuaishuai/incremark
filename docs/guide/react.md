# React Integration

`@incremark/react` provides deep integration with React 18+.

## Installation

```bash
pnpm add @incremark/react
```

## Basic Usage

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark({
    gfm: true
  })
  const { blocks, append, finalize, reset, markdown } = incremark

  return (
    <div>
      <p>Received {markdown.length} characters</p>
      {/* Recommended: Pass incremark object */}
      <Incremark incremark={incremark} />
    </div>
  )
}
```

## useIncremark

Core hook that manages parsing state and optional typewriter effect.

### Return Values

```ts
const {
  // State
  markdown,        // string - Complete Markdown
  blocks,          // Block[] - Blocks for rendering (includes typewriter effect if enabled)
  completedBlocks, // Block[] - Completed blocks
  pendingBlocks,   // Block[] - Pending blocks
  ast,             // Root - Complete AST
  isLoading,       // boolean - Loading state
  
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

```tsx
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/react'

function ChatApp() {
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

  return (
    <div className={`content effect-${typewriter.effect}`}>
      <AutoScrollContainer>
        {/* blocks already includes typewriter effect! */}
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
      
      {/* Typewriter controls */}
      {typewriter.isProcessing && !typewriter.isPaused && (
        <button onClick={typewriter.pause}>Pause</button>
      )}
      {typewriter.isPaused && (
        <button onClick={typewriter.resume}>Resume</button>
      )}
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>Skip</button>
      )}
    </div>
  )
}
```

### Typewriter Controls

```ts
interface TypewriterControls {
  enabled: boolean                    // Whether enabled
  setEnabled: (enabled: boolean) => void  // Toggle enabled
  isProcessing: boolean               // Animation ongoing
  isPaused: boolean                   // Paused state
  effect: 'none' | 'fade-in' | 'typing'  // Current effect
  skip: () => void                    // Skip all animations
  pause: () => void                   // Pause animation
  resume: () => void                  // Resume animation
  setOptions: (options) => void       // Update options
}
```

## Incremark Component

Main rendering component that accepts blocks and renders them.

```tsx
// Recommended: Pass incremark object (auto-provides context)
<Incremark incremark={incremark} />

// Or use blocks directly
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `incremark` | `UseIncremarkReturn` | - | **Recommended**: Incremark instance (auto-provides definitions context) |
| `blocks` | `Block[]` | - | Blocks to render (required if `incremark` is not provided) |
| `components` | `Record<string, Component>` | `{}` | Custom components |
| `showBlockStatus` | `boolean` | `true` | Show block status border |
| `className` | `string` | `''` | Custom class name |

## Custom Components

Override default rendering components:

```tsx
import { useIncremark, Incremark } from '@incremark/react'

const MyHeading = ({ node }) => (
  <h1 className="my-heading" style={{ color: 'blue' }}>
    {/* Render children */}
  </h1>
)

const customComponents = {
  heading: MyHeading
}

function App() {
  const { blocks } = useIncremark()
  return <Incremark blocks={blocks} components={customComponents} />
}
```

## DevTools

```tsx
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)  // One line to enable!
  
  return <Incremark blocks={incremark.blocks} />
}
```

## HTML Fragments

v0.2.0 supports HTML fragments in Markdown:

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  
  // Markdown with HTML:
  // <div class="custom">
  //   <span>Hello</span>
  // </div>
  
  return <Incremark incremark={incremark} />
}
```

HTML fragments are automatically parsed and rendered as structured HTML elements.

## Footnotes

v0.2.0 supports footnotes:

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  
  // Markdown with footnotes:
  // Text[^1] and more[^2]
  // 
  // [^1]: First footnote
  // [^2]: Second footnote
  
  return <Incremark incremark={incremark} />
}
```

Footnotes are automatically rendered at the bottom of the document when `isFinalized` is true.

## Theme

v0.2.0 introduces a new theme system:

```tsx
import { useIncremark, Incremark, ThemeProvider } from '@incremark/react'
import { darkTheme, mergeTheme, defaultTheme } from '@incremark/theme'

function App() {
  const incremark = useIncremark()
  
  // Use preset theme
  return (
    <ThemeProvider theme="dark">
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
  
  // Or use custom theme
  const customTheme = mergeTheme(defaultTheme, {
    color: {
      text: {
        primary: '#custom-color'
      }
    }
  })
  
  return (
    <ThemeProvider theme={customTheme}>
      <Incremark incremark={incremark} />
    </ThemeProvider>
  )
}
```

## Complete Example

```tsx
import { useState, useCallback } from 'react'
import { useIncremark, useDevTools, Incremark, AutoScrollContainer, ThemeProvider } from '@incremark/react'
import '@incremark/theme/styles.css'

function ChatApp() {
  const incremark = useIncremark({ 
    gfm: true,
    typewriter: {
      effect: 'fade-in',
      charsPerTick: [1, 3]
    }
  })
  const { blocks, append, finalize, reset, markdown, typewriter } = incremark
  
  useDevTools(incremark)
  
  const [isStreaming, setIsStreaming] = useState(false)

  const handleChat = useCallback(async () => {
    reset()
    setIsStreaming(true)
    
    const response = await fetch('/api/chat', { method: 'POST' })
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
    setIsStreaming(false)
  }, [append, finalize, reset])

  return (
    <ThemeProvider theme="default">
      <div className={`app effect-${typewriter.effect}`}>
        <header>
          <button onClick={handleChat} disabled={isStreaming}>
            {isStreaming ? 'Generating...' : 'Start Chat'}
          </button>
          <span>{markdown.length} characters</span>
          
          {typewriter.isProcessing && (
            <button onClick={typewriter.skip}>Skip</button>
          )}
        </header>
        
        <AutoScrollContainer className="content">
          <Incremark incremark={incremark} />
        </AutoScrollContainer>
      </div>
    </ThemeProvider>
  )
}
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

## Integration with React Query

```tsx
import { useQuery } from '@tanstack/react-query'
import { useIncremark, Incremark } from '@incremark/react'

function StreamingContent() {
  const { blocks, append, finalize, reset } = useIncremark({
    typewriter: { effect: 'typing' }
  })
  
  const { refetch } = useQuery({
    queryKey: ['chat'],
    queryFn: async () => {
      reset()
      const res = await fetch('/api/stream')
      const reader = res.body!.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        append(new TextDecoder().decode(value))
      }
      
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

## Next Steps

- [Typewriter Effect](./typewriter) - Detailed typewriter configuration
- [Auto Scroll](./auto-scroll) - Auto-scroll container
- [Custom Components](./custom-components) - Custom rendering
- [API Reference](/api/react) - Complete API documentation
