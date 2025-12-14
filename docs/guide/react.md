# React Integration

`@incremark/react` provides deep integration with React 18+.

## Installation

```bash
pnpm add @incremark/core @incremark/react
```

## Basic Usage

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset, markdown } = useIncremark({
    gfm: true
  })

  return (
    <div>
      <p>Received {markdown.length} characters</p>
      <Incremark blocks={blocks} />
    </div>
  )
}
```

## useIncremark

Core hook that manages parsing state.

### Return Values

```ts
const {
  // State
  markdown,        // string - Complete Markdown
  blocks,          // Block[] - All blocks
  completedBlocks, // Block[] - Completed blocks
  pendingBlocks,   // Block[] - Pending blocks
  ast,             // Root - Complete AST
  isLoading,       // boolean - Loading state
  
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

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
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

## Complete Example

```tsx
import { useState, useCallback } from 'react'
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function ChatApp() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset, markdown } = incremark
  
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
    <div>
      <button onClick={handleChat} disabled={isStreaming}>
        {isStreaming ? 'Generating...' : 'Start Chat'}
      </button>
      <div>{markdown.length} characters</div>
      <Incremark blocks={blocks} />
    </div>
  )
}
```

## Integration with React Query

```tsx
import { useQuery } from '@tanstack/react-query'
import { useIncremark, Incremark } from '@incremark/react'

function StreamingContent() {
  const { blocks, append, finalize, reset } = useIncremark()
  
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
