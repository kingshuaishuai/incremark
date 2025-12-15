# @incremark/react

React 18+ integration for Incremark.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 📦 **Out of the Box** - Provides `useIncremark` hook and `<Incremark>` component
- 🎨 **Customizable** - Support for custom render components
- ⚡ **High Performance** - Leverages React's reconciliation mechanism
- 🔧 **DevTools** - Built-in developer tools

## Installation

```bash
pnpm add @incremark/core @incremark/react
```

## Quick Start

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

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

## API

### useIncremark(options)

Core hook.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `markdown` | `string` | Complete Markdown |
| `blocks` | `Block[]` | All blocks |
| `completedBlocks` | `Block[]` | Completed blocks |
| `pendingBlocks` | `Block[]` | Pending blocks |
| `append` | `Function` | Append content |
| `finalize` | `Function` | Complete parsing |
| `reset` | `Function` | Reset state |
| `render` | `Function` | Render once (reset + append + finalize) |

### useDevTools(incremark)

Enable DevTools.

```tsx
const incremark = useIncremark()
useDevTools(incremark)
```

### \<Incremark\>

Render component.

```tsx
<Incremark 
  blocks={blocks}
  components={{ heading: MyHeading }}
/>
```

## Custom Components

```tsx
import { useIncremark, Incremark } from '@incremark/react'
import MyCode from './MyCode'

function App() {
  const { blocks } = useIncremark()
  
  return (
    <Incremark 
      blocks={blocks} 
      components={{ code: MyCode }}
    />
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
      // ... streaming handling
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

## License

MIT

